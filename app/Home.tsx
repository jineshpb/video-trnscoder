"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { Toast } from "@/components/ui/toast"
import { Download } from "lucide-react";

export default function Home() {
  const { toast } = useToast()
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const load = async () => {
    setIsLoading(true);
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    setLoaded(true);
    setIsLoading(false);
  };

  const transcode = async () => {
    const ffmpeg = ffmpegRef.current;
    // Clean up previous video URL if it exists
    if (videoRef.current?.src) {
      URL.revokeObjectURL(videoRef.current.src);
    }
    
    await ffmpeg.writeFile(
      "input.mp4",
      await fetchFile("/in.mp4")
    );
    await ffmpeg.exec(["-i", "input.mp4", "output.mov"]);
    const data = (await ffmpeg.readFile("output.mov")) as any;
    
    // Create blob and URLs for both video player and download
    const blob = new Blob([data.buffer], { type: "video/mov" });
    const url = URL.createObjectURL(blob);
    
    // Set video player source
    if (videoRef.current) {
      videoRef.current.src = url;
    }
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'out.mov';
    downloadLink.click();
    
    // Clean up the download URL
    URL.revokeObjectURL(downloadLink.href);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clean up previous URLs and reset all states
      if (videoRef.current?.src) {
        URL.revokeObjectURL(videoRef.current.src);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      // Reset all states
      setAudioUrl(null);
      setTranscription("");
      setSummary("");
      setVideoFile(null);
      
      // Set new video file and display
      setVideoFile(file);
      videoRef.current!.src = URL.createObjectURL(file);
      
      // Reset message
      if (messageRef.current) {
        messageRef.current.innerHTML = "";
      }
    }
  };

  const extractAudio = async () => {
    if (!videoFile) return;
    const ffmpeg = ffmpegRef.current;
    
    toast({
      title: "Processing",
      description: "Extracting audio from video...",
    });
    
    // Clean up previous audio URL if it exists
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    try {
      // Convert uploaded file to Uint8Array for FFmpeg
      const fileData = await videoFile.arrayBuffer();
      const fileUint8 = new Uint8Array(fileData);
      
      await ffmpeg.writeFile("input.mp4", fileUint8);
      await ffmpeg.exec([
        "-i", "input.mp4",
        "-vn",
        "-acodec", "libmp3lame",
        "-q:a", "2",
        "output.mp3"
      ]);
      
      const audioData = await ffmpeg.readFile("output.mp3") as any;
      const audioBlob = new Blob([audioData.buffer], { type: "audio/mp3" });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      toast({
        title: "Success",
        description: "Audio extraction complete!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract audio",
        variant: "destructive",
      });
    }
  };

  const transcribeAudio = async () => {

   
    if (!audioUrl) return;
    
    try {
      setIsTranscribing(true);
      toast({
        title: "Processing",
        description: "Transcribing audio...",
      });

      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.mp3');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setTranscription(data.text);
      toast({
        title: "Success",
        description: "Transcription complete!",
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Error",
        description: "Failed to transcribe audio",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const summarizeText = async () => {
    if (!transcription) return;
    
    try {
      setIsSummarizing(true);
      toast({
        title: "Processing",
        description: "Generating summary...",
      });

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcription }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setSummary(data.summary);
      toast({
        title: "Success",
        description: "Summary generated!",
      });
    } catch (error) {
      console.error('Summarization error:', error);
      toast({
        title: "Error",
        description: "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return loaded ? (
    <div className="flex flex-row h-full max-w-screen-2xl mx-auto px-6">
      <div className="w-full flex flex-col h-full gap-4 mt-4 ">

        {!videoFile && (
          <p className="text-sm text-gray-500">Choose a video to transcribe</p>
        )}

      <video ref={videoRef} controls className={`${videoFile ? ' w-full rounded-xl overflow-hidden' : 'hidden'}`}></video>

        <Input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="w-full"
        />
  
        
      {videoFile && (
        <>
        <Button
          onClick={extractAudio}
          disabled={!videoFile}
          variant="outline"
          className="w-auto"
       
      >
        Extract Audio
      </Button>
     
      </>
      
      )}
      </div>
  
      <div className=" flex flex-col w-full h-full overflow-y-auto">
     
      {audioUrl && (
        <div className="mt-4 ml-8">
          <h2 className="text-lg font-bold mb-2">Audio</h2>
          <div className="flex flex-row gap-2 items-center">
          <audio controls src={audioUrl} className="w-full" />
           <Button 
           className="rounded-full h-12 w-12"
           variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.href = audioUrl;
                link.download = 'audio.mp3';
                link.click();
              }}
            >
              <Download /> 
              
            </Button>

          </div>
           
          <div className="mt-2 flex gap-2 justify-end w-full">
            
            {!transcription && (
            <Button
              onClick={transcribeAudio}
              disabled={isTranscribing}
              variant="outline"
              className="w-auto"
             
            >
              {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
            </Button>
            )}
          </div>
          <p ref={messageRef}></p>

          
          {transcription && (
            <div className="mt-2 p-4 bg-gray-100 rounded w-full tailwind-scrollbar">
              {!summary && (
                <Button
                  onClick={summarizeText}
                  disabled={isSummarizing}
                variant="outline"
                className="w-auto"
              >
                {isSummarizing ? 'Generating Summary...' : 'Generate Summary'}
              </Button>
              )}
              {summary && (
                <div className=" p-3 bg-white rounded">
                  <h4 className="font-bold mb-2">Summary:</h4>
                  <p className="prose ">{summary}</p>
                </div>
              )}
              <Accordion type="single" collapsible  >
                <AccordionItem value="transcription">
                  <AccordionTrigger>View Full Transcription</AccordionTrigger>
                  <AccordionContent>
                    <p className="prose mt-2 ">{transcription}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen">
    <Button
      onClick={load}
      variant="default"
    >
      Load ffmpeg-core
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
    </Button>
    </div>
  );
}
