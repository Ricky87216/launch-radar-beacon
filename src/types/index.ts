
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
export type DatabaseEscalationStatus = 'OPEN' | 'ALIGNED' | 'RESOLVED';

// Map between app status and database status for backward compatibility
export const mapAppStatusToDatabaseStatus = (status: EscalationStatus): string => {
  switch (status) {
    case 'SUBMITTED':
      return 'OPEN';
    case 'IN_DISCUSSION':
      return 'ALIGNED';
    case 'RESOLVED_BLOCKED':
    case 'RESOLVED_LAUNCHING':
    case 'RESOLVED_LAUNCHED':
      return 'RESOLVED';
    default:
      return 'OPEN';
  }
};

// Map between database status and app status
export const mapDatabaseStatusToAppStatus = (status: string): EscalationStatus => {
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
