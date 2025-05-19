
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "./ProductCard";
import { Blocker } from "@/types";

interface ProductBlocker {
  id: string;
  name: string;
  coverage: number;
  blockedCount: number;
  totalCount: number;
  blockers: Blocker[];
  lastUpdated: string;
}

interface ProductGridProps {
  productBlockers: ProductBlocker[];
  getMarketById: (id: string) => any;
  openProductCard: (productId: string, productName: string) => void;
  viewEscalation: (escalationId: string) => void;
}

export function ProductGrid({ 
  productBlockers, 
  getMarketById,
  openProductCard,
  viewEscalation
}: ProductGridProps) {
  const navigate = useNavigate();

  if (productBlockers.length === 0) {
    return (
      <div className="bg-green-50 rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-2xl font-bold mb-2">All clear in your markets!</h2>
        <p className="text-muted-foreground mb-4">There are no blockers in your selected regions and countries.</p>
        <Button onClick={() => navigate('/')}>View Global Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {productBlockers.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          getMarketById={getMarketById}
          openProductCard={openProductCard}
          viewEscalation={viewEscalation}
        />
      ))}
    </div>
  );
}
