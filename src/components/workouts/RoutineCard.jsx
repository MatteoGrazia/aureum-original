import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trash2, ChevronDown } from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';
import { useTheme } from '@/components/shared/ThemeContext';

const epley1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 1) return weight || 0;
  return Math.round(weight * (1 + reps / 30));
};

export default function RoutineCard({ routine, isExpanded, onToggle, onStart, onDelete, allLogs = [] }) {
  const { isDarkMode } = useTheme();
  const routineLogs = allLogs.filter(l =>
    l.routine_id === routine.id || l.routine_name === routine.name
  );
  const lastLog = routineLogs[0];

  // Ghost PR: best 1RM set across all logs for this routine
  let ghostPR = null;
  routineLogs.forEach(log => {
    (log.sets || []).filter(s => !s.is_warmup && s.weight && s.reps).forEach(s => {
      const rm = epley1RM(s.weight, s.reps);
      if (!ghostPR || rm > ghostPR.rm) {
        ghostPR = { rm, exercise: s.exercise_name, weight: s.weight, reps: s.reps };
      }
    });
  });

  return (
    <motion.div
      layout
      whileTap={{ scale: 1.015 }}
      onClick={onToggle}
      className="cursor-pointer rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        backdropFilter: 'blur(35px) saturate(180%)',
        background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255, 248, 220, 0.52)',
        border: isExpanded
          ? '0.5px solid rgba(212,175,55,0.6)'
          : `0.5px solid rgba(212,175,55,${isDarkMode ? '0.18' : '0.32'})`,
        boxShadow: isExpanded
          ? '0 0 40px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.03)'
          : isDarkMode
            ? '0 8px 40px rgba(0,0,0,0.5)'
            : '0 8px 32px rgba(180, 130, 30, 0.13)',
        padding: '18px',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 mr-3">
          {/* Routine name */}
          <h3
            className="text-white text-base mb-2"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
          >
            {routine.name}
          </h3>

          {/* Primary muscles */}
          {routine.target_muscles?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {routine.target_muscles.slice(0, 4).map(m => (
                <span
                  key={m}
                  className="text-[9px] uppercase tracking-wider capitalize px-2 py-0.5 rounded-full"
                  style={{
                    color: 'rgba(212,175,55,0.6)',
                    background: 'rgba(212,175,55,0.07)',
                    border: '0.5px solid rgba(212,175,55,0.15)',
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          )}

          {/* Last session volume */}
          {lastLog?.total_volume > 0 && (
            <p className="text-[10px] text-white/25 mb-1">
              Last session:{' '}
              <span className="text-white/40">{(lastLog.total_volume / 1000).toFixed(1)}k kg</span>
            </p>
          )}

          {/* Ghost PR */}
          {ghostPR && (
            <p
              className="text-[11px]"
              style={{
                color: '#D4AF37',
                textShadow: '0 0 10px rgba(212,175,55,0.45)',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 300,
              }}
            >
              ↑ {ghostPR.weight}kg × {ghostPR.reps} — {ghostPR.exercise}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(e, routine.id); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,60,60,0.07)' }}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400/50" />
          </button>
          <ChevronDown
            className={`w-5 h-5 text-white/20 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 pt-4"
            style={{ borderTop: '0.5px solid rgba(212,175,55,0.12)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-2 mb-4">
              {routine.exercises?.map((ex, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-white/45 text-sm">{ex.exercise_name}</span>
                  <span className="text-white/20 text-xs">{ex.sets} × {ex.reps}</span>
                </div>
              ))}
            </div>
            <GoldButton
              onClick={(e) => { e.stopPropagation(); onStart(routine); }}
              className="w-full flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Workout
            </GoldButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}