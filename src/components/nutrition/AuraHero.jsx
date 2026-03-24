import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MACRO_TONES } from './MacroMicroBar';

// Deterministic dust particles
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: ((i * 47 + 11) % 80) + 10,
  y: ((i * 73 + 23) % 80) + 10,
  size: ((i % 4) * 0.5 + 0.8),
  delay: (i * 0.4) % 6,
  duration: ((i % 5) * 2 + 8),
  opacity: ((i % 3) * 0.08 + 0.06),
}));

const RINGS = [
  { label: 'protein', r: 122, stroke: 2,   color: MACRO_TONES.protein, animDelay: 0    },
  { label: 'carbs',   r: 110, stroke: 1.5, color: MACRO_TONES.carbs,   animDelay: 0.3  },
  { label: 'fat',     r:  98, stroke: 1.5, color: MACRO_TONES.fat,     animDelay: 0.6  },
];

function MacroRings({ protein, carbs, fat, macroGoals }) {
  const circumferences = RINGS.map(ring => 2 * Math.PI * ring.r);
  const progresses = [
    Math.min((protein / (macroGoals.protein || 150)), 1),
    Math.min((carbs   / (macroGoals.carbs   || 250)), 1),
    Math.min((fat     / (macroGoals.fat     || 70)),  1),
  ];

  return (
    <svg
      width={280} height={280}
      viewBox="0 0 280 280"
      className="absolute inset-0 pointer-events-none"
      style={{ transform: 'rotate(-90deg)' }}
    >
      <defs>
        {RINGS.map(ring => (
          <filter key={ring.label} id={`glow-${ring.label}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        ))}
      </defs>
      {RINGS.map((ring, i) => {
        const circ = circumferences[i];
        const filled = progresses[i] * circ;
        return (
          <g key={ring.label}>
            {/* Track */}
            <circle cx={140} cy={140} r={ring.r} fill="none"
              stroke="#E5E5E7" strokeWidth={ring.stroke} strokeOpacity={0.1} />
            {/* Filled arc */}
            <motion.circle
              cx={140} cy={140} r={ring.r}
              fill="none"
              stroke={ring.color}
              strokeWidth={ring.stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ - filled }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: ring.animDelay }}
              style={{ filter: `drop-shadow(0 0 3px ${ring.color}99)` }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function MacroBarBack({ label, value, goal, color }) {
  const pct = Math.min((value / (goal || 1)) * 100, 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color, fontFamily: 'Montserrat, sans-serif' }}>{label}</span>
        <span className="text-[11px]" style={{ color, fontFamily: 'Montserrat, sans-serif' }}>{value}g / {goal}g</span>
      </div>
      <div className="h-[1.5px] rounded-full" style={{ background: 'rgba(229,229,231,0.1)' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
          style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
        />
      </div>
    </div>
  );
}

export default function AuraHero({ remaining, goal, consumed, protein, carbs, fat, macroGoals = {} }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center mb-8">
      <div className="relative flex items-center justify-center" style={{ width: 280, height: 280, overflow: 'hidden' }}>
        {/* Three concentric macro rings */}
        <MacroRings protein={protein} carbs={carbs} fat={fat} macroGoals={macroGoals} />

        {/* Glass orb — 3D flip */}
        <motion.div
          onClick={() => setFlipped(f => !f)}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: 186, height: 186, transformStyle: 'preserve-3d', cursor: 'pointer', position: 'relative' }}
        >
          {/* ── FRONT ── */}
          <div
            className="absolute inset-0 rounded-full flex flex-col items-center justify-center overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              background: 'radial-gradient(circle at 38% 35%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)',
              border: '1px solid #D4AF37',
              boxShadow: '0 0 20px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(25px)',
            }}
          >
            {/* Dust particles */}
            {PARTICLES.map(p => (
              <motion.div key={p.id} className="absolute rounded-full pointer-events-none"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: '#D4AF37', opacity: p.opacity }}
                animate={{ x: [0, p.id % 2 === 0 ? 8 : -8], y: [0, p.id % 3 === 0 ? -10 : 6], opacity: [p.opacity, p.opacity * 2.5, p.opacity] }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
              />
            ))}

            <p className="text-5xl relative z-10" style={{
              fontFamily: 'Montserrat, sans-serif', fontWeight: 200, color: '#FFFFFF',
              textShadow: '0 0 20px rgba(212,175,55,0.7), 0 0 40px rgba(212,175,55,0.3)',
              letterSpacing: '-0.02em',
            }}>
              {Math.max(remaining, 0)}
            </p>
            <p className="text-[9px] uppercase tracking-[0.28em] mt-1.5 relative z-10"
              style={{ color: 'rgba(229,229,231,0.5)', fontFamily: 'Montserrat, sans-serif' }}>kcal left</p>
            <p className="text-[8px] uppercase tracking-[0.18em] mt-0.5 relative z-10"
              style={{ color: 'rgba(212,175,55,0.5)', fontFamily: 'Montserrat, sans-serif' }}>of {goal}</p>
            <p className="text-[7px] uppercase tracking-[0.18em] absolute bottom-5 z-10"
              style={{ color: 'rgba(212,175,55,0.3)', fontFamily: 'Montserrat, sans-serif' }}>tap for macros</p>
          </div>

          {/* ── BACK ── */}
          <div
            className="absolute inset-0 rounded-full flex flex-col items-center justify-center px-7"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'radial-gradient(circle at 38% 35%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)',
              border: '1px solid #D4AF37',
              boxShadow: '0 0 20px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(25px)',
            }}
          >
            <p className="text-[8px] uppercase tracking-[0.28em] mb-4"
              style={{ color: 'rgba(212,175,55,0.6)', fontFamily: 'Montserrat, sans-serif' }}>Macros Today</p>
            <div className="w-full">
              <MacroBarBack label="Pro"  value={protein} goal={macroGoals.protein || 150} color={MACRO_TONES.protein} />
              <MacroBarBack label="Carb" value={carbs}   goal={macroGoals.carbs   || 250} color={MACRO_TONES.carbs}   />
              <MacroBarBack label="Fat"  value={fat}     goal={macroGoals.fat     || 70}  color={MACRO_TONES.fat}     />
            </div>
            <p className="text-[7px] uppercase tracking-[0.18em] mt-2"
              style={{ color: 'rgba(212,175,55,0.3)', fontFamily: 'Montserrat, sans-serif' }}>tap to go back</p>
          </div>
        </motion.div>
      </div>

      <p className="text-[11px] uppercase tracking-[0.25em] mt-1"
        style={{ color: 'rgba(229,229,231,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
        {consumed} consumed · {Math.max(goal - consumed, 0)} remaining
      </p>
    </div>
  );
}