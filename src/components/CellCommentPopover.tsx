import { useState, useEffect } from 'react';
import { MessageCircle, Check, AlertCircle, Link, Copy, Check as CheckIcon } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMarketDimName } from '../types';

interface CellCommentProps {
  productId: string;
  marketId: string;
  focusCommentId?: string;
}

type Comment = {
  comment_id: string;
  product_id: string;
  city_id: string;
  author_id: string;
  question: string;
  answer: string | null;
  status: string;
  created_at: string;
  answered_at: string | null;
}

export function CellCommentPopover({ productId, marketId, focusCommentId }: CellCommentProps) {
  const { user, getProductById, getMarketById } = useDashboard();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState<Record<string, boolean>>({});
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const canEditStatus = user?.role === 'admin' || user?.role === 'editor';
  const product = getProductById(productId);
  const market = getMarketById(marketId);
  
  // Count of open vs answered comments
  const openCount = comments.filter(c => c.status === 'OPEN').length;
  const answeredCount = comments.filter(c => c.status === 'ANSWERED').length;
  
  // Determine icon color based on comment status
  const getIconColor = () => {
    if (comments.length === 0) return 'text-gray-400';
    if (openCount > 0) return 'text-blue-500';
    return 'text-green-500';
  };
  
  // Open popover if there's a focused comment
  useEffect(() => {
    if (focusCommentId && comments.find(c => c.comment_id === focusCommentId)) {
      setOpen(true);
    }
  }, [focusCommentId, comments]);
  
  // Fetch comments when popover opens
  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open]);
  
  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cell_comment')
        .select('*')
        .eq('product_id', productId)
        .eq('city_id', marketId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Ensure data is properly typed as Comment[]
      if (data) {
        const typedData = data as Comment[];
        setComments(typedData);
        
        // Initialize answers state
        const initialAnswers: Record<string, string> = {};
        typedData.forEach(comment => {
          if (comment.answer) {
            initialAnswers[comment.comment_id] = comment.answer;
          } else {
            initialAnswers[comment.comment_id] = '';
          }
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };
  
  const addQuestion = async () => {
    if (!newQuestion.trim() || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('cell_comment')
        .insert({
          product_id: productId,
          city_id: marketId,
          author_id: user.id,
          question: newQuestion,
          status: 'OPEN'
        })
        .select();
        
      if (error) throw error;
      
      if (data) {
        const newComment = data[0] as Comment;
        setComments(prev => [newComment, ...prev]);
        setNewQuestion('');
        toast.success('Question added successfully');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    }
  };
  
  const addAnswer = async (commentId: string) => {
    const answer = answers[commentId];
    if (!answer.trim() || !canEditStatus) return;
    
    try {
      const { error } = await supabase
        .from('cell_comment')
        .update({
          answer,
          status: 'ANSWERED',
          answered_at: new Date().toISOString()
        })
        .eq('comment_id', commentId);
        
      if (error) throw error;
      
      // Update local state with proper typing
      setComments(prev => 
        prev.map(comment => 
          comment.comment_id === commentId 
            ? { ...comment, answer, status: 'ANSWERED', answered_at: new Date().toISOString() }
            : comment
        )
      );
      toast.success('Answer added successfully');
    } catch (error) {
      console.error('Error adding answer:', error);
      toast.error('Failed to add answer');
    }
  };

  // Generate shareable link for a comment
  const generateCommentLink = (commentId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/#/?product=${productId}&market=${marketId}&focusComment=${commentId}`;
  };

  // Copy link to clipboard
  const copyToClipboard = async (commentId: string) => {
    const link = generateCommentLink(commentId);
    
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess({...copySuccess, [commentId]: true});
      
      // Reset success icon after 2 seconds
      setTimeout(() => {
        setCopySuccess({...copySuccess, [commentId]: false});
      }, 2000);
      
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-5 w-5 ${getIconColor()} relative`}
          title={`${comments.length} comment${comments.length !== 1 ? 's' : ''}`}
        >
          <MessageCircle className="h-4 w-4" />
          {comments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-background rounded-full text-xs w-4 h-4 flex items-center justify-center">
              {comments.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="start">
        <div className="space-y-4">
          <div className="font-semibold text-sm border-b pb-2 flex justify-between items-center">
            <span>Questions for {product?.name || 'Product'} in {market ? getMarketDimName(market) : 'Location'}</span>
          </div>
          
          {loading ? (
            <div className="text-center py-4">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No questions yet</div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div 
                  key={comment.comment_id} 
                  className={`border rounded-md p-3 space-y-2 ${focusCommentId === comment.comment_id ? 'ring-2 ring-blue-500' : ''}`}
                  id={`comment-${comment.comment_id}`}
                >
                  <div className="flex justify-between">
                    <div className="font-medium text-sm">{comment.question}</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-gray-500 hover:text-gray-700"
                      onClick={() => copyToClipboard(comment.comment_id)}
                      title="Copy link to this comment"
                    >
                      {copySuccess[comment.comment_id] ? (
                        <CheckIcon className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Asked {format(new Date(comment.created_at), 'MMM d, yyyy')}
                  </div>
                  
                  {comment.answer ? (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs font-medium text-green-600 flex items-center gap-1 mb-1">
                        <Check className="h-3 w-3" /> Answered
                      </div>
                      <div className="text-sm">{comment.answer}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {comment.answered_at && `Answered ${format(new Date(comment.answered_at), 'MMM d, yyyy')}`}
                      </div>
                    </div>
                  ) : canEditStatus ? (
                    <div className="mt-2 pt-2 border-t">
                      <Textarea
                        placeholder="Add an answer..."
                        className="min-h-[60px] text-sm"
                        value={answers[comment.comment_id] || ''}
                        onChange={(e) => setAnswers({...answers, [comment.comment_id]: e.target.value})}
                      />
                      <Button 
                        size="sm" 
                        className="mt-2" 
                        onClick={() => addAnswer(comment.comment_id)}
                        disabled={!answers[comment.comment_id]}
                      >
                        Submit Answer
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-amber-600 mt-2 gap-1">
                      <AlertCircle className="h-3 w-3" /> Waiting for answer
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Add Question Form */}
          <div className="border-t pt-3 mt-3">
            <Textarea
              placeholder="Ask a question about this coverage cell..."
              className="min-h-[60px] text-sm"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <Button 
              className="mt-2 w-full" 
              onClick={addQuestion}
              disabled={!newQuestion.trim() || !user}
            >
              Submit Question
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
