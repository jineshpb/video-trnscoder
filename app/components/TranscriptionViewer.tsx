import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { WhisperXTranscript } from './WhisperXTranscript';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HaikuCard } from './HaikuCard';

interface TranscriptionViewerProps {
  transcription: string | Array<any>;
  summary: string;
  isWhisperX: boolean;
  onGenerateSummary: () => Promise<void>;
  onGenerateHaiku: () => Promise<void>;
  isSummarizing: boolean;
  isGeneratingHaiku: boolean;
  haiku: string;
}

export function TranscriptionViewer({
  transcription,
  summary,
  isWhisperX,
  onGenerateSummary,
  onGenerateHaiku,
  isSummarizing,
  isGeneratingHaiku,
  haiku,
}: TranscriptionViewerProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard',
    });
  };

  if (!transcription) return null;

  return (
    <div className=" p-4 border rounded-2xl w-full tailwind-scrollbar">
      {summary && (
        <div>
          <div className="p-3 rounded-xl bg-gray-100">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold mb-2">Summary:</h4>
              <button
                onClick={() => copyToClipboard(summary)}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="Copy summary"
              >
                <Copy size={16} />
              </button>
            </div>
            <p className="prose">{summary}</p>
          </div>

          <div className="mt-4">
            <Button
              onClick={onGenerateHaiku}
              disabled={isGeneratingHaiku}
              variant="outline"
              className="w-auto"
            >
              {isGeneratingHaiku ? 'Generating Haiku...' : '✨ Generate Haiku'}
            </Button>

            {haiku && (
              <div className="mt-4 h-auto">
                <HaikuCard haiku={haiku} summary={summary} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <h2 className="text-lg font-bold">Transcription</h2>
        {!summary && (
          <Button
            onClick={onGenerateSummary}
            disabled={isSummarizing}
            variant="outline"
            className="w-auto mt-2"
          >
            {isSummarizing ? 'Generating Summary...' : 'Generate Summary'}
          </Button>
        )}
      </div>

      <Accordion type="single" collapsible>
        <AccordionItem value="transcription">
          <AccordionTrigger>View Full Transcription</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-start justify-between gap-2">
              {isWhisperX && Array.isArray(transcription) ? (
                <WhisperXTranscript
                  segments={transcription.map((segment: any) => ({
                    start: segment.start,
                    end: segment.end,
                    text: segment.text,
                    ...(segment.speaker && { speaker: segment.speaker }),
                  }))}
                />
              ) : (
                <p className="prose mt-2">{transcription}</p>
              )}
              <button
                onClick={() =>
                  copyToClipboard(
                    isWhisperX && Array.isArray(transcription)
                      ? transcription
                          .map((segment: any) => segment.text)
                          .join(' ')
                      : String(transcription)
                  )
                }
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="Copy transcription"
              >
                <Copy size={16} />
              </button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
