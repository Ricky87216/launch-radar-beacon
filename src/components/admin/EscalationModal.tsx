
import React, { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { loadEscalationHistory } from "@/utils/escalationUtils";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import EscalationForm from "./EscalationForm";
import EscalationHistory from "./EscalationHistory";

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  marketId: string;
  marketType: 'city' | 'country' | 'region';
}

const EscalationModal: React.FC<EscalationModalProps> = ({
  isOpen,
  onClose,
  productId,
  marketId,
  marketType,
}) => {
  const navigate = useNavigate();
  const { getProductById, getMarketById, user } = useDashboard();
  const [activeTab, setActiveTab] = useState("create");
  const [history, setHistory] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const isMobile = useIsMobile();
  
  const product = getProductById(productId);
  const market = getMarketById(marketId);
  
  // Load history data when modal opens and tab is history
  useEffect(() => {
    if (isOpen && activeTab === "history") {
      const fetchHistory = async () => {
        const historyData = await loadEscalationHistory(productId, marketId, marketType);
        setHistory(historyData);
      };
      fetchHistory();
    }
  }, [isOpen, activeTab, productId, marketId, marketType]);
  
  const handleFormSuccess = () => {
    console.log("Form submission successful, showing success state");
    setShowSuccess(true);
    
    // Automatically navigate to escalation log after a short delay
    setTimeout(() => {
      console.log("Redirecting to escalation log");
      onClose();
      navigate("/escalations");
    }, 1500);
  };
  
  if (showSuccess) {
    return (
      <ResponsiveDialog
        open={isOpen}
        onOpenChange={onClose}
        title={
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            <span>Escalation Submitted</span>
          </div>
        }
        description="Your escalation has been submitted successfully."
      >
        <div className="flex flex-col items-center justify-center py-6">
          <p className="mb-4 text-center">
            Redirecting to the Escalation Log...
          </p>
          <Button onClick={() => {
            onClose();
            navigate("/escalations");
          }}>
            View Escalation Log Now
          </Button>
        </div>
      </ResponsiveDialog>
    );
  }
  
  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={onClose}
      title={
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-500" />
          <span>Escalate Blocked Status</span>
        </div>
      }
      description="Request an escalation to count this blocked market as launched."
      className={isMobile ? "p-0 pt-6" : "sm:max-w-[600px]"}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`w-full ${isMobile ? "sticky top-0 z-10 bg-background" : ""}`}>
          <TabsTrigger value="create" className="flex-1">Escalate</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4 pt-4">
          <EscalationForm 
            productId={productId}
            marketId={marketId}
            marketType={marketType}
            product={product}
            market={market}
            onClose={handleFormSuccess}
            userName={user?.name || "Unknown user"}
          />
        </TabsContent>
        
        <TabsContent value="history" className="pt-4">
          <EscalationHistory history={history} />
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </ResponsiveDialog>
  );
};

export default EscalationModal;
