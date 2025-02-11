'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Icon } from '@iconify-icon/react';

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

        console.log('data', data);

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
    <div className="mt-2  rounded-md overflow-hidden relative min-h-[200px] group ">
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-105"
        style={{
          background:
            haikuBackground && typeof haikuBackground === 'string'
              ? haikuBackground.startsWith('data:image')
                ? `url("${haikuBackground}") center/cover no-repeat`
                : haikuBackground // for gradient
              : 'linear-gradient(to right, #4a90e2, #87ceeb)', // default gradient
        }}
      />
      <div className="relative flex flex-col items-center justify-center gap-6 z-10 backdrop-blur-sm  px-6 py-16 text-white rounded-md ">
        <div className="flex flex-col items-center py-12 justify-center gap-6">
          <p className="whitespace-pre-line  font-dm-serif-display text-center text-4xl italic">
            {haiku}
          </p>
        </div>
        <Icon icon="ph:bird-light" width="32" height="32" />

        {isGeneratingImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <p className="text-white">Generating artwork...</p>
          </div>
        )}
      </div>
    </div>
  );
}
