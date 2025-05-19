
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { X, Check, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDashboard } from '@/context/DashboardContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types for feedback
interface FeedbackItem {
  id: string;
  name: string;
  content: string;
  created_at: string;
  resolved: boolean;
  response?: string;
  response_at?: string;
}

interface FeedbackFormValues {
  name: string;
  content: string;
}

interface ResponseFormValues {
  response: string;
}

const Feedback = () => {
  const { user } = useDashboard();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const form = useForm<FeedbackFormValues>({
    defaultValues: {
      name: '',
      content: ''
    }
  });
  
  const responseForm = useForm<ResponseFormValues>({
    defaultValues: {
      response: ''
    }
  });

  // Fetch all feedback
  const { data: feedbackItems = [], isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FeedbackItem[];
    }
  });

  // Submit new feedback
  const submitMutation = useMutation({
    mutationFn: async (values: FeedbackFormValues) => {
      const { error } = await supabase
        .from('feedback')
        .insert([{
          name: values.name,
          content: values.content,
          resolved: false
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      form.reset();
      toast.success('Feedback submitted successfully!');
    },
    onError: (error) => {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  });

  // Respond to feedback
  const respondMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string, response: string }) => {
      const { error } = await supabase
        .from('feedback')
        .update({
          response,
          response_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      responseForm.reset();
      setRespondingId(null);
      toast.success('Response added successfully!');
    },
    onError: (error) => {
      console.error('Error responding to feedback:', error);
      toast.error('Failed to add response. Please try again.');
    }
  });

  // Mark feedback as resolved/unresolved
  const toggleResolveMutation = useMutation({
    mutationFn: async ({ id, resolved }: { id: string, resolved: boolean }) => {
      const { error } = await supabase
        .from('feedback')
        .update({ resolved })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback status updated!');
    },
    onError: (error) => {
      console.error('Error updating feedback status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  });

  // Delete feedback
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback. Please try again.');
    }
  });

  const onSubmit = (values: FeedbackFormValues) => {
    submitMutation.mutate(values);
  };

  const onSubmitResponse = (values: ResponseFormValues) => {
    if (respondingId) {
      respondMutation.mutate({
        id: respondingId,
        response: values.response
      });
    }
  };

  // Separate active and resolved feedback
  const activeFeedback = feedbackItems.filter(item => !item.resolved);
  const resolvedFeedback = feedbackItems.filter(item => item.resolved);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Help Us Improve the Global First Dashboard</CardTitle>
          <CardDescription>
            We value your honest feedback to make this dashboard better. This was built quickly, and we're
            looking to continuously improve it based on your input. No feelings will be hurt - we appreciate all 
            constructive criticism and suggestions. If you have specific questions, feel free to direct them to Ricky.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Feedback or Question</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your thoughts, suggestions, or questions about the dashboard..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={submitMutation.isPending}>
                Submit Feedback
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Active Feedback & Questions</h2>
          {isLoading ? (
            <p>Loading feedback...</p>
          ) : activeFeedback.length === 0 ? (
            <p className="text-muted-foreground">No active feedback yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-4">
              {activeFeedback.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-[var(--uber-blue)]">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleResolveMutation.mutate({ id: item.id, resolved: true })}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Mark Resolved
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{item.content}</p>
                    
                    {item.response && (
                      <div className="mt-4 pl-4 border-l-2 border-[var(--uber-gray-20)]">
                        <p className="font-medium text-sm text-[var(--uber-gray-70)]">Response:</p>
                        <p className="whitespace-pre-line">{item.response}</p>
                        {item.response_at && (
                          <p className="text-xs text-[var(--uber-gray-50)] mt-1">
                            {formatDistanceToNow(new Date(item.response_at), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {user?.role === 'admin' && (
                      <>
                        {respondingId === item.id ? (
                          <Form {...responseForm}>
                            <form onSubmit={responseForm.handleSubmit(onSubmitResponse)} className="w-full space-y-2">
                              <FormField
                                control={responseForm.control}
                                name="response"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Write your response..."
                                        className="min-h-[80px]"
                                        {...field} 
                                        defaultValue={item.response || ''}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex space-x-2">
                                <Button type="submit" size="sm">
                                  Save Response
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setRespondingId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </Form>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setRespondingId(item.id);
                              responseForm.setValue('response', item.response || '');
                            }}
                          >
                            {item.response ? (
                              <>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit Response
                              </>
                            ) : (
                              <>
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Respond
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {resolvedFeedback.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-[var(--uber-gray-70)]">Resolved Feedback</h2>
            <div className="space-y-4">
              {resolvedFeedback.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-[var(--uber-gray-30)] opacity-70">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleResolveMutation.mutate({ id: item.id, resolved: false })}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reopen
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{item.content}</p>
                    
                    {item.response && (
                      <div className="mt-4 pl-4 border-l-2 border-[var(--uber-gray-20)]">
                        <p className="font-medium text-sm text-[var(--uber-gray-70)]">Response:</p>
                        <p className="whitespace-pre-line">{item.response}</p>
                        {item.response_at && (
                          <p className="text-xs text-[var(--uber-gray-50)] mt-1">
                            {formatDistanceToNow(new Date(item.response_at), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
