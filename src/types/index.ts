
// Market dimensions
export interface Market {
  id: string;
  name: string;
  type: 'mega_region' | 'region' | 'country' | 'city';
  parent_id: string | null;
  geo_path: string;
}

// Product dimensions
export interface Product {
  id: string;
  name: string;
  line_of_business: string;
  sub_team: string;
  status: string;
  launch_date: string | null;
  notes?: string; // Added notes field for product status/blockers/next steps
}

// Coverage fact data
export interface Coverage {
  product_id: string;
  market_id: string;
  city_percentage: number;
  gb_weighted: number;
  tam_percentage?: number; // Added TAM percentage field
  updated_at: string;
}

// TAM scope data
export interface TamScope {
  product_id: string;
  city_id: string;
}

// Blocker data
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

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  region: string;
  country: string;
  role: 'viewer' | 'editor' | 'admin';
  canEditStatus: boolean;
}

// Heatmap Cell type
export interface HeatmapCell {
  productId: string;
  marketId: string;
  coverage: number;
  status: string;
  hasBlocker: boolean;
  blockerId?: string;
}

// Cell comment type
export interface CellComment {
  comment_id: string;
  product_id: string;
  city_id: string;
  author_id: string;
  question: string;
  answer: string | null;
  status: 'OPEN' | 'ANSWERED';
  created_at: string;
  answered_at: string | null;
  tam_escalation?: boolean;
}

// Escalation status type - our updated application type
export type EscalationStatus = 'SUBMITTED' | 'IN_DISCUSSION' | 'RESOLVED_BLOCKED' | 'RESOLVED_LAUNCHING' | 'RESOLVED_LAUNCHED';

// Database status type - for compatibility with Supabase database
export type DatabaseEscalationStatus = 'SUBMITTED' | 'IN_DISCUSSION' | 'RESOLVED_BLOCKED' | 'RESOLVED_LAUNCHING' | 'RESOLVED_LAUNCHED';

// Map between app status and database status for backward compatibility
export const mapAppStatusToDatabaseStatus = (status: EscalationStatus): DatabaseEscalationStatus => {
  // Since we've updated the database to use the same status values as our app,
  // we can directly return the same status
  return status;
};

// Map between database status and app status
export const mapDatabaseStatusToAppStatus = (status: string): EscalationStatus => {
  // Check if the status is already one of our valid EscalationStatus values
  const validStatuses: EscalationStatus[] = [
    'SUBMITTED', 'IN_DISCUSSION', 'RESOLVED_BLOCKED', 'RESOLVED_LAUNCHING', 'RESOLVED_LAUNCHED'
  ];
  
  if (validStatuses.includes(status as EscalationStatus)) {
    return status as EscalationStatus;
  }
  
  // Handle legacy statuses if any
  switch (status) {
    case 'OPEN':
      return 'SUBMITTED';
    case 'ALIGNED':
      return 'IN_DISCUSSION';
    case 'RESOLVED':
      return 'RESOLVED_LAUNCHED';
    default:
      return 'SUBMITTED';
  }
};

// New type for markets from market_dim table
export interface MarketDim {
  id: number;
  region: string;
  country_code: string;
  country_name: string;
  city_id: string;
  city_name: string;
  gb_weight: number;
  created_at: string;
  updated_at: string;
  
  // Adding compatibility properties for older components
  // These getters provide seamless compatibility with the Market interface
  get name(): string {
    return this.country_name || this.city_name || this.region;
  }
  
  get type(): 'mega_region' | 'region' | 'country' | 'city' {
    if (this.city_name && !this.city_id.includes('region-')) {
      return 'city';
    } else if (this.country_name && !this.country_code.includes('region-')) {
      return 'country'; 
    }
    return 'region';
  }
  
  get parent_id(): string | null {
    if (this.type === 'city') {
      return this.country_code;
    } else if (this.type === 'country') {
      return `region-${this.region}`;
    }
    return null;
  }
  
  get geo_path(): string {
    if (this.type === 'city') {
      return `${this.region}/${this.country_name}/${this.city_name}`;
    } else if (this.type === 'country') {
      return `${this.region}/${this.country_name}`;
    }
    return this.region;
  }
}

// New type for coverage_fact table
export interface CoverageFact {
  id: number;
  product_id: string;
  city_id: string;
  status: string;
  updated_at: string;
}

// Helper function to convert MarketDim to Market for full compatibility
export const marketDimToMarket = (marketDim: MarketDim): Market => {
  return {
    id: marketDim.city_id,
    name: marketDim.name,
    type: marketDim.type,
    parent_id: marketDim.parent_id,
    geo_path: marketDim.geo_path
  };
};

// Helper function to convert an array of MarketDim to Market[]
export const marketDimsToMarkets = (marketDims: MarketDim[]): Market[] => {
  return marketDims.map(marketDim => marketDimToMarket(marketDim));
};
