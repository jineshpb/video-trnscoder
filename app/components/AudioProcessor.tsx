import { Button } from '@/components/ui/button';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { AudioPlayer } from './AudioPlayer';
import { TranscriptionButton } from './TranscriptionButton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
  transcription,
}: AudioProcessorProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWhisperX, setIsWhisperX] = useState(false);

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
    <div className="flex flex-col items-end gap-4 p-4 border  rounded-2xl">
      <div className="flex items-center justify-between w-full">
        <div>
          <h2 className="text-lg font-bold">Audio</h2>
          <p className="text-sm text-gray-400">
            Extracted audio from your video.
          </p>
        </div>

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
      </div>

      <AudioPlayer audioUrl={audioUrl} />
      {!transcription && audioUrl && (
        <div className="flex flex-col  w-full">
          <div className="flex items-center gap-2">
            <Checkbox
              id="whisperx"
              checked={isWhisperX}
              onCheckedChange={(checked) => setIsWhisperX(checked as boolean)}
            />
            <Label
              htmlFor="whisperx"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Use WhisperX for transcription (with timestamps) and slower
            </Label>
          </div>
          <div className="flex items-center justify-between gap-2 mt-4`">
            <h2 className="text-lg font-bold">Transcription</h2>
            <TranscriptionButton
              audioUrl={audioUrl}
              isWhisperX={isWhisperX}
              setTranscription={setTranscription}
            />
          </div>
        </div>
      )}
    </div>
  );
}
