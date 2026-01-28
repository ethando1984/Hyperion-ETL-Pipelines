
import React, { memo } from 'react';

interface IconProps {
  name: string;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const Icon: React.FC<IconProps> = memo(({ name, className = '', onClick, title }) => {
  return (
    <span 
      className={`material-symbols-outlined ${className}`} 
      onClick={onClick}
      title={title}
    >
      {name}
    </span>
  );
});
