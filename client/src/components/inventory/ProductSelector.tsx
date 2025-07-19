/**
 * L.O.G. Framework - Granular Component: Product Selector
 * Single Responsibility: Handle product selection and barcode scanning
 */

import React, { useState } from "react";
import { Package, Scan, X } from "lucide-react";
import { Product } from "@shared/schema";
import { useLogger } from "@/hooks/useLogger";
import ProductLookup from "@/components/ProductLookup";

interface ProductSelectorProps {
  selectedProduct: Product | null;
  onProductSelected: (product: Product) => void;
  onProductCleared: () => void;
}

function ProductSelector({ 
  selectedProduct, 
  onProductSelected, 
  onProductCleared 
}: ProductSelectorProps) {
  const [isScanning, setIsScanning] = useState(false);
  const { logUserAction, logError, trackOperation } = useLogger('ProductSelector');

  const handleProductFound = (product: Product) => {
    logUserAction('product_selected', { productId: product.id, sku: product.sku });
    onProductSelected(product);
  };

  // Barcode scan simulation will be handled by ProductLookup component

  return (
    <div className="book-card">
      <div className="flex items-center mb-6">
        <div className="glass-panel p-3 rounded-full mr-3">
          <Package className="w-6 h-6 text-purple-500" />
        </div>
        <h2 className="text-2xl marker-title">Product Lookup</h2>
      </div>
      
      {selectedProduct ? (
        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl marker-text font-bold highlight highlight-blue">
                  {selectedProduct.name}
                </h3>
                <p className="sketch-text mt-1">
                  SKU: {selectedProduct.sku}
                </p>
              </div>
              <div className="future-card px-3 py-1 neon-glow">
                <span className="marker-text text-sm">{selectedProduct.category}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="marker-text">
                <span className="sketch-text">Supplier:</span>
                <span className="ml-2 font-bold">{selectedProduct.supplier}</span>
              </div>
              <div className="marker-text">
                <span className="sketch-text">Price:</span>
                <span className="ml-2 font-bold highlight highlight-yellow">${selectedProduct.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onProductCleared}
            className="w-full glass-panel py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5 mr-2" />
            <span className="marker-text">Clear Selection</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <ProductLookup onProductFound={handleProductFound} />
        </div>
      )}
    </div>
  );
}

export default React.memo(ProductSelector);