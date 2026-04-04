import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trash2, ChevronDown, Pencil } from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';
import { useTheme } from '@/components/shared/ThemeContext';

const epley1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 1) return weight || 0;
  return Math.round(weight * (1 + reps / 30));
};

const darkFilter = 'invert(1) hue-rotate(60deg) saturate(0.6) brightness(1.1)';
const lightFilter = 'hue-rotate(240deg) saturate(0.45) brightness(1.05)';

// Muscle-group fallback icon SVG for consistent look
function MuscleIcon({ muscle, size = 18, color = '#D4AF37' }) {
  const paths = {
    chest:     <><path d="M4 10 Q8 5 12 10 Q8 15 4 10z" fill={color} fillOpacity={0.3}/><path d="M20 10 Q16 5 12 10 Q16 15 20 10z" fill={color} fillOpacity={0.3}/></>,
    back:      <><line x1="7" y1="4" x2="7" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    shoulders: <><circle cx="7" cy="9" r="3.5"/><circle cx="17" cy="9" r="3.5"/></>,
    biceps:    <><path d="M7 18 Q4 12 8 8 Q12 4 15 7 Q18 10 16 15"/></>,
    triceps:   <><path d="M6 7 Q4 12 7 16 Q10 20 14 18 Q18 16 18 11 Q17 7 13 6"/></>,
    legs:      <><path d="M9 4 L9 12 L7 20 M15 4 L15 12 L17 20 M9 12 L15 12"/></>,
    core:      <><rect x="7" y="4" width="4" height="3" rx="0.8"/><rect x="13" y="4" width="4" height="3" rx="0.8"/><rect x="7" y="9" width="4" height="3" rx="0.8"/><rect x="13" y="9" width="4" height="3" rx="0.8"/></>,
    glutes:    <><path d="M5 14 Q5 7 12 6 Q19 7 19 14 Q19 21 12 22 Q5 21 5 14z" fill={color} fillOpacity={0.2}/></>,
    forearms:  <><path d="M10 3 L8 20 M14 3 L16 20 M8 11 L16 9"/></>,
    calves:    <><path d="M9 4 Q7 10 9 14 Q11 18 12 21 Q13 18 15 14 Q17 10 15 4"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {paths[muscle] || <circle cx="12" cy="12" r="8"/>}
    </svg>
  );
}

export default function RoutineCard({ routine, isExpanded, onToggle, onStart, onDelete, onEdit, allLogs = [], allExercises = [] }) {
  const exerciseImageMap = React.useMemo(() => {
    const map = {};
    allExercises.forEach(ex => { if (ex.name && ex.image_url) map[ex.name] = ex.image_url; });
    return map;
  }, [allExercises]);
  const { isDarkMode } = useTheme();
  const routineLogs = allLogs.filter(l =>
    l.routine_id === routine.id || l.routine_name === routine.name
  );
  const lastLog = routineLogs[0];

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
        background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
        border: isExpanded
          ? '0.5px solid rgba(212,175,55,0.6)'
          : '0.5px solid rgba(212,175,55,0.18)',
        boxShadow: isExpanded
          ? '0 0 40px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.03)'
          : isDarkMode
            ? '0 8px 40px rgba(0,0,0,0.5)'
            : '0 10px 30px rgba(225,193,110,0.15)',
        padding: '18px',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-white text-base mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
            {routine.name}
          </h3>

          {routine.target_muscles?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {routine.target_muscles.slice(0, 4).map(m => (
                <span key={m} className="text-[9px] uppercase tracking-wider capitalize px-2 py-0.5 rounded-full"
                  style={{ color: 'rgba(212,175,55,0.6)', background: 'rgba(212,175,55,0.07)', border: '0.5px solid rgba(212,175,55,0.15)' }}>
                  {m}
                </span>
              ))}
            </div>
          )}

          {lastLog?.total_volume > 0 && (
            <p className="text-[10px] text-white/25 mb-1">
              Last session: <span className="text-white/40">{(lastLog.total_volume / 1000).toFixed(1)}k kg</span>
            </p>
          )}

          {ghostPR && (
            <p className="text-[11px]" style={{ color: '#D4AF37', textShadow: '0 0 10px rgba(212,175,55,0.45)', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
              ↑ {ghostPR.weight}kg × {ghostPR.reps} — {ghostPR.exercise}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(routine); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.08)', border: '0.5px solid rgba(212,175,55,0.2)' }}
            >
              <Pencil className="w-3.5 h-3.5 text-[#D4AF37]/60" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(e, routine.id); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,60,60,0.07)' }}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400/50" />
          </button>
          <ChevronDown className={`w-5 h-5 text-white/20 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
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
              {routine.exercises?.map((ex, i) => {
                return (
                  <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-xl"
                    style={{ background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                    {/* Anatomy image */}
                    <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '0.5px solid rgba(212,175,55,0.2)', background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {exerciseImageMap[ex.exercise_name] ? (
                        <img
                          src={exerciseImageMap[ex.exercise_name]}
                          alt={ex.exercise_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <MuscleIcon muscle={ex.muscle_group} size={18} color={isDarkMode ? '#D4AF37' : '#9C7E46'} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-sm truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{ex.exercise_name}</p>
                      {/* Sets stacked */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.from({ length: ex.sets || 1 }).map((_, si) => (
                          <div key={si} className="text-[9px] px-2 py-0.5 rounded"
                            style={{ background: 'rgba(212,175,55,0.08)', color: 'rgba(212,175,55,0.5)', border: '0.5px solid rgba(212,175,55,0.12)', fontFamily: 'Montserrat, sans-serif' }}>
                            Set {si + 1} · {ex.reps} reps
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <GoldButton
                onClick={(e) => { e.stopPropagation(); onStart(routine); }}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Workout
              </GoldButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}