
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Globe, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SetupInstructionsProps {
  onOpenPreferences: () => void;
  toggleDemoView: () => void;
}

export function SetupInstructions({ onOpenPreferences, toggleDemoView }: SetupInstructionsProps) {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
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
          <Button
            variant="outline"
            onClick={toggleDemoView}
          >
            View Demo
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

      <Card className="shadow-md mb-6">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="bg-yellow-100 rounded-full p-4 inline-block mb-4">
              <Settings className="h-10 w-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Set Up Your Personalized Coverage View</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Your personalized coverage dashboard helps you track launch blockers 
              for regions and countries you care about most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Step 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Select the specific regions and countries you want to monitor for launch blockers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Step 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Save your preferences to create your personalized view</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Step 3</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Return here anytime to see blockers affecting your selected markets</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={onOpenPreferences}
              className="flex items-center"
            >
              <Settings className="mr-2 h-4 w-4" />
              Set Up My Coverage Preferences
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <AlertTitle>Pro Tip</AlertTitle>
        <AlertDescription>
          You can update your preferences anytime by clicking on the "Edit Preferences" button that will appear after setup.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Missing import
import { Star } from "lucide-react";
