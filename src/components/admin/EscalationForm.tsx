
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Product, Market } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EscalationFormData, submitEscalation, logEscalationAction } from "@/utils/escalationUtils";

interface EscalationFormProps {
  productId: string;
  marketId: string;
  marketType: 'city' | 'country' | 'region';
  product?: Product | null;
  market?: Market | null;
  onClose: () => void;
  userName: string;
}

const EscalationForm: React.FC<EscalationFormProps> = ({
  productId,
  marketId, 
  marketType,
  product,
  market,
  onClose,
  userName,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EscalationFormData>({
    poc: "",
    reason: "",
    businessCaseUrl: "",
    reasonType: "",
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.poc.trim() || !formData.reason.trim() || !formData.reasonType) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await submitEscalation(
        formData,
        productId,
        marketId,
        marketType,
        userName
      );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Escalation submitted",
        description: "Your escalation has been submitted successfully.",
      });
      
      // Log action
      await logEscalationAction(
        product?.name || "Unknown product", 
        market?.name || "Unknown market"
      );
      
      onClose();
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
    <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-muted px-2 py-1 text-xs rounded-md flex items-center">
          Product: {product?.name || "Unknown"}
        </div>
        <div className="bg-muted px-2 py-1 text-xs rounded-md flex items-center">
          {marketType.charAt(0).toUpperCase() + marketType.slice(1)}: {market?.name || "Unknown"}
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
          <Label htmlFor="reasonType" className="text-right">
            Reason Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.reasonType}
            onValueChange={(value) =>
              setFormData({ ...formData, reasonType: value })
            }
          >
            <SelectTrigger id="reasonType" className="mt-1">
              <SelectValue placeholder="Select a reason category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Policy Risk">Policy Risk</SelectItem>
              <SelectItem value="Negative Business Impact">Negative Business Impact</SelectItem>
              <SelectItem value="Legal Risk">Legal Risk</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
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
    
      <div className="mt-6 flex justify-end gap-2">
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
      </div>
    </form>
  );
};

export default EscalationForm;
