
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MyLaunchRadar from "./pages/MyLaunchRadar";
import AdminDashboard from "./pages/admin";
import DataSync from "./pages/admin/DataSync";
import BulkEdit from "./pages/admin/BulkEdit";
import Logs from "./pages/admin/Logs";
import GlobalNavBar from "./components/GlobalNavBar";
import GlobalSidebar from "./components/GlobalSidebar";

// Empty placeholder for new Escalations page
const EscalationsLog = () => (
  <div className="container p-4">
    <h1 className="text-2xl font-bold mb-4">Escalations Log</h1>
    <p>This page is under development.</p>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
