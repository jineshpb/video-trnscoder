import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB - Whisper's limit

export async function POST(request: Request) {
  try {
    // Initialize OpenAI here instead of at the top level
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Audio file size exceeds 25MB limit' },
        { status: 413 }
      );
    }

    // Check file type
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an audio file' },
        { status: 415 }
      );
    }

    try {
      const response = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      return NextResponse.json({ text: response.text });
    } catch (openaiError: any) {
      // Handle specific OpenAI API errors
      if (openaiError.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later' },
          { status: 429 }
        );
      }
      if (openaiError.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key or authentication error' },
          { status: 401 }
        );
      }
      throw openaiError; // Re-throw for general error handling
    }
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Error transcribing audio' },
      { status: 500 }
    );
  }
}
