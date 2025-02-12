import { Button } from '@/components/ui/button';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { AudioPlayer } from './AudioPlayer';
import { TranscriptionButton } from './TranscriptionButton';

interface AudioProcessorProps {
  videoFile: File | null;
  ffmpegRef: React.RefObject<FFmpeg>;
  onAudioExtracted: (audioUrl: string) => void;
  setTranscription: (text: any) => void;
  audioUrl: string | null;
  isWhisperX: boolean;
  transcription: string | Array<any>;
}

export function AudioProcessor({
  videoFile,
  ffmpegRef,
  onAudioExtracted,
  setTranscription,
  audioUrl,
  isWhisperX,
  transcription,
}: AudioProcessorProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const extractAudio = async () => {
    if (!videoFile || !ffmpegRef.current) return;

    setIsProcessing(true);
    toast({
      title: 'Processing',
      description: 'Extracting audio from video...',
    });

    try {
      const ffmpeg = ffmpegRef.current;
      const fileData = await videoFile.arrayBuffer();
      const fileUint8 = new Uint8Array(fileData);

      await ffmpeg.writeFile('input.mp4', fileUint8);
      await ffmpeg.exec([
        '-i',
        'input.mp4',
        '-vn',
        '-acodec',
        'libmp3lame',
        '-q:a',
        '2',
        'output.mp3',
      ]);

      const audioData = (await ffmpeg.readFile('output.mp3')) as any;
      const audioBlob = new Blob([audioData.buffer], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      onAudioExtracted(audioUrl);

      toast({
        title: 'Success',
        description: 'Audio extraction complete!',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to extract audio',
        variant: 'destructive',
      });
      console.error('Audio extraction error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!videoFile) return null;

  return (
    <div className="flex flex-col items-end gap-4 p-4 border rounded-2xl">
      {!audioUrl && (
        <Button
          onClick={extractAudio}
          disabled={isProcessing}
          variant="outline"
          className="w-auto"
        >
          {isProcessing ? 'Extracting Audio...' : 'Extract Audio'}
        </Button>
      )}
      <AudioPlayer audioUrl={audioUrl} />
      {!transcription && (
        <TranscriptionButton
          audioUrl={audioUrl}
          isWhisperX={isWhisperX}
          setTranscription={setTranscription}
        />
      )}
    </div>
  );
}
