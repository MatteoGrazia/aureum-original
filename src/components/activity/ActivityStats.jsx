import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Coffee, Flame, Clock } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';

export default function ActivityStats({ activeMinutes, sedentaryMinutes, caloriesBurned }) {
  const totalMinutes = activeMinutes + sedentaryMinutes;
  const activePercentage = totalMinutes > 0 ? (activeMinutes / totalMinutes) * 100 : 0;

  const stats = [
    {
      icon: Activity,
      label: 'Active',
      value: activeMinutes,
      unit: 'min',
      color: '#A8D5BA'
    },
    {
      icon: Coffee,
      label: 'Sedentary',
      value: sedentaryMinutes,
      unit: 'min',
      color: '#E8B4A8'
    },
    {
      icon: Flame,
      label: 'Burned',
      value: caloriesBurned,
      unit: 'kcal',
      color: '#F4A261'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Activity Balance Bar */}
      <VoidCard>
        <h3 
          className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-4"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
        >
          Activity Balance
        </h3>
        
        <div className="relative h-4 rounded-full overflow-hidden bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${activePercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#A8D5BA] to-[#8ECAE6] rounded-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${100 - activePercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-y-0 right-0 bg-gradient-to-r from-[#E8B4A8] to-[#D4A5A5] rounded-full"
          />
        </div>

        <div className="flex justify-between mt-3 text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#A8D5BA]" />
            <span className="text-white/60">Active ({Math.round(activePercentage)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#E8B4A8]" />
            <span className="text-white/60">Sedentary ({Math.round(100 - activePercentage)}%)</span>
          </div>
        </div>
      </VoidCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <VoidCard className="text-center">
                <div 
                  className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} strokeWidth={1.5} />
                </div>
                <p className="text-xl text-white" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{stat.value}</p>
                <p className="text-white/30 text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{stat.unit}</p>
                <p className="text-white/50 text-[10px] uppercase tracking-wider mt-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{stat.label}</p>
              </VoidCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}