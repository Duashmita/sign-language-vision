import { useState, useCallback, useRef, useEffect } from 'react';
import { GestureEstimator } from 'fingerpose';
import { aslGestures } from '@/lib/aslGestures';
import { useSharedHands, HandsResults } from './useSharedHands';

export interface PredictionResult {
  letter: string;
  confidence: number;
}

export interface UseASLRecognitionReturn {
  isLoading: boolean;
  isRunning: boolean;
  prediction: PredictionResult | null;
  handDetected: boolean;
  landmarks: number[][] | null;
  startRecognition: (videoElement: HTMLVideoElement) => void;
  stopRecognition: () => void;
  error: string | null;
}

export function useASLRecognition(): UseASLRecognitionReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [landmarks, setLandmarks] = useState<number[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gestureEstimatorRef = useRef<GestureEstimator | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isRunningRef = useRef(false);

  const { isLoading, isReady, error: handsError, sendFrame, registerCallback } = useSharedHands();

  // Initialize gesture estimator
  useEffect(() => {
    gestureEstimatorRef.current = new GestureEstimator(aslGestures);
  }, []);

  // Handle MediaPipe results
  const handleResults = useCallback((results: HandsResults) => {
    if (!isRunningRef.current) return;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setHandDetected(true);

      const handLandmarks = results.multiHandLandmarks[0];
      const landmarksArray = handLandmarks.map((lm) => [lm.x * 640, lm.y * 480, lm.z * 100]);
      setLandmarks(landmarksArray);

      if (gestureEstimatorRef.current) {
        try {
          const gesture = gestureEstimatorRef.current.estimate(landmarksArray, 7.5);

          if (gesture.gestures && gesture.gestures.length > 0) {
            const bestGesture = gesture.gestures.reduce((prev, curr) =>
              curr.score > prev.score ? curr : prev
            );

            setPrediction({
              letter: bestGesture.name,
              confidence: bestGesture.score / 10,
            });
          } else {
            setPrediction(null);
          }
        } catch (err) {
          console.error('Gesture estimation error:', err);
        }
      }
    } else {
      setHandDetected(false);
      setLandmarks(null);
      setPrediction(null);
    }
  }, []);

  // Register callback when running
  useEffect(() => {
    if (!isRunning) return;
    return registerCallback(handleResults);
  }, [isRunning, registerCallback, handleResults]);

  // Frame processing loop
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !isRunningRef.current || !isReady) return;

    await sendFrame(videoRef.current);

    if (isRunningRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isReady, sendFrame]);

  const startRecognition = useCallback(
    (videoElement: HTMLVideoElement) => {
      videoRef.current = videoElement;
      setError(handsError);

      if (!isReady) {
        // Wait for hands to be ready
        return;
      }

      isRunningRef.current = true;
      setIsRunning(true);

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    },
    [isReady, handsError, processFrame]
  );

  // Start processing once ready
  useEffect(() => {
    if (isReady && videoRef.current && isRunningRef.current && !animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isReady, processFrame]);

  const stopRecognition = useCallback(() => {
    isRunningRef.current = false;
    setIsRunning(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setPrediction(null);
    setHandDetected(false);
    setLandmarks(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    isRunning,
    prediction,
    handDetected,
    landmarks,
    startRecognition,
    stopRecognition,
    error: error || handsError,
  };
}
