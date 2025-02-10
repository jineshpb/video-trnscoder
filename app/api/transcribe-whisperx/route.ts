import { NextResponse } from 'next/server';
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const WHISPERX_MODEL = "victor-upmeet/whisperx:84d2ad2d6194fe98a17d2b60bef1c7f910c46b2f6fd38996ca457afd9c8abfcb";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert audio file to base64
    const buffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');
    const audioUrl = `data:${audioFile.type};base64,${base64Audio}`;

    const output = await replicate.run(WHISPERX_MODEL, {
      input: {
        audio_file: audioUrl,
        language: "en",
        batch_size: 16,
        diarize: true
      }
    });

    return NextResponse.json(output);

  } catch (error: any) {
    console.error('WhisperX transcription error:', error);
    return NextResponse.json(
      { error: error.message || 'Error transcribing audio' },
      { status: 500 }
    );
  }
}

async function pollPrediction(id: string) {
  const maxAttempts = 60; // 5 minutes with 5s intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const prediction = await response.json();
    if (prediction.status === "succeeded") {
      return prediction.output;
    } else if (prediction.status === "failed") {
      throw new Error("Transcription failed");
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s between polls
  }

  throw new Error("Transcription timed out");
} 