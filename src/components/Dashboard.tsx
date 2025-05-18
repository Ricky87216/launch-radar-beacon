
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDashboard } from "../context/DashboardContext";
import HeatmapGrid from "./HeatmapGrid";
import BlockerModal from "./BlockerModal";
import EscalationModal from "./admin/EscalationModal";

export default function Dashboard() {
  const [blockerModalOpen, setBlockerModalOpen] = useState(false);
  const [selectedBlockerId, setSelectedBlockerId] = useState<string | undefined>(undefined);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [selectedMarketId, setSelectedMarketId] = useState<string | undefined>(undefined);
  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const openBlockerModal = (productId: string, marketId: string, blockerId?: string) => {
    setSelectedProductId(productId);
    setSelectedMarketId(marketId);
    setSelectedBlockerId(blockerId);
    setBlockerModalOpen(true);
  };
  
  const closeBlockerModal = () => {
    setBlockerModalOpen(false);
    setSelectedBlockerId(undefined);
    setSelectedProductId(undefined);
    setSelectedMarketId(undefined);
  };
  
  const openEscalationModal = (productId: string, marketId: string) => {
    setSelectedProductId(productId);
    setSelectedMarketId(marketId);
    setEscalationModalOpen(true);
  };
  
  const closeEscalationModal = () => {
    setEscalationModalOpen(false);
    setSelectedProductId(undefined);
    setSelectedMarketId(undefined);
  };
  
  return (
    <div className={`flex flex-col h-full ${isMobile ? 'pb-16' : ''}`}>
      <main className="flex-1 overflow-hidden">
        <HeatmapGrid 
          onEscalate={openEscalationModal} 
          onShowBlocker={openBlockerModal} 
        />
      </main>
      
      {blockerModalOpen && (
        <BlockerModal
          open={blockerModalOpen}
          onClose={closeBlockerModal}
          blockerId={selectedBlockerId}
          productId={selectedProductId}
          marketId={selectedMarketId}
          onEscalate={selectedProductId && selectedMarketId ? () => {
            closeBlockerModal();
            openEscalationModal(selectedProductId, selectedMarketId);
          } : undefined}
        />
      )}
      
      {escalationModalOpen && selectedProductId && selectedMarketId && (
        <EscalationModal
          isOpen={escalationModalOpen}
          onClose={closeEscalationModal}
          productId={selectedProductId}
          marketId={selectedMarketId}
          marketType="city"
        />
      )}
    </div>
  );
}
