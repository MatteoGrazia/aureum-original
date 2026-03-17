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
          const imgUrls = {
            'Squat': 'https://media.base44.com/images/public/698347d058d3014d6271ccff/b843f05f0_4.png',
            'Bench Press': 'https://media.base44.com/images/public/698347d058d3014d6271ccff/0f962a9f8_5.png',
            'Deadlift': 'https://media.base44.com/images/public/698347d058d3014d6271ccff/2fc9de17b_6.png',
          };
          return (
            <div key={lift} className="text-center">
              <img
                src={imgUrls[lift]}
                alt={lift}
                className="mx-auto mb-1"
                style={{ width: 48, height: 48, objectFit: 'contain', filter: 'brightness(0) invert(0.7) sepia(0.2) saturate(0.5) hue-rotate(240deg)' }}
              />
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