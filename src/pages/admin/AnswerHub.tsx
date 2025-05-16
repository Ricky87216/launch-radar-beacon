
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/context/DashboardContext';
import { format } from 'date-fns';
import { 
  Clock, 
  Search, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Filter,
  Loader2,
  Link
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

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
  selected?: boolean;
}

export default function AnswerHub() {
  const { user, getProductById, getMarketById, getAllMarkets } = useDashboard();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [currentTab, setCurrentTab] = useState<'OPEN' | 'ANSWERED'>('OPEN');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check user permissions
  useEffect(() => {
    if (!(user?.role === 'admin' || user?.role === 'editor')) {
      navigate('/');
      toast.error('You do not have permission to view this page');
    }
  }, [user, navigate]);
  
  // Get unique products, regions, countries
  const products = useDashboard().products;
  const allMarkets = getAllMarkets();
  const regions = allMarkets.filter(m => m.type === 'region');
  const countries = allMarkets.filter(m => m.type === 'country' && 
    (selectedRegion === 'all' || getMarketById(m.parent_id || '')?.id === selectedRegion));
  
  // Calculate metrics
  const openQuestions = comments.filter(c => c.status === 'OPEN').length;
  const answeredQuestions = comments.filter(c => c.status === 'ANSWERED').length;
  
  // Calculate median time to answer
  const getMedianTimeToAnswer = () => {
    const answeredComments = comments.filter(c => c.status === 'ANSWERED' && c.answered_at);
    if (!answeredComments.length) return 'N/A';
    
    const responseTimes = answeredComments.map(c => {
      const createdAt = new Date(c.created_at);
      const answeredAt = new Date(c.answered_at!);
      return (answeredAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60); // hours
    });
    
    responseTimes.sort((a, b) => a - b);
    const mid = Math.floor(responseTimes.length / 2);
    const median = responseTimes.length % 2 === 0
      ? (responseTimes[mid - 1] + responseTimes[mid]) / 2
      : responseTimes[mid];
    
    if (median < 24) {
      return `${median.toFixed(1)} hours`;
    } else {
      return `${(median / 24).toFixed(1)} days`;
    }
  };
  
  // Count questions in the past week
  const getQuestionsThisWeek = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return comments.filter(c => new Date(c.created_at) > oneWeekAgo).length;
  };
  
  // Fetch comments from the database
  useEffect(() => {
    fetchComments();
  }, []);
  
  // Apply filters to comments
  useEffect(() => {
    let filtered = comments.filter(c => c.status === currentTab);
    
    // Search filter (question text)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c => c.question.toLowerCase().includes(searchLower));
    }
    
    // Product filter
    if (selectedProduct !== 'all') {
      filtered = filtered.filter(c => c.product_id === selectedProduct);
    }
    
    // Region filter
    if (selectedRegion !== 'all') {
      const citiesInRegion = allMarkets
        .filter(m => {
          // Find cities that have a parent country that belongs to the selected region
          if (m.type === 'city') {
            const country = getMarketById(m.parent_id || '');
            if (country) {
              const region = getMarketById(country.parent_id || '');
              return region?.id === selectedRegion;
            }
          }
          return false;
        })
        .map(m => m.id);
      
      filtered = filtered.filter(c => citiesInRegion.includes(c.city_id));
    }
    
    // Country filter
    if (selectedCountry !== 'all') {
      const citiesInCountry = allMarkets
        .filter(m => m.type === 'city' && m.parent_id === selectedCountry)
        .map(m => m.id);
      
      filtered = filtered.filter(c => citiesInCountry.includes(c.city_id));
    }
    
    setFilteredComments(filtered);
  }, [comments, currentTab, search, selectedProduct, selectedRegion, selectedCountry, allMarkets]);
  
  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cell_comment')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Explicitly type the data as Comment[]
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
  
  // Handle answer submission
  const handleAnswer = async (commentId: string) => {
    const answer = answers[commentId];
    if (!answer.trim()) return;
    
    setIsSubmitting(true);
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
      
      // Update local state
      setComments(prev => 
        prev.map(comment => 
          comment.comment_id === commentId 
            ? { 
                ...comment, 
                answer, 
                status: 'ANSWERED', 
                answered_at: new Date().toISOString() 
              }
            : comment
        )
      );
      
      toast.success('Answer saved successfully');
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error('Failed to save answer');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle status toggle
  const handleToggleStatus = async (commentId: string, newStatus: 'OPEN' | 'ANSWERED') => {
    try {
      const comment = comments.find(c => c.comment_id === commentId);
      if (!comment) return;
      
      const updates: any = {
        status: newStatus
      };
      
      // If setting to ANSWERED, make sure there's an answer
      if (newStatus === 'ANSWERED') {
        if (!comment.answer && !answers[commentId]) {
          toast.error('Cannot mark as answered without an answer');
          return;
        }
        updates.answer = comment.answer || answers[commentId];
        updates.answered_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('cell_comment')
        .update(updates)
        .eq('comment_id', commentId);
        
      if (error) throw error;
      
      // Update local state
      setComments(prev => 
        prev.map(c => 
          c.comment_id === commentId 
            ? { ...c, ...updates }
            : c
        )
      );
      
      toast.success(`Question marked as ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };
  
  // Navigate to the specific cell in the heatmap
  const navigateToCell = (comment: Comment) => {
    navigate(`/?product=${comment.product_id}&market=${comment.city_id}&focusComment=${comment.comment_id}`);
  };
  
  // Handle bulk actions for selected comments
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  
  const toggleSelectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map(c => c.comment_id));
    }
  };
  
  const toggleSelectComment = (commentId: string) => {
    setSelectedComments(prev => 
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };
  
  const handleBulkStatusChange = async (newStatus: 'OPEN' | 'ANSWERED') => {
    if (!selectedComments.length) return;
    
    try {
      // If setting to ANSWERED, check that all have answers
      if (newStatus === 'ANSWERED') {
        const commentsWithoutAnswer = selectedComments.filter(id => {
          const comment = comments.find(c => c.comment_id === id);
          return !comment?.answer && !answers[id];
        });
        
        if (commentsWithoutAnswer.length) {
          toast.error('Some selected questions don\'t have answers');
          return;
        }
      }
      
      // Update each comment separately to handle answered_at properly
      for (const commentId of selectedComments) {
        const comment = comments.find(c => c.comment_id === commentId);
        if (!comment) continue;
        
        const updates: any = {
          status: newStatus
        };
        
        if (newStatus === 'ANSWERED') {
          updates.answer = comment.answer || answers[commentId];
          updates.answered_at = new Date().toISOString();
        }
        
        await supabase
          .from('cell_comment')
          .update(updates)
          .eq('comment_id', commentId);
      }
      
      // Update local state
      setComments(prev => 
        prev.map(comment => 
          selectedComments.includes(comment.comment_id)
            ? { 
                ...comment, 
                status: newStatus,
                ...(newStatus === 'ANSWERED' 
                  ? { answered_at: comment.answered_at || new Date().toISOString() } 
                  : {})
              }
            : comment
        )
      );
      
      toast.success(`${selectedComments.length} questions updated`);
      setSelectedComments([]);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setSelectedProduct('all');
    setSelectedRegion('all');
    setSelectedCountry('all');
  };
  
  // Get market name from ID
  const getCityInfo = (cityId: string) => {
    const city = getMarketById(cityId);
    if (!city) return { city: 'Unknown', country: 'Unknown', region: 'Unknown' };
    
    const country = getMarketById(city.parent_id || '');
    const region = country ? getMarketById(country.parent_id || '') : null;
    
    return {
      city: city.name || 'Unknown',
      country: country?.name || 'Unknown',
      region: region?.name || 'Unknown'
    };
  };

  // Get coverage percentage for a specific cell
  const getCoveragePercentage = (productId: string, marketId: string) => {
    const { getCoverageCell } = useDashboard();
    const cell = getCoverageCell(productId, marketId);
    
    if (!cell) return 'N/A';
    return `${cell.coverage.toFixed(1)}%`;
  };
  
  if (!(user?.role === 'admin' || user?.role === 'editor')) {
    return null;
  }
  
  return (
    <div className="container p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Answer Hub</h1>
          <p className="text-gray-500">Manage and respond to questions about coverage</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 text-sm">
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-md">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Open Questions:</span> {openQuestions}
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-md">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-medium">Answered:</span> {answeredQuestions}
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-purple-50 rounded-md">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="font-medium">Median Response Time:</span> {getMedianTimeToAnswer()}
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 rounded-md">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <span className="font-medium">Questions This Week:</span> {getQuestionsThisWeek()}
          </div>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'OPEN' | 'ANSWERED')}>
        <TabsList>
          <TabsTrigger value="OPEN" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Open Questions
            <span className="bg-blue-100 text-blue-800 text-xs px-2 rounded-full">{openQuestions}</span>
          </TabsTrigger>
          <TabsTrigger value="ANSWERED" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Answered
            <span className="bg-green-100 text-green-800 text-xs px-2 rounded-full">{answeredQuestions}</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="my-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center relative">
            <Search className="w-4 h-4 absolute left-3 text-gray-400" />
            <Input 
              placeholder="Search questions..." 
              className="pl-9" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by Product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.map(product => (
                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedRegion} onValueChange={(value) => {
            setSelectedRegion(value);
            setSelectedCountry('all'); // Reset country when region changes
          }}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full md:w-[200px]" disabled={selectedRegion === 'all'}>
              <SelectValue placeholder="Filter by Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={resetFilters}
            title="Reset filters"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-md">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No questions found</h3>
            <p className="text-gray-500 mt-1">
              {currentTab === 'OPEN' 
                ? 'All questions have been answered!' 
                : 'No answered questions match your filters'}
            </p>
            {(search || selectedProduct !== 'all' || selectedRegion !== 'all' || selectedCountry !== 'all') && (
              <Button variant="outline" onClick={resetFilters} className="mt-4">
                <Filter className="h-4 w-4 mr-2" /> Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Bulk Actions Bar */}
            {selectedComments.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-md flex items-center justify-between mb-4">
                <div className="text-sm">
                  <span className="font-medium">{selectedComments.length}</span> questions selected
                </div>
                <div className="flex gap-2">
                  {currentTab === 'OPEN' && (
                    <Button size="sm" onClick={() => handleBulkStatusChange('ANSWERED')}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Mark as Answered
                    </Button>
                  )}
                  {currentTab === 'ANSWERED' && (
                    <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('OPEN')}>
                      <MessageSquare className="w-4 h-4 mr-1" /> Reopen Questions
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <TabsContent value="OPEN" className="mt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]">
                        <input 
                          type="checkbox" 
                          checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead className="w-[180px]">Product</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead className="w-[100px]">Coverage %</TableHead>
                      <TableHead className="w-[100px]">Region</TableHead>
                      <TableHead className="w-[100px]">Country</TableHead>
                      <TableHead className="w-[100px]">City</TableHead>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[300px]">Answer</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComments.map(comment => {
                      const product = getProductById(comment.product_id);
                      const { city, country, region } = getCityInfo(comment.city_id);
                      const coverage = getCoveragePercentage(comment.product_id, comment.city_id);
                      
                      return (
                        <TableRow key={comment.comment_id}>
                          <TableCell>
                            <input 
                              type="checkbox" 
                              checked={selectedComments.includes(comment.comment_id)}
                              onChange={() => toggleSelectComment(comment.comment_id)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {product?.name || 'Unknown Product'}
                          </TableCell>
                          <TableCell>
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <div className="max-h-[80px] overflow-y-auto cursor-pointer">
                                  {comment.question.length > 100 
                                    ? comment.question.slice(0, 100) + '...' 
                                    : comment.question}
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent side="right" className="w-96">
                                <div className="font-medium">Full Question:</div>
                                <div className="mt-2">{comment.question}</div>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell>{coverage}</TableCell>
                          <TableCell>{region}</TableCell>
                          <TableCell>{country}</TableCell>
                          <TableCell>{city}</TableCell>
                          <TableCell>{format(new Date(comment.created_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <Textarea
                              value={answers[comment.comment_id] || ''}
                              onChange={(e) => setAnswers({...answers, [comment.comment_id]: e.target.value})}
                              placeholder="Add your answer here..."
                              className="min-h-[60px] text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleAnswer(comment.comment_id)}
                                disabled={!answers[comment.comment_id] || isSubmitting}
                              >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full flex items-center gap-1"
                                onClick={() => navigateToCell(comment)}
                              >
                                <Link className="h-4 w-4" /> Context
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="ANSWERED" className="mt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]">
                        <input 
                          type="checkbox" 
                          checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead className="w-[180px]">Product</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead className="w-[100px]">Coverage %</TableHead>
                      <TableHead className="w-[150px]">Location</TableHead>
                      <TableHead className="w-[120px]">Asked</TableHead>
                      <TableHead className="w-[120px]">Answered</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComments.map(comment => {
                      const product = getProductById(comment.product_id);
                      const { city, country } = getCityInfo(comment.city_id);
                      const coverage = getCoveragePercentage(comment.product_id, comment.city_id);
                      
                      return (
                        <TableRow key={comment.comment_id}>
                          <TableCell>
                            <input 
                              type="checkbox" 
                              checked={selectedComments.includes(comment.comment_id)}
                              onChange={() => toggleSelectComment(comment.comment_id)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {product?.name || 'Unknown Product'}
                          </TableCell>
                          <TableCell>
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <div className="max-h-[80px] overflow-y-auto cursor-pointer">
                                  {comment.question.length > 100 
                                    ? comment.question.slice(0, 100) + '...' 
                                    : comment.question}
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent side="right" className="w-96">
                                <div className="font-medium">Full Question:</div>
                                <div className="mt-2">{comment.question}</div>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell>
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <div className="max-h-[80px] overflow-y-auto cursor-pointer">
                                  {comment.answer && comment.answer.length > 100 
                                    ? comment.answer.slice(0, 100) + '...' 
                                    : comment.answer}
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent side="right" className="w-96">
                                <div className="font-medium">Full Answer:</div>
                                <div className="mt-2">{comment.answer}</div>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell>{coverage}</TableCell>
                          <TableCell>{city}, {country}</TableCell>
                          <TableCell>{format(new Date(comment.created_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            {comment.answered_at && format(new Date(comment.answered_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full" 
                                onClick={() => handleToggleStatus(comment.comment_id, 'OPEN')}
                              >
                                Reopen
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full flex items-center gap-1"
                                onClick={() => navigateToCell(comment)}
                              >
                                <Link className="h-4 w-4" /> Context
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
