import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Footprints, Dumbbell, Droplets } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';

export default function AureumPulse({ label, value, goal, unit, index = 0, icon, iconColor = '#D4AF37' }) {
  const { isDarkMode } = useTheme();
  const progress = Math.min((value / goal) * 100, 100);
  const isNearGoal = progress > 80;

  const iconMap = {
    'Calories Consumed': Flame,
    'Energy Remaining': Flame,
    'Steps': Footprints,
    'Training Volume': Dumbbell,
    'Hydration': Droplets,
  };

  const Icon = icon || iconMap[label];
  const progressColor = iconColor;

  // Standard glass-amber card style matching VoidCard
  const cardStyle = isDarkMode
    ? {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        border: '0.5px solid rgba(212, 175, 55, 0.2)',
      }
    : {
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
        border: '0.5px solid rgba(225, 193, 110, 0.45)',
      };

  const valueColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(29,29,31,0.7)';
  const goalColor = isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(29,29,31,0.35)';
  const trackColor = isDarkMode ? 'rgba(156,126,70,0.2)' : 'rgba(156,126,70,0.15)';

  // Breathing pulse: scale slightly in + out, synced with progress bar animation
  const pulseDelay = index * 0.08 + 1.2; // start after bar finishes animating in

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative"
      style={{
        ...cardStyle,
        padding: '20px 18px',
        borderRadius: '14px',
        overflow: 'hidden',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      {/* Label with Icon */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: isDarkMode ? '0.5px solid rgba(212,175,55,0.15)' : '0.5px solid rgba(225,193,110,0.35)',
              }}
            >
              <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.5} />
            </div>
          )}
          <p
            className="text-[10px] uppercase tracking-[0.3em] text-white"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            {label}
          </p>
        </div>
        <p
          className="text-[11px] tracking-wider"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: valueColor }}
        >
          {value.toLocaleString()}{' '}
          {unit && <span style={{ color: goalColor }}>/ {goal.toLocaleString()} {unit}</span>}
        </p>
      </div>

      {/* Thread visualization */}
      <div className="relative h-[1px] overflow-visible z-10" style={{ background: trackColor }}>
        {/* Breathing glow blob behind the bar head */}
        <motion.div
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scaleY: [1, 2.5, 1],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: pulseDelay,
          }}
          className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full pointer-events-none"
          style={{
            left: 0,
            width: `${progress}%`,
            background: `linear-gradient(90deg, transparent, ${progressColor}40, ${progressColor}60)`,
            filter: `blur(3px)`,
            transformOrigin: 'center',
          }}
        />
        {/* Main crisp bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: index * 0.08 }}
          className="absolute left-0 top-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, ${progressColor}80, ${progressColor}cc, ${progressColor})`,
            willChange: 'width',
          }}
        />
        {/* Breathing dot at progress head */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: pulseDelay }}
          className="absolute top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full"
          style={{
            left: `calc(${progress}% - 2.5px)`,
            background: progressColor,
            boxShadow: `0 0 6px ${progressColor}`,
          }}
        />
      </div>

      {/* Percentage */}
      <div className="mt-3 text-right relative z-10">
        <span
          className="text-xs tracking-wider"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }}
        >
          {Math.round(progress)}%
        </span>
      </div>
    </motion.div>
  );
}