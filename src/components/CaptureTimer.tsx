import { useEffect, useState } from 'react';

interface CaptureTimerProps {
  intervalMs: number;
  isActive: boolean;
  onCapture?: () => void;
}

export function CaptureTimer({ intervalMs, isActive, onCapture }: CaptureTimerProps) {
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(intervalMs / 1000));

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setSecondsLeft(Math.floor(intervalMs / 1000));
      return;
    }

    const totalSeconds = intervalMs / 1000;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = (Date.now() - startTime) % intervalMs;
      const progressPercent = (elapsed / intervalMs) * 100;
      const remaining = Math.ceil((intervalMs - elapsed) / 1000);

      setProgress(progressPercent);
      setSecondsLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 100);

    return () => clearInterval(interval);
  }, [isActive, intervalMs]);

  if (!isActive) return null;

  // SVG circle parameters
  const size = 48;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-100"
        />
      </svg>
      {/* Countdown text */}
      <span className="absolute text-xs font-medium text-primary">
        {secondsLeft}s
      </span>
    </div>
  );
}
