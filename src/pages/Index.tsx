import { useState, useCallback } from 'react';
import { Hand, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompactCamera } from '@/components/CompactCamera';
import { CompactPrediction } from '@/components/CompactPrediction';
import { useASLRecognition } from '@/hooks/useASLRecognition';
import { useAIRecognition } from '@/hooks/useAIRecognition';

const Index = () => {
  const [isActive, setIsActive] = useState(false);
  
  // Tracking-based recognition (MediaPipe + Fingerpose)
  const tracking = useASLRecognition();
  
  // AI model-based recognition (Backend API)
  const ai = useAIRecognition();

  const handleTrackingVideoReady = useCallback((video: HTMLVideoElement) => {
    tracking.startRecognition(video);
  }, [tracking]);

  const handleAIVideoReady = useCallback((video: HTMLVideoElement) => {
    ai.startRecognition(video);
  }, [ai]);

  const handleToggle = useCallback(() => {
    if (isActive) {
      tracking.stopRecognition();
      ai.stopRecognition();
      setIsActive(false);
    } else {
      setIsActive(true);
    }
  }, [isActive, tracking, ai]);

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
                Start Cameras
              </>
            )}
          </Button>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Tracking Method */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-center text-muted-foreground">
              MediaPipe + Fingerpose
            </h2>
            <CompactCamera
              onVideoReady={handleTrackingVideoReady}
              isActive={isActive}
              onToggle={handleToggle}
              landmarks={tracking.landmarks}
              handDetected={tracking.handDetected}
              showLandmarks={true}
            />
            <CompactPrediction
              prediction={tracking.prediction}
              isLoading={tracking.isLoading}
              label="Prediction"
            />
          </div>

          {/* AI Model Method */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-center text-muted-foreground">
              AI Model (Backend)
            </h2>
            <CompactCamera
              onVideoReady={handleAIVideoReady}
              isActive={isActive}
              onToggle={handleToggle}
            />
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
          <p>Left: Local hand tracking with gesture recognition</p>
          <p>Right: Backend AI model (requires API setup)</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
