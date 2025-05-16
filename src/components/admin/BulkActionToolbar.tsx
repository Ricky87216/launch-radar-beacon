
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BulkActionToolbarProps {
  selectedCount: number;
  onUpdate: (updates: any) => void;
  isLoading: boolean;
}

const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  onUpdate,
  isLoading,
}) => {
  const [status, setStatus] = useState<string>("");
  const [blockerCategory, setBlockerCategory] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [eta, setEta] = useState<Date | undefined>(undefined);
  const [note, setNote] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const handleUpdateClick = () => {
    // Show confirmation dialog for large updates
    if (selectedCount > 500) {
      setShowConfirmation(true);
      return;
    }
    
    applyUpdate();
  };
  
  const applyUpdate = () => {
    const updates: Record<string, any> = {};
    
    if (status) updates.status = status;
    if (blockerCategory) updates.blocker_category = blockerCategory;
    if (owner) updates.owner = owner;
    if (eta) updates.eta = eta.toISOString();
    if (note) updates.note = note;
    
    onUpdate(updates);
    
    // Reset form
    setStatus("");
    setBlockerCategory("");
    setOwner("");
    setEta(undefined);
    setNote("");
  };
  
  return (
    <>
      <div className="bg-background border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            {selectedCount} {selectedCount === 1 ? "row" : "rows"} selected
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUpdate({})} // This will clear selection without making changes
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          <div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LIVE">LIVE</SelectItem>
                <SelectItem value="NOT_LIVE">NOT_LIVE</SelectItem>
                <SelectItem value="ROLLED_BACK">ROLLED_BACK</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={blockerCategory} onValueChange={setBlockerCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Blocker Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="">Clear Blocker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Input
              placeholder="Owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>
          
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {eta ? format(eta, "PPP") : "Select ETA"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={eta}
                  onSelect={setEta}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Textarea
              placeholder="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-10 min-h-0"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handleUpdateClick}
            disabled={isLoading || (!status && !blockerCategory && !owner && !eta && !note)}
          >
            {isLoading ? "Applying..." : "Apply to Selected"}
          </Button>
        </div>
      </div>
      
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will affect {selectedCount} {selectedCount === 1 ? "product" : "products"} across multiple markets.
              This action cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyUpdate}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkActionToolbar;
