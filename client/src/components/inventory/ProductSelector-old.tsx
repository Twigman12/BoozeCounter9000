/**
 * L.O.G. Framework - Granular Component: Product Selection
 * Single Responsibility: Handle product lookup and selection
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileScan, Eye, Loader2 } from "lucide-react";
import ProductLookup from "@/components/ProductLookup";
import ProductPricingCard from "@/components/ProductPricingCard";
import { Product } from "@shared/schema";
import { useLogger, useAPILogger } from "@/hooks/useLogger";

interface ProductSelectorProps {
  selectedProduct: Product | null;
  onProductSelected: (product: Product) => void;
  onProductCleared: () => void;
}

export default function ProductSelector({ 
  selectedProduct, 
  onProductSelected, 
  onProductCleared 
}: ProductSelectorProps) {
  const [visionTestResult, setVisionTestResult] = useState<string>("");
  const [isTestingVision, setIsTestingVision] = useState(false);
  const { logUserAction, logError, trackOperation } = useLogger('ProductSelector');
  const { logAPICall } = useAPILogger();

  const handleProductFound = (product: Product) => {
    logUserAction('product_selected', { 
      productId: product.id, 
      sku: product.sku, 
      name: product.name 
    });
    onProductSelected(product);
  };

  const handleClearProduct = () => {
    logUserAction('product_cleared', { 
      previousProduct: selectedProduct?.sku 
    });
    onProductCleared();
  };

  const testGoogleCloudVision = async () => {
    const tracker = trackOperation('vision_api_test');
    setIsTestingVision(true);
    
    try {
      const testImageData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
      
      const result = await logAPICall('/api/scan-barcode', 'POST', async () => {
        const response = await fetch('/api/scan-barcode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData: testImageData })
        });
        return response.json();
      }, { testMode: true });

      const statusMessage = `Vision API Status: ${result.success ? 'ACTIVE' : 'Demo Mode'} - ${result.message}`;
      setVisionTestResult(statusMessage);
      
      logUserAction('vision_api_tested', { 
        success: result.success, 
        message: result.message 
      });
      
      tracker.end({ success: result.success, apiStatus: result.success ? 'active' : 'demo' });
    } catch (error: any) {
      const errorMessage = 'Vision API Test Failed';
      setVisionTestResult(errorMessage);
      logError(error, 'vision_api_test', { testImageProvided: true });
      tracker.end({ success: false, error: error.message });
    } finally {
      setIsTestingVision(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Lookup */}
      <Card className="notepad-card">
        <CardHeader className="notepad-card-header">
          <CardTitle className="handwritten-title flex items-center">
            <FileScan className="mr-2" />
            Find Product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProductLookup onProductFound={handleProductFound} />
          
          {/* Vision API Test */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={testGoogleCloudVision}
              disabled={isTestingVision}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              {isTestingVision ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>Test Vision API</span>
            </Button>
            
            {visionTestResult && (
              <span className="text-sm text-muted-foreground">
                {visionTestResult}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Product Display */}
      {selectedProduct && (
        <Card className="notepad-card">
          <CardHeader className="notepad-card-header">
            <CardTitle className="handwritten-title flex items-center justify-between">
              <span>Selected Product</span>
              <Button 
                onClick={handleClearProduct}
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductPricingCard product={selectedProduct} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}