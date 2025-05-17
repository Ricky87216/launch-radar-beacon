import React, { useState } from "react";
import { Shield, XCircle, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDashboard } from "@/context/DashboardContext";
import { Market, Product, EscalationStatus, mapAppStatusToDatabaseStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  marketId: string;
  marketType: 'city' | 'country' | 'region';
}

const EscalationModal: React.FC<EscalationModalProps> = ({
  isOpen,
  onClose,
  productId,
  marketId,
  marketType,
}) => {
  const { toast } = useToast();
  const { getProductById, getMarketById, user } = useDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [formData, setFormData] = useState({
    poc: "",
    reason: "",
    businessCaseUrl: "",
  });
  const [history, setHistory] = useState<any[]>([]);
  
  const product = getProductById(productId);
  const market = getMarketById(marketId);
  
  // Load history data when modal opens and tab is history
  React.useEffect(() => {
    if (isOpen && activeTab === "history") {
      loadEscalationHistory();
    }
  }, [isOpen, activeTab, productId, marketId]);
  
  const loadEscalationHistory = async () => {
    try {
      // Look for existing escalation first
      const { data: escalations } = await supabase
        .from("escalation")
        .select("esc_id")
        .eq("product_id", productId)
        .eq(getMarketIdField(), marketId)
        .eq("scope_level", getScopeLevel());
      
      if (escalations && escalations.length > 0) {
        const escalationId = escalations[0].esc_id;
        
        // Now get history for this escalation
        const { data: historyData } = await supabase
          .from("escalation_history")
          .select("*")
          .eq("escalation_id", escalationId)
          .order("changed_at", { ascending: false });
        
        if (historyData) {
          setHistory(historyData);
        }
      }
    } catch (error) {
      console.error("Failed to load escalation history:", error);
    }
  };
  
  const getMarketIdField = () => {
    switch (marketType) {
      case 'city':
        return 'city_id';
      case 'country':
        return 'country_code';
      case 'region':
        return 'region';
      default:
        return 'city_id';
    }
  };
  
  const getScopeLevel = (): "CITY" | "COUNTRY" | "REGION" => {
    return marketType.toUpperCase() as "CITY" | "COUNTRY" | "REGION";
  };
  
  const getMarketName = (): string => {
    return market?.name || 'Unknown market';
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.poc.trim() || !formData.reason.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the escalation record
      const appStatus: EscalationStatus = "SUBMITTED";
      const dbStatus = mapAppStatusToDatabaseStatus(appStatus);
      
      const insertData = {
        product_id: productId,
        scope_level: getScopeLevel(),
        ...(marketType === 'city' ? { city_id: marketId } : {}),
        ...(marketType === 'country' ? { country_code: marketId } : {}),
        ...(marketType === 'region' ? { region: marketId } : {}),
        raised_by: user?.name || "Unknown user",
        poc: formData.poc,
        reason: formData.reason,
        business_case_url: formData.businessCaseUrl || null,
        status: dbStatus, // Use the database format status
      };
      
      // Force type assertion here since we know our status values match the database
      const { data, error } = await supabase
        .from("escalation")
        .insert(insertData as any)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Escalation submitted",
        description: "Your escalation has been submitted successfully.",
      });
      
      // Log action
      await supabase.from("change_log").insert({
        operation: "create_escalation",
        rows_processed: 1,
        diff: { product: product?.name, market: getMarketName() }
      } as any);
      
      onClose();
      // Reset form
      setFormData({
        poc: "",
        reason: "",
        businessCaseUrl: "",
      });
    } catch (error) {
      console.error("Error submitting escalation:", error);
      toast({
        title: "Error",
        description: "Failed to submit escalation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            <span>Escalate Blocked Status</span>
          </DialogTitle>
          <DialogDescription>
            Request an escalation to count this blocked market as launched.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="create" className="flex-1">Escalate</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4 pt-4">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-muted px-2 py-1 text-xs rounded-md flex items-center">
                  Product: {product?.name || "Unknown"}
                </div>
                <div className="bg-muted px-2 py-1 text-xs rounded-md flex items-center">
                  {marketType.charAt(0).toUpperCase() + marketType.slice(1)}: {getMarketName()}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="poc" className="text-right">
                    Point of Contact <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="poc"
                    value={formData.poc}
                    onChange={(e) =>
                      setFormData({ ...formData, poc: e.target.value })
                    }
                    placeholder="Full name of the responsible person"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reason" className="text-right">
                    Escalation Reason - Will be escalated to Product and Ops VP+ <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Explain the rationale for why we should not rollout the product here. Please remember, we aim to rollout globally by default so there should be a high bar for opting out of product launch"
                    className="mt-1"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="businessCaseUrl" className="text-right">
                    Business Case URL
                  </Label>
                  <Input
                    id="businessCaseUrl"
                    value={formData.businessCaseUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, businessCaseUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>
            
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Escalation"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="history" className="pt-4">
            {history.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No history found for this escalation.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="border rounded p-3 text-sm"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">
                        {record.old_status || 'Created'} → {record.new_status}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(record.changed_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      By: {record.user_id}
                    </div>
                    {record.notes && (
                      <div className="mt-1 text-sm">{record.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EscalationModal;
