import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface HealthScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  label?: string;
  sublabel?: string;
}

function scoreColor(score: number, max: number) {
  const pct = score / max;
  if (pct >= 0.8) return '#10b981';
  if (pct >= 0.6) return '#f59e0b';
  return '#ef4444';
}

export function HealthScoreRing({
  score,
  maxScore = 100,
  size = 120,
  label,
  sublabel,
}: HealthScoreRingProps) {
  const [displayed, setDisplayed] = useState(0);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / maxScore, 1);
  const stroke = scoreColor(score, maxScore);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 800;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * score));
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const offset = circumference * (1 - pct);

  return (
    <div
      className="flex flex-col items-center gap-1"
      aria-label={`Alama ya afya: ${score} kati ya ${maxScore}`}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={8}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <text
          x={size / 2}
          y={size / 2 + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={size * 0.28}
          fontWeight={900}
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px`, fontVariantNumeric: 'tabular-nums' }}
        >
          {displayed}
        </text>
      </svg>
      {label && <p className="text-xs font-semibold text-white/80">{label}</p>}
      {sublabel && <p className="text-xs text-white/60">{sublabel}</p>}
    </div>
  );
}
