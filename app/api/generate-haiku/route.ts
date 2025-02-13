import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a haiku generator. Create a haiku based on the given text.',
        },
        {
          role: 'user',
          content: `Create a haiku based on this summary: ${text}`,
        },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ haiku: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate haiku' },
      { status: 500 }
    );
  }
}
