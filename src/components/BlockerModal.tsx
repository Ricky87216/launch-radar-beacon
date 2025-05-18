import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useDashboard } from "../context/DashboardContext";
import { getPotentialOwners, getBlockerCategories } from "../data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";

interface BlockerModalProps {
  open: boolean;
  onClose: () => void;
  blockerId?: string;
  productId?: string;
  marketId?: string;
  onEscalate?: () => void; // Added the missing prop
}

export default function BlockerModal({ open, onClose, blockerId, productId, marketId, onEscalate }: BlockerModalProps) {
  const { 
    getBlockerById, 
    getProductById,
    getMarketById,
    addBlocker,
    updateBlocker,
    user
  } = useDashboard();
  
  // Initialize form state
  const [formData, setFormData] = useState({
    category: "",
    owner: "",
    eta: "",
    note: "",
    jira_url: "",
    escalated: false,
    resolved: false
  });
  
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Populate form if editing an existing blocker
  useEffect(() => {
    if (blockerId) {
      const blocker = getBlockerById(blockerId);
      if (blocker) {
        setFormData({
          category: blocker.category,
          owner: blocker.owner,
          eta: blocker.eta,
          note: blocker.note,
          jira_url: blocker.jira_url || "",
          escalated: blocker.escalated,
          resolved: blocker.resolved
        });
      }
    } else {
      // Initialize with defaults for new blocker
      setFormData({
        category: "",
        owner: user.name,
        eta: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 1 week from now
        note: "",
        jira_url: "",
        escalated: false,
        resolved: false
      });
    }
  }, [blockerId, getBlockerById, user.name]);
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = () => {
    if (blockerId) {
      // Update existing blocker
      updateBlocker(blockerId, formData);
    } else if (productId && marketId) {
      // Add new blocker
      addBlocker({
        product_id: productId,
        market_id: marketId,
        category: formData.category,
        owner: formData.owner,
        eta: formData.eta,
        note: formData.note,
        jira_url: formData.jira_url || null,
        escalated: formData.escalated,
        resolved: formData.resolved,
        updated_at: new Date().toISOString(),
        stale: false
      });
    }
    
    onClose();
  };
  
  // Get product and market names for display
  const product = productId ? getProductById(productId) : undefined;
  const market = marketId ? getMarketById(marketId) : undefined;
  const isNew = !blockerId;
  const canSave = formData.category && formData.owner && formData.eta;
  const categories = getBlockerCategories();
  const owners = getPotentialOwners();

  const handleEtaSelect = (date: Date) => {
    handleChange("eta", format(date, "yyyy-MM-dd"));
    setCalendarOpen(false);
  };
  
  // Prepare the dialog footer component
  const dialogFooter = (
    <>
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={handleSubmit} disabled={!canSave}>
        {isNew ? "Create Blocker" : "Update Blocker"}
      </Button>
      {onEscalate && (
        <Button variant="destructive" onClick={onEscalate}>
          Escalate
        </Button>
      )}
    </>
  );
  
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(open) => !open && onClose()}
      title={isNew ? "Add New Blocker" : "Edit Blocker"}
      description={product && market ? `${product.name} in ${market.name}` : "Manage blocker details"}
      footer={dialogFooter}
      className="sm:max-w-[600px]"
    >
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Select
              value={formData.owner}
              onValueChange={(value) => handleChange("owner", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner} value={owner}>
                    {owner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eta">Expected Resolution Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.eta || "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.eta ? new Date(formData.eta) : undefined}
                  onSelect={handleEtaSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jira_url">Jira Link</Label>
            <Input
              id="jira_url"
              value={formData.jira_url}
              onChange={(e) => handleChange("jira_url", e.target.value)}
              placeholder="https://jira.example.com/issue/LAR-123"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="note">Notes</Label>
          <Textarea
            id="note"
            value={formData.note}
            onChange={(e) => handleChange("note", e.target.value)}
            rows={4}
            placeholder="Provide details about this blocker..."
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="escalated"
              checked={formData.escalated}
              onCheckedChange={(checked) => handleChange("escalated", checked)}
            />
            <Label htmlFor="escalated">Escalated</Label>
          </div>
          
          {!isNew && (
            <div className="flex items-center space-x-2">
              <Switch
                id="resolved"
                checked={formData.resolved}
                onCheckedChange={(checked) => handleChange("resolved", checked)}
              />
              <Label htmlFor="resolved">Resolved</Label>
            </div>
          )}
        </div>
      </div>
    </ResponsiveDialog>
  );
}
