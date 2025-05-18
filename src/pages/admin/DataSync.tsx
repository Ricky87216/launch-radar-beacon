
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import CsvUploader from "@/components/admin/CsvUploader";
import ApiConfigForm from "@/components/admin/ApiConfigForm";
import { supabase } from "@/integrations/supabase/client";

const DataSync = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upload");
  const [isLoading, setIsLoading] = useState(false);

  const handleCsvUpload = async (file: File, fileType: 'coverage_fact' | 'blocker') => {
    try {
      setIsLoading(true);
      
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      
      // Todo: Implement file upload endpoint
      toast({
        title: "Success!",
        description: "File uploaded successfully. Processing data...",
      });
      
      // Mock successful upload for now
      setTimeout(() => {
        toast({
          title: "Data processed",
          description: `Rows processed: 150 (new: 120, updated: 30)`,
        });
        setIsLoading(false);
      }, 2000);

    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
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
      toast({
        title: "API Refresh Initiated",
        description: "Fetching data from the API...",
      });
      
      // Mock successful API refresh
      setTimeout(() => {
        toast({
          title: "Data Refreshed",
          description: `Rows processed: 250 (new: 180, updated: 70)`,
        });
        setIsLoading(false);
      }, 3000);

    } catch (error) {
      console.error("Error refreshing API data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data from API. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Sync Center</h1>
        <p className="text-muted-foreground">Upload or refresh product coverage and blocker data</p>
      </div>
      
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
