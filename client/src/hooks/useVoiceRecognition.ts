import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  quantity: number;
}

export function useVoiceRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setIsRecording(true);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          await processAudio(audioBlob);
        } catch (error) {
          setError("Failed to process audio recording");
          console.error('Audio processing error:', error);
        } finally {
          setIsProcessing(false);
        }
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
    } catch (error) {
      setIsRecording(false);
      setError("Failed to access microphone. Please check permissions.");
      console.error('Microphone access error:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setTranscript(result.transcript);
        setConfidence(result.confidence);
        setQuantity(result.quantity);
        
        if (result.quantity === 0) {
          toast({
            title: "No quantity detected",
            description: "Please try again with a clearer number",
            variant: "destructive"
          });
        }
      } else {
        setError(result.message || "Speech recognition failed");
      }
    } catch (error) {
      setError("Failed to process speech. Please try again.");
      console.error('Speech processing error:', error);
    }
  };

  const resetRecognition = useCallback(() => {
    setTranscript("");
    setConfidence(0);
    setQuantity(0);
    setError(null);
    setIsProcessing(false);
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    isProcessing,
    transcript,
    confidence,
    quantity,
    error,
    startRecording,
    stopRecording,
    resetRecognition
  };
}
