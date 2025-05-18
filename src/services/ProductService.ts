
import { supabase } from "@/integrations/supabase/client";
import { ProductMeta, ProductStatusSummary, WatchlistItem } from "@/types/product-meta";

// Fetches product metadata by product ID
export const getProductMeta = async (productId: string): Promise<ProductMeta | null> => {
  const { data, error } = await supabase
    .from('product_meta')
    .select('*')
    .eq('product_id', productId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching product metadata:', error);
    return null;
  }
  
  return data;
};

// Checks if a product is in user's watchlist
export const isProductWatched = async (productId: string): Promise<boolean> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return false;
  }
  
  const { data: watchData, error: watchError } = await supabase
    .from('user_watchlist')
    .select('*')
    .eq('user_id', data.user.id)
    .eq('product_id', productId)
    .single();
  
  if (watchError) {
    return false;
  }
  
  return !!watchData;
};

// Toggle watch status for a product
export const toggleWatchProduct = async (productId: string): Promise<boolean> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    console.error('User not authenticated');
    return false;
  }
  
  const userId = userData.user.id;
  
  // Check if product is already watched
  const isWatched = await isProductWatched(productId);
  
  if (isWatched) {
    // Remove from watchlist
    const { error } = await supabase
      .from('user_watchlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    
    if (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
    
    return false; // Not watched anymore
  } else {
    // Add to watchlist
    const { error } = await supabase
      .from('user_watchlist')
      .insert({
        user_id: userId,
        product_id: productId
      });
    
    if (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
    
    return true; // Now watched
  }
};

// Get user's watchlist
export const getUserWatchlist = async (): Promise<WatchlistItem[]> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('user_watchlist')
    .select('*')
    .eq('user_id', userData.user.id);
  
  if (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
  
  return data;
};

// Gets the count of unresolved and total blockers for a product
export const getBlockerCounts = async (productId: string): Promise<{unresolved: number, total: number}> => {
  // In a real implementation, this would fetch from the blockers table
  // For mock data, we'll use consistent values based on productId hash
  
  // Create deterministic but seemingly random numbers based on productId
  const hash = productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const total = (hash % 12) + 8; // Between 8 and 20
  const unresolved = Math.max(1, Math.floor((hash % 7) + 1)); // Between 1 and 8, but not more than total
  
  return { unresolved, total: Math.max(unresolved, total) };
  
  // Real implementation would be something like:
  /*
  const { data: totalData, error: totalError } = await supabase
    .from('blockers')
    .select('count')
    .eq('product_id', productId);
    
  const { data: unresolvedData, error: unresolvedError } = await supabase
    .from('blockers')
    .select('count')
    .eq('product_id', productId)
    .eq('resolved', false);
    
  if (totalError || unresolvedError) {
    console.error('Error fetching blocker counts:', totalError || unresolvedError);
    return { unresolved: 0, total: 0 };
  }
  
  return { 
    total: parseInt(totalData[0]?.count || '0'), 
    unresolved: parseInt(unresolvedData[0]?.count || '0') 
  };
  */
};

// Mock function to get product status summary
// In a real implementation, this would fetch from actual data sources
export const getProductStatusSummary = async (productId: string): Promise<ProductStatusSummary> => {
  // Mock data for now - would be replaced by actual data fetches
  // Use productId to generate consistent but seemingly random values
  const hash = productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  return {
    coverage_percentage: 40 + (hash % 60), // Between 40% and 99%
    blocker_count: (hash % 5), // 0 to 4 
    escalation_count: (hash % 3) // 0 to 2
  };
};

// Update product metadata (for admin use)
export const updateProductMeta = async (productMeta: ProductMeta): Promise<boolean> => {
  const { error } = await supabase
    .from('product_meta')
    .upsert(productMeta, { onConflict: 'product_id' });
  
  if (error) {
    console.error('Error updating product metadata:', error);
    return false;
  }
  
  return true;
};

// Generate mock data for the database tables
export const generateMockData = async (): Promise<boolean> => {
  try {
    // This would be a server-side function in a real implementation
    // Here we're just showing the structure
    
    // 1. Generate market data (regions, countries, cities)
    // const markets = generateMarketData();
    // await supabase.from('markets').insert(markets);
    
    // 2. Generate product data
    // const products = generateProductData();
    // await supabase.from('products').insert(products);
    
    // 3. Generate coverage data
    // const coverage = generateCoverageData();
    // await supabase.from('coverage').insert(coverage);
    
    // 4. Generate blocker data
    // const blockers = generateBlockerData();
    // await supabase.from('blockers').insert(blockers);
    
    console.log('Mock data generation completed');
    return true;
  } catch (error) {
    console.error('Error generating mock data:', error);
    return false;
  }
};

// Check escalation status for a product in a market
export const checkEscalationStatus = async (
  productId: string,
  marketId: string,
  marketType: 'city' | 'country' | 'region'
): Promise<{exists: boolean, status: string | null}> => {
  try {
    let query = supabase
      .from("escalation")
      .select("status")
      .eq("product_id", productId);
      
    // Apply the correct filter based on market type
    if (marketType === 'city') {
      query = query.eq("city_id", marketId);
    } else if (marketType === 'country') {
      query = query.eq("country_code", marketId);
    } else if (marketType === 'region') {
      query = query.eq("region", marketId);
    }
    
    // Convert marketType to uppercase to match the enum in the database
    const scopeLevel = marketType.toUpperCase() as "CITY" | "COUNTRY" | "REGION";
    query = query.eq("scope_level", scopeLevel);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return { exists: true, status: data[0].status };
    }
    
    return { exists: false, status: null };
  } catch (error) {
    console.error("Error checking escalation status:", error);
    return { exists: false, status: null };
  }
};
