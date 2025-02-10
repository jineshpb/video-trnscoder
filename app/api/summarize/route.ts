import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes conversations between two or more people. Add bullet points if required, do not miss any important points."
        },
        {
          role: "user",
          content: `Please provide a summary of the following text, the content is from a video meeting, so it is a conversation between two or more people. Add bullet points if required, do not miss any important points: ${text}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return NextResponse.json({ 
      summary: response.choices[0].message.content 
    });
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Error summarizing text' },
      { status: 500 }
    );
  }
} 