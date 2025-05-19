
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Star } from "lucide-react";

export function DemoBanner() {
  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <AlertTitle className="flex items-center">
        <Star className="mr-2 h-4 w-4 text-blue-500" />
        Demo Mode
      </AlertTitle>
      <AlertDescription>
        This is a demo of the personalized coverage view. It shows how your dashboard will look after setting preferences 
        for EMEA region plus UK and Germany markets.
      </AlertDescription>
    </Alert>
  );
}
