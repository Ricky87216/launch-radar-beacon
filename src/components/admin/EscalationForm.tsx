
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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

interface ExtendedEscalationFormData extends EscalationFormData {
  techPoc: string;
  techSponsor: string;
  opsPoc: string;
  opsSponsor: string;
  additionalStakeholders: string;
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
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExtendedEscalationFormData>({
    poc: "",
    reason: "",
    businessCaseUrl: "",
    reasonType: "",
    techPoc: "",
    techSponsor: "",
    opsPoc: "",
    opsSponsor: "",
    additionalStakeholders: "",
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
      // Extract the core escalation data plus extended fields for stakeholder info
      const { data, error } = await submitEscalation(
        {
          poc: formData.poc,
          reason: formData.reason,
          businessCaseUrl: formData.businessCaseUrl,
          reasonType: formData.reasonType,
          techPoc: formData.techPoc,
          techSponsor: formData.techSponsor,
          opsPoc: formData.opsPoc,
          opsSponsor: formData.opsSponsor,
          additionalStakeholders: formData.additionalStakeholders
        },
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
      
      // Call onClose to trigger parent's success handler
      // This is where we ensure the redirect happens through the modal
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
        {/* Main Escalation Information */}
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
        
        {/* Technical Team Section */}
        <div className="pt-2 border-t">
          <h3 className="text-sm font-medium mb-2">Technical Team</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="techPoc" className="text-right">
                Tech Team POC
              </Label>
              <Input
                id="techPoc"
                value={formData.techPoc}
                onChange={(e) =>
                  setFormData({ ...formData, techPoc: e.target.value })
                }
                placeholder="Tech point of contact"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="techSponsor" className="text-right">
                Exec Tech Sponsor
              </Label>
              <Input
                id="techSponsor"
                value={formData.techSponsor}
                onChange={(e) =>
                  setFormData({ ...formData, techSponsor: e.target.value })
                }
                placeholder="Tech executive sponsor"
                className="mt-1"
              />
            </div>
          </div>
        </div>
        
        {/* Operations Team Section */}
        <div className="pt-2 border-t">
          <h3 className="text-sm font-medium mb-2">Operations Team</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="opsPoc" className="text-right">
                Ops POC
              </Label>
              <Input
                id="opsPoc"
                value={formData.opsPoc}
                onChange={(e) =>
                  setFormData({ ...formData, opsPoc: e.target.value })
                }
                placeholder="Operations point of contact"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="opsSponsor" className="text-right">
                Exec Ops Sponsor
              </Label>
              <Input
                id="opsSponsor"
                value={formData.opsSponsor}
                onChange={(e) =>
                  setFormData({ ...formData, opsSponsor: e.target.value })
                }
                placeholder="Operations executive sponsor"
                className="mt-1"
              />
            </div>
          </div>
        </div>
        
        {/* Additional Stakeholders */}
        <div>
          <Label htmlFor="additionalStakeholders" className="text-right">
            Additional Stakeholders
          </Label>
          <Input
            id="additionalStakeholders"
            value={formData.additionalStakeholders}
            onChange={(e) =>
              setFormData({ ...formData, additionalStakeholders: e.target.value })
            }
            placeholder="Comma-separated list of additional stakeholders"
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
