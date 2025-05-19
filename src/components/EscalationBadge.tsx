
import { Shield, ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { checkEscalationStatus } from "@/services/ProductService";
import { EscalationStatus } from "@/types";

interface EscalationBadgeProps {
  productId?: string;
  marketId?: string;
  marketType?: 'city' | 'country' | 'region';
  status?: EscalationStatus;
  onClick?: () => void;
  className?: string;
}

const EscalationBadge: React.FC<EscalationBadgeProps> = ({
  productId,
  marketId,
  marketType,
  status: providedStatus,
  onClick,
  className = ""
}) => {
  const [escalationStatus, setEscalationStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // If a status is directly provided, use it instead of fetching
    if (providedStatus) {
      setEscalationStatus(providedStatus);
      setIsLoading(false);
      return;
    }
    
    // Only fetch if we have the necessary props
    if (!productId || !marketId || !marketType) {
      setIsLoading(false);
      return;
    }
    
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
        setEscalationStatus(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, [productId, marketId, marketType, providedStatus]);
  
  if (isLoading || !escalationStatus) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex ${className}`} onClick={handleClick}>
            {escalationStatus === 'SUBMITTED' || escalationStatus === 'IN_DISCUSSION' || 
             escalationStatus === 'IN_REVIEW' || escalationStatus === 'ALIGNED' || 
             escalationStatus === 'ESCALATED_TO_LEGAL' || escalationStatus === 'RESOLVED_BLOCKED' ||
             escalationStatus === 'RESOLVED_LAUNCHING' ? (
              <Shield className="h-4 w-4 text-amber-500 ml-1" />
            ) : escalationStatus.startsWith('RESOLVED_') ? (
              <ShieldCheck className="h-4 w-4 text-green-500 ml-1" />
            ) : null}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {escalationStatus === 'SUBMITTED' || escalationStatus === 'IN_DISCUSSION' || 
           escalationStatus === 'IN_REVIEW' || escalationStatus === 'ALIGNED' || 
           escalationStatus === 'ESCALATED_TO_LEGAL' || escalationStatus === 'RESOLVED_BLOCKED' ||
           escalationStatus === 'RESOLVED_LAUNCHING' 
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
