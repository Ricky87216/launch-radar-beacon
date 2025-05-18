
import React, { useState } from "react";
import { 
  Calendar, 
  FileText,
  Info, 
  Mail, 
  Star, 
  StarOff,
  ExternalLink,
  Tag
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDashboard } from "../context/DashboardContext";
import { Product, ProductMeta } from "../types";
import { toast } from "@/components/ui/sonner";

interface ProductDetailsCardProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailsCard: React.FC<ProductDetailsCardProps> = ({
  productId,
  isOpen,
  onClose
}) => {
  const { 
    getProductById, 
    getProductMeta,
    isProductWatched,
    watchProduct,
    unwatchProduct
  } = useDashboard();
  
  const product = getProductById(productId);
  const productMeta = getProductMeta(productId);
  const isWatched = isProductWatched(productId);
  
  const handleToggleWatch = () => {
    if (isWatched) {
      unwatchProduct(productId);
      toast.success(`Removed "${product?.name}" from your watchlist`);
    } else {
      watchProduct(productId);
      toast.success(`Added "${product?.name}" to your watchlist`);
    }
  };
  
  if (!product) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{product.name}</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleToggleWatch}
              title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isWatched ? <Star className="h-5 w-5 text-yellow-400" /> : <StarOff className="h-5 w-5" />}
            </Button>
          </div>
          <DialogDescription>
            {product.line_of_business} - {product.sub_team}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Product description */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4" /> Description
            </h3>
            <p className="text-sm text-gray-700">
              {productMeta?.description || "No description available."}
            </p>
          </div>
          
          <Separator />
          
          {/* Key details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-4">
              {/* POCs */}
              <div>
                <h3 className="font-medium mb-2">Points of Contact</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Product Manager:</strong> {productMeta?.pm_poc || "Not assigned"}</p>
                  <p><strong>Product Operations:</strong> {productMeta?.prod_ops_poc || "Not assigned"}</p>
                </div>
              </div>
              
              {/* Timeline */}
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Timeline
                </h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Status:</strong> {product.status}</p>
                  <p>
                    <strong>Launch Date:</strong>{" "}
                    {productMeta?.launch_date 
                      ? new Date(productMeta.launch_date).toLocaleDateString() 
                      : (product.launch_date 
                        ? new Date(product.launch_date).toLocaleDateString() 
                        : "TBD")}
                  </p>
                  <p><strong>XP Plan:</strong> {productMeta?.xp_plan || "Not available"}</p>
                </div>
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-4">
              {/* Links */}
              <div>
                <h3 className="font-medium mb-2">Links</h3>
                <div className="space-y-2 text-sm">
                  {productMeta?.prd_link && (
                    <p>
                      <a 
                        href={productMeta.prd_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" /> PRD Document <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  )}
                  {productMeta?.newsletter_url && (
                    <p>
                      <a 
                        href={productMeta.newsletter_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Mail className="h-4 w-4" /> Subscribe to Newsletter <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  )}
                </div>
              </div>
              
              {/* Priority */}
              {productMeta?.company_priority && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Company Priority
                  </h3>
                  <p className="text-sm">{productMeta.company_priority}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Screenshot */}
          {productMeta?.screenshot_url && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Product Screenshot</h3>
              <div className="border rounded-md overflow-hidden">
                <img 
                  src={productMeta.screenshot_url} 
                  alt={`${product.name} screenshot`}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}
          
          {/* Additional notes */}
          {product.notes && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Additional Notes</h3>
              <p className="text-sm text-gray-700">{product.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
