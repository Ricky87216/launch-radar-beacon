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
  
  // Countries (formerly Regions, keeping r- prefix for compatibility)
  { id: "r-1", name: "United States", type: "region", parent_id: "mr-1", geo_path: "/US&C/United States" },
  { id: "r-2", name: "Canada", type: "region", parent_id: "mr-1", geo_path: "/US&C/Canada" },
  { id: "r-3", name: "United Kingdom", type: "region", parent_id: "mr-2", geo_path: "/EMEA/United Kingdom" },
  { id: "r-4", name: "Germany", type: "region", parent_id: "mr-2", geo_path: "/EMEA/Germany" },
  { id: "r-5", name: "France", type: "region", parent_id: "mr-2", geo_path: "/EMEA/France" },
  { id: "r-6", name: "China", type: "region", parent_id: "mr-3", geo_path: "/APAC/China" },
  { id: "r-7", name: "India", type: "region", parent_id: "mr-3", geo_path: "/APAC/India" },
  { id: "r-8", name: "Japan", type: "region", parent_id: "mr-3", geo_path: "/APAC/Japan" },
  { id: "r-9", name: "Brazil", type: "region", parent_id: "mr-4", geo_path: "/Latam/Brazil" },
  { id: "r-10", name: "Mexico", type: "region", parent_id: "mr-4", geo_path: "/Latam/Mexico" },
  
  // Cities
  // US Cities
  { id: "c-1", name: "New York", type: "country", parent_id: "r-1", geo_path: "/US&C/United States/New York" },
  { id: "c-2", name: "Los Angeles", type: "country", parent_id: "r-1", geo_path: "/US&C/United States/Los Angeles" },
  { id: "c-3", name: "Chicago", type: "country", parent_id: "r-1", geo_path: "/US&C/United States/Chicago" },
  
  // Canada Cities
  { id: "c-4", name: "Toronto", type: "country", parent_id: "r-2", geo_path: "/US&C/Canada/Toronto" },
  { id: "c-5", name: "Vancouver", type: "country", parent_id: "r-2", geo_path: "/US&C/Canada/Vancouver" },
  
  // UK Cities
  { id: "c-6", name: "London", type: "country", parent_id: "r-3", geo_path: "/EMEA/United Kingdom/London" },
  { id: "c-7", name: "Manchester", type: "country", parent_id: "r-3", geo_path: "/EMEA/United Kingdom/Manchester" },
  
  // German Cities
  { id: "c-8", name: "Berlin", type: "country", parent_id: "r-4", geo_path: "/EMEA/Germany/Berlin" },
  { id: "c-9", name: "Munich", type: "country", parent_id: "r-4", geo_path: "/EMEA/Germany/Munich" },
  
  // French Cities
  { id: "c-10", name: "Paris", type: "country", parent_id: "r-5", geo_path: "/EMEA/France/Paris" },
  
  // Chinese Cities
  { id: "c-11", name: "Shanghai", type: "country", parent_id: "r-6", geo_path: "/APAC/China/Shanghai" },
  { id: "c-12", name: "Beijing", type: "country", parent_id: "r-6", geo_path: "/APAC/China/Beijing" },
  
  // Indian Cities
  { id: "c-13", name: "Mumbai", type: "country", parent_id: "r-7", geo_path: "/APAC/India/Mumbai" },
  { id: "c-14", name: "Delhi", type: "country", parent_id: "r-7", geo_path: "/APAC/India/Delhi" },
  
  // Japanese Cities
  { id: "c-15", name: "Tokyo", type: "country", parent_id: "r-8", geo_path: "/APAC/Japan/Tokyo" },
  { id: "c-16", name: "Osaka", type: "country", parent_id: "r-8", geo_path: "/APAC/Japan/Osaka" },
  
  // Brazilian Cities
  { id: "c-17", name: "São Paulo", type: "country", parent_id: "r-9", geo_path: "/Latam/Brazil/São Paulo" },
  { id: "c-18", name: "Rio de Janeiro", type: "country", parent_id: "r-9", geo_path: "/Latam/Brazil/Rio de Janeiro" },
  
  // Mexican Cities
  { id: "c-19", name: "Mexico City", type: "country", parent_id: "r-10", geo_path: "/Latam/Mexico/Mexico City" },
  { id: "c-20", name: "Guadalajara", type: "country", parent_id: "r-10", geo_path: "/Latam/Mexico/Guadalajara" },
  
  // Major Cities
  { id: "city-1", name: "Manhattan", type: "city", parent_id: "c-1", geo_path: "/US&C/United States/New York/Manhattan" },
  { id: "city-2", name: "Brooklyn", type: "city", parent_id: "c-1", geo_path: "/US&C/United States/New York/Brooklyn" },
  { id: "city-3", name: "Hollywood", type: "city", parent_id: "c-2", geo_path: "/US&C/United States/Los Angeles/Hollywood" },
  { id: "city-4", name: "Downtown Toronto", type: "city", parent_id: "c-4", geo_path: "/US&C/Canada/Toronto/Downtown Toronto" },
  { id: "city-5", name: "Westminster", type: "city", parent_id: "c-6", geo_path: "/EMEA/United Kingdom/London/Westminster" },
  { id: "city-6", name: "Camden", type: "city", parent_id: "c-6", geo_path: "/EMEA/United Kingdom/London/Camden" },
  { id: "city-7", name: "Mitte", type: "city", parent_id: "c-8", geo_path: "/EMEA/Germany/Berlin/Mitte" },
  { id: "city-8", name: "Le Marais", type: "city", parent_id: "c-10", geo_path: "/EMEA/France/Paris/Le Marais" },
  { id: "city-9", name: "Pudong", type: "city", parent_id: "c-11", geo_path: "/APAC/China/Shanghai/Pudong" },
  { id: "city-10", name: "Shinjuku", type: "city", parent_id: "c-15", geo_path: "/APAC/Japan/Tokyo/Shinjuku" },
  { id: "city-11", name: "Colaba", type: "city", parent_id: "c-13", geo_path: "/APAC/India/Mumbai/Colaba" },
  { id: "city-12", name: "Ipanema", type: "city", parent_id: "c-18", geo_path: "/Latam/Brazil/Rio de Janeiro/Ipanema" }
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

// Update country-level coverage data
markets.filter(m => m.type === "country").forEach(country => {
  products.forEach(product => {
    // Generate random coverage values
    const cityPercentage = Math.random() * 100;
    const gbWeighted = Math.random() * 100;
    const tamPercentage = Math.min(cityPercentage * 1.2, 100);
    
    coverageData.push({
      product_id: product.id,
      market_id: country.id,
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
    note: "Waiting for regulatory approval in United States",
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
    note: "Pricing strategy reconsideration needed for China",
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
