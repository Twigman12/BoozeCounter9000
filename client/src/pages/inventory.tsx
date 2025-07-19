/**
 * L.O.G. Framework - Core Module: Inventory Page (Performance Optimized)
 * Lazy loading and code splitting for dashboard components
 */

import { lazy, Suspense } from "react";
import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { FolderSync, List, Package2, CloudUpload, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product, InventoryItem } from "@shared/schema";
import { useLogger } from "@/hooks/useLogger";
import { performanceMonitor } from "@shared/performance";

// Performance-optimized component imports
import InventoryHeader from "@/components/inventory/InventoryHeader";
import ProductSelector from "@/components/inventory/ProductSelector";
import QuantityInput from "@/components/inventory/QuantityInput";
import InventorySession from "@/components/InventorySession";

// Lazy load heavy dashboard components
const WeatherDashboard = lazy(() => import("@/components/WeatherDashboard"));
const CostAnalysisDashboard = lazy(() => import("@/components/CostAnalysisDashboard"));
const QuickBooksIntegration = lazy(() => import("@/components/QuickBooksIntegration"));
const SupplierAnalytics = lazy(() => import("@/components/SupplierAnalytics"));

// Loading fallback component
const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="glass-panel h-32 rounded-lg" />
    <div className="glass-panel h-48 rounded-lg" />
    <div className="glass-panel h-24 rounded-lg" />
  </div>
);

export default function InventoryPage() {
  const { logUserAction, logApiRequest, logInventoryAction, trackPerformance } = useLogger('InventoryPage');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState("weather");

  // Track page mount
  useEffect(() => {
    performanceMonitor.recordComponentRender('InventoryPage', Date.now());
    return () => {
      performanceMonitor.recordComponentRender('InventoryPage', Date.now());
    };
  }, []);

  // Fetch current session with performance tracking
  const { data: session } = useQuery({
    queryKey: ['/api/inventory-sessions/current'],
    queryFn: async () => {
      const tracker = trackPerformance('fetch_current_session');
      try {
        const response = await fetch('/api/inventory-sessions/1');
        if (!response.ok) throw new Error('Failed to fetch session');
        const data = await response.json();
        tracker.end({ itemCount: data.itemCount });
        return data;
      } catch (error) {
        tracker.end({ error: true });
        throw error;
      }
    },
  });

  // Optimized mutation for adding inventory items
  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const tracker = trackPerformance('add_inventory_item');
      const response = await fetch(`/api/inventory-sessions/${session?.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      
      if (!response.ok) throw new Error('Failed to add item');
      const result = await response.json();
      tracker.end({ success: true });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-sessions'] });
      toast({
        title: "Item Added",
        description: "Inventory item recorded successfully",
        className: "glass-panel",
      });
    },
    onError: (error) => {
      performanceMonitor.recordComponentError('InventoryPage', error.message);
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
    },
  });

  // Memoized callbacks
  const handleProductSelected = useCallback((product: Product) => {
    setSelectedProduct(product);
    logUserAction('product_selected', 'ProductSelector', { 
      productId: product.id,
      productSku: product.sku 
    });
  }, [logUserAction]);

  const handleQuantitySubmitted = useCallback((product: Product, quantity: number) => {
    if (!session?.id) return;
    
    addItemMutation.mutate({ 
      productId: product.id, 
      quantity 
    });
    
    logInventoryAction('item_added', product.id, quantity, {
      sessionId: session.id,
      productSku: product.sku
    });
  }, [session?.id, addItemMutation, logInventoryAction]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    logUserAction('tab_changed', 'AnalyticsTabs', { tab: value });
  }, [logUserAction]);

  return (
    <div className="min-h-screen notebook-paper">
      {/* Notebook visual elements */}
      <div className="spiral-binding" />
      <div className="hole-punch" />
      <div className="hole-punch" />
      <div className="hole-punch" />
      <div className="coffee-stain" style={{ top: '20%', right: '15%', opacity: 0.3 }} />
      
      <InventoryHeader 
        isWeatherDataActive={true}
        isVisionApiActive={false}
        sessionCount={session?.id || 0}
      />

      <main className="max-w-[2000px] mx-auto px-6 pb-8 pl-24">
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6 2xl:gap-8 min-h-[calc(100vh-200px)]">
        
          {/* Left Column - Input Controls */}
          <div className="lg:col-span-1 space-y-6">
            <ProductSelector 
              selectedProduct={selectedProduct}
              onProductSelected={handleProductSelected}
              onProductCleared={() => setSelectedProduct(null)}
            />
            
            <QuantityInput 
              selectedProduct={selectedProduct}
              onQuantitySubmitted={handleQuantitySubmitted}
              disabled={addItemMutation.isPending}
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
                className="w-full future-button py-4 text-lg disabled:opacity-50"
                disabled
              >
                <FolderSync className="w-5 h-5 mr-2 inline" />
                Upload Session
              </button>
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
                <InventorySession items={[]} />
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
                <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
                  <TabsList className="grid w-full grid-cols-5 glass-panel p-1 rounded-lg mb-4">
                    <TabsTrigger value="weather" className="marker-text data-[state=active]:bg-white/50">Weather</TabsTrigger>
                    <TabsTrigger value="cost" className="marker-text data-[state=active]:bg-white/50">Cost</TabsTrigger>
                    <TabsTrigger value="quickbooks" className="marker-text data-[state=active]:bg-white/50">QuickBooks</TabsTrigger>
                    <TabsTrigger value="supplier" className="marker-text data-[state=active]:bg-white/50">Suppliers</TabsTrigger>
                    <TabsTrigger value="pricing" className="marker-text data-[state=active]:bg-white/50">Pricing</TabsTrigger>
                  </TabsList>
                  
                  <div className="h-[calc(100%-60px)] overflow-y-auto">
                    <Suspense fallback={<DashboardSkeleton />}>
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
                    </Suspense>
                    
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

import { useEffect } from 'react';