import React from 'react';

const Footer = () => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col  gap-2 w-full justify-center items-center p-4 text-sm text-gray-500">
        <div className="flex w-full gap-2 items-center justify-center">
          Free time project by{' '}
          <a href="https://jineshb.me" className="underline">
            Jinesh Bhaskaran
          </a>
          <span className="text-gray-400">|</span>
          <a href="https://github.com/jineshbhaskaran" className="underline">
            GitHub
          </a>
        </div>
        <p>Uses the awesome ffmpeg and yt-dl libraries</p>
      </div>
    </div>
  );
};

export default Footer;
