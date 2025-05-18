
import { useState, useEffect } from "react";
import { ProductMeta, ProductStatusSummary } from "@/types/product-meta";
import { 
  getProductMeta, 
  isProductWatched, 
  toggleWatchProduct, 
  getProductStatusSummary, 
  getBlockerCounts 
} from "@/services/ProductService";
import { toast } from "sonner";

export function useProductDetails(productId: string, isOpen: boolean) {
  const [productMeta, setProductMeta] = useState<ProductMeta | null>(null);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusSummary, setStatusSummary] = useState<ProductStatusSummary | null>(null);
  const [blockerCounts, setBlockerCounts] = useState<{unresolved: number, total: number}>({ unresolved: 0, total: 0 });
  
  useEffect(() => {
    if (isOpen && productId) {
      setLoading(true);
      
      // Fetch product metadata
      const fetchData = async () => {
        const meta = await getProductMeta(productId);
        setProductMeta(meta);
        
        // Check if product is watched
        const watched = await isProductWatched(productId);
        setIsWatched(watched);
        
        // Get product status summary
        const summary = await getProductStatusSummary(productId);
        setStatusSummary(summary);
        
        // Get blocker counts
        const counts = await getBlockerCounts(productId);
        setBlockerCounts(counts);
        
        setLoading(false);
      };
      
      fetchData();
    }
  }, [isOpen, productId]);
  
  const handleToggleWatch = async () => {
    const watched = await toggleWatchProduct(productId);
    setIsWatched(watched);
    toast.success(watched ? "Added to watchlist" : "Removed from watchlist");
  };
  
  const isLaunched = productMeta?.launch_date 
    ? new Date(productMeta.launch_date) <= new Date() 
    : false;
    
  return {
    productMeta,
    isWatched,
    loading,
    statusSummary,
    blockerCounts,
    handleToggleWatch,
    isLaunched
  };
}
