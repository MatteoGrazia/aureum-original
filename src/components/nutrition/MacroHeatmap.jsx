import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

export default function MacroHeatmap({ protein, carbs, fat, goals }) {
  const macros = [
    { 
      name: 'Protein', 
      value: protein, 
      goal: goals?.protein || 150, 
      color: '#D4AF37',
      unit: 'g' 
    },
    { 
      name: 'Carbs', 
      value: carbs, 
      goal: goals?.carbs || 250, 
      color: '#60A5FA',
      unit: 'g' 
    },
    { 
      name: 'Fat', 
      value: fat, 
      goal: goals?.fat || 70, 
      color: '#F472B6',
      unit: 'g' 
    },
  ];

  return (
    <GlassCard className="p-5">
      <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Macro Breakdown</h3>
      
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
              
              {/* Heatmap Bar */}
              <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${macro.color}40, ${macro.color})`,
                    boxShadow: `0 0 ${20 * intensity}px ${macro.color}${Math.round(intensity * 80).toString(16)}`
                  }}
                />
                
                {/* Heat cells overlay */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const cellFilled = (i / 20) < (percentage / 100);
                    return (
                      <div
                        key={i}
                        className={`flex-1 border-r border-[#080808]/50 transition-all duration-300 ${
                          cellFilled ? '' : 'bg-white/5'
                        }`}
                      />
                    );
                  })}
                </div>
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