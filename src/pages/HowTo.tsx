
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Grid, 
  Star, 
  BarChartIcon, 
  AlertTriangle, 
  Wrench, 
  Database,
  Search,
  Settings,
  CheckCircle,
  ShieldAlert,
  HelpCircle
} from "lucide-react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";

export default function HowTo() {
  const [selectedSection, setSelectedSection] = useState("overview");
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setSelectedSection(sectionId);
    }
  };
  
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar navigation */}
        <div className="md:w-64 shrink-0">
          <div className="sticky top-20 bg-background rounded-lg border p-4 shadow-sm">
            <h2 className="font-semibold text-lg mb-4 flex items-center">
              <HelpCircle className="mr-2 h-5 w-5 text-primary" />
              Guide Contents
            </h2>
            <nav className="space-y-1">
              {[
                { id: "overview", label: "Overview" },
                { id: "dashboard", label: "Main Dashboard" },
                { id: "my-coverage", label: "My Coverage" },
                { id: "analytics", label: "Analytics" },
                { id: "escalations", label: "Escalations" },
                { id: "ops-center", label: "Ops Update Center" },
                { id: "data-sync", label: "Data Sync" },
                { id: "tips-tricks", label: "Tips & Tricks" }
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedSection === section.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
            
            <div className="mt-6 pt-4 border-t">
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <Grid className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">How to Use Launch Radar</h1>
            <p className="text-xl text-muted-foreground">
              Unlock powerful insights into global product launches and coverage metrics
            </p>
          </header>
          
          {/* Overview Section */}
          <section id="overview" className="mb-12 scroll-mt-20">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <HelpCircle className="mr-2 h-6 w-6 text-primary" />
                  Getting Started
                </CardTitle>
                <CardDescription>
                  Welcome to Launch Radar! Here's how to make the most of this powerful tool.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="mb-4">
                    Launch Radar gives you real-time visibility into global product launches, 
                    helping you track coverage, identify blockers, and escalate issues efficiently. 
                    This guide will walk you through all the key features so you can:
                  </p>
                  
                  <ul className="space-y-2 my-4">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Monitor launch coverage across markets and products</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Identify blockers preventing successful launches</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Track escalations and their resolution status</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Update launch statuses and manage blockers</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Create personalized views for your markets of interest</span>
                    </li>
                  </ul>
                  
                  <p>
                    Use the navigation bar on the left to jump between sections of this guide,
                    or continue scrolling to explore features in detail.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <Card className="bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">For Product Teams</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Track global launch coverage, identify markets with blockers, and ensure maximum product reach.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">For Operations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Update market statuses, manage blockers, and sync data from operational systems.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">For Leadership</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Get high-level analytics on launch coverage, track escalations, and monitor launch progress.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Dashboard Section */}
          <section id="dashboard" className="mb-12 scroll-mt-20">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Grid className="mr-2 h-6 w-6 text-primary" />
                  Main Dashboard
                </CardTitle>
                <CardDescription>
                  The central hub for monitoring global launch coverage and blockers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Key Features:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Badge className="mt-0.5 mr-2" variant="outline">1</Badge>
                      <div>
                        <p className="font-medium">Heatmap Grid</p>
                        <p className="text-muted-foreground text-sm">
                          Visualize product coverage across markets with color-coded cells. 
                          Green indicates full coverage, amber shows partial coverage, and 
                          red highlights blocked markets.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Badge className="mt-0.5 mr-2" variant="outline">2</Badge>
                      <div>
                        <p className="font-medium">Filters Panel</p>
                        <p className="text-muted-foreground text-sm">
                          Narrow down results by line of business, sub-team, coverage type, and more 
                          to focus on specific areas of interest.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Badge className="mt-0.5 mr-2" variant="outline">3</Badge>
                      <div>
                        <p className="font-medium">Blockers & Escalations</p>
                        <p className="text-muted-foreground text-sm">
                          Click on red cells to view blocker details and escalate issues when 
                          necessary to unblock launches.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <Tabs defaultValue="using" className="mt-6">
                  <TabsList>
                    <TabsTrigger value="using">Using the Dashboard</TabsTrigger>
                    <TabsTrigger value="tips">Pro Tips</TabsTrigger>
                  </TabsList>
                  <TabsContent value="using" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Navigating the Heatmap</h4>
                      <p className="text-sm text-muted-foreground">
                        The heatmap displays products (rows) and markets (columns). Each cell 
                        represents the coverage status for that product-market combination:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded bg-green-500 mr-1"></div>
                          <span className="text-sm">Full Coverage</span>
                        </div>
                        <div className="flex items-center ml-4">
                          <div className="w-4 h-4 rounded bg-amber-500 mr-1"></div>
                          <span className="text-sm">Partial Coverage</span>
                        </div>
                        <div className="flex items-center ml-4">
                          <div className="w-4 h-4 rounded bg-red-500 mr-1"></div>
                          <span className="text-sm">Blocked</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Viewing Blockers</h4>
                      <p className="text-sm text-muted-foreground">
                        Click on any red cell to open the blocker details modal. Here you'll see 
                        information about what's preventing the launch, who's responsible, and the 
                        estimated time to resolution.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Escalating Issues</h4>
                      <p className="text-sm text-muted-foreground">
                        If a blocker needs executive attention, use the "Escalate" button in the 
                        blocker modal to create a formal escalation. This will notify relevant 
                        stakeholders and track the issue through resolution.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="tips" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Filter Combinations</h4>
                      <p className="text-sm text-muted-foreground">
                        Combine filters to zero in on specific areas. For example, filter by a specific 
                        line of business and hide full coverage to quickly identify problematic markets.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Coverage Types</h4>
                      <p className="text-sm text-muted-foreground">
                        Switch between "City %" and "GB Weighted" views to see different perspectives 
                        on coverage. City % shows raw market counts, while GB Weighted accounts for 
                        market size.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">TAM Focus</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the "TAM Only" filter to focus exclusively on high-priority markets that 
                        represent your total addressable market.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6">
                  <Link to="/">
                    <Button className="flex items-center">
                      Explore the Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* My Coverage Section */}
          <section id="my-coverage" className="mb-12 scroll-mt-20">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Star className="mr-2 h-6 w-6 text-yellow-500" />
                  My Coverage
                </CardTitle>
                <CardDescription>
                  Personalize your view to focus on regions and countries most relevant to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="mb-4">
                    The My Coverage feature allows you to create a personalized view of product 
                    launches and blockers affecting only the markets you care about most. This 
                    is perfect for regional managers or teams focused on specific territories.
                  </p>
                  
                  <h3 className="text-lg font-medium mt-6 mb-2">How to Set Up Your Personalized View:</h3>
                  <ol className="space-y-4">
                    <li className="flex items-start">
                      <Badge className="mt-0.5 mr-2" variant="outline">1</Badge>
                      <div>
                        <p className="font-medium">Navigate to My Coverage</p>
                        <p className="text-muted-foreground text-sm">
                          Click on "My Coverage" in the sidebar navigation to access your 
                          personalized dashboard.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Badge className="mt-0.5 mr-2" variant="outline">2</Badge>
                      <div>
                        <p className="font-medium">Select Your Markets</p>
                        <p className="text-muted-foreground text-sm">
                          Click "Edit Preferences" to open the preferences modal. Here you can 
                          select specific regions and countries you want to monitor.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Badge className="mt-0.5 mr-2" variant="outline">3</Badge>
                      <div>
                        <p className="font-medium">Save Your Preferences</p>
                        <p className="text-muted-foreground text-sm">
                          After selecting your markets of interest, click "Save Preferences" to 
                          update your personalized view.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Badge className="mt-0.5 mr-2" variant="outline">4</Badge>
                      <div>
                        <p className="font-medium">Review Personalized Blockers</p>
                        <p className="text-muted-foreground text-sm">
                          Your dashboard will now display a vertical stack of products with blockers in your 
                          selected regions and countries, allowing for focused attention. Each product card includes
                          detailed information about blockers, including any escalation notes when available.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg mt-6">
                  <h4 className="font-medium flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Benefits of Personalization
                  </h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                      <span>Focus only on markets relevant to your role</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                      <span>Quickly identify blockers in your regions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                      <span>Track resolution progress for issues in your territory</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                      <span>Switch between personalized and global views as needed</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                      <span>View detailed escalation notes and status updates for each blocker</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-6">
                  <Link to="/my">
                    <Button className="flex items-center">
                      Set Up My Coverage
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Analytics Section */}
          <section id="analytics" className="mb-12 scroll-mt-20">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <BarChartIcon className="mr-2 h-6 w-6 text-primary" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  Gain deeper insights with data visualizations and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6">
                  The Analytics section provides visual representations of your launch coverage data, 
                  helping you identify trends, track progress over time, and make data-driven decisions.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Available Reports</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <span>Coverage Trends Over Time</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <span>Blocker Resolution Rates</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <span>Escalation Statistics</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <span>Product Launch Performance</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <span>Regional Coverage Comparisons</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">How to Use Analytics</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Badge className="mt-0.5 mr-2" variant="outline">1</Badge>
                        <span>Select the report type from the dashboard</span>
                      </li>
                      <li className="flex items-start">
                        <Badge className="mt-0.5 mr-2" variant="outline">2</Badge>
                        <span>Apply filters to focus on specific products, regions, or time periods</span>
                      </li>
                      <li className="flex items-start">
                        <Badge className="mt-0.5 mr-2" variant="outline">3</Badge>
                        <span>Export results or share insights with stakeholders</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium">Pro Tip: Data Storytelling</h4>
                  <p className="text-sm mt-1">
                    Use the combination of different reports to tell a compelling story about your 
                    launch progress. For example, track how escalation interventions correlate with 
                    improved coverage metrics over time to demonstrate the impact of the process.
                  </p>
                </div>
                
                <div className="mt-6">
                  <Link to="/analytics">
                    <Button className="flex items-center">
                      Explore Analytics
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Escalations Section */}
          <section id="escalations" className="mb-12 scroll-mt-20">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <ShieldAlert className="mr-2 h-6 w-6 text-red-500" />
                  Escalations
                </CardTitle>
                <CardDescription>
                  Manage and track escalated launch blockers through resolution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="mb-4">
                    The escalation process helps resolve critical blockers by bringing them to the 
                    attention of leadership. When regular channels aren't making progress, 
                    escalations ensure blockers receive proper prioritization and resources.
                  </p>
                  
                  <NavigationMenu className="max-w-full w-full my-6">
                    <NavigationMenuList className="w-full justify-start border-b space-x-2">
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Creating Escalations</NavigationMenuTrigger>
                        <NavigationMenuContent className="min-w-[400px] p-4">
                          <div className="space-y-3">
                            <h4 className="font-medium">How to Create an Escalation</h4>
                            <ol className="space-y-2 text-sm">
                              <li>1. Identify a blocked market that needs leadership attention</li>
                              <li>2. Click on the red cell in the heatmap to open the blocker modal</li>
                              <li>3. Click "Escalate" to open the escalation form</li>
                              <li>4. Complete all required fields, including:</li>
                              <ul className="ml-6 mt-1 space-y-1">
                                <li>• Point of contact</li>
                                <li>• Escalation reason</li>
                                <li>• Reason category</li>
                                <li>• Business case URL (if available)</li>
                                <li>• Technical and operational stakeholders</li>
                                <li>• Detailed notes explaining the issue and context</li>
                              </ul>
                              <li>5. Submit the escalation for review</li>
                            </ol>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Tracking Escalations</NavigationMenuTrigger>
                        <NavigationMenuContent className="min-w-[400px] p-4">
                          <div className="space-y-3">
                            <h4 className="font-medium">Monitoring Escalation Status</h4>
                            <p className="text-sm">
                              All escalations are tracked in the Escalations Log, which provides:
                            </p>
                            <ul className="space-y-1 text-sm">
                              <li>• Complete history of each escalation</li>
                              <li>• Current status (Submitted, In Discussion, Resolved)</li>
                              <li>• Resolution outcomes (Launched, Blocked, Deferred)</li>
                              <li>• Notes and comments from stakeholders</li>
                              <li>• Full escalation history with timestamps</li>
                            </ul>
                            <p className="text-sm">
                              You can filter the log by product, market, status, and date range 
                              to find specific escalations. Escalation details are also visible directly
                              in the My Coverage view for escalated blockers affecting your selected markets.
                            </p>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Resolution Process</NavigationMenuTrigger>
                        <NavigationMenuContent className="min-w-[400px] p-4">
                          <div className="space-y-3">
                            <h4 className="font-medium">Escalation Resolution Flow</h4>
                            <div className="space-y-2 text-sm">
                              <p className="font-medium">1. Submission</p>
                              <p>Escalation is created and stakeholders are notified</p>
                              
                              <p className="font-medium">2. Discussion</p>
                              <p>Leadership reviews the case and discusses potential solutions</p>
                              
                              <p className="font-medium">3. Decision</p>
                              <p>A decision is made on whether to proceed with launch</p>
                              
                              <p className="font-medium">4. Resolution</p>
                              <p>Final status is recorded and market is updated accordingly</p>
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mt-6">
                    <h4 className="font-medium flex items-center text-yellow-800">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      When to Escalate
                    </h4>
                    <p className="text-sm mt-2 text-yellow-800">
                      Escalations should be reserved for significant blockers that can't be resolved 
                      through normal channels. Before escalating, ensure you've:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-600 mt-1.5 mr-2"></div>
                        <span>Attempted to resolve the issue through standard processes</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-600 mt-1.5 mr-2"></div>
                        <span>Documented the impact of the blocker on business metrics</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-600 mt-1.5 mr-2"></div>
                        <span>Identified potential solutions that require leadership approval</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link to="/escalations">
                    <Button className="flex items-center">
                      View Escalations Log
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/admin/escalations">
                    <Button variant="outline" className="flex items-center">
                      Manage Escalations
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Ops Update Center Section */}
          <section id="ops-center" className="mb-12 scroll-mt-20">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Wrench className="mr-2 h-6 w-6 text-primary" />
                  Ops Update Center
                </CardTitle>
                <CardDescription>
                  Bulk edit and manage product launch statuses across markets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6">
                  The Operations Update Center provides powerful tools for operations teams to 
                  efficiently manage launch statuses, blockers, and resolutions across multiple 
                  products and markets simultaneously.
                </p>
                
                <div className="space-y-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Key Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Bulk Editing</p>
                          <p className="text-muted-foreground text-sm">
                            Update multiple products and markets at once with batch operations
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Advanced Filtering</p>
                          <p className="text-muted-foreground text-sm">
                            Quickly find the exact records you need to update with powerful filters
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Status Management</p>
                          <p className="text-muted-foreground text-sm">
                            Update launch statuses, blocker details, ETAs, and ownership
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Direct Escalations</p>
                          <p className="text-muted-foreground text-sm">
                            Escalate blocked markets directly from the update grid
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">How to Use the Ops Center</h3>
                    <ol className="space-y-3">
                      <li className="flex items-start">
                        <Badge className="mt-0.5 mr-2" variant="outline">1</Badge>
                        <div>
                          <p className="font-medium">Filter Records</p>
                          <p className="text-muted-foreground text-sm">
                            Use the filter panel to narrow down to specific products, regions, 
                            countries, or cities you want to update.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Badge className="mt-0.5 mr-2" variant="outline">2</Badge>
                        <div>
                          <p className="font-medium">Select Records</p>
                          <p className="text-muted-foreground text-sm">
                            Check the boxes next to individual records or use "Select All" to 
                            choose multiple records at once.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Badge className="mt-0.5 mr-2" variant="outline">3</Badge>
                        <div>
                          <p className="font-medium">Apply Updates</p>
                          <p className="text-muted-foreground text-sm">
                            Use the bulk action toolbar to apply changes to all selected records, 
                            or click on individual cells to edit them one by one.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Badge className="mt-0.5 mr-2" variant="outline">4</Badge>
                        <div>
                          <p className="font-medium">Save Changes</p>
                          <p className="text-muted-foreground text-sm">
                            Submit your changes to update the database and refresh the dashboard.
                          </p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="font-medium flex items-center text-blue-800">
                    <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                    Best Practices for Bulk Updates
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-800">
                    <li className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 mr-2"></div>
                      <span>Always apply filters first to narrow down the records you're modifying</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 mr-2"></div>
                      <span>Review your selection before submitting changes</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 mr-2"></div>
                      <span>Add detailed notes when changing status to help track history</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 mr-2"></div>
                      <span>Always assign an owner when setting a status to BLOCKED</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-6">
                  <Link to="/admin/bulk-edit">
                    <Button className="flex items-center">
                      Open Ops Update Center
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Data Sync Section */}
          <section id="data-sync" className="mb-12 scroll-mt-20">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Database className="mr-2 h-6 w-6 text-primary" />
                  Data Sync
                </CardTitle>
                <CardDescription>
                  Import and synchronize data from external systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6">
                  The Data Sync module allows you to keep your Launch Radar data up-to-date by 
                  importing information from source systems, uploading CSV files, or configuring 
                  automated API integrations.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Data Import Methods</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <div>
                          <p className="font-medium">CSV Upload</p>
                          <p className="text-muted-foreground text-sm">
                            Import data from spreadsheets and CSV files
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <div>
                          <p className="font-medium">API Configuration</p>
                          <p className="text-muted-foreground text-sm">
                            Set up automated data feeds from source systems
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <div>
                          <p className="font-medium">Manual Entry</p>
                          <p className="text-muted-foreground text-sm">
                            Input data directly through the user interface
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Supported Data Types</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <div>
                          <p className="font-medium">Product Metadata</p>
                          <p className="text-muted-foreground text-sm">
                            Product names, IDs, categories, and hierarchy
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <div>
                          <p className="font-medium">Market Information</p>
                          <p className="text-muted-foreground text-sm">
                            City, country, region data and market metrics
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <div>
                          <p className="font-medium">Coverage Status</p>
                          <p className="text-muted-foreground text-sm">
                            Product launch status in each market
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <div>
                          <p className="font-medium">Blockers & Escalations</p>
                          <p className="text-muted-foreground text-sm">
                            Details about what's preventing launches
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium">CSV Template Guide</h4>
                  <p className="text-sm mt-1">
                    When uploading data via CSV, use the provided templates to ensure your data 
                    is formatted correctly. Each template includes:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                      <span>Required column headers</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                      <span>Data format examples</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                      <span>Validation rules</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-6">
                  <Link to="/admin/data-sync">
                    <Button className="flex items-center">
                      Access Data Sync
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Tips & Tricks Section */}
          <section id="tips-tricks" className="mb-12 scroll-mt-20">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Settings className="mr-2 h-6 w-6 text-primary" />
                  Tips & Tricks
                </CardTitle>
                <CardDescription>
                  Advanced techniques to get the most out of Launch Radar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Keyboard Shortcuts</h3>
                    <div className="grid grid-cols-2 gap-3 md:gap-6">
                      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                        <span className="font-mono text-sm">Ctrl + K</span>
                        <span className="text-sm text-muted-foreground">Open Search</span>
                      </div>
                      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                        <span className="font-mono text-sm">Ctrl + F</span>
                        <span className="text-sm text-muted-foreground">Filter Dashboard</span>
                      </div>
                      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                        <span className="font-mono text-sm">Ctrl + H</span>
                        <span className="text-sm text-muted-foreground">Toggle Full Coverage</span>
                      </div>
                      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                        <span className="font-mono text-sm">Esc</span>
                        <span className="text-sm text-muted-foreground">Close Modal</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Advanced Filtering</h3>
                    <p className="mb-3">
                      Combine multiple filters to gain powerful insights into your data:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <span>Filter by Line of Business + Sub-Team to see team-specific coverage</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <span>Apply the "Hide Full Coverage" option to focus on problem areas</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></div>
                        <span>Switch coverage types to see different perspectives on the same data</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Reporting Workflows</h3>
                    <p className="mb-3">
                      Streamline your regular reporting with these workflows:
                    </p>
                    <ol className="space-y-3">
                      <li className="flex items-start">
                        <Badge className="mt-0.5 mr-2" variant="outline">1</Badge>
                        <div>
                          <p className="font-medium">Weekly Review</p>
                          <p className="text-muted-foreground text-sm">
                            Check the Analytics dashboard for coverage trends, then review
                            new escalations in the Escalation Log
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Badge className="mt-0.5 mr-2" variant="outline">2</Badge>
                        <div>
                          <p className="font-medium">Regional Deep Dive</p>
                          <p className="text-muted-foreground text-sm">
                            Set up My Coverage for specific regions, then filter the main dashboard
                            by those same regions for a comprehensive view
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Badge className="mt-0.5 mr-2" variant="outline">3</Badge>
                        <div>
                          <p className="font-medium">Ops Maintenance</p>
                          <p className="text-muted-foreground text-sm">
                            Use Bulk Edit to manage and update multiple records at once, then
                            verify changes on the main dashboard
                          </p>
                        </div>
                      </li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Troubleshooting</h3>
                    <div className="space-y-3">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium">Issue: Data not showing up after import</p>
                        <p className="text-sm mt-1">
                          Solution: Check the Data Sync logs for any errors, and verify that your
                          file format matches the required template. Try reloading the dashboard.
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium">Issue: Filter not working as expected</p>
                        <p className="text-sm mt-1">
                          Solution: Reset all filters and apply them one by one to identify which
                          filter is causing the issue.
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium">Issue: Escalation not appearing in log</p>
                        <p className="text-sm mt-1">
                          Solution: Verify that the escalation was submitted successfully. Check
                          for any error messages during submission and try again.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Footer */}
          <footer className="mt-12 pt-8 border-t">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-2">Quick Navigation</h3>
                <ul className="space-y-1">
                  <li><a href="#overview" className="text-sm text-primary hover:underline">Overview</a></li>
                  <li><a href="#dashboard" className="text-sm text-primary hover:underline">Main Dashboard</a></li>
                  <li><a href="#my-coverage" className="text-sm text-primary hover:underline">My Coverage</a></li>
                  <li><a href="#analytics" className="text-sm text-primary hover:underline">Analytics</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Resources</h3>
                <ul className="space-y-1">
                  <li><a href="#escalations" className="text-sm text-primary hover:underline">Escalations Guide</a></li>
                  <li><a href="#ops-center" className="text-sm text-primary hover:underline">Ops Center Guide</a></li>
                  <li><a href="#data-sync" className="text-sm text-primary hover:underline">Data Sync Guide</a></li>
                  <li><a href="#tips-tricks" className="text-sm text-primary hover:underline">Tips & Tricks</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Need More Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  If you need additional support or have questions that aren't covered in this guide,
                  please contact the Launch Radar support team.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t text-center text-muted-foreground text-sm">
              <p>Launch Radar User Guide © 2025 Launch Systems</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
