import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
}

export function VideoUploader({ onVideoSelect }: VideoUploaderProps) {
  const { toast } = useToast();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onVideoSelect(file);
    }
  };

  const downloadYoutubeVideo = async () => {
    try {
      setIsDownloading(true);

      // First get the video URL from youtube-dl
      const response = await fetch('/api/download-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Then download the video through our proxy
      const videoResponse = await fetch('/api/proxy-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: data.videoUrl }),
      });

      if (!videoResponse.ok) {
        throw new Error('Failed to download video');
      }

      const videoBlob = await videoResponse.blob();
      const file = new File([videoBlob], `${data.title}.mp4`, {
        type: 'video/mp4',
      });

      onVideoSelect(file);
      setYoutubeUrl('');

      toast({
        title: 'Success',
        description: 'Video downloaded successfully!',
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download video',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="w-full cursor-pointer"
        placeholder="Choose a video to transcribe"
      />
      <div className="flex gap-2">
        <div className="flex flex-col gap-2 w-full">
          <Input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Or enter YouTube URL"
            className="flex-1"
          />
          <p className="text-xs text-gray-500 pl-2">
            Videos of length less than 25 mins for now please
          </p>
        </div>
        <Button
          onClick={downloadYoutubeVideo}
          disabled={!youtubeUrl || isDownloading}
          variant="outline"
        >
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </div>
    </div>
  );
}
