import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';

const MUSCLES = ['all','chest','back','shoulders','biceps','triceps','legs','core','glutes','forearms','calves'];
const EQUIPMENT = ['all','barbell','dumbbell','cable','machine','bodyweight','kettlebell','bands'];

function MuscleIcon({ muscle, size = 16, color }) {
  const paths = {
    chest:     <><path d="M4 10 Q8 5 12 10 Q8 15 4 10z M20 10 Q16 5 12 10 Q16 15 20 10z"/></>,
    back:      <><line x1="7" y1="4" x2="7" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    shoulders: <><circle cx="7" cy="9" r="3.5"/><circle cx="17" cy="9" r="3.5"/><line x1="10.5" y1="9" x2="13.5" y2="9"/></>,
    biceps:    <><path d="M7 18 Q4 12 8 8 Q12 4 15 7 Q18 10 16 15"/></>,
    triceps:   <><path d="M6 7 Q4 12 7 16 Q10 20 14 18 Q18 16 18 11 Q17 7 13 6"/></>,
    legs:      <><path d="M9 4 L9 12 L7 20 M15 4 L15 12 L17 20 M9 12 L15 12"/></>,
    core:      <><rect x="7" y="4" width="4" height="3" rx="0.8"/><rect x="13" y="4" width="4" height="3" rx="0.8"/><rect x="7" y="9" width="4" height="3" rx="0.8"/><rect x="13" y="9" width="4" height="3" rx="0.8"/><rect x="7" y="14" width="4" height="3" rx="0.8"/><rect x="13" y="14" width="4" height="3" rx="0.8"/></>,
    glutes:    <><path d="M5 14 Q5 7 12 6 Q19 7 19 14 Q19 21 12 22 Q5 21 5 14z"/></>,
    forearms:  <><path d="M10 3 L8 20 M14 3 L16 20 M8 11 L16 9"/></>,
    calves:    <><path d="M9 4 Q7 10 9 14 Q11 18 12 21 Q13 18 15 14 Q17 10 15 4"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {paths[muscle] || <circle cx="12" cy="12" r="8"/>}
    </svg>
  );
}

