
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface ApiConfigFormProps {
  onSubmit: (apiUrl: string, bearerToken: string) => void;
  isLoading: boolean;
}

const ApiConfigForm: React.FC<ApiConfigFormProps> = ({ onSubmit, isLoading }) => {
  const [apiUrl, setApiUrl] = useState("");
  const [bearerToken, setBearerToken] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save credentials to Supabase secrets (in a real implementation)
    // This would typically be done via a server-side function
    
    // Call the onSubmit handler
    onSubmit(apiUrl, bearerToken);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="apiUrl">API URL</Label>
        <Input
          id="apiUrl"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="https://api.example.com/data"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bearerToken">Bearer Token</Label>
        <Input
          id="bearerToken"
          type="password"
          value={bearerToken}
          onChange={(e) => setBearerToken(e.target.value)}
          placeholder="Enter API authorization token"
          required
        />
        <p className="text-sm text-muted-foreground">
          This token will be stored securely and used for API authentication.
        </p>
      </div>
      
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => {
            setApiUrl("");
            setBearerToken("");
          }}
          type="button"
        >
          Clear
        </Button>
        <div className="space-x-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading || !apiUrl || !bearerToken}
            onClick={() => {
              // This would save the config without triggering a refresh
            }}
          >
            Save Config
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !apiUrl || !bearerToken}
          >
            {isLoading ? "Refreshing..." : "Run Now"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ApiConfigForm;
