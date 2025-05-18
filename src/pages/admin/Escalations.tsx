import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  ShieldOff, 
  ShieldQuestion,
  MessageSquare,
  ExternalLink, 
  Link as LinkIcon,
  ChevronRight 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDashboard } from "@/context/DashboardContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  EscalationStatus,
  DatabaseEscalationStatus,
  mapDatabaseStatusToAppStatus, 
  mapAppStatusToDatabaseStatus 
} from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

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
  business_case_url: string | null;
  status: EscalationStatus;
  created_at: string;
  aligned_at: string | null;
  resolved_at: string | null;
}

const EscalationStatusIcons = {
  SUBMITTED: Shield,
  IN_DISCUSSION: MessageSquare,
  RESOLVED_BLOCKED: ShieldAlert,
  RESOLVED_LAUNCHING: ShieldQuestion,
  RESOLVED_LAUNCHED: ShieldCheck,
};

const EscalationsPage = () => {
  const { toast } = useToast();
  const { getProductById, getMarketById, getAllMarkets } = useDashboard();
  const [isLoading, setIsLoading] = useState(true);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [filteredEscalations, setFilteredEscalations] = useState<Escalation[]>([]);
  const [filter, setFilter] = useState({
    status: "all",
    search: "",
  });
  const isMobile = useIsMobile();
  const [statusCounts, setStatusCounts] = useState({
    SUBMITTED: 0,
    IN_DISCUSSION: 0,
    RESOLVED_BLOCKED: 0,
    RESOLVED_LAUNCHING: 0,
    RESOLVED_LAUNCHED: 0,
    total: 0
  });
  const [medianTimeToAlign, setMedianTimeToAlign] = useState<number | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentEscalation, setCurrentEscalation] = useState<Escalation | null>(null);
  const [statusChangeNote, setStatusChangeNote] = useState("");
  const [newStatus, setNewStatus] = useState<EscalationStatus | null>(null);

  // Load all escalations when the component mounts
  useEffect(() => {
    loadEscalations();
  }, []);

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [filter, escalations]);

  const calculateMedianTimeToAlign = (allEscalations: Escalation[]) => {
    const resolvedEscalations = allEscalations.filter(
      (e) => e.status === "RESOLVED_LAUNCHED"
    );
    
    if (resolvedEscalations.length === 0) return null;
    
    const times = resolvedEscalations
      .filter(e => e.aligned_at && e.created_at) // Ensure both dates exist
      .map(e => {
        const createdDate = new Date(e.created_at);
        const alignedDate = new Date(e.aligned_at!);
        return (alignedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24); // Days
      })
      .sort((a, b) => a - b);
    
    if (times.length === 0) return null;
    
    const midIndex = Math.floor(times.length / 2);
    return times.length % 2 === 0
      ? (times[midIndex - 1] + times[midIndex]) / 2
      : times[midIndex];
  };

  const calculateStatusCounts = (allEscalations: Escalation[]) => {
    const counts = {
      SUBMITTED: 0,
      IN_DISCUSSION: 0,
      RESOLVED_BLOCKED: 0,
      RESOLVED_LAUNCHING: 0,
      RESOLVED_LAUNCHED: 0,
      total: allEscalations.length
    };
    
    allEscalations.forEach(e => {
      counts[e.status]++;
    });
    
    return counts;
  };

  const loadEscalations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("escalation")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      const enrichedData = enrichEscalations(data || []);
      setEscalations(enrichedData);
      
      // Calculate metrics
      const counts = calculateStatusCounts(enrichedData);
      setStatusCounts(counts);
      
      const medianDays = calculateMedianTimeToAlign(enrichedData);
      setMedianTimeToAlign(medianDays);
      
    } catch (error) {
      console.error("Error loading escalations:", error);
      toast({
        title: "Error",
        description: "Failed to load escalations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enrichEscalations = (data: any[]): Escalation[] => {
    return data.map(item => {
      const product = getProductById(item.product_id);
      
      // Determine market name based on scope level
      let marketName = 'Unknown';
      if (item.scope_level === 'CITY' && item.city_id) {
        const market = getMarketById(item.city_id);
        marketName = market?.name || 'Unknown city';
      } else if (item.scope_level === 'COUNTRY' && item.country_code) {
        marketName = item.country_code;
      } else if (item.scope_level === 'REGION' && item.region) {
        marketName = item.region;
      }
      
      return {
        ...item,
        // Convert database status to application status
        status: mapDatabaseStatusToAppStatus(item.status),
        product_name: product?.name || 'Unknown product',
        market_name: marketName
      };
    });
  };

  const applyFilters = () => {
    let filtered = [...escalations];
    
    // Filter by status
    if (filter.status !== "all") {
      filtered = filtered.filter(e => e.status === filter.status);
    }
    
    // Filter by search term (product, market, or POC)
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(
        e => 
          (e.product_name?.toLowerCase().includes(searchTerm)) ||
          (e.market_name?.toLowerCase().includes(searchTerm)) ||
          (e.poc?.toLowerCase().includes(searchTerm)) ||
          (e.reason?.toLowerCase().includes(searchTerm))
      );
    }
    
    setFilteredEscalations(filtered);
  };

  const handleStatusChange = (escalationId: string, targetStatus: EscalationStatus) => {
    const escalation = escalations.find(e => e.esc_id === escalationId);
    if (!escalation) return;
    
    setCurrentEscalation(escalation);
    setNewStatus(targetStatus);
    
    // For simplicity, we prompt for notes on any status change
    setStatusChangeNote("");
    setNoteDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!currentEscalation || !newStatus) return;
    
    try {
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
        .eq("esc_id", currentEscalation.esc_id);
      
      if (error) throw error;
      
      // Add a note to history if provided
      if (statusChangeNote) {
        // For history, we use database status values
        const oldDbStatus = mapAppStatusToDatabaseStatus(currentEscalation.status);
        const newDbStatus = mapAppStatusToDatabaseStatus(newStatus);
        
        // Force type assertion here since we know our status values match the database
        await supabase.from("escalation_history").insert({
          escalation_id: currentEscalation.esc_id,
          user_id: "admin", // Ideally this would be the current user's ID
          old_status: oldDbStatus as any,
          new_status: newDbStatus as any,
          notes: statusChangeNote
        });
      }
      
      toast({
        title: "Status updated",
        description: `Escalation status updated to ${newStatus.replace('_', ' ').toLowerCase()}.`,
      });
      
      // Refresh the data
      loadEscalations();
      
    } catch (error) {
      console.error("Error updating escalation status:", error);
      toast({
        title: "Error",
        description: "Failed to update escalation status.",
        variant: "destructive",
      });
    } finally {
      setNoteDialogOpen(false);
      setCurrentEscalation(null);
      setNewStatus(null);
    }
  };

  const getNextStatus = (currentStatus: EscalationStatus): EscalationStatus => {
    const statusFlow = {
      SUBMITTED: 'IN_DISCUSSION',
      IN_DISCUSSION: 'RESOLVED_LAUNCHED',
      RESOLVED_BLOCKED: 'IN_DISCUSSION',
      RESOLVED_LAUNCHING: 'RESOLVED_LAUNCHED',
      RESOLVED_LAUNCHED: 'SUBMITTED'
    } as const;
    
    return statusFlow[currentStatus];
  };

  const formatStatusText = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="p-2 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Escalation Review</h1>
          <p className="text-muted-foreground">
            Review and manage escalation requests to count blocked markets as launched.
          </p>
        </div>
        
        <div className="flex items-center w-full sm:w-auto">
          <Button
            onClick={() => loadEscalations()}
            variant="outline"
            className="h-9 w-full sm:w-auto"
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {/* KPI Header - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="border rounded-lg p-3 sm:p-4 bg-muted/20">
          <div className="text-lg sm:text-2xl font-bold">{statusCounts.SUBMITTED}</div>
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-1">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
            <span>Submitted</span>
          </div>
        </div>
        
        <div className="border rounded-lg p-3 sm:p-4 bg-muted/20">
          <div className="text-lg sm:text-2xl font-bold">{statusCounts.IN_DISCUSSION}</div>
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-1">
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            <span>In Discussion</span>
          </div>
        </div>
        
        <div className="border rounded-lg p-3 sm:p-4 bg-muted/20">
          <div className="text-lg sm:text-2xl font-bold">{statusCounts.RESOLVED_LAUNCHED}</div>
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-1">
            <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            <span>Resolved</span>
          </div>
        </div>
        
        <div className="border rounded-lg p-3 sm:p-4 bg-muted/20">
          <div className="text-lg sm:text-2xl font-bold">
            {medianTimeToAlign !== null ? `${medianTimeToAlign.toFixed(1)} days` : "N/A"}
          </div>
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-1">
            <span>Median Time</span>
          </div>
        </div>
      </div>
      
      {/* Filters - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="w-full sm:w-auto">
          <Select
            value={filter.status}
            onValueChange={(value) => setFilter({ ...filter, status: value })}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="IN_DISCUSSION">In Discussion</SelectItem>
              <SelectItem value="RESOLVED_BLOCKED">Resolved - Blocked</SelectItem>
              <SelectItem value="RESOLVED_LAUNCHING">Resolved - Launching</SelectItem>
              <SelectItem value="RESOLVED_LAUNCHED">Resolved - Launched</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 w-full">
          <Input
            placeholder="Search product, market, or POC..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="h-9 w-full"
          />
        </div>
      </div>
      
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredEscalations.length} escalations {filter.status !== "all" || filter.search ? "(filtered)" : ""}
      </div>
      
      {/* Table for Desktop / Cards for Mobile */}
      {isMobile ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10">Loading escalations...</div>
          ) : filteredEscalations.length === 0 ? (
            <div className="text-center py-10">
              No escalations found. Try adjusting your filters.
            </div>
          ) : (
            filteredEscalations.map((escalation) => {
              const StatusIcon = EscalationStatusIcons[escalation.status];
              
              return (
                <Card key={escalation.esc_id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{escalation.product_name}</CardTitle>
                        <CardDescription>{escalation.market_name}</CardDescription>
                      </div>
                      <Badge
                        variant={escalation.status.includes('RESOLVED') ? "outline" : "secondary"}
                        className={`px-2 py-1 ${
                          escalation.status === "SUBMITTED"
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : escalation.status === "IN_DISCUSSION"
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : escalation.status === "RESOLVED_BLOCKED"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : escalation.status === "RESOLVED_LAUNCHING"
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1 inline" />
                        {formatStatusText(escalation.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-3">
                        <span className="font-medium">POC:</span>
                        <span className="col-span-2">{escalation.poc}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-medium">Created:</span>
                        <span className="col-span-2">{new Date(escalation.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-medium">Resolved:</span>
                        <span className="col-span-2">
                          {escalation.resolved_at
                            ? new Date(escalation.resolved_at).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-3">
                        <span className="font-medium">Reason:</span>
                        <span className="col-span-2 truncate" title={escalation.reason}>
                          {escalation.reason}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <Select onValueChange={(val) => handleStatusChange(escalation.esc_id, val as EscalationStatus)}>
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SUBMITTED">Submitted</SelectItem>
                          <SelectItem value="IN_DISCUSSION">In Discussion</SelectItem>
                          <SelectItem value="RESOLVED_BLOCKED">Resolved - Blocked</SelectItem>
                          <SelectItem value="RESOLVED_LAUNCHING">Resolved - Launching</SelectItem>
                          <SelectItem value="RESOLVED_LAUNCHED">Resolved - Launched</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {escalation.business_case_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a
                            href={escalation.business_case_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View business case</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Market</TableHead>
                <TableHead className="w-[200px]">Reason</TableHead>
                <TableHead>POC</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Resolved</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    Loading escalations...
                  </TableCell>
                </TableRow>
              ) : filteredEscalations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    No escalations found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEscalations.map((escalation) => {
                  const StatusIcon = EscalationStatusIcons[escalation.status];
                  const nextStatus = getNextStatus(escalation.status);
                  
                  return (
                    <TableRow key={escalation.esc_id} className="group">
                      <TableCell>
                        <div className="flex justify-center">
                          <Badge
                            variant={escalation.status.includes('RESOLVED') ? "outline" : "secondary"}
                            className={`px-2 py-1 ${
                              escalation.status === "SUBMITTED"
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                : escalation.status === "IN_DISCUSSION"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                : escalation.status === "RESOLVED_BLOCKED"
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : escalation.status === "RESOLVED_LAUNCHING"
                                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1 inline" />
                            {formatStatusText(escalation.status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{escalation.product_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">
                          {escalation.scope_level.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{escalation.market_name}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={escalation.reason}>
                        {escalation.reason}
                      </TableCell>
                      <TableCell>{escalation.poc}</TableCell>
                      <TableCell>
                        {new Date(escalation.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {escalation.resolved_at
                          ? new Date(escalation.resolved_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Select onValueChange={(val) => handleStatusChange(escalation.esc_id, val as EscalationStatus)}>
                            <SelectTrigger className="h-8 w-28">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SUBMITTED">Submitted</SelectItem>
                              <SelectItem value="IN_DISCUSSION">In Discussion</SelectItem>
                              <SelectItem value="RESOLVED_BLOCKED">Resolved - Blocked</SelectItem>
                              <SelectItem value="RESOLVED_LAUNCHING">Resolved - Launching</SelectItem>
                              <SelectItem value="RESOLVED_LAUNCHED">Resolved - Launched</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {escalation.business_case_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                            >
                              <a
                                href={escalation.business_case_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">View business case</span>
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Note Dialog */}
      <AlertDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Update Escalation Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status to {newStatus ? formatStatusText(newStatus) : ''}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="mb-4">
            <label className="text-sm font-medium mb-1 block">
              Add a note (optional)
            </label>
            <Input
              value={statusChangeNote}
              onChange={(e) => setStatusChangeNote(e.target.value)}
              placeholder="Provide context for this status change..."
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EscalationsPage;
