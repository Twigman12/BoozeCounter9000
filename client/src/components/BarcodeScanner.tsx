import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface BarcodeScanResult {
  barcode: string;
  productName?: string;
  brand?: string;
  confidence: number;
  success: boolean;
  message: string;
  source?: string;
}

interface BarcodeScannerProps {
  onBarcodeDetected: (result: BarcodeScanResult) => void;
}

export default function BarcodeScanner({ onBarcodeDetected }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<BarcodeScanResult | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera for barcode scanning
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      // Fallback to file upload if camera access fails
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Send to Vision API
      const response = await fetch('/api/scan-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData })
      });
      
      const result = await response.json() as BarcodeScanResult;
      setLastResult(result);
      onBarcodeDetected(result);
    } catch (error) {
      console.error('Barcode scanning failed:', error);
      setLastResult({
        barcode: '',
        confidence: 0,
        success: false,
        message: 'Scanning failed'
      });
    } finally {
      setIsScanning(false);
    }
  }, [onBarcodeDetected]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        const response = await fetch('/api/scan-barcode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData })
        });
        
        const result = await response.json() as BarcodeScanResult;
        setLastResult(result);
        onBarcodeDetected(result);
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload scanning failed:', error);
      setIsScanning(false);
    }
  }, [onBarcodeDetected]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-yellow-50 border-yellow-200">
      <CardHeader className="text-center">
        <CardTitle className="font-kalam text-2xl text-yellow-900 transform -rotate-1">
          📷 AI Barcode Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera View */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
            style={{ display: cameraStream ? 'block' : 'none' }}
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          {!cameraStream && (
            <div className="w-full h-64 flex items-center justify-center text-white bg-gray-800">
              <div className="text-center">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-75">Camera not active</p>
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center">
          {!cameraStream ? (
            <Button 
              onClick={startCamera}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-patrick-hand text-lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button
                onClick={captureAndScan}
                disabled={isScanning}
                className="bg-green-600 hover:bg-green-700 text-white font-patrick-hand text-lg"
              >
                {isScanning ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 mr-2" />
                )}
                {isScanning ? 'Scanning...' : 'Scan Barcode'}
              </Button>
              <Button
                onClick={stopCamera}
                variant="outline"
                className="font-patrick-hand text-lg"
              >
                Stop Camera
              </Button>
            </>
          )}
        </div>

        {/* File Upload Alternative */}
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isScanning}
            className="font-patrick-hand text-lg"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Image
          </Button>
        </div>

        {/* Scan Results */}
        {lastResult && (
          <Card className="bg-white border-2 border-yellow-300">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-caveat text-xl font-semibold text-yellow-900">
                  Scan Result
                </h3>
                {lastResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              
              {lastResult.success && lastResult.barcode && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Barcode:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {lastResult.barcode}
                    </code>
                  </div>
                  
                  {lastResult.productName && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Product:</span>
                      <span>{lastResult.productName}</span>
                      {lastResult.brand && (
                        <Badge variant="secondary">{lastResult.brand}</Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Confidence:</span>
                    <Badge className={getConfidenceColor(lastResult.confidence)}>
                      {lastResult.confidence}%
                    </Badge>
                  </div>
                  
                  {lastResult.source && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Source:</span>
                      <Badge variant="outline">{lastResult.source}</Badge>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-gray-600 mt-3 font-style: italic">
                {lastResult.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-yellow-700 bg-yellow-100 p-3 rounded-lg">
          <p className="font-caveat text-base">
            💡 Point camera at barcode or upload image for instant product recognition
          </p>
        </div>
      </CardContent>
    </Card>
  );
}