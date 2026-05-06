import { useEffect } from 'react';
import canvasConfetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  trigger: boolean;
  onDone?: () => void;
}

export function ConfettiCelebration({ trigger, onDone }: ConfettiCelebrationProps) {
  useEffect(() => {
    if (!trigger) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      onDone?.();
      return;
    }

    canvasConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#f97316', '#10b981', '#f59e0b', '#ec4899'],
    });

    const t = setTimeout(() => onDone?.(), 1200);
    return () => clearTimeout(t);
  }, [trigger, onDone]);

  return null;
}
