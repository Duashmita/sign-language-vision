import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PredictionResult {
  letter: string;
  confidence: number;
}

export interface UseAIRecognitionReturn {
  isLoading: boolean;
  isRunning: boolean;
  prediction: PredictionResult | null;
  startRecognition: (videoElement: HTMLVideoElement) => void;
  stopRecognition: () => void;
  error: string | null;
}

export function useAIRecognition(): UseAIRecognitionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  const captureAndPredict = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    canvas.width = 224;
    canvas.height = 224;
    ctx.drawImage(video, 0, 0, 224, 224);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('predict-asl', {
        body: { image: imageData }
      });

      if (fnError) {
        console.error('Prediction error:', fnError);
        return;
      }

      if (data?.letter) {
        setPrediction({
          letter: data.letter,
          confidence: data.confidence ?? 0.9
        });
      }
    } catch (err) {
      console.error('Failed to get prediction:', err);
    }
  }, []);

  const startRecognition = useCallback((videoElement: HTMLVideoElement) => {
    setIsLoading(true);
    setError(null);
    videoRef.current = videoElement;

    // Create offscreen canvas for capturing frames
    canvasRef.current = document.createElement('canvas');

    // Wait for video to be ready
    const checkReady = () => {
      if (videoElement.readyState >= 2) {
        setIsLoading(false);
        setIsRunning(true);
        // Start prediction loop (every 1 second to avoid rate limiting)
        intervalRef.current = window.setInterval(captureAndPredict, 1000);
      } else {
        requestAnimationFrame(checkReady);
      }
    };

    checkReady();
  }, [captureAndPredict]);

  const stopRecognition = useCallback(() => {
    setIsRunning(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setPrediction(null);
  }, []);

  return {
    isLoading,
    isRunning,
    prediction,
    startRecognition,
    stopRecognition,
    error,
  };
}
