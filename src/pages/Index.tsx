import { useState, useCallback } from 'react';
import { Camera as CameraIcon, Hand, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Camera } from '@/components/Camera';
import { PredictionDisplay } from '@/components/PredictionDisplay';
import { AlphabetReference } from '@/components/AlphabetReference';
import { WordBuilder } from '@/components/WordBuilder';
import { useASLRecognition } from '@/hooks/useASLRecognition';

const Index = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const {
    isLoading,
    isRunning,
    prediction,
    handDetected,
    landmarks,
    startRecognition,
    stopRecognition,
    error,
  } = useASLRecognition();

  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    startRecognition(video);
  }, [startRecognition]);

  const handleToggleCamera = useCallback(() => {
    if (isCameraActive) {
      stopRecognition();
      setIsCameraActive(false);
    } else {
      setIsCameraActive(true);
    }
  }, [isCameraActive, stopRecognition]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background glow effect */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{ background: 'var(--gradient-glow)' }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Hand className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">ASL Recognition</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">ASL Decoder</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time American Sign Language alphabet recognition. 
            Show hand signs to your camera and watch them translate instantly.
          </p>
        </header>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* Camera section */}
          <div className="space-y-4">
            <Camera
              onVideoReady={handleVideoReady}
              isActive={isCameraActive}
              onToggle={handleToggleCamera}
              landmarks={landmarks}
              handDetected={handDetected}
            />

            {/* Camera controls */}
            <div className="flex justify-center">
              <Button
                onClick={handleToggleCamera}
                size="lg"
                variant={isCameraActive ? 'secondary' : 'default'}
                className="gap-2"
              >
                {isCameraActive ? (
                  <>
                    <CameraIcon className="w-5 h-5" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Start Recognition
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Prediction section */}
          <div className="space-y-4">
            <PredictionDisplay
              prediction={prediction}
              isLoading={isLoading}
              handDetected={handDetected}
            />

            <WordBuilder
              currentLetter={prediction?.letter ?? null}
              isActive={isRunning}
            />

            <AlphabetReference currentLetter={prediction?.letter} />
          </div>
        </div>

        {/* Features */}
        <section className="mt-16 md:mt-24 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-gradient rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CameraIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Enable Camera</h3>
              <p className="text-sm text-muted-foreground">
                Allow camera access to start capturing hand gestures in real-time
              </p>
            </div>

            <div className="card-gradient rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Hand className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Show Signs</h3>
              <p className="text-sm text-muted-foreground">
                Make ASL alphabet signs clearly visible to the camera
              </p>
            </div>

            <div className="card-gradient rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Get Translation</h3>
              <p className="text-sm text-muted-foreground">
                See your signs translated to letters instantly with confidence scores
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Powered by MediaPipe Hand Tracking & Fingerpose Gesture Recognition
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
