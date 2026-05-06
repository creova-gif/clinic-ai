import React from 'react';
import { motion } from 'motion/react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: 'text-white border-none',
  secondary: 'text-white border-none',
  ghost: 'border border-current bg-transparent',
  danger: 'text-white border-none',
};

const variantBg: Record<string, React.CSSProperties> = {
  primary: { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  secondary: { background: '#1e1b4b' },
  ghost: { color: '#6366f1' },
  danger: { background: '#ef4444' },
};

const sizeStyles: Record<string, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
};

export function AnimatedButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:ring-[#6366f1] disabled:opacity-50 disabled:pointer-events-none
        ${variantStyles[variant]} ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={variantBg[variant]}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
