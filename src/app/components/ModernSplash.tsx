/**
 * ModernSplash — cinematic 4-second splash screen
 * Inspired by OpenAI + Neko Health + African fintech (NALA)
 * Brand: CREOVA Medical / Clinic AI
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Shield, CheckCircle2, WifiOff } from 'lucide-react';

interface ModernSplashProps {
  onComplete: () => void;
}

// EKG path data — a single heartbeat trace drawn across the screen
const EKG_PATH =
  'M0,50 L60,50 L80,50 L90,20 L100,80 L110,10 L120,70 L130,50 L150,50 L200,50 L260,50 L280,50 L290,25 L300,75 L310,15 L320,65 L330,50 L350,50 L400,50';

export function ModernSplash({ onComplete }: ModernSplashProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'orbs' | 'ekg' | 'brand' | 'badges' | 'complete'>('orbs');
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(400);

  // Measure SVG path length after mount
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  // Drive phase transitions
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase('ekg'), 400));
    timers.push(setTimeout(() => setPhase('brand'), 1000));
    timers.push(setTimeout(() => setPhase('badges'), 1800));
    timers.push(setTimeout(() => setPhase('complete'), 3800));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Progress bar — fills over 4 seconds
  useEffect(() => {
    const DURATION = 4000;
    const TICK = 40;
    const step = (TICK / DURATION) * 100;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          return 100;
        }
        return Math.min(p + step, 100);
      });
    }, TICK);
    return () => clearInterval(id);
  }, []);

  // Fire onComplete when phase reaches 'complete'
  useEffect(() => {
    if (phase === 'complete') {
      const t = setTimeout(onComplete, 200);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  const showBrand = phase === 'brand' || phase === 'badges' || phase === 'complete';
  const showBadges = phase === 'badges' || phase === 'complete';

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: '#0f172a' }}
      aria-label="Loading CREOVA Medical"
      role="status"
    >
      {/* ── Animated gradient orbs ── */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(13,148,136,0.35) 0%, transparent 70%)',
          top: '-120px',
          right: '-100px',
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(13,148,136,0.2) 0%, transparent 70%)',
          bottom: '-80px',
          left: '-120px',
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
      />
      {/* Subtle second orb — mid-left */}
      <motion.div
        className="absolute w-[280px] h-[280px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)',
          top: '40%',
          left: '5%',
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── EKG heartbeat line ── */}
      <div className="absolute inset-x-0 top-[38%] flex items-center justify-center pointer-events-none">
        <svg
          viewBox="0 0 400 100"
          className="w-full max-w-[420px] h-20 opacity-60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Glow duplicate */}
          <motion.path
            ref={pathRef}
            d={EKG_PATH}
            fill="none"
            stroke="#0d9488"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#ekgGlow)"
            initial={{ strokeDasharray: pathLength, strokeDashoffset: pathLength, opacity: 0 }}
            animate={
              phase !== 'orbs'
                ? { strokeDashoffset: 0, opacity: 1 }
                : { strokeDashoffset: pathLength, opacity: 0 }
            }
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          />
          <motion.path
            d={EKG_PATH}
            fill="none"
            stroke="#5eead4"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ strokeDasharray: pathLength, strokeDashoffset: pathLength, opacity: 0 }}
            animate={
              phase !== 'orbs'
                ? { strokeDashoffset: 0, opacity: 0.7 }
                : { strokeDashoffset: pathLength, opacity: 0 }
            }
            transition={{ duration: 1.1, delay: 0.05, ease: 'easeInOut' }}
          />
          <defs>
            <filter id="ekgGlow" x="-20%" y="-80%" width="140%" height="260%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* ── Logo + wordmark ── */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Pulsing heart logo */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Outer pulse ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: '-14px',
              background: 'rgba(13,148,136,0.15)',
              border: '1px solid rgba(13,148,136,0.3)',
            }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.1, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Inner pulse ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: '-6px',
              background: 'rgba(13,148,136,0.2)',
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0.2, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          {/* Logo circle */}
          <div
            className="relative z-10 w-[88px] h-[88px] rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 60%, #0a5f5a 100%)',
              boxShadow: '0 0 40px rgba(13,148,136,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {/* Heartbeat cross / plus shape with pulse */}
            <motion.svg
              viewBox="0 0 40 40"
              className="w-11 h-11"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
              aria-hidden="true"
            >
              {/* Heart shape */}
              <path
                d="M20 34 C20 34 5 24 5 14 C5 9 9 5 14 5 C17 5 19.5 6.5 20 8 C20.5 6.5 23 5 26 5 C31 5 35 9 35 14 C35 24 20 34 20 34Z"
                fill="white"
                opacity="0.95"
              />
              {/* Small EKG line inside heart */}
              <path
                d="M11 16 L14 16 L16 12 L18 20 L20 14 L22 18 L24 16 L29 16"
                fill="none"
                stroke="#0d9488"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </div>
        </motion.div>

        {/* CREOVA wordmark */}
        <motion.div
          className="text-center mb-6"
          initial={{ y: 16, opacity: 0 }}
          animate={showBrand ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
        >
          <h1
            className="text-5xl font-black tracking-[0.18em] text-white"
            style={{ letterSpacing: '0.2em', textShadow: '0 0 40px rgba(13,148,136,0.4)' }}
          >
            CREOVA
          </h1>
          <motion.p
            className="text-base font-semibold tracking-[0.35em] uppercase mt-1"
            style={{ color: '#5eead4' }}
            initial={{ opacity: 0 }}
            animate={showBrand ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Medical
          </motion.p>
          {/* "Powered by AI" glow line */}
          <motion.p
            className="text-xs mt-3 tracking-widest uppercase"
            style={{ color: 'rgba(94,234,212,0.6)' }}
            initial={{ opacity: 0 }}
            animate={showBrand ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <span
              style={{
                textShadow: '0 0 12px rgba(13,148,136,0.8)',
              }}
            >
              ✦ Powered by AI ✦
            </span>
          </motion.p>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-10 px-6"
          initial={{ y: 12, opacity: 0 }}
          animate={showBadges ? { y: 0, opacity: 1 } : { y: 12, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}
        >
          <TrustBadge icon={<Shield className="w-3.5 h-3.5" />} text="Ministry of Health Tanzania" />
          <TrustBadge icon={<CheckCircle2 className="w-3.5 h-3.5" />} text="TMDA Certified" />
          <TrustBadge icon={<WifiOff className="w-3.5 h-3.5" />} text="Offline Ready" />
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="w-56"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="h-[3px] rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0d9488 0%, #5eead4 100%)',
                boxShadow: '0 0 8px rgba(13,148,136,0.7)',
              }}
              transition={{ duration: 0.04, ease: 'linear' }}
            />
          </div>
          <motion.p
            className="text-[10px] text-center mt-2.5 tracking-widest uppercase"
            style={{ color: 'rgba(148,163,184,0.7)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Initializing secure connection…
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        background: 'rgba(13,148,136,0.12)',
        border: '1px solid rgba(13,148,136,0.3)',
        color: '#5eead4',
      }}
    >
      <span style={{ color: '#0d9488' }}>{icon}</span>
      {text}
    </div>
  );
}
