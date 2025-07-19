import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, X, Search, ScanLine } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";

interface ProductLookupProps {
  onProductFound: (product: Product) => void;
}

// Pure data-logic function: searches for product without side effects
const searchForProduct = async (query: string): Promise<Product | null> => {
  if (!query.trim()) {
    return null;
  }

  try {
    const response = await fetch(`/api/products/search/${encodeURIComponent(query)}`);
    if (response.ok) {
      const productData = await response.json();
      return productData.id ? productData : null;
    }
    return null;
  } catch (error) {
    console.error('Product search error:', error);
    return null;
  }
};

// Pure UI management function: updates interface based on product state
const updateProductUI = (
  product: Product | null, 
  toast: any, 
  onProductFound: (product: Product) => void,
  clearSearch: () => void
) => {
  if (product) {
    // Product found - update UI and notify parent
    onProductFound(product);
    clearSearch();
    toast({
      title: "Product Found",
      description: `${product.brand || 'Product'} ${product.name} loaded successfully`,
    });
  } else {
    // Product not found - show error message
    toast({
      title: "Product Not Found",
      description: "Try searching by brand name (e.g., 'Corona', 'Jack Daniels')",
      variant: "destructive",
    });
  }
};

export default function ProductLookup({ onProductFound }: ProductLookupProps) {
  const [productId, setProductId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanningStatus, setScanningStatus] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Controller function: orchestrates search and UI update
  const handleLookup = async () => {
    if (!productId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product name, brand, or SKU",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const foundProduct = await searchForProduct(productId);
      updateProductUI(
        foundProduct, 
        toast, 
        onProductFound, 
        () => setProductId("")
      );
    } catch (error) {
      console.error('Search error:', error);
      updateProductUI(null, toast, onProductFound, () => {});
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  const startCameraScanning = async () => {
    try {
      setScanningStatus("Starting camera...");
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera for barcode scanning
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanningStatus("Point camera at barcode...");
        
        // Auto-capture after 3 seconds for better scanning
        setTimeout(() => {
          if (isScanning) {
            captureAndScanBarcode();
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Access",
        description: "Please allow camera access for barcode scanning",
        variant: "destructive",
      });
      setIsScanning(false);
      setScanningStatus("");
    }
  };

  const captureAndScanBarcode = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    setScanningStatus("Scanning barcode...");

    // Capture current video frame
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    // Convert to base64 for API
    const imageData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    try {
      const response = await fetch('/api/scan-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.barcode) {
          setScanningStatus("Barcode detected! Searching...");
          setProductId(result.barcode);
          
          // Auto-search for the detected barcode
          setTimeout(() => {
            handleLookup();
            stopCameraScanning();
          }, 500);
          
          toast({
            title: "Barcode Detected",
            description: `Found: ${result.barcode}`,
          });
        } else {
          setScanningStatus("No barcode detected. Try again...");
          setTimeout(() => {
            if (isScanning) {
              captureAndScanBarcode();
            }
          }, 2000);
        }
      } else {
        throw new Error('Scanning failed');
      }
    } catch (error) {
      console.error('Barcode scanning error:', error);
      setScanningStatus("Scanning failed. Try manual search...");
      setTimeout(() => {
        stopCameraScanning();
      }, 2000);
    }
  };

  const stopCameraScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setScanningStatus("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search by brand, name, or SKU (e.g., 'Corona', 'Jack Daniels')"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 font-patrick-hand text-lg border-2 border-yellow-300 bg-yellow-50 placeholder:text-gray-500"
          disabled={isSearching}
        />
        <Button 
          onClick={handleLookup}
          disabled={isSearching || !productId.trim()}
          className="bg-yellow-200 border-2 border-yellow-400 hover:bg-yellow-300 text-gray-800"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={isScanning ? stopCameraScanning : startCameraScanning}
          className={`flex-1 font-patrick-hand text-lg py-6 border-2 border-dashed transform -rotate-1 ${
            isScanning 
              ? 'bg-red-200 border-red-400 hover:bg-red-300 text-red-800' 
              : 'bg-blue-200 border-blue-400 hover:bg-blue-300 text-blue-800'
          }`}
        >
          {isScanning ? (
            <>
              <X className="w-5 h-5 mr-2" />
              Stop Scanning
            </>
          ) : (
            <>
              <Camera className="w-5 h-5 mr-2" />
              Scan Barcode
            </>
          )}
        </Button>
      </div>

      {scanningStatus && (
        <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <ScanLine className="w-6 h-6 mx-auto mb-2 text-blue-600 animate-pulse" />
          <p className="font-patrick-hand text-lg text-blue-800 transform rotate-0.5">
            {scanningStatus}
          </p>
        </div>
      )}

      {isScanning && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          <div className="absolute inset-0 border-4 border-yellow-400 border-dashed pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-48 h-24 border-2 border-yellow-400 bg-yellow-400 bg-opacity-20 rounded-lg"></div>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}