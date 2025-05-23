import { useMemo, useState, useEffect } from "react";
import { ChevronRight, AlertTriangle, Info, Flag, ChevronLeft } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { Market, Product } from "../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, ProductColumn } from "@/components/ui/table";
import { CellCommentPopover } from "./CellCommentPopover";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { TamDetailsModal } from "./TamDetailsModal";
import ProductNameTrigger from "./ProductNameTrigger";
import EscalationModal from "./admin/EscalationModal";
import EscalationBadge from "./EscalationBadge";
import { ScrollArea } from "./ui/scroll-area";

export interface PersonalFilters {
  regions: string[];
  countries: string[];
  isPersonalView: boolean;
}

interface HeatmapGridProps {
  onEscalate?: (productId: string, marketId: string) => void;
  onShowBlocker?: (productId: string, marketId: string, blockerId?: string) => void;
  personalFilters?: PersonalFilters;
}

export default function HeatmapGrid({
  onEscalate,
  onShowBlocker,
  personalFilters = { regions: [], countries: [], isPersonalView: false }
}: HeatmapGridProps) {
  const {
    getVisibleMarkets,
    getFilteredProducts,
    getCoverageCell,
    currentLevel,
    setCurrentLevel,
    selectedParent,
    setSelectedParent,
    getMarketById,
    coverageType,
    getProductNotes,
    blockers,
    setSelectedLOBs,
    setSelectedSubTeams,
    setHideFullCoverage,
    useTam,
    getAllMarkets,
    getCoverageData
  } = useDashboard();
  
  const markets = useMemo(() => getVisibleMarkets(), [getVisibleMarkets]);
  const products = useMemo(() => getFilteredProducts(), [getFilteredProducts]);

  // New state to track the previous drill-down levels for maintaining totals
  const [drillDownHistory, setDrillDownHistory] = useState<Map<string, number>>(new Map());

  // Parse URL parameters for highlighting specific comments
  const location = useLocation();
  const navigate = useNavigate();
  const [focusedComment, setFocusedComment] = useState<string | null>(null);
  const [focusedProduct, setFocusedProduct] = useState<string | null>(null);
  const [focusedMarket, setFocusedMarket] = useState<string | null>(null);

  // State for TAM details modal
  const [isTamModalOpen, setIsTamModalOpen] = useState(false);
  const [selectedProductForTam, setSelectedProductForTam] = useState<string | null>(null);

  // State for Escalation modal
  const [escalationModal, setEscalationModal] = useState<{
    isOpen: boolean;
    productId: string;
    marketId: string;
    marketType: 'city' | 'country' | 'region';
  }>({
    isOpen: false,
    productId: '',
    marketId: '',
    marketType: 'city'
  });

  // Parse URL parameters on component mount and when location changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const focusComment = searchParams.get('focusComment');
    const product = searchParams.get('product');
    const market = searchParams.get('market');
    if (focusComment) {
      setFocusedComment(focusComment);
    }
    if (product) {
      setFocusedProduct(product);
    }
    if (market) {
      setFocusedMarket(market);
    }

    // If we have a focused comment and market/product, but they're not visible with current filters
    if (focusComment && product && market) {
      // Check if product and market are in the current visible set
      const isProductVisible = products.some(p => p.id === product);
      const isMarketVisible = markets.some(m => m.id === market);

      // If either is not visible, adjust filters to show them
      if (!isProductVisible || !isMarketVisible) {
        toast.info("Cell hidden by filters – clearing filters now.");

        // Reset filters to make the cell visible
        setSelectedLOBs([]);
        setSelectedSubTeams([]);
        setHideFullCoverage(false);

        // If we're not at the city level, we need to drill down
        if (currentLevel !== 'city') {
          // Find the path to the market (assuming it's a city)
          const targetMarket = getMarketById(market);
          if (targetMarket) {
            if (targetMarket.type === 'city') {
              // Drill down to city level
              const country = getMarketById(targetMarket.parent_id || "");
              const region = country ? getMarketById(country.parent_id || "") : null;
              if (region) {
                // Set up the drill-down path
                setCurrentLevel('region');
                setSelectedParent(region.id);
                setTimeout(() => {
                  setCurrentLevel('country');
                  setSelectedParent(country?.id || null);
                  setTimeout(() => {
                    setCurrentLevel('city');
                    setSelectedParent(targetMarket.parent_id);
                  }, 100);
                }, 100);
              }
            }
          }
        }
      }

      // Scroll to the comment when it's rendered
      setTimeout(() => {
        const commentElement = document.getElementById(`comment-${focusComment}`);
        if (commentElement) {
          commentElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 500);
    }
  }, [location.search, products, markets]);

  // Modified function to handle drill-down with history tracking
  const handleDrillDown = (market: Market, productId?: string) => {
    // If productId is provided, save the current coverage for this product and market
    if (productId) {
      const cell = getCoverageCell(productId, market.id);
      if (cell) {
        // Save the coverage value for this product at this level
        setDrillDownHistory(prev => {
          const newHistory = new Map(prev);
          newHistory.set(`${productId}-${currentLevel}`, cell.coverage);
          return newHistory;
        });
      }
    }

    if (currentLevel === 'mega_region') {
      setCurrentLevel('region');
      setSelectedParent(market.id);
      toast.info(`Drilling down to countries in ${market.name}`);
    } else if (currentLevel === 'region') {
      setCurrentLevel('country');
      setSelectedParent(market.id);
      toast.info(`Drilling down to provinces in ${market.name}`);
    } else if (currentLevel === 'country') {
      setCurrentLevel('city');
      setSelectedParent(market.id);
      toast.info(`Drilling down to cities in ${market.name}`);
    }
  };

  // Modified function to handle drill-up with history tracking
  const handleDrillUp = () => {
    // Clear the drill-down history for the current level
    setDrillDownHistory(prev => {
      const newHistory = new Map(prev);
      // Remove all entries for this level
      for (const key of Array.from(newHistory.keys())) {
        if (key.includes(`-${currentLevel}`)) {
          newHistory.delete(key);
        }
      }
      return newHistory;
    });

    if (currentLevel === 'city') {
      setCurrentLevel('country');
      const currentMarket = getMarketById(selectedParent || "");
      setSelectedParent(currentMarket?.parent_id || null);
      toast.info("Going back to province view");
    } else if (currentLevel === 'country') {
      setCurrentLevel('region');
      const currentMarket = getMarketById(selectedParent || "");
      setSelectedParent(currentMarket?.parent_id || null);
      toast.info("Going back to country view");
    } else if (currentLevel === 'region') {
      setCurrentLevel('mega_region');
      setSelectedParent(null);
      toast.info("Going back to mega region view");
    }
  };

  // Function to get cell color based on coverage value - updated with more gentle thresholds
  const getCellColor = (coverage: number) => {
    if (coverage >= 90) return 'bg-heatmap-green';
    if (coverage >= 65) return 'bg-heatmap-yellow';
    return 'bg-heatmap-red';
  };

  // Function to get formatted coverage value
  const getFormattedCoverage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Helper function to get the parent level of the current drill-down
  const getParentLevel = () => {
    if (currentLevel === 'region') return 'mega_region';
    if (currentLevel === 'country') return 'region';
    if (currentLevel === 'city') return 'country';
    return null;
  };

  // Function to calculate total coverage for a product considering drill-down history
  const calculateTotalCoverage = (productId: string) => {
    // Check if we have a stored coverage value from a previous drill-down
    const historyKey = `${productId}-${getParentLevel()}`;
    const storedCoverage = drillDownHistory.get(historyKey);
    
    // If we have a stored value from drilling down, use that
    if (storedCoverage !== undefined) {
      return storedCoverage;
    }
    
    // Otherwise calculate based on visible markets
    if (markets.length === 0) return 0;
    
    let validCells = 0;
    let totalCoverage = 0;
    
    markets.forEach(market => {
      const cell = getCoverageCell(productId, market.id);
      if (cell) {
        totalCoverage += cell.coverage;
        validCells++;
      }
    });
    
    return validCells > 0 ? totalCoverage / validCells : 0;
  };

  // Get product-specific blockers
  const getProductBlockers = (productId: string) => {
    return blockers.filter(blocker => blocker.product_id === productId && !blocker.resolved).map(blocker => `[${blocker.category}] ${blocker.note} (ETA: ${new Date(blocker.eta).toLocaleDateString()})`).join('\n');
  };

  // Function to open TAM modal
  const handleOpenTamModal = (productId: string) => {
    setSelectedProductForTam(productId);
    setIsTamModalOpen(true);
  };

  // Fixed: Make sure this function correctly handles escalation
  const openEscalationModal = (productId: string, marketId: string, marketType: 'city' | 'country' | 'region') => {
    // If the parent component has provided an onEscalate handler, use it
    if (onEscalate) {
      onEscalate(productId, marketId);
    } else {
      // Otherwise use the internal state
      setEscalationModal({
        isOpen: true,
        productId,
        marketId,
        marketType
      });
    }
  };
  const handleShowBlocker = (productId: string, marketId: string, blockerId?: string) => {
    if (onShowBlocker) {
      onShowBlocker(productId, marketId, blockerId);
    }
  };
  if (markets.length === 0 || products.length === 0) {
    return <div className="flex flex-col items-center justify-center h-full p-8">
        <Info className="w-12 h-12 text-gray-400" />
        <p className="mt-4 text-gray-500">No data to display based on your current filters.</p>
      </div>;
  }

  // Function to navigate directly to city level
  const jumpToCityLevel = () => {
    if (currentLevel === 'mega_region') {
      // Choose the first mega region
      const megaRegion = markets[0];
      // First to region
      setCurrentLevel('region');
      setSelectedParent(megaRegion.id);

      // Get first region
      setTimeout(() => {
        const regions = getVisibleMarkets();
        if (regions.length > 0) {
          // Then to country
          setCurrentLevel('country');
          setSelectedParent(regions[0].id);

          // Get first country
          setTimeout(() => {
            const countries = getVisibleMarkets();
            if (countries.length > 0) {
              // Finally to city
              setCurrentLevel('city');
              setSelectedParent(countries[0].id);
            }
          }, 100);
        }
      }, 100);
    }
  };
  return <ScrollArea className="h-full">
      <div className="p-4">
        {/* Breadcrumb navigation */}
        <div className="flex items-center mb-4">
          {currentLevel !== 'mega_region' && <Button variant="ghost" onClick={handleDrillUp} className="text-sm text-gray-500">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to {currentLevel === 'city' ? 'Provinces' : currentLevel === 'country' ? 'Countries' : 'Mega Regions'}
            </Button>}
          
          {/* Quick navigation buttons */}
          {currentLevel !== 'city'}
          
          {/* TAM Mode Pill - shown when TAM filter is active */}
          {useTam && <div className="ml-auto">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                TAM Mode Active
              </span>
            </div>}
        </div>
        
        {/* Coverage type indicator */}
        <div className="text-sm text-gray-500 mb-4 flex items-center">
          {/* Removed the blue instruction div here */}
        </div>
        
        {/* Heatmap grid */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 border-b">Products</TableHead>
                {/* New Total column */}
                <TableHead className="border-b font-semibold">Total</TableHead>
                {markets.map(market => <TableHead key={market.id} className="border-b">
                    <div className="text-sm font-medium whitespace-nowrap">
                      {market.name}
                    </div>
                  </TableHead>)}
                <TableHead className="border-b min-w-[250px]">Status & Next Steps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => {
                // Calculate total coverage for this product
                const totalCoverage = calculateTotalCoverage(product.id);
                
                return (
                  <TableRow key={product.id}>
                    <TableCell className="sticky left-0 z-10 border-b bg-neutral-900">
                      <div className="flex items-center justify-between">
                        <div className="mr-2">
                          <div className="text-sm font-medium">
                            <ProductNameTrigger productId={product.id} productName={product.name} />
                          </div>
                          <div className="text-xs text-gray-500">{product.line_of_business} - {product.sub_team}</div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => handleOpenTamModal(product.id)} className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                                TAM
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>View TAM details for this product</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    
                    {/* Total column cell */}
                    <ProductColumn className={`border-b ${getCellColor(totalCoverage)} font-semibold`}>
                      <div className="flex items-center justify-between">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-sm font-semibold">
                                {getFormattedCoverage(totalCoverage)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <div>
                                <strong>Product:</strong> {product.name}<br />
                                <strong>Level:</strong> {currentLevel}<br />
                                <strong>Total Coverage:</strong> {getFormattedCoverage(totalCoverage)}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </ProductColumn>
                    
                    {markets.map(market => {
                        const cell = getCoverageCell(product.id, market.id);
                        const isHighlighted = focusedProduct === product.id && focusedMarket === market.id;
                        if (!cell) {
                          return <TableCell key={market.id} className="border-b text-center bg-gray-100">
                                  <span className="text-xs text-gray-400">No data</span>
                                </TableCell>;
                        }
                        return <TableCell key={market.id} className={`border-b ${getCellColor(cell.coverage)} relative ${isHighlighted ? 'ring-2 ring-blue-500' : ''}`} id={`cell-${product.id}-${market.id}`}>
                                <div className="flex items-center justify-between">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="text-sm">
                                          {getFormattedCoverage(cell.coverage)}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <div>
                                          <strong>Product:</strong> {product.name}<br />
                                          <strong>Market:</strong> {market.name}<br />
                                          <strong>Coverage:</strong> {getFormattedCoverage(cell.coverage)}
                                          {cell.hasBlocker && <div className="mt-1 text-red-500 flex items-center">
                                              <AlertTriangle className="w-3 h-3 mr-1" />
                                              <span>Has blocker</span>
                                            </div>}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <div className="flex items-center">
                                    {/* Comment Popover with Tooltip */}
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>
                                            <CellCommentPopover productId={product.id} marketId={market.id} focusCommentId={isHighlighted ? focusedComment || undefined : undefined} />
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          <p>Add or view comments</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    
                                    {/* Escalation Badge with Tooltip */}
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>
                                            <EscalationBadge productId={product.id} marketId={market.id} marketType={market.type as 'city' | 'country' | 'region'} />
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          <p>View escalation status</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    
                                    {/* Escalation button with tooltip */}
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" onClick={e => {
                                      e.stopPropagation();
                                      openEscalationModal(product.id, market.id, market.type as 'city' | 'country' | 'region');
                                    }} className="h-5 w-5 p-0 ml-1">
                                            <Flag className="h-3 w-3 text-red-500" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          <p>Escalate this market</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    
                                    {/* Blocker alert with tooltip */}
                                    {cell.hasBlocker && 
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <AlertTriangle 
                                              className="w-4 h-4 text-red-500 ml-1 cursor-pointer" 
                                              onClick={() => handleShowBlocker(product.id, market.id)} 
                                            />
                                          </TooltipTrigger>
                                          <TooltipContent side="top">
                                            <p>View market blocker details</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    }
                                    
                                    {/* Drill down button with tooltip */}
                                    {currentLevel !== 'city' && 
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              onClick={() => handleDrillDown(market, product.id)} 
                                              className="h-5 w-5 ml-1 bg-blue-50 hover:bg-blue-100 rounded-full"
                                            >
                                              <ChevronRight className="h-4 w-4 text-blue-600" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent side="top">
                                            <p>Drill down to {currentLevel === 'mega_region' ? 'regions' : currentLevel === 'region' ? 'countries' : 'cities'}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    }
                                  </div>
                                </div>
                              </TableCell>;
                    })}
                    
                    {/* Product Status Column */}
                    <TableCell className="border-b text-sm">
                      <div className="space-y-2 max-w-md">
                        <div>
                          <span className="font-semibold">Status:</span> {product.status || 'N/A'}
                        </div>
                        {product.launch_date && <div>
                            <span className="font-semibold">Launch date:</span> {new Date(product.launch_date).toLocaleDateString()}
                          </div>}
                        {product.notes && <div>
                            <span className="font-semibold">Notes:</span> {product.notes}
                          </div>}
                        {getProductBlockers(product.id) && <div>
                            <span className="font-semibold text-red-500">Blockers:</span>
                            <div className="whitespace-pre-line text-xs mt-1">
                              {getProductBlockers(product.id)}
                            </div>
                          </div>}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* TAM Details Modal */}
      {selectedProductForTam && <TamDetailsModal isOpen={isTamModalOpen} onClose={() => setIsTamModalOpen(false)} productId={selectedProductForTam} />}
      
      {/* Escalation Modal - Only render if using internal state */}
      {!onEscalate && <EscalationModal isOpen={escalationModal.isOpen} onClose={() => setEscalationModal(prev => ({
      ...prev,
      isOpen: false
    }))} productId={escalationModal.productId} marketId={escalationModal.marketId} marketType={escalationModal.marketType} />}
    </ScrollArea>;
}
