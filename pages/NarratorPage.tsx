import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getSceneDescription, hasSceneChanged } from '../services/geminiService';
import { CameraFeed } from '../components/CameraFeed';
import { NarrationControls } from '../components/NarrationControls';
import { AlertTriangleIcon, CameraIcon, HomeIcon } from '../components/icons';
import { Page } from '../App';

interface NarratorPageProps {
  apiKey: string;
  onNavigate: (page: Page) => void;
}

const NarratorPage: React.FC<NarratorPageProps> = ({ apiKey, onNavigate }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [narration, setNarration] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [isAutoMode, setIsAutoMode] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastAnalyzedImageRef = useRef<string | null>(null);
  const autoModeIntervalRef = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  const stopNarration = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please check your browser permissions.");
      }
    };
    setupCamera();
    return () => {
      stopNarration();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (autoModeIntervalRef.current) {
        clearInterval(autoModeIntervalRef.current);
      }
    };
  }, [stopNarration]);

  const speakNarration = useCallback((text: string) => {
    stopNarration();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [stopNarration]);
  
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) {
        return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg').split(',')[1];
    }
    return null;
  }, []);

  const analyzeScene = useCallback(async (base64Image: string) => {
    isCancelledRef.current = false;
    stopNarration();
    setIsLoading(true);
    setError(null);

    const description = await getSceneDescription(apiKey, base64Image);

    if (isCancelledRef.current) {
      setIsLoading(false);
      return;
    }

    if (description.startsWith('Error:')) {
      setError(description);
      setNarration('');
    } else {
      setNarration(description);
      speakNarration(description);
      lastAnalyzedImageRef.current = base64Image;
    }
    setIsLoading(false);
  }, [apiKey, speakNarration, stopNarration]);

  const handleRequestNarration = useCallback(() => {
    const frame = captureFrame();
    if (frame) {
      analyzeScene(frame);
    }
  }, [captureFrame, analyzeScene]);

  const handleStop = useCallback(() => {
    isCancelledRef.current = true;
    stopNarration();
    setIsLoading(false);
  }, [stopNarration]);

  const handleToggleAutoMode = () => {
    setIsAutoMode(prev => !prev);
  };

  const handlePlayNarration = useCallback(() => {
    speakNarration(narration);
  }, [narration, speakNarration]);

  useEffect(() => {
    if (isAutoMode && isCameraReady) {
        autoModeIntervalRef.current = window.setInterval(async () => {
            if (isLoading || document.hidden) return; 

            const newFrame = captureFrame();
            if (!newFrame) return;

            if (lastAnalyzedImageRef.current) {
                const changed = await hasSceneChanged(apiKey, lastAnalyzedImageRef.current, newFrame);
                if (changed && !isCancelledRef.current) {
                    await analyzeScene(newFrame);
                }
            } else {
                if (!isCancelledRef.current) {
                    await analyzeScene(newFrame);
                }
            }
        }, 4000); 
    } else {
        if (autoModeIntervalRef.current) {
            clearInterval(autoModeIntervalRef.current);
        }
    }

    return () => {
        if (autoModeIntervalRef.current) {
            clearInterval(autoModeIntervalRef.current);
        }
    };
  }, [isAutoMode, isCameraReady, isLoading, captureFrame, analyzeScene, apiKey]);

  return (
    <main className="relative w-screen h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent z-20">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
          aria-label="Go to Home Page"
        >
          <HomeIcon className="w-7 h-7" />
        </button>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        <CameraFeed videoRef={videoRef} isCameraReady={isCameraReady} />
        {!isCameraReady && !error && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex flex-col items-center justify-center text-white z-10">
                <CameraIcon className="w-16 h-16 mb-4 animate-pulse text-gray-400" />
                <p className="text-xl">Initializing Camera...</p>
            </div>
        )}
        {error && !isCameraReady && (
             <div className="absolute inset-0 bg-red-900 bg-opacity-90 flex flex-col items-center justify-center text-white z-10 p-4">
                <AlertTriangleIcon className="w-16 h-16 mb-4 text-red-300" />
                <p className="text-xl font-semibold">Camera Error</p>
                <p className="text-center mt-2">{error}</p>
            </div>
        )}
      </div>

      <NarrationControls 
        isLoading={isLoading}
        narration={narration}
        error={error}
        isCameraReady={isCameraReady}
        onRequestNarration={handleRequestNarration}
        onStop={handleStop}
        isAutoMode={isAutoMode}
        onToggleAutoMode={handleToggleAutoMode}
        isSpeaking={isSpeaking}
        onPlayNarration={handlePlayNarration}
        onStopNarration={stopNarration}
      />
      
      <canvas ref={canvasRef} className="hidden"></canvas>
    </main>
  );
};

export default NarratorPage;
