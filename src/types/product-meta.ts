
// Product metadata types

export interface ProductMeta {
  product_id: string;
  pm_poc: string | null;
  prod_ops_poc: string | null;
  prd_link: string | null;
  figma_link?: string | null; // Made optional with ?
  description: string | null;
  launch_date: string | null;
  xp_plan: string | null;
  newsletter_url: string | null;
  company_priority: string | null;
  screenshot_url: string | null;
}

export interface WatchlistItem {
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface ProductStatusSummary {
  coverage_percentage: number;
  blocker_count: number;
  escalation_count: number;
}
