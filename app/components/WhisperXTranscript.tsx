interface Segment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

interface WhisperXTranscriptProps {
  segments: Segment[];
}

export function WhisperXTranscript({ segments }: WhisperXTranscriptProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {segments.map((segment, index) => (
        <div key={index} className="flex gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            [{formatTime(segment.start)} - {formatTime(segment.end)}]
          </span>
          <p className="prose">
            {segment.speaker && (
              <span className="font-semibold">Speaker {segment.speaker}: </span>
            )}
            {segment.text}
          </p>
        </div>
      ))}
    </div>
  );
}
