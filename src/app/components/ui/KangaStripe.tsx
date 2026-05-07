import React from 'react';

interface KangaStripeProps {
  className?: string;
}

export function KangaStripe({ className = '' }: KangaStripeProps) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        height: '3px',
        background: 'repeating-linear-gradient(90deg, #0d9488 0px, #0d9488 6px, #f59e0b 6px, #f59e0b 12px, #0f172a 12px, #0f172a 18px)',
      }}
    />
  );
}
