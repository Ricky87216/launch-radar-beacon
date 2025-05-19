
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
  jira_url?: string;
  escalated: boolean;
  created_at: string;
  updated_at: string;
  resolved: boolean;
  stale: boolean;
  escalation?: Escalation; // Add the optional escalation property
}

// Extended Blocker with additional data for UI display
export interface ExtendedBlocker extends Blocker {
  product_name?: string;
  market_name?: string;
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
export type EscalationStatus = 
  | 'SUBMITTED' 
  | 'IN_REVIEW' 
  | 'IN_DISCUSSION' 
  | 'ALIGNED' 
  | 'ESCALATED_TO_LEGAL' 
  | 'RESOLVED_APPROVED' 
  | 'RESOLVED_EXCEPTION' 
  | 'RESOLVED_REJECTED'
  | 'RESOLVED_BLOCKED'
  | 'RESOLVED_LAUNCHING'
  | 'RESOLVED_LAUNCHED';

// Database status type - the actual statuses in the Supabase database
export type DatabaseEscalationStatus = 'OPEN' | 'ALIGNED' | 'RESOLVED';

// Map between app status and database status for backward compatibility
export const mapAppStatusToDatabaseStatus = (status: EscalationStatus): DatabaseEscalationStatus => {
  // Map our app statuses to database statuses
  switch (status) {
    case 'SUBMITTED':
      return 'OPEN';
    case 'IN_REVIEW':
      return 'ALIGNED';
    case 'IN_DISCUSSION':
      return 'ALIGNED';
    case 'ALIGNED':
      return 'ALIGNED';
    case 'ESCALATED_TO_LEGAL':
      return 'ALIGNED';
    case 'RESOLVED_APPROVED':
      return 'RESOLVED';
    case 'RESOLVED_EXCEPTION':
      return 'RESOLVED';
    case 'RESOLVED_REJECTED':
      return 'RESOLVED';
    case 'RESOLVED_BLOCKED':
      return 'RESOLVED';
    case 'RESOLVED_LAUNCHING':
      return 'RESOLVED';
    case 'RESOLVED_LAUNCHED':
      return 'RESOLVED';
    default:
      return 'OPEN';
  }
};

// Map between database status and app status
export const mapDatabaseStatusToAppStatus = (status: string): EscalationStatus => {
  // Check if the status is already one of our valid EscalationStatus values
  const validStatuses: EscalationStatus[] = [
    'SUBMITTED', 'IN_REVIEW', 'IN_DISCUSSION', 'ALIGNED', 'ESCALATED_TO_LEGAL', 'RESOLVED_APPROVED', 
    'RESOLVED_EXCEPTION', 'RESOLVED_REJECTED', 'RESOLVED_BLOCKED', 'RESOLVED_LAUNCHING', 'RESOLVED_LAUNCHED'
  ];
  
  if (validStatuses.includes(status as EscalationStatus)) {
    return status as EscalationStatus;
  }
  
  // Handle legacy statuses
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

export interface Escalation {
  id: string;
  status: EscalationStatus;
  raised_by: string;
  created_at: string;
  reason_type?: string;
  notes?: string; // Added the notes property to fix the TypeScript error
}
