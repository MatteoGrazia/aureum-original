import React from 'react';
import { motion } from 'framer-motion';

export const MACRO_TONES = {
  protein: '#FFDAB9', // Core Apricot
  carbs:   '#FFE5CC', // Pale Amber
  fat:     '#E1A95F', // Deep Ochre
};

/**
 * Returns the dominant macro color based on caloric contribution.
 * protein & carbs = 4 kcal/g, fat = 9 kcal/g
 */
export function getDominantMacroColor(protein = 0, carbs = 0, fat = 0) {
  const p = protein * 4;
  const c = carbs * 4;
  const f = fat * 9;
  if (p >= c && p >= f) return MACRO_TONES.protein;
  if (c >= p && c >= f) return MACRO_TONES.carbs;
  return MACRO_TONES.fat;
}

/**
 * A single thin bar split proportionally among protein / carbs / fat
 * using the Apricot Tonal Palette.
 */
export default function MacroMicroBar({ protein = 0, carbs = 0, fat = 0, className = '' }) {
  const pCal = protein * 4;
  const cCal = carbs * 4;
  const fCal = fat * 9;
  const total = pCal + cCal + fCal || 1;

  const segments = [
    { color: MACRO_TONES.protein, pct: (pCal / total) * 100 },
    { color: MACRO_TONES.carbs,   pct: (cCal / total) * 100 },
    { color: MACRO_TONES.fat,     pct: (fCal / total) * 100 },
  ].filter(s => s.pct > 0);

  return (
    <div className={`flex h-[2px] rounded-full overflow-hidden ${className}`} style={{ background: 'rgba(229,229,231,0.08)' }}>
      {segments.map((seg, i) => (
        <motion.div
          key={i}
          initial={{ width: 0 }}
          animate={{ width: `${seg.pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.12 }}
          style={{
            background: seg.color,
            boxShadow: `0 0 4px ${seg.color}80`,
            height: '100%'
          }}
        />
      ))}
    </div>
  );
}