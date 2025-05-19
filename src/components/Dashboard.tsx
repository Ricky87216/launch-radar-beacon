
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDashboard } from "../context/DashboardContext";
import HeatmapGrid from "./HeatmapGrid";
import BlockerModal from "./BlockerModal";
import EscalationModal from "./admin/EscalationModal";
import Sidebar from "./Sidebar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Star } from "lucide-react";
import { OnboardingCallout } from "./OnboardingCallout";

export default function Dashboard() {
  const [blockerModalOpen, setBlockerModalOpen] = useState(false);
  const [selectedBlockerId, setSelectedBlockerId] = useState<string | undefined>(undefined);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [selectedMarketId, setSelectedMarketId] = useState<string | undefined>(undefined);
  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const { getAllMarkets } = useDashboard();
  
  // Handle URL parameters for personalized filters
  const [personalizedFilters, setPersonalizedFilters] = useState<{
    regions: string[],
    countries: string[],
    isPersonalView: boolean
  }>({
    regions: [],
    countries: [],
    isPersonalView: false
  });
  
  useEffect(() => {
    // Check for personalized filter params in URL
    const regionsParam = searchParams.get('regions');
    const countriesParam = searchParams.get('countries');
    const isPersonalView = searchParams.get('personalView') === 'true';
    
    if ((regionsParam || countriesParam) && isPersonalView) {
      setPersonalizedFilters({
        regions: regionsParam ? regionsParam.split(',') : [],
        countries: countriesParam ? countriesParam.split(',') : [],
        isPersonalView
      });
    } else {
      setPersonalizedFilters({
        regions: [],
        countries: [],
        isPersonalView: false
      });
    }
  }, [searchParams]);
  
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

  // Map market IDs to names for the alert
  const getMarketNames = () => {
    const allMarkets = getAllMarkets();
    const regionNames = personalizedFilters.regions
      .map(id => allMarkets.find(m => m.id === id)?.name || id);
    const countryNames = personalizedFilters.countries
      .map(id => allMarkets.find(m => m.id === id)?.name || id);
    
    return [...regionNames, ...countryNames];
  };
  
  return (
    <div className={`flex h-full ${isMobile ? 'pb-16' : ''}`}>
      <Sidebar personalFilters={personalizedFilters} />
      <main className="flex-1 overflow-hidden">
        <OnboardingCallout />
        {personalizedFilters.isPersonalView && (
          <Alert className="mb-2 mx-4 mt-4 bg-blue-50 border-blue-200">
            <AlertTitle className="flex items-center">
              <Star className="mr-2 h-4 w-4 text-blue-500" />
              Personalized View
            </AlertTitle>
            <AlertDescription>
              Showing filtered dashboard for: {getMarketNames().join(', ')}
            </AlertDescription>
          </Alert>
        )}
        <HeatmapGrid 
          onEscalate={openEscalationModal} 
          onShowBlocker={openBlockerModal}
          personalFilters={personalizedFilters}
        />
      </main>
      
      {blockerModalOpen && selectedProductId && selectedMarketId && (
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
