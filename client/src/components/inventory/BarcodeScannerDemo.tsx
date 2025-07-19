/**
 * Demo Barcode Scanner - Shows functionality with real product barcodes
 */

import React, { useState } from 'react';
import { Scan, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const DEMO_BARCODES = [
  { barcode: "008807000013", name: "Heineken 24-Pack" },
  { barcode: "034100000017", name: "Budweiser 24-Pack" },
  { barcode: "0056000000019", name: "Corona Extra 24-Pack" },
  { barcode: "087116008502", name: "Grey Goose Vodka" },
  { barcode: "083085200012", name: "Jack Daniel's Whiskey" }
];

interface BarcodeScannerDemoProps {
  onProductScanned?: (product: any) => void;
}

export default function BarcodeScannerDemo({ onProductScanned }: BarcodeScannerDemoProps) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const { toast } = useToast();

  const simulateScan = async (barcode: string) => {
    setScanning(true);
    setResult(null);
    setShowCamera(true);
    setScanningProgress(0);

    // Simulate camera scanning with progress
    const progressInterval = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Wait for scanning animation to complete
      await new Promise(resolve => setTimeout(resolve, 2200));
      
      // Use the test-barcode endpoint directly with the barcode
      const response = await fetch(`/api/test-barcode/${barcode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        toast({
          title: "Product Found!",
          description: `${data.productName} - ${data.barcode}`,
        });
        
        // Call the callback if provided
        if (onProductScanned) {
          onProductScanned({
            name: data.productName,
            barcode: data.barcode,
            brand: data.brand,
            sku: data.sku,
            unitPrice: data.unitPrice
          });
        }
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Error",
        description: "Failed to scan barcode",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
      setShowCamera(false);
      setScanningProgress(0);
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Scan className="w-5 h-5" />
          Demo Barcode Scanner
        </h4>
        
        <p className="text-sm text-muted-foreground mb-4">
          Click a product to simulate scanning its barcode
        </p>

        <div className="space-y-2">
          {DEMO_BARCODES.map((item) => (
            <Button
              key={item.barcode}
              onClick={() => simulateScan(item.barcode)}
              variant="outline"
              className="w-full justify-start gap-2"
              disabled={scanning}
            >
              <Package className="w-4 h-4" />
              <span className="flex-1 text-left">{item.name}</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {item.barcode}
              </Badge>
            </Button>
          ))}
        </div>
      </Card>

      {result && (
        <Card className={`p-4 ${result.success ? 'border-green-500' : 'border-red-500'}`}>
          <h5 className="font-semibold mb-2">Scan Result</h5>
          {result.success ? (
            <div className="space-y-1 text-sm">
              <p><strong>Barcode:</strong> {result.barcode}</p>
              <p><strong>Product:</strong> {result.productName}</p>
              {result.brand && <p><strong>Brand:</strong> {result.brand}</p>}
              <p><strong>Source:</strong> {result.message || result.source}</p>
              <Badge className="mt-2">{result.confidence}% Confidence</Badge>
            </div>
          ) : (
            <p className="text-sm text-red-600">{result.message || "No product found"}</p>
          )}
        </Card>
      )}

      {/* Camera Simulation Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/80 text-white">
            <h3 className="text-lg font-semibold">Scanning Barcode...</h3>
            <button
              onClick={() => {
                setShowCamera(false);
                setScanning(false);
                setScanningProgress(0);
              }}
              className="p-2 rounded-full bg-red-600 hover:bg-red-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Camera View Simulation */}
          <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
            {/* Simulated camera feed background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-80"></div>
            
            {/* Scanning overlay */}
            <div className="relative z-10">
              <div className="w-64 h-48 border-2 border-white/50 rounded-lg relative">
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />
                
                {/* Scanning line animation */}
                <div className={`absolute left-0 right-0 h-1 bg-yellow-400 shadow-lg transition-all duration-300 ${
                  scanningProgress < 100 ? 'animate-pulse' : ''
                }`} 
                style={{ top: `${scanningProgress}%` }}></div>
                
                {/* Progress indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold mb-2">{scanningProgress}%</div>
                    <div className="text-sm opacity-75">
                      {scanningProgress < 50 ? 'Locating barcode...' : 
                       scanningProgress < 80 ? 'Reading code...' : 
                       scanningProgress < 100 ? 'Processing...' : 'Complete!'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-white">
              <p className="text-lg font-semibold mb-2">Point camera at barcode</p>
              <p className="text-sm opacity-75">Hold steady for best results</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}