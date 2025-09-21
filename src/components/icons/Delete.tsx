import React from 'react';

export const Delete: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 16 16" 
    fill="none" 
    className={className}
  >
    <path 
      d="M2 4h12m-1 0v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4h10zM6.5 1h3a.5.5 0 01.5.5V4H6V1.5a.5.5 0 01.5-.5zM6.5 7v4.5M9.5 7v4.5" 
      stroke="currentColor" 
      strokeWidth="1.2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);
