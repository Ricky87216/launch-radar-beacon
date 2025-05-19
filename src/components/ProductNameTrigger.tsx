import { useState } from "react";
import ProductCardModal from "./ProductCardModal";
interface ProductNameTriggerProps {
  productId: string;
  productName: string;
  className?: string;
}
const ProductNameTrigger = ({
  productId,
  productName,
  className
}: ProductNameTriggerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return <>
      <span onClick={() => setIsModalOpen(true)} className="text-slate-100">
        {productName}
      </span>
      
      <ProductCardModal productId={productId} productName={productName} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>;
};
export default ProductNameTrigger;