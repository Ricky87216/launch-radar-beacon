
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BulkEditGrid from "@/components/admin/BulkEditGrid";
import FilterPanel from "@/components/admin/FilterPanel";
import BulkActionToolbar from "@/components/admin/BulkActionToolbar";
import { useDashboard } from "@/context/DashboardContext";

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
    status: []
  });

  // Get all available data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from the database
      // For now, we'll generate mock data based on products and markets
      const allMarkets = getAllMarkets();
      const mockData = [];
      
      for (const product of products.slice(0, 10)) { // Limit for demo purposes
        for (const market of allMarkets.slice(0, 20)) { // Limit for demo
          if (market.type === 'city') {
            // Find the parent market (country)
            const parentMarket = allMarkets.find(m => m.id === market.parent_id);
            
            mockData.push({
              id: `${product.id}-${market.id}`,
              product_id: product.id,
              product_name: product.name,
              market_id: market.id,
              region: allMarkets.find(m => m.id === market.parent_id)?.name || '',
              country: parentMarket ? parentMarket.name : '',
              city: market.name,
              status: Math.random() > 0.7 ? 'NOT_LIVE' : 'LIVE',
              blocker_category: Math.random() > 0.7 ? 'Technical' : null,
              owner: Math.random() > 0.7 ? 'Jane Smith' : null,
              eta: Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
              note: Math.random() > 0.8 ? 'Some notes about this entry' : null
            });
          }
        }
      }
      
      setData(mockData);
      setIsLoading(false);
    };
    
    loadData();
  }, [products, getAllMarkets]);
  
  // Apply filters to data
  const filteredData = data.filter(item => {
    // Apply product filter
    if (filters.products.length && !filters.products.includes(item.product_id)) {
      return false;
    }
    
    // Apply region filter
    if (filters.regions.length && !filters.regions.includes(item.region)) {
      return false;
    }
    
    // Apply country filter
    if (filters.countries.length && !filters.countries.includes(item.country)) {
      return false;
    }
    
    // Apply city filter
    if (filters.cities.length && !filters.cities.includes(item.city)) {
      return false;
    }
    
    // Apply status filter
    if (filters.status.length && !filters.status.includes(item.status)) {
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
        markets={getAllMarkets()} 
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
