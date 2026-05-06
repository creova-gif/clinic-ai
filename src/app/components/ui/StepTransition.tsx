import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StepTransitionProps {
  stepKey: string | number;
  children: React.ReactNode;
  direction?: 'forward' | 'backward';
}

export function StepTransition({ stepKey, children, direction = 'forward' }: StepTransitionProps) {
  const xEnter = direction === 'forward' ? '100%' : '-100%';
  const xExit  = direction === 'forward' ? '-100%' : '100%';

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stepKey}
        initial={{ x: xEnter, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: xExit, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
