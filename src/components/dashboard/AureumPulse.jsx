import React from 'react';
import { motion } from 'framer-motion';

export default function AureumPulse({ label, value, goal, unit, icon: Icon }) {
  const progress = Math.min((value / goal) * 100, 100);
  const isNearGoal = progress >= 80;

  return (
    <div className="space-y-3">
      {/* Label with Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-[#9C7E46]" strokeWidth={1} />
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/40" style={{ fontWeight: 200 }}>
            {label}
          </span>
        </div>
        <span className="text-xs text-white/50" style={{ fontWeight: 100 }}>
          {value.toLocaleString()} / {goal.toLocaleString()} {unit}
        </span>
      </div>

      {/* Gold Thread Progress */}
      <div className="relative h-[1px] bg-[#9C7E46]/20 overflow-visible">
        <motion.div
          className="absolute left-0 top-0 h-[1px] bg-gradient-to-r from-[#D4AF37]/50 via-[#D4AF37] to-[#F4D03F]"
          initial={{ width: 0 }}
          animate={{ 
            width: `${progress}%`,
            boxShadow: isNearGoal 
              ? ['0 0 4px #D4AF37', '0 0 8px #D4AF37', '0 0 4px #D4AF37']
              : '0 0 4px #D4AF37'
          }}
          transition={{ 
            width: { duration: 1.5, ease: "easeOut" },
            boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Leading edge pulse */}
        {progress > 0 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#F4D03F]"
            style={{ 
              left: `${progress}%`,
              filter: 'drop-shadow(0 0 6px #F4D03F)'
            }}
            animate={isNearGoal ? {
              scale: [1, 1.5, 1],
              opacity: [0.8, 1, 0.8]
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
}