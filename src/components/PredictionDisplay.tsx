import { PredictionResult } from '@/hooks/useASLRecognition';

interface PredictionDisplayProps {
  prediction: PredictionResult | null;
  isLoading: boolean;
  handDetected: boolean;
}

export function PredictionDisplay({ prediction, isLoading, handDetected }: PredictionDisplayProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-primary';
    if (confidence > 0.5) return 'text-accent';
    return 'text-muted-foreground';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence > 0.8) return 'High confidence';
    if (confidence > 0.5) return 'Medium confidence';
    return 'Low confidence';
  };

  return (
    <div className="card-gradient rounded-xl border border-border p-6 md:p-8 text-center">
      <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
        Detected Sign
      </h2>

      {isLoading ? (
        <div className="py-8">
          <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading model...</p>
        </div>
      ) : prediction ? (
        <div className="py-4">
          <div className="inline-block animate-letter-appear">
            <span className="font-mono text-[120px] md:text-[160px] font-bold gradient-text leading-none">
              {prediction.letter}
            </span>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 flex-1 max-w-[200px] bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${prediction.confidence * 100}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                {Math.round(prediction.confidence * 100)}%
              </span>
            </div>
            <p className={`text-sm ${getConfidenceColor(prediction.confidence)}`}>
              {getConfidenceLabel(prediction.confidence)}
            </p>
          </div>
        </div>
      ) : handDetected ? (
        <div className="py-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center animate-hand-pulse">
            <span className="text-4xl">✋</span>
          </div>
          <p className="mt-4 text-muted-foreground">Analyzing hand gesture...</p>
        </div>
      ) : (
        <div className="py-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
            <span className="text-4xl opacity-30">✋</span>
          </div>
          <p className="mt-4 text-muted-foreground">Show your hand to the camera</p>
        </div>
      )}
    </div>
  );
}
