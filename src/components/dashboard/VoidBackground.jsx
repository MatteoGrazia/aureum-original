import React from 'react';
import { motion } from 'framer-motion';

// Generate once at module level so particles never re-randomize on re-render
const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  duration: Math.random() * 20 + 15,
  delay: Math.random() * 5
}));

const GOLD_ORBS = Array.from({ length: 38 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.8,
  duration: Math.random() * 18 + 12,
  delay: Math.random() * 8,
  opacity: Math.random() * 0.4 + 0.2,
}));

const GOLD_BLOOMS = [
  { x: 20, y: 15, size: 180, delay: 0, duration: 14 },
  { x: 78, y: 25, size: 220, delay: 3, duration: 17 },
  { x: 45, y: 65, size: 160, delay: 6, duration: 13 },
  { x: 88, y: 72, size: 140, delay: 1.5, duration: 15 },
  { x: 12, y: 80, size: 170, delay: 4, duration: 16 },
];

import { useTheme } from '@/components/shared/ThemeContext';

export default function VoidBackground() {
  const { isDarkMode } = useTheme();

  if (!isDarkMode) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Soft golden ambient blooms */}
        {GOLD_BLOOMS.map((bloom, i) => (
          <motion.div
            key={`bloom-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${bloom.x}%`,
              top: `${bloom.y}%`,
              width: bloom.size,
              height: bloom.size,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.05) 40%, transparent 70%)',
              filter: 'blur(30px)',
            }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: bloom.duration, repeat: Infinity, ease: 'easeInOut', delay: bloom.delay }}
          />
        ))}

        {/* Tiny bronze star particles */}
        {GOLD_ORBS.map((orb) => (
          <motion.div
            key={orb.id}
            className="absolute rounded-full"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.size,
              height: orb.size,
              background: 'rgba(156,126,70,0.85)',
              boxShadow: `0 0 ${orb.size * 3}px rgba(156,126,70,0.5), 0 0 ${orb.size}px rgba(156,126,70,0.7)`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [orb.opacity * 0.3, orb.opacity * 0.75, orb.opacity * 0.3],
              scale: [0.6, 1.3, 0.6],
            }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
          />
        ))}

        {/* Large illuminating bronze stars */}
        {[
          { x: 15, y: 25, size: 80, delay: 0,   duration: 12 },
          { x: 75, y: 15, size: 100, delay: 2,   duration: 14 },
          { x: 40, y: 60, size: 90,  delay: 4,   duration: 13 },
          { x: 85, y: 70, size: 75,  delay: 1,   duration: 11 },
          { x: 25, y: 80, size: 85,  delay: 3,   duration: 15 },
        ].map((star, i) => (
          <motion.div
            key={`light-star-${i}`}
            className="absolute"
            style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size, pointerEvents: 'none' }}
            animate={{ opacity: [0.3, 0.65, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: star.duration, repeat: Infinity, ease: 'easeInOut', delay: star.delay }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
              style={{ background: 'rgba(156,126,70,0.9)', boxShadow: '0 0 4px rgba(156,126,70,1)' }} />
            <div className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle, rgba(156,126,70,0.18) 0%, rgba(156,126,70,0.08) 30%, rgba(156,126,70,0.03) 50%, transparent 70%)',
                filter: 'blur(18px)',
              }} />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none void-bg-container">
      {/* Base void gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(25, 25, 25, 1) 0%, #080808 100%)'
        }}
      />



      {/* Animated depth layers */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 800px 600px at 30% 20%, rgba(40, 40, 40, 0.3) 0%, transparent 60%)'
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 1000px 700px at 70% 60%, rgba(35, 35, 35, 0.25) 0%, transparent 60%)'
        }}
        animate={{
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />



      {/* Floating star particles */}
      {PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.6), 0 0 3px rgba(255, 255, 255, 0.9)'
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.6, 1.2, 0.6]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay
          }}
        />
      ))}

      {/* Large illuminating stars with localized glow */}
      {[
        { x: 15, y: 25, size: 80, delay: 0, duration: 12 },
        { x: 75, y: 15, size: 100, delay: 2, duration: 14 },
        { x: 40, y: 60, size: 90, delay: 4, duration: 13 },
        { x: 85, y: 70, size: 75, delay: 1, duration: 11 },
        { x: 25, y: 80, size: 85, delay: 3, duration: 15 }
      ].map((star, i) => (
        <motion.div
          key={`big-star-${i}`}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            pointerEvents: 'none'
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay
          }}
        >
          {/* Core star light */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 0 4px rgba(255, 255, 255, 1)'
            }}
          />
          {/* Localized illumination glow */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0.03) 50%, transparent 70%)',
              filter: 'blur(20px)'
            }}
          />
        </motion.div>
      ))}

      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
}