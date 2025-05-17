
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface EscalationHistoryItem {
  id: string;
  escalation_id: string;
  user_id: string;
  old_status: 'OPEN' | 'ALIGNED' | 'RESOLVED' | null;
  new_status: 'OPEN' | 'ALIGNED' | 'RESOLVED';
  notes: string | null;
  changed_at: string;
  product_name?: string;
  market_name?: string;
}

const EscalationLog = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState<EscalationHistoryItem[]>([]);

  useEffect(() => {
    const fetchEscalationHistory = async () => {
      try {
        setIsLoading(true);
        
        // Get the escalation history
        const { data: historyData, error } = await supabase
          .from("escalation_history")
          .select("*, escalation!inner(*)")
          .order("changed_at", { ascending: false });
          
        if (error) throw error;
        
        // Enrich the data with product and market names
        const enrichedData = (historyData || []).map((item) => {
          const escalation = item.escalation;
          
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
            product_name: escalation.product_id || 'Unknown product',
            market_name: marketName,
          };
        });
        
        setHistoryItems(enrichedData);
      } catch (error) {
        console.error("Error fetching escalation history:", error);
        toast({
          title: "Error",
          description: "Failed to load escalation history.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEscalationHistory();
  }, [toast]);

  const getStatusIcon = (status: 'OPEN' | 'ALIGNED' | 'RESOLVED' | null) => {
    switch (status) {
      case 'OPEN':
        return <Shield className="h-4 w-4 text-amber-500" />;
      case 'ALIGNED':
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case 'RESOLVED':
        return <ShieldOff className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Escalation Log</h1>
        <p className="text-muted-foreground">
          History of all escalation status changes and their justifications.
        </p>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Market</TableHead>
              <TableHead>Status Change</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading escalation history...
                </TableCell>
              </TableRow>
            ) : historyItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No escalation history found.
                </TableCell>
              </TableRow>
            ) : (
              historyItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{format(new Date(item.changed_at), "MMM d, yyyy h:mm a")}</TableCell>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.market_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {getStatusIcon(item.old_status)}
                      </div>
                      <span className="text-muted-foreground">→</span>
                      <div className="flex items-center">
                        {getStatusIcon(item.new_status)}
                        <span className="ml-1">
                          <Badge variant="outline" className="ml-1 capitalize text-xs">
                            {item.new_status.toLowerCase()}
                          </Badge>
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono">
                      {item.user_id.substring(0, 8)}
                    </span>
                  </TableCell>
                  <TableCell>{item.notes || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EscalationLog;
