import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface TranscriptionButtonProps {
  audioUrl: string | null;
  isWhisperX: boolean;
  setTranscription: (text: any) => void;
}

export function TranscriptionButton({
  audioUrl,
  setTranscription,
  isWhisperX,
}: TranscriptionButtonProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  const transcribeAudio = async () => {
    if (!audioUrl) return;

    try {
      setIsTranscribing(true);
      toast({
        title: 'Processing',
        description: `Transcribing audio with ${isWhisperX ? 'WhisperX' : 'Whisper'}...`,
      });

      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.mp3');

      // Call the appropriate API endpoint
      const endpoint = isWhisperX
        ? '/api/transcribe-whisperx'
        : '/api/transcribe';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transcribe audio');
      }

      // Handle different response formats based on the API used
      const text = isWhisperX ? data.segments : data.text;
      setTranscription(text);

      toast({
        title: 'Success',
        description: 'Transcription complete!',
      });
    } catch (error: any) {
      console.error('Transcription error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to transcribe audio',
        variant: 'destructive',
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={transcribeAudio}
        disabled={!audioUrl || isTranscribing}
        variant="outline"
        className="w-auto"
      >
        {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
      </Button>
    </div>
  );
}
