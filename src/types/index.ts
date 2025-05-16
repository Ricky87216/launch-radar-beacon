export interface Market {
  id: string;
  name: string;
  type: 'mega_region' | 'region' | 'country' | 'city';
  parent_id: string | null;
}

export interface Product {
  id: string;
  name: string;
  line_of_business: string;
  sub_team: string;
  notes: string;
}

export interface Coverage {
  product_id: string;
  market_id: string;
  city_percentage: number;
  gb_weighted: number;
  updated_at: string | null;
}

export interface Blocker {
  id: string;
  product_id: string;
  market_id: string;
  category: string;
  note: string;
  eta: string;
  created_at: string;
  updated_at: string | null;
  resolved: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface HeatmapCell {
  productId: string;
  marketId: string;
  coverage: number;
  status: 'green' | 'yellow' | 'red' | 'blocked';
  hasBlocker: boolean;
  blockerId?: string;
}

export interface DashboardFilters {
  coverageType: 'city_percentage' | 'gb_weighted' | 'tam_percentage';
  selectedLOBs: string[];
  selectedSubTeams: string[];
  hideFullCoverage: boolean;
}
