import { useRef, useEffect, useCallback, useState } from 'react';
import { Camera as CameraIcon, CameraOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraProps {
  onVideoReady: (video: HTMLVideoElement) => void;
  isActive: boolean;
  onToggle: () => void;
  landmarks?: number[][] | null;
  handDetected?: boolean;
}

export function Camera({ onVideoReady, isActive, onToggle, landmarks, handDetected }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);

        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            onVideoReady(videoRef.current);
          }
        };
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setHasPermission(false);
    }
  }, [facingMode, onVideoReady]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isActive) {
      stopCamera();
      startCamera();
    }
  }, [facingMode, isActive, startCamera, stopCamera]);

  // Draw landmarks on canvas
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (landmarks && handDetected) {
      // Draw connections
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17], // Palm
      ];

      ctx.strokeStyle = 'hsl(190, 95%, 50%)';
      ctx.lineWidth = 2;

      connections.forEach(([start, end]) => {
        if (landmarks[start] && landmarks[end]) {
          ctx.beginPath();
          ctx.moveTo(landmarks[start][0], landmarks[start][1]);
          ctx.lineTo(landmarks[end][0], landmarks[end][1]);
          ctx.stroke();
        }
      });

      // Draw landmarks
      landmarks.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point[0], point[1], index === 0 ? 6 : 4, 0, 2 * Math.PI);
        ctx.fillStyle = index === 0 ? 'hsl(280, 80%, 60%)' : 'hsl(190, 95%, 50%)';
        ctx.fill();
        ctx.strokeStyle = 'hsl(220, 20%, 6%)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  }, [landmarks, handDetected]);

  if (hasPermission === false) {
    return (
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-card border border-border flex items-center justify-center">
        <div className="text-center p-6">
          <CameraOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Camera access denied</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-card border border-border">
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        style={{ display: isActive ? 'block' : 'none' }}
      />
      
      {/* Canvas overlay for landmarks */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
      />

      {/* Hand detection indicator */}
      {isActive && (
        <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
          handDetected 
            ? 'bg-primary/20 text-primary border border-primary/40 animate-pulse-glow' 
            : 'bg-muted/50 text-muted-foreground border border-border'
        }`}>
          <div className={`w-2 h-2 rounded-full ${handDetected ? 'bg-primary' : 'bg-muted-foreground'}`} />
          {handDetected ? 'Hand Detected' : 'No Hand'}
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleCamera}
          className="bg-secondary/80 backdrop-blur-sm hover:bg-secondary"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Inactive state */}
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <div className="text-center">
            <CameraIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Camera is off</p>
            <Button onClick={onToggle} className="gap-2">
              <CameraIcon className="w-4 h-4" />
              Start Camera
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
