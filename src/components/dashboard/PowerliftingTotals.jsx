import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const BIG3 = ['Squat', 'Bench Press', 'Deadlift'];

const epley1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 1) return weight || 0;
  return Math.round(weight * (1 + reps / 30));
};

// Simplified Wilks coefficient (male, kg)
const wilks = (total, bodyweight = 80) => {
  const a = -216.0475144;
  const b = 16.2606339;
  const c = -0.002388645;
  const d = -0.00113732;
  const e = 7.01863e-6;
  const f = -1.291e-8;
  const bw = bodyweight;
  const denom = a + b * bw + c * bw ** 2 + d * bw ** 3 + e * bw ** 4 + f * bw ** 5;
  return denom ? Math.round((total / denom) * 500) : 0;
};

export default function PowerliftingTotals({ bodyweight = 80 }) {
  const { data: allLogs = [] } = useQuery({
    queryKey: ['workoutLogsAll'],
    queryFn: () => base44.entities.WorkoutLog.list('-date', 500),
    staleTime: 5 * 60 * 1000,
  });

  // Find best 1RM for each of the Big 3 from logs
  const best = {};
  BIG3.forEach(lift => { best[lift] = 0; });

  allLogs.forEach(log => {
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
  const wilksScore = total > 0 ? wilks(total, bodyweight) : 0;
  const hasData = total > 0;

  if (!hasData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(18,14,4,0.85)',
        border: '0.5px solid rgba(212,175,55,0.35)',
        boxShadow: '0 0 30px rgba(212,175,55,0.08), inset 0 0 30px rgba(212,175,55,0.03)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 pt-4 pb-2 flex items-center justify-between"
        style={{ borderBottom: '0.5px solid rgba(212,175,55,0.12)' }}
      >
        <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
          Powerlifting Totals
        </p>
        <p className="text-[10px] uppercase tracking-[0.15em] text-white/20" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          90-Day Peak
        </p>
      </div>

      {/* Big 3 */}
      <div className="px-5 pt-4 pb-3 grid grid-cols-3 gap-3">
        {BIG3.map(lift => (
          <div key={lift} className="text-center">
            <p
              className="text-xl"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 300,
                background: best[lift] > 0 ? 'linear-gradient(135deg, #F4D03F, #D4AF37)' : undefined,
                WebkitBackgroundClip: best[lift] > 0 ? 'text' : undefined,
                WebkitTextFillColor: best[lift] > 0 ? 'transparent' : undefined,
                color: best[lift] > 0 ? undefined : 'rgba(255,255,255,0.2)',
              }}
            >
              {best[lift] > 0 ? `${best[lift]}` : '—'}
            </p>
            <p className="text-[9px] text-white/25 mt-0.5 uppercase tracking-[0.1em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {lift}
            </p>
          </div>
        ))}
      </div>

      {/* Total + Wilks */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: '0.5px solid rgba(212,175,55,0.12)' }}
      >
        <div>
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/25" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Total
          </p>
          <p className="text-2xl text-white" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
            {total}<span className="text-sm text-white/30 ml-1">kg</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/25" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Wilks Score
          </p>
          <p
            className="text-2xl"
            style={{
              fontFamily: 'Montserrat, sans-serif', fontWeight: 300,
              background: 'linear-gradient(135deg, #F4D03F, #D4AF37)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            {wilksScore}
          </p>
        </div>
      </div>
    </motion.div>
  );
}