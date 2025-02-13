import dynamic from 'next/dynamic';
import React from 'react';

interface NoSSRWrapperProps {
  children: React.ReactNode;
}

const NoSSRWrapper = ({ children }: NoSSRWrapperProps) => (
  <React.Fragment>{children}</React.Fragment>
);

export default dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
});
