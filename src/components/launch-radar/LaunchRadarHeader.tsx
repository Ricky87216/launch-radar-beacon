
import { Button } from "@/components/ui/button";
import { Globe, Settings, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LaunchRadarHeaderProps {
  showDemoView: boolean;
  toggleDemoView: () => void;
  showInstructions: boolean;
  openPreferencesModal: () => void;
  viewPersonalizedDashboard: () => void;
}

export function LaunchRadarHeader({
  showDemoView,
  toggleDemoView,
  showInstructions,
  openPreferencesModal,
  viewPersonalizedDashboard
}: LaunchRadarHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <Star className="mr-2 h-6 w-6 text-yellow-500" />
          My Coverage
        </h1>
        <p className="text-muted-foreground">
          Personalized view of products with blockers in your regions and countries
        </p>
      </div>
      <div className="flex space-x-2">
        {!showDemoView && (
          <Button 
            variant="outline" 
            onClick={openPreferencesModal}
            className="flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            Edit Preferences
          </Button>
        )}
        {showInstructions && (
          <Button
            variant="outline"
            onClick={toggleDemoView}
          >
            {showDemoView ? "Hide Demo" : "View Demo"}
          </Button>
        )}
        {/* Button for personalized dashboard */}
        <Button 
          variant="outline"
          onClick={viewPersonalizedDashboard}
          className="flex items-center"
        >
          <Star className="mr-2 h-4 w-4" />
          Filtered Dashboard
        </Button>
        <Button 
          onClick={() => navigate('/')}
          className="flex items-center"
        >
          <Globe className="mr-2 h-4 w-4" />
          Global View
        </Button>
      </div>
    </div>
  );
}
