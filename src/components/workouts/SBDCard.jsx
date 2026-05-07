import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings, toDisplayWeight, weightUnitLabel } from '@/lib/SettingsContext';

const GOLD = '#D4AF37';
const PURPLE = '#BDB5D5';
const BIG3 = ['Squat', 'Bench Press', 'Deadlift'];

const RING_SIZE = 180;
const STROKE = 2;
const R = (RING_SIZE - STROKE * 2) / 2;

const epley1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 1) return weight || 0;
  return Math.round(weight * (1 + reps / 30));
};

function AnimatedNumber({ target, duration = 0.6 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      setVal(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{val}</>;
}

export default function SBDCard({ logs = [] }) {
  const settings = useSettings();
  const wUnit = weightUnitLabel(settings.home_units_weight);
  const best = {};
  BIG3.forEach(l => { best[l] = 0; });

  logs.forEach(log => {
    (log.sets || []).forEach(s => {
      for (const lift of BIG3) {
        if ((s.exercise_name || '').toLowerCase().includes(lift.toLowerCase())) {
          const rm = epley1RM(s.weight, s.reps);
          if (rm > best[lift]) best[lift] = rm;
        }
      }
    });
  });

  const total = BIG3.reduce((sum, l) => sum + (best[l] || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col items-center pt-2 pb-4"
    >
      {/* Label */}
      <p className="text-[9px] uppercase tracking-[0.35em] mb-4"
        style={{ color: 'rgba(229,229,231,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
        SBD Total
      </p>

      {/* Ring */}
      <div className="relative flex items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
        {/* Radial glow */}
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(189,181,213,0.08) 0%, transparent 70%)',
        }} />

        <svg width={RING_SIZE} height={RING_SIZE} className="absolute inset-0">
          <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={R}
            fill="none" stroke={PURPLE} strokeWidth={STROKE}
            strokeOpacity={0.6}
            style={{ filter: `drop-shadow(0 0 3px rgba(189,181,213,0.4))` }}
          />
        </svg>

        {/* Inner content */}
        <div className="flex flex-col items-center justify-center z-10">
          <div className="leading-none text-center mb-1">
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 100, fontSize: 44, color: '#FFFFFF' }}>
              {total > 0 ? <AnimatedNumber target={total} /> : '–'}
            </span>
            {total > 0 && (
              <span style={{ fontSize: 16, color: 'rgba(212,175,55,0.7)', marginLeft: 3, fontFamily: 'Montserrat, sans-serif' }}>{wUnit}</span>
            )}
          </div>
          <p className="text-[9px] uppercase tracking-[0.2em]"
            style={{ color: 'rgba(212,175,55,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
            {total > 0 ? 'Combined' : 'Log S, B, D'}
          </p>
        </div>
      </div>

      {/* S / B / D breakdown */}
      <div className="flex items-center gap-3 mt-3">
        {BIG3.map((lift, i) => (
          <React.Fragment key={lift}>
            {i > 0 && <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10 }}>/</span>}
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(229,229,231,0.6)' }}>
              <span style={{ color: GOLD, fontWeight: 500 }}>{lift[0]}</span>
              {': '}
              <span style={{ color: best[lift] ? '#FFFFFF' : 'rgba(255,255,255,0.2)' }}>
                {best[lift] ? toDisplayWeight(best[lift], settings.home_units_weight) : '–'}
              </span>
            </span>
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}