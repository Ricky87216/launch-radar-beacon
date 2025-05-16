
import { useState, useEffect } from "react";
import { format, parseISO, isValid, isBefore, startOfDay } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboard } from "../context/DashboardContext";
import { getPotentialOwners, getBlockerCategories } from "../data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogHeader,
  DialogTitle, 
  DialogDescription,
  DialogContent, 
  DialogFooter 
} from "@/components/ui/dialog";
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
import { Calendar as CalendarIcon, Globe, Loader2, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";

interface BlockerModalProps {
  open: boolean;
  onClose: () => void;
  blockerId?: string;
  productId?: string;
  marketId?: string;
}

export default function BlockerModal({ open, onClose, blockerId, productId, marketId }: BlockerModalProps) {
  const { 
    getBlockerById, 
    getProductById,
    getMarketById,
    addBlocker,
    updateBlocker,
    user
  } = useDashboard();
  
  const { toast } = useToast();
  
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
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Get user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
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
        
        // Set the selected date for the calendar
        if (blocker.eta && isValid(new Date(blocker.eta))) {
          setSelectedDate(parseISO(blocker.eta));
        }
      }
    } else {
      // Initialize with defaults for new blocker
      const oneWeekLater = new Date();
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      const etaDate = startOfDay(oneWeekLater);
      
      // Convert to UTC midnight
      const etaUTC = new Date(
        Date.UTC(etaDate.getFullYear(), etaDate.getMonth(), etaDate.getDate(), 0, 0, 0)
      );
      
      setFormData({
        category: "",
        owner: user.name,
        eta: etaUTC.toISOString().split('T')[0],
        note: "",
        jira_url: "",
        escalated: false,
        resolved: false
      });
      
      setSelectedDate(etaUTC);
    }
  }, [blockerId, getBlockerById, user.name]);
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset translation when note changes
    if (field === 'note') {
      setTranslatedText(null);
      setDetectedLanguage(null);
      setTranslationOpen(false);
    }
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
    if (!date) return;
    
    // Check if date is in the past
    const today = startOfDay(new Date());
    if (isBefore(date, today)) {
      toast({
        title: "Invalid Date",
        description: "ETA must be greater than or equal to today's date.",
        variant: "destructive",
      });
      return;
    }
    
    // Convert the selected date to UTC midnight
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    );
    
    handleChange("eta", utcDate.toISOString().split('T')[0]);
    setSelectedDate(date);
    setCalendarOpen(false);
  };
  
  const translateNote = async () => {
    if (!formData.note.trim()) return;
    
    setIsTranslating(true);
    
    try {
      // First detect the language
      const detectResponse = await fetch("https://translation.googleapis.com/language/translate/v2/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: formData.note,
          key: "G_TRANSLATE_KEY" // Note: This would be replaced with the actual key from environment variables
        }),
      });
      
      const detectData = await detectResponse.json();
      
      if (!detectResponse.ok) {
        throw new Error(`Language detection failed: ${detectData.error?.message || 'Unknown error'}`);
      }
      
      const detectedLang = detectData.data.detections[0][0].language;
      setDetectedLanguage(detectedLang);
      
      // If language is already English, no need to translate
      if (detectedLang === 'en') {
        setIsTranslating(false);
        toast({
          title: "Already in English",
          description: "The text is already in English, no translation needed.",
        });
        return;
      }
      
      // Translate to English
      const translateResponse = await fetch("https://translation.googleapis.com/language/translate/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: formData.note,
          source: detectedLang,
          target: "en",
          format: "text",
          key: "G_TRANSLATE_KEY" // Note: This would be replaced with the actual key from environment variables
        }),
      });
      
      const translateData = await translateResponse.json();
      
      if (!translateResponse.ok) {
        throw new Error(`Translation failed: ${translateData.error?.message || 'Unknown error'}`);
      }
      
      setTranslatedText(translateData.data.translations[0].translatedText);
      setTranslationOpen(true);
      
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : "Failed to translate text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };
  
  const formatEtaDate = (dateString: string) => {
    if (!dateString || !isValid(new Date(dateString))) return "";
    
    const date = parseISO(dateString);
    
    // Format in user's local timezone
    const localFormatted = format(date, "dd MMM yyyy");
    
    // Format in UTC for tooltip
    const utcFormatted = formatInTimeZone(date, "UTC", "yyyy-MM-dd HH:mm'Z'");
    
    return {
      localFormatted,
      utcFormatted
    };
  };
  
  const etaFormatted = formatEtaDate(formData.eta);
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Add New Blocker" : "Edit Blocker"}
          </DialogTitle>
          <DialogDescription>
            {product && market ? (
              <>
                {product.name} in {market.name}
              </>
            ) : (
              "Manage blocker details"
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eta">Expected Resolution Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left group"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{etaFormatted.localFormatted || "Pick a date"}</span>
                    <span className="ml-auto text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                      UTC: {etaFormatted.utcFormatted}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleEtaSelect}
                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    initialFocus
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
            <div className="flex items-center justify-between">
              <Label htmlFor="note">Notes</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={translateNote}
                disabled={isTranslating || !formData.note.trim()}
                title="Click to see English translation"
                className="text-sm"
              >
                {isTranslating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Globe className="h-4 w-4 mr-1" />
                )}
                Translate
              </Button>
            </div>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleChange("note", e.target.value)}
              rows={4}
              placeholder="Provide details about this blocker..."
            />
            
            {(translatedText || isTranslating) && (
              <Collapsible open={translationOpen} onOpenChange={setTranslationOpen} className="mt-2">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full flex justify-between">
                    <span>
                      Machine translation from {detectedLanguage?.toUpperCase() || "detected language"} → English
                    </span>
                    <span className="text-xs">{translationOpen ? "Hide" : "Show"}</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-2 mt-2 bg-muted/50 rounded-md">
                  {isTranslating ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Translating...</span>
                    </div>
                  ) : (
                    <p className="text-sm">{translatedText}</p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
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
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave}>
            {isNew ? "Create Blocker" : "Update Blocker"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
