import React from 'react';
import { motion } from 'framer-motion';

export default function ChronosOrbital({ calories, caloriesGoal, steps, stepsGoal, volume, volumeGoal }) {
  const orbitals = [
    { 
      value: calories, 
      goal: caloriesGoal, 
      color: '#D4AF37', 
      size: 240,
      offset: { x: -8, y: -8 },
      rotation: 0
    },
    { 
      value: steps, 
      goal: stepsGoal, 
      color: '#C0C0C0', 
      size: 180,
      offset: { x: 5, y: -5 },
      rotation: 45
    },
    { 
      value: volume, 
      goal: volumeGoal, 
      color: '#CD7F32', 
      size: 120,
      offset: { x: -3, y: 3 },
      rotation: -30
    }
  ];

  const totalProgress = Math.min((calories / caloriesGoal * 100 + steps / stepsGoal * 100 + volume / volumeGoal * 100) / 3, 100);

  return (
    <div className="relative flex items-center justify-center h-72">


      {/* Orbital rings */}
      {orbitals.map((orbital, index) => {
        const progress = Math.min(orbital.value / orbital.goal * 100, 100);
        const circumference = orbital.size * Math.PI;
        const strokeDashoffset = circumference - (progress / 100 * circumference);

        return (
          <div
            key={index}
            className="absolute"
            style={{
              width: orbital.size,
              height: orbital.size,
              transform: `translate(${orbital.offset.x}px, ${orbital.offset.y}px) rotate(${orbital.rotation}deg)`
            }}
          >
            {/* Base orbital path */}
            <svg
              className="w-full h-full"
              style={{ transform: 'rotate(-90deg)' }}
              viewBox={`0 0 ${orbital.size} ${orbital.size}`}
            >
              <defs>
                <linearGradient id={`pulse-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={orbital.color} stopOpacity="0.1" />
                  <stop offset="50%" stopColor={orbital.color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={orbital.color} stopOpacity="1">
                    <animate
                      attributeName="stop-opacity"
                      values="1;0.3;1"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </stop>
                </linearGradient>
              </defs>

              {/* Background thread */}
              <circle
                cx={orbital.size / 2}
                cy={orbital.size / 2}
                r={(orbital.size - 4) / 2}
                fill="none"
                stroke={orbital.color}
                strokeWidth="1"
                opacity="0.08"
              />

              {/* Glow layers - follow ring shape */}
              <motion.circle
                cx={orbital.size / 2}
                cy={orbital.size / 2}
                r={(orbital.size - 4) / 2}
                fill="none"
                stroke={orbital.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 2, ease: "easeOut", delay: index * 0.15 }}
                opacity="0.15"
                style={{ filter: 'blur(8px)' }}
              />
              <motion.circle
                cx={orbital.size / 2}
                cy={orbital.size / 2}
                r={(orbital.size - 4) / 2}
                fill="none"
                stroke={orbital.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 2, ease: "easeOut", delay: index * 0.15 }}
                opacity="0.3"
                style={{ filter: 'blur(4px)' }}
              />

              {/* Progress thread */}
              <motion.circle
                cx={orbital.size / 2}
                cy={orbital.size / 2}
                r={(orbital.size - 4) / 2}
                fill="none"
                stroke={`url(#pulse-${index})`}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 2, ease: "easeOut", delay: index * 0.15 }}
              />
            </svg>
          </div>
        );
      })}
      
      {/* Center percentage */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="absolute text-center z-10 px-16"
      >
        <p 
          className="text-[#F4D03F] mb-2 text-5xl tracking-wider" 
          style={{ fontWeight: 500, fontFamily: 'Montserrat, sans-serif' }}
        >
          {Math.round(totalProgress)}
        </p>
        <p 
          className="text-[10px] text-white/40 uppercase tracking-[0.35em]"
          style={{ fontWeight: 400, fontFamily: 'Montserrat, sans-serif' }}
        >
          Complete
        </p>
      </motion.div>

      {/* Orbital legend - minimal */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-8">
        {orbitals.map((orbital, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div 
              className="w-1 h-1 rounded-full" 
              style={{ 
                backgroundColor: orbital.color,
                boxShadow: `0 0 8px ${orbital.color}60`
              }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}