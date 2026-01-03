import { useEffect, useState, useCallback } from 'react';

const MEDIAPIPE_HANDS_VERSION = '0.4.1675469240';

// MediaPipe types (since we're loading dynamically)
interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandsResults {
  multiHandLandmarks: HandLandmark[][];
  multiHandedness: { label: string; score: number }[];
  image: HTMLCanvasElement | HTMLVideoElement;
}

export type ResultsCallback = (results: HandsResults) => void;

interface MediaPipeHands {
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (callback: (results: HandsResults) => void) => void;
  initialize: () => Promise<void>;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
}

interface SharedHandsState {
  hands: MediaPipeHands | null;
  isInitializing: boolean;
  isInitialized: boolean;
  error: string | null;
  callbacks: Set<ResultsCallback>;
}

// Singleton state for shared MediaPipe Hands instance
const sharedState: SharedHandsState = {
  hands: null,
  isInitializing: false,
  isInitialized: false,
  error: null,
  callbacks: new Set(),
};

let initPromise: Promise<MediaPipeHands | null> | null = null;

// Type for the global Hands constructor
type HandsConstructor = new (config: { locateFile: (file: string) => string }) => MediaPipeHands;

// Dynamically load MediaPipe Hands from CDN
async function loadMediaPipeHands(): Promise<HandsConstructor> {
  const cdnUrl = `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MEDIAPIPE_HANDS_VERSION}/hands.js`;
  
  // Check if already loaded
  const win = window as Window & { Hands?: HandsConstructor };
  if (win.Hands) {
    return win.Hands;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = cdnUrl;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      const HandsClass = (window as Window & { Hands?: HandsConstructor }).Hands;
      if (HandsClass) {
        resolve(HandsClass);
      } else {
        reject(new Error('MediaPipe Hands not found on window after loading'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load MediaPipe Hands script'));
    document.head.appendChild(script);
  });
}

async function initializeHands(): Promise<MediaPipeHands | null> {
  if (sharedState.hands) return sharedState.hands;
  if (sharedState.isInitializing && initPromise) return initPromise;

  sharedState.isInitializing = true;

  initPromise = (async () => {
    try {
      const HandsClass = await loadMediaPipeHands();
      
      const hands = new HandsClass({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MEDIAPIPE_HANDS_VERSION}/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results) => {
        // Broadcast results to all registered callbacks
        sharedState.callbacks.forEach((cb) => cb(results));
      });

      await hands.initialize();

      sharedState.hands = hands;
      sharedState.isInitialized = true;
      sharedState.isInitializing = false;
      sharedState.error = null;

      return hands;
    } catch (err) {
      console.error('Failed to initialize MediaPipe Hands:', err);
      sharedState.error = 'Failed to initialize hand detection';
      sharedState.isInitializing = false;
      return null;
    }
  })();

  return initPromise;
}

export interface UseSharedHandsReturn {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  sendFrame: (video: HTMLVideoElement) => Promise<void>;
  registerCallback: (cb: ResultsCallback) => () => void;
}

export function useSharedHands(): UseSharedHandsReturn {
  const [isLoading, setIsLoading] = useState(!sharedState.isInitialized);
  const [isReady, setIsReady] = useState(sharedState.isInitialized);
  const [error, setError] = useState<string | null>(sharedState.error);

  useEffect(() => {
    if (sharedState.isInitialized) {
      setIsLoading(false);
      setIsReady(true);
      return;
    }

    setIsLoading(true);
    initializeHands().then((hands) => {
      setIsLoading(false);
      if (hands) {
        setIsReady(true);
        setError(null);
      } else {
        setError(sharedState.error);
      }
    });
  }, []);

  const sendFrame = useCallback(async (video: HTMLVideoElement) => {
    if (!sharedState.hands) return;
    try {
      await sharedState.hands.send({ image: video });
    } catch (err) {
      console.error('Error sending frame to MediaPipe:', err);
    }
  }, []);

  const registerCallback = useCallback((cb: ResultsCallback) => {
    sharedState.callbacks.add(cb);
    return () => {
      sharedState.callbacks.delete(cb);
    };
  }, []);

  return {
    isLoading,
    isReady,
    error,
    sendFrame,
    registerCallback,
  };
}
