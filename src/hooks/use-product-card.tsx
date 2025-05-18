
import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import ProductCardModal from '@/components/ProductCardModal';

interface ProductCardContextType {
  openProductCard: (productId: string, productName: string) => void;
}

const ProductCardContext = createContext<ProductCardContextType | undefined>(undefined);

export const ProductCardProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openProductCard = useCallback((productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName });
    setIsModalOpen(true);
  }, []);

  return (
    <ProductCardContext.Provider value={{ openProductCard }}>
      {children}
      
      {selectedProduct && (
        <ProductCardModal 
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </ProductCardContext.Provider>
  );
};

export const useProductCard = (): ProductCardContextType => {
  const context = useContext(ProductCardContext);
  
  if (!context) {
    throw new Error('useProductCard must be used within a ProductCardProvider');
  }
  
  return context;
};
