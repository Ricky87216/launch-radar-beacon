
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { DashboardProvider } from "@/context/DashboardContext";
import { SidebarProvider } from "@/components/ui/sidebar";

// Layout components
import GlobalSidebar from "@/components/GlobalSidebar";
import GlobalNavBar from "@/components/GlobalNavBar";

// Pages
import Index from "@/pages/Index";
import MyLaunchRadar from "@/pages/MyLaunchRadar";
import NotFound from "@/pages/NotFound";
import BulkEdit from "@/pages/admin/BulkEdit";
import Escalations from "@/pages/admin/Escalations";
import DataSync from "@/pages/admin/DataSync";
import AnswerHub from "@/pages/admin/AnswerHub";
import Logs from "@/pages/admin/Logs";
import EscalationLog from "@/pages/EscalationLog";
import ProductMeta from "@/pages/admin/ProductMeta";
import Analytics from "@/pages/Analytics";
import HowTo from "@/pages/HowTo";
import Dashboard from "@/components/Dashboard";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardProvider>
        <Router>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <GlobalSidebar />
              <div className="flex-1 flex flex-col">
                <GlobalNavBar />
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/my" element={<MyLaunchRadar />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/how-to" element={<HowTo />} />
                    <Route path="/admin/bulk-edit" element={<BulkEdit />} />
                    <Route path="/admin/data-sync" element={<DataSync />} />
                    <Route path="/admin/answer-hub" element={<AnswerHub />} />
                    <Route path="/admin/logs" element={<Logs />} />
                    <Route path="/admin/escalations" element={<Escalations />} />
                    <Route path="/admin/product-meta" element={<ProductMeta />} />
                    <Route path="/escalations" element={<EscalationLog />} />
                    <Route path="/escalations/:id" element={<EscalationLog />} />
                    <Route path="/index" element={<Index />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
            <Toaster />
          </SidebarProvider>
        </Router>
      </DashboardProvider>
    </QueryClientProvider>
  );
}

export default App;
