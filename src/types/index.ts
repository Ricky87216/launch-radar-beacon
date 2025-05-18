
export interface User {
  id: string;
  name: string;
  email: string;
  region: string;
  country: string;
  role: string;
  canEditStatus: boolean;
}

export interface Product {
  id: string;
  name: string;
  line_of_business: string;
  sub_team: string;
  status: string;
  launch_date: string | null;
  notes: string;
}

export interface Market {
  id: string;
  name: string;
  type: 'mega_region' | 'region' | 'country' | 'city';
  parent_id: string | null;
  geo_path: string;
  gb_weight: number;
}

export interface MarketDim {
  id: number;
  city_id: string;
  gb_weight: number;
  created_at: string;
  updated_at: string;
  country_name: string;
  city_name: string;
  region: string;
  country_code: string;
}

export interface Coverage {
  product_id: string;
  market_id: string;
  city_percentage: number;
  gb_weighted: number;
  tam_percentage: number;
  updated_at: string;
}

export interface TamScope {
  product_id: string;
  city_id: string;
}

export interface CoverageFact {
  id: number;
  updated_at: string;
  status: string;
  city_id: string;
  product_id: string;
}

export interface Blocker {
  id: string;
  product_id: string;
  market_id: string;
  category: string;
  owner: string;
  eta: string;
  note: string;
  jira_url: string | null;
  escalated: boolean;
  created_at: string;
  updated_at: string;
  resolved: boolean;
  stale: boolean;
}

export interface CellComment {
  comment_id: string;
  product_id: string;
  city_id: string;
  author_id: string;
  question: string;
  answer: string;
  status: string;
  created_at: string;
  answered_at: string | null;
  tam_escalation: boolean;
}

export interface HeatmapCell {
  productId: string;
  marketId: string;
  coverage: number;
  status: string;
  hasBlocker: boolean;
  blockerId?: string;
}

// Define escalation status types
export type EscalationStatus = 'SUBMITTED' | 'IN_DISCUSSION' | 'RESOLVED_BLOCKED' | 'RESOLVED_LAUNCHING' | 'RESOLVED_LAUNCHED';
export type DatabaseEscalationStatus = 'OPEN' | 'DISCUSSION' | 'BLOCKED' | 'LAUNCHING' | 'ALIGNED';
export type MarketType = 'city' | 'country' | 'region';

// Maps the application status to the corresponding database status
export const mapAppStatusToDatabaseStatus = (appStatus: EscalationStatus): DatabaseEscalationStatus => {
  const statusMap: Record<EscalationStatus, DatabaseEscalationStatus> = {
    'SUBMITTED': 'OPEN',
    'IN_DISCUSSION': 'DISCUSSION',
    'RESOLVED_BLOCKED': 'BLOCKED',
    'RESOLVED_LAUNCHING': 'LAUNCHING',
    'RESOLVED_LAUNCHED': 'ALIGNED'
  };
  return statusMap[appStatus];
};

// Maps the database status to the corresponding application status
export const mapDatabaseStatusToAppStatus = (dbStatus: DatabaseEscalationStatus): EscalationStatus => {
  const statusMap: Record<DatabaseEscalationStatus, EscalationStatus> = {
    'OPEN': 'SUBMITTED',
    'DISCUSSION': 'IN_DISCUSSION',
    'BLOCKED': 'RESOLVED_BLOCKED',
    'LAUNCHING': 'RESOLVED_LAUNCHING',
    'ALIGNED': 'RESOLVED_LAUNCHED'
  };
  return statusMap[dbStatus];
};

export const marketDimToMarket = (marketDim: MarketDim): Market => ({
  id: marketDim.city_id,
  name: marketDim.city_name || marketDim.country_name || marketDim.region,
  type: getMarketDimType(marketDim),
  parent_id: getMarketDimParentId(marketDim),
  geo_path: getMarketDimGeoPath(marketDim),
  gb_weight: marketDim.gb_weight
});

export const marketDimsToMarkets = (marketDims: MarketDim[]): Market[] => {
  return marketDims.map(marketDimToMarket);
};

export const getMarketDimType = (marketDim: MarketDim): Market['type'] => {
  if (marketDim.city_name) {
    return 'city';
  } else if (marketDim.country_code) {
    return 'country';
  } else {
    return 'region';
  }
};

export const getMarketDimName = (marketDim: MarketDim): string => {
  return marketDim.city_name || marketDim.country_name || marketDim.region;
};

export const getMarketDimParentId = (marketDim: MarketDim): string | null => {
  if (marketDim.city_name) {
    return marketDim.country_code; // Country is parent of city
  } else if (marketDim.country_code) {
    return `region-${marketDim.region}`; // Region is parent of country
  } else {
    return null; // Mega-region has no parent
  }
};

export const getMarketDimGeoPath = (marketDim: MarketDim): string => {
  if (marketDim.city_name) {
    return `${marketDim.region}/${marketDim.country_code}/${marketDim.city_name}`;
  } else if (marketDim.country_code) {
    return `${marketDim.region}/${marketDim.country_code}`;
  } else {
    return marketDim.region;
  }
};

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
  
  // Drill level navigation
  drillLevel: 0 | 1 | 2; // 0 = Region, 1 = Country/State, 2 = City
  setDrillLevel: (level: 0 | 1 | 2) => void;
  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;
  selectedCountry: string | null;
  setSelectedCountry: (country: string | null) => void;
  
  // Replacing the old navigation
  currentLevel: 'region' | 'country' | 'city';
  setCurrentLevel: (level: 'region' | 'country' | 'city') => void;
  selectedParent: string | null;
  setSelectedParent: (parent: string | null) => void;
  
  coverageType: 'city_percentage' | 'gb_weighted';
  setCoverageType: (type: 'city_percentage' | 'gb_weighted') => void;
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
  
  // Navigation helper methods
  resetToLevel: (level: 0 | 1 | 2) => void;
  getColumnsForCurrentLevel: () => string[];
  handleCellClick: (geoKey: string) => void;
  
  // Add isMarketInTam to the interface
  isMarketInTam: (marketId: string, productId: string) => boolean;
}
