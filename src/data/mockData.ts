import { 
  Market, 
  Product, 
  User, 
  Blocker,
  ProductMeta,
  UserWatchlistItem
} from "../types";

// Mock market data
export const markets: Market[] = [
  // Mega regions
  { id: "mr-1", name: "Global", type: "mega_region", parent_id: null, geo_path: "Global", gb_weight: 100 },
  { id: "mr-2", name: "Americas", type: "mega_region", parent_id: null, geo_path: "Americas", gb_weight: 40 },
  { id: "mr-3", name: "EMEA", type: "mega_region", parent_id: null, geo_path: "EMEA", gb_weight: 30 },
  { id: "mr-4", name: "APAC", type: "mega_region", parent_id: null, geo_path: "APAC", gb_weight: 30 },
  
  // Regions
  { id: "r-1", name: "North America", type: "region", parent_id: "mr-2", geo_path: "Americas/North America", gb_weight: 35 },
  { id: "r-2", name: "Latin America", type: "region", parent_id: "mr-2", geo_path: "Americas/Latin America", gb_weight: 5 },
  { id: "r-3", name: "Western Europe", type: "region", parent_id: "mr-3", geo_path: "EMEA/Western Europe", gb_weight: 20 },
  { id: "r-4", name: "Eastern Europe", type: "region", parent_id: "mr-3", geo_path: "EMEA/Eastern Europe", gb_weight: 5 },
  { id: "r-5", name: "Middle East", type: "region", parent_id: "mr-3", geo_path: "EMEA/Middle East", gb_weight: 5 },
  { id: "r-6", name: "East Asia", type: "region", parent_id: "mr-4", geo_path: "APAC/East Asia", gb_weight: 15 },
  { id: "r-7", name: "South Asia", type: "region", parent_id: "mr-4", geo_path: "APAC/South Asia", gb_weight: 10 },
  { id: "r-8", name: "Oceania", type: "region", parent_id: "mr-4", geo_path: "APAC/Oceania", gb_weight: 5 },
  
  // Countries
  { id: "c-1", name: "United States", type: "country", parent_id: "r-1", geo_path: "Americas/North America/United States", gb_weight: 30 },
  { id: "c-2", name: "Canada", type: "country", parent_id: "r-1", geo_path: "Americas/North America/Canada", gb_weight: 5 },
  { id: "c-3", name: "Mexico", type: "country", parent_id: "r-2", geo_path: "Americas/Latin America/Mexico", gb_weight: 2 },
  { id: "c-4", name: "Brazil", type: "country", parent_id: "r-2", geo_path: "Americas/Latin America/Brazil", gb_weight: 3 },
  { id: "c-5", name: "United Kingdom", type: "country", parent_id: "r-3", geo_path: "EMEA/Western Europe/United Kingdom", gb_weight: 5 },
  { id: "c-6", name: "France", type: "country", parent_id: "r-3", geo_path: "EMEA/Western Europe/France", gb_weight: 5 },
  { id: "c-7", name: "Germany", type: "country", parent_id: "r-3", geo_path: "EMEA/Western Europe/Germany", gb_weight: 7 },
  { id: "c-8", name: "Poland", type: "country", parent_id: "r-4", geo_path: "EMEA/Eastern Europe/Poland", gb_weight: 3 },
  { id: "c-9", name: "UAE", type: "country", parent_id: "r-5", geo_path: "EMEA/Middle East/UAE", gb_weight: 2 },
  { id: "c-10", name: "Japan", type: "country", parent_id: "r-6", geo_path: "APAC/East Asia/Japan", gb_weight: 8 },
  
  // Cities
  { id: "city-1", name: "New York", type: "city", parent_id: "c-1", geo_path: "Americas/North America/United States/New York", gb_weight: 7 },
  { id: "city-2", name: "Los Angeles", type: "city", parent_id: "c-1", geo_path: "Americas/North America/United States/Los Angeles", gb_weight: 5 },
  { id: "city-3", name: "Chicago", type: "city", parent_id: "c-1", geo_path: "Americas/North America/United States/Chicago", gb_weight: 4 },
  { id: "city-4", name: "Toronto", type: "city", parent_id: "c-2", geo_path: "Americas/North America/Canada/Toronto", gb_weight: 3 },
  { id: "city-5", name: "Vancouver", type: "city", parent_id: "c-2", geo_path: "Americas/North America/Canada/Vancouver", gb_weight: 2 },
  { id: "city-6", name: "Mexico City", type: "city", parent_id: "c-3", geo_path: "Americas/Latin America/Mexico/Mexico City", gb_weight: 2 },
  { id: "city-7", name: "Rio de Janeiro", type: "city", parent_id: "c-4", geo_path: "Americas/Latin America/Brazil/Rio de Janeiro", gb_weight: 1.5 },
  { id: "city-8", name: "Sao Paulo", type: "city", parent_id: "c-4", geo_path: "Americas/Latin America/Brazil/Sao Paulo", gb_weight: 1.5 },
  { id: "city-9", name: "London", type: "city", parent_id: "c-5", geo_path: "EMEA/Western Europe/United Kingdom/London", gb_weight: 3 },
  { id: "city-10", name: "Manchester", type: "city", parent_id: "c-5", geo_path: "EMEA/Western Europe/United Kingdom/Manchester", gb_weight: 1 },
  { id: "city-11", name: "Paris", type: "city", parent_id: "c-6", geo_path: "EMEA/Western Europe/France/Paris", gb_weight: 3 },
  { id: "city-12", name: "Tokyo", type: "city", parent_id: "c-10", geo_path: "APAC/East Asia/Japan/Tokyo", gb_weight: 4 },
];

