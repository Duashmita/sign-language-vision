import { useState, useCallback, useRef } from 'react';
import { Hand, Play, Square, Sparkles, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompactCamera } from '@/components/CompactCamera';
import { CompactPrediction } from '@/components/CompactPrediction';
import { CaptureTimer } from '@/components/CaptureTimer';
import { useASLRecognition } from '@/hooks/useASLRecognition';
import { useAIRecognition } from '@/hooks/useAIRecognition';

const CAPTURE_INTERVAL_MS = 10_000;

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
    <div className="min-h-screen bg-gradient-to-br from-secondary to-primary/5">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto p-6 md:p-10 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm">
            <Hand className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">ASL Recognition</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Compare Recognition Methods
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Side-by-side comparison of real-time tracking vs CNN model predictions
          </p>
        </header>

        {/* Control */}
        <div className="flex justify-center">
          <Button 
            onClick={handleToggle} 
            size="lg" 
            className="gap-2 px-8 py-6 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isActive ? (
              <>
                <Square className="w-5 h-5" />
                Stop Camera
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Camera
              </>
            )}
          </Button>
        </div>

        {/* Shared Camera */}
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-3xl p-3 shadow-lg border border-border">
            <CompactCamera
              onVideoReady={handleVideoReady}
              isActive={isActive}
              onToggle={handleToggle}
              landmarks={tracking.landmarks}
              handDetected={tracking.handDetected || ai.handDetected}
              showLandmarks={true}
            />
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tracking Method */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                Real-time Tracking
              </h2>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              MediaPipe + Fingerpose
            </p>
            <CompactPrediction
              prediction={tracking.prediction}
              isLoading={tracking.isLoading}
              label="Prediction"
            />
          </div>

          {/* CNN Model Method */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Cpu className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                CNN Model
              </h2>
              <CaptureTimer intervalMs={CAPTURE_INTERVAL_MS} isActive={isActive && ai.handDetected} />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Convolutional Neural Network
            </p>
            <CompactPrediction
              prediction={ai.prediction}
              isLoading={ai.isLoading}
              label="Prediction"
            />
          </div>
        </div>

        {/* Status */}
        {(tracking.error || ai.error) && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-destructive text-sm font-medium">{tracking.error || ai.error}</p>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-accent">Left:</span> Instant local hand tracking with gesture recognition
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">Right:</span> CNN prediction every 10s when hand detected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
