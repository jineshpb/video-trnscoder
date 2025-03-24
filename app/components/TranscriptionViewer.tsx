import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { WhisperXTranscript } from './WhisperXTranscript';
import { Copy } from 'lucide-react';
import { toast, useToast } from '@/hooks/use-toast';
import { HaikuCard } from './HaikuCard';
import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface TranscriptionViewerProps {
  transcription: string | Array<any>;
  summary: string;
  isWhisperX: boolean;
  onGenerateSummary: () => Promise<void>;
  isSummarizing: boolean;
  haiku: string;
  setHaiku: (haiku: string) => void;
}

export function TranscriptionViewer({
  transcription,
  summary,
  isWhisperX,
  onGenerateSummary,
  isSummarizing,
  haiku,
  setHaiku,
}: TranscriptionViewerProps) {
  const { toast } = useToast();

  const hasStartedHaikuGeneration = useRef(false);
  const [isGeneratingHaiku, setIsGeneratingHaiku] = useState(false);

  const generateHaiku = async (summary: string) => {
    if (!summary || isGeneratingHaiku || hasStartedHaikuGeneration.current)
      return;

    hasStartedHaikuGeneration.current = true;

    try {
      // Generate Haiku
      setIsGeneratingHaiku(true);
      const haikuResponse = await fetch('/api/generate-haiku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary }),
      });

      const haikuData = await haikuResponse.json();
      if (!haikuResponse.ok) throw new Error(haikuData.error);
      setHaiku(haikuData.haiku);
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate content',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingHaiku(false);
      hasStartedHaikuGeneration.current = false;
    }
  };

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
            <div className="prose">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>

          <div className="mt-4">
            {!haiku && (
              <Button
                onClick={() => generateHaiku(summary)}
                disabled={isGeneratingHaiku}
                variant="outline"
                className="w-auto"
              >
                {isGeneratingHaiku
                  ? 'Generating Haiku...'
                  : '✨ Generate Haiku'}
              </Button>
            )}

            {haiku && (
              <div className="mt-4 h-auto">
                <HaikuCard
                  summary={summary}
                  isGeneratingHaiku={isGeneratingHaiku}
                  haiku={haiku}
                  hasStartedHaikuGeneration={hasStartedHaikuGeneration.current}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold mt-4">Transcription</h2>
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
                <div className="prose mt-2">
                  <ReactMarkdown>
                    {Array.isArray(transcription)
                      ? transcription.map((s) => s.text).join(' ')
                      : transcription}
                  </ReactMarkdown>
                </div>
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
