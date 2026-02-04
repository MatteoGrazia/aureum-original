import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function WaterTracker({ glasses, goal, onAdd, onRemove }) {
  const percentage = Math.min((glasses / goal) * 100, 100);

  return (
    <GlassCard className="p-5 relative overflow-hidden">
      {/* Water fill animation */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/30 via-blue-400/20 to-transparent"
        initial={{ height: 0 }}
        animate={{ height: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      {/* Wave animation */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-full opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%2360A5FA' d='M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,186.7C960,213,1056,235,1152,218.7C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: '100% 100%',
          transform: `translateY(${100 - percentage}%)`
        }}
        animate={{
          backgroundPositionX: ['0%', '100%']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-400" />
            <h3 className="text-xs uppercase tracking-widest text-blue-400">Hydration</h3>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl text-white">{glasses}</p>
            <p className="text-white/40 text-sm">of {goal} glasses</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onRemove}
              disabled={glasses <= 0}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={onAdd}
              className="w-10 h-10 rounded-full bg-blue-500/30 border border-blue-400/50 flex items-center justify-center hover:bg-blue-500/50 transition-colors"
            >
              <Plus className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </div>

        {/* Glass indicators */}
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: goal }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`w-3 h-6 rounded-sm transition-all duration-300 ${
                i < glasses 
                  ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' 
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}