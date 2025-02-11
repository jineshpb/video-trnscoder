'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface HaikuCardProps {
  haiku: string;
  summary: string;
}

export function HaikuCard({ haiku, summary }: HaikuCardProps) {
  const { toast } = useToast();
  const [haikuBackground, setHaikuBackground] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    const generateBackground = async () => {
      try {
        setIsGeneratingImage(true);
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            haiku,
            summary,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        setHaikuBackground(data.imageUrl);
      } catch (error) {
        console.error('Failed to generate image:', error);
        // Fallback to gradient
        setHaikuBackground('linear-gradient(to right, #ec4899, #8b5cf6)');
      } finally {
        setIsGeneratingImage(false);
      }
    };

    if (haiku && summary) {
      generateBackground();
    }
  }, [haiku, summary]);

  return (
    <div className="mt-2 p-3 rounded-md overflow-hidden relative min-h-[200px] group">
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-105"
        style={{
          background: haikuBackground?.startsWith('http')
            ? `url(${haikuBackground}) center/cover no-repeat`
            : haikuBackground || 'linear-gradient(to right, #ec4899, #8b5cf6)',
        }}
      />
      <div className="relative z-10 p-6 text-white bg-black/30 rounded-md backdrop-blur-sm">
        <h3 className="font-bold mb-4 text-xl">Haiku Interpretation</h3>
        <p className="whitespace-pre-line font-serif text-lg italic">{haiku}</p>
        {isGeneratingImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <p className="text-white">Generating artwork...</p>
          </div>
        )}
      </div>
    </div>
  );
}
