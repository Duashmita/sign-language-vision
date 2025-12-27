import { useState, useCallback, useRef, useEffect } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { supabase } from '@/integrations/supabase/client';

const MEDIAPIPE_HANDS_VERSION = '0.4.1675469240';
const CAPTURE_INTERVAL_MS = 10_000; // 10 seconds

export interface PredictionResult {
  letter: string;
  confidence: number;
}

export interface UseAIRecognitionReturn {
  isLoading: boolean;
  isRunning: boolean;
  prediction: PredictionResult | null;
  handDetected: boolean;
  startRecognition: (videoElement: HTMLVideoElement) => void;
  stopRecognition: () => void;
  error: string | null;
}

export function useAIRecognition(): UseAIRecognitionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastLandmarksRef = useRef<{ x: number; y: number }[] | null>(null);
  const isRunningRef = useRef(false);

  // Prevent overlapping calls
  const inFlightRef = useRef(false);
  const cooldownUntilRef = useRef<number>(0);

  // Handle MediaPipe results - store landmarks for cropping
  const handleResults = useCallback((results: Results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setHandDetected(true);
      lastLandmarksRef.current = results.multiHandLandmarks[0];
    } else {
      setHandDetected(false);
      lastLandmarksRef.current = null;
    }
  }, []);

  // Crop hand region from video based on landmarks
  const cropHandRegion = useCallback((
    video: HTMLVideoElement,
    landmarks: { x: number; y: number }[],
    canvas: HTMLCanvasElement
  ): string | null => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    // Find bounding box from landmarks (normalized 0-1)
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    for (const lm of landmarks) {
      minX = Math.min(minX, lm.x);
      minY = Math.min(minY, lm.y);
      maxX = Math.max(maxX, lm.x);
      maxY = Math.max(maxY, lm.y);
    }

    // Add padding (20% on each side)
    const padding = 0.2;
    const width = maxX - minX;
    const height = maxY - minY;
    minX = Math.max(0, minX - width * padding);
    minY = Math.max(0, minY - height * padding);
    maxX = Math.min(1, maxX + width * padding);
    maxY = Math.min(1, maxY + height * padding);

    // Convert to pixel coordinates
    const sx = Math.floor(minX * videoWidth);
    const sy = Math.floor(minY * videoHeight);
    const sw = Math.floor((maxX - minX) * videoWidth);
    const sh = Math.floor((maxY - minY) * videoHeight);

    if (sw < 10 || sh < 10) return null;

    // Draw cropped region to canvas (resize to 224x224 for model)
    canvas.width = 224;
    canvas.height = 224;
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 224, 224);

    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Capture and predict when hand is detected
  const captureAndPredict = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isRunningRef.current) return;

    // Check if hand is detected and we have landmarks
    if (!lastLandmarksRef.current) {
      // No hand detected, skip this capture
      return;
    }

    // Avoid piling up requests
    if (inFlightRef.current) return;
    if (Date.now() < cooldownUntilRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Crop hand region
    const imageData = cropHandRegion(video, lastLandmarksRef.current, canvas);
    if (!imageData) return;

    inFlightRef.current = true;
    try {
      const { data, error: fnError } = await supabase.functions.invoke('predict-asl', {
        body: { imageData },
      });

      if (fnError) {
        const status = (fnError as any)?.context?.status as number | undefined;

        if (status === 503) {
          cooldownUntilRef.current = Date.now() + 15_000;
          setError('Model is waking up. Retrying in a few seconds…');
        } else {
          setError('Prediction failed. Please try again.');
        }

        console.error('Prediction error:', fnError);
        return;
      }

      setError(null);

      // Handle response format
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
  }, [cropHandRegion]);

  // Process frames for hand detection (runs continuously)
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !handsRef.current || !isRunningRef.current) return;

    try {
      await handsRef.current.send({ image: videoRef.current });
    } catch (err) {
      console.error('MediaPipe error:', err);
    }

    if (isRunningRef.current) {
      requestAnimationFrame(processFrame);
    }
  }, []);

  const startRecognition = useCallback(async (videoElement: HTMLVideoElement) => {
    if (handsRef.current) {
      // Already initialized, just restart
      videoRef.current = videoElement;
      isRunningRef.current = true;
      setIsRunning(true);
      setError(null);

      // Restart frame processing
      requestAnimationFrame(processFrame);

      // Restart capture interval
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(captureAndPredict, CAPTURE_INTERVAL_MS);
      return;
    }

    setIsLoading(true);
    setError(null);
    videoRef.current = videoElement;
    canvasRef.current = document.createElement('canvas');

    try {
      // Initialize MediaPipe Hands for hand detection
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MEDIAPIPE_HANDS_VERSION}/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, // Use lighter model for detection only
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(handleResults);

      await hands.initialize();
      handsRef.current = hands;

      setIsLoading(false);
      isRunningRef.current = true;
      setIsRunning(true);

      // Start continuous hand detection
      requestAnimationFrame(processFrame);

      // Start capture interval (every 10 seconds)
      intervalRef.current = window.setInterval(captureAndPredict, CAPTURE_INTERVAL_MS);
    } catch (err) {
      console.error('Failed to initialize:', err);
      setError('Failed to initialize hand detection');
      setIsLoading(false);
    }
  }, [handleResults, processFrame, captureAndPredict]);

  const stopRecognition = useCallback(() => {
    isRunningRef.current = false;
    setIsRunning(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }

    setPrediction(null);
    setHandDetected(false);
    lastLandmarksRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  return {
    isLoading,
    isRunning,
    prediction,
    handDetected,
    startRecognition,
    stopRecognition,
    error,
  };
}
