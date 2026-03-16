import React from 'react';
import { motion } from 'framer-motion';

const BIG3 = ['Squat', 'Bench Press', 'Deadlift'];

const epley1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 1) return weight || 0;
  return Math.round(weight * (1 + reps / 30));
};

const wilks = (total, bodyweight = 80) => {
  const a = -216.0475144, b = 16.2606339, c = -0.002388645,
    d = -0.00113732, e = 7.01863e-6, f = -1.291e-8;
  const bw = bodyweight;
  const denom = a + b*bw + c*bw**2 + d*bw**3 + e*bw**4 + f*bw**5;
  return denom ? Math.round((total / denom) * 500) : 0;
};

export default function WorkoutHero({ logs = [], bodyweight = 80 }) {
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
  const wilksScore = total > 0 ? wilks(total, bodyweight) : 0;
  if (total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative text-center py-6 mb-2"
    >
      {/* Pulsing amber radial glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)',
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <p className="text-[9px] uppercase tracking-[0.4em] mb-3" style={{ color: '#FFFFFF' }}>
        Total Max Weights
      </p>

      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <span
          className="text-8xl leading-none text-white"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 100 }}
        >
          {total}
        </span>
        <span className="text-2xl text-white/30 ml-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
          kg
        </span>
      </motion.div>

      {/* Big 3 breakdown with icons */}
      <div className="flex justify-center gap-8 mt-4 mb-3">
        {BIG3.map(lift => {
          const icons = {
            'Squat': (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BDB5D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
                <line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="6.5" x2="3" y2="9.5"/><line x1="6" y1="6" x2="6" y2="10"/><line x1="18" y1="6" x2="18" y2="10"/><line x1="21" y1="6.5" x2="21" y2="9.5"/>
                <circle cx="12" cy="5" r="1.8"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="13" x2="7" y2="18"/><line x1="12" y1="13" x2="17" y2="18"/><line x1="7" y1="18" x2="6" y2="22"/><line x1="17" y1="18" x2="18" y2="22"/>
              </svg>
            ),
            'Bench Press': (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BDB5D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
                <line x1="2" y1="7" x2="22" y2="7"/><line x1="2" y1="5.5" x2="2" y2="8.5"/><line x1="5" y1="5" x2="5" y2="9"/><line x1="19" y1="5" x2="19" y2="9"/><line x1="22" y1="5.5" x2="22" y2="8.5"/>
                <circle cx="12" cy="14" r="2"/><line x1="10.2" y1="13" x2="7" y2="7.5"/><line x1="13.8" y1="13" x2="17" y2="7.5"/><line x1="12" y1="16" x2="9" y2="21"/><line x1="12" y1="16" x2="15" y2="21"/>
              </svg>
            ),
            'Deadlift': (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BDB5D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
                <line x1="3" y1="21" x2="21" y2="21"/><line x1="3" y1="19" x2="3" y2="23"/><line x1="6" y1="18" x2="6" y2="24"/><line x1="18" y1="18" x2="18" y2="24"/><line x1="21" y1="19" x2="21" y2="23"/>
                <circle cx="16" cy="4" r="2"/><line x1="16" y1="6" x2="10" y2="13"/><line x1="10" y1="13" x2="8" y2="21"/><line x1="10" y1="13" x2="12" y2="21"/>
              </svg>
            ),
          };
          return (
            <div key={lift} className="text-center">
              {icons[lift]}
              <p className="text-white text-base" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
                {best[lift] || '—'}
              </p>
              <p className="text-white/20 text-[9px] uppercase tracking-[0.15em] mt-0.5">{lift}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}