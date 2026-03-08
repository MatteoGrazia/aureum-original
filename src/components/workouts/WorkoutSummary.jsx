import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Target } from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';
import VoidCard from '@/components/ui/VoidCard';

const MUSCLE_DATA = {
  'Bench Press': { primary: ['Chest'], secondary: ['Front Deltoids', 'Triceps'] },
  'Squat': { primary: ['Quads'], secondary: ['Glutes', 'Hamstrings', 'Core'] },
  'Deadlift': { primary: ['Back', 'Hamstrings'], secondary: ['Glutes', 'Core', 'Forearms'] },
  'Shoulder Press': { primary: ['Shoulders'], secondary: ['Triceps', 'Core'] },
  'Barbell Row': { primary: ['Back'], secondary: ['Biceps', 'Rear Deltoids'] },
  'Pull-ups': { primary: ['Back'], secondary: ['Biceps', 'Core'] },
  'Dumbbell Curl': { primary: ['Biceps'], secondary: ['Forearms'] },
  'Tricep Pushdown': { primary: ['Triceps'], secondary: ['Forearms'] },
  'Leg Press': { primary: ['Quads'], secondary: ['Glutes', 'Hamstrings'] },
  'Lat Pulldown': { primary: ['Back'], secondary: ['Biceps'] },
  'Incline Dumbbell Press': { primary: ['Upper Chest'], secondary: ['Front Deltoids', 'Triceps'] },
  'Romanian Deadlift': { primary: ['Hamstrings'], secondary: ['Glutes', 'Lower Back'] },
  'Plank': { primary: ['Core'], secondary: ['Shoulders', 'Glutes'] },
  'Cable Fly': { primary: ['Chest'], secondary: ['Front Deltoids'] },
  'Hip Thrust': { primary: ['Glutes'], secondary: ['Hamstrings', 'Core'] },
};

export default function WorkoutSummary({ summary, onDone }) {
  const { routineName, duration, totalVolume, exercises } = summary;

  const primaryMuscles = new Set();
  const secondaryMuscles = new Set();
  exercises.forEach(ex => {
    const data = MUSCLE_DATA[ex.exercise_name] || { primary: [ex.muscle_group || 'General'], secondary: [] };
    data.primary.forEach(m => primaryMuscles.add(m));
    data.secondary.forEach(m => secondaryMuscles.add(m));
  });
  [...primaryMuscles].forEach(m => secondaryMuscles.delete(m));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: '#080808' }}
    >
      <div className="p-5 pt-16 pb-32">
        {/* Trophy header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mx-auto mb-5"
            style={{ border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <Trophy className="w-10 h-10 text-[#D4AF37]" strokeWidth={1.5} />
          </motion.div>
          <h1
            className="text-2xl tracking-[0.4em]"
            style={{
              fontFamily: 'Montserrat, sans-serif', fontWeight: 400,
              background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            COMPLETE
          </h1>
          <p className="text-white/40 text-sm mt-2">{routineName}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <VoidCard>
            <p className="text-white/35 text-[10px] uppercase tracking-wider">Duration</p>
            <p className="text-[#D4AF37] text-2xl mt-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {duration}m
            </p>
          </VoidCard>
          <VoidCard>
            <p className="text-white/35 text-[10px] uppercase tracking-wider">Total Volume</p>
            <p className="text-[#D4AF37] text-2xl mt-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {totalVolume.toLocaleString()}
            </p>
            <p className="text-white/25 text-xs">kg lifted</p>
          </VoidCard>
        </div>

        {/* Exercise breakdown */}
        <div className="space-y-2 mb-5">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">Exercise Breakdown</h3>
          {exercises.map((ex, i) => {
            const done = ex.sets.filter(s => s.completed);
            if (done.length === 0) return null;
            const vol = done.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
            const topSet = [...done].sort((a, b) => (b.weight * b.reps) - (a.weight * a.reps))[0];
            return (
              <VoidCard key={i}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {ex.exercise_name}
                    </p>
                    <p className="text-white/35 text-xs mt-0.5">{done.length} sets completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#D4AF37] text-sm">{vol.toLocaleString()} kg</p>
                    <p className="text-white/25 text-xs">volume</p>
                  </div>
                </div>
                {topSet && topSet.weight > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#D4AF37]/70" />
                    <span className="text-white/50 text-xs">
                      Top set: {topSet.weight}kg × {topSet.reps} reps
                    </span>
                  </div>
                )}
              </VoidCard>
            );
          })}
        </div>

        {/* Muscle analytics */}
        <VoidCard className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-white text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Muscles Trained
            </h3>
          </div>
          {primaryMuscles.size > 0 && (
            <div className="mb-3">
              <p className="text-[9px] uppercase tracking-widest text-[#D4AF37]/50 mb-2">Primary</p>
              <div className="flex flex-wrap gap-2">
                {[...primaryMuscles].map(m => (
                  <span
                    key={m}
                    className="px-3 py-1 rounded-full text-[#D4AF37] text-xs border border-[#D4AF37]/20"
                    style={{ background: 'rgba(212,175,55,0.12)' }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
          {secondaryMuscles.size > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/25 mb-2">Secondary</p>
              <div className="flex flex-wrap gap-2">
                {[...secondaryMuscles].map(m => (
                  <span key={m} className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-xs">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </VoidCard>

        <GoldButton onClick={onDone} className="w-full py-4">Done</GoldButton>
      </div>
    </motion.div>
  );
}