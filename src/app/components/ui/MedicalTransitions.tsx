/**
 * Medical-Grade Transitions
 * 
 * PRINCIPLES:
 * - Minimal motion
 * - Forward: slide in from right
 * - Back: slide out to right
 * - Confirmations: fade
 * - Errors: inline, not modal
 * - Emergencies: full-screen, static (NO MOTION)
 * - Max duration: 300ms
 * 
 * Based on: iOS Health, Material Design (reduced motion)
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MOTION_DURATION_S,
  MOTION_EASING,
  MOTION_OPACITY,
  MOTION_SLIDE,
  NAV_FORWARD,
  NAV_BACK,
  MODAL_SLIDE_UP,
  FADE,
  BACKDROP,
  LIST_ITEM,
  COLLAPSE,
  EMERGENCY,
  prefersReducedMotion,
} from '@/app/styles/motion-tokens';

// Standard transition durations (max 300ms)
export const TRANSITION_DURATION = {
  fast: 0.15, // 150ms - button press, hover
  standard: 0.2, // 200ms - navigation, slide
  slow: 0.25, // 250ms - page transitions
};

// Easing curves (medical-grade, no bounce)
export const EASING: Record<string, [number, number, number, number]> = {
  standard: [0.4, 0.0, 0.2, 1], // Standard Material easing
  decelerate: [0.0, 0.0, 0.2, 1], // Decelerate
  accelerate: [0.4, 0.0, 1, 1], // Accelerate
};

interface SlideTransitionProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  show: boolean;
}

// Slide transition (for navigation)
export const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  direction = 'right',
  show,
}) => {
  const variants = {
    left: {
      initial: { x: '-100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-100%', opacity: 0 },
    },
    right: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '100%', opacity: 0 },
    },
    up: {
      initial: { y: '-100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '-100%', opacity: 0 },
    },
    down: {
      initial: { y: '100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '100%', opacity: 0 },
    },
  };

  const variant = variants[direction];

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={variant.initial}
          animate={variant.animate}
          exit={variant.exit}
          transition={{
            duration: TRANSITION_DURATION.standard,
            ease: EASING.standard,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface FadeTransitionProps {
  children: React.ReactNode;
  show: boolean;
  duration?: number;
}

// Fade transition (for confirmations, modals)
export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  show,
  duration = TRANSITION_DURATION.standard,
}) => (
  <AnimatePresence mode="wait">
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration,
          ease: EASING.standard,
        }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

interface ScaleTransitionProps {
  children: React.ReactNode;
  show: boolean;
}

// Subtle scale (for tooltips, popovers)
export const ScaleTransition: React.FC<ScaleTransitionProps> = ({
  children,
  show,
}) => (
  <AnimatePresence mode="wait">
    {show && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration: TRANSITION_DURATION.fast,
          ease: EASING.decelerate,
        }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

interface PageTransitionProps {
  children: React.ReactNode;
  direction: 'forward' | 'back';
}

// Page transition (main navigation)
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction,
}) => {
  const reducedMotion = prefersReducedMotion();
  
  if (reducedMotion) {
    // No animation in reduced motion mode
    return <>{children}</>;
  }

  const variant = direction === 'forward' ? NAV_FORWARD : NAV_BACK;

  return (
    <motion.div
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={variant.transition}
    >
      {children}
    </motion.div>
  );
};

interface EmergencyScreenProps {
  children: React.ReactNode;
  show: boolean;
}

// Emergency screen (full-screen, static, NO ANIMATION)
export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({
  children,
  show,
}) => {
  if (!show) return null;

  // NO animation for emergencies - immediate display
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-white"
      {...EMERGENCY}
    >
      {children}
    </motion.div>
  );
};

interface BottomSheetProps {
  children: React.ReactNode;
  show: boolean;
  onClose: () => void;
}

// Bottom sheet (slide up from bottom)
export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  show,
  onClose,
}) => (
  <AnimatePresence>
    {show && (
      <>
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: TRANSITION_DURATION.fast }}
          onClick={onClose}
        />
        
        {/* Sheet */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{
            duration: TRANSITION_DURATION.standard,
            ease: EASING.decelerate,
          }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>
          
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

interface ListItemTransitionProps {
  children: React.ReactNode;
  delay?: number;
}

// Staggered list animation (subtle)
export const ListItemTransition: React.FC<ListItemTransitionProps> = ({
  children,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: TRANSITION_DURATION.fast,
      delay,
      ease: EASING.decelerate,
    }}
  >
    {children}
  </motion.div>
);

// Collapse/Expand (for accordion, dropdowns)
interface CollapseTransitionProps {
  children: React.ReactNode;
  show: boolean;
}

export const CollapseTransition: React.FC<CollapseTransitionProps> = ({
  children,
  show,
}) => (
  <AnimatePresence initial={false}>
    {show && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{
          duration: TRANSITION_DURATION.standard,
          ease: EASING.standard,
        }}
        style={{ overflow: 'hidden' }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// Utility: Reduced motion preference check
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};