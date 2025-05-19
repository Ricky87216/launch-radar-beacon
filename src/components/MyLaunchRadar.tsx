
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { useProductCard } from "@/hooks/use-product-card";
import { useToast } from "@/components/ui/use-toast";
import PreferencesModal from "./PreferencesModal";

import { LoadingSpinner } from "./launch-radar/LoadingSpinner";
import { SetupInstructions } from "./launch-radar/SetupInstructions";
import { DemoBanner } from "./launch-radar/DemoBanner";
import { UserPreferencesSummary } from "./launch-radar/UserPreferencesSummary";
import { ProductGrid } from "./launch-radar/ProductGrid";
import { LaunchRadarHeader } from "./launch-radar/LaunchRadarHeader";
import { useDemoData } from "./launch-radar/useDemoData";
import { useUserPreferences } from "./launch-radar/useUserPreferences";

export default function MyLaunchRadar() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    user, 
    getProductById, 
    getMarketById,
    getAllMarkets,
    blockers
  } = useDashboard();
  const { openProductCard } = useProductCard();
  
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  // Set to true to show example personalized view
  const [showDemoView, setShowDemoView] = useState(true);

  // Effect to check if user is authenticated
  useEffect(() => {
    if (!user.id) {
      navigate('/');
    }
  }, [user.id, navigate]);

  // Get demo data
  const demoData = useDemoData();
  
  // Get real user preferences and blockers
  const userData = useUserPreferences(
    user.id,
    showDemoView,
    getAllMarkets,
    blockers,
    getProductById
  );

  // Use either demo or real data based on the showDemoView flag
  const loading = showDemoView ? demoData.loading : userData.loading;
  const userPrefs = showDemoView ? demoData.userPrefs : userData.userPrefs;
  const productBlockers = showDemoView ? demoData.productBlockers : userData.productBlockers;
  const showInstructions = showDemoView ? false : userData.showInstructions;

  // Toggle between demo view and real view
  const toggleDemoView = () => {
    setShowDemoView(prev => !prev);
  };

  // Function to handle navigation to escalation
  const viewEscalation = (escalationId: string) => {
    navigate(`/escalations/${escalationId}`);
  };

  // Function to navigate to personalized dashboard
  const viewPersonalizedDashboard = () => {
    if (!userPrefs || (!userPrefs.regions.length && !userPrefs.countries.length)) {
      toast({
        title: "No preferences set",
        description: "Please set your preferences first",
      });
      return;
    }
    
    // Navigate to dashboard with filter params
    const params = new URLSearchParams();
    if (userPrefs.regions.length) {
      params.append('regions', userPrefs.regions.join(','));
    }
    if (userPrefs.countries.length) {
      params.append('countries', userPrefs.countries.join(','));
    }
    navigate(`/?${params.toString()}&personalView=true`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Show instructions when user has no preferences set and we're not showing the demo
  if (showInstructions && !showDemoView) {
    return (
      <SetupInstructions 
        onOpenPreferences={() => setPreferencesModalOpen(true)}
        toggleDemoView={toggleDemoView}
      />
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <LaunchRadarHeader
        showDemoView={showDemoView}
        toggleDemoView={toggleDemoView}
        showInstructions={showInstructions}
        openPreferencesModal={() => setPreferencesModalOpen(true)}
        viewPersonalizedDashboard={viewPersonalizedDashboard}
      />

      {/* Demo banner when in demo mode */}
      {showDemoView && <DemoBanner />}

      {/* User preferences summary */}
      {userPrefs && (
        <UserPreferencesSummary 
          userPrefs={userPrefs} 
          getMarketById={getMarketById} 
        />
      )}

      {/* Product cards */}
      <ProductGrid 
        productBlockers={productBlockers}
        getMarketById={getMarketById}
        openProductCard={openProductCard}
        viewEscalation={viewEscalation}
      />

      {/* Preferences modal */}
      <PreferencesModal 
        open={preferencesModalOpen} 
        onClose={() => setPreferencesModalOpen(false)} 
      />
    </div>
  );
}
