
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useDashboard } from "../context/DashboardContext";
import { formatRelativeTime } from "../utils/dateUtils";
import { Star, ChevronDown, ChevronUp, Settings, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import PreferencesModal from "./PreferencesModal";

import type { Blocker } from "../types";

interface ProductBlocker {
  id: string;
  name: string;
  coverage: number;
  blockedCount: number;
  totalCount: number;
  blockers: Blocker[];
  lastUpdated: string;
}

export default function MyLaunchRadar() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    user, 
    getProductById, 
    getMarketById, 
    getBlockerById,
    getCoverageCell,
    getAllMarkets
  } = useDashboard();
  
  const [loading, setLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<{ regions: string[], countries: string[] } | null>(null);
  const [productBlockers, setProductBlockers] = useState<ProductBlocker[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!user.id) {
      navigate('/');
      return;
    }

    const fetchUserPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('user_pref')
          .select('regions, countries')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Record not found, show preferences modal
            setPreferencesModalOpen(true);
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

        setUserPrefs(data);
        await loadBlockersForUserPrefs(data.regions, data.countries);
      } catch (error) {
        console.error('Error in user preferences flow:', error);
        setLoading(false);
      }
    };

    fetchUserPreferences();
  }, [user.id, navigate]);

  const loadBlockersForUserPrefs = async (regions: string[], countries: string[]) => {
    if ((!regions || regions.length === 0) && (!countries || countries.length === 0)) {
      setLoading(false);
      setProductBlockers([]);
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would be a direct database query
      // For now, we'll simulate with the context data
      
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
        const { blockers } = useDashboard();
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

  const toggleProductExpanded = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return "bg-green-100 text-green-800";
    if (coverage >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Star className="mr-2 h-6 w-6 text-yellow-500" />
            My Launch Radar
          </h1>
          <p className="text-muted-foreground">
            Personalized view of products with blockers in your regions and countries
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setPreferencesModalOpen(true)}
            className="flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            Edit Preferences
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <Globe className="mr-2 h-4 w-4" />
            Global View
          </Button>
        </div>
      </div>

      {/* User preferences summary */}
      {userPrefs && (
        <div className="bg-muted/50 rounded-lg p-3 mb-6">
          <p className="text-sm font-medium">Showing products with blockers in:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {userPrefs.regions.map(region => (
              <Badge key={region} variant="secondary" className="text-xs">
                {getMarketById(region)?.name || region}
              </Badge>
            ))}
            {userPrefs.countries.map(country => (
              <Badge key={country} variant="secondary" className="text-xs">
                {getMarketById(country)?.name || country}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Product cards */}
      {productBlockers.length === 0 ? (
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold mb-2">All clear in your markets!</h2>
          <p className="text-muted-foreground mb-4">There are no blockers in your selected regions and countries.</p>
          <Button onClick={() => navigate('/')}>View Global Dashboard</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {productBlockers.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge className={getCoverageColor(product.coverage)}>
                    {Math.round(product.coverage)}%
                  </Badge>
                </div>
                <CardDescription>
                  Cities Blocked: {product.blockedCount} / {product.totalCount} ({Math.round((product.blockedCount / product.totalCount) * 100)}%)
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-medium">Recent Blockers</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 flex items-center" 
                    onClick={() => toggleProductExpanded(product.id)}
                  >
                    {expandedProducts[product.id] ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                </div>
                
                {expandedProducts[product.id] && (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[100px]">Market</TableHead>
                          <TableHead className="w-[100px]">ETA</TableHead>
                          <TableHead>Owner</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Show at most 5 blockers, sorted by most recent */}
                        {product.blockers
                          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                          .slice(0, 5)
                          .map(blocker => (
                            <TableRow key={blocker.id}>
                              <TableCell className="py-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="truncate block max-w-[100px]">
                                        {getMarketById(blocker.market_id)?.name}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {getMarketById(blocker.market_id)?.name}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell className="py-2">{formatRelativeTime(blocker.eta)}</TableCell>
                              <TableCell className="py-2">{blocker.owner}</TableCell>
                            </TableRow>
                          ))}
                        {product.blockers.length > 5 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-sm py-2">
                              <Button 
                                variant="link" 
                                className="p-0 h-auto"
                                // In a real app, this would open the blocker modal or navigate to a detail page
                                onClick={() => console.log("View all blockers for", product.name)}
                              >
                                View all {product.blockers.length} blockers
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
                Last updated: {formatRelativeTime(product.lastUpdated)}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Preferences modal */}
      <PreferencesModal 
        open={preferencesModalOpen} 
        onClose={() => setPreferencesModalOpen(false)} 
      />
    </div>
  );
}
