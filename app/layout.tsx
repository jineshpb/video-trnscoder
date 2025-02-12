import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { PackageX } from 'lucide-react';
import Image from 'next/image';
import Footer from './components/Footer';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex absolute top-0 left-0 w-full flex-row justify-between items-center p-4">
          <div className="text-2xl  flex flex-row items-center gap-2">
            <Image src="/logo.svg" width={36} height={36} alt="logo" />
            <p className="text-sm font-medium text-gray-500">Video to Haiku</p>
          </div>
          <div className="text-sm text-gray-500">
            <Image src="/avatar.png" width={36} height={36} alt="avatar" />
          </div>
        </div>
        {children}
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
