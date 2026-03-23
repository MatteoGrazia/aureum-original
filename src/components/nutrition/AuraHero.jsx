import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Deterministic dust particles — no Math.random() on render
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: ((i * 47 + 11) % 80) + 10,
  y: ((i * 73 + 23) % 80) + 10,
  size: ((i % 4) * 0.5 + 0.8),
  delay: (i * 0.4) % 6,
  duration: ((i % 5) * 2 + 8),
  opacity: ((i % 3) * 0.08 + 0.06),
}));

function AuraRing({ progress }) {
  const r = 120;
  const stroke = 3;
  const circumference = 2 * Math.PI * r;
  const filled = Math.min(progress, 1) * circumference;

  return (
    <svg
      width={280}
      height={280}
      viewBox="0 0 280 280"
      className="absolute inset-0 pointer-events-none"
      style={{ transform: 'rotate(-90deg)' }}
    >
      <defs>
        <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#FFDAB9" />
        </linearGradient>
      </defs>
      {/* Unfilled track */}
      <circle
        cx={140} cy={140} r={r}
        fill="none"
        stroke="#E5E5E7"
        strokeWidth={stroke}
        strokeOpacity={0.1}
      />
      {/* Filled arc */}
      <motion.circle
        cx={140} cy={140} r={r}
        fill="none"
        stroke="url(#auraGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - filled }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        style={{ filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.6))' }}
      />
    </svg>
  );
}

function MacroBar({ label, value, goal, color }) {
  const pct = Math.min((value / (goal || 1)) * 100, 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color, fontFamily: 'Montserrat, sans-serif' }}>
          {label}
        </span>
        <span className="text-[11px]" style={{ color, fontFamily: 'Montserrat, sans-serif' }}>
          {value}g / {goal}g
        </span>
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
  const progress = goal > 0 ? consumed / goal : 0;

  const handleTap = () => setFlipped(f => !f);

  return (
    <div className="flex flex-col items-center mb-8">
      {/* Orb wrapper — fixed 280×280 */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 280, height: 280 }}
      >
        {/* Progress ring */}
        <AuraRing progress={progress} />

        {/* Glass orb */}
        <motion.div
          onClick={handleTap}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: 220, height: 220, transformStyle: 'preserve-3d', cursor: 'pointer', position: 'relative' }}
        >
          {/* ── FRONT: Calorie number ── */}
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
              <motion.div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  background: '#D4AF37',
                  opacity: p.opacity,
                }}
                animate={{
                  x: [0, (p.id % 2 === 0 ? 8 : -8)],
                  y: [0, (p.id % 3 === 0 ? -10 : 6)],
                  opacity: [p.opacity, p.opacity * 2.5, p.opacity],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatType: 'reverse',
                }}
              />
            ))}

            {/* Calorie number */}
            <p
              className="text-6xl relative z-10"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 200,
                color: '#FFFFFF',
                textShadow: '0 0 20px rgba(212,175,55,0.7), 0 0 40px rgba(212,175,55,0.3)',
                letterSpacing: '-0.02em',
              }}
            >
              {Math.max(remaining, 0)}
            </p>
            <p
              className="text-[10px] uppercase tracking-[0.28em] mt-2 relative z-10"
              style={{ color: 'rgba(229,229,231,0.5)', fontFamily: 'Montserrat, sans-serif' }}
            >
              kcal left
            </p>
            <p
              className="text-[9px] uppercase tracking-[0.2em] mt-1 relative z-10"
              style={{ color: 'rgba(212,175,55,0.5)', fontFamily: 'Montserrat, sans-serif' }}
            >
              of {goal}
            </p>

            {/* Tap hint */}
            <p
              className="text-[8px] uppercase tracking-[0.2em] absolute bottom-6 z-10"
              style={{ color: 'rgba(212,175,55,0.3)', fontFamily: 'Montserrat, sans-serif' }}
            >
              tap for macros
            </p>
          </div>

          {/* ── BACK: Macros breakdown ── */}
          <div
            className="absolute inset-0 rounded-full flex flex-col items-center justify-center px-8"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'radial-gradient(circle at 38% 35%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)',
              border: '1px solid #D4AF37',
              boxShadow: '0 0 20px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(25px)',
            }}
          >
            <p
              className="text-[9px] uppercase tracking-[0.3em] mb-5"
              style={{ color: 'rgba(212,175,55,0.6)', fontFamily: 'Montserrat, sans-serif' }}
            >
              Macros Today
            </p>
            <div className="w-full">
              <MacroBar label="Protein" value={protein} goal={macroGoals.protein || 150} color="#BDB5D5" />
              <MacroBar label="Carbs"   value={carbs}   goal={macroGoals.carbs   || 250} color="#FFDAB9" />
              <MacroBar label="Fats"    value={fat}     goal={macroGoals.fat     || 70}  color="#FFDAB9" />
            </div>
            <p
              className="text-[8px] uppercase tracking-[0.2em] mt-3"
              style={{ color: 'rgba(212,175,55,0.3)', fontFamily: 'Montserrat, sans-serif' }}
            >
              tap to go back
            </p>
          </div>
        </motion.div>
      </div>

      {/* Sub-label */}
      <p
        className="text-[11px] uppercase tracking-[0.25em] mt-1"
        style={{ color: 'rgba(229,229,231,0.35)', fontFamily: 'Montserrat, sans-serif' }}
      >
        {consumed} consumed · {goal - consumed > 0 ? goal - consumed : 0} remaining
      </p>
    </div>
  );
}