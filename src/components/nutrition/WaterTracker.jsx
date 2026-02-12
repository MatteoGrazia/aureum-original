import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function WaterTracker({ glasses, goal, onAdd, onRemove }) {
  // Convert glasses (250ml each) to liters
  const liters = (glasses * 0.25).toFixed(1);
  const goalLiters = (goal * 0.25).toFixed(1);
  const percentage = Math.min((glasses / goal) * 100, 100);

  return (
    <GlassCard className="p-5 relative overflow-hidden">
      {/* Water fill animation - Faded Pastel Blue */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{
          background: 'linear-gradient(to top, rgba(173, 216, 230, 0.25), rgba(135, 206, 250, 0.15), transparent)'
        }}
        initial={{ height: 0 }}
        animate={{ height: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      {/* Flowing wave animation */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: `${percentage}%` }}>
        <motion.div
          className="absolute w-full"
          style={{
            bottom: '-10%',
            left: 0,
          }}
          animate={{
            x: ['-100%', '0%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <svg className="w-[200%]" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              fill="rgba(173, 216, 230, 0.25)"
              d="M0,60 Q360,90 720,60 T1440,60 L1440,120 L0,120 Z"
            >
              <animate
                attributeName="d"
                dur="5s"
                repeatCount="indefinite"
                values="
                  M0,60 Q360,90 720,60 T1440,60 L1440,120 L0,120 Z;
                  M0,60 Q360,30 720,60 T1440,60 L1440,120 L0,120 Z;
                  M0,60 Q360,90 720,60 T1440,60 L1440,120 L0,120 Z
                "
              />
            </path>
          </svg>
        </motion.div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-400" />
            <h3 className="text-xs uppercase tracking-widest text-blue-400">Hydration</h3>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl text-white">{liters}L</p>
            <p className="text-white/40 text-sm">of {goalLiters}L goal</p>
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
                  ? 'bg-[#ADD8E6] shadow-[0_0_10px_rgba(173,216,230,0.4)]' 
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}