
import { DashboardProvider } from "../context/DashboardContext";
import MyLaunchRadar from "../components/MyLaunchRadar";

const MyCoveragePage = () => {
  return (
    <DashboardProvider>
      <MyLaunchRadar />
    </DashboardProvider>
  );
};

export default MyCoveragePage;
