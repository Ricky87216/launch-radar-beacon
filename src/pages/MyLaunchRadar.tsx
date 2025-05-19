
import { DashboardProvider } from "../context/DashboardContext";
import MyLaunchRadar from "../components/MyLaunchRadar";
import { ProductCardProvider } from "../hooks/use-product-card";

const MyCoveragePage = () => {
  return (
    <DashboardProvider>
      <ProductCardProvider>
        <MyLaunchRadar />
      </ProductCardProvider>
    </DashboardProvider>
  );
};

export default MyCoveragePage;
