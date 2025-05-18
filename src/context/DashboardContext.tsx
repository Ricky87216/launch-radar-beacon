import React, { createContext, useContext, useState, ReactNode } from "react";
import { 
  Market, 
  Product, 
  Coverage, 
  Blocker, 
  User, 
  HeatmapCell,
  TamScope,
  CellComment,
  ProductMeta,
  UserWatchlistItem
} from "../types";
import { 
  markets, 
  products, 
  coverageData, 
  blockers, 
  currentUser,
  tamScopeData,
  productMetaData,
  userWatchlist
} from "../data/mockData";

interface DashboardContextProps {
  markets: Market[];
  products: Product[];
  coverageData: Coverage[];
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
  currentLevel: 'mega_region' | 'region' | 'country' | 'city';
  setCurrentLevel: (level: 'mega_region' | 'region' | 'country' | 'city') => void;
  selectedParent: string | null;
  setSelectedParent: (parentId: string | null) => void;
  getCoverageCell: (productId: string, marketId: string) => HeatmapCell | null;
  getProductById: (productId: string) => Product | undefined;
  getMarketById: (marketId: string) => Market | undefined;
  getBlockerById: (blockerId: string) => Blocker | undefined;
  addBlocker: (blocker: Omit<Blocker, "id" | "created_at">) => void;
  updateBlocker: (blockerId: string, updates: Partial<Blocker>) => void;
  updateCoverage: (productId: string, marketId: string, value: number) => void;
  getVisibleMarkets: () => Market[];
  getFilteredProducts: () => Product[];
  getProductNotes: (productId: string) => string;
  getAllMarkets: () => Market[];
  useTam: boolean;
  setUseTam: (useTam: boolean) => void;
  isMarketInTam: (productId: string, marketId: string) => boolean;
  getProductTamCities: (productId: string) => Market[];
  getProductTamCountries: (productId: string) => Market[];
  getProductTamRegions: (productId: string) => Market[];
  isUserLocationInTam: (productId: string) => boolean;
  addCellComment: (comment: Omit<CellComment, "comment_id" | "created_at">) => void;
  updateCellComment: (commentId: string, updates: Partial<CellComment>) => void;
  getProductMeta: (productId: string) => ProductMeta | undefined;
  updateProductMeta: (productId: string, updates: Partial<ProductMeta>) => void;
  watchProduct: (productId: string) => void;
  unwatchProduct: (productId: string) => void;
  isProductWatched: (productId: string) => boolean;
  getWatchedProducts: () => Product[];
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // State for markets, products, coverage, and blockers
  const [marketsData, setMarketsData] = useState<Market[]>(markets);
  const [productsData, setProductsData] = useState<Product[]>(products);
  const [coverageDataState, setCoverageDataState] = useState<Coverage[]>(coverageData);
  const [blockersData, setBlockersData] = useState<Blocker[]>(blockers);
  const [tamScopeState, setTamScopeState] = useState<TamScope[]>(tamScopeData || []);
  const [cellCommentsState, setCellCommentsState] = useState<CellComment[]>([]);
  
  // State for user preferences and filters
  const [coverageType, setCoverageType] = useState<'city_percentage' | 'gb_weighted' | 'tam_percentage'>('city_percentage');
  const [selectedLOBs, setSelectedLOBs] = useState<string[]>([]);
  const [selectedSubTeams, setSelectedSubTeams] = useState<string[]>([]);
  const [hideFullCoverage, setHideFullCoverage] = useState(false);
  const [useTam, setUseTam] = useState(false);
  
  // State for drill-down navigation
  const [currentLevel, setCurrentLevel] = useState<'mega_region' | 'region' | 'country' | 'city'>('mega_region');
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  
  // State for product metadata and user watchlist
  const [productMetaState, setProductMetaState] = useState<ProductMeta[]>(productMetaData || []);
  const [userWatchlistState, setUserWatchlistState] = useState<UserWatchlistItem[]>(userWatchlist || []);
  
