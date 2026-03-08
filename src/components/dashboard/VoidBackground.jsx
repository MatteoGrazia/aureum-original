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

const LIGHT_BREACHES = [
  { x: 12,  y: 8,  size: 420, delay: 0,   duration: 14 },
  { x: 80,  y: 12, size: 360, delay: 3.5, duration: 16 },
  { x: 55,  y: 55, size: 480, delay: 7,   duration: 13 },
  { x: 85,  y: 78, size: 300, delay: 2,   duration: 17 },
  { x: 5,   y: 72, size: 340, delay: 5,   duration: 12 },
];

import { useTheme } from '@/components/shared/ThemeContext';

export default function VoidBackground() {
  const { isDarkMode } = useTheme();

  if (!isDarkMode) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {LIGHT_BREACHES.map((breach, i) => (
          <motion.div
            key={`breach-${i}`}
            className="absolute"
            style={{
              left: `${breach.x}%`,
              top: `${breach.y}%`,
              width: breach.size,
              height: breach.size,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ opacity: [0.55, 0.85, 0.55], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: breach.duration, repeat: Infinity, ease: 'easeInOut', delay: breach.delay }}
          >
            {/* Darker inner core — the "breach" */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%,
                  rgba(160, 110, 20, 0.22) 0%,
                  rgba(180, 130, 30, 0.14) 18%,
                  rgba(212, 175, 55, 0.10) 35%,
                  rgba(244, 208, 63, 0.05) 55%,
                  transparent 72%)`,
                filter: 'blur(36px)',
                borderRadius: '50%',
              }}
            />
            {/* Outer golden halo glow */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%,
                  transparent 30%,
                  rgba(225, 193, 110, 0.07) 50%,
                  rgba(212, 175, 55, 0.04) 65%,
                  transparent 80%)`,
                filter: 'blur(50px)',
                borderRadius: '50%',
              }}
            />
          </motion.div>
        ))}
        {/* Subtle golden grain noise */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            mixBlendMode: 'multiply',
          }}
        />
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