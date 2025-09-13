
import React from 'react';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
      <video
        src={src}
        controls
        className="w-full h-full object-contain"
        autoPlay
        muted
        loop
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
