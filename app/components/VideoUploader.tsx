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
      const response = await fetch('/api/download-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const videoResponse = await fetch(data.videoUrl);
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
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-2xl">
      <div className="flex flex-col ">
        <h2 className="text-lg font-bold">Upload Video</h2>
        <p className="text-sm text-gray-500">
          Choose a video or enter YouTube URL
        </p>
      </div>

      <Input
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="w-full cursor-pointer"
        placeholder="Choose a video to transcribe"
      />
      <div className="flex gap-2">
        <Input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="Or enter YouTube URL"
          className="flex-1"
        />
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
