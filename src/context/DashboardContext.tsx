
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  Market, 
  Product, 
  Coverage, 
  Blocker, 
  User, 
  HeatmapCell,
  TamScope,
  CellComment,
  MarketDim,
  CoverageFact
} from "../types";

import { supabase } from "../integrations/supabase/client";
import { currentUser } from "../data/mockData";
import { toast } from "sonner";

interface DashboardContextProps {
  products: Product[];
  blockers: Blocker[];
  user: User;
  coverageType: 'city_percentage' | 'gb_weighted' | 'tam_percentage';
  setCoverageType: (type: 'city_percentage' | 'gb_weighted' | 'tam_percentage') => void;
  selectedLOBs: string[];
  setSelectedLOBs: (lobs: string[]) => void;
  selectedSubTeams: string[];
  setSelectedSubTeams: (subTeams: string[]) => void;
  hideFullCoverage: boolean;
  setHideFullCoverage: (hide: boolean) => void;
  currentLevel: 'region' | 'country' | 'city';
  setCurrentLevel: (level: 'region' | 'country' | 'city') => void;
  selectedParent: string | null;
  setSelectedParent: (parentId: string | null) => void;
  getCoverageCell: (productId: string, marketId: string) => HeatmapCell | null;
  getProductById: (productId: string) => Product | undefined;
  getMarketById: (marketId: string) => MarketDim | undefined;
  getBlockerById: (blockerId: string) => Blocker | undefined;
  addBlocker: (blocker: Omit<Blocker, "id" | "created_at">) => void;
  updateBlocker: (blockerId: string, updates: Partial<Blocker>) => void;
  updateCoverage: (productId: string, marketId: string, value: string) => void;
  getVisibleMarkets: () => MarketDim[];
  getFilteredProducts: () => Product[];
  getProductNotes: (productId: string) => string;
  getAllMarkets: () => MarketDim[];
  useTam: boolean;
  setUseTam: (useTam: boolean) => void;
  isMarketInTam: (productId: string, marketId: string) => boolean;
  getProductTamCities: (productId: string) => MarketDim[];
  getProductTamCountries: (productId: string) => MarketDim[];
  getProductTamRegions: (productId: string) => MarketDim[];
  isUserLocationInTam: (productId: string) => boolean;
  addCellComment: (comment: Omit<CellComment, "comment_id" | "created_at">) => void;
  updateCellComment: (commentId: string, updates: Partial<CellComment>) => void;
  getMarketsForRegion: (region: string) => MarketDim[];
  getMarketsForCountry: (countryCode: string) => MarketDim[];
  getCoverageStatusForCityProduct: (cityId: string, productId: string) => string;
  loadingState: boolean;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // State for markets, products, coverage, and blockers
  const [marketsData, setMarketsData] = useState<MarketDim[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [coverageData, setCoverageData] = useState<CoverageFact[]>([]);
  const [blockersData, setBlockersData] = useState<Blocker[]>([]);
  const [tamScopeState, setTamScopeState] = useState<TamScope[]>([]);
  const [cellCommentsState, setCellCommentsState] = useState<CellComment[]>([]);
  const [loadingState, setLoadingState] = useState<boolean>(true);
  
  // State for user preferences and filters
  const [coverageType, setCoverageType] = useState<'city_percentage' | 'gb_weighted' | 'tam_percentage'>('city_percentage');
  const [selectedLOBs, setSelectedLOBs] = useState<string[]>([]);
  const [selectedSubTeams, setSelectedSubTeams] = useState<string[]>([]);
  const [hideFullCoverage, setHideFullCoverage] = useState(false);
  const [useTam, setUseTam] = useState(false);
  
  // State for drill-down navigation
  const [currentLevel, setCurrentLevel] = useState<'region' | 'country' | 'city'>('region');
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  
  // Fetch data from Supabase on component mount
  useEffect(() => {
    async function fetchData() {
      setLoadingState(true);
      try {
        // Fetch markets
        const { data: markets, error: marketsError } = await supabase
          .from('market_dim')
          .select('*');
        
        if (marketsError) {
          console.error('Error fetching markets:', marketsError);
          toast.error('Failed to load market data');
        } else if (markets) {
          setMarketsData(markets);
        }
        
        // Fetch products (dummy data for now)
        const products: Product[] = Array.from({ length: 30 }, (_, i) => ({
          id: `prod_${String(i + 1).padStart(3, '0')}`,
          name: `Product ${i + 1}`,
          line_of_business: ['Mobility', 'Delivery', 'Core Services'][Math.floor(Math.random() * 3)],
          sub_team: ['Rider', 'Earner', 'AV', 'Delivery Marketplace'][Math.floor(Math.random() * 4)],
          status: Math.random() > 0.3 ? 'Active' : 'In Development',
        }));
        
        setProductsData(products);
        
        // Fetch coverage facts
        const { data: coverage, error: coverageError } = await supabase
          .from('coverage_fact')
          .select('*');
        
        if (coverageError) {
          console.error('Error fetching coverage:', coverageError);
          toast.error('Failed to load coverage data');
        } else if (coverage) {
          setCoverageData(coverage);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoadingState(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Function to check if a market is in TAM scope for a product
  const isMarketInTam = (productId: string, marketId: string): boolean => {
    // Simplified implementation until we have real TAM data
    return Math.random() > 0.5;
  };
  
  // Get all markets for a specific region
  const getMarketsForRegion = (region: string): MarketDim[] => {
    const uniqueCountries = new Map<string, MarketDim>();
    
    marketsData
      .filter(m => m.region === region)
      .forEach(market => {
        if (!uniqueCountries.has(market.country_code)) {
          uniqueCountries.set(market.country_code, {
            ...market,
            // Use these fields to store aggregated data at the country level
            id: market.id,
            city_id: market.city_id,
            city_name: market.city_name
          });
        }
      });
    
    return Array.from(uniqueCountries.values());
  };
  
  // Get all cities for a specific country
  const getMarketsForCountry = (countryCode: string): MarketDim[] => {
    return marketsData.filter(m => m.country_code === countryCode);
  };
  
  // Get the coverage status for a specific city and product
  const getCoverageStatusForCityProduct = (cityId: string, productId: string): string => {
    const coverageEntry = coverageData.find(c => 
      c.city_id === cityId && c.product_id === productId
    );
    
    return coverageEntry?.status || 'NOT_LIVE';
  };
  
  // Get all city children for a given market type (region or country)
  const getCityChildrenForMarket = (marketType: string, marketId: string): MarketDim[] => {
    if (marketType === 'region') {
      return marketsData.filter(m => m.region === marketId);
    } else if (marketType === 'country') {
      return marketsData.filter(m => m.country_code === marketId);
    }
    
    return [];
  };
  
  // Get all cities in TAM for a specific product
  const getProductTamCities = (productId: string): MarketDim[] => {
    // Simplified implementation until we have real TAM data
    return marketsData.filter(() => Math.random() > 0.7);
  };
  
  // Get all countries that have at least one city in TAM for a specific product
  const getProductTamCountries = (productId: string): MarketDim[] => {
    // Simplified implementation until we have real TAM data
    const uniqueCountries = new Map<string, MarketDim>();
    
    marketsData
      .filter(() => Math.random() > 0.7)
      .forEach(market => {
        if (!uniqueCountries.has(market.country_code)) {
          uniqueCountries.set(market.country_code, market);
        }
      });
    
    return Array.from(uniqueCountries.values());
  };
  
  // Get all regions that have at least one city in TAM for a specific product
  const getProductTamRegions = (productId: string): MarketDim[] => {
    // Simplified implementation until we have real TAM data
    const uniqueRegions = new Map<string, MarketDim>();
    
    marketsData
      .filter(() => Math.random() > 0.5)
      .forEach(market => {
        if (!uniqueRegions.has(market.region)) {
          uniqueRegions.set(market.region, market);
        }
      });
    
    return Array.from(uniqueRegions.values());
  };
  
  // Check if user's location (region/country) is in TAM for a product
  const isUserLocationInTam = (productId: string): boolean => {
    // Simplified implementation until we have real user location and TAM data
    return Math.random() > 0.5;
  };
  
  // Function to calculate the coverage percentage for a specific market and product
  const calculateCoveragePercentage = (marketType: string, marketId: string, productId: string): number => {
    if (marketType === 'city') {
      // For cities, coverage is either 0% or 100% based on the status
      const status = getCoverageStatusForCityProduct(marketId, productId);
      return status === 'LIVE' ? 100 : 0;
    } else if (marketType === 'country') {
      // For countries, calculate the percentage of cities that are LIVE
      const cities = getMarketsForCountry(marketId);
      if (cities.length === 0) return 0;
      
      const liveCities = cities.filter(city => 
        getCoverageStatusForCityProduct(city.city_id, productId) === 'LIVE'
      ).length;
      
      return (liveCities / cities.length) * 100;
    } else if (marketType === 'region') {
      // For regions, calculate the percentage of all cities in the region that are LIVE
      const regionCities = marketsData.filter(m => m.region === marketId);
      if (regionCities.length === 0) return 0;
      
      const liveCities = regionCities.filter(city => 
        getCoverageStatusForCityProduct(city.city_id, productId) === 'LIVE'
      ).length;
      
      return (liveCities / regionCities.length) * 100;
    }
    
    return 0;
  };
  
  // Function to get coverage value as a normalized cell for the heatmap
  const getCoverageCell = (productId: string, marketId: string): HeatmapCell | null => {
    // Determine the market type from the current level
    let marketType: string;
    if (currentLevel === 'region') {
      // Market ID is a region
      marketType = 'region';
    } else if (currentLevel === 'country') {
      // Market ID is a country code
      marketType = 'country';
    } else {
      // Market ID is a city ID
      marketType = 'city';
    }
    
    // Calculate the coverage percentage based on the market type
    const coverageValue = calculateCoveragePercentage(marketType, marketId, productId);
    
    // If useTam is true, adjust the calculation for TAM-only markets
    let value = coverageValue;
    if (useTam) {
      if (isMarketInTam(productId, marketId)) {
        value = Math.min(value * 1.15, 100); // Slightly boost TAM markets
      } else {
        value = Math.max(value * 0.85, 0); // Slightly reduce non-TAM markets
      }
    }
    
    // Check if there's a blocker
    const hasBlocker = blockersData.some(b => 
      b.product_id === productId && 
      b.market_id === marketId && 
      !b.resolved
    );
    
    const blocker = blockersData.find(b => 
      b.product_id === productId && 
      b.market_id === marketId && 
      !b.resolved
    );
    
    return {
      productId,
      marketId,
      coverage: value,
      status: value >= 95 ? 'green' : value >= 70 ? 'yellow' : 'red',
      hasBlocker,
      blockerId: blocker?.id
    };
  };
  
  // Helper functions for data access
  const getProductById = (productId: string) => productsData.find(p => p.id === productId);
  const getMarketById = (marketId: string) => marketsData.find(m => m.city_id === marketId);
  const getBlockerById = (blockerId: string) => blockersData.find(b => b.id === blockerId);
  
  // Function to add a new blocker
  const addBlocker = (blocker: Omit<Blocker, "id" | "created_at">) => {
    const newBlocker: Blocker = {
      ...blocker,
      id: `b-${blockersData.length + 1}`,
      created_at: new Date().toISOString(),
    };
    
    setBlockersData(prev => [...prev, newBlocker]);
  };
  
  // Function to update an existing blocker
  const updateBlocker = (blockerId: string, updates: Partial<Blocker>) => {
    setBlockersData(prev => prev.map(blocker => 
      blocker.id === blockerId 
        ? { ...blocker, ...updates, updated_at: new Date().toISOString() } 
        : blocker
    ));
  };
  
  // Function to add a new cell comment
  const addCellComment = (comment: Omit<CellComment, "comment_id" | "created_at">) => {
    const newComment: CellComment = {
      ...comment,
      comment_id: `c-${cellCommentsState.length + 1}`,
      created_at: new Date().toISOString(),
    };
    
    setCellCommentsState(prev => [...prev, newComment]);
  };
  
  // Function to update an existing cell comment
  const updateCellComment = (commentId: string, updates: Partial<CellComment>) => {
    setCellCommentsState(prev => prev.map(comment => 
      comment.comment_id === commentId 
        ? { 
            ...comment, 
            ...updates, 
            ...(updates.answer ? { 
              status: 'ANSWERED', 
              answered_at: new Date().toISOString() 
            } : {}) 
          } 
        : comment
    ));
  };
  
  // Function to update coverage data
  const updateCoverage = (productId: string, cityId: string, status: string) => {
    // Find the coverage entry
    const existingIndex = coverageData.findIndex(c => 
      c.product_id === productId && c.city_id === cityId
    );
    
    if (existingIndex >= 0) {
      // Update existing entry
      setCoverageData(prev => {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status,
          updated_at: new Date().toISOString()
        };
        return updated;
      });
      
      // Update in Supabase
      supabase
        .from('coverage_fact')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('product_id', productId)
        .eq('city_id', cityId)
        .then(({ error }) => {
          if (error) console.error('Error updating coverage:', error);
        });
    } else {
      // Create new entry
      const newEntry: CoverageFact = {
        id: Math.floor(Math.random() * 1000000), // Temporary ID
        product_id: productId,
        city_id: cityId,
        status,
        updated_at: new Date().toISOString()
      };
      
      setCoverageData(prev => [...prev, newEntry]);
      
      // Insert into Supabase
      supabase
        .from('coverage_fact')
        .insert(newEntry)
        .then(({ error }) => {
          if (error) console.error('Error inserting coverage:', error);
        });
    }
  };
  
  // Function to get visible markets based on current drill-down level
  const getVisibleMarkets = (): MarketDim[] => {
    if (currentLevel === 'region') {
      // At region level, we show the four main regions
      const regions = ['US&C', 'EMEA', 'APAC', 'LATAM'];
      return regions.map(region => {
        // Create a synthetic market for each region
        const regionMarket: MarketDim = {
          id: 0, // Placeholder
          region,
          country_code: region,
          country_name: region,
          city_id: region,
          city_name: region,
          gb_weight: 1.0, // Placeholder
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return regionMarket;
      });
    } else if (currentLevel === 'country') {
      if (!selectedParent) return [];
      
      // Get unique countries for the selected region
      const uniqueCountries = new Map<string, MarketDim>();
      
      marketsData
        .filter(m => m.region === selectedParent)
        .forEach(market => {
          if (!uniqueCountries.has(market.country_code)) {
            uniqueCountries.set(market.country_code, {
              ...market,
              city_id: market.country_code, // Use country code as the ID at country level
            });
          }
        });
      
      return Array.from(uniqueCountries.values());
    } else if (currentLevel === 'city') {
      if (!selectedParent) return [];
      
      // Get cities for the selected country
      return marketsData.filter(m => m.country_code === selectedParent);
    }
    
    return [];
  };
  
  // Function to get filtered products based on user selections
  const getFilteredProducts = (): Product[] => {
    let filtered = productsData;
    
    if (selectedLOBs.length > 0) {
      filtered = filtered.filter(p => selectedLOBs.includes(p.line_of_business));
    }
    
    if (selectedSubTeams.length > 0) {
      filtered = filtered.filter(p => selectedSubTeams.includes(p.sub_team));
    }
    
    if (hideFullCoverage) {
      filtered = filtered.filter(product => {
        const markets = getVisibleMarkets();
        return markets.some(market => {
          const cell = getCoverageCell(product.id, market.city_id);
          return cell && cell.coverage < 95;
        });
      });
    }
    
    return filtered;
  };
  
  // Function to get product notes combined with blocker information
  const getProductNotes = (productId: string): string => {
    const product = getProductById(productId);
    if (!product) return '';
    
    const productNotes = product.notes || '';
    
    const productBlockers = blockersData
      .filter(blocker => blocker.product_id === productId && !blocker.resolved)
      .map(blocker => `[${blocker.category}] ${blocker.note} (ETA: ${new Date(blocker.eta).toLocaleDateString()})`)
      .join('\n');
    
    return [productNotes, productBlockers].filter(Boolean).join('\n\n');
  };
  
  // Function to get all markets
  const getAllMarkets = (): MarketDim[] => {
    return marketsData;
  };
  
  return (
    <DashboardContext.Provider
      value={{
        products: productsData,
        blockers: blockersData,
        user: currentUser,
        coverageType,
        setCoverageType,
        selectedLOBs,
        setSelectedLOBs,
        selectedSubTeams,
        setSelectedSubTeams,
        hideFullCoverage,
        setHideFullCoverage,
        currentLevel,
        setCurrentLevel,
        selectedParent,
        setSelectedParent,
        getCoverageCell,
        getProductById,
        getMarketById,
        getBlockerById,
        addBlocker,
        updateBlocker,
        updateCoverage,
        getVisibleMarkets,
        getFilteredProducts,
        getProductNotes,
        getAllMarkets,
        useTam,
        setUseTam,
        isMarketInTam,
        getProductTamCities,
        getProductTamCountries,
        getProductTamRegions,
        isUserLocationInTam,
        addCellComment,
        updateCellComment,
        getMarketsForRegion,
        getMarketsForCountry,
        getCoverageStatusForCityProduct,
        loadingState
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
