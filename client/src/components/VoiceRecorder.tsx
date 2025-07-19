import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Check, RotateCcw } from "lucide-react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

interface VoiceRecorderProps {
  onQuantityConfirmed: (quantity: number, confidence: number) => void;
}

export default function VoiceRecorder({ onQuantityConfirmed }: VoiceRecorderProps) {
  const [editableQuantity, setEditableQuantity] = useState<string>("");
  
  const {
    isRecording,
    isProcessing,
    transcript,
    confidence,
    quantity,
    error,
    startRecording,
    stopRecording,
    resetRecognition
  } = useVoiceRecognition();

  const handleStartRecording = () => {
    resetRecognition();
    startRecording();
  };

  const handleConfirm = () => {
    const finalQuantity = editableQuantity ? parseInt(editableQuantity) : quantity;
    if (finalQuantity > 0) {
      onQuantityConfirmed(finalQuantity, confidence);
      resetRecognition();
      setEditableQuantity("");
    }
  };

  const handleRetry = () => {
    resetRecognition();
    setEditableQuantity("");
  };

  // Update editable quantity when voice recognition provides a result
  useState(() => {
    if (quantity > 0 && !editableQuantity) {
      setEditableQuantity(quantity.toString());
    }
  }, [quantity]);

  return (
    <div className="space-y-6">
      {/* Voice Recording Button */}
      <div className="text-center">
        <Button
          onClick={isRecording ? stopRecording : handleStartRecording}
          disabled={isProcessing}
          className={`w-20 h-20 rounded-full shadow-lg transition-all duration-200 mx-auto ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 voice-recording' 
              : 'bg-accent hover:bg-orange-600'
          }`}
        >
          {isRecording ? (
            <Square className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
        <p className="text-sm text-gray-600 mt-2">
          {isRecording 
            ? "Recording... Speak your quantity" 
            : isProcessing 
            ? "Processing..." 
            : "Tap to start recording"
          }
        </p>
      </div>

      {/* Audio Visualization */}
      {isRecording && (
        <div className="flex items-end justify-center space-x-1 h-12">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="amplitude-bar w-2 bg-accent rounded-full animate-pulse"
              style={{
                height: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Recognition Results */}
      {transcript && (
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Detected Speech:</span>
              <Badge variant="secondary">{confidence}% confidence</Badge>
            </div>
            <p className="text-lg font-medium">"{transcript}"</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Interpreted Quantity:</span>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={editableQuantity}
                  onChange={(e) => setEditableQuantity(e.target.value)}
                  className="w-16 px-2 py-1 text-center"
                  min="0"
                />
                <span className="text-sm text-gray-600">units</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleConfirm}
              disabled={!editableQuantity || parseInt(editableQuantity) <= 0}
              className="flex-1 bg-secondary hover:bg-green-600 ripple"
            >
              <Check className="w-4 h-4 mr-1" />
              Confirm
            </Button>
            <Button 
              variant="secondary"
              onClick={handleRetry}
              className="flex-1 ripple"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
