
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardProvider } from "@/context/DashboardContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MyLaunchRadar from "./pages/MyLaunchRadar";
import AdminDashboard from "./pages/admin";
import DataSync from "./pages/admin/DataSync";
import BulkEdit from "./pages/admin/BulkEdit";
import Logs from "./pages/admin/Logs";
import AnswerHub from "./pages/admin/AnswerHub";
import GlobalNavBar from "./components/GlobalNavBar";
import GlobalSidebar from "./components/GlobalSidebar";
import { useEffect } from "react";

// Empty placeholder for new Escalations page
const EscalationsLog = () => (
  <div className="container p-4">
    <h1 className="text-2xl font-bold mb-4">Escalations Log</h1>
    <p>This page is under development.</p>
  </div>
);

// URL Parameter handler component to redirect hash-based URLs to proper React Router routes
const URLParamHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if there's a hash with parameters
    if (location.hash && location.hash.includes('?')) {
      const hashParts = location.hash.split('?');
      if (hashParts.length > 1) {
        // Extract path and query parts
        const path = hashParts[0].replace('#', '');
        const query = hashParts[1];
        
        // Redirect to the proper React Router path with query params
        navigate({ pathname: path || '/', search: query }, { replace: true });
      }
    }
  }, [location.hash, navigate]);
  
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DashboardProvider>
        <BrowserRouter>
          <URLParamHandler />
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <GlobalSidebar />
              <div className="flex flex-col flex-1">
                <GlobalNavBar />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/my" element={<MyLaunchRadar />} />
                  <Route path="/escalations" element={<EscalationsLog />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/data-sync" element={<DataSync />} />
                  <Route path="/admin/bulk-edit" element={<BulkEdit />} />
                  <Route path="/admin/logs" element={<Logs />} />
                  <Route path="/admin/answer-hub" element={<AnswerHub />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </DashboardProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
