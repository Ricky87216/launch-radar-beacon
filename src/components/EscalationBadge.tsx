
import { Shield, ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { checkEscalationStatus } from "@/services/ProductService";

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
  const [escalationStatus, setEscalationStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await checkEscalationStatus(productId, marketId, marketType);
        if (result.exists) {
          setEscalationStatus(result.status);
        } else {
          setEscalationStatus(null);
        }
      } catch (error) {
        console.error("Error checking escalation status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStatus();
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
