import { Button } from '@/components/ui/button';
import { Download, Play, Pause } from 'lucide-react';
import { useState, useRef } from 'react';

interface AudioPlayerProps {
  audioUrl: string | null;
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'extracted-audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!audioUrl) return null;

  return (
    <div className="flex flex-col  gap-2 w-full ">
      {/* HTML5 Audio Player with controls */}

      <div className="flex items-center gap-2 w-full">
        <audio
          ref={audioRef}
          controls
          className="w-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          <source src={audioUrl} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
        <Button
          onClick={handleDownload}
          variant="outline"
          size="icon"
          className="w-14 h-14 rounded-full"
        >
          <Download size={16} />
        </Button>
      </div>
    </div>
  );
}
