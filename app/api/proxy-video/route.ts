import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json();

    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'googlebot',
        Referer: 'youtube.com',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }

    const videoBuffer = await response.arrayBuffer();

    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to proxy video' },
      { status: 500 }
    );
  }
}
