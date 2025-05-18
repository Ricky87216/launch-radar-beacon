
import { DashboardProvider } from "../context/DashboardContext";
import MyLaunchRadarContent from "../components/MyLaunchRadar";

const MyLaunchRadarPage = () => {
  return (
    <DashboardProvider>
      <MyLaunchRadarContent />
    </DashboardProvider>
  );
};

export default MyLaunchRadarPage;
