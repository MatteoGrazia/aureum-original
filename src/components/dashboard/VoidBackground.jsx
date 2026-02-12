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

      {/* Distant gold sun */}
      <motion.div
        className="absolute"
        style={{
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 40%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        animate={{
          opacity: [0.6, 0.8, 0.6],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Sun light rays */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 1200px 800px at 50% 15%, rgba(212, 175, 55, 0.03) 0%, transparent 60%)'
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

      {/* Distant gold suns */}
      <motion.div
        className="absolute"
        style={{
          top: '25%',
          right: '15%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.04) 50%, transparent 70%)',
          filter: 'blur(60px)'
        }}
        animate={{
          opacity: [0.4, 0.6, 0.4],
          scale: [1, 1.15, 1]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <motion.div
        className="absolute"
        style={{
          bottom: '30%',
          left: '10%',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 208, 63, 0.1) 0%, rgba(212, 175, 55, 0.03) 50%, transparent 70%)',
          filter: 'blur(50px)'
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
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