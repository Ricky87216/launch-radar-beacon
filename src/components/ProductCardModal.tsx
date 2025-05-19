
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
import { Eye, EyeOff, FileText, Figma, Link, Calendar } from "lucide-react";
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

// Using the provided GIF URL
const DEFAULT_SCREENSHOT = "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExazdhOGI3aTg1aTB0eWFjMXozZTV3MWEzaTgwOHNnaXpmazdsYWxmcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/egvP3fIFgJPzZihAI3/giphy.gif";

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
  const [fullScreenImageOpen, setFullScreenImageOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Example mock data to ensure there's always something to display
  const mockProductMeta: ProductMeta = {
    product_id: productId,
    pm_poc: "Sarah Johnson",
    prod_ops_poc: "Michael Chen",
    prd_link: "https://example.com/prd-document",
    figma_link: "https://figma.com/file/example-design",
    description: "This product aims to revolutionize urban mobility by connecting riders with drivers efficiently and safely. The platform uses machine learning to optimize routes and improve ETA predictions.",
    launch_date: "2024-12-15",
    xp_plan: "https://example.com/xp-plan",
    newsletter_url: "https://example.com/subscribe",
    company_priority: "P1",
    screenshot_url: null
  };

  useEffect(() => {
    if (open && productId) {
      setLoading(true);
      setScreenshotError(false);
      
      // Fetch product metadata
      const fetchData = async () => {
        const meta = await getProductMeta(productId);
        // If no real data, use mock data for better visualization
        setProductMeta(meta || mockProductMeta);
        
        // Check if product is watched
        const watched = await isProductWatched(productId);
        setIsWatched(watched);
        
        // Get product status summary
        const summary = await getProductStatusSummary(productId);
        setStatusSummary(summary || {
          coverage_percentage: 78,
          blocker_count: 3,
          escalation_count: 1
        });
        
        // Get blocker counts
        const counts = await getBlockerCounts(productId);
        setBlockerCounts(counts || { unresolved: 2, total: 5 });
        
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
      return null;
    }
    // Always prioritize the default GIF over any metadata screenshot
    return DEFAULT_SCREENSHOT;
  };

  // Function to render the screenshot
  const renderScreenshot = () => {
    const screenshotUrl = getScreenshotUrl();
    
    if (!screenshotUrl) {
      // This is now a fallback in case even the GIF fails
      return (
        <div className="border border-gray-200 rounded-md shadow-md overflow-hidden mb-4 bg-gray-100 flex items-center justify-center h-40">
          <span className="text-gray-500">Screenshot unavailable</span>
        </div>
      );
    }
    
    // Adjusted container with twice the height and made clickable
    return (
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-1">Product Visual</h3>
        <div 
          className="border border-gray-200 rounded-md shadow-md overflow-hidden flex justify-center cursor-pointer"
          onClick={() => setFullScreenImageOpen(true)}
        >
          <img 
            src={screenshotUrl} 
            alt={`${productName} animation`}
            className="h-48 w-auto object-contain my-2" 
            onError={() => {
              console.log("GIF failed to load, showing fallback");
              setScreenshotError(true);
            }}
          />
        </div>
      </div>
    );
  };

  // Fullscreen image dialog
  const renderFullScreenImageDialog = () => {
    const screenshotUrl = getScreenshotUrl();
    
    if (!screenshotUrl) return null;
    
    return (
      <Dialog open={fullScreenImageOpen} onOpenChange={setFullScreenImageOpen}>
        <DialogContent className="max-w-4xl p-2 flex items-center justify-center">
          <img 
            src={screenshotUrl} 
            alt={`${productName} animation (full size)`}
            className="max-w-full max-h-[80vh] object-contain" 
          />
        </DialogContent>
      </Dialog>
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
            {renderScreenshot()}

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded-md p-3 bg-slate-50">
                <div className="text-xs text-muted-foreground mb-1">Product Manager</div>
                <div className="font-medium">{productMeta?.pm_poc || "—"}</div>
              </div>
              
              <div className="border rounded-md p-3 bg-slate-50">
                <div className="text-xs text-muted-foreground mb-1">Prod Ops Lead</div>
                <div className="font-medium">{productMeta?.prod_ops_poc || "—"}</div>
              </div>
              
              <div className="border rounded-md p-3 bg-slate-50 flex flex-col">
                <div className="text-xs text-muted-foreground mb-1">Launch Date</div>
                <div className="font-medium flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  {formatLaunchDate()}
                </div>
              </div>
              
              <div className="border rounded-md p-3 bg-slate-50">
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <div className="font-medium">
                  {isLaunched ? (
                    <Badge className="bg-[#6FCF97]">Live</Badge>
                  ) : (
                    <Badge variant="outline">In Development</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {productMeta?.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-1">About</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-3 bg-slate-50">
                  <ReactMarkdown>{productMeta.description}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Links and Actions */}
            <div className="flex flex-wrap gap-2 mb-6">
              {productMeta?.prd_link && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(productMeta.prd_link!, "_blank")}
                >
                  <FileText className="mr-1.5 h-4 w-4" />
                  PRD
                </Button>
              )}
              
              {productMeta?.figma_link && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(productMeta.figma_link!, "_blank")}
                >
                  <Figma className="mr-1.5 h-4 w-4" />
                  Design
                </Button>
              )}
              
              {productMeta?.xp_plan && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(productMeta.xp_plan!, "_blank")}
                >
                  <FileText className="mr-1.5 h-4 w-4" />
                  XP Plan
                </Button>
              )}
              
              {productMeta?.newsletter_url && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(productMeta.newsletter_url!, "_blank")}
                >
                  <Link className="mr-1.5 h-4 w-4" />
                  Subscribe
                </Button>
              )}
            </div>

            {/* Status Snapshot */}
            {statusSummary && (
              <Card className="mb-6">
                <CardContent className="pt-4">
                  <h3 className="text-sm font-semibold mb-3">Status Snapshot</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="border rounded-md p-2">
                      <div className="font-semibold text-lg">{statusSummary.coverage_percentage}%</div>
                      <div className="text-xs text-[var(--uber-gray-60)]">Coverage</div>
                    </div>
                    <div className="border rounded-md p-2">
                      <button 
                        onClick={navigateToBlockers}
                        className="font-semibold text-lg hover:underline cursor-pointer"
                      >
                        {blockerCounts.unresolved}/{blockerCounts.total}
                      </button>
                      <div className="text-xs text-[var(--uber-gray-60)]">Blockers</div>
                    </div>
                    <div className="border rounded-md p-2">
                      <div className="font-semibold text-lg">{statusSummary.escalation_count}</div>
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
                variant={isWatched ? "outline" : "watch"}
                className="w-full"
              >
                {isWatched ? (
                  <>
                    <EyeOff className="h-4 w-4" /> 
                    Unwatch
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" /> 
                    Watch
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
      {renderFullScreenImageDialog()}
    </Dialog>
  );
};

export default ProductCardModal;
