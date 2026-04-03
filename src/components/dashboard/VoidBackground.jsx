import React, { useEffect } from 'react';
import { useTheme } from '@/components/shared/ThemeContext';

// Stable deterministic values - no Math.random() on render
const DARK_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  y: (i * 53 + 7) % 100,
  size: (i % 3) * 0.7 + 0.6,
  delay: (i * 1.3) % 8,
  duration: (i % 4) * 4 + 14,
}));

const LIGHT_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: (i * 43 + 20) % 100,
  y: (i * 67 + 15) % 100,
  size: (i % 3) * 0.6 + 0.5,
  delay: (i * 1.7) % 6,
  duration: (i % 4) * 3 + 12,
}));

const CSS_ANIMATIONS = `
  @keyframes voidFloat {
    0%, 100% { transform: translateY(0px); opacity: 0.3; }
    50% { transform: translateY(-18px); opacity: 0.85; }
  }
  @keyframes voidPulse {
    0%, 100% { opacity: 0.35; transform: translate(-50%, -50%) scale(0.92); }
    50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.08); }
  }
`;

export default function VoidBackground() {
  const { isDarkMode } = useTheme();
  // Prevent background from causing flicker by always having a base
  React.useEffect(() => {
    document.body.style.background = isDarkMode ? '#080808' : '#F5F5F7';
    document.documentElement.style.background = isDarkMode ? '#080808' : '#F5F5F7';
  }, [isDarkMode]);

  if (!isDarkMode) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <style>{CSS_ANIMATIONS}</style>
        {/* Ambient gold blobs — pure CSS, GPU-friendly */}
        {[
          { x: 20, y: 15, size: 320, delay: 0, duration: 14 },
          { x: 75, y: 30, size: 380, delay: 3, duration: 17 },
          { x: 45, y: 70, size: 300, delay: 6, duration: 13 },
        ].map((blob, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${blob.x}%`,
              top: `${blob.y}%`,
              width: blob.size,
              height: blob.size,
              background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.04) 50%, transparent 70%)',
              filter: 'blur(50px)',
              animation: `voidPulse ${blob.duration}s ease-in-out ${blob.delay}s infinite`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
        {/* Bronze star particles */}
        {LIGHT_PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: 'rgba(156,126,70,0.85)',
              boxShadow: `0 0 ${p.size * 3}px rgba(156,126,70,0.5)`,
              animation: `voidFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none void-bg-container">
      <style>{CSS_ANIMATIONS}</style>
      {/* Base void gradient */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(25,25,25,1) 0%, #080808 100%)' }}
      />
      {/* Ambient depth blobs — reduced blur for performance */}
      {[
        { x: 30, y: 20, size: 500, delay: 0, duration: 12 },
        { x: 70, y: 60, size: 600, delay: 4, duration: 15 },
        { x: 50, y: 85, size: 400, delay: 7, duration: 13 },
      ].map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            width: blob.size,
            height: blob.size,
            background: 'radial-gradient(circle, rgba(40,40,40,0.35) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: `voidPulse ${blob.duration}s ease-in-out ${blob.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
      {/* Star particles — reduced count and simpler shadows */}
      {DARK_PARTICLES.slice(0, 10).map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: 'rgba(255,255,255,0.75)',
            boxShadow: `0 0 ${p.size * 3}px rgba(255,255,255,0.3)`,
            animation: `voidFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}