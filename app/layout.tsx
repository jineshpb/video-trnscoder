import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { PackageX } from 'lucide-react';
import Image from 'next/image';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Video to Haiku',
  description: 'Transform your videos into beautiful haikus with AI',
  openGraph: {
    title: 'Video to Haiku',
    description: 'Transform your videos into beautiful haikus with AI',
    images: [
      {
        url: '/og-image.jpg', // Adjust extension if different
        width: 1200,
        height: 630,
        alt: 'Video to Haiku - AI-powered video poetry',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video to Haiku',
    description: 'Transform your videos into beautiful haikus with AI',
    images: ['/og-image.png'], // Adjust extension if different
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col justify-between">
          <div>
            <NavBar />
            <main className="min-h-screen">{children}</main>
          </div>
          <Toaster />
          <Footer />
        </div>
      </body>
    </html>
  );
}
