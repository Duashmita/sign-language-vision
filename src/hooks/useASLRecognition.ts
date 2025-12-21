import { useState, useCallback, useRef, useEffect } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { GestureEstimator } from 'fingerpose';
import { aslGestures } from '@/lib/aslGestures';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [landmarks, setLandmarks] = useState<number[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handsRef = useRef<Hands | null>(null);
  const gestureEstimatorRef = useRef<GestureEstimator | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize gesture estimator
  useEffect(() => {
    gestureEstimatorRef.current = new GestureEstimator(aslGestures);
  }, []);

  const processFrame = useCallback(async () => {
    if (!videoRef.current || !handsRef.current || !isRunning) return;

    try {
      await handsRef.current.send({ image: videoRef.current });
    } catch (err) {
      console.error('Error processing frame:', err);
    }

    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isRunning]);

  const handleResults = useCallback((results: Results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setHandDetected(true);
      
      // Convert landmarks to the format fingerpose expects
      const handLandmarks = results.multiHandLandmarks[0];
      const landmarksArray = handLandmarks.map((lm) => [lm.x * 640, lm.y * 480, lm.z * 100]);
      setLandmarks(landmarksArray);

      // Estimate gesture
      if (gestureEstimatorRef.current) {
        try {
          const gesture = gestureEstimatorRef.current.estimate(landmarksArray, 7.5);
          
          if (gesture.gestures && gesture.gestures.length > 0) {
            // Get the gesture with highest confidence
            const bestGesture = gesture.gestures.reduce((prev, curr) => 
              (curr.score > prev.score) ? curr : prev
            );
            
            setPrediction({
              letter: bestGesture.name,
              confidence: bestGesture.score / 10, // Normalize to 0-1
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

  const startRecognition = useCallback(async (videoElement: HTMLVideoElement) => {
    setIsLoading(true);
    setError(null);
    videoRef.current = videoElement;

    try {
      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(handleResults);

      await hands.initialize();
      handsRef.current = hands;

      setIsLoading(false);
      setIsRunning(true);

      // Start processing frames
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      console.error('Failed to initialize:', err);
      setError('Failed to initialize hand detection');
      setIsLoading(false);
    }
  }, [handleResults, processFrame]);

  const stopRecognition = useCallback(() => {
    setIsRunning(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }

    setPrediction(null);
    setHandDetected(false);
    setLandmarks(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  // Start frame processing when running changes
  useEffect(() => {
    if (isRunning && !animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isRunning, processFrame]);

  return {
    isLoading,
    isRunning,
    prediction,
    handDetected,
    landmarks,
    startRecognition,
    stopRecognition,
    error,
  };
}
