import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SUPPORTED_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'I', 'K', 'L', 'O', 'R', 'S', 'U', 'V', 'W', 'Y'
];

interface AlphabetReferenceProps {
  currentLetter?: string;
}

export function AlphabetReference({ currentLetter }: AlphabetReferenceProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card-gradient rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-medium text-muted-foreground">
          Supported Letters ({SUPPORTED_LETTERS.length})
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2">
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_LETTERS.map(letter => (
              <div
                key={letter}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-lg transition-all duration-200 ${
                  currentLetter === letter
                    ? 'bg-primary text-primary-foreground scale-110 shadow-lg'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {letter}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Letters J and Z require motion and are not yet supported.
          </p>
        </div>
      )}
    </div>
  );
}