  // Function to check if a market is in TAM scope for a product
  const isMarketInTam = (productId: string, marketId: string): boolean => {
    // If the market is a city, check directly
    const market = getMarketById(marketId);
    if (!market) return false;
    
    if (market.type === 'city') {
      return tamScopeState.some(ts => ts.product_id === productId && ts.city_id === marketId);
    } else {
      // For non-city markets, check if any children cities are in TAM
      const cityChildren = getCityChildrenForMarket(marketId);
      return cityChildren.some(city => tamScopeState.some(ts => ts.product_id === productId && ts.city_id === city.id));
    }
  };
  
  // Get all city children for a given market
  const getCityChildrenForMarket = (marketId: string): Market[] => {
    const market = getMarketById(marketId);
    if (!market) return [];
    
    if (market.type === 'city') return [market];
    
    // For non-city markets, recursively get all city children
    let cities: Market[] = [];
    
    if (market.type === 'country') {
      cities = marketsData.filter(m => m.type === 'city' && m.parent_id === marketId);
    } else if (market.type === 'region') {
      const countries = marketsData.filter(m => m.type === 'country' && m.parent_id === marketId);
      countries.forEach(country => {
        cities = [...cities, ...marketsData.filter(m => m.type === 'city' && m.parent_id === country.id)];
      });
    } else if (market.type === 'mega_region') {
      const regions = marketsData.filter(m => m.type === 'region' && m.parent_id === marketId);
      regions.forEach(region => {
        const countries = marketsData.filter(m => m.type === 'country' && m.parent_id === region.id);
        countries.forEach(country => {
          cities = [...cities, ...marketsData.filter(m => m.type === 'city' && m.parent_id === country.id)];
        });
      });
    }
    
    return cities;
  };
  
  // Get all cities in TAM for a specific product
  const getProductTamCities = (productId: string): Market[] => {
    const tamCityIds = tamScopeState
      .filter(ts => ts.product_id === productId)
      .map(ts => ts.city_id);
    
    return marketsData.filter(m => m.type === 'city' && tamCityIds.includes(m.id));
  };
  
  // Get all countries that have at least one city in TAM for a specific product
  const getProductTamCountries = (productId: string): Market[] => {
    const tamCities = getProductTamCities(productId);
    const tamCountryIds = new Set(tamCities.map(city => city.parent_id).filter(Boolean) as string[]);
    
    return marketsData.filter(m => m.type === 'country' && tamCountryIds.has(m.id));
  };
  
  // Get all regions that have at least one city in TAM for a specific product
  const getProductTamRegions = (productId: string): Market[] => {
    const tamCountries = getProductTamCountries(productId);
    const tamRegionIds = new Set(tamCountries.map(country => country.parent_id).filter(Boolean) as string[]);
    
    return marketsData.filter(m => m.type === 'region' && tamRegionIds.has(m.id));
  };
  
  // Check if user's location (region/country) is in TAM for a product
  const isUserLocationInTam = (productId: string): boolean => {
    // First check if user's country is in TAM
    const userCountry = marketsData.find(m => m.type === 'country' && m.name === currentUser.country);
    
    if (userCountry) {
      // Check if any city in this country is in TAM
      const citiesInCountry = marketsData.filter(m => m.type === 'city' && m.parent_id === userCountry.id);
      return citiesInCountry.some(city => tamScopeState.some(ts => ts.product_id === productId && ts.city_id === city.id));
    }
    
    return false;
  };
  
