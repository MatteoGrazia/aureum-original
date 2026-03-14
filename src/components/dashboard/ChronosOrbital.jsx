import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/shared/ThemeContext';

export default function ChronosOrbital({ calories, caloriesGoal, steps, stepsGoal, volume, volumeGoal }) {
  const { isDarkMode } = useTheme();

  const orbitals = [
    { value: calories,  goal: caloriesGoal, color: '#D4AF37', size: 240, offset: { x: -8, y: -8 }, rotation: 0 },
    { value: steps,     goal: stepsGoal,    color: '#B2D8D8', size: 180, offset: { x: 5, y: -5 }, rotation: 45 },
    { value: volume,    goal: volumeGoal,   color: '#BDB5D5', size: 120, offset: { x: -3, y: 3 }, rotation: -30 }
  ];

  const totalProgress = Math.min(
    (calories / caloriesGoal * 100 + steps / stepsGoal * 100 + volume / volumeGoal * 100) / 3,
    100
  );

  const trackOpacity = isDarkMode ? 0.08 : 1; // light mode uses explicit rgba color below
  const centerPctColor = isDarkMode ? '#FFFFFF' : '#000000';
  const centerSubColor = isDarkMode ? 'rgba(255,255,255,0.4)' : '#000000';

  return (
    <div className="relative flex items-center justify-center h-72">
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
            <svg
              className="w-full h-full"
              style={{ transform: 'rotate(-90deg)' }}
              viewBox={`0 0 ${orbital.size} ${orbital.size}`}
            >
              <defs>
                <linearGradient id={`pulse-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={orbital.color} stopOpacity={isDarkMode ? "0.1" : "0.45"} />
                  <stop offset="50%" stopColor={orbital.color} stopOpacity={isDarkMode ? "0.3" : "0.75"} />
                  <stop offset="100%" stopColor={orbital.color} stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Background track */}
              <circle
                cx={orbital.size / 2}
                cy={orbital.size / 2}
                r={(orbital.size - 4) / 2}
                fill="none"
                stroke={isDarkMode ? orbital.color : 'rgba(156,126,70,0.10)'}
                strokeWidth={isDarkMode ? "1" : "1.5"}
                opacity={isDarkMode ? trackOpacity : 1}
              />

              {/* Progress thread */}
              <motion.circle
                cx={orbital.size / 2}
                cy={orbital.size / 2}
                r={(orbital.size - 4) / 2}
                fill="none"
                stroke={isDarkMode ? `url(#pulse-${index})` : '#D4AF37'}
                strokeWidth={isDarkMode ? "1.5" : "2.5"}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1], delay: index * 0.12 }}
                style={{
                  filter: isDarkMode
                    ? `drop-shadow(0 0 2px ${orbital.color}70)`
                    : `drop-shadow(0 0 2px rgba(212,175,55,0.4))`
                }}
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
          className="mb-2 text-3xl tracking-wider"
          style={{ fontWeight: 400, fontFamily: 'Montserrat, sans-serif', color: centerPctColor }}
        >
          {Math.round(totalProgress)}%
        </p>
        <p
          className="text-[10px] uppercase tracking-[0.35em]"
          style={{ fontWeight: 400, fontFamily: 'Montserrat, sans-serif', color: '#000000' }}
        >
          Complete
        </p>
      </motion.div>

      {/* Legend */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-6">
        {orbitals.map((orbital, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: orbital.color, boxShadow: `0 0 8px ${orbital.color}60` }}
            />
            <p
              className="text-[9px] uppercase tracking-wider"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400,
                color: isDarkMode ? 'rgba(255,255,255,0.3)' : '#1D1D1F'
              }}
            >
              {i === 0 ? 'Energy' : i === 1 ? 'Steps' : 'Volume'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}