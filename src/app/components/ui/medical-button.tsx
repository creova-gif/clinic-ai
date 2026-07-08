/**
 * Medical-Grade Button Component
 * 
 * INTERACTION PRINCIPLES:
 * - Immediate response (0-100ms)
 * - Subtle scale or opacity change (0.98 scale, 0.85 opacity)
 * - No bounce or exaggerated motion
 * - Haptic feedback on mobile (10ms)
 * - Disable double-tap while processing (300ms cooldown)
 * 
 * Based on: Apple Health, NHS App, Mayo Clinic
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  MOTION_DURATION_S,
  MOTION_EASING,
  MOTION_OPACITY,
  MOTION_SCALE,
  BUTTON_PRESS,
  triggerHaptic,
  prefersReducedMotion,
} from '@/app/styles/motion-tokens';

interface MedicalButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export const MedicalButton: React.FC<MedicalButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false,
  icon,
  type = 'button',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = useCallback(async () => {
    if (disabled || isProcessing || loading) return;

    // Haptic feedback (10ms vibration) on mobile
    triggerHaptic(10);

    if (onClick) {
      setIsProcessing(true);
      try {
        await onClick();
      } finally {
        // Prevent double-tap for minimum 300ms
        setTimeout(() => setIsProcessing(false), 300);
      }
    }
  }, [onClick, disabled, isProcessing, loading]);

  const isDisabled = disabled || isProcessing || loading;
  const reducedMotion = prefersReducedMotion();

  // Variant styles
  const variantStyles: Record<string, { bg: string, text: string, hover: string, active: string, border?: string }> = {
    primary: {
      bg: '#0F3D56',
      text: '#FFFFFF',
      hover: '#0A2F42',
      active: '#072633',
    },
    secondary: {
      bg: '#FFFFFF',
      text: '#0F3D56',
      hover: '#F7F9FB',
      active: '#EDF1F5',
      border: '#E5E7EB',
    },
    ghost: {
      bg: 'transparent',
      text: '#0F3D56',
      hover: '#F7F9FB',
      active: '#EDF1F5',
    },
    danger: {
      bg: '#C84B31',
      text: '#FFFFFF',
      hover: '#B03B21',
      active: '#9A3218',
    },
  };

  // Size styles
  const sizeStyles = {
    sm: {
      padding: '8px 16px',
      fontSize: '14px',
      height: '36px',
    },
    md: {
      padding: '12px 24px',
      fontSize: '16px',
      height: '44px',
    },
    lg: {
      padding: '16px 32px',
      fontSize: '18px',
      height: '52px',
    },
  };

  const style = variantStyles[variant];
  const sizing = sizeStyles[size];

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-xl
        transition-all
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        backgroundColor: variant === 'secondary' || variant === 'ghost' ? style.bg : style.bg,
        color: style.text,
        border: style.border ? `1px solid ${style.border}` : 'none',
        padding: sizing.padding,
        fontSize: sizing.fontSize,
        height: sizing.height,
        minHeight: sizing.height,
        transitionDuration: `${MOTION_DURATION_S.fast}s`,
      }}
      // Immediate visual feedback using motion tokens
      whileTap={isDisabled || reducedMotion ? {} : { 
        scale: MOTION_SCALE.press, 
        opacity: MOTION_OPACITY.hover 
      }}
      // Subtle hover using motion tokens
      whileHover={isDisabled || reducedMotion ? {} : { 
        opacity: MOTION_OPACITY.hover,
      }}
      transition={{
        duration: MOTION_DURATION_S.fast,
        ease: MOTION_EASING.out,
      }}
    >
      {loading ? (
        <LoadingSpinner size={size} />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};

// Simple, medical-grade loading spinner (slower, calmer)
const LoadingSpinner: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const sizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const spinnerSize = sizes[size];

  return (
    <svg
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      style={{ 
        animation: 'spin 1s linear infinite' // 1s duration (slower, calmer)
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Interaction hook for consistent press behavior
export const useMedicalInteraction = () => {
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  return { triggerHaptic };
};