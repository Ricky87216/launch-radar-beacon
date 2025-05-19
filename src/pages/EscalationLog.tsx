import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  ShieldQuestion,
  MessageSquare,
  Search,
  Filter,
  RefreshCcw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { EscalationStatus, mapDatabaseStatusToAppStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EscalationDetail from "@/components/admin/EscalationDetail";

interface EscalationHistoryItem {
  id: string;
  escalation_id: string;
  user_id: string;
  old_status: EscalationStatus | null;
  new_status: EscalationStatus;
  notes: string | null;
  changed_at: string;
  product_name?: string;
  market_name?: string;
  impact_type?: string;
}

const EscalationLog = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: selectedEscalationId } = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  
  const [isLoading, setIsLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState<EscalationHistoryItem[]>([]);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });
  const [filteredItems, setFilteredItems] = useState<EscalationHistoryItem[]>([]);
  
  // Statistics state
  const [stats, setStats] = useState({
    totalEscalations: 0,
    pendingEscalations: 0,
    resolvedEscalations: 0,
  });

  // Automatically fetch escalation data when the component mounts
  // or when the route parameters change (like when navigating to this page)
  useEffect(() => {
    console.log("EscalationLog mounted or route changed:", location.pathname);
    fetchEscalationHistory();
  }, [selectedEscalationId, location.pathname]);
  
  // Apply filters whenever filter state or history items change
  useEffect(() => {
    applyFilters();
  }, [filters, historyItems]);

  const fetchEscalationHistory = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching escalation history...");
      
      // Get the escalation history with a LEFT JOIN to get all history items
      const { data: historyData, error } = await supabase
        .from("escalation_history")
        .select("*, escalation:escalation_id(*)")
        .order("changed_at", { ascending: false });
          
      if (error) {
        console.error("Error fetching escalation history:", error);
        throw error;
      }
      
      console.log("Received escalation history data:", historyData);
      
      // Get all unique escalation IDs
      const escalationIds = [...new Set(historyData?.map(item => item.escalation_id) || [])];
      console.log("Unique escalation IDs:", escalationIds);
      
      // Get the latest status for each escalation
      const latestStatuses = await Promise.all(
        escalationIds.map(async (escId) => {
          const { data } = await supabase
            .from("escalation")
            .select("esc_id, product_id, scope_level, city_id, country_code, region, status, reason_type")
            .eq("esc_id", escId)
            .single();
            
          return data;
        })
      );
      
      // Filter out nulls
      const validStatuses = latestStatuses.filter(Boolean);
      console.log("Latest statuses:", validStatuses);
      
      // Calculate statistics
      const total = validStatuses.length;
      const pending = validStatuses.filter(
        status => ["OPEN", "ALIGNED"].includes(status?.status)
      ).length;
      const resolved = validStatuses.filter(
        status => ["RESOLVED"].includes(status?.status)
      ).length;
      
      setStats({
        totalEscalations: total,
        pendingEscalations: pending,
        resolvedEscalations: resolved,
      });
      
      // Enrich the data with product and market names
      let enrichedData = (historyData || []).map((item) => {
        const escalation = item.escalation;
        if (!escalation) return null;
        
        // Determine market name based on scope level
        let marketName = 'Unknown';
        if (escalation.scope_level === 'CITY' && escalation.city_id) {
          marketName = escalation.city_id;
        } else if (escalation.scope_level === 'COUNTRY' && escalation.country_code) {
          marketName = escalation.country_code;
        } else if (escalation.scope_level === 'REGION' && escalation.region) {
          marketName = escalation.region;
        }
        
        return {
          ...item,
          // Convert database statuses to application statuses
          old_status: item.old_status ? mapDatabaseStatusToAppStatus(item.old_status) : null,
          new_status: mapDatabaseStatusToAppStatus(item.new_status),
          product_name: escalation.product_id || 'Unknown product',
          market_name: marketName,
          impact_type: escalation.reason_type,
        } as EscalationHistoryItem;
      }).filter(Boolean) as EscalationHistoryItem[];
      
      // Add a mock escalation history item if there's no data
      if (enrichedData.length === 0) {
        const mockItems = generateMockEscalationItems();
        enrichedData = [...mockItems, ...enrichedData];
        
        // Update statistics to reflect the mock data
        setStats({
          totalEscalations: mockItems.length,
          pendingEscalations: mockItems.filter(item => 
            item.new_status === 'SUBMITTED' || item.new_status === 'IN_DISCUSSION'
          ).length,
          resolvedEscalations: mockItems.filter(item => 
            item.new_status.startsWith('RESOLVED_')
          ).length,
        });
      }
      
      console.log("Enriched history data:", enrichedData);
      setHistoryItems(enrichedData);
    } catch (error) {
      console.error("Error fetching escalation history:", error);
      toast({
        title: "Error",
        description: "Failed to load escalation history.",
        variant: "destructive",
      });
      
      // Even if there's an error, add mock data so the user can see how it works
      const mockItems = generateMockEscalationItems();
      setHistoryItems(mockItems);
      
      // Update statistics to reflect the mock data
      setStats({
        totalEscalations: mockItems.length,
        pendingEscalations: mockItems.filter(item => 
          item.new_status === 'SUBMITTED' || item.new_status === 'IN_DISCUSSION'
        ).length,
        resolvedEscalations: mockItems.filter(item => 
          item.new_status.startsWith('RESOLVED_')
        ).length,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate mock escalation history items
  const generateMockEscalationItems = (): EscalationHistoryItem[] => {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return [
      {
        id: 'mock-1',
        escalation_id: 'esc-12345',
        user_id: 'John Doe',
        old_status: null,
        new_status: 'SUBMITTED',
        notes: 'Market is blocked due to regulatory restrictions, but we have the needed approvals',
        changed_at: now.toISOString(),
        product_name: 'UberEats',
        market_name: 'San Francisco',
        impact_type: 'Regulatory'
      },
      {
        id: 'mock-2',
        escalation_id: 'esc-12345',
        user_id: 'Jane Smith',
        old_status: 'SUBMITTED',
        new_status: 'IN_DISCUSSION',
        notes: 'Legal team reviewing documentation',
        changed_at: hourAgo.toISOString(),
        product_name: 'UberEats',
        market_name: 'San Francisco',
        impact_type: 'Regulatory'
      },
      {
        id: 'mock-3',
        escalation_id: 'esc-67890',
        user_id: 'Mike Johnson',
        old_status: null,
        new_status: 'SUBMITTED',
        notes: 'Market is ready for launch but blocked by technical integration',
        changed_at: dayAgo.toISOString(),
        product_name: 'UberX',
        market_name: 'Chicago',
        impact_type: 'Technical'
      },
      {
        id: 'mock-4',
        escalation_id: 'esc-67890',
        user_id: 'Sarah Williams',
        old_status: 'SUBMITTED',
        new_status: 'RESOLVED_LAUNCHED',
        notes: 'Technical issue resolved, escalation approved',
        changed_at: hourAgo.toISOString(),
        product_name: 'UberX',
        market_name: 'Chicago',
        impact_type: 'Technical'
      },
      {
        id: 'mock-5',
        escalation_id: 'esc-24680',
        user_id: 'Alex Davis',
        old_status: null,
        new_status: 'SUBMITTED',
        notes: 'Operational readiness confirmed but partner integration pending',
        changed_at: weekAgo.toISOString(),
        product_name: 'Uber Reserve',
        market_name: 'Tokyo',
        impact_type: 'Operational'
      },
      {
        id: 'mock-6',
        escalation_id: 'esc-24680',
        user_id: 'Chris Miller',
        old_status: 'SUBMITTED',
        new_status: 'RESOLVED_BLOCKED',
        notes: 'Partner integration delays unresolved, marking as blocked',
        changed_at: dayAgo.toISOString(),
        product_name: 'Uber Reserve',
        market_name: 'Tokyo',
        impact_type: 'Operational'
      }
    ];
  };
  
  const applyFilters = () => {
    let filtered = [...historyItems];
    
    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(item => item.new_status === filters.status);
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        item => 
          (item.product_name?.toLowerCase().includes(searchTerm)) ||
          (item.market_name?.toLowerCase().includes(searchTerm)) ||
          (item.notes?.toLowerCase().includes(searchTerm))
      );
    }
    
    setFilteredItems(filtered);
  };

  const getStatusIcon = (status: EscalationStatus | null) => {
    switch (status) {
      case 'SUBMITTED':
        return <Shield className="h-4 w-4 text-[var(--uber-yellow)]" />;
      case 'IN_DISCUSSION':
        return <MessageSquare className="h-4 w-4 text-[var(--uber-gray-60)]" />;
      case 'RESOLVED_BLOCKED':
        return <ShieldAlert className="h-4 w-4 text-[var(--uber-red)]" />;
      case 'RESOLVED_LAUNCHING':
        return <ShieldQuestion className="h-4 w-4 text-[var(--uber-gray-60)]" />;
      case 'RESOLVED_LAUNCHED':
        return <ShieldCheck className="h-4 w-4 text-[var(--uber-green)]" />;
      default:
        return <ShieldOff className="h-4 w-4 text-[var(--uber-gray-30)]" />;
    }
  };

  const getStatusBadgeClass = (status: EscalationStatus | null) => {
    switch (status) {
      case 'SUBMITTED':
        return "bg-[var(--uber-yellow)] text-black";
      case 'IN_DISCUSSION':
        return "bg-[var(--uber-gray-60)] text-white";
      case 'RESOLVED_BLOCKED':
        return "bg-[var(--uber-red)] text-white";
      case 'RESOLVED_LAUNCHING':
        return "bg-[var(--uber-gray-30)] text-black";
      case 'RESOLVED_LAUNCHED':
        return "bg-[var(--uber-green)] text-black";
      default:
        return "bg-[var(--uber-gray-10)] text-black";
    }
  };

  const formatStatusLabel = (status: string | null) => {
    if (!status) return "None";
    
    return status
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const handleEscalationClick = (escalationId: string) => {
    navigate(`/escalations/${escalationId}`);
  };

  // Show escalation detail page if an ID is selected
  if (selectedEscalationId) {
    return <EscalationDetail />;
  }

  const renderMobileCard = (item: EscalationHistoryItem) => (
    <Card 
      key={item.id} 
      className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleEscalationClick(item.escalation_id)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-1">
          <CardTitle className="text-sm font-medium">
            {item.product_name} - {item.market_name}
          </CardTitle>
          <div>
            <Badge className={`capitalize text-xs ${getStatusBadgeClass(item.new_status)}`}>
              {formatStatusLabel(item.new_status)}
            </Badge>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {format(new Date(item.changed_at), "MMM d, yyyy h:mm a")}
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center">
            {getStatusIcon(item.old_status)}
            {item.old_status && (
              <span className="ml-1 text-xs">
                {formatStatusLabel(item.old_status)}
              </span>
            )}
          </div>
          <span className="text-[var(--uber-gray-30)]">→</span>
          <div className="flex items-center">
            {getStatusIcon(item.new_status)}
            <span className="ml-1 text-xs">{formatStatusLabel(item.new_status)}</span>
          </div>
        </div>
        {item.notes && (
          <p className="text-xs truncate" title={item.notes}>
            {item.notes}
          </p>
        )}
        <div className="mt-2 flex justify-between items-center">
          <span className="text-xs font-mono text-muted-foreground">
            {typeof item.user_id === 'string' ? 
              item.user_id.substring(0, 8) : 
              'Unknown'}
          </span>
          {item.impact_type && (
            <Badge variant="outline" className="text-xs">
              {item.impact_type}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Escalation Log</h1>
        <p className="text-[var(--uber-gray-60)]">
          History of all escalation status changes and their justifications.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-[var(--uber-gray-60)] mb-1">Total Escalations</div>
          <div className="text-2xl font-bold">{stats.totalEscalations}</div>
        </div>
        
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-[var(--uber-gray-60)] mb-1">Pending Resolution</div>
          <div className="text-2xl font-bold">{stats.pendingEscalations}</div>
        </div>
        
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-[var(--uber-gray-60)] mb-1">Resolved</div>
          <div className="text-2xl font-bold">{stats.resolvedEscalations}</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 border rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/4">
            <label className="block text-sm mb-1 text-[var(--uber-gray-60)]">Filter by Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
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
          
          <div className="flex-1">
            <label className="block text-sm mb-1 text-[var(--uber-gray-60)]">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--uber-gray-60)]" />
              <Input
                className="pl-8"
                placeholder="Search products, markets, or comments..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <Button variant="outline" onClick={() => setFilters({ status: "all", search: "" })}>
              Reset
            </Button>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-[var(--uber-gray-60)]">
          {filteredItems.length} items {filters.status !== "all" || filters.search ? "(filtered)" : ""}
        </div>
        
        <Button onClick={() => fetchEscalationHistory()}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Mobile card view or desktop table */}
      {isMobile ? (
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-10">
              Loading escalation history...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-10">
              No escalation history found.
            </div>
          ) : (
            filteredItems.map(renderMobileCard)
          )}
        </div>
      ) : (
        <div className="border rounded-lg bg-white">
          <Table className="table-striped">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Date & Time</TableHead>
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Market</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Status Change</TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Loading escalation history...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No escalation history found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="cursor-pointer hover:bg-[var(--uber-gray-10)]"
                    onClick={() => handleEscalationClick(item.escalation_id)}
                  >
                    <TableCell>{format(new Date(item.changed_at), "MMM d, yyyy h:mm a")}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.market_name}</TableCell>
                    <TableCell>
                      {item.impact_type ? (
                        <Badge variant="outline" className="text-xs">
                          {item.impact_type}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {getStatusIcon(item.old_status)}
                          {item.old_status && (
                            <span className="ml-1 text-xs">
                              {formatStatusLabel(item.old_status)}
                            </span>
                          )}
                        </div>
                        <span className="text-[var(--uber-gray-30)]">→</span>
                        <div className="flex items-center">
                          {getStatusIcon(item.new_status)}
                          <span className="ml-1">
                            <Badge variant="outline" className={`capitalize text-xs ${getStatusBadgeClass(item.new_status)}`}>
                              {formatStatusLabel(item.new_status)}
                            </Badge>
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono">
                        {typeof item.user_id === 'string' ? 
                          item.user_id.substring(0, 8) : 
                          'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.notes || ""}>
                      {item.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EscalationLog;
