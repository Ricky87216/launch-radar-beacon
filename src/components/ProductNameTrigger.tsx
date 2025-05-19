
import { useState } from "react";
import { cn } from "@/lib/utils";
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
      <span 
        onClick={() => setIsModalOpen(true)} 
        className={cn(
          "text-slate-100 cursor-pointer hover:underline transition-colors duration-200",
          className
        )}
      >
        {productName}
      </span>
      
      <ProductCardModal productId={productId} productName={productName} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>;
};

export default ProductNameTrigger;
