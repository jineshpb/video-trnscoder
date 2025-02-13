'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Icon } from '@iconify-icon/react';

interface HaikuCardProps {
  summary: string;
}

export function HaikuCard({ summary }: HaikuCardProps) {
  const { toast } = useToast();
  const [haikuBackground, setHaikuBackground] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [haiku, setHaiku] = useState<string>('');
  const [isGeneratingHaiku, setIsGeneratingHaiku] = useState(false);

  useEffect(() => {
    async function generateContent() {
      if (!summary || isGeneratingHaiku || haiku) return;

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

        // Generate Image
        setIsGeneratingImage(true);
        const imageResponse = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ haiku: haikuData.haiku, summary }),
        });

        const imageData = await imageResponse.json();
        if (!imageResponse.ok) throw new Error(imageData.error);
        setHaikuBackground(imageData.imageUrl);
      } catch (error) {
        console.error('Generation error:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate content',
          variant: 'destructive',
        });
      } finally {
        setIsGeneratingHaiku(false);
        setIsGeneratingImage(false);
      }
    }

    generateContent();
  }, [summary, haiku, isGeneratingHaiku, toast]);

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
