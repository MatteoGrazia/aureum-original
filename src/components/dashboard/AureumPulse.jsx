import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Footprints, Dumbbell, Droplets } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';

export default function AureumPulse({ label, value, goal, unit, index = 0, icon, iconColor = '#D4AF37' }) {
  const { isDarkMode } = useTheme();
  const progress = Math.min((value / goal) * 100, 100);
  const isNearGoal = progress > 80;

  const iconMap = {
    'Energy Remaining': Flame,
    'Steps': Footprints,
    'Training Volume': Dumbbell,
    'Hydration': Droplets,
  };

  const Icon = icon || iconMap[label];

  // Use iconColor for progress bar too so Steps = Pastel Blue, etc.
  const progressColor = iconColor;

  const cardStyle = isDarkMode
    ? {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(30px) saturate(180%)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        border: '0.5px solid rgba(212, 175, 55, 0.1)',
      }
    : {
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 10px 30px rgba(225, 193, 110, 0.15)',
        border: '0.5px solid rgba(225, 193, 110, 0.35)',
      };

  const valueColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(29,29,31,0.7)';
  const goalColor = isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(29,29,31,0.35)';
  const trackColor = isDarkMode ? 'rgba(156,126,70,0.2)' : 'rgba(156,126,70,0.15)';
  const pctColor = progress >= 100 ? '#F4D03F' : (isDarkMode ? '#C9A961' : '#9C7E46');

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
      }}
    >
      {/* Label with Icon */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${iconColor}18` }}
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
      <div className="relative h-[1px] overflow-hidden z-10" style={{ background: trackColor }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: index * 0.1 }}
          className="absolute left-0 top-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, ${progressColor}80, ${progressColor}cc, ${progressColor})`,
            boxShadow: isNearGoal
              ? `0 0 8px ${progressColor}90, 0 0 16px ${progressColor}50`
              : `0 0 4px ${progressColor}60`,
          }}
        >
          <motion.div
            className="absolute right-0 top-0 w-16 h-[1px]"
            style={{ background: `linear-gradient(90deg, transparent, ${progressColor}, transparent)` }}
            animate={{ x: [-16, 16, -16], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
          style={{ background: `${progressColor}50`, boxShadow: `0 0 4px ${progressColor}40` }}
        />
      </div>

      {/* Percentage */}
      <div className="mt-3 text-right relative z-10">
        <span
          className="text-xs tracking-wider"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: pctColor }}
        >
          {Math.round(progress)}%
        </span>
      </div>
    </motion.div>
  );
}