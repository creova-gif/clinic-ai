/**
 * AfyaCare Tanzania Design System - Design Tokens
 * 
 * These tokens define the visual language of the platform:
 * - Colors (semantic meanings)
 * - Typography (hierarchy and accessibility)
 * - Spacing (consistency)
 * - Shadows (depth perception)
 * - Border radius (soft institutional feel)
 * 
 * Based on Phase 2 UX audit findings:
 * - Institutional feel over consumer app patterns
 * - Accessible color contrast (WCAG AA)
 * - Multi-modal urgency indicators
 * - Clear visual hierarchy
 */

// ============================================
// COLOR SYSTEM
// ============================================

export const colors = {
  // PRIMARY - Clinical Blue (trust, professionalism)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    500: '#1E88E5', // Main primary color
    600: '#1976D2',
    700: '#1565C0',
  },

  // SUCCESS - Medical Green (safe, healthy)
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    900: '#065F46',
  },

  // WARNING - Caution Yellow (attention, not alarm)
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FED7AA',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
  },

  // DANGER - Urgent Red (critical, action required)
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    900: '#991B1B',
  },

  // NEUTRAL - Institutional Grays
  neutral: {
    50: '#FAFBFC',  // Background (very subtle)
    100: '#F7F9FB', // Card backgrounds
    200: '#F3F4F6', // Disabled states
    300: '#E5E7EB', // Borders
    400: '#D1D5DB', // Hover borders
    500: '#9CA3AF', // Secondary text
    600: '#6B7280', // Body text
    700: '#4B5563', // Headings
    800: '#374151', // Strong emphasis
    900: '#1A1D23', // Primary text (near black)
  },

  // SEMANTIC COLORS - Meaningful context
  semantic: {
    // Urgency levels (multi-modal: background + border + icon + text)
    urgent: {
      bg: '#FEF2F2',
      border: '#FCA5A5',
      text: '#DC2626',
      icon: '#DC2626',
    },
    warning: {
      bg: '#FFFBEB',
      border: '#FED7AA',
      text: '#F59E0B',
      icon: '#F59E0B',
    },
    success: {
      bg: '#ECFDF5',
      border: '#A7F3D0',
      text: '#10B981',
      icon: '#10B981',
    },
    info: {
      bg: '#EFF6FF',
      border: '#DBEAFE',
      text: '#1E88E5',
      icon: '#1E88E5',
    },

    // Care journey categories
    clinical: {
      bg: '#EFF6FF',
      text: '#1E88E5',
    },
    maternal: {
      bg: '#FDF2F8',
      text: '#EC4899',
    },
    chronic: {
      bg: '#F5F3FF',
      text: '#8B5CF6',
    },
    medication: {
      bg: '#ECFDF5',
      text: '#10B981',
    },
  },

  // SPECIAL - Context-specific colors
  special: {
    // Shared device warning
    sharedDevice: {
      bg: '#FEF2F2',
      border: '#FCA5A5',
      text: '#991B1B',
    },
    // Emergency
    emergency: {
      bg: '#DC2626',
      text: '#FFFFFF',
    },
    // Privacy/Security
    privacy: {
      bg: '#ECFDF5',
      border: '#A7F3D0',
      text: '#065F46',
    },
  },
};

// ============================================
// TYPOGRAPHY SYSTEM
// ============================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
  },

  // Font Sizes (rem-based for accessibility)
  fontSize: {
    xs: '0.75rem',    // 12px - Captions, helper text
    sm: '0.875rem',   // 14px - Secondary text
    base: '1rem',     // 16px - Body text (default)
    lg: '1.125rem',   // 18px - Large body
    xl: '1.25rem',    // 20px - Section headings
    '2xl': '1.5rem',  // 24px - Page titles
    '3xl': '1.875rem', // 30px - Large titles (rarely used)
  },

  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights (unitless for scalability)
  lineHeight: {
    tight: 1.25,   // Headings
    normal: 1.5,   // Body text
    relaxed: 1.625, // Long-form content
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em', // All-caps labels
  },
};

// ============================================
// SPACING SYSTEM
// ============================================

export const spacing = {
  // Base unit: 0.25rem (4px)
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px

  // Semantic spacing (common patterns)
  section: '1.5rem',     // 24px - Between major sections
  card: '1rem',          // 16px - Card padding
  inlineGap: '0.75rem',  // 12px - Gap between inline elements
  stackGap: '0.75rem',   // 12px - Gap between stacked elements
};

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  none: '0',
  sm: '0.375rem',   // 6px - Small buttons
  md: '0.5rem',     // 8px - Default (cards, inputs)
  lg: '0.75rem',    // 12px - Large cards
  xl: '1rem',       // 16px - Prominent cards
  '2xl': '1.5rem',  // 24px - Hero sections
  full: '9999px',   // Pills, avatars
};

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  // Subtle depth
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  
  // Default card shadow
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  
  // Hover state
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  
  // Modal / Dialog
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  
  // Urgent/Critical elements
  urgent: '0 4px 8px rgba(220, 38, 38, 0.15)',
  
  // No shadow
  none: 'none',
};

// ============================================
// Z-INDEX LAYERS
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// ============================================
// BREAKPOINTS (Mobile-first)
// ============================================

export const breakpoints = {
  sm: '640px',   // Small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px', // Large desktops
};

// ============================================
// ANIMATION / TRANSITIONS
// ============================================

export const transitions = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },

  // Easing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ============================================
// ACCESSIBILITY
// ============================================

export const accessibility = {
  // Minimum touch target size (WHO/WCAG guidelines)
  minTouchTarget: '44px',

  // Focus ring (keyboard navigation)
  focusRing: {
    width: '2px',
    color: colors.primary[500],
    offset: '2px',
  },

  // Motion preferences
  reducedMotion: {
    duration: '0.01ms', // Essentially instant
    easing: 'linear',
  },
};

// ============================================
// COMPONENT-SPECIFIC TOKENS
// ============================================

export const components = {
  // Buttons
  button: {
    height: {
      sm: '2rem',    // 32px
      md: '2.5rem',  // 40px
      lg: '3rem',    // 48px
    },
    padding: {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
    },
  },

  // Cards
  card: {
    padding: spacing.card,
    borderWidth: '1px',
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.xl,
    background: '#FFFFFF',
  },

  // Section Headers (uppercase labels)
  sectionHeader: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[600],
    textTransform: 'uppercase' as const,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[3],
  },

  // Status Badges
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
};

// ============================================
// EXPORTED THEME OBJECT
// ============================================

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  transitions,
  accessibility,
  components,
};

// Type export for TypeScript users
export type Theme = typeof theme;
