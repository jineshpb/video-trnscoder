'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { VideoUploader } from '@/app/components/VideoUploader';
import { VideoPlayer } from '@/app/components/VideoPlayer';
import { AudioProcessor } from '@/app/components/AudioProcessor';
import { TranscriptionViewer } from '@/app/components/TranscriptionViewer';

export default function Home() {
  const { toast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | Array<any>>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isWhisperX, setIsWhisperX] = useState(true);
  const [haiku, setHaiku] = useState<string>('');

  const load = async () => {
    setIsLoading(true);
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
    const ffmpeg = ffmpegRef.current;

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
    });
    setLoaded(true);
    setIsLoading(false);
  };

  const handleVideoSelect = (file: File) => {
    // Clean up previous URLs
    if (videoRef.current?.src) {
      URL.revokeObjectURL(videoRef.current.src);
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // Reset states
    setAudioUrl(null);
    setTranscription('');
    setSummary('');
    setVideoFile(file);
  };

  const handleAudioExtracted = (url: string) => {
    setAudioUrl(url);
  };

  const generateSummary = async () => {
    setIsSummarizing(true);
    try {
      // Convert segments array to text if using WhisperX
      const transcriptionText = isWhisperX
        ? (transcription as any[]).map((segment) => segment.text).join(' ')
        : transcription;

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcriptionText }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate summary',
        variant: 'destructive',
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!loaded) {
    return (
      <div className="items-center flex flex-col md:flex-row justify-center h-screen">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/background.jpg"
            alt="logo"
            width={5000}
            height={3000}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white from-0% via-30% to-70%" />
        </div>
        <div className="flex flex-col items-center justify-center my-auto h-full">
          <h1 className="text-4xl font-bold">
            <span className="font-ppeditorialnew-ultralight text-6xl text-slate-500">
              Video to Haiku
            </span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm text-center">
            A tool that transcribes videos <br /> and generates haikus
          </p>
          <button
            onClick={load}
            className="mt-4 flex px-12 py-4 rounded-full bg-[#1ED760] font-bold text-white tracking-widest uppercase transform hover:scale-105 hover:bg-[#21e065] transition-colors duration-200"
          >
            Upload a video
            {isLoading && (
              <span className="animate-spin ml-3">
                <svg
                  viewBox="0 0 1024 1024"
                  focusable="false"
                  data-icon="loading"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-screen-2xl mx-auto px-6 mt-32">
      <h1 className="text-5xl font-bold">{videoFile?.name}</h1>
      <p className="text-gray-400 text-sm prose">
        This is your video, follow the instructions on the screen to extract
        audio, generate transcription and summary . Or even better, turn the
        video into a haiku, save everones time
      </p>

      <div className="flex flex-col md:flex-row h-full gap-4">
        <div className="flex flex-col gap-4 w-full">
          <VideoPlayer
            file={videoFile}
            onVideoRef={(ref) => (videoRef.current = ref)}
          />
          <VideoUploader onVideoSelect={handleVideoSelect} />
          <AudioProcessor
            videoFile={videoFile}
            ffmpegRef={ffmpegRef}
            onAudioExtracted={handleAudioExtracted}
            setTranscription={setTranscription}
            transcription={transcription}
            audioUrl={audioUrl}
            isWhisperX={isWhisperX}
          />
        </div>
        <div className="w-full flex flex-col h-full gap-4">
          {videoFile && (
            <div className="space-y-4 flex flex-col w-full">
              <div className="flex flex-col gap-4">
                <TranscriptionViewer
                  transcription={transcription}
                  summary={summary}
                  isWhisperX={isWhisperX}
                  onGenerateSummary={generateSummary}
                  isSummarizing={isSummarizing}
                  haiku={haiku}
                  setHaiku={setHaiku}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