  // Function to get coverage value as a normalized cell for the heatmap
  const getCoverageCell = (productId: string, marketId: string): HeatmapCell | null => {
    const coverage = coverageDataState.find(c => 
      c.product_id === productId && c.market_id === marketId
    );
    
    if (!coverage) return null;
    
    let value: number;
    
    if (coverageType === 'city_percentage') {
      value = coverage.city_percentage;
    } else if (coverageType === 'gb_weighted') {
      value = coverage.gb_weighted;
    } else {
      // TAM percentage - for demo purposes, let's calculate it based on other metrics
      // In a real implementation, this would come from the database or be calculated server-side
      value = coverage.tam_percentage || (coverage.city_percentage * 1.2 > 100 ? 100 : coverage.city_percentage * 1.2);
    }
    
    // If useTam is true, adjust the calculation for TAM-only markets
    if (useTam) {
      const market = getMarketById(marketId);
      if (!market) return null;
      
      // For demo purposes, we'll simply adjust the value by a factor
      // In a real implementation, this would be calculated differently
      if (isMarketInTam(productId, marketId)) {
        value = Math.min(value * 1.15, 100); // Slightly boost TAM markets
      } else {
        value = Math.max(value * 0.85, 0); // Slightly reduce non-TAM markets
      }
    }
    
    const blocker = blockersData.find(b => 
      b.product_id === productId && 
      b.market_id === marketId && 
      !b.resolved
    );
    
    return {
      productId,
      marketId,
      coverage: value,
      status: blocker ? 'blocked' : value >= 95 ? 'green' : value >= 70 ? 'yellow' : 'red',
      hasBlocker: !!blocker,
      blockerId: blocker?.id
    };
  };
  
  // Helper functions for data access
  const getProductById = (productId: string) => productsData.find(p => p.id === productId);
  const getMarketById = (marketId: string) => marketsData.find(m => m.id === marketId);
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
  const updateCoverage = (productId: string, marketId: string, value: number) => {
    setCoverageDataState(prev => prev.map(c => 
      c.product_id === productId && c.market_id === marketId
        ? { ...c, [coverageType]: value, updated_at: new Date().toISOString() }
        : c
    ));
  };
  
  // Function to get visible markets based on current drill-down level
  const getVisibleMarkets = (): Market[] => {
    if (currentLevel === 'mega_region') {
      return marketsData.filter(m => m.type === 'mega_region');
    }
    
    if (!selectedParent) return [];
    
    return marketsData.filter(m => m.type === currentLevel && m.parent_id === selectedParent);
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
          const cell = getCoverageCell(product.id, market.id);
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
  const getAllMarkets = (): Market[] => {
    return marketsData;
  };
  
  // Function to get product metadata
  const getProductMeta = (productId: string): ProductMeta | undefined => {
    return productMetaState.find(meta => meta.product_id === productId);
  };
  
  // Function to update product metadata
  const updateProductMeta = (productId: string, updates: Partial<ProductMeta>) => {
    setProductMetaState(prev => {
      const existingIndex = prev.findIndex(meta => meta.product_id === productId);
      if (existingIndex >= 0) {
        // Update existing metadata
        const newArray = [...prev];
        newArray[existingIndex] = { ...newArray[existingIndex], ...updates };
        return newArray;
      } else {
        // Create new metadata entry
        return [...prev, { product_id: productId, ...updates }];
      }
    });
  };
  
  // Function to add product to user watchlist
  const watchProduct = (productId: string) => {
    if (!isProductWatched(productId)) {
      setUserWatchlistState(prev => [
        ...prev,
        {
          product_id: productId,
          created_at: new Date().toISOString()
        }
      ]);
    }
  };
  
  // Function to remove product from user watchlist
  const unwatchProduct = (productId: string) => {
    setUserWatchlistState(prev => prev.filter(
      item => item.product_id !== productId
    ));
  };
  
  // Function to check if a product is in user watchlist
  const isProductWatched = (productId: string): boolean => {
    return userWatchlistState.some(item => item.product_id === productId);
  };
  
  // Function to get all watched products
  const getWatchedProducts = (): Product[] => {
    return productsData.filter(product => 
      userWatchlistState.some(item => item.product_id === product.id)
    );
  };
  
  return (
    <DashboardContext.Provider
      value={{
        markets: marketsData,
        products: productsData,
        coverageData: coverageDataState,
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
        getProductMeta,
        updateProductMeta,
        watchProduct,
        unwatchProduct,
        isProductWatched,
        getWatchedProducts
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
