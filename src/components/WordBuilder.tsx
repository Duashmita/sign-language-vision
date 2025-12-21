import { useState, useEffect, useRef } from 'react';
import { Trash2, Copy, Check, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface WordBuilderProps {
  currentLetter: string | null;
  isActive: boolean;
}

export function WordBuilder({ currentLetter, isActive }: WordBuilderProps) {
  const [word, setWord] = useState('');
  const [copied, setCopied] = useState(false);
  const lastLetterRef = useRef<string | null>(null);
  const lastAddTimeRef = useRef<number>(0);
  const { toast } = useToast();

  // Add letter when held for a brief moment
  useEffect(() => {
    if (!isActive || !currentLetter) {
      lastLetterRef.current = null;
      return;
    }

    const now = Date.now();
    
    // Only add if it's a new letter or enough time has passed
    if (currentLetter !== lastLetterRef.current) {
      // New letter detected, wait a bit before adding
      lastLetterRef.current = currentLetter;
      lastAddTimeRef.current = now;
      
      const timer = setTimeout(() => {
        // Check if the letter is still the same
        if (lastLetterRef.current === currentLetter) {
          setWord(prev => prev + currentLetter);
        }
      }, 800); // Hold for 800ms to add

      return () => clearTimeout(timer);
    }
  }, [currentLetter, isActive]);

  const handleClear = () => {
    setWord('');
    toast({
      title: 'Word cleared',
      description: 'Start building a new word',
    });
  };

  const handleCopy = async () => {
    if (!word) return;
    
    await navigator.clipboard.writeText(word);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: `"${word}" copied to clipboard`,
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!word) return;
    
    const utterance = new SpeechSynthesisUtterance(word);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="card-gradient rounded-xl border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm uppercase tracking-wider text-muted-foreground">
          Word Builder
        </h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSpeak}
            disabled={!word}
            className="h-8 w-8"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            disabled={!word}
            className="h-8 w-8"
          >
            {copied ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={!word}
            className="h-8 w-8"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-[60px] bg-muted/30 rounded-lg p-4 flex items-center">
        {word ? (
          <span className="font-mono text-2xl md:text-3xl font-bold tracking-wider">
            {word}
          </span>
        ) : (
          <span className="text-muted-foreground">
            Hold a sign to add letters...
          </span>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-center">
        Hold each sign for ~1 second to add to word
      </p>
    </div>
  );
}
