import { useRef, useEffect, useCallback, useState } from 'react';
import { Camera as CameraIcon, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompactCameraProps {
  onVideoReady: (video: HTMLVideoElement) => void;
  isActive: boolean;
  onToggle: () => void;
  landmarks?: number[][] | null;
  handDetected?: boolean;
  showLandmarks?: boolean;
}

export function CompactCamera({ 
  onVideoReady, 
  isActive, 
  onToggle, 
  landmarks, 
  handDetected,
  showLandmarks = false 
}: CompactCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Keep callback stable so camera doesn't restart on every render
  const onVideoReadyRef = useRef(onVideoReady);
  useEffect(() => {
    onVideoReadyRef.current = onVideoReady;
  }, [onVideoReady]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
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
            onVideoReadyRef.current(videoRef.current);
          }
        };
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setHasPermission(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isActive, startCamera, stopCamera]);

  // Draw landmarks
  useEffect(() => {
    if (!canvasRef.current || !showLandmarks) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (landmarks && handDetected) {
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17],
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

      landmarks.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point[0], point[1], index === 0 ? 5 : 3, 0, 2 * Math.PI);
        ctx.fillStyle = index === 0 ? 'hsl(280, 80%, 60%)' : 'hsl(190, 95%, 50%)';
        ctx.fill();
      });
    }
  }, [landmarks, handDetected, showLandmarks]);

  if (hasPermission === false) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-secondary flex items-center justify-center">
        <div className="text-center p-6">
          <CameraOff className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">Camera access denied</p>
          <p className="text-xs text-muted-foreground mt-1">Please allow camera access to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-secondary">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        style={{ display: isActive ? 'block' : 'none' }}
      />
      
      {showLandmarks && (
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-x-[-1]"
        />
      )}

      {isActive && handDetected !== undefined && (
        <div className={`absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
          handDetected 
            ? 'bg-accent/90 text-accent-foreground' 
            : 'bg-card/80 text-muted-foreground border border-border'
        }`}>
          <div className={`w-2 h-2 rounded-full ${handDetected ? 'bg-accent-foreground animate-pulse' : 'bg-muted-foreground'}`} />
          {handDetected ? 'Hand Detected' : 'No Hand'}
        </div>
      )}

      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary">
          <Button variant="secondary" size="lg" onClick={onToggle} className="gap-2 rounded-xl">
            <CameraIcon className="w-5 h-5" />
            Start Camera
          </Button>
        </div>
      )}
    </div>
  );
}
