
import { useState, useEffect } from "react";
import { useDashboard } from "../context/DashboardContext";
import { supabase } from "../integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { getMarketDimName, getMarketDimType } from "../types";

interface PreferencesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PreferencesModal({ open, onClose }: PreferencesModalProps) {
  const { toast } = useToast();
  const { getAllMarkets, getMarketById, user } = useDashboard();
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const markets = getAllMarkets();
  const regions = markets.filter(m => getMarketDimType(m) === 'region');
  const countries = markets.filter(m => getMarketDimType(m) === 'country');

  // Load user preferences
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user.id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_pref')
          .select('regions, countries')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Record not found, this is first login
            setIsFirstLogin(true);
            // Default to user's region/country if available
            if (user.region) setSelectedRegions([user.region]);
            if (user.country) setSelectedCountries([user.country]);
          } else {
            console.error('Error fetching user preferences:', error);
          }
        } else if (data) {
          setSelectedRegions(data.regions || []);
          setSelectedCountries(data.countries || []);
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPreferences();
  }, [user.id, user.region, user.country]);

  const handleSave = async () => {
    if (!user.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_pref')
        .upsert({
          user_id: user.id,
          regions: selectedRegions,
          countries: selectedCountries,
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error saving preferences",
          description: error.message,
        });
      } else {
        toast({
          title: "Preferences saved",
          description: "Your region and country preferences have been updated.",
        });
        onClose();
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
      toast({
        variant: "destructive",
        title: "Error saving preferences",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region) 
        : [...prev, region]
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country) 
        : [...prev, country]
    );
  };

  const removeRegion = (region: string) => {
    setSelectedRegions(prev => prev.filter(r => r !== region));
  };

  const removeCountry = (country: string) => {
    setSelectedCountries(prev => prev.filter(c => c !== country));
  };

  const getMarketName = (id: string) => {
    const market = getMarketById(id);
    return market ? getMarketDimName(market) : id;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isFirstLogin ? "Welcome to My Launch Radar!" : "Edit Your Preferences"}
          </DialogTitle>
          <DialogDescription>
            {isFirstLogin 
              ? "Choose the regions and countries you'd like to track. We'll show you a personalized view of products and blockers relevant to your selections."
              : "Customize which regions and countries appear in your personalized dashboard."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Selected regions/countries display */}
          <div>
            <h3 className="font-medium mb-2">Your Selected Regions:</h3>
            <div className="flex flex-wrap gap-2 min-h-10">
              {selectedRegions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No regions selected</p>
              ) : (
                selectedRegions.map(region => (
                  <Badge key={region} variant="outline" className="flex items-center gap-1">
                    {getMarketName(region)}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 p-0" 
                      onClick={() => removeRegion(region)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              )}
            </div>

            <h3 className="font-medium mb-2 mt-4">Your Selected Countries:</h3>
            <div className="flex flex-wrap gap-2 min-h-10">
              {selectedCountries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No countries selected</p>
              ) : (
                selectedCountries.map(country => (
                  <Badge key={country} variant="outline" className="flex items-center gap-1">
                    {getMarketName(country)}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 p-0" 
                      onClick={() => removeCountry(country)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Region selection */}
          <div>
            <Label htmlFor="regions" className="text-base font-medium">Add Regions</Label>
            <p className="text-sm text-muted-foreground mb-2">Select regions you want to track</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {regions.map(region => (
                <div key={region.city_id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`region-${region.city_id}`} 
                    checked={selectedRegions.includes(region.city_id)}
                    onCheckedChange={() => toggleRegion(region.city_id)}
                  />
                  <label 
                    htmlFor={`region-${region.city_id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {getMarketDimName(region)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Country selection */}
          <div>
            <Label htmlFor="countries" className="text-base font-medium">Add Countries</Label>
            <p className="text-sm text-muted-foreground mb-2">Select specific countries you want to track</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-60 overflow-y-auto">
              {countries.map(country => (
                <div key={country.city_id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`country-${country.city_id}`} 
                    checked={selectedCountries.includes(country.city_id)}
                    onCheckedChange={() => toggleCountry(country.city_id)}
                  />
                  <label 
                    htmlFor={`country-${country.city_id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {getMarketDimName(country)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Preferences"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
