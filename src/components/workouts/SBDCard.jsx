import React from 'react';
import { motion } from 'framer-motion';

const BIG3 = ['Squat', 'Bench Press', 'Deadlift'];

const epley1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 1) return weight || 0;
  return Math.round(weight * (1 + reps / 30));
};

export default function SBDCard({ logs = [], isLoading = false }) {
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

  const imgUrls = {
    'Squat': 'https://media.base44.com/images/public/698347d058d3014d6271ccff/b843f05f0_4.png',
    'Bench Press': 'https://media.base44.com/images/public/698347d058d3014d6271ccff/0f962a9f8_5.png',
    'Deadlift': 'https://media.base44.com/images/public/698347d058d3014d6271ccff/2fc9de17b_6.png',
  };

  if (isLoading) {
    return (
      <div
        className="flex-1 rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(212,175,55,0.15)' }}
      >
        <div className="h-3 w-20 rounded bg-white/10 animate-pulse mb-3" />
        <div className="h-8 w-16 rounded bg-white/10 animate-pulse mb-4" />
        <div className="flex justify-around">
          {[1,2,3].map(i => <div key={i} className="h-10 w-10 rounded bg-white/10 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex-1 rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid rgba(212,175,55,0.18)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <p
        className="text-[9px] uppercase tracking-[0.3em] mb-2"
        style={{ color: 'rgba(229,229,231,0.45)', fontFamily: 'Montserrat, sans-serif' }}
      >
        SBD Total
      </p>

      <p
        className="text-3xl leading-none mb-1"
        style={{ color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 100 }}
      >
        {total > 0 ? total : '–'}
      </p>
      {total > 0 && (
        <p className="text-[9px] mb-3" style={{ color: 'rgba(212,175,55,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
          kg combined
        </p>
      )}
      {total === 0 && (
        <p className="text-[9px] mb-3" style={{ color: 'rgba(229,229,231,0.25)', fontFamily: 'Montserrat, sans-serif' }}>
          Log S / B / D to track
        </p>
      )}

      <div className="flex justify-between">
        {BIG3.map(lift => (
          <div key={lift} className="text-center">
            <img
              src={imgUrls[lift]}
              alt={lift}
              style={{ width: 28, height: 28, objectFit: 'contain', mixBlendMode: 'screen', margin: '0 auto 2px' }}
            />
            <p
              className="text-xs leading-none"
              style={{ color: best[lift] ? '#FFFFFF' : 'rgba(255,255,255,0.2)', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}
            >
              {best[lift] || '–'}
            </p>
            <p
              className="text-[8px] uppercase tracking-[0.1em] mt-0.5"
              style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Montserrat, sans-serif' }}
            >
              {lift === 'Bench Press' ? 'B' : lift[0]}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}