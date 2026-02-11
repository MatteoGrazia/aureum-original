import React from 'react';
import { motion } from 'framer-motion';

export default function ChronosOrbital({ calories, caloriesGoal, steps, stepsGoal, volume, volumeGoal }) {
  const rings = [
    { value: calories, goal: caloriesGoal, color: '#D4AF37', size: 200, offset: { x: 8, y: -5 } },
    { value: steps, goal: stepsGoal, color: '#C0C0C0', size: 155, offset: { x: -6, y: 4 } },
    { value: volume, goal: volumeGoal, color: '#CD7F32', size: 110, offset: { x: 3, y: -2 } }
  ];

  return (
    <div className="relative flex items-center justify-center h-64">
      {/* Ambient glow backdrop */}
      <div className="absolute inset-0 bg-gradient-radial from-[#D4AF37]/5 via-transparent to-transparent opacity-30 animate-pulse" style={{ animationDuration: '8s' }} />
      
      {rings.map((ring, index) => {
        const progress = Math.min((ring.value / ring.goal) * 100, 100);
        const circumference = ring.size * Math.PI;
        const strokeDashoffset = circumference - (progress / 100) * circumference;
        const rotation = (progress / 100) * 360;

        return (
          <div
            key={index}
            className="absolute"
            style={{
              width: ring.size,
              height: ring.size,
              transform: `translate(${ring.offset.x}px, ${ring.offset.y}px)`
            }}
          >
            <svg
              className="w-full h-full -rotate-90"
              viewBox={`0 0 ${ring.size} ${ring.size}`}
              style={{ filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.3))' }}
            >
              {/* Background orbital thread */}
              <circle
                cx={ring.size / 2}
                cy={ring.size / 2}
                r={(ring.size - 2) / 2}
                fill="none"
                stroke={`${ring.color}15`}
                strokeWidth="1"
              />
              
              {/* Progress orbital with pulse gradient */}
              <motion.circle
                cx={ring.size / 2}
                cy={ring.size / 2}
                r={(ring.size - 2) / 2}
                fill="none"
                stroke={`url(#pulseGradient${index})`}
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 2, ease: "easeOut", delay: index * 0.15 }}
              />
              
              {/* Glowing leading edge */}
              <motion.circle
                cx={ring.size / 2 + ((ring.size - 2) / 2) * Math.cos((rotation - 90) * Math.PI / 180)}
                cy={ring.size / 2 + ((ring.size - 2) / 2) * Math.sin((rotation - 90) * Math.PI / 180)}
                r="2"
                fill={ring.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.15 }}
                style={{ filter: `drop-shadow(0 0 8px ${ring.color})` }}
              />
              
              <defs>
                <linearGradient id={`pulseGradient${index}`} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={ring.color} stopOpacity="0.3" />
                  <stop offset="70%" stopColor={ring.color} stopOpacity="0.7" />
                  <stop offset="100%" stopColor={ring.color} stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );
      })}
      
      {/* Center stats */}
      <div className="absolute text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-[#D4AF37] mb-1 text-5xl" style={{ fontWeight: 100 }}>
            {Math.round((calories / caloriesGoal) * 100)}
          </p>
          <p className="text-[9px] text-white/30 uppercase tracking-[0.3em]" style={{ fontWeight: 200 }}>
            Complete
          </p>
        </motion.div>
      </div>
    </div>
  );
}