export default function ExercisePicker({ exercises, onSelect, onClose, mode = 'add', previousWorkoutSets = {} }) {
  const { isDarkMode } = useTheme();
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [equipFilter, setEquipFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const sectionRefs = useRef({});

  const iconColor = isDarkMode ? '#D4AF37' : '#9C7E46';
  const bg = isDarkMode ? '#0a0a0a' : '#F5F5F2';
  const cardBg = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.75)';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(29,29,31,0.4)';
  const borderColor = isDarkMode ? 'rgba(212,175,55,0.15)' : 'rgba(225,193,110,0.38)';

  const filtered = useMemo(() => {
    const seen = new Set();
    return exercises
      .filter(ex => {
        if (seen.has(ex.name)) return false;
        seen.add(ex.name);
        const s = !search || ex.name.toLowerCase().includes(search.toLowerCase()) ||
          (ex.muscle_group || '').toLowerCase().includes(search.toLowerCase()) ||
          (ex.equipment || '').toLowerCase().includes(search.toLowerCase());
        const m = muscleFilter === 'all' || ex.muscle_group === muscleFilter;
        const e = equipFilter === 'all' || ex.equipment === equipFilter;
        return s && m && e;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, search, muscleFilter, equipFilter]);

  const letterGroups = useMemo(() => {
    const groups = {};
    filtered.forEach(ex => {
      const l = ex.name[0].toUpperCase();
      if (!groups[l]) groups[l] = [];
      groups[l].push(ex);
    });
    return groups;
  }, [filtered]);

  const letters = Object.keys(letterGroups).sort();

  const jumpTo = (letter) => {
    sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: bg }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 flex-shrink-0">
        <h2 className="text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: textPrimary }}>
          {mode === 'replace' ? 'Replace Exercise' : 'Add Exercise'}
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
        >
          <X className="w-5 h-5" style={{ color: textPrimary }} />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 mb-3 flex-shrink-0">
        <div className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: cardBg, border: `0.5px solid ${borderColor}` }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: textMuted }} />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, muscle, equipment..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ fontFamily: 'Montserrat, sans-serif', color: textPrimary }}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X className="w-4 h-4" style={{ color: textMuted }} />
            </button>
          )}
        </div>
      </div>

      {/* Muscle filters */}
      <div className="px-5 mb-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 pb-1">
          {MUSCLES.map(m => (
            <button
              key={m}
              onClick={() => setMuscleFilter(m)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs capitalize transition-all"
              style={{
                background: muscleFilter === m
                  ? (isDarkMode ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.12)')
                  : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                color: muscleFilter === m ? '#D4AF37' : textMuted,
                border: `0.5px solid ${muscleFilter === m ? 'rgba(212,175,55,0.4)' : borderColor}`,
              }}
            >
              {m !== 'all' && <MuscleIcon muscle={m} size={11} color={muscleFilter === m ? '#D4AF37' : textMuted} />}
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment filters */}
      <div className="px-5 mb-3 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 pb-1">
          {EQUIPMENT.map(eq => (
            <button
              key={eq}
              onClick={() => setEquipFilter(eq)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs capitalize transition-all"
              style={{
                background: equipFilter === eq
                  ? (isDarkMode ? 'rgba(156,126,70,0.15)' : 'rgba(156,126,70,0.12)')
                  : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                color: equipFilter === eq ? iconColor : textMuted,
                border: `0.5px solid ${equipFilter === eq ? 'rgba(156,126,70,0.4)' : borderColor}`,
              }}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      {/* List + A-Z jumper */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-y-auto px-5 pb-10" style={{ paddingRight: '2.2rem' }}>
          {letters.map(letter => (
            <div key={letter} ref={el => { sectionRefs.current[letter] = el; }}>
              <p className="text-[10px] uppercase tracking-widest pt-3 pb-1.5 px-1"
                style={{ color: isDarkMode ? 'rgba(212,175,55,0.4)' : 'rgba(156,126,70,0.55)', fontFamily: 'Montserrat' }}>
                {letter}
              </p>
              <div className="space-y-1">
                {letterGroups[letter].map(ex => {
                  const ghostSets = (previousWorkoutSets[ex.name] || []).filter(s => !s.is_warmup && s.weight > 0);
                  const topSet = [...ghostSets].sort((a, b) => (b.weight * b.reps) - (a.weight * a.reps))[0];
                  return (
                    <button
                      key={ex.id}
                      onClick={() => setSelected(ex)}
                      className="w-full px-3 py-3 rounded-xl text-left flex items-center gap-3 transition-all active:scale-[0.98]"
                      style={{ background: cardBg, border: `0.5px solid ${borderColor}` }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: isDarkMode ? 'rgba(212,175,55,0.08)' : 'rgba(156,126,70,0.1)' }}
                      >
                        <MuscleIcon muscle={ex.muscle_group} size={16} color={iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ fontFamily: 'Montserrat, sans-serif', color: textPrimary }}>{ex.name}</p>
                        <p className="text-[11px] capitalize mt-0.5" style={{ color: textMuted }}>{ex.muscle_group} · {ex.equipment}</p>
                      </div>
                      {topSet && (
                        <span className="text-[10px] flex-shrink-0 tabular-nums" style={{ color: isDarkMode ? 'rgba(212,175,55,0.65)' : '#9C7E46' }}>
                          ↑ {topSet.weight}kg
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-20 text-sm" style={{ color: textMuted }}>No exercises found</p>
          )}
        </div>

        {/* A-Z scroll jumper */}
        {letters.length > 4 && (
          <div className="absolute right-0.5 top-0 bottom-0 flex flex-col justify-center py-4">
            {letters.map(letter => (
              <button
                key={letter}
                onClick={() => jumpTo(letter)}
                className="w-5 py-px text-[9px] text-center transition-all"
                style={{ color: isDarkMode ? 'rgba(212,175,55,0.6)' : 'rgba(156,126,70,0.75)', fontFamily: 'Montserrat' }}
              >
                {letter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail bottom sheet */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl z-10"
            style={{
              background: isDarkMode
                ? 'linear-gradient(180deg, rgba(18,14,5,0.98) 0%, rgba(12,10,4,1) 100%)'
                : 'linear-gradient(180deg, rgba(255,252,240,0.98) 0%, rgba(255,248,220,1) 100%)',
              backdropFilter: 'blur(25px)',
              border: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.25)' : 'rgba(225,193,110,0.5)'}`,
              borderBottom: 'none',
              padding: '20px 24px calc(40px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5"
              style={{ background: isDarkMode ? 'rgba(212,175,55,0.25)' : 'rgba(156,126,70,0.3)' }} />

            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: isDarkMode ? 'rgba(212,175,55,0.1)' : 'rgba(156,126,70,0.12)',
                  border: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.2)' : 'rgba(156,126,70,0.25)'}`,
                }}
              >
                <MuscleIcon muscle={selected.muscle_group} size={28} color={iconColor} />
              </div>
              <div className="flex-1">
                <h3 className="text-base" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: textPrimary }}>
                  {selected.name}
                </h3>
                <p className="text-xs capitalize mt-1" style={{ color: textMuted }}>
                  {selected.muscle_group} · {selected.equipment}
                </p>
              </div>
              <button onClick={() => setSelected(null)}>
                <X className="w-5 h-5" style={{ color: textMuted }} />
              </button>
            </div>

            {/* Ghost PRs */}
            {(() => {
              const sets = (previousWorkoutSets[selected.name] || []).filter(s => !s.is_warmup && s.weight > 0);
              if (!sets.length) return null;
              return (
                <div className="mb-5 p-4 rounded-2xl"
                  style={{
                    background: isDarkMode ? 'rgba(212,175,55,0.07)' : 'rgba(156,126,70,0.08)',
                    border: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.2)' : 'rgba(156,126,70,0.25)'}`,
                  }}
                >
                  <p className="text-[10px] uppercase tracking-[0.25em] mb-3"
                    style={{ color: isDarkMode ? 'rgba(212,175,55,0.6)' : '#9C7E46', fontFamily: 'Montserrat' }}>
                    Previous Session
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sets.slice(0, 5).map((s, idx) => (
                      <div key={idx} className="flex flex-col items-center px-3 py-2 rounded-xl"
                        style={{ background: isDarkMode ? 'rgba(212,175,55,0.06)' : 'rgba(156,126,70,0.08)' }}>
                        <span className="text-sm tabular-nums" style={{ color: iconColor, fontFamily: 'Montserrat' }}>
                          {s.weight}kg
                        </span>
                        <span className="text-[10px]" style={{ color: textMuted }}>× {s.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-3.5 rounded-2xl text-sm"
                style={{ background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: textMuted }}
              >
                Back
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { onSelect(selected); setSelected(null); }}
                className="flex-[2] py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)', color: '#0a0a0a', fontFamily: 'Montserrat, sans-serif' }}
              >
                <Plus className="w-4 h-4" />
                Add to Routine
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}