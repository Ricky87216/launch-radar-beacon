
// This file contains utility functions for seeding mock data
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Large countries by region for realistic data seeding
const countriesByRegion = {
  'US&C': [
    { code: 'US', name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'] },
    { code: 'CA', name: 'Canada', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa'] }
  ],
  'EMEA': [
    { code: 'DE', name: 'Germany', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt'] },
    { code: 'FR', name: 'France', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'] },
    { code: 'GB', name: 'United Kingdom', cities: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool'] },
    { code: 'IT', name: 'Italy', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo'] },
    { code: 'ES', name: 'Spain', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza'] },
    { code: 'PL', name: 'Poland', cities: ['Warsaw', 'Krakow', 'Lodz', 'Wroclaw', 'Poznan'] },
    { code: 'RO', name: 'Romania', cities: ['Bucharest', 'Cluj-Napoca', 'Timisoara', 'Iasi', 'Constanta'] },
    { code: 'NL', name: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'] },
    { code: 'BE', name: 'Belgium', cities: ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liege'] },
    { code: 'CZ', name: 'Czech Republic', cities: ['Prague', 'Brno', 'Ostrava', 'Pilsen', 'Liberec'] },
    { code: 'GR', name: 'Greece', cities: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa'] },
    { code: 'PT', name: 'Portugal', cities: ['Lisbon', 'Porto', 'Amadora', 'Braga', 'Funchal'] },
    { code: 'SE', name: 'Sweden', cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås'] },
    { code: 'HU', name: 'Hungary', cities: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs'] },
    { code: 'AT', name: 'Austria', cities: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'] }
  ],
  'APAC': [
    { code: 'CN', name: 'China', cities: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu'] },
    { code: 'IN', name: 'India', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'] },
    { code: 'JP', name: 'Japan', cities: ['Tokyo', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka'] },
    { code: 'ID', name: 'Indonesia', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'] },
    { code: 'PK', name: 'Pakistan', cities: ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan'] },
    { code: 'BD', name: 'Bangladesh', cities: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet'] },
    { code: 'RU', name: 'Russia', cities: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan'] },
    { code: 'PH', name: 'Philippines', cities: ['Manila', 'Quezon City', 'Davao City', 'Caloocan', 'Cebu City'] },
    { code: 'VN', name: 'Vietnam', cities: ['Ho Chi Minh City', 'Hanoi', 'Hai Phong', 'Da Nang', 'Can Tho'] },
    { code: 'TH', name: 'Thailand', cities: ['Bangkok', 'Nonthaburi', 'Nakhon Ratchasima', 'Chiang Mai', 'Hat Yai'] },
    { code: 'KR', name: 'South Korea', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon'] },
    { code: 'MY', name: 'Malaysia', cities: ['Kuala Lumpur', 'George Town', 'Ipoh', 'Johor Bahru', 'Petaling Jaya'] },
    { code: 'AU', name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] },
    { code: 'TW', name: 'Taiwan', cities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Banqiao'] },
    { code: 'HK', name: 'Hong Kong', cities: ['Hong Kong', 'Kowloon', 'Victoria', 'Sha Tin', 'Tsuen Wan'] }
  ],
  'Latam': [
    { code: 'BR', name: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'] },
    { code: 'MX', name: 'Mexico', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana'] },
    { code: 'CO', name: 'Colombia', cities: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'] },
    { code: 'AR', name: 'Argentina', cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'] },
    { code: 'PE', name: 'Peru', cities: ['Lima', 'Arequipa', 'Callao', 'Trujillo', 'Chiclayo'] },
    { code: 'VE', name: 'Venezuela', cities: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay'] },
    { code: 'CL', name: 'Chile', cities: ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta'] },
    { code: 'EC', name: 'Ecuador', cities: ['Guayaquil', 'Quito', 'Cuenca', 'Santo Domingo', 'Machala'] },
    { code: 'GT', name: 'Guatemala', cities: ['Guatemala City', 'Mixco', 'Villa Nueva', 'Quetzaltenango', 'Escuintla'] },
    { code: 'CU', name: 'Cuba', cities: ['Havana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Santa Clara'] },
    { code: 'BO', name: 'Bolivia', cities: ['Santa Cruz', 'La Paz', 'Cochabamba', 'Sucre', 'Oruro'] },
    { code: 'DO', name: 'Dominican Republic', cities: ['Santo Domingo', 'Santiago', 'Santo Domingo Este', 'La Romana', 'San Pedro de Macorís'] },
    { code: 'HT', name: 'Haiti', cities: ['Port-au-Prince', 'Cap-Haïtien', 'Carrefour', 'Delmas', 'Pétion-Ville'] },
    { code: 'HN', name: 'Honduras', cities: ['Tegucigalpa', 'San Pedro Sula', 'La Ceiba', 'El Progreso', 'Choloma'] },
    { code: 'PY', name: 'Paraguay', cities: ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiata'] }
  ]
};

const productLoBs = ['Mobility', 'Delivery', 'Core Services'];
const productSubTeams = ['Rider', 'Earner', 'AV', 'Delivery Marketplace', 'Mobility Marketplace', 'Safety', 'Vehicles', 'Hailables', 'GR', 'Other'];
const blockCategories = ['Regulatory', 'Technical', 'Business', 'Partner', 'Legal', 'Other'];
const userNames = [
  'John Doe', 'Jane Smith', 'Michael Johnson', 'Lisa Williams', 'Robert Brown',
  'Emily Davis', 'David Miller', 'Sarah Wilson', 'James Moore', 'Jennifer Taylor',
  'Charles Anderson', 'Patricia Thomas', 'Daniel Jackson', 'Jessica White', 'Richard Harris'
];

// Generate a random date between start and end dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate a random lorem ipsum text
const randomLorem = (words: number = 10) => {
  const lorem = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum";
  const loremWords = lorem.split(' ');
  let result = '';
  
  for (let i = 0; i < words; i++) {
    result += loremWords[Math.floor(Math.random() * loremWords.length)] + ' ';
  }
  
  return result.trim();
};

// Generate a random URL for a given domain
const randomUrl = (domain: string = 'example.com') => {
  const paths = ['docs', 'plans', 'reports', 'projects', 'meetings', 'resources'];
  const randomPath = paths[Math.floor(Math.random() * paths.length)];
  const randomId = Math.floor(Math.random() * 1000);
  return `https://${domain}/${randomPath}/${randomId}`;
};

// Generate market data
export const generateMarketData = async () => {
  try {
    // First, clear existing data (optional, based on requirements)
    // await supabase.from('market').delete().neq('id', '0');
    
    const markets = [];
    let idCounter = 1000; // Starting ID to avoid conflicts
    
    // Add mega regions
    for (const regionName of Object.keys(countriesByRegion)) {
      markets.push({
        id: `mr-${regionName.toLowerCase().replace('&', '')}`,
        name: regionName,
        type: 'mega_region',
        parent_id: null,
        geo_path: `/${regionName}`
      });
    }
    
    // Add countries and cities
    for (const [regionName, countries] of Object.entries(countriesByRegion)) {
      const regionId = `mr-${regionName.toLowerCase().replace('&', '')}`;
      
      for (const country of countries) {
        const countryId = `c-${country.code.toLowerCase()}`;
        
        // Add country
        markets.push({
          id: countryId,
          name: country.name,
          type: 'country',
          parent_id: regionId,
          geo_path: `/${regionName}/${country.name}`
        });
        
        // Add cities
        for (const cityName of country.cities) {
          const cityId = `city-${country.code.toLowerCase()}-${cityName.toLowerCase().replace(/\s+/g, '')}`;
          
          markets.push({
            id: cityId,
            name: cityName,
            type: 'city',
            parent_id: countryId,
            geo_path: `/${regionName}/${country.name}/${cityName}`
          });
        }
      }
    }
    
    // Upload to supabase
    for (let i = 0; i < markets.length; i += 100) {
      const batch = markets.slice(i, i + 100);
      const { error } = await supabase.from('markets').insert(batch);
      if (error) throw error;
    }
    
    return { success: true, count: markets.length };
  } catch (error) {
    console.error('Error generating market data:', error);
    return { success: false, error };
  }
};

// Generate product data
export const generateProductData = async (count: number = 15) => {
  try {
    const products = [];
    
    // Get existing products to avoid duplicates
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name');
    
    if (fetchError) throw fetchError;
    
    const existingCount = existingProducts?.length || 0;
    const needToGenerate = Math.max(0, count - existingCount);
    
    for (let i = 0; i < needToGenerate; i++) {
      const productNumber = (existingCount + i + 1).toString().padStart(3, '0');
      const randomLob = productLoBs[Math.floor(Math.random() * productLoBs.length)];
      const randomSubTeam = productSubTeams[Math.floor(Math.random() * productSubTeams.length)];
      
      products.push({
        id: `p-${productNumber}`,
        name: `Product ${productNumber}`,
        line_of_business: randomLob,
        sub_team: randomSubTeam,
        status: Math.random() > 0.3 ? 'Active' : 'In Development',
        launch_date: Math.random() > 0.2 ? 
          randomDate(new Date('2023-01-01'), new Date()).toISOString().split('T')[0] : null
      });
    }
    
    if (products.length > 0) {
      // Upload to supabase
      const { error } = await supabase.from('products').insert(products);
      if (error) throw error;
      
      // Also generate product meta data
      await generateProductMetaData(products);
    }
    
    return { 
      success: true, 
      count: products.length,
      message: `Generated ${products.length} new products. Total products: ${existingCount + products.length}`
    };
  } catch (error) {
    console.error('Error generating product data:', error);
    return { success: false, error };
  }
};

// Generate product meta data
export const generateProductMetaData = async (products: any[] = []) => {
  try {
    const productsMeta = [];
    
    // If no products provided, fetch from DB
    if (products.length === 0) {
      const { data, error } = await supabase
        .from('products')
        .select('id, name');
        
      if (error) throw error;
      products = data || [];
    }
    
    // Check existing meta to avoid duplicates
    const { data: existingMeta, error: fetchError } = await supabase
      .from('product_meta')
      .select('product_id');
      
    if (fetchError) throw fetchError;
    
    const existingProductIds = new Set((existingMeta || []).map(m => m.product_id));
    
    for (const product of products) {
      // Skip if meta already exists
      if (existingProductIds.has(product.id)) continue;
      
      const launchDate = new Date();
      launchDate.setDate(launchDate.getDate() + Math.floor(Math.random() * 180) - 90); // +/- 90 days from now
      
      productsMeta.push({
        product_id: product.id,
        launch_date: Math.random() > 0.2 ? launchDate.toISOString().split('T')[0] : null,
        pm_poc: userNames[Math.floor(Math.random() * userNames.length)],
        prod_ops_poc: userNames[Math.floor(Math.random() * userNames.length)],
        description: randomLorem(30 + Math.floor(Math.random() * 50)),
        prd_link: Math.random() > 0.3 ? randomUrl('docs.example.com') : null,
        xp_plan: Math.random() > 0.4 ? randomUrl('plans.example.com') : null,
        newsletter_url: Math.random() > 0.5 ? randomUrl('newsletter.example.com') : null,
        company_priority: Math.random() > 0.8 ? ['High', 'Medium', 'Critical'][Math.floor(Math.random() * 3)] : null
      });
    }
    
    if (productsMeta.length > 0) {
      // Upload to supabase
      for (let i = 0; i < productsMeta.length; i += 100) {
        const batch = productsMeta.slice(i, i + 100);
        const { error } = await supabase.from('product_meta').insert(batch);
        if (error) throw error;
      }
    }
    
    return { 
      success: true, 
      count: productsMeta.length,
      message: `Generated ${productsMeta.length} new product metadata entries.`
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return { success: false, error };
  }
};

// Generate coverage data
export const generateCoverageData = async () => {
  try {
    const coverageData = [];
    
    // Get products and markets
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(25);  // Limit to 25 products for performance
      
    if (productsError) throw productsError;
    
    const { data: markets, error: marketsError } = await supabase
      .from('markets')
      .select('id, type');
      
    if (marketsError) throw marketsError;
    
    if (!products || !markets) {
      throw new Error('No products or markets found');
    }
    
    // Only generate for cities and regions
    const relevantMarkets = markets.filter(m => m.type === 'city' || m.type === 'region');
    
    // Create coverage entries
    for (const product of products) {
      for (const market of relevantMarkets) {
        // 60% LIVE, 40% NOT_LIVE
        const isLive = Math.random() < 0.6;
        
        // Random coverage values
        const cityPercentage = isLive ? 
          Math.random() * 30 + 70 : // 70% to 100% if LIVE
          Math.random() * 60;       // 0% to 60% if NOT_LIVE
          
        const gbWeighted = cityPercentage * (0.8 + Math.random() * 0.4); // Slightly different than city %
        const tamPercentage = Math.min(100, cityPercentage * (1 + Math.random() * 0.3)); // Slightly higher than city %
        
        coverageData.push({
          product_id: product.id,
          market_id: market.id,
          city_percentage: cityPercentage,
          gb_weighted: gbWeighted,
          tam_percentage: tamPercentage,
          status: isLive ? 'LIVE' : 'NOT_LIVE',
          updated_at: new Date().toISOString()
        });
      }
    }
    
    // Upload to supabase in batches
    let uploadedCount = 0;
    for (let i = 0; i < coverageData.length; i += 100) {
      const batch = coverageData.slice(i, i + 100);
      const { error } = await supabase.from('coverage_fact').insert(batch);
      if (error) {
        console.error('Error in batch upload:', error);
        continue;
      }
      uploadedCount += batch.length;
    }
    
    return { 
      success: true, 
      count: uploadedCount,
      message: `Generated ${uploadedCount} coverage records.`
    };
  } catch (error) {
    console.error('Error generating coverage data:', error);
    return { success: false, error };
  }
};

// Generate blocker data
export const generateBlockerData = async (count: number = 15) => {
  try {
    const blockers = [];
    
    // Get products and markets
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id');
      
    if (productsError) throw productsError;
    
    const { data: markets, error: marketsError } = await supabase
      .from('markets')
      .select('id')
      .eq('type', 'city')
      .limit(50);  // Limit to 50 cities
      
    if (marketsError) throw marketsError;
    
    if (!products || !markets || products.length === 0 || markets.length === 0) {
      throw new Error('No products or markets found');
    }
    
    // Create blockers
    for (let i = 0; i < count; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomMarket = markets[Math.floor(Math.random() * markets.length)];
      const category = blockCategories[Math.floor(Math.random() * blockCategories.length)];
      const owner = userNames[Math.floor(Math.random() * userNames.length)];
      const isResolved = Math.random() < 0.3; // 30% resolved
      const isEscalated = Math.random() < 0.2; // 20% escalated
      
      // ETA for unresolved blockers
      const today = new Date();
      const etaDate = new Date();
      etaDate.setDate(today.getDate() + Math.floor(Math.random() * 60) + 1); // 1-60 days in the future
      
      // Created at date in the past
      const createdAt = new Date();
      createdAt.setDate(today.getDate() - Math.floor(Math.random() * 90) - 1); // 1-90 days in the past
      
      // Updated at date between created at and now
      const updatedAt = new Date(createdAt.getTime() + 
        Math.random() * (today.getTime() - createdAt.getTime()));
      
      blockers.push({
        id: `b-${i + 1}`,
        product_id: randomProduct.id,
        market_id: randomMarket.id,
        category: category,
        owner: owner,
        eta: isResolved ? null : etaDate.toISOString(),
        note: randomLorem(10 + Math.floor(Math.random() * 20)),
        jira_url: Math.random() > 0.4 ? `https://jira.example.com/issue/LAR-${100 + i}` : null,
        escalated: isEscalated,
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString(),
        resolved: isResolved,
        stale: !isResolved && Math.random() < 0.25 // 25% of unresolved are stale
      });
    }
    
    // Upload to supabase
    const { error } = await supabase.from('blockers').insert(blockers);
    if (error) throw error;
    
    return { 
      success: true, 
      count: blockers.length,
      message: `Generated ${blockers.length} blockers.`
    };
  } catch (error) {
    console.error('Error generating blocker data:', error);
    return { success: false, error };
  }
};

// Main function to run all data generation
export const runDataGeneration = async () => {
  try {
    const results = {
      markets: null,
      products: null,
      productMeta: null,
      coverage: null,
      blockers: null
    };
    
    // Generate markets first
    results.markets = await generateMarketData();
    if (!results.markets.success) {
      throw new Error('Failed to generate markets');
    }
    
    // Generate products
    results.products = await generateProductData(15);
    if (!results.products.success) {
      throw new Error('Failed to generate products');
    }
    
    // Product meta is auto-generated with products
    
    // Generate coverage data
    results.coverage = await generateCoverageData();
    if (!results.coverage.success) {
      throw new Error('Failed to generate coverage data');
    }
    
    // Generate blockers
    results.blockers = await generateBlockerData(20);
    if (!results.blockers.success) {
      throw new Error('Failed to generate blockers');
    }
    
    // Show success message
    toast.success('Successfully generated mock data', {
      description: `
        Generated ${results.markets.count} markets, 
        ${results.products.count} products, 
        ${results.coverage.count} coverage entries, and
        ${results.blockers.count} blockers.
      `
    });
    
    return { success: true, results };
  } catch (error) {
    console.error('Error running data generation:', error);
    toast.error('Failed to generate mock data', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    return { success: false, error };
  }
};
