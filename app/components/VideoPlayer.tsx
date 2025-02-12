import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  file: File | null;
  onVideoRef: (ref: HTMLVideoElement | null) => void;
}

export function VideoPlayer({ file, onVideoRef }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      onVideoRef(videoRef.current);
    }
  }, [onVideoRef]);

  useEffect(() => {
    if (file && videoRef.current) {
      // Clean up previous URL if it exists
      if (videoRef.current.src) {
        URL.revokeObjectURL(videoRef.current.src);
      }
      videoRef.current.src = URL.createObjectURL(file);
    }

    // Cleanup on unmount
    return () => {
      if (videoRef.current?.src) {
        URL.revokeObjectURL(videoRef.current.src);
      }
    };
  }, [file]);

  return (
    <div>
      <video
        ref={videoRef}
        controls
        className={`${file ? 'w-full rounded-xl overflow-hidden' : 'hidden'}`}
      />
      {file && <h2 className="text-lg mt-2 font-bold mb-2">{file.name}</h2>}
    </div>
  );
}
