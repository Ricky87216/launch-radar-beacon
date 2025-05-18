
import Dashboard from "../components/Dashboard";
import { DashboardProvider } from "../context/DashboardContext";

const Index = () => {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
};

export default Index;
