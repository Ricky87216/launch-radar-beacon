
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
