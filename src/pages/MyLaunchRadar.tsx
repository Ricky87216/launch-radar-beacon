
import { DashboardProvider } from "../context/DashboardContext";
import Dashboard from "../components/Dashboard";

const MyCoveragePage = () => {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
};

export default MyCoveragePage;
