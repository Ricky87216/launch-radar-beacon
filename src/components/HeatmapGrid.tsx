import { useMemo, useState, useEffect } from "react";
import { 
  ChevronRight, 
  AlertTriangle, 
  Info,
  Flag
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { Product } from "../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CellCommentPopover } from "./CellCommentPopover";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { TamDetailsModal } from "./TamDetailsModal";
import ProductNameTrigger from "./ProductNameTrigger";
import EscalationModal from "./admin/EscalationModal";
import EscalationBadge from "./EscalationBadge";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";

export default function HeatmapGrid() {
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
    getMarketsForRegion,
    getMarketsForCountry,
    getCoverageStatusForCityProduct,
    loadingState
  } = useDashboard();
  
  const markets = useMemo(() => getVisibleMarkets(), [getVisibleMarkets, selectedParent, currentLevel]);
  const products = useMemo(() => getFilteredProducts(), [getFilteredProducts]);
  
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
  
  // State for Country Drawer
  const [countryDrawer, setCountryDrawer] = useState<{
    isOpen: boolean;
    region: string;
    productId: string;
  }>({
    isOpen: false,
    region: '',
    productId: ''
  });
  
  // State for City Modal
  const [cityModal, setCityModal] = useState<{
    isOpen: boolean;
    countryCode: string;
    countryName: string;
    productId: string;
  }>({
    isOpen: false,
    countryCode: '',
    countryName: '',
    productId: ''
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
      const isMarketVisible = markets.some(m => m.city_id === market);
      
      // If either is not visible, adjust filters to show them
      if (!isProductVisible || !isMarketVisible) {
        toast.info("Cell hidden by filters – clearing filters now.");
        
        // Reset filters to make the cell visible
        setSelectedLOBs([]);
        setSelectedSubTeams([]);
        setHideFullCoverage(false);
      }
      
      // Scroll to the comment when it's rendered
      setTimeout(() => {
        const commentElement = document.getElementById(`comment-${focusComment}`);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [location.search, products, markets]);
  
  // Function to handle drill-down
  const handleDrillDown = (regionName: string, productId: string) => {
    setCountryDrawer({
      isOpen: true,
      region: regionName,
      productId
    });
  };
  
  // Function to handle drill-up
  const handleDrillUp = () => {
    if (currentLevel === 'city') {
      setCurrentLevel('country');
    } else if (currentLevel === 'country') {
      setCurrentLevel('region');
      setSelectedParent(null);
    }
  };
  
  // Function to get cell color based on coverage value
  const getCellColor = (coverage: number) => {
    if (coverage >= 95) return 'bg-heatmap-green';
    if (coverage >= 70) return 'bg-heatmap-yellow';
    return 'bg-heatmap-red';
  };
  
  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    if (status === 'LIVE') return 'bg-green-500 text-white';
    return 'bg-red-500 text-white';
  };
  
  // Function to get formatted coverage value
  const getFormattedCoverage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Get product-specific blockers
  const getProductBlockers = (productId: string) => {
    return blockers
      .filter(blocker => blocker.product_id === productId && !blocker.resolved)
      .map(blocker => `[${blocker.category}] ${blocker.note} (ETA: ${new Date(blocker.eta).toLocaleDateString()})`)
      .join('\n');
  };
  
  const handleOpenTamModal = (productId: string) => {
    setSelectedProductForTam(productId);
    setIsTamModalOpen(true);
  };
  
  const openEscalationModal = (productId: string, marketId: string, marketType: 'city' | 'country' | 'region') => {
    setEscalationModal({
      isOpen: true,
      productId,
      marketId,
      marketType
    });
  };
  
  const openCountryDrawer = (region: string, productId: string) => {
    setCountryDrawer({
      isOpen: true,
      region,
      productId
    });
  };
  
  const openCityModal = (countryCode: string, countryName: string, productId: string) => {
    setCityModal({
      isOpen: true,
      countryCode,
      countryName,
      productId
    });
  };
  
  if (loadingState) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading dashboard data...</p>
      </div>
    );
  }
  
  if (markets.length === 0 || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Info className="w-12 h-12 text-gray-400" />
        <p className="mt-4 text-gray-500">No data to display based on your current filters.</p>
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedLOBs([]);
            setSelectedSubTeams([]);
            setHideFullCoverage(false);
          }}
          className="mt-4"
        >
          Clear Filters
        </Button>
      </div>
    );
  }
  
  return (
    <div className="overflow-auto h-full">
      <div className="p-4">
        {/* Breadcrumb navigation */}
        <div className="flex items-center mb-4">
          {currentLevel !== 'region' && (
            <Button variant="ghost" onClick={handleDrillUp} className="text-sm text-gray-500">
              Back to {currentLevel === 'city' ? 'Countries' : 'Regions'}
            </Button>
          )}
          <span className="text-sm text-gray-500">
            {currentLevel === 'region' && 'Viewing Regions'}
            {currentLevel === 'country' && `Viewing Countries in ${selectedParent}`}
            {currentLevel === 'city' && `Viewing Cities in ${selectedParent}`}
          </span>
          
          {/* TAM Mode Pill - shown when TAM filter is active */}
          {useTam && (
            <div className="ml-auto">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                TAM Mode Active
              </span>
            </div>
          )}
        </div>
        
        {/* Coverage type indicator */}
        <div className="text-sm text-gray-500 mb-4">
          Showing: {
            coverageType === 'city_percentage' ? 'City Coverage %' : 
            coverageType === 'gb_weighted' ? 'GB-Weighted Coverage %' : 
            'TAM Coverage %'
          }
        </div>
        
        {/* Heatmap grid */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 border-b">Products</TableHead>
                {markets.map(market => (
                  <TableHead key={market.city_id} className="border-b">
                    <div className="text-sm font-medium whitespace-nowrap">
                      {currentLevel === 'region' ? market.region : 
                       currentLevel === 'country' ? market.country_name : 
                       market.city_name}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="border-b min-w-[250px]">Status & Next Steps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="sticky left-0 bg-white z-10 border-b">
                    <div className="flex items-center justify-between">
                      <div className="mr-2">
                        <div className="text-sm font-medium">
                          <ProductNameTrigger 
                            productId={product.id} 
                            productName={product.name}
                          />
                        </div>
                        <div className="text-xs text-gray-500">{product.line_of_business} - {product.sub_team}</div>
                      </div>
                      <button 
                        onClick={() => handleOpenTamModal(product.id)}
                        className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        TAM
                      </button>
                    </div>
                  </TableCell>
                  
                  {markets.map(market => {
                    const cell = getCoverageCell(product.id, market.city_id);
                    const isHighlighted = focusedProduct === product.id && focusedMarket === market.city_id;
                    
                    if (!cell) {
                      return (
                        <TableCell key={market.city_id} className="border-b text-center bg-gray-100">
                          <span className="text-xs text-gray-400">No data</span>
                        </TableCell>
                      );
                    }
                    
                    return (
                      <TableCell 
                        key={market.city_id} 
                        className={`border-b ${getCellColor(cell.coverage)} relative cursor-pointer ${isHighlighted ? 'ring-2 ring-blue-500' : ''}`}
                        id={`cell-${product.id}-${market.city_id}`}
                        onClick={() => {
                          if (currentLevel === 'region') {
                            openCountryDrawer(market.region, product.id);
                          }
                        }}
                      >
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
                                  <strong>Market:</strong> {currentLevel === 'region' ? market.region : 
                                                          currentLevel === 'country' ? market.country_name : 
                                                          market.city_name}<br />
                                  <strong>Coverage:</strong> {getFormattedCoverage(cell.coverage)}
                                  {cell.hasBlocker && (
                                    <div className="mt-1 text-red-500 flex items-center">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      <span>Has blocker</span>
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <div className="flex items-center">
                            {/* Comment Popover - pass focusedComment if this is the target cell */}
                            <CellCommentPopover 
                              productId={product.id} 
                              marketId={market.city_id} 
                              focusCommentId={isHighlighted ? focusedComment || undefined : undefined} 
                            />
                            
                            {/* Escalation Badge */}
                            <EscalationBadge
                              productId={product.id}
                              marketId={market.city_id}
                              marketType={currentLevel as 'city' | 'country' | 'region'}
                            />
                            
                            {/* Escalation button */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEscalationModal(product.id, market.city_id, currentLevel as 'city' | 'country' | 'region');
                                    }}
                                    className="h-5 w-5 p-0 ml-1"
                                  >
                                    <Flag className="h-3 w-3 text-red-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>Escalate this market</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            {cell.hasBlocker && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertTriangle className="w-4 h-4 text-red-500 ml-1" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <span>This market has a blocker</span>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            {currentLevel === 'region' && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDrillDown(market.region, product.id);
                                }}
                                className="h-5 w-5 ml-1"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    );
                  })}
                  
                  {/* Product Status Column */}
                  <TableCell className="border-b text-sm">
                    <div className="space-y-2 max-w-md">
                      <div>
                        <span className="font-semibold">Status:</span> {product.status || 'N/A'}
                      </div>
                      {product.launch_date && (
                        <div>
                          <span className="font-semibold">Launch date:</span> {new Date(product.launch_date).toLocaleDateString()}
                        </div>
                      )}
                      {product.notes && (
                        <div>
                          <span className="font-semibold">Notes:</span> {product.notes}
                        </div>
                      )}
                      {getProductBlockers(product.id) && (
                        <div>
                          <span className="font-semibold text-red-500">Blockers:</span>
                          <div className="whitespace-pre-line text-xs mt-1">
                            {getProductBlockers(product.id)}
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* TAM Details Modal */}
      {selectedProductForTam && (
        <TamDetailsModal 
          isOpen={isTamModalOpen}
          onClose={() => setIsTamModalOpen(false)}
          productId={selectedProductForTam}
        />
      )}
      
      {/* Escalation Modal */}
      <EscalationModal
        isOpen={escalationModal.isOpen}
        onClose={() => setEscalationModal(prev => ({ ...prev, isOpen: false }))}
        productId={escalationModal.productId}
        marketId={escalationModal.marketId}
        marketType={escalationModal.marketType}
      />
      
      {/* Country Drawer */}
      <Drawer open={countryDrawer.isOpen} onOpenChange={(open) => {
        if (!open) setCountryDrawer(prev => ({ ...prev, isOpen: false }));
      }}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="flex justify-between items-center">
              <span>Countries in {countryDrawer.region}</span>
              <span className="text-sm text-gray-500 font-normal">
                {countryDrawer.productId ? `Product: ${products.find(p => p.id === countryDrawer.productId)?.name || ''}` : ''}
              </span>
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 overflow-y-auto max-h-[calc(85vh-100px)]">
            <div className="space-y-3">
              {countryDrawer.isOpen && countryDrawer.region && getMarketsForRegion(countryDrawer.region)
                .sort((a, b) => a.country_name.localeCompare(b.country_name))
                .map(country => {
                  // Calculate coverage for this country
                  const productId = countryDrawer.productId;
                  const cell = productId ? 
                    getCoverageCell(productId, country.city_id) : 
                    { coverage: 0, status: 'red' };
                  
                  return (
                    <div 
                      key={country.country_code}
                      className="flex items-center justify-between p-3 border rounded-md bg-white cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        if (productId) {
                          openCityModal(country.country_code, country.country_name, productId);
                        }
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{country.country_name}</div>
                        <div className="text-sm text-gray-500">{country.country_code}</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Coverage</span>
                            <span>{cell ? `${cell.coverage.toFixed(1)}%` : '0%'}</span>
                          </div>
                          <Progress
                            value={cell ? cell.coverage : 0}
                            className="h-2"
                            indicator={
                              <div className={
                                cell && cell.coverage >= 95 ? "bg-green-500 h-full w-full" :
                                cell && cell.coverage >= 70 ? "bg-yellow-500 h-full w-full" :
                                "bg-red-500 h-full w-full"
                              } style={{width: `${cell ? cell.coverage : 0}%`}}></div>
                            }
                          />
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
          
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      {/* City Modal */}
      <Dialog open={cityModal.isOpen} onOpenChange={(open) => {
        if (!open) setCityModal(prev => ({ ...prev, isOpen: false }));
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Cities in {cityModal.countryName}</span>
              <span className="text-sm text-gray-500 font-normal">
                {cityModal.productId ? `Product: ${products.find(p => p.id === cityModal.productId)?.name || ''}` : ''}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cityModal.isOpen && cityModal.countryCode && getMarketsForCountry(cityModal.countryCode)
                  .map(city => {
                    const status = getCoverageStatusForCityProduct(city.city_id, cityModal.productId);
                    
                    return (
                      <TableRow key={city.city_id}>
                        <TableCell className="font-medium">{city.city_name}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={`${getStatusBadgeColor(status)}`}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              openEscalationModal(cityModal.productId, city.city_id, 'city');
                            }}
                            className="h-8 w-8"
                          >
                            <Flag className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                }
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
