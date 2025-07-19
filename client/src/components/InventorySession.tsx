import { Wine, Coffee, Beer } from "lucide-react";
import { InventoryItem, Product } from "@shared/schema";

interface InventorySessionItem extends InventoryItem {
  product?: Product;
}

interface InventorySessionProps {
  items: InventorySessionItem[];
}

export default function InventorySession({ items }: InventorySessionProps) {
  const getProductIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'wine':
        return <Wine className="w-4 h-4" />;
      case 'beer':
        return <Beer className="w-4 h-4" />;
      case 'spirits':
        return <Coffee className="w-4 h-4" />;
      default:
        return <Coffee className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Coffee className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No items counted yet</p>
        <p className="text-xs">Start by scanning a product barcode</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
              {getProductIcon(item.product?.brand || '')}
            </div>
            <div>
              <p className="font-patrick-hand text-lg font-medium text-gray-800 transform -rotate-1">
                {item.product?.brand || 'Unknown Brand'}
              </p>
              <p className="font-patrick-hand text-sm text-gray-600 transform rotate-0.5">
                {item.product?.name || `Product ${item.productId}`}
              </p>
              <p className="text-xs text-gray-500 font-mono">
                {item.product?.sku} • {item.product?.size} • {formatTime(item.recordedAt)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-patrick-hand text-2xl font-bold text-gray-800 transform rotate-1">
              {item.quantity}
            </p>
            <p className="text-xs text-gray-500">
              ${item.product?.unitPrice ? Number(item.product.unitPrice).toFixed(2) : '0.00'} each
            </p>
            <p className="text-xs text-green-600 font-medium">
              ${(Number(item.product?.unitPrice || 0) * Number(item.quantity)).toFixed(2)} total
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
