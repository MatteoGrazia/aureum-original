import React from 'react';
import { motion } from 'framer-motion';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

const MUSCLE_ORDER = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'glutes', 'core'];

const KEYWORDS = {
  chest: ['bench', 'fly', 'chest', 'pec', 'push-up'],
  back: ['row', 'pulldown', 'pull-up', 'pullup', 'deadlift', 'lat', 'back'],
  legs: ['squat', 'leg press', 'lunge', 'leg curl', 'romanian', 'leg extension'],
  shoulders: ['shoulder', 'lateral', 'overhead', 'ohp', 'press'],
  biceps: ['curl', 'bicep'],
  triceps: ['tricep', 'pushdown', 'extension', 'dip'],
  glutes: ['hip thrust', 'glute'],
  core: ['plank', 'crunch', 'ab', 'core'],
};

const inferMuscle = (exerciseName = '', storedMuscle) => {
  if (storedMuscle && MUSCLE_ORDER.includes(storedMuscle)) return storedMuscle;
  const lower = exerciseName.toLowerCase();
  for (const [muscle, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return muscle;
  }
  return null;
};

export default function WeeklyMuscleVolume({ logs = [] }) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const volumeByMuscle = {};

  logs.forEach(log => {
    let logDate;
    try { logDate = parseISO(log.date); } catch { return; }
    if (!isWithinInterval(logDate, { start: weekStart, end: weekEnd })) return;

    (log.sets || []).filter(s => !s.is_warmup && s.weight > 0 && s.reps > 0).forEach(s => {
      const muscle = inferMuscle(s.exercise_name, s.muscle_group);
      if (!muscle) return;
      volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + s.weight * s.reps;
    });
  });

  const muscles = MUSCLE_ORDER.filter(m => volumeByMuscle[m]);
  if (muscles.length === 0) return null;

  const maxVol = Math.max(...muscles.map(m => volumeByMuscle[m]));

  return (
    <div className="mb-28">
      <p
        className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-4"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        Weekly Volume
      </p>

      <div className="space-y-4">
        {muscles.map((muscle, i) => {
          const vol = volumeByMuscle[muscle];
          const pct = maxVol > 0 ? vol / maxVol : 0;
          return (
            <div key={muscle}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/35 text-xs capitalize">{muscle}</span>
                <span className="text-white/20 text-[10px]">
                  {vol >= 1000 ? `${(vol / 1000).toFixed(1)}k` : Math.round(vol)} kg
                </span>
              </div>
              <div
                className="h-px rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(to right, rgba(212,175,55,0.35), rgba(244,208,63,0.85))',
                    boxShadow: '0 0 6px rgba(212,175,55,0.4)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct * 100}%` }}
                  transition={{ duration: 0.9, delay: i * 0.06, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}