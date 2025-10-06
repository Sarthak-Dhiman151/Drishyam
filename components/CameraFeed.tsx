
import React from 'react';

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isCameraReady: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ videoRef, isCameraReady }) => {
  return (
    <div className="w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};
