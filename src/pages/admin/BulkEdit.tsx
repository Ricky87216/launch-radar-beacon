
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BulkEditGrid from "@/components/admin/BulkEditGrid";
import FilterPanel from "@/components/admin/FilterPanel";
import BulkActionToolbar from "@/components/admin/BulkActionToolbar";
import { useDashboard } from "@/context/DashboardContext";
import { getMarketDimName, getMarketDimType, getMarketDimParentId, marketDimsToMarkets } from "@/types";

const BulkEdit = () => {
  const { toast } = useToast();
  const { products, getAllMarkets } = useDashboard();
  
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    products: [],
    regions: [],
    countries: [],
    cities: [],
    status: ["LIVE", "NOT_LIVE", "BLOCKED", "ROLLED_BACK"] // Added BLOCKED to default status filters
  });

  // Get all available data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, this would fetch from the database
        // For now, we'll generate mock data based on products and markets
        const allMarkets = getAllMarkets();
        const mockData = [];
        
        // Generate more data for demo purposes
        for (const product of products) {
          for (const market of allMarkets) {
            if (getMarketDimType(market) === 'city') {
              // Find the parent market (country)
              const country = allMarkets.find(m => m.city_id === getMarketDimParentId(market));
              // Find the region (parent of country)
              const region = country ? allMarkets.find(m => m.city_id === getMarketDimParentId(country)) : null;
              
              // Assign random status, including BLOCKED status
              const randomValue = Math.random();
              let status;
              if (randomValue > 0.8) {
                status = 'NOT_LIVE';
              } else if (randomValue > 0.6) {
                status = 'BLOCKED'; // Add some items with BLOCKED status
              } else if (randomValue > 0.5) {
                status = 'ROLLED_BACK';
              } else {
                status = 'LIVE';
              }
              
              mockData.push({
                id: `${product.id}-${market.city_id}`,
                product_id: product.id,
                product_name: product.name,
                market_id: market.city_id,
                region: region ? getMarketDimName(region) : 'Unknown Region',
                country: country ? getMarketDimName(country) : 'Unknown Country',
                city: getMarketDimName(market),
                status: status,
                blocker_category: status === 'BLOCKED' ? 'Technical' : (Math.random() > 0.7 ? 'Technical' : null),
                owner: status === 'BLOCKED' ? 'Jane Smith' : (Math.random() > 0.7 ? 'Jane Smith' : null),
                eta: status === 'BLOCKED' ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : (Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null),
                note: status === 'BLOCKED' ? 'Blocked due to technical issues' : (Math.random() > 0.8 ? 'Some notes about this entry' : null)
              });
            }
          }
        }
        
        setData(mockData);
        console.log(`Generated ${mockData.length} rows of mock data`);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [products, getAllMarkets, toast]);
  
  // Apply filters to data
  const filteredData = data.filter(item => {
    // Apply product filter
    if (filters.products.length > 0 && !filters.products.includes(item.product_id)) {
      return false;
    }
    
    // Apply region filter
    if (filters.regions.length > 0 && !filters.regions.includes(item.region)) {
      return false;
    }
    
    // Apply country filter
    if (filters.countries.length > 0 && !filters.countries.includes(item.country)) {
      return false;
    }
    
    // Apply city filter
    if (filters.cities.length > 0 && !filters.cities.includes(item.city)) {
      return false;
    }
    
    // Apply status filter
    if (filters.status.length > 0 && !filters.status.includes(item.status)) {
      return false;
    }
    
    return true;
  });

  const handleBulkUpdate = async (updates: any) => {
    try {
      if (selectedRows.length > 500) {
        // Confirmation dialog would be shown by BulkActionToolbar component
      }
      
      setIsLoading(true);
      
      // In a real implementation, this would update the database
      // For now, we'll update our local state
      const updatedData = data.map(item => {
        if (selectedRows.includes(item.id)) {
          return { ...item, ...updates };
        }
        return item;
      });
      
      setData(updatedData);
      
      // Log to change_log table
      await supabase.from('change_log').insert({
        operation: 'bulk_update',
        row_count: selectedRows.length,
        diff: { before: {}, after: updates } // In a real implementation, store actual before/after values
      });
      
      toast({
        title: "Update Successful",
        description: `Updated ${selectedRows.length} items.`,
      });
      
      // Clear selection after update
      setSelectedRows([]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error performing bulk update:", error);
      toast({
        title: "Error",
        description: "Failed to update items. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex h-[calc(100vh-64px)]">
      <FilterPanel 
        products={products} 
        markets={marketDimsToMarkets(getAllMarkets())} 
        onFilterChange={setFilters} 
        currentFilters={filters} 
      />
      <div className="flex-1 flex flex-col">
        {selectedRows.length > 0 && (
          <BulkActionToolbar 
            selectedCount={selectedRows.length} 
            onUpdate={handleBulkUpdate} 
            isLoading={isLoading}
          />
        )}
        <div className="p-2 flex items-center justify-between bg-muted/10 border-b">
          <div>
            {filteredData.length} items {filters.products.length > 0 || filters.regions.length > 0 || filters.countries.length > 0 || filters.cities.length > 0 ? '(filtered)' : ''}
          </div>
        </div>
        <BulkEditGrid 
          data={filteredData} 
          isLoading={isLoading} 
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
        />
      </div>
    </div>
  );
};

export default BulkEdit;
