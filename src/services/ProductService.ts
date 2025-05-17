
import { supabase } from "@/integrations/supabase/client";
import { ProductMeta, ProductStatusSummary, WatchlistItem } from "@/types/product-meta";

// Fetches product metadata by product ID
export const getProductMeta = async (productId: string): Promise<ProductMeta | null> => {
  const { data, error } = await supabase
    .from('product_meta')
    .select('*')
    .eq('product_id', productId)
    .single();
  
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

// Mock function to get product status summary
// In a real implementation, this would fetch from actual data sources
export const getProductStatusSummary = async (productId: string): Promise<ProductStatusSummary> => {
  // Mock data for now - would be replaced by actual data fetches
  return {
    coverage_percentage: Math.round(Math.random() * 100),
    blocker_count: Math.floor(Math.random() * 5),
    escalation_count: Math.floor(Math.random() * 3)
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
