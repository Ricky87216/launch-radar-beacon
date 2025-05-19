
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, FilterIcon, TrendingDown, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  Cell,
} from "recharts";
import { 
  mockDailyAnalyticsData, 
  mockTeamSnapshotData, 
  mockLOBSnapshotData,
  mockRegionSnapshotData,
  mockCountryData,
  mockCityData
} from "@/data/analyticsData"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Analytics = () => {
  const { toast } = useToast();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedLOBs, setSelectedLOBs] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [filteredTeamData, setFilteredTeamData] = useState(mockTeamSnapshotData);
  const [filteredLOBData, setFilteredLOBData] = useState(mockLOBSnapshotData);
  const [filteredRegionData, setFilteredRegionData] = useState(mockRegionSnapshotData);
  
  // For country/city selector
  const [selectedLocationType, setSelectedLocationType] = useState<"country" | "city">("country");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [locationData, setLocationData] = useState<any>(null);
  
  // Calculate metrics from data
  const latestGlobalTAM = mockDailyAnalyticsData[mockDailyAnalyticsData.length - 1].global_tam_pct;
  const ninetyDaysAgoTAM = mockDailyAnalyticsData[mockDailyAnalyticsData.length - 90].global_tam_pct;
  const ninetyDayDifference = latestGlobalTAM - ninetyDaysAgoTAM;
  
  // Calculate average days to TAM based on filtered data
  const avgDaysToTAM = Math.round(
    filteredTeamData.reduce((sum, team) => sum + team.avg_days_to_tam, 0) / filteredTeamData.length
  );
  
  // Calculate total blockers and median age
  const totalBlockers = filteredTeamData.reduce((sum, team) => sum + team.open_blockers, 0);
  
  // Get all blocker ages and calculate median
  const allBlockerAges = filteredTeamData.map(team => team.median_blocker_age);
  const medianBlockerAge = allBlockerAges.sort((a, b) => a - b)[Math.floor(allBlockerAges.length / 2)];
  
  const handleTeamFilter = (team: string) => {
    setSelectedTeams(prev => 
      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
    );
  };
  
  const handleLOBFilter = (lob: string) => {
    setSelectedLOBs(prev => 
      prev.includes(lob) ? prev.filter(l => l !== lob) : [...prev, lob]
    );
  };
  
  const handleRegionFilter = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };
  
  const clearFilters = () => {
    setSelectedTeams([]);
    setSelectedLOBs([]);
    setSelectedRegions([]);
    setSelectedLocation("");
    setLocationData(null);
  };
  
  // Handle location selection
  const handleLocationSelection = (value: string) => {
    setSelectedLocation(value);
    if (selectedLocationType === "country") {
      const countryData = mockCountryData.find(c => c.country === value);
      setLocationData(countryData);
    } else {
      const cityData = mockCityData.find(c => c.city === value);
      setLocationData(cityData);
    }
  };
  
  // Apply filters to team data
  useEffect(() => {
    let filteredTeams = [...mockTeamSnapshotData];
    
    if (selectedTeams.length > 0) {
      filteredTeams = filteredTeams.filter(team => selectedTeams.includes(team.product_team));
    }
    
    if (selectedLOBs.length > 0) {
      filteredTeams = filteredTeams.filter(team => selectedLOBs.includes(team.lob));
    }
    
    setFilteredTeamData(filteredTeams);
    
    // Filter LOB data
    let filteredLOBs = [...mockLOBSnapshotData];
    if (selectedLOBs.length > 0) {
      filteredLOBs = filteredLOBs.filter(lob => selectedLOBs.includes(lob.lob));
    }
    setFilteredLOBData(filteredLOBs);
    
    // Filter region data
    let filteredRegions = [...mockRegionSnapshotData];
    if (selectedRegions.length > 0) {
      filteredRegions = filteredRegions.filter(region => selectedRegions.includes(region.region));
    }
    setFilteredRegionData(filteredRegions);
    
  }, [selectedTeams, selectedLOBs, selectedRegions]);
  
  const getTAMColorClass = (tam: number) => {
    if (tam >= 85) return "text-[var(--uber-green)]";
    if (tam >= 70) return "text-[var(--uber-yellow)]";
    return "text-[var(--uber-red)]";
  };
  
  const getCustomBarFill = (tam: number) => {
    if (tam >= 85) return "var(--uber-green)";
    if (tam >= 70) return "var(--uber-yellow)";
    return "var(--uber-red)";
  };
  
  return (
    <ScrollArea className="h-full w-full">
      <div className="container mx-auto py-8 px-4 bg-[var(--uber-gray-10)]">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
          
          {/* Mission Banner */}
          <div className="bg-[var(--uber-black)] text-white p-4 rounded-lg mb-8">
            <h2 className="text-xl font-medium mb-2">Mission:</h2>
            <p className="text-lg italic">
              "Ship products globally as fast as possible — velocity is our strategic advantage."
            </p>
            <p className="mt-2">This dashboard tracks the speed and breadth of our launches.</p>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Panel */}
          <div className="w-full lg:w-60 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium flex items-center">
                <FilterIcon size={18} className="mr-2" />
                Filters
              </h3>
              <button 
                onClick={clearFilters}
                className="text-sm text-[var(--uber-gray-60)] hover:text-[var(--uber-black)]"
              >
                Clear all
              </button>
            </div>
            
            <Separator className="my-3" />
            
            <div className="mb-4">
              <h4 className="font-medium mb-2 flex items-center">
                Product Team <ChevronDown size={16} className="ml-1" />
              </h4>
              <div className="space-y-2">
                {mockTeamSnapshotData.map(team => (
                  <div key={team.product_team} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`team-${team.product_team}`}
                      checked={selectedTeams.includes(team.product_team)}
                      onCheckedChange={() => handleTeamFilter(team.product_team)}
                    />
                    <label 
                      htmlFor={`team-${team.product_team}`}
                      className="text-sm"
                    >
                      {team.product_team}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="mb-4">
              <h4 className="font-medium mb-2 flex items-center">
                Line of Business <ChevronDown size={16} className="ml-1" />
              </h4>
              <div className="space-y-2">
                {mockLOBSnapshotData.map(lob => (
                  <div key={lob.lob} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`lob-${lob.lob}`}
                      checked={selectedLOBs.includes(lob.lob)}
                      onCheckedChange={() => handleLOBFilter(lob.lob)}
                    />
                    <label 
                      htmlFor={`lob-${lob.lob}`}
                      className="text-sm"
                    >
                      {lob.lob}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="mb-4">
              <h4 className="font-medium mb-2 flex items-center">
                Region <ChevronDown size={16} className="ml-1" />
              </h4>
              <div className="space-y-2">
                {mockRegionSnapshotData.map(region => (
                  <div key={region.region} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`region-${region.region}`}
                      checked={selectedRegions.includes(region.region)}
                      onCheckedChange={() => handleRegionFilter(region.region)}
                    />
                    <label 
                      htmlFor={`region-${region.region}`}
                      className="text-sm"
                    >
                      {region.region}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            {/* Global KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--uber-gray-60)]">Global TAM %</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{latestGlobalTAM}%</div>
                  <p className="text-xs text-muted-foreground">Current global coverage</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--uber-gray-60)]">90-Day TAM Change</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center">
                  <div className="text-3xl font-bold">{ninetyDayDifference > 0 ? '+' : ''}{ninetyDayDifference}%</div>
                  {ninetyDayDifference > 0 ? (
                    <TrendingUp className="ml-2 text-[var(--uber-green)]" />
                  ) : (
                    <TrendingDown className="ml-2 text-[var(--uber-red)]" />
                  )}
                  <p className="text-xs text-muted-foreground ml-2">Past 90 days</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--uber-gray-60)]">Avg Days Launch → TAM</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{avgDaysToTAM}</div>
                  <p className="text-xs text-muted-foreground">Days from launch to TAM coverage</p>
                </CardContent>
              </Card>
            </div>
            
            {/* TAM Trend Line Chart */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Global TAM Coverage Trend (180 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer
                    config={{
                      tam: { color: "var(--uber-green)" },
                    }}
                  >
                    <LineChart
                      data={mockDailyAnalyticsData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis domain={[0, 100]} tickCount={6}>
                        <Label
                          value="Coverage %"
                          angle={-90}
                          position="insideLeft"
                          style={{ textAnchor: "middle", fontSize: 12 }}
                        />
                      </YAxis>
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
                                <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
                                <p className="text-sm">
                                  TAM Coverage: {payload[0].value}%
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="global_tam_pct"
                        name="TAM Coverage"
                        stroke="var(--uber-green)"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Team Bar Chart */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>TAM Coverage by Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={filteredTeamData}
                      margin={{ top: 20, right: 120, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} tickCount={6} />
                      <YAxis 
                        type="category"
                        dataKey="product_team" 
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const team = filteredTeamData.find(t => t.product_team === label);
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
                                <p className="font-medium">{label}</p>
                                <p className="text-sm">TAM Coverage: {payload[0].value}%</p>
                                <p className="text-sm">SLA: {team?.avg_days_to_tam} days</p>
                                <p className="text-sm">Open Blockers: {team?.open_blockers}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="tam_pct" 
                        fill="var(--uber-green)" 
                        label={(props) => {
                          const { x, y, width, height, value, index } = props;
                          const team = filteredTeamData[index];
                          return (
                            <text 
                              x={x + width + 10} 
                              y={y + height/2} 
                              dy={4} 
                              fontSize={12}
                              fill="var(--uber-gray-90)"
                              textAnchor="start"
                            >
                              SLA: {team.avg_days_to_tam}d
                            </text>
                          );
                        }}
                      >
                        {filteredTeamData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getCustomBarFill(entry.tam_pct)} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Summary Tabs for Team, LOB, and Region */}
            <Tabs defaultValue="team" className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="team">By Team</TabsTrigger>
                <TabsTrigger value="lob">By Line of Business</TabsTrigger>
                <TabsTrigger value="region">By Region</TabsTrigger>
              </TabsList>
              
              <TabsContent value="team">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Team Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team</TableHead>
                          <TableHead>LOB</TableHead>
                          <TableHead className="text-right">TAM %</TableHead>
                          <TableHead className="text-right">Avg Days → TAM</TableHead>
                          <TableHead className="text-right">Open Blockers</TableHead>
                          <TableHead className="text-right">Median Blocker Age</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTeamData.map((team) => (
                          <TableRow key={team.product_team}>
                            <TableCell className="font-medium">{team.product_team}</TableCell>
                            <TableCell>{team.lob}</TableCell>
                            <TableCell className={`text-right font-bold ${getTAMColorClass(team.tam_pct)}`}>
                              {team.tam_pct}%
                            </TableCell>
                            <TableCell className="text-right">{team.avg_days_to_tam} days</TableCell>
                            <TableCell className="text-right">{team.open_blockers}</TableCell>
                            <TableCell className="text-right">{team.median_blocker_age} days</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="lob">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Line of Business Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Line of Business</TableHead>
                          <TableHead className="text-right">TAM %</TableHead>
                          <TableHead className="text-right">Avg Days → TAM</TableHead>
                          <TableHead className="text-right">Open Blockers</TableHead>
                          <TableHead className="text-right">Median Blocker Age</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLOBData.map((lob) => (
                          <TableRow key={lob.lob}>
                            <TableCell className="font-medium">{lob.lob}</TableCell>
                            <TableCell className={`text-right font-bold ${getTAMColorClass(lob.tam_pct)}`}>
                              {lob.tam_pct}%
                            </TableCell>
                            <TableCell className="text-right">{lob.avg_days_to_tam} days</TableCell>
                            <TableCell className="text-right">{lob.open_blockers}</TableCell>
                            <TableCell className="text-right">{lob.median_blocker_age} days</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="region">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Region Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Region</TableHead>
                          <TableHead className="text-right">TAM %</TableHead>
                          <TableHead className="text-right">Avg Days → TAM</TableHead>
                          <TableHead className="text-right">Open Blockers</TableHead>
                          <TableHead className="text-right">Median Blocker Age</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRegionData.map((region) => (
                          <TableRow key={region.region}>
                            <TableCell className="font-medium">{region.region}</TableCell>
                            <TableCell className={`text-right font-bold ${getTAMColorClass(region.tam_pct)}`}>
                              {region.tam_pct}%
                            </TableCell>
                            <TableCell className="text-right">{region.avg_days_to_tam} days</TableCell>
                            <TableCell className="text-right">{region.open_blockers}</TableCell>
                            <TableCell className="text-right">{region.median_blocker_age} days</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Country/City Specific Metrics */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Country/City Specific Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <RadioGroup 
                      value={selectedLocationType}
                      onValueChange={(val) => {
                        setSelectedLocationType(val as "country" | "city");
                        setSelectedLocation("");
                        setLocationData(null);
                      }}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="country" id="country" />
                        <label htmlFor="country">Country</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="city" id="city" />
                        <label htmlFor="city">City</label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select {selectedLocationType === "country" ? "Country" : "City"}
                    </label>
                    <Select
                      value={selectedLocation}
                      onValueChange={handleLocationSelection}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue 
                          placeholder={`Select a ${selectedLocationType === "country" ? "country" : "city"}`} 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedLocationType === "country" 
                          ? mockCountryData.map(country => (
                              <SelectItem key={country.country} value={country.country}>
                                {country.country}
                              </SelectItem>
                            ))
                          : mockCityData.map(city => (
                              <SelectItem key={city.city} value={city.city}>
                                {city.city}
                              </SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {locationData ? (
                  <div className="mt-6">
                    <div className="bg-gray-50 p-4 mb-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">
                        {selectedLocationType === "country" 
                          ? locationData.country 
                          : `${locationData.city}, ${locationData.country}`}
                      </h3>
                      <p className="text-sm text-gray-600">Region: {locationData.region}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-md border">
                        <p className="text-sm text-gray-500">TAM Coverage</p>
                        <p className={`text-2xl font-bold ${getTAMColorClass(locationData.tam_pct)}`}>
                          {locationData.tam_pct}%
                        </p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-md border">
                        <p className="text-sm text-gray-500">Avg Days to TAM</p>
                        <p className="text-2xl font-bold">{locationData.avg_days_to_tam} days</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-md border">
                        <p className="text-sm text-gray-500">Open Blockers</p>
                        <p className="text-2xl font-bold">{locationData.open_blockers}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-6 mb-2">
                      <h4 className="font-medium">Blocker Details</h4>
                      <Badge variant="outline" className="bg-gray-100">
                        Median Age: {locationData.median_blocker_age} days
                      </Badge>
                    </div>
                    
                    {/* Mock blocker table */}
                    {locationData.open_blockers > 0 && (
                      <div className="border rounded-md overflow-hidden mt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Owner</TableHead>
                              <TableHead className="text-right">Age (days)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Array(Math.min(5, locationData.open_blockers)).fill(0).map((_, i) => (
                              <TableRow key={i}>
                                <TableCell>
                                  {["Maps", "Driver", "Rider", "Pricing", "Marketplace"][i % 5]}
                                </TableCell>
                                <TableCell>
                                  {["Legal", "Technical", "Product", "Localization", "Compliance"][i % 5]}
                                </TableCell>
                                <TableCell>
                                  {["Team A", "Team B", "Team C", "Team D", "Team E"][i % 5]}
                                </TableCell>
                                <TableCell className="text-right">
                                  {Math.max(1, locationData.median_blocker_age - 2 + i)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    {locationData.open_blockers === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-md border">
                        <p className="text-gray-500">No blockers for this location</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-md">
                    <p className="text-gray-500">
                      Select a {selectedLocationType === "country" ? "country" : "city"} to view metrics
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Bonus Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--uber-gray-60)]">Open Blockers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalBlockers}</div>
                  <p className="text-xs text-muted-foreground">Total open blockers</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--uber-gray-60)]">Median Blocker Age</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{medianBlockerAge}</div>
                  <p className="text-xs text-muted-foreground">Days</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--uber-gray-60)]">Escalations Open</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">9</div>
                  <p className="text-xs text-muted-foreground">Active escalations</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default Analytics;
