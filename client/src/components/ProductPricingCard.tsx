import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, DollarSign, TrendingUp } from "lucide-react";

interface Product {
  id: number;
  sku: string;
  name: string;
  brand?: string;
  unitPrice: string;
  costPrice?: string;
  size?: string;
  unitsPerCase?: number;
  unitOfMeasure?: string;
}

interface ProductPricingCardProps {
  product: Product;
}

export default function ProductPricingCard({ product }: ProductPricingCardProps) {
  const unitPrice = parseFloat(product.unitPrice);
  const costPrice = product.costPrice ? parseFloat(product.costPrice) : 0;
  const unitsPerCase = product.unitsPerCase || 1;
  
  // Calculate per-unit pricing
  const pricePerUnit = unitPrice / unitsPerCase;
  const costPerUnit = costPrice / unitsPerCase;
  const marginPercent = unitPrice > 0 ? ((unitPrice - costPrice) / unitPrice) * 100 : 0;
  
  const getMarginColor = (margin: number) => {
    if (margin >= 25) return "bg-green-100 text-green-800";
    if (margin >= 15) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPackageType = (size?: string, unitsPerCase?: number) => {
    if (unitsPerCase === 24) return "24-Pack Case";
    if (unitsPerCase === 12) return "12-Pack Case";
    if (unitsPerCase === 6) return "6-Pack";
    return size || "Individual";
  };

  return (
    <Card className="notepad-card">
      <CardHeader className="pb-3">
        <CardTitle className="handwritten-text text-blue-800 flex items-center justify-between">
          <div className="flex items-center">
            <Package className="w-4 h-4 mr-2" />
            <span className="text-sm">{product.name}</span>
          </div>
          <Badge className={getMarginColor(marginPercent)}>
            {marginPercent.toFixed(1)}% margin
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Package Information */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-700 handwritten-text font-bold">Package Type</p>
          <p className="text-sm text-blue-800 handwritten-text">{getPackageType(product.size, unitsPerCase)}</p>
          <p className="text-xs text-gray-600 handwritten-text">SKU: {product.sku}</p>
        </div>

        {/* Case-Level Pricing */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-700 handwritten-text font-bold">Case Cost</p>
            <p className="text-lg text-green-800 handwritten-text font-bold">${costPrice.toFixed(2)}</p>
            <p className="text-xs text-gray-600 handwritten-text">What you pay</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700 handwritten-text font-bold">Case Price</p>
            <p className="text-lg text-blue-800 handwritten-text font-bold">${unitPrice.toFixed(2)}</p>
            <p className="text-xs text-gray-600 handwritten-text">What you sell</p>
          </div>
        </div>

        {/* Per-Unit Breakdown */}
        {unitsPerCase > 1 && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700 handwritten-text font-bold mb-2">Per-Unit Breakdown ({unitsPerCase} units)</p>
            <div className="grid grid-cols-2 gap-2 text-sm handwritten-text">
              <div>
                <span className="text-gray-600">Cost per unit:</span>
                <span className="ml-2 font-bold text-green-700">${costPerUnit.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Price per unit:</span>
                <span className="ml-2 font-bold text-blue-700">${pricePerUnit.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Profit Information */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm handwritten-text text-gray-700">Profit per case:</span>
          </div>
          <span className="text-sm handwritten-text font-bold text-green-700">
            ${(unitPrice - costPrice).toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}