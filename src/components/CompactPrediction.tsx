import { PredictionResult } from '@/hooks/useASLRecognition';

interface CompactPredictionProps {
  prediction: PredictionResult | null;
  isLoading: boolean;
  label: string;
}

export function CompactPrediction({ prediction, isLoading, label }: CompactPredictionProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      
      {isLoading ? (
        <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      ) : prediction ? (
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xl font-bold text-primary">{prediction.letter}</span>
          <span className="text-xs text-muted-foreground">{Math.round(prediction.confidence * 100)}%</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      )}
    </div>
  );
}