// Mock product data
export const products: Product[] = [
  { id: "p-1", name: "Product Alpha", line_of_business: "Enterprise", sub_team: "Team A", status: "Active", launch_date: "2023-06-15", notes: "Rolling out to enterprise customers." },
  { id: "p-2", name: "Product Beta", line_of_business: "Consumer", sub_team: "Team B", status: "Planning", launch_date: "2024-01-20", notes: "Market research in progress." },
  { id: "p-3", name: "Product Gamma", line_of_business: "SMB", sub_team: "Team C", status: "Testing", launch_date: "2023-09-01", notes: "Beta testing with select customers." },
  { id: "p-4", name: "Product Delta", line_of_business: "Enterprise", sub_team: "Team A", status: "Development", launch_date: null, notes: "In active development." },
  { id: "p-5", name: "Product Epsilon", line_of_business: "Consumer", sub_team: "Team D", status: "Active", launch_date: "2022-11-10", notes: "High adoption in APAC region." },
  { id: "p-6", name: "Product Zeta", line_of_business: "Consumer", sub_team: "Team B", status: "Sunset", launch_date: "2021-05-22", notes: "Being phased out over next 6 months." },
  { id: "p-7", name: "Product Eta", line_of_business: "SMB", sub_team: "Team C", status: "Planning", launch_date: null, notes: "Preliminary planning phase." },
  { id: "p-8", name: "Product Theta", line_of_business: "Enterprise", sub_team: "Team A", status: "Active", launch_date: "2023-03-17", notes: "Recently launched to enterprise customers." },
];

