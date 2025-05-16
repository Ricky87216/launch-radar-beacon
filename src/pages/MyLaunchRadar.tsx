
import { DashboardProvider } from "../context/DashboardContext";
import MyLaunchRadar from "../components/MyLaunchRadar";

const MyLaunchRadarPage = () => {
  return (
    <DashboardProvider>
      <MyLaunchRadar />
    </DashboardProvider>
  );
};

export default MyLaunchRadarPage;
