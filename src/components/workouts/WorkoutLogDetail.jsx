import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Clock, Flame, Dumbbell } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';

const muscleColors = {
  chest: '#D4AF37', back: '#BFA68F', shoulders: '#F4D03F',
  biceps: '#D4AF37', triceps: '#BFA68F', legs: '#F4D03F',
  core: '#9C7E46', glutes: '#D4AF37', forearms: '#BFA68F', calves: '#9C7E46',
};

export default function WorkoutLogDetail({ log, onBack }) {
  if (!log) return null;

  // Group sets by exercise
  const grouped = {};
  (log.sets || []).forEach(s => {
    if (!grouped[s.exercise_name]) grouped[s.exercise_name] = [];
    grouped[s.exercise_name].push(s);
  });

  const workingSets = (log.sets || []).filter(s => !s.is_warmup);
  const totalSets = workingSets.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="relative z-10 p-5 pb-32"
    >
      {/* Header */}
      <div className="flex items-center gap-4 pt-8 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)' }}
        >
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
        <div>
          <h2 className="text-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {log.routine_name || 'Workout'}
          </h2>
          <p className="text-white/30 text-xs mt-0.5">
            {format(new Date(log.date), 'EEEE, MMMM d yyyy')}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Clock, label: 'Duration', value: log.duration_minutes ? `${log.duration_minutes}m` : '—' },
          { icon: Dumbbell, label: 'Sets', value: totalSets },
          { icon: Flame, label: 'Volume', value: log.total_volume ? `${Math.round(log.total_volume / 1000)}k` : '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl py-4 flex flex-col items-center gap-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(212,175,55,0.15)' }}
          >
            <Icon className="w-4 h-4 text-[#D4AF37]/60" strokeWidth={1.5} />
            <p className="text-white text-base" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>{value}</p>
            <p className="text-white/25 text-[9px] uppercase tracking-widest">{label}</p>
          </div>
        ))}
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Exercises
        </p>
        {Object.entries(grouped).map(([exerciseName, sets]) => {
          const workSets = sets.filter(s => !s.is_warmup);
          const warmupSets = sets.filter(s => s.is_warmup);
          const topSet = [...workSets].sort((a, b) => (b.weight * b.reps) - (a.weight * a.reps))[0];
          return (
            <VoidCard key={exerciseName} style={{ padding: '14px 16px' }}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-white text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{exerciseName}</p>
                {topSet && (
                  <p className="text-[#D4AF37] text-xs">
                    {topSet.weight}kg × {topSet.reps}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                {warmupSets.length > 0 && warmupSets.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-white/20 text-xs uppercase tracking-widest">W{i + 1}</span>
                    <span className="text-white/30 text-xs">{s.weight > 0 ? `${s.weight}kg` : 'BW'} × {s.reps}</span>
                  </div>
                ))}
                {workSets.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-white/35 text-xs">{i + 1}</span>
                    <div className="flex items-center gap-3">
                      {s.rpe > 0 && (
                        <span className="text-white/20 text-[10px]">RPE {s.rpe}</span>
                      )}
                      <span className="text-white/60 text-xs">{s.weight > 0 ? `${s.weight}kg` : 'BW'} × {s.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </VoidCard>
          );
        })}
        {Object.keys(grouped).length === 0 && (
          <VoidCard className="py-10 text-center">
            <p className="text-white/30 text-sm">No set data recorded</p>
          </VoidCard>
        )}
      </div>
    </motion.div>
  );
}