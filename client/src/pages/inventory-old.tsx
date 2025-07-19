import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { List, FolderSync, Info, CloudUpload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// L.O.G. Framework - Granular Components
import InventoryHeader from "@/components/inventory/InventoryHeader";
import ProductSelector from "@/components/inventory/ProductSelector";
import QuantityInput from "@/components/inventory/QuantityInput";

// Existing Components
import InventorySession from "@/components/InventorySession";
import WeatherDashboard from "@/components/WeatherDashboard";
import CostAnalysisDashboard from "@/components/CostAnalysisDashboard";
import QuickBooksIntegration from "@/components/QuickBooksIntegration";
import SupplierAnalytics from "@/components/SupplierAnalytics";

import { useInventorySession } from "@/hooks/useInventorySession";
import { useLogger } from "@/hooks/useLogger";
import { Product } from "@shared/schema";

export default function InventoryPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { 
    session, 
    sessionItems, 
    addItem, 
    syncToMarginEdge, 
    isLoading,
    sessionStats 
  } = useInventorySession();

  // L.O.G. Framework - Component Logging
  const { logUserAction, logError, trackOperation } = useLogger('InventoryPage');

  const handleProductSelected = (product: Product) => {
    const tracker = trackOperation('product_selection');
    try {
      setSelectedProduct(product);
      logUserAction('product_selected_main', { 
        productId: product.id, 
        sku: product.sku 
      });
      tracker.end({ success: true, productId: product.id });
    } catch (error: any) {
      logError(error, 'product_selection');
      tracker.end({ success: false, error: error.message });
    }
  };

  const handleProductCleared = () => {
    logUserAction('product_cleared_main', { 
      previousProduct: selectedProduct?.sku 
    });
    setSelectedProduct(null);
  };

  const handleQuantitySubmitted = (product: Product, quantity: number) => {
    const tracker = trackOperation('quantity_submission', { 
      productId: product.id, 
      quantity 
    });
    
    try {
      addItem(product, quantity, 100); // 100% confidence for manual entry
      
      logUserAction('inventory_item_added', {
        productId: product.id,
        productSku: product.sku,
        quantity,
        confidence: 100,
        method: 'manual'
      });

      // Clear selected product after successful addition
      setSelectedProduct(null);
      tracker.end({ success: true });
    } catch (error: any) {
      logError(error, 'quantity_submission', { 
        productId: product.id, 
        quantity 
      });
      tracker.end({ success: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen notebook-paper">
      {/* Notebook spiral binding */}
      <div className="spiral-binding" />
      
      {/* Three-hole punch marks */}
      <div className="hole-punch" />
      <div className="hole-punch" />
      <div className="hole-punch" />
      
      {/* Optional coffee stain for realism */}
      <div className="coffee-stain" style={{ top: '20%', right: '15%', opacity: 0.3 }} />
      
      {/* L.O.G. Framework - Modular Header Component */}
      <InventoryHeader 
        isWeatherDataActive={true}
        isVisionApiActive={false}
        sessionCount={session?.id || 0}
      />

      <main className="max-w-[2000px] mx-auto px-6 pb-8 pl-24">
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6 2xl:gap-8 min-h-[calc(100vh-200px)]">
        
          {/* Left Column - L.O.G. Framework Input Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Session Status */}
            <div className="future-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl marker-title">Live Session</h2>
                <span className="glass-panel px-4 py-1 rounded-full">
                  <span className="sketch-text">{sessionStats.startTime}</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="glass-panel p-4 rounded-lg transform hover:scale-105 transition-transform">
                  <p className="text-3xl font-bold marker-text highlight highlight-blue">{sessionStats.itemCount}</p>
                  <p className="text-sm sketch-text mt-1">Items</p>
                </div>
                <div className="glass-panel p-4 rounded-lg transform hover:scale-105 transition-transform">
                  <p className="text-3xl font-bold marker-text highlight highlight-yellow">${sessionStats.totalValue}</p>
                  <p className="text-sm sketch-text mt-1">Value</p>
                </div>
                <div className="glass-panel p-4 rounded-lg transform hover:scale-105 transition-transform">
                  <p className="text-3xl font-bold marker-text highlight highlight-pink">{sessionStats.avgAccuracy}%</p>
                  <p className="text-sm sketch-text mt-1">Accuracy</p>
                </div>
              </div>
            </div>

            {/* L.O.G. Framework - Product Selection Module */}
            <ProductSelector 
              selectedProduct={selectedProduct}
              onProductSelected={handleProductSelected}
              onProductCleared={handleProductCleared}
            />

            {/* L.O.G. Framework - Quantity Input Module */}
            <QuantityInput 
              selectedProduct={selectedProduct}
              onQuantitySubmitted={handleQuantitySubmitted}
              disabled={isLoading}
            />

            {/* Sync Controls */}
            <div className="future-card p-6">
              <div className="flex items-center mb-6">
                <div className="glass-panel p-3 rounded-full mr-3">
                  <CloudUpload className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-2xl marker-title">Sync to MarginEdge</h2>
              </div>
              <button 
                onClick={syncToMarginEdge}
                disabled={isLoading || sessionStats.itemCount === 0}
                className="w-full future-button py-4 text-lg disabled:opacity-50"
              >
                <FolderSync className="w-5 h-5 mr-2 inline" />
                Upload Session
              </button>
              <p className="text-center sketch-text mt-3">
                {sessionStats.itemCount} items ready for upload
              </p>
            </div>
          </div>

          {/* Middle Column - Current Session */}
          <div className="lg:col-span-1 space-y-6">
            <div className="future-card h-full p-6">
              <div className="flex items-center mb-6">
                <div className="glass-panel p-3 rounded-full mr-3">
                  <List className="w-6 h-6 text-orange-500" />
                </div>
                <h2 className="text-2xl marker-title">Current Session Items</h2>
              </div>
              <div className="h-[calc(100%-100px)] overflow-hidden">
                <InventorySession items={sessionItems} />
              </div>
            </div>
          </div>

          {/* Right Column - Analytics Tabs */}
          <div className="xl:col-span-1 lg:col-span-2 xl:col-start-3">
            <div className="future-card h-full p-6">
              <div className="flex items-center mb-6">
                <div className="glass-panel p-3 rounded-full mr-3">
                  <Info className="w-6 h-6 text-cyan-500" />
                </div>
                <h2 className="text-2xl marker-title">Business Intelligence</h2>
              </div>
              <div className="h-[calc(100%-100px)]">
                <Tabs defaultValue="weather" className="h-full">
                  <TabsList className="grid w-full grid-cols-5 glass-panel p-1 rounded-lg mb-4">
                    <TabsTrigger value="weather" className="marker-text data-[state=active]:bg-white/50">Weather</TabsTrigger>
                    <TabsTrigger value="cost" className="marker-text data-[state=active]:bg-white/50">Cost</TabsTrigger>
                    <TabsTrigger value="quickbooks" className="marker-text data-[state=active]:bg-white/50">QuickBooks</TabsTrigger>
                    <TabsTrigger value="supplier" className="marker-text data-[state=active]:bg-white/50">Suppliers</TabsTrigger>
                    <TabsTrigger value="pricing" className="marker-text data-[state=active]:bg-white/50">Pricing</TabsTrigger>
                  </TabsList>
                  
                  <div className="h-[calc(100%-60px)] overflow-y-auto">
                    <TabsContent value="weather" className="mt-0 h-full">
                      <WeatherDashboard />
                    </TabsContent>
                    
                    <TabsContent value="cost" className="mt-0 h-full">
                      <CostAnalysisDashboard />
                    </TabsContent>
                    
                    <TabsContent value="quickbooks" className="mt-0 h-full">
                      <QuickBooksIntegration />
                    </TabsContent>
                    
                    <TabsContent value="supplier" className="mt-0 h-full">
                      <SupplierAnalytics />
                    </TabsContent>
                    
                    <TabsContent value="pricing" className="mt-0 h-full">
                      <div className="text-center py-12">
                        <div className="glass-panel p-8 rounded-full mx-auto w-fit mb-4">
                          <Info className="w-16 h-16 text-gray-400" />
                        </div>
                        <p className="sketch-text text-lg">Pricing audit coming soon...</p>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}