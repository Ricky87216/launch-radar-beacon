
import { useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import HeatmapGrid from "./HeatmapGrid";
import BlockerModal from "./BlockerModal";

export default function Dashboard() {
  const [blockerModalOpen, setBlockerModalOpen] = useState(false);
  const [selectedBlockerId, setSelectedBlockerId] = useState<string | undefined>(undefined);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [selectedMarketId, setSelectedMarketId] = useState<string | undefined>(undefined);
  
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
  
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-hidden">
        <HeatmapGrid />
      </main>
      
      {blockerModalOpen && (
        <BlockerModal
          open={blockerModalOpen}
          onClose={closeBlockerModal}
          blockerId={selectedBlockerId}
          productId={selectedProductId}
          marketId={selectedMarketId}
        />
      )}
    </div>
  );
}
