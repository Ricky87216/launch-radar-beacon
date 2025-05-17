import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Market, Product } from "@/types";

interface FilterPanelProps {
  products: Product[];
  markets: Market[];
  onFilterChange: (filters: any) => void;
  currentFilters: any;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  products,
  markets,
  onFilterChange,
  currentFilters,
}) => {
  const [productSearch, setProductSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>(["products", "regions", "status"]);

  // Get unique regions, countries, and cities
  const regions = Array.from(new Set(
    markets.filter(m => m.type === "mega_region").map(m => m.name)
  ));
  
  const countries = Array.from(new Set(
    markets.filter(m => m.type === "country").map(m => m.name)
  ));
  
  const cities = Array.from(new Set(
    markets.filter(m => m.type === "city").map(m => m.name)
  ));

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  const toggleAllProducts = (checked: boolean) => {
    if (checked) {
      onFilterChange({
        ...currentFilters,
        products: products.map(p => p.id),
      });
    } else {
      onFilterChange({
        ...currentFilters,
        products: [],
      });
    }
  };

  const toggleAllRegions = (checked: boolean) => {
    if (checked) {
      onFilterChange({
        ...currentFilters,
        regions: regions,
      });
    } else {
      onFilterChange({
        ...currentFilters,
        regions: [],
      });
    }
  };

  const toggleAllCountries = (checked: boolean) => {
    if (checked) {
      onFilterChange({
        ...currentFilters,
        countries: countries,
      });
    } else {
      onFilterChange({
        ...currentFilters,
        countries: [],
      });
    }
  };

  const toggleAllCities = (checked: boolean) => {
    if (checked) {
      onFilterChange({
        ...currentFilters,
        cities: cities,
      });
    } else {
      onFilterChange({
        ...currentFilters,
        cities: [],
      });
    }
  };

  return (
    <div className="w-64 bg-muted/20 border-r p-4 h-full overflow-y-auto">
      <h2 className="font-bold text-lg mb-4">Filters</h2>
      
      {/* Products Section */}
      <div className="mb-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-2" 
          onClick={() => toggleSection("products")}
        >
          <h3 className="font-medium">Products</h3>
          {expandedSections.includes("products") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {expandedSections.includes("products") && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="selectAllProducts" 
                  checked={currentFilters.products.length === products.length}
                  onCheckedChange={toggleAllProducts}
                />
                <label htmlFor="selectAllProducts" className="text-sm cursor-pointer">Select All</label>
              </div>
              <Button 
                variant="link" 
                className="text-xs p-0 h-auto" 
                onClick={() => onFilterChange({...currentFilters, products: []})}
              >
                Clear
              </Button>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-1 pl-1">
              {filteredProducts.map(product => (
                <div className="flex items-center space-x-2" key={product.id}>
                  <Checkbox 
                    id={`product-${product.id}`} 
                    checked={currentFilters.products.includes(product.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFilterChange({
                          ...currentFilters,
                          products: [...currentFilters.products, product.id],
                        });
                      } else {
                        onFilterChange({
                          ...currentFilters,
                          products: currentFilters.products.filter((id: string) => id !== product.id),
                        });
                      }
                    }}
                  />
                  <label 
                    htmlFor={`product-${product.id}`} 
                    className="text-sm cursor-pointer truncate"
                    title={product.name}
                  >
                    {product.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Geography Section */}
      <div className="mb-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-2" 
          onClick={() => toggleSection("regions")}
        >
          <h3 className="font-medium">Geography</h3>
          {expandedSections.includes("regions") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {expandedSections.includes("regions") && (
          <div className="space-y-3">
            {/* Regions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="selectAllRegions" 
                    checked={currentFilters.regions.length === regions.length}
                    onCheckedChange={toggleAllRegions}
                  />
                  <label htmlFor="selectAllRegions" className="text-sm cursor-pointer font-medium">Regions</label>
                </div>
                <Button 
                  variant="link" 
                  className="text-xs p-0 h-auto" 
                  onClick={() => onFilterChange({...currentFilters, regions: []})}
                >
                  Clear
                </Button>
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-1 pl-1">
                {regions.map(region => (
                  <div className="flex items-center space-x-2" key={region}>
                    <Checkbox 
                      id={`region-${region}`} 
                      checked={currentFilters.regions.includes(region)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onFilterChange({
                            ...currentFilters,
                            regions: [...currentFilters.regions, region],
                          });
                        } else {
                          onFilterChange({
                            ...currentFilters,
                            regions: currentFilters.regions.filter((r: string) => r !== region),
                          });
                        }
                      }}
                    />
                    <label 
                      htmlFor={`region-${region}`} 
                      className="text-sm cursor-pointer truncate"
                    >
                      {region}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Countries */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="selectAllCountries" 
                    checked={currentFilters.countries.length === countries.length}
                    onCheckedChange={toggleAllCountries}
                  />
                  <label htmlFor="selectAllCountries" className="text-sm cursor-pointer font-medium">Countries</label>
                </div>
                <Button 
                  variant="link" 
                  className="text-xs p-0 h-auto" 
                  onClick={() => onFilterChange({...currentFilters, countries: []})}
                >
                  Clear
                </Button>
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-1 pl-4">
                {countries.map(country => (
                  <div className="flex items-center space-x-2" key={country}>
                    <Checkbox 
                      id={`country-${country}`} 
                      checked={currentFilters.countries.includes(country)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onFilterChange({
                            ...currentFilters,
                            countries: [...currentFilters.countries, country],
                          });
                        } else {
                          onFilterChange({
                            ...currentFilters,
                            countries: currentFilters.countries.filter((c: string) => c !== country),
                          });
                        }
                      }}
                    />
                    <label 
                      htmlFor={`country-${country}`} 
                      className="text-sm cursor-pointer truncate"
                    >
                      {country}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Cities */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="selectAllCities" 
                    checked={currentFilters.cities.length === cities.length}
                    onCheckedChange={toggleAllCities}
                  />
                  <label htmlFor="selectAllCities" className="text-sm cursor-pointer font-medium">Cities</label>
                </div>
                <Button 
                  variant="link" 
                  className="text-xs p-0 h-auto" 
                  onClick={() => onFilterChange({...currentFilters, cities: []})}
                >
                  Clear
                </Button>
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-1 pl-4">
                {cities.length > 10 ? (
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cities..."
                      className="pl-8 mb-2"
                    />
                  </div>
                ) : null}
                
                {cities.slice(0, 20).map(city => (
                  <div className="flex items-center space-x-2" key={city}>
                    <Checkbox 
                      id={`city-${city}`} 
                      checked={currentFilters.cities.includes(city)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onFilterChange({
                            ...currentFilters,
                            cities: [...currentFilters.cities, city],
                          });
                        } else {
                          onFilterChange({
                            ...currentFilters,
                            cities: currentFilters.cities.filter((c: string) => c !== city),
                          });
                        }
                      }}
                    />
                    <label 
                      htmlFor={`city-${city}`} 
                      className="text-sm cursor-pointer truncate"
                    >
                      {city}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Status Section */}
      <div className="mb-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-2" 
          onClick={() => toggleSection("status")}
        >
          <h3 className="font-medium">Status</h3>
          {expandedSections.includes("status") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {expandedSections.includes("status") && (
          <div className="space-y-1 pl-1">
            {["LIVE", "NOT_LIVE", "BLOCKED", "ROLLED_BACK"].map(status => (
              <div className="flex items-center space-x-2" key={status}>
                <Checkbox 
                  id={`status-${status}`} 
                  checked={currentFilters.status.includes(status)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onFilterChange({
                        ...currentFilters,
                        status: [...currentFilters.status, status],
                      });
                    } else {
                      onFilterChange({
                        ...currentFilters,
                        status: currentFilters.status.filter((s: string) => s !== status),
                      });
                    }
                  }}
                />
                <label 
                  htmlFor={`status-${status}`} 
                  className="text-sm cursor-pointer"
                >
                  {status}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Reset All Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => onFilterChange({
          products: [],
          regions: [],
          countries: [],
          cities: [],
          status: []
        })}
      >
        Reset All Filters
      </Button>
    </div>
  );
};

export default FilterPanel;
