
import { Market, Product, Coverage, Blocker, User } from "../types";

// Mock User Data
export const currentUser: User = {
  id: "user-1",
  name: "Jane Smith",
  email: "jane.smith@example.com",
  region: "EMEA",
  country: "UK",
  role: "editor",
  canEditStatus: true
};

// Mock Markets Data
export const markets: Market[] = [
  // Mega Regions
  { id: "mr-1", name: "US&C", type: "mega_region", parent_id: null, geo_path: "/US&C" },
  { id: "mr-2", name: "EMEA", type: "mega_region", parent_id: null, geo_path: "/EMEA" },
  { id: "mr-3", name: "APAC", type: "mega_region", parent_id: null, geo_path: "/APAC" },
  { id: "mr-4", name: "Latam", type: "mega_region", parent_id: null, geo_path: "/Latam" },
  
  // Regions
  { id: "r-1", name: "North America", type: "region", parent_id: "mr-1", geo_path: "/US&C/North America" },
  { id: "r-2", name: "South America", type: "region", parent_id: "mr-4", geo_path: "/Latam/South America" },
  { id: "r-3", name: "Western Europe", type: "region", parent_id: "mr-2", geo_path: "/EMEA/Western Europe" },
  { id: "r-4", name: "Eastern Europe", type: "region", parent_id: "mr-2", geo_path: "/EMEA/Eastern Europe" },
  { id: "r-5", name: "Middle East", type: "region", parent_id: "mr-2", geo_path: "/EMEA/Middle East" },
  { id: "r-6", name: "East Asia", type: "region", parent_id: "mr-3", geo_path: "/APAC/East Asia" },
  { id: "r-7", name: "South Asia", type: "region", parent_id: "mr-3", geo_path: "/APAC/South Asia" },
  { id: "r-8", name: "Oceania", type: "region", parent_id: "mr-3", geo_path: "/APAC/Oceania" },
  
  // Countries
  { id: "c-1", name: "USA", type: "country", parent_id: "r-1", geo_path: "/US&C/North America/USA" },
  { id: "c-2", name: "Canada", type: "country", parent_id: "r-1", geo_path: "/US&C/North America/Canada" },
  { id: "c-3", name: "Brazil", type: "country", parent_id: "r-2", geo_path: "/Latam/South America/Brazil" },
  { id: "c-4", name: "UK", type: "country", parent_id: "r-3", geo_path: "/EMEA/Western Europe/UK" },
  { id: "c-5", name: "Germany", type: "country", parent_id: "r-3", geo_path: "/EMEA/Western Europe/Germany" },
  { id: "c-6", name: "Poland", type: "country", parent_id: "r-4", geo_path: "/EMEA/Eastern Europe/Poland" },
  { id: "c-7", name: "UAE", type: "country", parent_id: "r-5", geo_path: "/EMEA/Middle East/UAE" },
  { id: "c-8", name: "Japan", type: "country", parent_id: "r-6", geo_path: "/APAC/East Asia/Japan" },
  { id: "c-9", name: "India", type: "country", parent_id: "r-7", geo_path: "/APAC/South Asia/India" },
  { id: "c-10", name: "Australia", type: "country", parent_id: "r-8", geo_path: "/APAC/Oceania/Australia" },
  
  // Cities
  { id: "city-1", name: "New York", type: "city", parent_id: "c-1", geo_path: "/US&C/North America/USA/New York" },
  { id: "city-2", name: "San Francisco", type: "city", parent_id: "c-1", geo_path: "/US&C/North America/USA/San Francisco" },
  { id: "city-3", name: "Toronto", type: "city", parent_id: "c-2", geo_path: "/US&C/North America/Canada/Toronto" },
  { id: "city-4", name: "São Paulo", type: "city", parent_id: "c-3", geo_path: "/Latam/South America/Brazil/São Paulo" },
  { id: "city-5", name: "London", type: "city", parent_id: "c-4", geo_path: "/EMEA/Western Europe/UK/London" },
  { id: "city-6", name: "Manchester", type: "city", parent_id: "c-4", geo_path: "/EMEA/Western Europe/UK/Manchester" },
  { id: "city-7", name: "Berlin", type: "city", parent_id: "c-5", geo_path: "/EMEA/Western Europe/Germany/Berlin" },
  { id: "city-8", name: "Warsaw", type: "city", parent_id: "c-6", geo_path: "/EMEA/Eastern Europe/Poland/Warsaw" },
  { id: "city-9", name: "Dubai", type: "city", parent_id: "c-7", geo_path: "/EMEA/Middle East/UAE/Dubai" },
  { id: "city-10", name: "Tokyo", type: "city", parent_id: "c-8", geo_path: "/APAC/East Asia/Japan/Tokyo" },
  { id: "city-11", name: "Mumbai", type: "city", parent_id: "c-9", geo_path: "/APAC/South Asia/India/Mumbai" },
  { id: "city-12", name: "Sydney", type: "city", parent_id: "c-10", geo_path: "/APAC/Oceania/Australia/Sydney" }
];

// Now let's add additional coverage data for the Latam mega region
export const products: Product[] = [
  { id: "p-1", name: "Product Alpha", line_of_business: "Business Services", sub_team: "Core Platform", status: "Active", launch_date: "2023-01-15" },
  { id: "p-2", name: "Product Beta", line_of_business: "Business Services", sub_team: "Core Platform", status: "Active", launch_date: "2023-02-20" },
  { id: "p-3", name: "Product Gamma", line_of_business: "Business Services", sub_team: "Mobile", status: "Active", launch_date: "2023-03-10" },
  { id: "p-4", name: "Product Delta", line_of_business: "Consumer", sub_team: "Mobile", status: "In Development", launch_date: null },
  { id: "p-5", name: "Product Epsilon", line_of_business: "Consumer", sub_team: "Web", status: "Active", launch_date: "2023-04-05" },
  { id: "p-6", name: "Product Zeta", line_of_business: "Enterprise", sub_team: "Core Platform", status: "Active", launch_date: "2023-05-12" },
  { id: "p-7", name: "Product Eta", line_of_business: "Enterprise", sub_team: "Web", status: "In Development", launch_date: null },
  { id: "p-8", name: "Product Theta", line_of_business: "Business Services", sub_team: "Web", status: "Active", launch_date: "2023-06-18" }
];

// Generate random coverage data
export const coverageData: Coverage[] = [];

// For each product and mega region/region combination
products.forEach(product => {
  markets.filter(m => m.type === "mega_region" || m.type === "region").forEach(market => {
    // Generate random coverage values
    const cityPercentage = Math.random() * 100;
    const gbWeighted = Math.random() * 100;
    
    coverageData.push({
      product_id: product.id,
      market_id: market.id,
      city_percentage: cityPercentage,
      gb_weighted: gbWeighted,
      updated_at: new Date().toISOString()
    });
  });
});

// Mock Blockers
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

// Helper function to get all lines of business
export const getLinesOfBusiness = (): string[] => {
  return Array.from(new Set(products.map(p => p.line_of_business)));
};

// Helper function to get all sub teams
export const getSubTeams = (): string[] => {
  return Array.from(new Set(products.map(p => p.sub_team)));
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

