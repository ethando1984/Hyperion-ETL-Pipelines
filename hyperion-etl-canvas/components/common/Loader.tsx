
import React, { memo } from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = memo(({ fullScreen = false, label, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4'
  };

  const content = (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-gray-300 border-t-primary-600`}></div>
      {label && <span className="text-xs text-gray-500 font-medium">{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex w-full h-full min-h-[100px] items-center justify-center">
      {content}
    </div>
  );
});
