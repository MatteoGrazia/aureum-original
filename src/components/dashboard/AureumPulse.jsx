import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Footprints, Dumbbell, Droplets } from 'lucide-react';

export default function AureumPulse({ label, value, goal, unit, index = 0, icon }) {
  const progress = Math.min((value / goal) * 100, 100);
  const isNearGoal = progress > 80;
  
  const iconMap = {
    'Energy Remaining': Flame,
    'Steps': Footprints,
    'Training Volume': Dumbbell,
    'Hydration': Droplets
  };
  
  const Icon = icon || iconMap[label];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="relative"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(25px) saturate(160%)',
        boxShadow: 'inset 0px 4px 12px rgba(0,0,0,0.5), 0px 10px 30px rgba(0,0,0,0.3)',
        borderTop: '0.5px solid #D4AF37',
        padding: '24px 20px',
        borderRadius: '16px'
      }}
    >
      {/* Label with Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/5 flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#9C7E46]" strokeWidth={1} />
            </div>
          )}
          <p 
            className="text-[9px] uppercase tracking-[0.35em] text-[#9C7E46]"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 200 }}
          >
            {label}
          </p>
        </div>
        <p 
          className="text-white/40 text-[10px] tracking-wider"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
        >
          {value.toLocaleString()} {unit && <span className="text-white/20">/ {goal.toLocaleString()} {unit}</span>}
        </p>
      </div>

      {/* Thread visualization */}
      <div className="relative h-[1px] bg-[#9C7E46]/20 overflow-visible">
        {/* Progress thread */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
          className="absolute left-0 top-0 h-[1px] bg-gradient-to-r from-[#9C7E46] via-[#D4AF37] to-[#D4AF37]"
          style={{
            boxShadow: isNearGoal 
              ? '0 0 8px rgba(212,175,55,0.6), 0 0 16px rgba(212,175,55,0.3)' 
              : '0 0 4px rgba(212,175,55,0.4)',
          }}
        >
          {/* Enhanced Multi-layer Shimmer */}
          <motion.div
            className="absolute right-0 top-0 w-16 h-[1px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(212,175,55,1), rgba(244,208,63,0.8), transparent)',
            }}
            animate={{
              x: [-16, 16, -16],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {isNearGoal && (
            <>
              <motion.div
                className="absolute right-0 top-0 w-12 h-[1px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(244,208,63,0.9), transparent)',
                }}
                animate={{
                  x: [0, 20, 0],
                  opacity: [0.3, 0.9, 0.3]
                }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
              <motion.div
                className="absolute right-0 top-0 w-8 h-[1px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.7), transparent)',
                }}
                animate={{
                  x: [-8, 12, -8],
                  opacity: [0.2, 0.8, 0.2]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4
                }}
              />
            </>
          )}
        </motion.div>

        {/* Goal marker */}
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#9C7E46]/40"
          style={{ boxShadow: '0 0 4px rgba(156,126,70,0.3)' }}
        />
      </div>

      {/* Percentage indicator */}
      <div className="mt-3 text-right">
        <span 
          className="text-[11px] tracking-wider"
          style={{ 
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            color: progress >= 100 ? '#D4AF37' : '#9C7E46'
          }}
        >
          {Math.round(progress)}%
        </span>
      </div>
    </motion.div>
  );
}