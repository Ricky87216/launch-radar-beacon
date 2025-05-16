
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Search, AlertTriangle } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { Market } from "../types";
import { toast } from "@/components/ui/sonner";

interface TamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

export function TamDetailsModal({ isOpen, onClose, productId }: TamDetailsModalProps) {
  const { 
    getProductById, 
    getProductTamRegions, 
    getProductTamCountries, 
    getProductTamCities,
    isUserLocationInTam,
    user,
    markets,
    addCellComment
  } = useDashboard();
  
  const product = getProductById(productId);
  const [activeTab, setActiveTab] = useState("regions");
  const [showOnlyMyCities, setShowOnlyMyCities] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [escalationText, setEscalationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get TAM data
  const tamRegions = getProductTamRegions(productId);
  const tamCountries = getProductTamCountries(productId);
  const tamCities = getProductTamCities(productId);
  const isUserInTam = isUserLocationInTam(productId);
  
  // Filter regions based on search
  const filteredRegions = markets
    .filter(m => m.type === 'region')
    .filter(region => 
      searchTerm ? region.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
    );
  
  // Filter countries based on search and optionally user's country
  const filteredCountries = markets
    .filter(m => m.type === 'country')
    .filter(country => {
      if (searchTerm && !country.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (showOnlyMyCities && country.name !== user.country) {
        return false;
      }
      return true;
    });
  
  // Filter cities based on search and optionally user's country
  const filteredCities = markets
    .filter(m => m.type === 'city')
    .filter(city => {
      if (searchTerm && !city.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (showOnlyMyCities) {
        const cityCountry = markets.find(m => m.id === city.parent_id);
        if (cityCountry && cityCountry.name !== user.country) {
          return false;
        }
      }
      
      return true;
    });
  
  const handleEscalate = async () => {
    if (!escalationText.trim()) {
      toast.error("Please provide a reason for the TAM escalation");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Find the user's city or country market ID
      const userCountry = markets.find(m => m.type === 'country' && m.name === user.country);
      
      if (userCountry) {
        // We'll use the first city in the user's country for the escalation
        const userCity = markets.find(m => m.type === 'city' && m.parent_id === userCountry.id);
        
        if (userCity) {
          // Add a new comment with TAM escalation flag
          addCellComment({
            product_id: productId,
            city_id: userCity.id,
            author_id: user.id,
            question: `TAM Escalation: ${escalationText}`,
            answer: null,
            status: 'OPEN',
            tam_escalation: true
          });
          
          toast.success("TAM escalation submitted successfully!");
          setEscalationText("");
          onClose();
        } else {
          toast.error("Could not find a city in your country to attach the escalation to");
        }
      } else {
        toast.error("Your country information is not available");
      }
    } catch (error) {
      console.error("Error submitting TAM escalation:", error);
      toast.error("Failed to submit TAM escalation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isMarketInTam = (market: Market, tamMarkets: Market[]) => {
    return tamMarkets.some(tam => tam.id === market.id);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>TAM Definition – {product?.name || ""}</DialogTitle>
          <DialogDescription>
            View the Total Addressable Market (TAM) scope for this product
          </DialogDescription>
        </DialogHeader>
        
        {/* User location insight */}
        <div className="bg-gray-50 p-3 rounded-md flex items-center space-x-2 mb-4">
          <div className="text-sm">
            <span className="font-medium">Your Location:</span> {user.country} / {user.region} - 
            {isUserInTam ? (
              <span className="text-green-600 ml-1 flex items-center">
                <Check className="w-4 h-4 mr-1" /> Included in TAM
              </span>
            ) : (
              <span className="text-red-500 ml-1 flex items-center">
                <X className="w-4 h-4 mr-1" /> Not in TAM
              </span>
            )}
          </div>
        </div>
        
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search markets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Show only my city checkbox */}
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox 
            id="showOnlyMyCities" 
            checked={showOnlyMyCities} 
            onCheckedChange={(checked) => setShowOnlyMyCities(!!checked)} 
          />
          <label htmlFor="showOnlyMyCities" className="text-sm">
            Show only my country/cities
          </label>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="regions" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="countries">Countries</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
          </TabsList>
          
          {/* Regions tab */}
          <TabsContent value="regions" className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {filteredRegions.length > 0 ? (
                filteredRegions.map(region => (
                  <div key={region.id} className="flex items-center justify-between p-2 border-b">
                    <span>{region.name}</span>
                    {isMarketInTam(region, tamRegions) ? (
                      <span className="text-green-600"><Check className="w-4 h-4" /></span>
                    ) : (
                      <span className="text-red-500"><X className="w-4 h-4" /></span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-gray-500">No regions found</div>
              )}
            </div>
          </TabsContent>
          
          {/* Countries tab */}
          <TabsContent value="countries" className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {filteredCountries.length > 0 ? (
                filteredCountries.map(country => (
                  <div key={country.id} className="flex items-center justify-between p-2 border-b">
                    <span>{country.name}</span>
                    {isMarketInTam(country, tamCountries) ? (
                      <span className="text-green-600"><Check className="w-4 h-4" /></span>
                    ) : (
                      <span className="text-red-500"><X className="w-4 h-4" /></span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-gray-500">No countries found</div>
              )}
            </div>
          </TabsContent>
          
          {/* Cities tab */}
          <TabsContent value="cities" className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {filteredCities.length > 0 ? (
                filteredCities.map(city => (
                  <div key={city.id} className="flex items-center justify-between p-2 border-b">
                    <span>{city.name}</span>
                    {isMarketInTam(city, tamCities) ? (
                      <span className="text-green-600"><Check className="w-4 h-4" /></span>
                    ) : (
                      <span className="text-red-500"><X className="w-4 h-4" /></span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-gray-500">No cities found</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Escalation section */}
        {!isUserInTam && (
          <div className="mt-4">
            <div className="bg-amber-50 p-3 rounded-md flex items-start space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">Your location is not in TAM</h4>
                <p className="text-xs text-amber-700">
                  If you believe this product should be available in your market, you can submit a TAM escalation.
                </p>
              </div>
            </div>
            <Textarea 
              placeholder="Describe why this market should be in TAM..."
              value={escalationText}
              onChange={(e) => setEscalationText(e.target.value)}
              className="mb-2"
            />
            <Button onClick={handleEscalate} disabled={isSubmitting || !escalationText.trim()}>
              Submit TAM Escalation
            </Button>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
