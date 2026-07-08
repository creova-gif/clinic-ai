/**
 * MedicalCard - Government-Grade Card Component
 * 
 * DESIGN SYSTEM COMPLIANCE:
 * ✅ 16px consistent padding
 * ✅ 12px border radius (max)
 * ✅ Light elevation (subtle shadow)
 * ✅ 1px neutral border
 * ✅ Aligned internal spacing
 * ✅ No heavy shadows
 * 
 * COMPARED TO: NHS App cards, Mayo Clinic content blocks
 */

import React from 'react';
import { colors, spacing, borderRadius, shadows } from '../tokens';

interface MedicalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  interactive?: boolean;
}

/**
 * CARD SPECIFICATIONS:
 * 
 * Padding options:
 * - none: 0px
 * - sm: 12px (8pt × 1.5)
 * - md: 16px (8pt × 2) [default]
 * - lg: 24px (8pt × 3)
 * 
 * Border radius: 12px max (institutional, not too round)
 * Border: 1px solid neutral-300
 * Shadow: Subtle (0-4px range only)
 */

export function MedicalCard({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  style,
  onClick,
  interactive = false,
}: MedicalCardProps) {
  const paddingValues = {
    none: '0',
    sm: '12px',
    md: '16px',
    lg: '24px',
  };

  const variantStyles = {
    default: {
      backgroundColor: '#FFFFFF',
      border: `1px solid ${colors.primary[500]}`,
      boxShadow: 'none',
    },
    elevated: {
      backgroundColor: '#FFFFFF',
      border: `1px solid ${colors.neutral[200]}`,
      boxShadow: shadows.sm, // Subtle shadow only
    },
    bordered: {
      backgroundColor: '#FFFFFF',
      border: `2px solid ${colors.primary[500]}`,
      boxShadow: 'none',
    },
    flat: {
      backgroundColor: colors.neutral[50],
      border: 'none',
      boxShadow: 'none',
    },
  };

  const baseStyle: React.CSSProperties = {
    ...variantStyles[variant],
    padding: paddingValues[padding],
    borderRadius: '12px', // Max 12px for institutional look
    transition: 'all 200ms ease',
    cursor: interactive || onClick ? 'pointer' : 'default',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    ...style,
  };

  const interactiveHoverStyle: React.CSSProperties = {
    borderColor: colors.primary[500],
    boxShadow: shadows.md,
    transform: 'translateY(-1px)', // Subtle lift
  };

  return (
    <div
      className={className}
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (interactive || onClick) {
          Object.assign(e.currentTarget.style, interactiveHoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (interactive || onClick) {
          Object.assign(e.currentTarget.style, variantStyles[variant]);
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </div>
  );
}

/**
 * Predefined card sections for consistent internal structure
 */

interface CardSectionProps {
  children: React.ReactNode;
  spacing?: 'tight' | 'normal' | 'relaxed';
  className?: string;
}

export function MedicalCardHeader({ children, spacing = 'normal', className = '' }: CardSectionProps) {
  const spacingValues = {
    tight: '8px',
    normal: '16px',
    relaxed: '24px',
  };

  return (
    <div
      className={className}
      style={{
        marginBottom: spacingValues[spacing],
      }}
    >
      {children}
    </div>
  );
}

export function MedicalCardContent({ children, spacing = 'normal', className = '' }: CardSectionProps) {
  const spacingValues = {
    tight: '8px',
    normal: '16px',
    relaxed: '24px',
  };

  return (
    <div
      className={className}
      style={{
        marginBottom: spacingValues[spacing],
      }}
    >
      {children}
    </div>
  );
}

export function MedicalCardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: `1px solid ${colors.neutral[200]}`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * USAGE EXAMPLES:
 * 
 * Basic card:
 * <MedicalCard>
 *   <h3>Upcoming Appointment</h3>
 *   <p>Dr. Mwamba - March 15, 10:00 AM</p>
 * </MedicalCard>
 * 
 * Elevated card with sections:
 * <MedicalCard variant="elevated" padding="lg">
 *   <MedicalCardHeader>
 *     <h3>Health Record</h3>
 *   </MedicalCardHeader>
 *   <MedicalCardContent>
 *     <p>Blood Pressure: 120/80 mmHg</p>
 *   </MedicalCardContent>
 *   <MedicalCardFooter>
 *     <button>View Details</button>
 *   </MedicalCardFooter>
 * </MedicalCard>
 * 
 * Interactive card:
 * <MedicalCard interactive onClick={() => navigate('/appointment')}>
 *   <h4>Book New Appointment</h4>
 * </MedicalCard>
 */