// Mock product metadata
export const productMetaData: ProductMeta[] = [
  { 
    product_id: "p-1",
    description: "Enterprise-grade solution for large businesses, focusing on security and scalability.",
    pm_poc: "Jane Smith",
    prod_ops_poc: "John Doe",
    prd_link: "https://example.com/docs/product-alpha",
    launch_date: new Date("2023-06-15"),
    xp_plan: "Q3 2023 expansion to EMEA markets",
    newsletter_url: "https://example.com/subscribe/product-alpha",
    company_priority: "High - Strategic Growth",
    screenshot_url: "https://via.placeholder.com/640x480?text=Product+Alpha+Screenshot"
  },
  { 
    product_id: "p-2",
    description: "Consumer-facing application focusing on user engagement and ease of use.",
    pm_poc: "Michael Brown",
    prod_ops_poc: "Sarah Johnson",
    prd_link: "https://example.com/docs/product-beta",
    launch_date: new Date("2024-01-20"),
    xp_plan: "Q1 2024 soft launch in North America",
    newsletter_url: "https://example.com/subscribe/product-beta",
    company_priority: "Medium - Innovation Pipeline"
  },
  { 
    product_id: "p-3",
    description: "Solution designed for small and medium businesses with focus on affordability and essential features.",
    pm_poc: "Robert Lee",
    prod_ops_poc: "Emily Chen",
    prd_link: "https://example.com/docs/product-gamma",
    launch_date: new Date("2023-09-01"),
    xp_plan: "Q4 2023 full release",
    newsletter_url: "https://example.com/subscribe/product-gamma",
    company_priority: "Medium - Market Expansion"
  },
  { 
    product_id: "p-5",
    description: "Flagship consumer product with broad market appeal and strong adoption rates.",
    pm_poc: "Jennifer Wong",
    prod_ops_poc: "David Park",
    prd_link: "https://example.com/docs/product-epsilon",
    launch_date: new Date("2022-11-10"),
    xp_plan: "Ongoing feature enhancements",
    newsletter_url: "https://example.com/subscribe/product-epsilon",
    company_priority: "High - Revenue Driver",
    screenshot_url: "https://via.placeholder.com/640x480?text=Product+Epsilon+Screenshot"
  },
  { 
    product_id: "p-8",
    description: "Advanced enterprise solution designed for large-scale deployment and integration.",
    pm_poc: "Chris Taylor",
    prod_ops_poc: "Amanda Garcia",
    prd_link: "https://example.com/docs/product-theta",
    launch_date: new Date("2023-03-17"),
    xp_plan: "Q2 2023 feature expansion",
    newsletter_url: "https://example.com/subscribe/product-theta",
    company_priority: "High - Strategic Customer Retention",
    screenshot_url: "https://via.placeholder.com/640x480?text=Product+Theta+Screenshot"
  }
];

// Mock user watchlist
export const userWatchlist: UserWatchlistItem[] = [
  {
    product_id: "p-1",
    created_at: "2023-05-15T10:30:00Z"
  },
  {
    product_id: "p-5",
    created_at: "2023-07-22T14:45:00Z"
  }
];

// Mock coverage data
export const coverageData = [];

// Mock TAM scope data
export const tamScopeData = [];

// Mock blocker data
export const blockers: Blocker[] = [
  {
    id: "b-1",
    product_id: "p-1",
    market_id: "r-1",
    category: "Regulatory",
    owner: "John Doe",
    eta: "2023-12-15",
    note: "Waiting for regulatory approval in North America",
    jira_url: "https://jira.example.com/issue/LAR-123",
    escalated: true,
    created_at: "2023-10-01T09:00:00Z",
    updated_at: "2023-10-10T14:30:00Z",
    resolved: false,
    stale: false
  },
  {
    id: "b-2",
    product_id: "p-3",
    market_id: "mr-2",
    category: "Technical",
    owner: "Alice Johnson",
    eta: "2023-11-20",
    note: "Backend integration issues in EMEA region",
    jira_url: "https://jira.example.com/issue/LAR-456",
    escalated: false,
    created_at: "2023-09-15T11:20:00Z",
    updated_at: "2023-09-25T16:45:00Z",
    resolved: false,
    stale: true
  },
  {
    id: "b-3",
    product_id: "p-5",
    market_id: "r-6",
    category: "Business",
    owner: "Michael Chang",
    eta: "2023-11-30",
    note: "Pricing strategy reconsideration needed for East Asia",
    jira_url: "https://jira.example.com/issue/LAR-789",
    escalated: false,
    created_at: "2023-10-05T13:10:00Z",
    updated_at: "2023-10-15T10:20:00Z",
    resolved: false,
    stale: false
  }
];

// Mock current user
export const currentUser: User = {
  id: "u-1",
  name: "Alice Johnson",
  email: "alice@example.com",
  region: "North America",
  country: "United States",
  role: "editor",
  canEditStatus: true
};

// Helper function to get all lines of business
export const getLinesOfBusiness = (): string[] => {
  return ["Enterprise", "Consumer", "SMB"];
};

// Helper function to get all sub teams
export const getSubTeams = (): string[] => {
  return ["Team A", "Team B", "Team C", "Team D", "Other"];
};

// Helper function to get all blocker categories
export const getBlockerCategories = (): string[] => {
  return ["Regulatory", "Technical", "Business", "Partner", "Legal", "Other"];
};

// Helper function to get potential owners (for demo/mock purposes)
export const getPotentialOwners = (): string[] => {
  return [
    "John Doe",
    "Alice Johnson", 
    "Michael Chang", 
    "Sarah Williams", 
    "David Miller", 
    "Emma Garcia", 
    "Robert Taylor"
  ];
};
