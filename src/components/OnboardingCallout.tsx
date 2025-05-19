
import { useState, useEffect } from "react";
import { BookOpen, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function OnboardingCallout() {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [hasSeenCallout, setHasSeenCallout] = useState<boolean>(false);

  // Check localStorage on component mount
  useEffect(() => {
    const seen = localStorage.getItem("uber-dashboard-callout-seen");
    if (seen === "true") {
      setHasSeenCallout(true);
      setIsVisible(false);
    }
  }, []);

  const dismissCallout = () => {
    setIsVisible(false);
    // Store the preference in localStorage
    localStorage.setItem("uber-dashboard-callout-seen", "true");
    setHasSeenCallout(true);
  };

  if (hasSeenCallout || !isVisible) {
    return null;
  }

  return (
    <Alert className="mb-4 mx-4 bg-blue-50 border-blue-200 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <span className="font-medium">New to the dashboard?</span> Check out our{" "}
            <Link to="/howto" className="text-blue-700 underline hover:text-blue-900 font-medium">
              how-to guide
            </Link>{" "}
            to get started with Uber's Launch Radar.
          </AlertDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 h-auto text-gray-500 hover:text-gray-700 hover:bg-transparent focus:ring-0"
          onClick={dismissCallout}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
