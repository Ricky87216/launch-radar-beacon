
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Blocker } from "@/types";
import { formatRelativeTime } from "@/utils/dateUtils";
import { BlockersTable } from "./BlockersTable";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    coverage: number;
    blockedCount: number;
    totalCount: number;
    blockers: Blocker[];
    lastUpdated: string;
  };
  openProductCard: (productId: string, productName: string) => void;
  getMarketById: (id: string) => any;
  viewEscalation: (escalationId: string) => void;
}

export function ProductCard({ product, openProductCard, getMarketById, viewEscalation }: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return "bg-green-100 text-green-800 border-[#6FCF97]";
    if (coverage >= 50) return "bg-yellow-100 text-yellow-800 border-[#F2C94C]";
    return "bg-red-100 text-red-800 border-[#EB5757]";
  };
  
  return (
    <Card key={product.id} className="overflow-hidden w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle 
            className="text-lg cursor-pointer hover:underline break-words"
            onClick={() => openProductCard(product.id, product.name)}
          >
            {product.name}
          </CardTitle>
          <Badge className={getCoverageColor(product.coverage)}>
            {Math.round(product.coverage)}%
          </Badge>
        </div>
        <CardDescription className="break-words">
          Cities Blocked: {product.blockedCount} / {product.totalCount} ({Math.round((product.blockedCount / product.totalCount) * 100)}%)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="font-medium">Recent Blockers</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 flex items-center" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show
              </>
            )}
          </Button>
        </div>
        
        {expanded && (
          <BlockersTable 
            blockers={product.blockers} 
            getMarketById={getMarketById} 
            viewEscalation={viewEscalation} 
          />
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
        Last updated: {formatRelativeTime(product.lastUpdated)}
      </CardFooter>
    </Card>
  );
}
