import React from 'react';
import { motion } from 'framer-motion';

export default function AureumPulse({ label, value, goal, unit, index = 0 }) {
  const progress = Math.min((value / goal) * 100, 100);
  const isNearGoal = progress > 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="relative"
      style={{
        background: '#050505',
        boxShadow: 'inset 0px 8px 16px rgba(0,0,0,1)',
        borderTop: '0.5px solid rgba(212,175,55,0.3)',
        padding: '24px 20px',
        borderRadius: '16px'
      }}
    >
      {/* Label */}
      <div className="flex items-baseline justify-between mb-4">
        <p 
          className="text-[9px] uppercase tracking-[0.35em] text-[#9C7E46]"
          style={{ fontWeight: 200 }}
        >
          {label}
        </p>
        <p 
          className="text-white/40 text-[10px] tracking-wider"
          style={{ fontWeight: 100 }}
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
          {/* Shimmer effect when near goal */}
          {isNearGoal && (
            <motion.div
              className="absolute right-0 top-0 w-8 h-[1px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.8), transparent)',
              }}
              animate={{
                x: [0, 8, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
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
            fontWeight: 100,
            color: progress >= 100 ? '#D4AF37' : '#9C7E46'
          }}
        >
          {Math.round(progress)}%
        </span>
      </div>
    </motion.div>
  );
}