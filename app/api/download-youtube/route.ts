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
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', // Updated format selection
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
    });

    console.log(`Running subprocess as ${subprocess.pid}`);

    // Wait for the process to complete
    const { stdout } = await subprocess;
    const output = JSON.parse(stdout);

    console.log('Available formats:', output.formats);

    // Try different format selection strategies
    let videoFormat = output.formats?.find(
      (f: any) =>
        f.ext === 'mp4' &&
        f.format_note?.includes('HD') &&
        f.acodec !== 'none' &&
        f.vcodec !== 'none'
    );

    // Fallback to any MP4 format with both audio and video
    if (!videoFormat) {
      videoFormat = output.formats?.find(
        (f: any) =>
          f.ext === 'mp4' && f.acodec !== 'none' && f.vcodec !== 'none'
      );
    }

    // Final fallback to any available format
    if (!videoFormat) {
      videoFormat = output.formats?.[0];
    }

    if (!videoFormat) {
      throw new Error('No suitable video format found');
    }

    console.log('Selected format:', videoFormat);

    return NextResponse.json({
      videoUrl: videoFormat.url,
      title: output.title || 'youtube-video',
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
