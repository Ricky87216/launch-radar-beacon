
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { Market, Product, Blocker, User, MarketDim, CoverageFact, CellComment, HeatmapCell, marketDimsToMarkets, marketDimToMarket, getMarketDimName, getMarketDimType, getMarketDimParentId } from "../types";

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

    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          // Generate mock products if none exist
          const mockProducts: Product[] = Array.from({ length: 30 }, (_, i) => ({
            id: `prod_${String(i + 1).padStart(3, '0')}`,
            name: `Product ${i + 1}`,
            line_of_business: ['Mobility', 'Restaurant', 'Grocery'][i % 3],
            sub_team: ['Core', 'Growth', 'Infrastructure'][Math.floor(i / 10)],
            status: ['Launched', 'In Development', 'Planned'][i % 3],
            launch_date: i % 3 === 0 ? new Date().toISOString() : null
          }));
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback to mock data
        const mockProducts: Product[] = Array.from({ length: 30 }, (_, i) => ({
          id: `prod_${String(i + 1).padStart(3, '0')}`,
          name: `Product ${i + 1}`,
          line_of_business: ['Mobility', 'Restaurant', 'Grocery'][i % 3],
          sub_team: ['Core', 'Growth', 'Infrastructure'][Math.floor(i / 10)],
          status: ['Launched', 'In Development', 'Planned'][i % 3],
          launch_date: i % 3 === 0 ? new Date().toISOString() : null
        }));
        setProducts(mockProducts);
      }
    };

    const fetchBlockers = async () => {
      try {
        const { data, error } = await supabase.from('blockers').select('*');
        if (error) throw error;
        setBlockers(data || []);
      } catch (error) {
        console.error("Error fetching blockers:", error);
        setBlockers([]);
      }
    };

    const fetchMarkets = async () => {
      try {
        const { data, error } = await supabase.from('market_dim').select('*');
        if (error) throw error;
        setMarkets(data || []);
      } catch (error) {
        console.error("Error fetching markets:", error);
        setMarkets([]);
      }
    };

    const fetchCoverageFacts = async () => {
      try {
        const { data, error } = await supabase.from('coverage_fact').select('*');
        if (error) throw error;
        setCoverageFacts(data || []);
      } catch (error) {
        console.error("Error fetching coverage facts:", error);
        setCoverageFacts([]);
      }
    };

    const loadData = async () => {
      setLoadingState(true);
      await Promise.all([
        fetchUser(),
        fetchProducts(),
        fetchBlockers(),
        fetchMarkets(),
        fetchCoverageFacts()
      ]);
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
        !getMarketDimType(m).includes('city'));
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

  // Get coverage cell data
  const getCoverageCell = (productId: string, marketId: string): HeatmapCell | undefined => {
    const market = getMarketById(marketId);
    if (!market) return undefined;
    
    // For this example, we'll generate synthetic coverage data
    const coverage = Math.floor(Math.random() * 100); // 0-100%
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
      coverage,
      status: coverage >= 90 ? 'LIVE' : 'NOT_LIVE',
      hasBlocker,
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
      const { data, error } = await supabase
        .from('blockers')
        .insert({
          product_id: blocker.product_id,
          market_id: blocker.market_id,
          category: blocker.category,
          owner: blocker.owner,
          eta: blocker.eta,
          note: blocker.note,
          jira_url: blocker.jira_url,
          escalated: blocker.escalated,
          resolved: blocker.resolved,
          stale: blocker.stale
        })
        .select();
      
      if (error) throw error;
      
      if (data) {
        setBlockers([...blockers, data[0] as Blocker]);
      }
    } catch (error) {
      console.error("Error adding blocker:", error);
      throw error;
    }
  };

  const updateBlocker = async (blocker: Partial<Blocker> & { id: string }): Promise<void> => {
    try {
      const { error } = await supabase
        .from('blockers')
        .update({
          ...blocker,
          updated_at: new Date().toISOString()
        })
        .eq('id', blocker.id);
      
      if (error) throw error;
      
      // Update the blocker in the local state
      setBlockers(blockers.map(b => b.id === blocker.id ? { ...b, ...blocker } : b));
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
    return tamCountries.map(marketDim => marketDimToMarket(marketDim));
  };

  const getProductTamCities = (productId: string): Market[] => {
    // Get a few cities as part of the TAM
    const tamCities = markets
      .filter(m => getMarketDimType(m) === 'city')
      .filter((_, index) => index % 4 === 0)
      .slice(0, 10);
    return tamCities.map(marketDim => marketDimToMarket(marketDim));
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
