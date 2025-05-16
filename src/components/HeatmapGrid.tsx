
import { useMemo } from "react";
import { 
  ChevronRight, 
  AlertTriangle, 
  Info 
} from "lucide-react";
import { parseISO, isValid, format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useDashboard } from "../context/DashboardContext";
import { Market, Product } from "../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

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
    blockers
  } = useDashboard();
  
  const markets = useMemo(() => getVisibleMarkets(), [getVisibleMarkets]);
  const products = useMemo(() => getFilteredProducts(), [getFilteredProducts]);
  
  // Get user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userTimezoneAbbr = new Intl.DateTimeFormat('en', { timeZoneName: 'short' })
    .formatToParts(new Date())
    .find(part => part.type === 'timeZoneName')?.value || '';
  
  // Function to handle drill-down
  const handleDrillDown = (market: Market) => {
    if (currentLevel === 'mega_region') {
      setCurrentLevel('region');
      setSelectedParent(market.id);
    } else if (currentLevel === 'region') {
      setCurrentLevel('country');
      setSelectedParent(market.id);
    } else if (currentLevel === 'country') {
      setCurrentLevel('city');
      setSelectedParent(market.id);
    }
  };
  
  // Function to handle drill-up
  const handleDrillUp = () => {
    if (currentLevel === 'city') {
      setCurrentLevel('country');
      const currentMarket = getMarketById(selectedParent || "");
      setSelectedParent(currentMarket?.parent_id || null);
    } else if (currentLevel === 'country') {
      setCurrentLevel('region');
      const currentMarket = getMarketById(selectedParent || "");
      setSelectedParent(currentMarket?.parent_id || null);
    } else if (currentLevel === 'region') {
      setCurrentLevel('mega_region');
      setSelectedParent(null);
    }
  };
  
  // Function to get cell color based on coverage value
  const getCellColor = (coverage: number) => {
    if (coverage >= 95) return 'bg-heatmap-green';
    if (coverage >= 70) return 'bg-heatmap-yellow';
    return 'bg-heatmap-red';
  };
  
  // Function to get formatted coverage value
  const getFormattedCoverage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Format ETA date in a timezone-aware manner
  const formatEtaDate = (dateString: string | null) => {
    if (!dateString || !isValid(new Date(dateString))) return { formatted: "N/A", utcFormatted: "" };
    
    const date = parseISO(dateString);
    
    // Format in user's local timezone
    const formatted = format(date, "dd MMM");
    
    // Format in UTC for tooltip
    const utcFormatted = formatInTimeZone(date, "UTC", "yyyy-MM-dd HH:mm'Z'");
    
    return { formatted, utcFormatted };
  };
  
  // Get product-specific blockers with formatted ETAs
  const getProductBlockers = (productId: string) => {
    return blockers
      .filter(blocker => blocker.product_id === productId && !blocker.resolved)
      .map(blocker => {
        const { formatted, utcFormatted } = formatEtaDate(blocker.eta);
        return {
          ...blocker,
          formattedEta: formatted,
          utcEta: utcFormatted,
          displayText: `[${blocker.category}] ${blocker.note} (ETA: ${formatted} ${userTimezoneAbbr})`
        };
      });
  };
  
  if (markets.length === 0 || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Info className="w-12 h-12 text-gray-400" />
        <p className="mt-4 text-gray-500">No data to display based on your current filters.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-auto h-full">
      <div className="p-4">
        {/* Breadcrumb navigation */}
        <div className="flex items-center mb-4">
          {currentLevel !== 'mega_region' && (
            <Button variant="ghost" onClick={handleDrillUp} className="text-sm text-gray-500">
              Back to {currentLevel === 'city' ? 'Countries' : currentLevel === 'country' ? 'Regions' : 'Mega Regions'}
            </Button>
          )}
          <span className="text-sm text-gray-500">
            {currentLevel === 'mega_region' && 'Viewing Mega Regions'}
            {currentLevel === 'region' && `Viewing Regions in ${getMarketById(selectedParent || "")?.name || ""}`}
            {currentLevel === 'country' && `Viewing Countries in ${getMarketById(selectedParent || "")?.name || ""}`}
            {currentLevel === 'city' && `Viewing Cities in ${getMarketById(selectedParent || "")?.name || ""}`}
          </span>
        </div>
        
        {/* Coverage type indicator */}
        <div className="text-sm text-gray-500 mb-4">
          Showing: {coverageType === 'city_percentage' ? 'City Coverage %' : 'GB-Weighted Coverage %'}
        </div>
        
        {/* Heatmap grid */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 border-b">Products</TableHead>
                {markets.map(market => (
                  <TableHead key={market.id} className="border-b">
                    <div className="text-sm font-medium whitespace-nowrap">
                      {market.name}
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
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.line_of_business} - {product.sub_team}</div>
                  </TableCell>
                  
                  {markets.map(market => {
                    const cell = getCoverageCell(product.id, market.id);
                    
                    if (!cell) {
                      return (
                        <TableCell key={market.id} className="border-b text-center bg-gray-100">
                          <span className="text-xs text-gray-400">No data</span>
                        </TableCell>
                      );
                    }
                    
                    return (
                      <TableCell key={market.id} className={`border-b ${getCellColor(cell.coverage)}`}>
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
                          
                          {cell.hasBlocker && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <span>This market has a blocker</span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          {currentLevel !== 'city' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDrillDown(market)}
                              className="h-5 w-5 ml-1"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          )}
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
                      
                      {getProductBlockers(product.id).length > 0 && (
                        <div>
                          <span className="font-semibold text-red-500">Blockers:</span>
                          <div className="whitespace-pre-line text-xs mt-1">
                            {getProductBlockers(product.id).map((blocker, index) => (
                              <div key={blocker.id} className="mb-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>{blocker.displayText}</div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <div className="text-xs">Original UTC: {blocker.utcEta}</div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            ))}
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
    </div>
  );
}
