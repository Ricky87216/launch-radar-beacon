
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Blocker } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface ProductBlocker {
  id: string;
  name: string;
  coverage: number;
  blockedCount: number;
  totalCount: number;
  blockers: Blocker[];
  lastUpdated: string;
}

export function useUserPreferences(
  userId: string,
  showDemoView: boolean,
  getAllMarkets: () => any[],
  blockers: Blocker[],
  getProductById: (id: string) => any
) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<{ regions: string[], countries: string[] } | null>(null);
  const [productBlockers, setProductBlockers] = useState<ProductBlocker[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('user_pref')
          .select('regions, countries')
          .eq('user_id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Record not found, show preferences modal and instructions
            setShowInstructions(true);
          } else {
            console.error('Error fetching user preferences:', error);
            toast({
              variant: "destructive",
              title: "Error loading preferences",
              description: "Failed to load your preferences. Please try again.",
            });
          }
          
          setLoading(false);
          return;
        }

        // Check if user has empty preferences
        if ((!data.regions || data.regions.length === 0) && 
            (!data.countries || data.countries.length === 0)) {
          setShowInstructions(true);
        } else {
          setShowInstructions(false);
        }

        setUserPrefs(data);
        
        if (!showDemoView) {
          await loadBlockersForUserPrefs(data.regions, data.countries);
        }
      } catch (error) {
        console.error('Error in user preferences flow:', error);
        setLoading(false);
      }
    };

    if (userId && !showDemoView) {
      fetchUserPreferences();
    } else if (!userId || showDemoView) {
      setLoading(false);
    }
  }, [userId, showDemoView]);

  const loadBlockersForUserPrefs = async (regions: string[], countries: string[]) => {
    if ((!regions || regions.length === 0) && (!countries || countries.length === 0)) {
      setLoading(false);
      setProductBlockers([]);
      return;
    }

    setLoading(true);
    try {
      // Get all markets that match the user preferences
      const markets = getAllMarkets();
      const userMarkets = markets.filter(market => {
        if (regions.includes(market.id)) return true;
        if (countries.includes(market.id)) return true;
        
        // Check if this market's parent is in the selected regions
        if (market.parent_id && regions.includes(market.parent_id)) return true;
        
        return false;
      });

      // Get unique product IDs with blockers in these markets
      const productMap: Record<string, ProductBlocker> = {};
      
      // For each product x market combination, check if there's a blocker
      userMarkets.forEach(market => {
        // Simulate querying products with blockers in this market
        const marketsBlockers = blockers.filter(b => 
          b.market_id === market.id && 
          !b.resolved
        );
        
        marketsBlockers.forEach(blocker => {
          const product = getProductById(blocker.product_id);
          if (!product) return;
          
          if (!productMap[product.id]) {
            // Initialize product entry
            productMap[product.id] = {
              id: product.id,
              name: product.name,
              coverage: 0,
              blockedCount: 0,
              totalCount: 0,
              blockers: [],
              lastUpdated: ''
            };
          }
          
          // Add blocker to the product's blockers list
          productMap[product.id].blockers.push(blocker);
          
          // Update last updated timestamp if this blocker is more recent
          if (!productMap[product.id].lastUpdated || 
              new Date(blocker.updated_at) > new Date(productMap[product.id].lastUpdated)) {
            productMap[product.id].lastUpdated = blocker.updated_at;
          }
        });
      });
      
      // Calculate coverage metrics for each product
      Object.values(productMap).forEach(productData => {
        let blockedCities = 0;
        let totalCities = 0;
        
        userMarkets.forEach(market => {
          if (market.type === 'city') {
            totalCities++;
            
            // Check if there's a blocker for this product in this city
            const hasBlocker = productData.blockers.some(b => b.market_id === market.id);
            if (hasBlocker) {
              blockedCities++;
            }
          }
        });
        
        productData.blockedCount = blockedCities;
        productData.totalCount = totalCities;
        productData.coverage = totalCities > 0 
          ? ((totalCities - blockedCities) / totalCities) * 100
          : 0;
      });
      
      // Sort products by most recently updated blocker
      const sortedProducts = Object.values(productMap).sort((a, b) => {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
      
      setProductBlockers(sortedProducts);
    } catch (error) {
      console.error('Error loading blockers:', error);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Failed to load your personalized view. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    userPrefs,
    productBlockers,
    showInstructions,
    setUserPrefs
  };
}
