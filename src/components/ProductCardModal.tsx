
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ProductMeta, ProductStatusSummary } from "@/types/product-meta";
import { getProductMeta, isProductWatched, toggleWatchProduct, getProductStatusSummary, getBlockerCounts } from "@/services/ProductService";
import { Eye, EyeOff, FileText, Calendar, Link, AlertCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductCardModalProps {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Default mock screenshot URL - this represents a stylized Uber app interface
const DEFAULT_SCREENSHOT = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80";

const ProductCardModal = ({ 
  productId, 
  productName, 
  open, 
  onOpenChange 
}: ProductCardModalProps) => {
  const [productMeta, setProductMeta] = useState<ProductMeta | null>(null);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusSummary, setStatusSummary] = useState<ProductStatusSummary | null>(null);
  const [blockerCounts, setBlockerCounts] = useState<{unresolved: number, total: number}>({ unresolved: 0, total: 0 });
  const [screenshotError, setScreenshotError] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (open && productId) {
      setLoading(true);
      setScreenshotError(false);
      
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
  }, [open, productId]);

  const handleToggleWatch = async () => {
    const watched = await toggleWatchProduct(productId);
    setIsWatched(watched);
    toast.success(watched ? "Added to watchlist" : "Removed from watchlist");
  };

  const isLaunched = productMeta?.launch_date 
    ? new Date(productMeta.launch_date) <= new Date() 
    : false;

  const formatLaunchDate = () => {
    if (!productMeta?.launch_date) return "No date set";
    if (isLaunched) return "Live";
    return format(new Date(productMeta.launch_date), "MMM d, yyyy");
  };

  const navigateToBlockers = () => {
    onOpenChange(false); // Close the modal
    // Navigate to a filtered view of blockers for this product
    navigate(`/?blockerFilter=${productId}`);
  };

  // Get screenshot URL from meta or use the default
  const getScreenshotUrl = () => {
    if (screenshotError) {
      // If there was an error loading the image, use the stylized mockup instead
      return null;
    }
    return productMeta?.screenshot_url || DEFAULT_SCREENSHOT;
  };

  // Function to render a stylized mockup if no screenshot or on error
  const renderMockScreenshot = () => {
    return (
      <div className="border border-gray-200 rounded-md shadow-md overflow-hidden mb-4">
        {/* App header */}
        <div className="bg-black text-white p-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span className="text-sm font-medium">Uber</span>
          </div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>
        
        {/* App content */}
        <div className="bg-gradient-to-b from-gray-50 to-white p-4">
          {/* Map placeholder */}
          <div className="bg-gray-200 h-32 rounded mb-3 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Map View</span>
          </div>
          
          {/* Where to? input */}
          <div className="bg-white rounded-full shadow p-3 mb-3 flex items-center">
            <div className="w-2 h-2 rounded-full bg-black mr-2"></div>
            <span className="text-sm text-gray-600">Where to?</span>
          </div>
          
          {/* Ride options */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-2 rounded shadow-sm flex flex-col items-center">
              <div className="w-6 h-6 rounded bg-gray-200 mb-1"></div>
              <span className="text-xs">UberX</span>
            </div>
            <div className="bg-white p-2 rounded shadow-sm flex flex-col items-center">
              <div className="w-6 h-6 rounded bg-gray-200 mb-1"></div>
              <span className="text-xs">Comfort</span>
            </div>
            <div className="bg-white p-2 rounded shadow-sm flex flex-col items-center">
              <div className="w-6 h-6 rounded bg-gray-200 mb-1"></div>
              <span className="text-xs">XL</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] overflow-y-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>{productName}</div>
            {productMeta?.company_priority && (
              <Badge variant="success">{productMeta.company_priority}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <>
            {/* Hero Image */}
            {getScreenshotUrl() ? (
              <div className="mb-4">
                <img 
                  src={getScreenshotUrl()} 
                  alt={`${productName} screenshot`}
                  className="w-full h-auto rounded-md shadow-md" 
                  onError={(e) => {
                    setScreenshotError(true);
                  }}
                />
              </div>
            ) : (
              renderMockScreenshot()
            )}

            {/* Basic Info */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold">PM POC:</span> {productMeta?.pm_poc || "Not set"}
                </div>
                <div>
                  <span className="font-semibold">Prod Ops POC:</span> {productMeta?.prod_ops_poc || "Not set"}
                </div>
              </div>
              <div>
                <span className="font-semibold">Launch Date:</span> {formatLaunchDate()}
              </div>
            </div>

            {/* Description */}
            {productMeta?.description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-1">Description</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{productMeta.description}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Links and Actions */}
            <div className="flex flex-wrap gap-2 mb-4">
              {productMeta?.xp_plan && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(productMeta.xp_plan!, "_blank")}
                >
                  <FileText className="mr-1 h-4 w-4" />
                  XP Plan
                </Button>
              )}
              
              {productMeta?.prd_link && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(productMeta.prd_link!, "_blank")}
                >
                  <FileText className="mr-1 h-4 w-4" />
                  PRD
                </Button>
              )}
              
              {productMeta?.newsletter_url && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(productMeta.newsletter_url!, "_blank")}
                >
                  <Link className="mr-1 h-4 w-4" />
                  Subscribe
                </Button>
              )}
            </div>

            {/* Status Snapshot */}
            {statusSummary && (
              <Card className="mb-4">
                <CardContent className="pt-4">
                  <h3 className="text-sm font-semibold mb-2">Status Snapshot</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="font-semibold">{statusSummary.coverage_percentage}%</div>
                      <div className="text-xs text-[var(--uber-gray-60)]">Coverage</div>
                    </div>
                    <div>
                      <button 
                        onClick={navigateToBlockers}
                        className="font-semibold hover:underline cursor-pointer"
                      >
                        {blockerCounts.unresolved}/{blockerCounts.total}
                      </button>
                      <div className="text-xs text-[var(--uber-gray-60)]">Blockers</div>
                    </div>
                    <div>
                      <div className="font-semibold">{statusSummary.escalation_count}</div>
                      <div className="text-xs text-[var(--uber-gray-60)]">Escalations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Watch Button */}
            <div className="flex justify-center mt-4">
              <Button 
                onClick={handleToggleWatch}
                className={isWatched ? "bg-[var(--uber-gray-60)]" : ""}
              >
                {isWatched ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" /> 
                    Unwatch
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" /> 
                    Watch
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductCardModal;
