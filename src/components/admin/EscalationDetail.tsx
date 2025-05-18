
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDashboard } from "@/context/DashboardContext";
import { format } from "date-fns";
import { Shield, ShieldCheck, MessageSquare, ExternalLink, Calendar, User, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EscalationStatus, mapDatabaseStatusToAppStatus, mapAppStatusToDatabaseStatus } from "@/types";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Updated Comment interface to match the structure from escalation_history
interface Comment {
  id: string;
  escalation_id: string;
  user_id: string;
  user_name?: string;
  old_status?: string | null;
  new_status?: string;
  notes?: string | null;
  changed_at: string;
  content?: string; // For compatibility with older code
  created_at?: string; // For compatibility with older code
}

interface Escalation {
  esc_id: string;
  product_id: string;
  product_name?: string;
  scope_level: string;
  city_id: string | null;
  country_code: string | null;
  region: string | null;
  market_name?: string;
  raised_by: string;
  poc: string;
  reason: string;
  reason_type: string | null;
  business_case_url: string | null;
  status: EscalationStatus;
  created_at: string;
  aligned_at: string | null;
  resolved_at: string | null;
  tech_poc?: string;
  tech_sponsor?: string;
  ops_poc?: string;
  ops_sponsor?: string;
  additional_stakeholders?: string;
  comments: Comment[];
}

const EscalationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProductById, getMarketById } = useDashboard();
  
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [newStatus, setNewStatus] = useState<EscalationStatus | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [changingStatus, setChangingStatus] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchEscalationDetails(id);
    }
  }, [id]);
  
  const fetchEscalationDetails = async (escalationId: string) => {
    try {
      setLoading(true);
      
      // Fetch the main escalation data
      const { data: escalationData, error } = await supabase
        .from("escalation")
        .select("*")
        .eq("esc_id", escalationId)
        .single();
        
      if (error) throw error;
      
      if (!escalationData) {
        toast({
          title: "Not found",
          description: "The requested escalation could not be found.",
          variant: "destructive",
        });
        navigate("/escalations");
        return;
      }
      
      // Get comments for this escalation
      const { data: commentsData } = await supabase
        .from("escalation_history")
        .select("*")
        .eq("escalation_id", escalationId)
        .order("changed_at", { ascending: false });
      
      // Enrich the escalation data
      const product = getProductById(escalationData.product_id);
      
      // Determine market name based on scope level
      let marketName = 'Unknown';
      let marketId = '';
      if (escalationData.scope_level === 'CITY' && escalationData.city_id) {
        marketId = escalationData.city_id;
        const market = getMarketById(marketId);
        marketName = market?.name || 'Unknown city';
      } else if (escalationData.scope_level === 'COUNTRY' && escalationData.country_code) {
        marketId = escalationData.country_code;
        marketName = escalationData.country_code;
      } else if (escalationData.scope_level === 'REGION' && escalationData.region) {
        marketId = escalationData.region;
        marketName = escalationData.region;
      }
      
      const enrichedEscalation: Escalation = {
        ...escalationData,
        // Convert database status to application status
        status: mapDatabaseStatusToAppStatus(escalationData.status),
        product_name: product?.name || 'Unknown product',
        market_name: marketName,
        comments: commentsData || [],
      };
      
      setEscalation(enrichedEscalation);
      
      // Set initial status for the dropdown
      setNewStatus(enrichedEscalation.status);
      
    } catch (error) {
      console.error("Error fetching escalation details:", error);
      toast({
        title: "Error",
        description: "Failed to load escalation details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddComment = async () => {
    if (!comment.trim() || !escalation) return;
    
    try {
      setSubmittingComment(true);
      
      // Add a note with the comment to escalation history
      const { error } = await supabase.from("escalation_history").insert({
        escalation_id: escalation.esc_id,
        user_id: "Current User", // Ideally this would be the current user's ID
        old_status: mapAppStatusToDatabaseStatus(escalation.status),
        new_status: mapAppStatusToDatabaseStatus(escalation.status),
        notes: comment,
      });
      
      if (error) throw error;
      
      // Refresh escalation data to show new comment
      if (id) {
        fetchEscalationDetails(id);
      }
      
      // Clear comment input
      setComment("");
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
      
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };
  
  const handleStatusChange = async () => {
    if (!newStatus || !escalation || newStatus === escalation.status) return;
    
    try {
      setChangingStatus(true);
      
      // Convert app status to database status for the update
      const dbStatus = mapAppStatusToDatabaseStatus(newStatus);
      
      // Force type assertion here since we know our status values match the database
      const { error } = await supabase
        .from("escalation")
        .update({ 
          status: dbStatus as any,
          ...(newStatus === 'RESOLVED_LAUNCHED' ? { aligned_at: new Date().toISOString() } : {}),
          ...(newStatus.startsWith('RESOLVED_') ? { resolved_at: new Date().toISOString() } : {})
        })
        .eq("esc_id", escalation.esc_id);
      
      if (error) throw error;
      
      // Add a note to history for the status change
      // For history, we use database status values
      const oldDbStatus = mapAppStatusToDatabaseStatus(escalation.status);
      const newDbStatus = mapAppStatusToDatabaseStatus(newStatus);
      
      // Force type assertion here since we know our status values match the database
      await supabase.from("escalation_history").insert({
        escalation_id: escalation.esc_id,
        user_id: "Current User", // Ideally this would be the current user's ID
        old_status: oldDbStatus as any,
        new_status: newDbStatus as any,
        notes: statusNote || `Status changed from ${escalation.status} to ${newStatus}`,
      });
      
      toast({
        title: "Status updated",
        description: `Escalation status updated to ${newStatus.replace('_', ' ').toLowerCase()}.`,
      });
      
      // Refresh data
      if (id) {
        fetchEscalationDetails(id);
      }
      
      // Clear status note
      setStatusNote("");
      
    } catch (error) {
      console.error("Error updating escalation status:", error);
      toast({
        title: "Error",
        description: "Failed to update escalation status.",
        variant: "destructive",
      });
    } finally {
      setChangingStatus(false);
    }
  };
  
  const formatStatusText = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <p>Loading escalation details...</p>
        </div>
      </div>
    );
  }
  
  if (!escalation) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            The requested escalation could not be found.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate("/escalations")}>
            Return to Escalation Log
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Escalation Detail</h1>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/escalations")}>
            Back to Log
          </Button>
        </div>
      </div>
      
      {/* Escalation Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between">
            <div>
              <CardTitle className="text-lg">{escalation.product_name}</CardTitle>
              <CardDescription>
                {escalation.scope_level.charAt(0) + escalation.scope_level.slice(1).toLowerCase()}:
                {' '}{escalation.market_name}
              </CardDescription>
            </div>
            
            <Badge 
              className={
                escalation.status === "SUBMITTED"
                ? "bg-amber-100 text-amber-700"
                : escalation.status === "IN_DISCUSSION"
                ? "bg-blue-100 text-blue-700"
                : escalation.status === "RESOLVED_BLOCKED"
                ? "bg-red-100 text-red-700"
                : escalation.status === "RESOLVED_LAUNCHING"
                ? "bg-purple-100 text-purple-700"
                : "bg-green-100 text-green-700"
              }
            >
              {formatStatusText(escalation.status)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-1">Escalation Reason</h3>
              <p className="text-sm text-[var(--uber-gray-60)]">{escalation.reason}</p>
              {escalation.reason_type && (
                <Badge variant="outline" className="mt-2">{escalation.reason_type}</Badge>
              )}
            </div>
            
            <div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[var(--uber-gray-60)]" />
                  <span className="text-sm">
                    <span className="font-medium">Raised by:</span>{" "}
                    {escalation.raised_by}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[var(--uber-gray-60)]" />
                  <span className="text-sm">
                    <span className="font-medium">Point of Contact:</span>{" "}
                    {escalation.poc}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--uber-gray-60)]" />
                  <span className="text-sm">
                    <span className="font-medium">Created:</span>{" "}
                    {format(new Date(escalation.created_at), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                
                {escalation.business_case_url && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--uber-gray-60)]" />
                    <a 
                      href={escalation.business_case_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      Business Case 
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Team */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Technical Team</h3>
              {escalation.tech_poc ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[var(--uber-gray-60)]" />
                    <span className="text-sm">
                      <span className="font-medium">Tech POC:</span>{" "}
                      {escalation.tech_poc}
                    </span>
                  </div>
                  
                  {escalation.tech_sponsor && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[var(--uber-gray-60)]" />
                      <span className="text-sm">
                        <span className="font-medium">Tech Sponsor:</span>{" "}
                        {escalation.tech_sponsor}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--uber-gray-60)]">No technical team specified</p>
              )}
            </div>
            
            {/* Operations Team */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Operations Team</h3>
              {escalation.ops_poc ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[var(--uber-gray-60)]" />
                    <span className="text-sm">
                      <span className="font-medium">Ops POC:</span>{" "}
                      {escalation.ops_poc}
                    </span>
                  </div>
                  
                  {escalation.ops_sponsor && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[var(--uber-gray-60)]" />
                      <span className="text-sm">
                        <span className="font-medium">Ops Sponsor:</span>{" "}
                        {escalation.ops_sponsor}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--uber-gray-60)]">No operations team specified</p>
              )}
            </div>
          </div>
          
          {/* Additional Stakeholders */}
          {escalation.additional_stakeholders && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="text-sm font-semibold mb-3">Additional Stakeholders</h3>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--uber-gray-60)]" />
                  <span className="text-sm">{escalation.additional_stakeholders}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Status Update */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Update Status</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label className="text-sm font-medium mb-2 block">Status</Label>
              <Select 
                value={newStatus || escalation.status} 
                onValueChange={(value) => setNewStatus(value as EscalationStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="IN_DISCUSSION">In Discussion</SelectItem>
                  <SelectItem value="RESOLVED_BLOCKED">Resolved - Blocked</SelectItem>
                  <SelectItem value="RESOLVED_LAUNCHING">Resolved - Launching</SelectItem>
                  <SelectItem value="RESOLVED_LAUNCHED">Resolved - Launched</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-3">
              <Label className="text-sm font-medium mb-2 block">Note (Optional)</Label>
              <div className="flex gap-2">
                <Textarea 
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note about this status change"
                  className="flex-1"
                />
                <Button 
                  onClick={handleStatusChange}
                  disabled={changingStatus || !newStatus || newStatus === escalation.status}
                >
                  {changingStatus ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Discussion</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Add Comment */}
            <div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comment here..."
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <Button 
                  onClick={handleAddComment} 
                  disabled={!comment.trim() || submittingComment}
                >
                  {submittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Comment List */}
            <div className="space-y-4">
              {escalation.comments.length === 0 ? (
                <p className="text-center text-[var(--uber-gray-60)] py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                escalation.comments.map((comment) => (
                  <div key={comment.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{comment.user_id}</div>
                      <div className="text-xs text-[var(--uber-gray-60)]">
                        {format(new Date(comment.changed_at), "MMM d, yyyy h:mm a")}
                      </div>
                    </div>
                    
                    {/* If this is a status change comment */}
                    {comment.old_status !== comment.new_status && (
                      <div className="mt-1 text-sm">
                        <Badge className="mr-1" variant="outline">Status Change</Badge>
                        Changed status from{" "}
                        <span className="font-medium">
                          {formatStatusText(mapDatabaseStatusToAppStatus(comment.old_status || ""))}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {formatStatusText(mapDatabaseStatusToAppStatus(comment.new_status || ""))}
                        </span>
                      </div>
                    )}
                    
                    {/* Comment content */}
                    {comment.notes && (
                      <div className="mt-2 text-sm">{comment.notes}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalationDetail;

// Helper function needed in component
const handleStatusChange = async () => {
  if (!newStatus || !escalation || newStatus === escalation.status) return;
  
  try {
    setChangingStatus(true);
    
    // Convert app status to database status for the update
    const dbStatus = mapAppStatusToDatabaseStatus(newStatus);
    
    // Force type assertion here since we know our status values match the database
    const { error } = await supabase
      .from("escalation")
      .update({ 
        status: dbStatus as any,
        ...(newStatus === 'RESOLVED_LAUNCHED' ? { aligned_at: new Date().toISOString() } : {}),
        ...(newStatus.startsWith('RESOLVED_') ? { resolved_at: new Date().toISOString() } : {})
      })
      .eq("esc_id", escalation.esc_id);
    
    if (error) throw error;
    
    // Add a note to history for the status change
    // For history, we use database status values
    const oldDbStatus = mapAppStatusToDatabaseStatus(escalation.status);
    const newDbStatus = mapAppStatusToDatabaseStatus(newStatus);
    
    // Force type assertion here since we know our status values match the database
    await supabase.from("escalation_history").insert({
      escalation_id: escalation.esc_id,
      user_id: "Current User", // Ideally this would be the current user's ID
      old_status: oldDbStatus as any,
      new_status: newDbStatus as any,
      notes: statusNote || `Status changed from ${escalation.status} to ${newStatus}`,
    });
    
    toast({
      title: "Status updated",
      description: `Escalation status updated to ${newStatus.replace('_', ' ').toLowerCase()}.`,
    });
    
    // Refresh data
    if (id) {
      fetchEscalationDetails(id);
    }
    
    // Clear status note
    setStatusNote("");
    
  } catch (error) {
    console.error("Error updating escalation status:", error);
    toast({
      title: "Error",
      description: "Failed to update escalation status.",
      variant: "destructive",
    });
  } finally {
    setChangingStatus(false);
  }
};

const formatStatusText = (status: string) => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};
