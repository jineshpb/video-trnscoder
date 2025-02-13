import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';

const NavBar = () => {
  return (
    <div className="flex absolute top-0 left-0 w-full flex-row justify-between items-center p-4">
      <div className="text-2xl  flex flex-row items-center gap-2">
        <Image src="/logo.svg" width={36} height={36} alt="logo" />
        <p className="text-sm font-medium text-gray-500">Video to Haiku</p>
      </div>
      <div className="text-sm text-gray-500">
        <Button variant="outline" disabled>
          Login
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
