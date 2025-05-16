
import React, { createContext, useContext, useState, ReactNode } from "react";
import { 
  Market, 
  Product, 
  Coverage, 
  Blocker, 
  User, 
  HeatmapCell 
} from "../types";
import { 
  markets, 
  products, 
  coverageData, 
  blockers, 
  currentUser 
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
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // State for markets, products, coverage, and blockers
  const [marketsData, setMarketsData] = useState<Market[]>(markets);
  const [productsData, setProductsData] = useState<Product[]>(products);
  const [coverageDataState, setCoverageDataState] = useState<Coverage[]>(coverageData);
  const [blockersData, setBlockersData] = useState<Blocker[]>(blockers);
  
  // State for user preferences and filters
  const [coverageType, setCoverageType] = useState<'city_percentage' | 'gb_weighted' | 'tam_percentage'>('city_percentage');
  const [selectedLOBs, setSelectedLOBs] = useState<string[]>([]);
  const [selectedSubTeams, setSelectedSubTeams] = useState<string[]>([]);
  const [hideFullCoverage, setHideFullCoverage] = useState(false);
  
  // State for drill-down navigation
  const [currentLevel, setCurrentLevel] = useState<'mega_region' | 'region' | 'country' | 'city'>('mega_region');
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  
  // Function to get coverage value as a normalized cell for the heatmap
  const getCoverageCell = (productId: string, marketId: string): HeatmapCell | null => {
    const coverage = coverageDataState.find(c => 
      c.product_id === productId && c.market_id === marketId
    );
    
    if (!coverage) return null;
    
    let value;
    switch (coverageType) {
      case 'city_percentage':
        value = coverage.city_percentage;
        break;
      case 'gb_weighted':
        value = coverage.gb_weighted;
        break;
      case 'tam_percentage':
        // For demo purposes, we'll use a calculation based on existing values
        // In a real app, this would come from the actual data
        value = (coverage.city_percentage * 0.7) + (coverage.gb_weighted * 0.3);
        break;
      default:
        value = coverage.city_percentage;
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
        getAllMarkets
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
