
import { useState, useEffect } from "react";
import { Blocker } from "@/types";

interface ProductBlocker {
  id: string;
  name: string;
  coverage: number;
  blockedCount: number;
  totalCount: number;
  blockers: Blocker[];
  lastUpdated: string;
}

export function useDemoData() {
  const [productBlockers, setProductBlockers] = useState<ProductBlocker[]>([]);
  const [userPrefs, setUserPrefs] = useState<{ regions: string[], countries: string[] } | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  
  // Function to load demo data
  const loadDemoData = () => {
    setLoading(true);
    
    // Create demo preferences
    setUserPrefs({
      regions: ["mr-2"], // EMEA
      countries: ["r-3", "r-4"] // UK and Germany
    });
    
    // Create mock product blockers data with extended escalation info
    const mockProductBlockers: ProductBlocker[] = [
      {
        id: "p-1",
        name: "Product Alpha",
        coverage: 75,
        blockedCount: 2,
        totalCount: 8,
        blockers: [
          {
            id: "demo-b1",
            product_id: "p-1",
            market_id: "city-5", // Westminster
            category: "Regulatory",
            owner: "Jane Smith",
            eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            note: "Waiting for local authority approval",
            jira_url: "https://jira.example.com/issue/LAR-123",
            escalated: false,
            created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            resolved: false,
            stale: false,
            escalation: {
              id: "esc-1",
              status: "IN_REVIEW",
              raised_by: "Jane Smith",
              created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              reason_type: "Regulatory"
            }
          },
          {
            id: "demo-b2",
            product_id: "p-1",
            market_id: "city-6", // Camden
            category: "Technical",
            owner: "Mark Johnson",
            eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
            note: "Integration issue with local payment processor",
            jira_url: "https://jira.example.com/issue/LAR-124",
            escalated: true,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            resolved: false,
            stale: false,
            escalation: {
              id: "esc-2",
              status: "ALIGNED",
              raised_by: "Alex Thompson",
              created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              reason_type: "Technical"
            }
          }
        ],
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: "p-3",
        name: "Product Gamma",
        coverage: 50,
        blockedCount: 4,
        totalCount: 8,
        blockers: [
          {
            id: "demo-b3",
            product_id: "p-3",
            market_id: "city-7", // Mitte (Berlin)
            category: "Business",
            owner: "Lisa Mueller",
            eta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
            note: "Price point renegotiation with local partner",
            jira_url: "https://jira.example.com/issue/LAR-125",
            escalated: true,
            created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
            updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
            resolved: false,
            stale: false,
            escalation: {
              id: "esc-3",
              status: "ESCALATED_TO_LEGAL",
              raised_by: "Lisa Mueller",
              created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              reason_type: "Business"
            }
          },
          {
            id: "demo-b4",
            product_id: "p-3",
            market_id: "c-9", // Munich
            category: "Legal",
            owner: "Hans Schmidt",
            eta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            note: "Legal compliance review ongoing",
            jira_url: "https://jira.example.com/issue/LAR-126",
            escalated: false,
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
            updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            resolved: false,
            stale: true,
            escalation: {
              id: "esc-4",
              status: "SUBMITTED",
              raised_by: "Hans Schmidt",
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              reason_type: "Legal"
            }
          },
          {
            id: "demo-b5",
            product_id: "p-3",
            market_id: "c-8", // Berlin
            category: "Partner",
            owner: "Astrid Weber",
            eta: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
            note: "Waiting for partner technical integration",
            jira_url: "https://jira.example.com/issue/LAR-127",
            escalated: false,
            created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            resolved: false,
            stale: false
          }
        ],
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        id: "p-6",
        name: "Product Zeta",
        coverage: 87.5,
        blockedCount: 1,
        totalCount: 8,
        blockers: [
          {
            id: "demo-b6",
            product_id: "p-6",
            market_id: "city-5", // Westminster
            category: "Technical",
            owner: "Emily Richards",
            eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
            note: "Backend system adaptation required for local regulations",
            jira_url: "https://jira.example.com/issue/LAR-128",
            escalated: false,
            created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            resolved: false,
            stale: false,
            escalation: {
              id: "esc-6",
              status: "RESOLVED_EXCEPTION",
              raised_by: "Emily Richards",
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              reason_type: "Technical"
            }
          }
        ],
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      }
    ];
    
    // Set the data and turn off loading
    setProductBlockers(mockProductBlockers);
    setLoading(false);
    
    // Set one product as expanded by default
    setExpandedProducts({ "p-3": true });
  };

  useEffect(() => {
    loadDemoData();
  }, []);

  return {
    loading,
    userPrefs,
    productBlockers,
    expandedProducts
  };
}
