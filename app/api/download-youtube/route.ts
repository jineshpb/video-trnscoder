import { NextResponse } from 'next/server';
import { create } from 'youtube-dl-exec';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    console.log('Processing URL:', url);

    // Create youtubedl instance with binary path
    const youtubedl = create('./node_modules/youtube-dl-exec/bin/yt-dlp');

    // Use exec with the created instance
    const subprocess = youtubedl.exec(url, {
      dumpJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
    });

    console.log(`Running subprocess as ${subprocess.pid}`);

    // Wait for the process to complete
    const { stdout } = await subprocess;
    const output = JSON.parse(stdout);

    console.log('Video info:', output);

    return NextResponse.json({
      videoUrl: output.url || output.webpage_url,
      title: output.title,
    });
  } catch (error: any) {
    console.error('Download error:', {
      message: error.message,
      stack: error.stack,
      command: error?.command,
      stderr: error?.stderr,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to download video' },
      { status: 500 }
    );
  }
}
