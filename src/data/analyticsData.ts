
// Mock daily analytics data for the past 180 days
export const mockDailyAnalyticsData = generateDailyData();
export const mockTeamSnapshotData = [
  {
    product_team: "Safety",
    tam_pct: 83,
    avg_days_to_tam: 46,
    open_blockers: 18,
    median_blocker_age: 6,
    lob: "Rider"
  },
  {
    product_team: "Pricing",
    tam_pct: 76,
    avg_days_to_tam: 40,
    open_blockers: 11,
    median_blocker_age: 4,
    lob: "Driver"
  },
  {
    product_team: "Driver",
    tam_pct: 68,
    avg_days_to_tam: 67,
    open_blockers: 27,
    median_blocker_age: 11,
    lob: "Driver"
  },
  {
    product_team: "Maps",
    tam_pct: 54,
    avg_days_to_tam: 80,
    open_blockers: 34,
    median_blocker_age: 13,
    lob: "Platform"
  },
  {
    product_team: "On-Trip UX",
    tam_pct: 91,
    avg_days_to_tam: 29,
    open_blockers: 7,
    median_blocker_age: 3,
    lob: "Rider"
  },
  {
    product_team: "Marketplace",
    tam_pct: 62,
    avg_days_to_tam: 72,
    open_blockers: 22,
    median_blocker_age: 9,
    lob: "Platform"
  },
  {
    product_team: "Delivery",
    tam_pct: 88,
    avg_days_to_tam: 35,
    open_blockers: 9,
    median_blocker_age: 5,
    lob: "Delivery"
  },
  {
    product_team: "Payments",
    tam_pct: 94,
    avg_days_to_tam: 25,
    open_blockers: 4,
    median_blocker_age: 2,
    lob: "Platform"
  },
  {
    product_team: "Eats",
    tam_pct: 79,
    avg_days_to_tam: 52,
    open_blockers: 16,
    median_blocker_age: 8,
    lob: "Delivery"
  },
  {
    product_team: "Autonomous",
    tam_pct: 42,
    avg_days_to_tam: 95,
    open_blockers: 41,
    median_blocker_age: 17,
    lob: "Advanced Tech"
  }
];

// New mock data for LOBs
export const mockLOBSnapshotData = [
  {
    lob: "Rider",
    tam_pct: 87,
    avg_days_to_tam: 38,
    open_blockers: 25,
    median_blocker_age: 5
  },
  {
    lob: "Driver",
    tam_pct: 72,
    avg_days_to_tam: 53, 
    open_blockers: 38,
    median_blocker_age: 8
  },
  {
    lob: "Platform",
    tam_pct: 70,
    avg_days_to_tam: 59,
    open_blockers: 60,
    median_blocker_age: 10
  },
  {
    lob: "Delivery",
    tam_pct: 83,
    avg_days_to_tam: 44,
    open_blockers: 25,
    median_blocker_age: 7
  },
  {
    lob: "Advanced Tech",
    tam_pct: 42,
    avg_days_to_tam: 95,
    open_blockers: 41,
    median_blocker_age: 17
  }
];

// New mock data for regions
export const mockRegionSnapshotData = [
  {
    region: "US/CAN",
    tam_pct: 93,
    avg_days_to_tam: 22,
    open_blockers: 17,
    median_blocker_age: 3
  },
  {
    region: "EMEA",
    tam_pct: 76,
    avg_days_to_tam: 47,
    open_blockers: 45,
    median_blocker_age: 9
  },
  {
    region: "APAC",
    tam_pct: 68,
    avg_days_to_tam: 58,
    open_blockers: 52,
    median_blocker_age: 12
  },
  {
    region: "LATAM",
    tam_pct: 62,
    avg_days_to_tam: 65,
    open_blockers: 38,
    median_blocker_age: 11
  }
];

