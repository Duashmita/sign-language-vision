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

  // Prevent overlapping calls (important when the backend retries/waits on cold starts)
  const inFlightRef = useRef(false);
  const cooldownUntilRef = useRef<number>(0);

  const captureAndPredict = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Avoid piling up requests (which can overload the endpoint and cause 503s)
    if (inFlightRef.current) return;
    if (Date.now() < cooldownUntilRef.current) return;

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

    inFlightRef.current = true;
    try {
      const { data, error: fnError } = await supabase.functions.invoke('predict-asl', {
        body: { imageData },
      });

      if (fnError) {
        const status = (fnError as any)?.context?.status as number | undefined;

        if (status === 503) {
          // Endpoint is waking up / temporarily unavailable; back off a bit.
          cooldownUntilRef.current = Date.now() + 15_000;
          setError('Model is waking up. Retrying in a few seconds…');
        } else {
          setError('Prediction failed. Please try again.');
        }

        console.error('Prediction error:', fnError);
        return;
      }

      setError(null);

      // HF can return either our normalized shape, or a raw [{label, score}, ...] array.
      if (data?.letter) {
        setPrediction({
          letter: data.letter,
          confidence: data.confidence ?? 0.9,
        });
        return;
      }

      if (Array.isArray(data) && data[0]?.label) {
        setPrediction({
          letter: String(data[0].label),
          confidence: typeof data[0].score === 'number' ? data[0].score : 0,
        });
      }
    } catch (err) {
      console.error('Failed to get prediction:', err);
      setError('Prediction failed. Please try again.');
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  const startRecognition = useCallback(
    (videoElement: HTMLVideoElement) => {
      setIsLoading(true);
      setError(null);
      videoRef.current = videoElement;

      // Ensure we never start multiple loops
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Create offscreen canvas for capturing frames
      canvasRef.current = document.createElement('canvas');

      // Wait for video to be ready
      const checkReady = () => {
        if (videoElement.readyState >= 2) {
          setIsLoading(false);
          setIsRunning(true);
          // Start prediction loop (every 1 second)
          intervalRef.current = window.setInterval(captureAndPredict, 1000);
        } else {
          requestAnimationFrame(checkReady);
        }
      };

      checkReady();
    },
    [captureAndPredict]
  );

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
