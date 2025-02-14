import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    // Debug log to check environment variable
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);

    // Initialize OpenAI inside the route handler
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '', // Provide empty string as fallback
    });

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Verify API key before making request
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that summarizes conversations between two or more people. Add bullet points if required, do not miss any important points.',
        },
        {
          role: 'user',
          content: `Please provide a summary of the following text, the content is from a video meeting, so it is a conversation between two or more people. Add bullet points if required, do not miss any important points: ${text}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return NextResponse.json({
      summary: response.choices[0].message.content,
    });
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Error summarizing text' },
      { status: 500 }
    );
  }
}
