import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Coffee, Flame, Clock } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function ActivityStats({ activeMinutes, sedentaryMinutes, caloriesBurned }) {
  const totalMinutes = activeMinutes + sedentaryMinutes;
  const activePercentage = totalMinutes > 0 ? (activeMinutes / totalMinutes) * 100 : 0;

  const stats = [
    {
      icon: Activity,
      label: 'Active',
      value: activeMinutes,
      unit: 'min',
      color: '#22C55E'
    },
    {
      icon: Coffee,
      label: 'Sedentary',
      value: sedentaryMinutes,
      unit: 'min',
      color: '#EF4444'
    },
    {
      icon: Flame,
      label: 'Burned',
      value: caloriesBurned,
      unit: 'kcal',
      color: '#D4AF37'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Activity Balance Bar */}
      <GlassCard className="p-5">
        <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Activity Balance</h3>
        
        <div className="relative h-4 rounded-full overflow-hidden bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${activePercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-400 rounded-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${100 - activePercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-y-0 right-0 bg-gradient-to-r from-red-400 to-red-500 rounded-full"
          />
        </div>

        <div className="flex justify-between mt-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-white/60">Active ({Math.round(activePercentage)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-white/60">Sedentary ({Math.round(100 - activePercentage)}%)</span>
          </div>
        </div>
      </GlassCard>

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
              <GlassCard className="p-4 text-center">
                <div 
                  className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <p className="text-xl text-white">{stat.value}</p>
                <p className="text-white/30 text-xs">{stat.unit}</p>
                <p className="text-white/50 text-[10px] uppercase tracking-wider mt-1">{stat.label}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}