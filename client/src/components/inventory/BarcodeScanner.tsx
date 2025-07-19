/**
 * Real-time Barcode Scanner with Google Cloud Vision API
 * Captures camera feed and detects UPC/EAN barcodes
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface BarcodeScannerProps {
  onProductScanned?: (product: Product) => void;
  onBarcodeDetected?: (barcode: string) => void;
}

export default function BarcodeScanner({ onProductScanned, onBarcodeDetected }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    barcode?: string;
    productName?: string;
    product?: Product;
    error?: string;
  } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Start camera stream
  const startScanning = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: window.innerWidth < 768 ? 640 : 1280 },
          height: { ideal: window.innerWidth < 768 ? 480 : 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setScanResult(null);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
      console.error('Camera error:', error);
    }
  }, [toast]);

  // Stop camera stream
  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Capture and process image
  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    setIsProcessing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0);
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    try {
      // Send to backend for processing
      const response = await fetch('/api/scan-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData })
      });
      
      const result = await response.json();
      
      if (result.success && result.barcode) {
        setScanResult(result);
        
        // Notify parent components
        if (result.product && onProductScanned) {
          onProductScanned(result.product);
        }
        if (onBarcodeDetected) {
          onBarcodeDetected(result.barcode);
        }
        
        toast({
          title: "Barcode Detected!",
          description: `Found: ${result.productName || result.barcode}`,
        });
        
        // Stop scanning after successful detection
        stopScanning();
      } else {
        // Continue scanning if no barcode detected
        setTimeout(() => {
          if (isScanning) {
            captureAndScan();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isScanning, onProductScanned, onBarcodeDetected, stopScanning, toast]);

  // Start continuous scanning when camera is ready
  useEffect(() => {
    if (isScanning && videoRef.current) {
      const video = videoRef.current;
      
      const handleVideoReady = () => {
        // Start scanning after a short delay
        setTimeout(captureAndScan, 500);
      };
      
      video.addEventListener('loadedmetadata', handleVideoReady);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleVideoReady);
      };
    }
  }, [isScanning, captureAndScan]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <Button
          onClick={startScanning}
          className="w-full"
          size="lg"
        >
          <Camera className="w-5 h-5 mr-2" />
          Start Barcode Scanner
        </Button>
      ) : (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className={`${window.innerWidth < 768 ? 'w-48 h-36' : 'w-64 h-48'} border-2 border-white/50 rounded-lg`}>
                  {/* Corner markers */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />
                </div>
                
                {/* Scanning line animation */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-scan" />
              </div>
            </div>
            
            {/* Processing indicator */}
            {isProcessing && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing image...
              </div>
            )}
          </div>
          
          <Button
            onClick={stopScanning}
            variant="destructive"
            className="absolute top-4 right-4"
            size="icon"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Scan results */}
      {scanResult && (
        <Alert className={scanResult.error ? "border-red-500" : "border-green-500"}>
          {scanResult.error ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {scanResult.error ? (
              scanResult.error
            ) : (
              <div className="space-y-1">
                <p className="font-semibold">Barcode: {scanResult.barcode}</p>
                {scanResult.productName && (
                  <p>Product: {scanResult.productName}</p>
                )}
                {scanResult.product && (
                  <p className="text-sm text-muted-foreground">
                    SKU: {scanResult.product.sku}
                  </p>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}