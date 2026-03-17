import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

const BLUE = '#B2D8D8';
const BLUE_BG = 'rgba(178, 216, 216, 0.18)';
const BLUE_WAVE = 'rgba(178, 216, 216, 0.22)';

export default function WaterTracker({ glasses, goal, onAdd, onRemove }) {
  const [localGlasses, setLocalGlasses] = useState(glasses);
  const lastInteractionRef = useRef(0);
  // Track whether the initial server value has been loaded (non-zero)
  const initializedRef = useRef(glasses > 0);

  useEffect(() => {
    const timeSinceInteraction = Date.now() - lastInteractionRef.current;
    if (timeSinceInteraction > 2500) {
      // Suppress the "jump from 0 to N" animation on first load
      // by setting without triggering framer-motion transition
      if (!initializedRef.current && glasses > 0) {
        initializedRef.current = true;
      }
      setLocalGlasses(glasses);
    }
  }, [glasses]);

  const safeGoal = Math.max(goal, 1);
  const pct = Math.min(localGlasses / safeGoal, 1);
  const liters = (localGlasses * 0.25).toFixed(1);
  const goalLiters = (safeGoal * 0.25).toFixed(1);

  const handleAdd = () => {
    if (localGlasses >= safeGoal) return;
    lastInteractionRef.current = Date.now();
    setLocalGlasses(g => g + 1);
    onAdd();
  };

  const handleRemove = () => {
    if (localGlasses <= 0) return;
    lastInteractionRef.current = Date.now();
    setLocalGlasses(g => g - 1);
    onRemove();
  };

  return (
    <GlassCard className="p-5 relative overflow-hidden" style={{ minHeight: 160 }}>
      {/* Water fill — scaleY from bottom for reliable full-fill */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '100%',
          background: `linear-gradient(to top, ${BLUE_BG}, rgba(142,202,230,0.07), transparent)`,
          transformOrigin: 'bottom',
          originY: 1,
          pointerEvents: 'none',
        }}
        animate={{ scaleY: pct }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      />

      {/* Wave line at waterline */}
      {pct > 0 && (
        <motion.div
          className="absolute left-0 right-0 overflow-hidden pointer-events-none"
          style={{ height: 28 }}
          animate={{ bottom: `calc(${pct * 100}% - 14px)` }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute w-full"
            style={{ bottom: 0, left: 0 }}
            animate={{ x: ['-50%', '0%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          >
            <svg className="w-[200%]" viewBox="0 0 1440 28" preserveAspectRatio="none" style={{ height: 28 }}>
              <path fill={BLUE_WAVE} d="M0,14 Q360,24 720,14 T1440,14 L1440,28 L0,28 Z" />
            </svg>
          </motion.div>
        </motion.div>
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Droplets className="w-5 h-5" style={{ color: BLUE }} />
          <h3 className="text-xs uppercase tracking-widest" style={{ color: BLUE, fontFamily: 'Montserrat, sans-serif' }}>
            Hydration
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl text-white" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>{liters}L</p>
            <p className="text-white/40 text-sm">of {goalLiters}L goal</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRemove}
              disabled={localGlasses <= 0}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleAdd}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(178,216,216,0.18)', border: `1px solid rgba(178,216,216,0.38)` }}
            >
              <Plus className="w-4 h-4" style={{ color: BLUE }} />
            </button>
          </div>
        </div>

        {/* Glass indicator dots */}
        <div className="flex justify-center gap-1 mt-4 flex-wrap">
          {Array.from({ length: safeGoal }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-6 rounded-sm transition-all duration-200"
              style={i < localGlasses
                ? { background: BLUE, boxShadow: `0 0 8px rgba(178,216,216,0.35)`, opacity: 0.85 }
                : { background: 'rgba(255,255,255,0.08)' }
              }
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}