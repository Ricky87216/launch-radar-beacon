
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useDashboard } from "../context/DashboardContext";
import { formatRelativeTime } from "../utils/dateUtils";
import { Star, ChevronDown, ChevronUp, Settings, Globe, ArrowRight, Calendar, User, AlertTriangle, Link } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; 
import { EscalationStatus, Blocker, ExtendedBlocker } from "@/types";
import PreferencesModal from "./PreferencesModal";
import { useProductCard } from "@/hooks/use-product-card";
import EscalationBadge from "./EscalationBadge";

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
    getAllMarkets,
    blockers
  } = useDashboard();
  const { openProductCard } = useProductCard();
  
  const [loading, setLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<{ regions: string[], countries: string[] } | null>(null);
  const [productBlockers, setProductBlockers] = useState<ProductBlocker[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  // Set to true to show example personalized view
  const [showDemoView, setShowDemoView] = useState(true);

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
            // Record not found, show preferences modal and instructions
            setShowInstructions(true);
            setPreferencesModalOpen(!showDemoView); // Only show preferences modal if we aren't showing demo
          } else {
            console.error('Error fetching user preferences:', error);
            toast({
              variant: "destructive",
              title: "Error loading preferences",
              description: "Failed to load your preferences. Please try again.",
            });
          }
          
          if (showDemoView) {
            loadDemoData();
          } else {
            setLoading(false);
          }
          return;
        }

        // Check if user has empty preferences
        if ((!data.regions || data.regions.length === 0) && 
            (!data.countries || data.countries.length === 0)) {
          setShowInstructions(!showDemoView);
        } else {
          setShowInstructions(false);
        }

        setUserPrefs(data);
        if (showDemoView) {
          loadDemoData();
        } else {
          await loadBlockersForUserPrefs(data.regions, data.countries);
        }
      } catch (error) {
        console.error('Error in user preferences flow:', error);
        
        if (showDemoView) {
          loadDemoData();
        } else {
          setLoading(false);
        }
      }
    };

    fetchUserPreferences();
  }, [user.id, navigate, showDemoView]);

  // Function to load demo data
  const loadDemoData = () => {
    setLoading(true);
    
    // Create demo preferences
    setUserPrefs({
      regions: ["mr-2"], // EMEA
      countries: ["r-3", "r-4"] // UK and Germany
    });
    
    // Create mock product blockers data with extended escalation info
    const mockProductBlockers: ProductBlocker[] = [
      {
        id: "p-1",
        name: "Product Alpha",
        coverage: 75,
        blockedCount: 2,
        totalCount: 8,
        blockers: [
          {
            id: "demo-b1",
            product_id: "p-1",
            market_id: "city-5", // Westminster
            category: "Regulatory",
            owner: "Jane Smith",
            eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            note: "Waiting for local authority approval",
            jira_url: "https://jira.example.com/issue/LAR-123",
            escalated: false,
            created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            resolved: false,
            stale: false,
            escalation: {
              id: "esc-1",
              status: "IN_REVIEW",
              raised_by: "Jane Smith",
              created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              reason_type: "Regulatory"
            }
          },
          {
            id: "demo-b2",
            product_id: "p-1",
            market_id: "city-6", // Camden
            category: "Technical",
            owner: "Mark Johnson",
            eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
            note: "Integration issue with local payment processor",
            jira_url: "https://jira.example.com/issue/LAR-124",
            escalated: true,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            resolved: false,
            stale: false,
            escalation: {
              id: "esc-2",
              status: "ALIGNED",
              raised_by: "Alex Thompson",
              created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              reason_type: "Technical"
            }
          }
        ],
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: "p-3",
        name: "Product Gamma",
        coverage: 50,
        blockedCount: 4,
        totalCount: 8,
        blockers: [
          {
            id: "demo-b3",
            product_id: "p-3",
            market_id: "city-7", // Mitte (Berlin)
            category: "Business",
            owner: "Lisa Mueller",
            eta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
            note: "Price point renegotiation with local partner",
            jira_url: "https://jira.example.com/issue/LAR-125",
            escalated: true,
            created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
            updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
            resolved: false,
            stale: false,
            escalation: {
              id: "esc-3",
              status: "ESCALATED_TO_LEGAL",
              raised_by: "Lisa Mueller",
              created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              reason_type: "Business"
            }
          },
          {
            id: "demo-b4",
            product_id: "p-3",
            market_id: "c-9", // Munich
            category: "Legal",
            owner: "Hans Schmidt",
            eta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            note: "Legal compliance review ongoing",
            jira_url: "https://jira.example.com/issue/LAR-126",
            escalated: false,
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
            updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            resolved: false,
            stale: true,
            escalation: {
              id: "esc-4",
              status: "SUBMITTED",
              raised_by: "Hans Schmidt",
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              reason_type: "Legal"
            }
          },
          {
            id: "demo-b5",
            product_id: "p-3",
            market_id: "c-8", // Berlin
            category: "Partner",
            owner: "Astrid Weber",
            eta: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
            note: "Waiting for partner technical integration",
            jira_url: "https://jira.example.com/issue/LAR-127",
            escalated: false,
            created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            resolved: false,
            stale: false
          }
        ],
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        id: "p-6",
        name: "Product Zeta",
        coverage: 87.5,
        blockedCount: 1,
        totalCount: 8,
        blockers: [
          {
            id: "demo-b6",
            product_id: "p-6",
            market_id: "city-5", // Westminster
            category: "Technical",
            owner: "Emily Richards",
            eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
            note: "Backend system adaptation required for local regulations",
            jira_url: "https://jira.example.com/issue/LAR-128",
            escalated: false,
            created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            resolved: false,
            stale: false,
            escalation: {
              id: "esc-6",
              status: "RESOLVED_EXCEPTION",
              raised_by: "Emily Richards",
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              reason_type: "Technical"
            }
          }
        ],
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      }
    ];
    
    // Set the data and turn off loading
    setProductBlockers(mockProductBlockers);
    setLoading(false);
    
    // Set one product as expanded by default
    setExpandedProducts({ "p-3": true });
  };

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

  // Toggle between demo view and real view
  const toggleDemoView = () => {
    setShowDemoView(prev => !prev);
  };

  // Function to handle navigation to escalation
  const viewEscalation = (escalationId: string) => {
    navigate(`/escalations/${escalationId}`);
  };

  // Function to navigate to personalized dashboard
  const viewPersonalizedDashboard = () => {
    if (!userPrefs || (!userPrefs.regions.length && !userPrefs.countries.length)) {
      toast({
        title: "No preferences set",
        description: "Please set your preferences first",
      });
      return;
    }
    
    // Navigate to dashboard with filter params
    const params = new URLSearchParams();
    if (userPrefs.regions.length) {
      params.append('regions', userPrefs.regions.join(','));
    }
    if (userPrefs.countries.length) {
      params.append('countries', userPrefs.countries.join(','));
    }
    navigate(`/?${params.toString()}&personalView=true`);
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

  // Show instructions when user has no preferences set and we're not showing the demo
  if (showInstructions && !showDemoView) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Star className="mr-2 h-6 w-6 text-yellow-500" />
              My Coverage
            </h1>
            <p className="text-muted-foreground">
              Personalized view of products with blockers in your regions and countries
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={toggleDemoView}
            >
              View Demo
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

        <Card className="shadow-md mb-6">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <div className="bg-yellow-100 rounded-full p-4 inline-block mb-4">
                <Settings className="h-10 w-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Set Up Your Personalized Coverage View</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Your personalized coverage dashboard helps you track launch blockers 
                for regions and countries you care about most.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Step 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Select the specific regions and countries you want to monitor for launch blockers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Step 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Save your preferences to create your personalized view</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Step 3</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Return here anytime to see blockers affecting your selected markets</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={() => setPreferencesModalOpen(true)}
                className="flex items-center"
              >
                <Settings className="mr-2 h-4 w-4" />
                Set Up My Coverage Preferences
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertTitle>Pro Tip</AlertTitle>
          <AlertDescription>
            You can update your preferences anytime by clicking on the "Edit Preferences" button that will appear after setup.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Star className="mr-2 h-6 w-6 text-yellow-500" />
            My Coverage
          </h1>
          <p className="text-muted-foreground">
            Personalized view of products with blockers in your regions and countries
          </p>
        </div>
        <div className="flex space-x-2">
          {!showDemoView && (
            <Button 
              variant="outline" 
              onClick={() => setPreferencesModalOpen(true)}
              className="flex items-center"
            >
              <Settings className="mr-2 h-4 w-4" />
              Edit Preferences
            </Button>
          )}
          {showInstructions && (
            <Button
              variant="outline"
              onClick={toggleDemoView}
            >
              {showDemoView ? "Hide Demo" : "View Demo"}
            </Button>
          )}
          {/* New button for personalized dashboard */}
          <Button 
            variant="outline"
            onClick={viewPersonalizedDashboard}
            className="flex items-center"
          >
            <Star className="mr-2 h-4 w-4" />
            Filtered Dashboard
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

      {/* Demo banner when in demo mode */}
      {showDemoView && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertTitle className="flex items-center">
            <Star className="mr-2 h-4 w-4 text-blue-500" />
            Demo Mode
          </AlertTitle>
          <AlertDescription>
            This is a demo of the personalized coverage view. It shows how your dashboard will look after setting preferences 
            for EMEA region plus UK and Germany markets.
          </AlertDescription>
        </Alert>
      )}

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
                  <CardTitle 
                    className="text-lg cursor-pointer hover:underline"
                    onClick={() => openProductCard(product.id, product.name)}
                  >
                    {product.name}
                  </CardTitle>
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
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Market</TableHead>
                          <TableHead className="whitespace-nowrap">Status</TableHead>
                          <TableHead className="whitespace-nowrap">Type</TableHead>
                          <TableHead className="whitespace-nowrap">Owner</TableHead>
                          <TableHead className="whitespace-nowrap">Created</TableHead>
                          <TableHead className="whitespace-nowrap">ETA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Show blockers, sorted by most recent */}
                        {product.blockers
                          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                          .map(blocker => (
                            <TableRow key={blocker.id}>
                              <TableCell className="py-2 whitespace-nowrap">
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
                              <TableCell className="py-2 whitespace-nowrap">
                                {(blocker as ExtendedBlocker).escalation ? (
                                  <EscalationBadge 
                                    status={(blocker as ExtendedBlocker).escalation!.status} 
                                    onClick={() => viewEscalation((blocker as ExtendedBlocker).escalation!.id)}
                                    className="cursor-pointer"
                                  />
                                ) : (
                                  <Badge variant="outline">No Escalation</Badge>
                                )}
                              </TableCell>
                              <TableCell className="py-2 whitespace-nowrap">
                                {(blocker as ExtendedBlocker).escalation?.reason_type || blocker.category || "N/A"}
                              </TableCell>
                              <TableCell className="py-2 whitespace-nowrap">
                                {(blocker as ExtendedBlocker).escalation?.raised_by || blocker.owner}
                              </TableCell>
                              <TableCell className="py-2 whitespace-nowrap">
                                {formatRelativeTime((blocker as ExtendedBlocker).escalation?.created_at || blocker.created_at)}
                              </TableCell>
                              <TableCell className="py-2 whitespace-nowrap">
                                {formatRelativeTime(blocker.eta)}
                              </TableCell>
                            </TableRow>
                          ))}
                        {product.blockers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              No blockers found
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
