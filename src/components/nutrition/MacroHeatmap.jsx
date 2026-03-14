import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

export default function MacroHeatmap({ protein, carbs, fat, goals }) {
  const macros = [
    { 
      name: 'Protein', 
      value: protein, 
      goal: goals?.protein || 150, 
      color: '#FFDAB9',
      unit: 'g' 
    },
    { 
      name: 'Carbs', 
      value: carbs, 
      goal: goals?.carbs || 250, 
      color: '#FFDAB9',
      unit: 'g' 
    },
    { 
      name: 'Fat', 
      value: fat, 
      goal: goals?.fat || 70, 
      color: '#FFDAB9',
      unit: 'g' 
    },
  ];

  return (
    <GlassCard className="p-5">
      <h3 className="text-xs uppercase tracking-widest text-white mb-4">Macro Breakdown</h3>
      
      <div className="space-y-4">
        {macros.map((macro, index) => {
          const percentage = Math.min((macro.value / macro.goal) * 100, 100);
          const intensity = Math.min(percentage / 100, 1);
          
          return (
            <div key={macro.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">{macro.name}</span>
                <span className="text-white text-sm">
                  {macro.value}<span className="text-white/40">{macro.unit}</span>
                  <span className="text-white/30 mx-1">/</span>
                  <span className="text-white/40">{macro.goal}{macro.unit}</span>
                </span>
              </div>
              
              {/* Thread visualization */}
              <div className="relative h-[1px] bg-[#D4AF37]/20 overflow-hidden">
                {/* Progress thread */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                  className="absolute left-0 top-0 h-[1px]"
                  style={{
                    background: `linear-gradient(to right, ${macro.color}80, ${macro.color})`,
                    boxShadow: `0 0 4px ${macro.color}99, 0 0 8px ${macro.color}66`
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute right-0 top-0 w-16 h-[1px]"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${macro.color}, transparent)`,
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
                </motion.div>

                {/* Goal marker */}
                <div 
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#D4AF37]/40"
                  style={{ boxShadow: '0 0 4px rgba(212,175,55,0.3)' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Calories from Macros */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-white/40 text-xs uppercase tracking-wider">From Macros</span>
          <span className="text-white">
            {(protein * 4) + (carbs * 4) + (fat * 9)} 
            <span className="text-white/40 text-sm ml-1">kcal</span>
          </span>
        </div>
      </div>
    </GlassCard>
  );
}