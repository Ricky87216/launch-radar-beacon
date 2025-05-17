
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import CsvUploader from "@/components/admin/CsvUploader";
import ApiConfigForm from "@/components/admin/ApiConfigForm";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { runDataGeneration } from "@/utils/dataSeedUtils";
import { Database } from "lucide-react";
import { toast } from "sonner";

const DataSync = () => {
  const { toast: uiToast } = useToast();
  const [activeTab, setActiveTab] = useState("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [isSeedingData, setIsSeedingData] = useState(false);

  const handleCsvUpload = async (file: File, fileType: 'coverage_fact' | 'blocker') => {
    try {
      setIsLoading(true);
      
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      
      // Todo: Implement file upload endpoint
      uiToast({
        title: "Success!",
        description: "File uploaded successfully. Processing data...",
      });
      
      // Mock successful upload for now
      setTimeout(() => {
        uiToast({
          title: "Data processed",
          description: `Rows processed: 150 (new: 120, updated: 30)`,
        });
        setIsLoading(false);
      }, 2000);

    } catch (error) {
      console.error("Error uploading file:", error);
      uiToast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleApiRefresh = async (apiUrl: string, bearerToken: string) => {
    try {
      setIsLoading(true);
      
      // Todo: Implement API refresh functionality
      uiToast({
        title: "API Refresh Initiated",
        description: "Fetching data from the API...",
      });
      
      // Mock successful API refresh
      setTimeout(() => {
        uiToast({
          title: "Data Refreshed",
          description: `Rows processed: 250 (new: 180, updated: 70)`,
        });
        setIsLoading(false);
      }, 3000);

    } catch (error) {
      console.error("Error refreshing API data:", error);
      uiToast({
        title: "Error",
        description: "Failed to refresh data from API. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const handleGenerateMockData = async () => {
    try {
      setIsSeedingData(true);
      await runDataGeneration();
    } catch (error) {
      console.error("Error generating mock data:", error);
      toast.error("Failed to generate mock data");
    } finally {
      setIsSeedingData(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Sync Center</h1>
        <p className="text-muted-foreground">Upload or refresh product coverage and blocker data</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Mock Data Generation
          </CardTitle>
          <CardDescription>
            Generate realistic mock data for testing and development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will generate mock data for all key tables including markets, products, coverage, and blockers.
              It will create approximately:
            </p>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>300 market entries (15 countries × 5 cities × 4 regions)</li>
              <li>At least 15 product entries</li>
              <li>Coverage data for all city-product pairs</li>
              <li>At least 15 blocker entries</li>
            </ul>
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerateMockData} 
                disabled={isSeedingData}
              >
                {isSeedingData ? "Generating..." : "Generate Mock Data"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Import Options</CardTitle>
          <CardDescription>Choose how you want to update your data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              <TabsTrigger value="api">API Refresh</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-6">
              <CsvUploader onUpload={handleCsvUpload} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="api" className="mt-6">
              <ApiConfigForm onSubmit={handleApiRefresh} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSync;
