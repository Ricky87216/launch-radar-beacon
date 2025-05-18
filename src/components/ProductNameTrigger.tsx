
import { useState } from "react";
import ProductCardModal from "./ProductCardModal";

interface ProductNameTriggerProps {
  productId: string;
  productName: string;
  className?: string;
}

const ProductNameTrigger = ({ productId, productName, className }: ProductNameTriggerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <span 
        className={`cursor-pointer hover:underline ${className || ''}`}
        onClick={() => setIsModalOpen(true)}
      >
        {productName}
      </span>
      
      <ProductCardModal
        productId={productId}
        productName={productName}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};

export default ProductNameTrigger;
