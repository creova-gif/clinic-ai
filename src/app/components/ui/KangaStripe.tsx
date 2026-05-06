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
        background: 'repeating-linear-gradient(90deg, #1e1b4b 0px, #1e1b4b 6px, #f59e0b 6px, #f59e0b 12px, #10b981 12px, #10b981 18px)',
      }}
    />
  );
}
