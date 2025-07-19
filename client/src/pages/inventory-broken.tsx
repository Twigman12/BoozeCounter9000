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
    <div className="notepad-page min-h-screen p-8">
      {/* L.O.G. Framework - Modular Header Component */}
      <InventoryHeader 
        isWeatherDataActive={true}
        isVisionApiActive={false}
        sessionCount={session?.id || 0}
      />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-xl p-3">
                <Package2 className="text-3xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold handwritten-text text-white">Booze Counter 9000</h1>
                <p className="text-blue-100 handwritten-text">AI-Powered Beverage Inventory Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <nav className="flex items-center space-x-2">
                <Link href="/roadmap">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 handwritten-text"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Project Roadmap
                  </Button>
                </Link>
              </nav>
              <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
                <BadgeCheck className="text-green-300" />
                <span className="text-sm handwritten-text">Live Weather Data</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[2000px] mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-4 2xl:gap-6 min-h-[calc(100vh-200px)]">
        
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Session Status */}
            <Card className="notepad-card h-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold handwritten-text text-blue-800">Live Session</h2>
                  <span className="text-sm handwritten-text text-gray-700 bg-yellow-200 px-2 py-1 rounded">
                    {sessionStats.startTime}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center mt-6">
                  <div className="bg-yellow-100 rounded-lg p-3 border-2 border-dashed border-blue-300">
                    <p className="text-3xl font-bold handwritten-text text-blue-700">{sessionStats.itemCount}</p>
                    <p className="text-xs handwritten-text text-gray-600">Items</p>
                  </div>
                  <div className="bg-yellow-100 rounded-lg p-3 border-2 border-dashed border-green-300">
                    <p className="text-3xl font-bold handwritten-text text-green-700">${sessionStats.totalValue}</p>
                    <p className="text-xs handwritten-text text-gray-600">Value</p>
                  </div>
                  <div className="bg-yellow-100 rounded-lg p-3 border-2 border-dashed border-orange-300">
                    <p className="text-3xl font-bold handwritten-text text-orange-700">{sessionStats.avgAccuracy}%</p>
                    <p className="text-xs handwritten-text text-gray-600">Accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Scanner & Voice Input */}
            <Card className="notepad-card h-auto flex-1">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold handwritten-text text-blue-800 mb-4 flex items-center">
                  <FileScan className="mr-3 text-blue-600" />
                  Product Scanner
                </h3>
                <ProductLookup onProductFound={handleProductFound} />
                
                {/* Google Cloud Vision API Test */}
                <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-400">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm handwritten-text text-blue-800 font-semibold">Vision API Status</span>
                    <Button
                      onClick={testGoogleCloudVision}
                      disabled={isTestingVision}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white handwritten-text"
                    >
                      {isTestingVision ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      Test Vision
                    </Button>
                  </div>
                  {visionTestResult && (
                    <div className="text-xs handwritten-text text-gray-700 bg-blue-50 p-2 rounded border">
                      {visionTestResult}
                    </div>
                  )}
                </div>
                
                {/* Quantity Input Section */}
                {selectedProduct && (
                  <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-400">
                    <h4 className="text-md font-bold handwritten-text text-blue-800 mb-4 flex items-center">
                      <Hash className="mr-3 text-green-600" />
                      Quantity Input
                    </h4>
                    <div className="flex space-x-3">
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={manualQuantity}
                        onChange={(e) => setManualQuantity(e.target.value)}
                        placeholder="Enter quantity (e.g., 12 or 5.5)..."
                        className="flex-1 handwritten-text bg-yellow-50 border-2 border-dashed border-gray-400 focus:border-blue-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleManualQuantitySubmit();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleManualQuantitySubmit}
                        disabled={!manualQuantity.trim() || isNaN(parseFloat(manualQuantity)) || parseFloat(manualQuantity) <= 0}
                        className="handwritten-text bg-green-200 border-2 border-dashed border-green-400 hover:bg-green-300 text-green-800"
                      >
                        Add Item
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Session Data */}
          <div className={`${selectedProduct ? 'xl:col-span-2 lg:col-span-1' : 'xl:col-span-2 lg:col-span-1 xl:col-start-2'} space-y-6`}>

            {/* Product Display - only show when product selected */}
            {selectedProduct && (
              <Card className="notepad-card h-auto">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-200 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🍷</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-md font-bold handwritten-text text-blue-800">{selectedProduct.name}</h3>
                      <p className="text-xs handwritten-text text-gray-700 mb-1">SKU: {selectedProduct.sku}</p>
                      <p className="text-md font-bold handwritten-text text-green-700">${selectedProduct.unitPrice}/unit</p>
                    </div>
                    <div className="text-xs handwritten-text text-gray-700">
                      <div>Last: {selectedProduct.lastCountQuantity} units</div>
                      <div>Par: {selectedProduct.parLevel} units</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inventory List */}
            <Card className="notepad-card h-auto flex-1 min-h-[400px]">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold handwritten-text text-blue-800 mb-4 flex items-center justify-between">
                  <span className="flex items-center">
                    <List className="mr-3 text-purple-600" />
                    Session Items
                  </span>
                  <span className="text-sm bg-purple-200 text-purple-800 px-2 py-1 rounded-full handwritten-text">{sessionItems.length} items</span>
                </h3>
                
                <div className="max-h-96 overflow-y-auto">
                  <InventorySession items={sessionItems} />
                </div>
              </CardContent>
            </Card>

            {/* Business Intelligence Dashboards */}
            <div className="space-y-6">
              <Tabs defaultValue="weather" className="w-full">
                <TabsList className="grid w-full grid-cols-2 handwritten-text bg-yellow-100 border-2 border-dashed border-gray-300">
                  <TabsTrigger value="weather" className="handwritten-text data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
                    🌤️ Weather Intelligence
                  </TabsTrigger>
                  <TabsTrigger value="cost" className="handwritten-text data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
                    💰 Cost Analysis
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="weather" className="space-y-6">
                  <WeatherDashboard />
                </TabsContent>
                <TabsContent value="cost" className="space-y-6">
                  <CostAnalysisDashboard />
                  
                  {/* QuickBooks Integration */}
                  <QuickBooksIntegration />
                  
                  {/* Supplier Analytics */}
                  <SupplierAnalytics />
                  
                  {/* Pricing Understanding Examples */}
                  <Card className="notepad-card">
                    <CardHeader>
                      <CardTitle className="handwritten-text text-purple-800">
                        📦 Understanding Case vs Unit Pricing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold handwritten-text text-blue-800 mb-3">Key Concepts:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="bg-white p-3 rounded border">
                            <span className="font-semibold text-green-700 handwritten-text">Case Pricing:</span>
                            <p className="text-gray-600 handwritten-text">24-pack Budweiser costs $32.50, sells for $45.99</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <span className="font-semibold text-blue-700 handwritten-text">Per Unit:</span>
                            <p className="text-gray-600 handwritten-text">Each can costs $1.35, sells for $1.92</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <span className="font-semibold text-purple-700 handwritten-text">Margin:</span>
                            <p className="text-gray-600 handwritten-text">29.3% profit on each case sold</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* MarginEdge Integration */}
            <Card className="notepad-card h-auto">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold handwritten-text text-blue-800 mb-4 flex items-center">
                  <FolderSync className="mr-3 text-green-600" />
                  MarginEdge Integration
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-yellow-100 border-2 border-dashed border-blue-400 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Info className="text-blue-600" />
                      <span className="text-sm font-bold handwritten-text text-blue-800">Ready to Sync</span>
                    </div>
                    <p className="text-sm handwritten-text text-blue-700 ml-8">
                      {sessionItems.length} items ready for transmission to MarginEdge platform
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    <Button 
                      variant="secondary"
                      className="text-sm font-medium py-3 handwritten-text bg-yellow-200 border-2 border-dashed border-gray-400 hover:bg-yellow-300"
                      disabled={isLoading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Session
                    </Button>
                    <Button 
                      className="text-sm font-medium py-3 handwritten-text bg-green-200 border-2 border-dashed border-green-400 hover:bg-green-300 text-green-800"
                      onClick={() => session && syncToMarginEdge(session.id)}
                      disabled={isLoading || sessionItems.length === 0 || !session}
                    >
                      <CloudUpload className="w-4 h-4 mr-2" />
                      {isLoading ? "Syncing..." : "Sync to MarginEdge"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </main>
    </div>
  );
}
