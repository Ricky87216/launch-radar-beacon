
import { Market, Product, Coverage, Blocker, User, TamScope } from "../types";

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

export const products: Product[] = [
  { id: "p-1", name: "Product Alpha", line_of_business: "Mobility", sub_team: "Rider", status: "Active", launch_date: "2023-01-15" },
  { id: "p-2", name: "Product Beta", line_of_business: "Mobility", sub_team: "Earner", status: "Active", launch_date: "2023-02-20" },
  { id: "p-3", name: "Product Gamma", line_of_business: "Delivery", sub_team: "Delivery Marketplace", status: "Active", launch_date: "2023-03-10" },
  { id: "p-4", name: "Product Delta", line_of_business: "Core Services", sub_team: "Safety", status: "In Development", launch_date: null },
  { id: "p-5", name: "Product Epsilon", line_of_business: "Mobility", sub_team: "AV", status: "Active", launch_date: "2023-04-05" },
  { id: "p-6", name: "Product Zeta", line_of_business: "Delivery", sub_team: "Earner", status: "Active", launch_date: "2023-05-12" },
  { id: "p-7", name: "Product Eta", line_of_business: "Core Services", sub_team: "GR", status: "In Development", launch_date: null },
  { id: "p-8", name: "Product Theta", line_of_business: "Mobility", sub_team: "Mobility Marketplace", status: "Active", launch_date: "2023-06-18" }
];

// Generate coverage data for mega regions, regions and countries
export const coverageData: Coverage[] = [];

// For each product and mega region/region combination
products.forEach(product => {
  markets.filter(m => m.type === "mega_region" || m.type === "region").forEach(market => {
    // Generate random coverage values
    const cityPercentage = Math.random() * 100;
    const gbWeighted = Math.random() * 100;
    const tamPercentage = Math.min(cityPercentage * 1.2, 100); // TAM % is slightly higher but capped at 100%
    
    coverageData.push({
      product_id: product.id,
      market_id: market.id,
      city_percentage: cityPercentage,
      gb_weighted: gbWeighted,
      tam_percentage: tamPercentage,
      updated_at: new Date().toISOString()
    });
  });
});

// Generate city-level coverage data with binary 0% or 100% values
markets.filter(m => m.type === "city").forEach(city => {
  products.forEach(product => {
    // Randomly assign either 0% or 100% coverage for each city and product
    const isCovered = Math.random() >= 0.5; // 50% chance of being covered
    const cityPercentage = isCovered ? 100 : 0;
    const gbWeighted = isCovered ? 100 : 0;
    const tamPercentage = isCovered ? 100 : 0;
    
    coverageData.push({
      product_id: product.id,
      market_id: city.id,
      city_percentage: cityPercentage,
      gb_weighted: gbWeighted,
      tam_percentage: tamPercentage,
      updated_at: new Date().toISOString()
    });
  });
});

// TAM Scope Data
export const tamScopeData: TamScope[] = [];

// Add cities to TAM for each product (not all cities, just a selection)
products.forEach(product => {
  // Get city IDs
  const cityIds = markets
    .filter(m => m.type === 'city')
    .map(m => m.id);
  
  // Add a random selection of cities to the TAM for this product
  const numCities = Math.floor(Math.random() * (cityIds.length - 4)) + 4; // At least 4 cities
  const shuffledCities = [...cityIds].sort(() => 0.5 - Math.random());
  const selectedCities = shuffledCities.slice(0, numCities);
  
  // Always include London in the TAM for demo purposes (as our user is in the UK)
  const london = markets.find(m => m.name === 'London' && m.type === 'city');
  if (london && !selectedCities.includes(london.id)) {
    selectedCities.push(london.id);
  }
  
  // Add the cities to the TAM
  selectedCities.forEach(cityId => {
    tamScopeData.push({
      product_id: product.id,
      city_id: cityId
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

// Add some city-level blockers
products.forEach((product, idx) => {
  // Only add city-level blockers for some products
  if (idx % 3 === 0) {
    // Find some cities to add blockers for
    const cities = markets.filter(m => m.type === "city");
    const selectedCity = cities[idx % cities.length];
    
    blockers.push({
      id: `b-city-${idx}`,
      product_id: product.id,
      market_id: selectedCity.id,
      category: "Technical",
      owner: "City Support Team",
      eta: "2023-12-30",
      note: `Technical integration required for ${product.name} in ${selectedCity.name}`,
      jira_url: `https://jira.example.com/issue/LAR-${1000 + idx}`,
      escalated: idx % 2 === 0,
      created_at: "2023-11-01T10:00:00Z",
      updated_at: "2023-11-10T15:30:00Z",
      resolved: false,
      stale: false
    });
  }
});

// Helper function to get all lines of business
export const getLinesOfBusiness = (): string[] => {
  return ["Mobility", "Delivery", "Core Services"];
};

// Helper function to get all sub teams
export const getSubTeams = (): string[] => {
  return ["Earner", "Mobility Marketplace", "Delivery Marketplace", "Rider", "AV", "Safety", "Vehicles", "Hailables", "GR", "Other"];
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
