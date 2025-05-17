
import React, { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { loadEscalationHistory } from "@/utils/escalationUtils";
import { Market, marketDimToMarket } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  marketType: 'city' | 'country' | 'region' | 'state';
}

const EscalationModal: React.FC<EscalationModalProps> = ({
  isOpen,
  onClose,
  productId,
  marketId,
  marketType,
}) => {
  const { getProductById, getMarketById, user } = useDashboard();
  const [activeTab, setActiveTab] = useState("create");
  const [history, setHistory] = useState<any[]>([]);
  
  const product = getProductById(productId);
  // Convert MarketDim to Market if needed
  const marketDim = getMarketById(marketId);
  const market: Market = marketDim ? marketDimToMarket(marketDim) : {
    id: marketId,
    name: "Unknown Market",
    type: marketType as any,
    parent_id: null,
    geo_path: ""
  };
  
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            <span>Escalate Blocked Status</span>
          </DialogTitle>
          <DialogDescription>
            Request an escalation to count this blocked market as launched.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
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
              onClose={onClose}
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
      </DialogContent>
    </Dialog>
  );
};

export default EscalationModal;
