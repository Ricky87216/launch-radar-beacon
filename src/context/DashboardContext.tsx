import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { 
  Market, Product, Blocker, User, MarketDim, CoverageFact, 
  CellComment, HeatmapCell, marketDimsToMarkets, marketDimToMarket, 
  getMarketDimName, getMarketDimType, getMarketDimParentId, getMarketDimGeoPath
} from "../types";

interface DashboardContextProps {
  user: User;
  products: Product[];
  blockers: Blocker[];
  markets: MarketDim[];
  getProductById: (id: string) => Product | undefined;
  getMarketById: (id: string) => MarketDim | undefined;
  getAllMarkets: () => MarketDim[];
  
  // Additional methods needed by components
  getVisibleMarkets: () => MarketDim[];
  getFilteredProducts: () => Product[];
  getCoverageCell: (productId: string, marketId: string) => HeatmapCell | undefined;
  currentLevel: 'region' | 'country' | 'city';
  setCurrentLevel: (level: 'region' | 'country' | 'city') => void;
  selectedParent: string | null;
  setSelectedParent: (parent: string | null) => void;
  coverageType: 'city_percentage' | 'gb_weighted' | 'tam_percentage';
  setCoverageType: (type: 'city_percentage' | 'gb_weighted' | 'tam_percentage') => void;
  getProductNotes: (productId: string) => string;
  selectedLOBs: string[];
  setSelectedLOBs: (lobs: string[]) => void;
  selectedSubTeams: string[];
  setSelectedSubTeams: (teams: string[]) => void;
  hideFullCoverage: boolean;
  setHideFullCoverage: (hide: boolean) => void;
  useTam: boolean;
  setUseTam: (useTam: boolean) => void;
  getMarketsForRegion: (region: string) => MarketDim[];
  getMarketsForCountry: (countryCode: string) => MarketDim[];
  getCoverageStatusForCityProduct: (cityId: string, productId: string) => string;
  loadingState: boolean;
  getBlockerById: (blockerId: string) => Blocker | undefined;
  addBlocker: (blocker: Omit<Blocker, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBlocker: (blocker: Partial<Blocker> & { id: string }) => Promise<void>;
  getProductTamRegions: (productId: string) => Market[];
  getProductTamCountries: (productId: string) => Market[];
  getProductTamCities: (productId: string) => Market[];
  isUserLocationInTam: (productId: string) => boolean;
  addCellComment: (comment: Omit<CellComment, 'comment_id' | 'created_at'>) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    region: "EMEA",
    country: "Germany",
    role: "viewer",
    canEditStatus: false
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [markets, setMarkets] = useState<MarketDim[]>([]);
  const [coverageFacts, setCoverageFacts] = useState<CoverageFact[]>([]);
  const [loadingState, setLoadingState] = useState<boolean>(true);
  const [currentLevel, setCurrentLevel] = useState<'region' | 'country' | 'city'>('region');
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [coverageType, setCoverageType] = useState<'city_percentage' | 'gb_weighted' | 'tam_percentage'>('city_percentage');
  const [selectedLOBs, setSelectedLOBs] = useState<string[]>([]);
  const [selectedSubTeams, setSelectedSubTeams] = useState<string[]>([]);
  const [hideFullCoverage, setHideFullCoverage] = useState<boolean>(false);
  const [useTam, setUseTam] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUser({
            id: data.user.id,
            name: data.user.user_metadata?.name || "Unknown User",
            email: data.user.email || "unknown@example.com",
            region: data.user.user_metadata?.region || "GLOBAL",
            country: data.user.user_metadata?.country || "Global",
            role: data.user.user_metadata?.role || "viewer",
            canEditStatus: data.user.user_metadata?.canEditStatus || false
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchMockData = async () => {
      try {
        // Generate mock markets since the market_dim table is empty
        const mockMarkets: MarketDim[] = [
          {
            city_id: "region-EMEA",
            id: 1,
            gb_weight: 1.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            country_name: "",
            city_name: "",
            region: "EMEA",
            country_code: ""
          },
          {
            city_id: "region-APAC",
            id: 2,
            gb_weight: 1.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            country_name: "",
            city_name: "",
            region: "APAC",
            country_code: ""
          },
          {
            city_id: "region-LATAM",
            id: 3,
            gb_weight: 1.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            country_name: "",
            city_name: "",
            region: "LATAM",
            country_code: ""
          },
          {
            city_id: "region-NA",
            id: 4,
            gb_weight: 1.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            country_name: "",
            city_name: "",
            region: "NA",
            country_code: ""
          },
          // Countries
          {
            city_id: "country-DE",
            id: 5,
            gb_weight: 0.8,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            country_name: "Germany",
            city_name: "",
            region: "EMEA",
            country_code: "DE"
          },
          {
            city_id: "country-FR",
            id: 6,
            gb_weight: 0.7,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            country_name: "France",
            city_name: "",
            region: "EMEA",
            country_code: "FR"
          },
          {
            city_id: "country-JP",
            id: 7,
            gb_weight: 0.9,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            country_name: "Japan",
            city_name: "",
            region: "APAC",
            country_code: "JP"
          },
          // Cities
          {
            city_id: "city-berlin",
            id: 8,
            gb_weight: 0.5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            country_name: "Germany",
            city_name: "Berlin",
            region: "EMEA",
            country_code: "DE"
          },
          {
            city_id: "city-munich",
            id: 9,
            gb_weight: 0.4,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            country_name: "Germany",
            city_name: "Munich",
            region: "EMEA",
            country_code: "DE"
          },
          {
            city_id: "city-paris",
            id: 10,
            gb_weight: 0.6,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            country_name: "France",
            city_name: "Paris",
            region: "EMEA",
            country_code: "FR"
          },
          {
            city_id: "city-tokyo",
            id: 11,
            gb_weight: 0.8,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            country_name: "Japan",
            city_name: "Tokyo",
            region: "APAC",
            country_code: "JP"
          }
        ];
        
        setMarkets(mockMarkets);

        // Generate mock coverage facts
        const mockCoverageFacts: CoverageFact[] = [];
        mockMarkets.forEach(market => {
          if (market.city_id.startsWith('city-')) {
            for (let i = 1; i <= 10; i++) {
              mockCoverageFacts.push({
                id: mockCoverageFacts.length + 1,
                updated_at: new Date().toISOString(),
                status: Math.random() > 0.3 ? 'LIVE' : 'NOT_LIVE', // 70% chance of being LIVE
                city_id: market.city_id,
                product_id: `prod_${String(i).padStart(3, '0')}`
              });
            }
          }
        });
        
        setCoverageFacts(mockCoverageFacts);

        // Generate mock products
        const mockProducts: Product[] = Array.from({ length: 30 }, (_, i) => ({
          id: `prod_${String(i + 1).padStart(3, '0')}`,
          name: `Product ${i + 1}`,
          line_of_business: ['Mobility', 'Restaurant', 'Grocery'][i % 3],
          sub_team: ['Core', 'Growth', 'Infrastructure'][Math.floor(i / 10)],
          status: ['Launched', 'In Development', 'Planned'][i % 3],
          launch_date: i % 3 === 0 ? new Date().toISOString() : null,
          notes: i % 5 === 0 ? `Notes for product ${i + 1}` : ''
        }));
        setProducts(mockProducts);

        // Generate mock blockers
        const mockBlockers: Blocker[] = [];
        for (let i = 0; i < 25; i++) {
          const productIndex = i % 10;
          const marketIndex = i % mockMarkets.length;
          
          mockBlockers.push({
            id: `blocker_${String(i + 1).padStart(3, '0')}`,
            product_id: `prod_${String(productIndex + 1).padStart(3, '0')}`,
            market_id: mockMarkets[marketIndex].city_id,
            category: ['Technical', 'Legal', 'Business', 'Resource'][i % 4],
            owner: ['John Doe', 'Jane Smith', 'Bob Jones'][i % 3],
            eta: new Date(Date.now() + (i * 86400000)).toISOString(), // i days from now
            note: `Blocker note ${i + 1}: ${['API integration issue', 'Regulatory approval pending', 'Resource allocation', 'Contract negotiation'][i % 4]}`,
            jira_url: i % 2 === 0 ? `https://jira.example.com/ticket-${i+1}` : null,
            escalated: i % 3 === 0,
            created_at: new Date(Date.now() - (i * 86400000)).toISOString(), // i days ago
            updated_at: new Date().toISOString(),
            resolved: i % 4 === 0,
            stale: i % 5 === 0
          });
        }
        
        setBlockers(mockBlockers);
      } catch (error) {
        console.error("Error generating mock data:", error);
        // Set default empty arrays if mock generation fails
        setMarkets([]);
        setCoverageFacts([]);
        setProducts([]);
        setBlockers([]);
      }
    };

    const fetchMarkets = async () => {
      try {
        const { data, error } = await supabase.from('market_dim').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
          setMarkets(data);
        } else {
          console.log("No markets found in database, using mock data");
          // Will use mock data
        }
      } catch (error) {
        console.error("Error fetching markets:", error);
      }
    };

    const fetchCoverageFacts = async () => {
      try {
        const { data, error } = await supabase.from('coverage_fact').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCoverageFacts(data);
        } else {
          console.log("No coverage facts found in database, using mock data");
          // Will use mock data
        }
      } catch (error) {
        console.error("Error fetching coverage facts:", error);
      }
    };

    const loadData = async () => {
      setLoadingState(true);
      await Promise.all([
        fetchUser(),
        fetchMarkets(),
        fetchCoverageFacts()
      ]);
      
      // If no real data was loaded, use mock data
      if (markets.length === 0 || coverageFacts.length === 0) {
        await fetchMockData();
      }
      
      setLoadingState(false);
    };

    loadData();
  }, []);

  const getProductById = (id: string) => products.find(product => product.id === id);
  
  const getMarketById = (id: string) => markets.find(market => 
    market.city_id === id || 
    market.country_code === id || 
    `region-${market.region}` === id
  );
  
  const getAllMarkets = () => markets;

  // Return visible markets based on current level and selected parent
  const getVisibleMarkets = () => {
    if (currentLevel === 'region') {
      // Get unique regions
      const uniqueRegions = Array.from(new Set(markets.map(m => m.region)));
      return uniqueRegions.map(region => {
        const firstMarketInRegion = markets.find(m => m.region === region);
        return firstMarketInRegion || markets[0]; // Fallback to first market if none found
      });
    } else if (currentLevel === 'country') {
      if (!selectedParent) return [];
      // Get countries in the selected region
      return markets.filter(m => m.region === selectedParent && 
        getMarketDimType(m) !== 'city');
    } else if (currentLevel === 'city') {
      if (!selectedParent) return [];
      // Get cities in the selected country
      return markets.filter(m => m.country_code === selectedParent &&
        getMarketDimType(m) === 'city');
    }
    return [];
  };

  // Return filtered products based on selected filters
  const getFilteredProducts = () => {
    let filtered = [...products];
    
    if (selectedLOBs.length > 0) {
      filtered = filtered.filter(p => selectedLOBs.includes(p.line_of_business));
    }
    
    if (selectedSubTeams.length > 0) {
      filtered = filtered.filter(p => selectedSubTeams.includes(p.sub_team));
    }
    
    return filtered;
  };

  // Get coverage cell data - updating to provide realistic data
  const getCoverageCell = (productId: string, marketId: string): HeatmapCell | undefined => {
    const market = getMarketById(marketId);
    if (!market) return undefined;
    
    // First check if we have real coverage data
    if (coverageFacts.length > 0) {
      const fact = coverageFacts.find(cf => cf.product_id === productId && cf.city_id === marketId);
      if (fact) {
        const hasBlocker = blockers.some(b => 
          b.product_id === productId && 
          b.market_id === marketId &&
          !b.resolved
        );
        
        const blockerId = hasBlocker ? 
          blockers.find(b => b.product_id === productId && b.market_id === marketId && !b.resolved)?.id : 
          undefined;
        
        return {
          productId,
          marketId,
          coverage: fact.status === 'LIVE' ? 100 : 0,
          status: fact.status,
          hasBlocker,
          blockerId
        };
      }
    }
    
    // For regions and countries, aggregate coverage from child markets
    let coverage = 0;
    let totalMarkets = 0;
    let hasAnyBlocker = false;
    let blockerId: string | undefined = undefined;
    
    if (getMarketDimType(market) === 'region') {
      // For regions, aggregate from countries in this region
      markets.forEach(m => {
        if (m.region === market.region && getMarketDimType(m) === 'city') {
          totalMarkets++;
          const cityCell = getCoverageCell(productId, m.city_id);
          if (cityCell) {
            coverage += cityCell.coverage;
            if (cityCell.hasBlocker) {
              hasAnyBlocker = true;
              if (!blockerId) blockerId = cityCell.blockerId;
            }
          }
        }
      });
    } else if (getMarketDimType(market) === 'country') {
      // For countries, aggregate from cities in this country
      markets.forEach(m => {
        if (m.country_code === market.country_code && getMarketDimType(m) === 'city') {
          totalMarkets++;
          const cityCell = getCoverageCell(productId, m.city_id);
          if (cityCell) {
            coverage += cityCell.coverage;
            if (cityCell.hasBlocker) {
              hasAnyBlocker = true;
              if (!blockerId) blockerId = cityCell.blockerId;
            }
          }
        }
      });
    } else {
      // For cities, generate a synthetic coverage value if we don't have real data
      const seed = (parseInt(productId.replace(/\D/g, '')) + parseInt(marketId.replace(/\D/g, '')) || 1) % 100;
      coverage = Math.min(100, Math.max(0, seed)); // 0-100%
      
      hasAnyBlocker = blockers.some(b => 
        b.product_id === productId && 
        b.market_id === marketId &&
        !b.resolved
      );
      
      blockerId = hasAnyBlocker ? 
        blockers.find(b => b.product_id === productId && b.market_id === marketId && !b.resolved)?.id : 
        undefined;
    }
    
    // Calculate average coverage for aggregated markets
    if (totalMarkets > 0) {
      coverage = coverage / totalMarkets;
    }
    
    return {
      productId,
      marketId,
      coverage,
      status: coverage >= 90 ? 'LIVE' : 'NOT_LIVE',
      hasBlocker: hasAnyBlocker,
      blockerId
    };
  };

  const getProductNotes = (productId: string): string => {
    const product = getProductById(productId);
    return product?.notes || '';
  };

  const getMarketsForRegion = (region: string): MarketDim[] => {
    return markets.filter(m => m.region === region && getMarketDimType(m) === 'country');
  };

  const getMarketsForCountry = (countryCode: string): MarketDim[] => {
    return markets.filter(m => m.country_code === countryCode && getMarketDimType(m) === 'city');
  };

  const getCoverageStatusForCityProduct = (cityId: string, productId: string): string => {
    const coverageFact = coverageFacts.find(cf => cf.city_id === cityId && cf.product_id === productId);
    return coverageFact?.status || 'NOT_LIVE';
  };

  const getBlockerById = (blockerId: string): Blocker | undefined => {
    return blockers.find(b => b.id === blockerId);
  };

  const addBlocker = async (blocker: Omit<Blocker, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      // Since the 'blockers' table doesn't exist in Supabase, we'll simulate adding a blocker
      const newBlocker: Blocker = {
        ...blocker,
        id: `blocker_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setBlockers([...blockers, newBlocker]);
      console.log("Added new blocker:", newBlocker);
    } catch (error) {
      console.error("Error adding blocker:", error);
      throw error;
    }
  };

  const updateBlocker = async (blocker: Partial<Blocker> & { id: string }): Promise<void> => {
    try {
      // Since the 'blockers' table doesn't exist in Supabase, we'll simulate updating a blocker
      const updatedBlockers = blockers.map(b => 
        b.id === blocker.id ? { ...b, ...blocker, updated_at: new Date().toISOString() } : b
      );
      
      setBlockers(updatedBlockers);
      console.log("Updated blocker:", blocker.id);
    } catch (error) {
      console.error("Error updating blocker:", error);
      throw error;
    }
  };

  // Mock implementations for TAM-related functions
  const getProductTamRegions = (productId: string): Market[] => {
    const tamRegions = ['APAC', 'US/CAN'].includes(user.region) ? [user.region] : ['EMEA', 'LATAM'];
    return tamRegions.map(region => {
      const marketDim = markets.find(m => m.region === region) || markets[0];
      return marketDimToMarket(marketDim);
    });
  };

  const getProductTamCountries = (productId: string): Market[] => {
    // Get a few countries as part of the TAM
    const tamCountries = markets
      .filter(m => getMarketDimType(m) === 'country')
      .filter((_, index) => index % 3 === 0)
      .slice(0, 5);
    return marketDimsToMarkets(tamCountries);
  };

  const getProductTamCities = (productId: string): Market[] => {
    // Get a few cities as part of the TAM
    const tamCities = markets
      .filter(m => getMarketDimType(m) === 'city')
      .filter((_, index) => index % 4 === 0)
      .slice(0, 10);
    return marketDimsToMarkets(tamCities);
  };

  const isUserLocationInTam = (productId: string): boolean => {
    return Math.random() > 0.5; // 50% chance of being in TAM
  };

  const addCellComment = async (comment: Omit<CellComment, 'comment_id' | 'created_at'>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('cell_comment')
        .insert({
          product_id: comment.product_id,
          city_id: comment.city_id,
          author_id: comment.author_id,
          question: comment.question,
          answer: comment.answer,
          status: comment.status,
          answered_at: comment.answered_at,
          tam_escalation: comment.tam_escalation || false
        })
        .select();
      
      if (error) throw error;
      
      console.log("Added comment:", data);
    } catch (error) {
      console.error("Error adding cell comment:", error);
      throw error;
    }
  };

  return (
    <DashboardContext.Provider 
      value={{ 
        user, 
        products, 
        blockers,
        markets,
        getProductById, 
        getMarketById, 
        getAllMarkets,
        getVisibleMarkets,
        getFilteredProducts,
        getCoverageCell,
        currentLevel,
        setCurrentLevel,
        selectedParent,
        setSelectedParent,
        coverageType,
        setCoverageType,
        getProductNotes,
        selectedLOBs,
        setSelectedLOBs,
        selectedSubTeams,
        setSelectedSubTeams,
        hideFullCoverage,
        setHideFullCoverage,
        useTam,
        setUseTam,
        getMarketsForRegion,
        getMarketsForCountry,
        getCoverageStatusForCityProduct,
        loadingState,
        getBlockerById,
        addBlocker,
        updateBlocker,
        getProductTamRegions,
        getProductTamCountries,
        getProductTamCities,
        isUserLocationInTam,
        addCellComment
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
