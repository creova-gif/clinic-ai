/**
 * KLINIKI - Modern Splash Screen
 * 
 * Beautiful animated splash screen
 * Inspired by: Modern mobile app launches
 * 
 * Features:
 * - Animated logo
 * - Gradient background
 * - Progress indicator
 * - Smooth transitions
 */

import { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';

const COLORS = {
  mint: '#5ECFB1',
  mintLight: '#E8F8F4',
  sky: '#61B5E8',
  skyLight: '#E3F2FD',
  purple: '#8B7FC8',
  white: '#FFFFFF',
  gray900: '#1A202C',
};

interface SplashModernProps {
  onComplete: () => void;
  duration?: number; // milliseconds
}

export default function SplashModern({ onComplete, duration = 3000 }: SplashModernProps) {
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    // Show logo after 200ms
    const logoTimer = setTimeout(() => setShowLogo(true), 200);
    
    // Show tagline after 800ms
    const taglineTimer = setTimeout(() => setShowTagline(true), 800);
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (duration / 50));
      });
    }, 50);
    
    // Complete after duration
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);
    
    return () => {
      clearTimeout(logoTimer);
      clearTimeout(taglineTimer);
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${COLORS.mintLight} 0%, ${COLORS.skyLight} 50%, ${COLORS.purple}20 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      zIndex: 9999,
    }}>
      {/* Animated Background Shapes */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: `${COLORS.mint}10`,
        top: '10%',
        left: '10%',
        animation: 'float 6s ease-in-out infinite',
      }} />
      
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: `${COLORS.sky}15`,
        bottom: '15%',
        right: '15%',
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '1s',
      }} />

      {/* Logo Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
      }}>
        {/* Logo Icon */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '32px',
          background: COLORS.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          opacity: showLogo ? 1 : 0,
          transform: showLogo ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-10deg)',
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <div style={{
            position: 'relative',
          }}>
            <Heart 
              size={56} 
              color={COLORS.mint} 
              fill={COLORS.mint}
              strokeWidth={2}
              style={{
                animation: 'heartbeat 1.5s ease-in-out infinite',
              }}
            />
            
            <Sparkles
              size={20}
              color={COLORS.sky}
              fill={COLORS.sky}
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                animation: 'sparkle 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* App Name */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          background: `linear-gradient(135deg, ${COLORS.mint} 0%, ${COLORS.sky} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 12px 0',
          opacity: showLogo ? 1 : 0,
          transform: showLogo ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease',
          transitionDelay: '0.2s',
        }}>
          Kliniki
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '16px',
          color: COLORS.gray900,
          margin: '0 0 40px 0',
          opacity: showTagline ? 1 : 0,
          transform: showTagline ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.6s ease',
          fontWeight: 500,
        }}>
          World-class care for Africa
        </p>

        {/* Progress Bar */}
        <div style={{
          width: '200px',
          height: '4px',
          background: `${COLORS.white}40`,
          borderRadius: '2px',
          margin: '0 auto',
          overflow: 'hidden',
          opacity: showTagline ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${COLORS.mint} 0%, ${COLORS.sky} 100%)`,
            borderRadius: '2px',
            width: `${progress}%`,
            transition: 'width 0.1s ease',
          }} />
        </div>

        {/* Loading Text */}
        <div style={{
          marginTop: '16px',
          fontSize: '13px',
          color: COLORS.gray900,
          opacity: showTagline ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          Loading...
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }
        
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          10%, 30% {
            transform: scale(0.9);
          }
          20%, 40%, 50% {
            transform: scale(1.1);
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
}
