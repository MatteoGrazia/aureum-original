import React from 'react';
import { motion } from 'framer-motion';

export default function ActivityRings({ calories, caloriesGoal, steps, stepsGoal, volume, volumeGoal }) {
  const rings = [
    { value: calories, goal: caloriesGoal, color: '#D4AF37', label: 'Calories', size: 180 },
    { value: steps, goal: stepsGoal, color: '#C0C0C0', label: 'Steps', size: 140 },
    { value: volume, goal: volumeGoal, color: '#CD7F32', label: 'Volume', size: 100 },
  ];

  return (
    <div className="relative flex items-center justify-center h-56">
      {rings.map((ring, index) => {
        const progress = Math.min((ring.value / ring.goal) * 100, 100);
        const circumference = ring.size * Math.PI;
        const strokeDashoffset = circumference - (progress / 100) * circumference;
        
        return (
          <div
            key={ring.label}
            className="absolute"
            style={{
              width: ring.size,
              height: ring.size,
            }}
          >
            {/* Background ring */}
            <svg
              className="w-full h-full -rotate-90"
              viewBox={`0 0 ${ring.size} ${ring.size}`}
            >
              <circle
                cx={ring.size / 2}
                cy={ring.size / 2}
                r={(ring.size - 12) / 2}
                fill="none"
                stroke={`${ring.color}20`}
                strokeWidth="8"
              />
              {/* Progress ring */}
              <motion.circle
                cx={ring.size / 2}
                cy={ring.size / 2}
                r={(ring.size - 12) / 2}
                fill="none"
                stroke={ring.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.2 }}
                style={{
                  filter: `drop-shadow(0 0 8px ${ring.color}60)`,
                }}
              />
            </svg>
          </div>
        );
      })}
      
      {/* Center stats with increased padding */}
      <div className="absolute text-center z-10 px-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-3xl text-[#D4AF37] mb-4" style={{ fontWeight: 200 }}>
            {Math.round((calories / caloriesGoal) * 100)}%
          </p>
          <p className="text-[10px] text-white/50 uppercase tracking-widest">Complete</p>
        </motion.div>
      </div>
    </div>
  );
}