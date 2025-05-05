import { NextResponse } from 'next/server';
import { create } from 'youtube-dl-exec';
import { existsSync, chmodSync, writeFileSync } from 'fs';
import path from 'path';

const MAX_DURATION_MINUTES = 25;
const MAX_FILE_SIZE_MB = 100; // Setting a safe limit for video size

const possiblePaths = [
  '/usr/local/bin/yt-dlp', // Global install (Linux/macOS)
  '/usr/bin/yt-dlp', // Alternative system path
  './node_modules/youtube-dl-exec/bin/yt-dlp', // Local node_modules
  'yt-dlp', // Default (if in PATH)
];

function findYtDlpBinary() {
  console.log('Environment:', process.env.NODE_ENV);
  const projectRoot = process.cwd();
  console.log('Current working directory:', projectRoot);

  // Use absolute path for node_modules
  const localPath = path.join(
    projectRoot,
    'node_modules/youtube-dl-exec/bin/yt-dlp'
  );
  console.log('Checking absolute local path:', localPath);

  if (existsSync(localPath)) {
    console.log(`Using yt-dlp binary at: ${localPath}`);
    return create(localPath);
  }

  throw new Error(`yt-dlp binary not found at ${localPath}`);
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    console.log('Processing URL:', url);

    // Use the robust binary finder
    const youtubedl = findYtDlpBinary();

    const subprocess = youtubedl.exec(url, {
      dumpJson: true,
      format: 'best[height<=720][ext=mp4]',
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
    });

    const { stdout } = await subprocess;
    const cleanedOutput = stdout.trim().split('\n')[0];
    const output = JSON.parse(cleanedOutput);

    // Check video duration
    const durationInMinutes = (output.duration || 0) / 60;
    if (durationInMinutes > MAX_DURATION_MINUTES) {
      throw new Error(
        `Video is too long. Maximum duration is ${MAX_DURATION_MINUTES} minutes.`
      );
    }

    console.log(
      'Available formats:',
      output.formats?.map((f: any) => ({
        format_id: f.format_id,
        ext: f.ext,
        acodec: f.acodec,
        vcodec: f.vcodec,
        format_note: f.format_note,
        filesize: Math.round(f.filesize / (1024 * 1024)) + 'MB',
      }))
    );

    // Get the direct video URL from formats with size check
    const videoFormat = output.formats?.find((f: any) => {
      const fileSizeMB = f.filesize ? f.filesize / (1024 * 1024) : 0;
      return (
        f.ext === 'mp4' &&
        f.acodec !== 'none' &&
        f.vcodec !== 'none' &&
        f.height <= 720 &&
        (fileSizeMB === 0 || fileSizeMB <= MAX_FILE_SIZE_MB)
      );
    });

    if (!videoFormat) {
      console.log('No suitable format found within size/quality limits');
      throw new Error(
        'No suitable video format found. Please try a shorter video.'
      );
    }

    console.log('Selected format:', {
      format_id: videoFormat.format_id,
      ext: videoFormat.ext,
      resolution: videoFormat.resolution,
      filesize: Math.round(videoFormat.filesize / (1024 * 1024)) + 'MB',
      duration: Math.round(durationInMinutes * 10) / 10 + ' minutes',
    });

    return NextResponse.json({
      videoUrl: videoFormat.url,
      title: output.title || 'youtube-video',
      duration: durationInMinutes,
      filesize: videoFormat.filesize
        ? Math.round(videoFormat.filesize / (1024 * 1024))
        : 'unknown',
    });
  } catch (error: any) {
    console.error('Download error:', {
      message: error.message,
      stack: error.stack,
      command: error?.command,
      stderr: error?.stderr,
      stdout: error?.stdout,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to download video' },
      { status: 500 }
    );
  }
}