// Mock data for countries
export const mockCountryData = [
  {
    country: "United States",
    region: "US/CAN",
    tam_pct: 95,
    avg_days_to_tam: 20,
    open_blockers: 12,
    median_blocker_age: 3
  },
  {
    country: "Canada",
    region: "US/CAN",
    tam_pct: 91,
    avg_days_to_tam: 24,
    open_blockers: 5,
    median_blocker_age: 4
  },
  {
    country: "United Kingdom",
    region: "EMEA",
    tam_pct: 89,
    avg_days_to_tam: 30,
    open_blockers: 8,
    median_blocker_age: 5
  },
  {
    country: "France",
    region: "EMEA",
    tam_pct: 82,
    avg_days_to_tam: 38,
    open_blockers: 11,
    median_blocker_age: 7
  },
  {
    country: "Germany",
    region: "EMEA",
    tam_pct: 80,
    avg_days_to_tam: 42,
    open_blockers: 14,
    median_blocker_age: 8
  },
  {
    country: "Spain",
    region: "EMEA",
    tam_pct: 77,
    avg_days_to_tam: 45,
    open_blockers: 9,
    median_blocker_age: 6
  },
  {
    country: "Italy",
    region: "EMEA",
    tam_pct: 72,
    avg_days_to_tam: 48,
    open_blockers: 13,
    median_blocker_age: 9
  },
  {
    country: "Australia",
    region: "APAC",
    tam_pct: 88,
    avg_days_to_tam: 32,
    open_blockers: 6,
    median_blocker_age: 4
  },
  {
    country: "Japan",
    region: "APAC",
    tam_pct: 76,
    avg_days_to_tam: 50,
    open_blockers: 10,
    median_blocker_age: 8
  },
  {
    country: "India",
    region: "APAC",
    tam_pct: 58,
    avg_days_to_tam: 70,
    open_blockers: 22,
    median_blocker_age: 14
  },
  {
    country: "Brazil",
    region: "LATAM",
    tam_pct: 69,
    avg_days_to_tam: 54,
    open_blockers: 15,
    median_blocker_age: 10
  },
  {
    country: "Mexico",
    region: "LATAM",
    tam_pct: 65,
    avg_days_to_tam: 60,
    open_blockers: 12,
    median_blocker_age: 11
  }
];

// Mock data for cities
export const mockCityData = [
  {
    city: "San Francisco",
    country: "United States",
    region: "US/CAN",
    tam_pct: 97,
    avg_days_to_tam: 18,
    open_blockers: 3,
    median_blocker_age: 2
  },
  {
    city: "New York",
    country: "United States",
    region: "US/CAN",
    tam_pct: 96,
    avg_days_to_tam: 19,
    open_blockers: 5,
    median_blocker_age: 3
  },
  {
    city: "Toronto",
    country: "Canada",
    region: "US/CAN",
    tam_pct: 93,
    avg_days_to_tam: 22,
    open_blockers: 3,
    median_blocker_age: 3
  },
  {
    city: "London",
    country: "United Kingdom",
    region: "EMEA",
    tam_pct: 91,
    avg_days_to_tam: 26,
    open_blockers: 4,
    median_blocker_age: 4
  },
  {
    city: "Paris",
    country: "France",
    region: "EMEA",
    tam_pct: 85,
    avg_days_to_tam: 34,
    open_blockers: 6,
    median_blocker_age: 5
  },
  {
    city: "Berlin",
    country: "Germany",
    region: "EMEA",
    tam_pct: 82,
    avg_days_to_tam: 38,
    open_blockers: 7,
    median_blocker_age: 6
  },
  {
    city: "Sydney",
    country: "Australia",
    region: "APAC",
    tam_pct: 90,
    avg_days_to_tam: 30,
    open_blockers: 3,
    median_blocker_age: 3
  },
  {
    city: "Tokyo",
    country: "Japan",
    region: "APAC",
    tam_pct: 79,
    avg_days_to_tam: 45,
    open_blockers: 5,
    median_blocker_age: 7
  },
  {
    city: "Mumbai",
    country: "India",
    region: "APAC",
    tam_pct: 62,
    avg_days_to_tam: 65,
    open_blockers: 12,
    median_blocker_age: 11
  },
  {
    city: "São Paulo",
    country: "Brazil",
    region: "LATAM",
    tam_pct: 72,
    avg_days_to_tam: 50,
    open_blockers: 8,
    median_blocker_age: 9
  },
  {
    city: "Mexico City",
    country: "Mexico",
    region: "LATAM",
    tam_pct: 68,
    avg_days_to_tam: 56,
    open_blockers: 9,
    median_blocker_age: 10
  }
];

// Generate 180 days of data with a linear increase from 35% to 72%
function generateDailyData() {
  const result = [];
  const today = new Date();
  const startPercent = 35;
  const endPercent = 72;
  const days = 180;
  
  // Generate a daily increment to go from start to end
  const dailyIncrement = (endPercent - startPercent) / days;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - i));
    
    // Calculate the percentage with some random noise for realism
    let percent = startPercent + (dailyIncrement * i);
    // Add some random noise (-1% to +1%)
    percent += (Math.random() * 2 - 1);
    // Ensure it's within reasonable bounds
    percent = Math.max(startPercent - 2, Math.min(percent, endPercent + 2));
    
    result.push({
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      global_tam_pct: Math.round(percent)
    });
  }
  
  return result;
}
