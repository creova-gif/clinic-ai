/**
 * LanguageToggle - Reusable Language Switcher
 * 
 * DESIGN SYSTEM COMPLIANCE:
 * ✅ 44px touch target
 * ✅ 8pt spacing
 * ✅ Clear icon + text
 * ✅ Fixed top-right position
 * ✅ Consistent across all screens
 * 
 * USAGE:
 * Can be used in:
 * - Onboarding screens
 * - Main app
 * - Profile settings
 * - Any screen needing language toggle
 */

import React from 'react';
import { Globe } from 'lucide-react';
import { colors } from '@/app/design-system';

interface LanguageToggleProps {
  language: 'sw' | 'en';
  onToggle: () => void;
  variant?: 'fixed' | 'inline';
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * SPECIFICATIONS:
 * 
 * Fixed variant: position: fixed, top-right
 * Inline variant: position: relative (for use in forms/headers)
 * 
 * Size md: 44px height (default)
 * Size sm: 32px height (for compact areas)
 */

export function LanguageToggle({
  language,
  onToggle,
  variant = 'fixed',
  size = 'md',
  className = '',
}: LanguageToggleProps) {
  const sizeStyles = {
    sm: {
      height: '32px',
      padding: '0 12px',
      fontSize: '14px',
      iconSize: 16,
    },
    md: {
      height: '44px',
      padding: '0 16px',
      fontSize: '16px',
      iconSize: 20,
    },
  };

  const currentSize = sizeStyles[size];

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: currentSize.height,
    padding: currentSize.padding,
    fontSize: currentSize.fontSize,
    fontWeight: 600,
    color: colors.primary[600],
    backgroundColor: '#FFFFFF',
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    ...(variant === 'fixed' && {
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: 50,
    }),
  };

  const hoverStyle: React.CSSProperties = {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const activeStyle: React.CSSProperties = {
    transform: 'scale(0.98)',
  };

  return (
    <button
      className={className}
      style={buttonStyle}
      onClick={onToggle}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, {
          backgroundColor: '#FFFFFF',
          borderColor: colors.neutral[200],
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          transform: 'scale(1)',
        });
      }}
      onMouseDown={(e) => {
        Object.assign(e.currentTarget.style, activeStyle);
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      aria-label={`Switch to ${language === 'sw' ? 'English' : 'Kiswahili'}`}
    >
      <Globe size={currentSize.iconSize} strokeWidth={2} />
      <span>{language === 'sw' ? 'English' : 'Kiswahili'}</span>
    </button>
  );
}

/**
 * USAGE EXAMPLES:
 * 
 * Fixed top-right (default):
 * <LanguageToggle
 *   language={language}
 *   onToggle={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
 * />
 * 
 * Inline in form:
 * <LanguageToggle
 *   language={language}
 *   onToggle={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
 *   variant="inline"
 *   size="sm"
 * />
 * 
 * ACCESSIBILITY:
 * - Semantic button element
 * - aria-label for screen readers
 * - Keyboard navigable
 * - Visual + text indicator (not color-only)
 */
