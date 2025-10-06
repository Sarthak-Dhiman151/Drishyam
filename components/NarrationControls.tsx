import React from 'react';
import { PlayIcon, AlertTriangleIcon, WandIcon, SpeakerOnIcon, SpeakerOffIcon, StopIcon } from './icons';

interface NarrationControlsProps {
  isLoading: boolean;
  narration: string;
  error: string | null;
  isCameraReady: boolean;
  onRequestNarration: () => void;
  onStop: () => void;
  isAutoMode: boolean;
  onToggleAutoMode: () => void;
  isSpeaking: boolean;
  onPlayNarration: () => void;
  onStopNarration: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-5 h-5 border-2 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
        <span className="text-gray-300">Analyzing scene...</span>
    </div>
);


export const NarrationControls: React.FC<NarrationControlsProps> = ({
  isLoading,
  narration,
  error,
  isCameraReady,
  onRequestNarration,
  onStop,
  isAutoMode,
  onToggleAutoMode,
  isSpeaking,
  onPlayNarration,
  onStopNarration,
}) => {
  const hasContent = narration.length > 0;
  const buttonText = hasContent ? 'Narrate Next Scene' : 'Start Narrating';

  return (
    <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-4">
        <div className="w-full min-h-[6rem] bg-black/50 backdrop-blur-md rounded-lg p-4 flex items-center justify-center text-center border border-gray-700 shadow-lg">
          {error && (
            <div className="flex flex-col items-center text-red-400">
                <AlertTriangleIcon className="w-8 h-8 mb-2"/>
                <p className="font-semibold">{error}</p>
            </div>
          )}
          {!error && isLoading && <LoadingSpinner />}
          {!error && !isLoading && !narration && (
            <p className="text-gray-400">Press 'Start Narrating' to describe your surroundings.</p>
          )}
          {!error && !isLoading && narration && (
            <p className="text-lg md:text-xl text-white leading-relaxed">{narration}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <button
                onClick={onStop}
                className={`
                px-8 py-4 rounded-full text-lg font-bold flex items-center justify-center space-x-3 
                transition-all duration-300 ease-in-out transform hover:scale-105 shadow-2xl
                focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900
                bg-red-600 hover:bg-red-700 text-white focus:ring-red-500
                `}
            >
                <StopIcon className="w-6 h-6" />
                <span>Stop</span>
            </button>
          ) : (
            <button
                onClick={onRequestNarration}
                disabled={!isCameraReady}
                className={`
                px-8 py-4 rounded-full text-lg font-bold flex items-center justify-center space-x-3 
                transition-all duration-300 ease-in-out transform hover:scale-105 shadow-2xl
                focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900
                disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                bg-cyan-500 hover:bg-cyan-600 text-black focus:ring-cyan-400
                `}
            >
                <PlayIcon className="w-6 h-6" />
                <span>{buttonText}</span>
            </button>
          )}
          
          <button
            onClick={isSpeaking ? onStopNarration : onPlayNarration}
            disabled={!hasContent || isLoading}
            className={`
              p-4 rounded-full flex items-center justify-center 
              transition-all duration-300 ease-in-out transform hover:scale-105 shadow-2xl
              focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900
              disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
              ${isSpeaking ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}
              text-white focus:ring-gray-500
            `}
            title={isSpeaking ? "Stop Narration" : "Read Aloud"}
            aria-pressed={isSpeaking}
          >
            {isSpeaking ? <SpeakerOffIcon className="w-6 h-6" /> : <SpeakerOnIcon className="w-6 h-6" />}
          </button>

          <button
            onClick={onToggleAutoMode}
            disabled={!isCameraReady || isLoading}
            className={`
              p-4 rounded-full flex items-center justify-center 
              transition-all duration-300 ease-in-out transform hover:scale-105 shadow-2xl
              focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900
              disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
              ${isAutoMode 
                ? 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500'}
            `}
            title={isAutoMode ? "Disable Auto-Narration" : "Enable Auto-Narration"}
            aria-pressed={isAutoMode}
          >
            <WandIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};