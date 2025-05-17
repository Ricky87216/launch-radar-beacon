
import { Shield, ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EscalationStatus } from "@/types";

interface EscalationBadgeProps {
  productId: string;
  marketId: string;
  marketType: 'city' | 'country' | 'region';
}

const EscalationBadge: React.FC<EscalationBadgeProps> = ({
  productId,
  marketId,
  marketType,
}) => {
  const [escalationStatus, setEscalationStatus] = useState<EscalationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkEscalationStatus = async () => {
      try {
        let query = supabase
          .from("escalation")
          .select("status")
          .eq("product_id", productId);
          
        // Apply the correct filter based on market type
        if (marketType === 'city') {
          query = query.eq("city_id", marketId);
        } else if (marketType === 'country') {
          query = query.eq("country_code", marketId);
        } else if (marketType === 'region') {
          query = query.eq("region", marketId);
        }
        
        // Convert marketType to uppercase to match the enum in the database
        const scopeLevel = marketType.toUpperCase() as "CITY" | "COUNTRY" | "REGION";
        query = query.eq("scope_level", scopeLevel);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setEscalationStatus(data[0].status);
        }
      } catch (error) {
        console.error("Error checking escalation status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkEscalationStatus();
  }, [productId, marketId, marketType]);
  
  if (isLoading || !escalationStatus) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex">
            {escalationStatus === 'SUBMITTED' || escalationStatus === 'IN_DISCUSSION' ? (
              <Shield className="h-4 w-4 text-amber-500 ml-1" />
            ) : escalationStatus.startsWith('RESOLVED_') ? (
              <ShieldCheck className="h-4 w-4 text-green-500 ml-1" />
            ) : null}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {escalationStatus === 'SUBMITTED' || escalationStatus === 'IN_DISCUSSION'
            ? "Escalation pending approval" 
            : escalationStatus.startsWith('RESOLVED_')
              ? "Counts as launched via escalation" 
              : ""}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EscalationBadge;
