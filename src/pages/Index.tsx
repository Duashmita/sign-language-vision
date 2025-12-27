import { useState, useCallback, useRef, useEffect } from 'react';
import { Hand, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompactCamera } from '@/components/CompactCamera';
import { CompactPrediction } from '@/components/CompactPrediction';
import { useASLRecognition } from '@/hooks/useASLRecognition';
import { useAIRecognition } from '@/hooks/useAIRecognition';

const Index = () => {
  const [isActive, setIsActive] = useState(false);
  const sharedVideoRef = useRef<HTMLVideoElement | null>(null);

  // Tracking-based recognition (MediaPipe + Fingerpose)
  const {
    startRecognition: startTracking,
    stopRecognition: stopTracking,
    ...tracking
  } = useASLRecognition();

  // AI model-based recognition (Backend API)
  const {
    startRecognition: startAI,
    stopRecognition: stopAI,
    ...ai
  } = useAIRecognition();

  // When video is ready, start both recognition methods with the SAME video
  const handleVideoReady = useCallback(
    (video: HTMLVideoElement) => {
      sharedVideoRef.current = video;
      startTracking(video);
      startAI(video);
    },
    [startTracking, startAI]
  );

  const handleToggle = useCallback(() => {
    if (isActive) {
      stopTracking();
      stopAI();
      setIsActive(false);
    } else {
      setIsActive(true);
    }
  }, [isActive, stopTracking, stopAI]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Hand className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">ASL Recognition</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Compare Recognition Methods</h1>
          <p className="text-sm text-muted-foreground">
            Side-by-side comparison of tracking vs AI model predictions
          </p>
        </header>

        {/* Control */}
        <div className="flex justify-center">
          <Button onClick={handleToggle} size="lg" className="gap-2">
            {isActive ? (
              <>
                <Square className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Camera
              </>
            )}
          </Button>
        </div>

        {/* Shared Camera */}
        <div className="max-w-md mx-auto">
          <CompactCamera
            onVideoReady={handleVideoReady}
            isActive={isActive}
            onToggle={handleToggle}
            landmarks={tracking.landmarks}
            handDetected={tracking.handDetected || ai.handDetected}
            showLandmarks={true}
          />
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Tracking Method */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-center text-muted-foreground">
              MediaPipe + Fingerpose (Real-time)
            </h2>
            <CompactPrediction
              prediction={tracking.prediction}
              isLoading={tracking.isLoading}
              label="Prediction"
            />
          </div>

          {/* AI Model Method */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-center text-muted-foreground">
              AI Model (Every 10s when hand detected)
            </h2>
            <CompactPrediction
              prediction={ai.prediction}
              isLoading={ai.isLoading}
              label="Prediction"
            />
          </div>
        </div>

        {/* Status */}
        {(tracking.error || ai.error) && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-destructive text-sm">{tracking.error || ai.error}</p>
          </div>
        )}

        {/* Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Left: Local hand tracking with gesture recognition (instant)</p>
          <p>Right: Backend AI model prediction (captures every 10s when hand is visible)</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
