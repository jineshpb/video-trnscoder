import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const MODEL = 'black-forest-labs/flux-schnell';

export async function POST(req: Request) {
  try {
    const { haiku, summary } = await req.json();

    if (!haiku || !summary) {
      return NextResponse.json(
        { error: 'Haiku and summary are required' },
        { status: 400 }
      );
    }

    const truncatedSummary = summary.slice(0, 200);
    const prompt = `Create a dreamy, artistic image: "${haiku}". Context: "${truncatedSummary}". Style: ethereal, minimalistic, high quality photography, no TEXT on image whatsoever.`;

    const output = await replicate.run(MODEL, {
      input: {
        prompt: prompt,
        aspect_ratio: '1:1',
        output_format: 'webp',
        output_quality: 80,
        safety_tolerance: 2,
        prompt_upsampling: true,
        num_inference_steps: 4,
        guidance_scale: 7.5,
      },
    });
    // Handle ReadableStream
    if (!output || !Array.isArray(output) || !output[0]) {
      throw new Error('Invalid output from Replicate API');
    }

    const stream = output[0];
    const reader = stream.getReader();
    let allChunks = new Uint8Array(0);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Combine chunks properly
      const newArray = new Uint8Array(allChunks.length + value.length);
      newArray.set(allChunks);
      newArray.set(value, allChunks.length);
      allChunks = newArray;
    }

    // Convert to base64
    const base64 = Buffer.from(allChunks).toString('base64');
    const imageUrl = `data:image/webp;base64,${base64}`;

    // console.log('Image URL:', imageUrl);

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
