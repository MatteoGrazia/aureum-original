import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Medal, Star } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

const MILESTONES = [
  { threshold: 1000, label: '1,000 kg', icon: Star, color: '#C0C0C0' },
  { threshold: 5000, label: '5,000 kg', icon: Medal, color: '#CD7F32' },
  { threshold: 10000, label: '10,000 kg', icon: Medal, color: '#C0C0C0' },
  { threshold: 25000, label: '25,000 kg', icon: Award, color: '#D4AF37' },
  { threshold: 50000, label: '50,000 kg', icon: Award, color: '#D4AF37' },
  { threshold: 100000, label: '100,000 kg', icon: Trophy, color: '#D4AF37' },
  { threshold: 250000, label: '250,000 kg', icon: Trophy, color: '#D4AF37' },
  { threshold: 500000, label: '500,000 kg', icon: Trophy, color: '#F472B6' },
  { threshold: 1000000, label: '1,000,000 kg', icon: Trophy, color: '#8B5CF6' },
];

export default function VolumeBenchmarks({ lifetimeVolume }) {
  const currentMilestoneIndex = MILESTONES.findIndex(m => lifetimeVolume < m.threshold);
  const nextMilestone = MILESTONES[currentMilestoneIndex] || MILESTONES[MILESTONES.length - 1];
  const previousMilestone = MILESTONES[currentMilestoneIndex - 1];
  
  const progressToNext = previousMilestone 
    ? ((lifetimeVolume - previousMilestone.threshold) / (nextMilestone.threshold - previousMilestone.threshold)) * 100
    : (lifetimeVolume / nextMilestone.threshold) * 100;

  return (
    <GlassCard className="p-5">
      <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Volume Benchmarks</h3>

      {/* Current Progress */}
      <div className="text-center mb-6">
        <p className="text-4xl text-white">{lifetimeVolume.toLocaleString()}</p>
        <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Lifetime Volume (kg)</p>
      </div>

      {/* Progress to Next */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>Progress to {nextMilestone.label}</span>
          <span>{Math.min(100, Math.round(progressToNext))}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progressToNext)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${nextMilestone.color}80, ${nextMilestone.color})`,
              boxShadow: `0 0 10px ${nextMilestone.color}80`
            }}
          />
        </div>
        <p className="text-center text-white/30 text-xs mt-2">
          {(nextMilestone.threshold - lifetimeVolume).toLocaleString()} kg to go
        </p>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-3 gap-3">
        {MILESTONES.map((milestone, index) => {
          const achieved = lifetimeVolume >= milestone.threshold;
          const Icon = milestone.icon;
          
          return (
            <motion.div
              key={milestone.threshold}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-3 rounded-xl text-center ${
                achieved ? 'bg-white/5' : 'bg-white/[0.02]'
              }`}
            >
              <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                achieved ? '' : 'opacity-30'
              }`}
              style={{ backgroundColor: achieved ? `${milestone.color}20` : 'transparent' }}
              >
                <Icon 
                  className="w-4 h-4" 
                  style={{ color: achieved ? milestone.color : 'rgba(255,255,255,0.3)' }}
                />
              </div>
              <p className={`text-xs ${achieved ? 'text-white' : 'text-white/30'}`}>
                {milestone.label}
              </p>
              
              {achieved && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                >
                  <span className="text-[8px]">✓</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}