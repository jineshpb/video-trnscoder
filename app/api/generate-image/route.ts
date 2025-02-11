import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// The full model identifier including version hash
const MODEL =
  'google/imagen-3:2e53c6f439a4e2de8769f9f63f2b0453e3b5b5d6edfb65e5fa0f8ac4a1f7b53b';

export async function POST(req: Request) {
  try {
    const { haiku, summary } = await req.json();

    // Create a prompt that combines the haiku and summary context
    const prompt = `Create a dreamy, artistic background image that captures the essence of this haiku: "${haiku}". Context from summary: "${summary}". Style: ethereal, minimalistic, suitable as a background.`;

    // Note the structure of the input object
    const output = await replicate.run(MODEL, {
      input: {
        prompt: prompt,
        num_inference_steps: 50,
        num_outputs: 1,
        scheduler: 'DPM++ 2M Karras',
        guidance_scale: 7.5,
      },
    });

    // The API returns an array of image URLs
    return NextResponse.json({ imageUrl: output[0] });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
