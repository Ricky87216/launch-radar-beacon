
// This file contains utility functions for seeding mock data
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Large countries by region for realistic data seeding
const usCanRegion = {
  'US&C': [
    { code: 'US-AL', name: 'Alabama', cities: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa'] },
    { code: 'US-AK', name: 'Alaska', cities: ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan'] },
    { code: 'US-AZ', name: 'Arizona', cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale'] },
    { code: 'US-AR', name: 'Arkansas', cities: ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'] },
    { code: 'US-CA', name: 'California', cities: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno'] },
    { code: 'US-CO', name: 'Colorado', cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood'] },
    { code: 'US-CT', name: 'Connecticut', cities: ['Bridgeport', 'New Haven', 'Stamford', 'Hartford', 'Waterbury'] },
    { code: 'US-DE', name: 'Delaware', cities: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'] },
    { code: 'US-FL', name: 'Florida', cities: ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg'] },
    { code: 'US-GA', name: 'Georgia', cities: ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens'] },
    { code: 'US-HI', name: 'Hawaii', cities: ['Honolulu', 'East Honolulu', 'Pearl City', 'Hilo', 'Kailua'] },
    { code: 'US-ID', name: 'Idaho', cities: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello'] },
    { code: 'US-IL', name: 'Illinois', cities: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford'] },
    { code: 'US-IN', name: 'Indiana', cities: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel'] },
    { code: 'US-IA', name: 'Iowa', cities: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'] },
    { code: 'US-KS', name: 'Kansas', cities: ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka'] },
    { code: 'US-KY', name: 'Kentucky', cities: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'] },
    { code: 'US-LA', name: 'Louisiana', cities: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'] },
    { code: 'US-ME', name: 'Maine', cities: ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn'] },
    { code: 'US-MD', name: 'Maryland', cities: ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie'] },
    { code: 'US-MA', name: 'Massachusetts', cities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell'] },
    { code: 'US-MI', name: 'Michigan', cities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor'] },
    { code: 'US-MN', name: 'Minnesota', cities: ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington'] },
    { code: 'US-MS', name: 'Mississippi', cities: ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi'] },
    { code: 'US-MO', name: 'Missouri', cities: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence'] },
    { code: 'US-MT', name: 'Montana', cities: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte'] },
    { code: 'US-NE', name: 'Nebraska', cities: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'] },
    { code: 'US-NV', name: 'Nevada', cities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks'] },
    { code: 'US-NH', name: 'New Hampshire', cities: ['Manchester', 'Nashua', 'Concord', 'Dover', 'Rochester'] },
    { code: 'US-NJ', name: 'New Jersey', cities: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton'] },
    { code: 'US-NM', name: 'New Mexico', cities: ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'] },
    { code: 'US-NY', name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse'] },
    { code: 'US-NC', name: 'North Carolina', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'] },
    { code: 'US-ND', name: 'North Dakota', cities: ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'] },
    { code: 'US-OH', name: 'Ohio', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'] },
    { code: 'US-OK', name: 'Oklahoma', cities: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond'] },
    { code: 'US-OR', name: 'Oregon', cities: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro'] },
    { code: 'US-PA', name: 'Pennsylvania', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'] },
    { code: 'US-RI', name: 'Rhode Island', cities: ['Providence', 'Cranston', 'Warwick', 'Pawtucket', 'East Providence'] },
    { code: 'US-SC', name: 'South Carolina', cities: ['Columbia', 'Charleston', 'North Charleston', 'Mount Pleasant', 'Rock Hill'] },
    { code: 'US-SD', name: 'South Dakota', cities: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'] },
    { code: 'US-TN', name: 'Tennessee', cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'] },
    { code: 'US-TX', name: 'Texas', cities: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth'] },
    { code: 'US-UT', name: 'Utah', cities: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem'] },
    { code: 'US-VT', name: 'Vermont', cities: ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier'] },
    { code: 'US-VA', name: 'Virginia', cities: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News'] },
    { code: 'US-WA', name: 'Washington', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'] },
    { code: 'US-WV', name: 'West Virginia', cities: ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'] },
    { code: 'US-WI', name: 'Wisconsin', cities: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine'] },
    { code: 'US-WY', name: 'Wyoming', cities: ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs'] },
    { code: 'US-DC', name: 'District of Columbia', cities: ['Washington', 'Georgetown', 'Foggy Bottom', 'Capitol Hill', 'Anacostia'] },
    { code: 'CA-AB', name: 'Alberta', cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Fort McMurray'] },
    { code: 'CA-BC', name: 'British Columbia', cities: ['Vancouver', 'Victoria', 'Kelowna', 'Abbotsford', 'Nanaimo'] },
    { code: 'CA-MB', name: 'Manitoba', cities: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie'] },
    { code: 'CA-NB', name: 'New Brunswick', cities: ['Saint John', 'Moncton', 'Fredericton', 'Dieppe', 'Miramichi'] },
    { code: 'CA-NL', name: 'Newfoundland and Labrador', cities: ['St. Johns', 'Mount Pearl', 'Corner Brook', 'Grand Falls-Windsor', 'Conception Bay South'] },
    { code: 'CA-NS', name: 'Nova Scotia', cities: ['Halifax', 'Dartmouth', 'Sydney', 'Truro', 'New Glasgow'] },
    { code: 'CA-ON', name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London'] },
    { code: 'CA-PE', name: 'Prince Edward Island', cities: ['Charlottetown', 'Summerside', 'Stratford', 'Cornwall', 'Montague'] },
    { code: 'CA-QC', name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil'] },
    { code: 'CA-SK', name: 'Saskatchewan', cities: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current'] }
  ]
};

const emeaRegion = {
  'EMEA': [
    { code: 'NG', name: 'Nigeria', cities: ['Lagos', 'Kano', 'Ibadan', 'Kaduna', 'Port Harcourt'] },
    { code: 'ET', name: 'Ethiopia', cities: ['Addis Ababa', 'Dire Dawa', 'Mek\'ele', 'Gondar', 'Bahir Dar'] },
    { code: 'EG', name: 'Egypt', cities: ['Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said'] },
    { code: 'CD', name: 'DR Congo', cities: ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kisangani', 'Kananga'] },
    { code: 'TZ', name: 'Tanzania', cities: ['Dar es Salaam', 'Mwanza', 'Dodoma', 'Arusha', 'Mbeya'] },
    { code: 'ZA', name: 'South Africa', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'] },
    { code: 'KE', name: 'Kenya', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'] },
    { code: 'DZ', name: 'Algeria', cities: ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida'] },
    { code: 'SD', name: 'Sudan', cities: ['Khartoum', 'Omdurman', 'Nyala', 'Port Sudan', 'Kassala'] },
    { code: 'MA', name: 'Morocco', cities: ['Casablanca', 'Rabat', 'Fes', 'Marrakech', 'Tangier'] },
    { code: 'UG', name: 'Uganda', cities: ['Kampala', 'Nansana', 'Kira', 'Gulu', 'Lira'] },
    { code: 'TR', name: 'Turkey', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana'] },
    { code: 'DE', name: 'Germany', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt'] },
    { code: 'FR', name: 'France', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'] },
    { code: 'GB', name: 'United Kingdom', cities: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool'] },
    { code: 'IT', name: 'Italy', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo'] },
    { code: 'ES', name: 'Spain', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza'] },
    { code: 'UA', name: 'Ukraine', cities: ['Kyiv', 'Kharkiv', 'Odessa', 'Dnipro', 'Donetsk'] },
    { code: 'PL', name: 'Poland', cities: ['Warsaw', 'Krakow', 'Lodz', 'Wroclaw', 'Poznan'] },
    { code: 'RO', name: 'Romania', cities: ['Bucharest', 'Cluj-Napoca', 'Timisoara', 'Iasi', 'Constanta'] }
  ]
};

const apacRegion = {
  'APAC': [
    { code: 'CN', name: 'China', cities: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu'] },
    { code: 'IN', name: 'India', cities: ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Ahmedabad'] },
    { code: 'ID', name: 'Indonesia', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'] },
    { code: 'PK', name: 'Pakistan', cities: ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan'] },
    { code: 'BD', name: 'Bangladesh', cities: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet'] },
    { code: 'JP', name: 'Japan', cities: ['Tokyo', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka'] },
    { code: 'PH', name: 'Philippines', cities: ['Manila', 'Quezon City', 'Davao City', 'Caloocan', 'Cebu City'] },
    { code: 'VN', name: 'Vietnam', cities: ['Ho Chi Minh City', 'Hanoi', 'Hai Phong', 'Da Nang', 'Can Tho'] },
    { code: 'TH', name: 'Thailand', cities: ['Bangkok', 'Nonthaburi', 'Nakhon Ratchasima', 'Chiang Mai', 'Hat Yai'] },
    { code: 'MM', name: 'Myanmar', cities: ['Yangon', 'Mandalay', 'Naypyidaw', 'Mawlamyine', 'Bago'] },
    { code: 'KR', name: 'South Korea', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon'] },
    { code: 'MY', name: 'Malaysia', cities: ['Kuala Lumpur', 'George Town', 'Ipoh', 'Johor Bahru', 'Petaling Jaya'] },
    { code: 'NP', name: 'Nepal', cities: ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bharatpur', 'Birgunj'] },
    { code: 'AU', name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] },
    { code: 'TW', name: 'Taiwan', cities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Banqiao'] },
    { code: 'LK', name: 'Sri Lanka', cities: ['Colombo', 'Dehiwala-Mount Lavinia', 'Moratuwa', 'Jaffna', 'Negombo'] },
    { code: 'KZ', name: 'Kazakhstan', cities: ['Almaty', 'Nur-Sultan', 'Shymkent', 'Karaganda', 'Aktobe'] },
    { code: 'KH', name: 'Cambodia', cities: ['Phnom Penh', 'Siem Reap', 'Battambang', 'Sihanoukville', 'Kampong Cham'] },
    { code: 'HK', name: 'Hong Kong', cities: ['Hong Kong', 'Kowloon', 'Tsuen Wan', 'Tuen Mun', 'Yuen Long'] },
    { code: 'SG', name: 'Singapore', cities: ['Singapore', 'Woodlands', 'Tampines', 'Jurong West', 'Bedok'] }
  ]
};

const latamRegion = {
  'LATAM': [
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
    { code: 'HT', name: 'Haiti', cities: ['Port-au-Prince', 'Cap-Haïtien', 'Carrefour', 'Delmas', 'Pétion-Ville'] },
    { code: 'BO', name: 'Bolivia', cities: ['Santa Cruz', 'La Paz', 'Cochabamba', 'Sucre', 'Oruro'] },
    { code: 'DO', name: 'Dominican Republic', cities: ['Santo Domingo', 'Santiago', 'Santo Domingo Este', 'La Romana', 'San Pedro de Macorís'] },
    { code: 'HN', name: 'Honduras', cities: ['Tegucigalpa', 'San Pedro Sula', 'La Ceiba', 'El Progreso', 'Choloma'] },
    { code: 'PY', name: 'Paraguay', cities: ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiata'] },
    { code: 'NI', name: 'Nicaragua', cities: ['Managua', 'León', 'Masaya', 'Tipitapa', 'Chinandega'] },
    { code: 'SV', name: 'El Salvador', cities: ['San Salvador', 'Santa Ana', 'Soyapango', 'San Miguel', 'Mejicanos'] },
    { code: 'CR', name: 'Costa Rica', cities: ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Liberia'] },
    { code: 'PA', name: 'Panama', cities: ['Panama City', 'San Miguelito', 'Tocumen', 'David', 'Arraiján'] },
    { code: 'UY', name: 'Uruguay', cities: ['Montevideo', 'Salto', 'Ciudad de la Costa', 'Paysandú', 'Las Piedras'] }
  ]
};

const productLoBs = ['Mobility', 'Delivery', 'Core Services'];
const productSubTeams = ['Rider', 'Earner', 'AV', 'Delivery Marketplace', 'Mobility Marketplace', 'Safety', 'Vehicles', 'Hailables', 'GR', 'Other'];
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

// Generate a random floating point number between min and max
const randomFloat = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Generate market data
export const generateMarketData = async () => {
  try {
    // Clear existing data if any
    await supabase.from('market_dim').delete().neq('id', 0);
    
    const marketData = [];
    const regions = ['US&C', 'EMEA', 'APAC', 'LATAM'];
    let regionWeightSum: { [key: string]: number } = {};
    regions.forEach(r => regionWeightSum[r] = 0);
    
    // Process US&C region (states and provinces)
    for (const { code, name, cities } of usCanRegion['US&C']) {
      for (const city of cities) {
        const cityCode = `${code}-${city.replace(/\s+/g, '').substring(0, 3).toUpperCase()}`;
        const weight = randomFloat(0.0005, 0.01);
        regionWeightSum['US&C'] += weight;
        
        marketData.push({
          region: 'US&C',
          country_code: code,
          country_name: name,
          city_id: cityCode,
          city_name: city,
          gb_weight: weight
        });
      }
    }
    
    // Process EMEA region
    for (const { code, name, cities } of emeaRegion['EMEA']) {
      for (const city of cities) {
        const cityCode = `${code}-${city.replace(/\s+/g, '').substring(0, 3).toUpperCase()}`;
        const weight = randomFloat(0.0005, 0.01);
        regionWeightSum['EMEA'] += weight;
        
        marketData.push({
          region: 'EMEA',
          country_code: code,
          country_name: name,
          city_id: cityCode,
          city_name: city,
          gb_weight: weight
        });
      }
    }
    
    // Process APAC region
    for (const { code, name, cities } of apacRegion['APAC']) {
      for (const city of cities) {
        const cityCode = `${code}-${city.replace(/\s+/g, '').substring(0, 3).toUpperCase()}`;
        const weight = randomFloat(0.0005, 0.01);
        regionWeightSum['APAC'] += weight;
        
        marketData.push({
          region: 'APAC',
          country_code: code,
          country_name: name,
          city_id: cityCode,
          city_name: city,
          gb_weight: weight
        });
      }
    }
    
    // Process LATAM region
    for (const { code, name, cities } of latamRegion['LATAM']) {
      for (const city of cities) {
        const cityCode = `${code}-${city.replace(/\s+/g, '').substring(0, 3).toUpperCase()}`;
        const weight = randomFloat(0.0005, 0.01);
        regionWeightSum['LATAM'] += weight;
        
        marketData.push({
          region: 'LATAM',
          country_code: code,
          country_name: name,
          city_id: cityCode,
          city_name: city,
          gb_weight: weight
        });
      }
    }
    
    // Normalize weights to make sum approximately 1.0 in each region
    marketData.forEach(market => {
      market.gb_weight = market.gb_weight / regionWeightSum[market.region];
    });
    
    // Insert data into market_dim table
    const { error } = await supabase.from('market_dim').insert(marketData);
    
    if (error) {
      console.error('Error inserting market data:', error);
      return { success: false, error };
    }
    
    console.log(`Generated ${marketData.length} market entries.`);
    
    return { 
      success: true, 
      count: marketData.length,
      message: `Generated ${marketData.length} market entries.`
    };
  } catch (error) {
    console.error('Error generating market data:', error);
    return { success: false, error };
  }
};

// Generate product data
export const generateProductData = async (count: number = 30) => {
  try {
    const products = [];
    
    // Generate dummy product data
    for (let i = 0; i < count; i++) {
      const productNumber = (i + 1).toString().padStart(3, '0');
      const randomLob = productLoBs[Math.floor(Math.random() * productLoBs.length)];
      const randomSubTeam = productSubTeams[Math.floor(Math.random() * productSubTeams.length)];
      
      products.push({
        id: `prod_${productNumber}`,
        name: `Product ${productNumber}`,
        line_of_business: randomLob,
        sub_team: randomSubTeam,
        status: Math.random() > 0.3 ? 'Active' : 'In Development',
        launch_date: Math.random() > 0.2 ? 
          randomDate(new Date('2023-01-01'), new Date()).toISOString().split('T')[0] : null
      });
    }
    
    console.log(`Generated ${products.length} product entries.`);
    
    // Also generate product meta data
    await generateProductMetaData(products);
    
    return { 
      success: true, 
      count: products.length,
      message: `Generated ${products.length} new products.`,
      products
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
    
    // If no products provided, generate some dummy ones
    if (products.length === 0) {
      for (let i = 0; i < 30; i++) {
        products.push({
          id: `prod_${(i + 1).toString().padStart(3, '0')}`,
          name: `Product ${(i + 1).toString().padStart(3, '0')}`
        });
      }
    }
    
    for (const product of products) {
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
    
    console.log(`Generated ${productsMeta.length} product metadata entries.`);
    
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
    // Get all products and cities from the database
    const { data: products } = await supabase
      .from('product_meta')
      .select('product_id')
      .order('product_id');
      
    const { data: markets } = await supabase
      .from('market_dim')
      .select('city_id')
      .order('city_id');
    
    if (!products || !markets) {
      return { 
        success: false, 
        error: 'No products or markets found in the database.'
      };
    }
    
    // Generate coverage data for each product and city
    const coverageData = [];
    
    for (const product of products) {
      for (const market of markets) {
        const isLive = Math.random() > 0.4; // 60% chance of being LIVE
        
        coverageData.push({
          product_id: product.product_id,
          city_id: market.city_id,
          status: isLive ? 'LIVE' : 'NOT_LIVE'
        });
      }
    }
    
    // Insert data into coverage_fact table
    // Insert in batches to avoid exceeding request size limits
    const batchSize = 1000;
    for (let i = 0; i < coverageData.length; i += batchSize) {
      const batch = coverageData.slice(i, i + batchSize);
      const { error } = await supabase.from('coverage_fact').insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        return { success: false, error };
      }
      
      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(coverageData.length / batchSize)}`);
    }
    
    console.log(`Generated ${coverageData.length} coverage records.`);
    
    return { 
      success: true, 
      count: coverageData.length,
      message: `Generated ${coverageData.length} coverage records.`
    };
  } catch (error) {
    console.error('Error generating coverage data:', error);
    return { success: false, error };
  }
};

// Main function to run all data generation
export const runDataGeneration = async () => {
  try {
    const results = {
      markets: null,
      products: null,
      coverage: null
    };
    
    // Generate markets first
    results.markets = await generateMarketData();
    if (!results.markets.success) {
      throw new Error('Failed to generate markets');
    }
    
    // Generate products
    results.products = await generateProductData(30);
    if (!results.products.success) {
      throw new Error('Failed to generate products');
    }
    
    // Generate coverage data
    results.coverage = await generateCoverageData();
    if (!results.coverage.success) {
      throw new Error('Failed to generate coverage data');
    }
    
    // Show success message
    toast.success('Successfully generated mock data', {
      description: `Generated ${results.markets.count} markets, ${results.products.count} products, and ${results.coverage.count} coverage entries.`
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
