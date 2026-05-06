/**
 * NationalSplash — Premium AfyaCare Splash Screen
 * Redesign: 2026 — deep animated gradient, crisp branding, fluid reveal
 */

import React, { useEffect, useState } from 'react';

interface NationalSplashProps {
  onComplete: () => void;
}

export function NationalSplash({ onComplete }: NationalSplashProps) {
  const [phase, setPhase] = useState<'logo' | 'text' | 'done'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 400);
    const t2 = setTimeout(() => setPhase('done'), 900);
    const t3 = setTimeout(onComplete, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className="afya-splash">
      <div className="afya-splash__bg" />

      {/* Floating orbs */}
      <div className="afya-splash__orb afya-splash__orb--1" />
      <div className="afya-splash__orb afya-splash__orb--2" />
      <div className="afya-splash__orb afya-splash__orb--3" />

      <div className="afya-splash__content">
        {/* Cross / Shield icon */}
        <div
          className={`afya-splash__icon${phase !== 'logo' ? ' afya-splash__icon--visible' : ''}`}
          aria-hidden="true"
        >
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="22" y="6" width="12" height="44" rx="4" fill="white" fillOpacity="0.95" />
            <rect x="6" y="22" width="44" height="12" rx="4" fill="white" fillOpacity="0.95" />
          </svg>
        </div>

        <div className={`afya-splash__text${phase === 'text' || phase === 'done' ? ' afya-splash__text--visible' : ''}`}>
          <h1 className="afya-splash__title">AfyaCare</h1>
          <p className="afya-splash__subtitle">Tanzania</p>
        </div>

        <div className={`afya-splash__gov${phase === 'done' ? ' afya-splash__gov--visible' : ''}`}>
          <span className="afya-splash__gov-text">Ministry of Health · Wizara ya Afya</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`afya-splash__bar${phase === 'done' ? ' afya-splash__bar--visible' : ''}`} />
    </div>
  );
}