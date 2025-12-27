import { PredictionResult } from '@/hooks/useASLRecognition';

interface CompactPredictionProps {
  prediction: PredictionResult | null;
  isLoading: boolean;
  label: string;
}

export function CompactPrediction({ prediction, isLoading, label }: CompactPredictionProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-accent';
    if (confidence >= 0.5) return 'text-primary';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border shadow-sm transition-all duration-200 hover:shadow-md">
      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
      
      {isLoading ? (
        <div className="w-7 h-7 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      ) : prediction ? (
        <div className="flex items-center gap-3">
          <span className="font-mono text-3xl font-bold text-primary animate-letter-appear">
            {prediction.letter}
          </span>
          <div className="flex flex-col items-end">
            <span className={`text-sm font-semibold ${getConfidenceColor(prediction.confidence)}`}>
              {Math.round(prediction.confidence * 100)}%
            </span>
            <span className="text-[10px] text-muted-foreground">confidence</span>
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground text-lg">—</span>
      )}
    </div>
  );
}
