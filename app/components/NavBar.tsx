import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';

const NavBar = () => {
  return (
    <div className="flex absolute top-0 left-0 w-full flex-row justify-between items-center p-4">
      <div className="text-2xl  flex flex-row items-center gap-2">
        <Image src="/logo.svg" width={36} height={36} alt="logo" />
        <p className="text-sm font-medium text-gray-500">Video to Haiku</p>
      </div>
      <div className="text-sm text-gray-500 flex flex-row items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Link href="https://jineshb.me" target="_blank">
                <Image
                  src="/zinc-faint.svg"
                  width={24}
                  height={24}
                  alt="spotify"
                />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>https://jineshb.me</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* <Button variant="outline" disabled>
          Login
        </Button> */}
      </div>
    </div>
  );
};

export default NavBar;
