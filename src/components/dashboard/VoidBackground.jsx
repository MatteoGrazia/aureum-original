import React from 'react';
import { motion } from 'framer-motion';

export default function VoidBackground() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
      {particles.map((particle) => (
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