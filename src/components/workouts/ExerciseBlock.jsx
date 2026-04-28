import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import SetRow from './SetRow';
import { useTheme } from '@/components/shared/ThemeContext';

const playSetBell = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Two-tone premium bell: fundamental + harmonic
    [[880, 0, 0.18], [1760, 0, 0.09], [880, 0.06, 0.12]].forEach(([freq, delay, vol]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      osc.start(t);
      osc.stop(t + 0.9);
    });
  } catch (_) {}
};

const createSet = (type = 'normal', weight = 0, reps = 0) => ({
  id: Math.random().toString(36).slice(2),
  type,
  weight,
  reps,
  rpe: 7,
  completed: false,
});

const epley1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 1) return weight || 0;
  return Math.round(weight * (1 + reps / 30));
};

const BODYWEIGHT_EQUIPMENT = ['bodyweight'];

export default function ExerciseBlock({ exercise, onUpdate, onStructuralUpdate, onReplace, onTimerStart, previousSets = [], userWeight = 70 }) {
  const isBodyweight = BODYWEIGHT_EQUIPMENT.includes(exercise.equipment);
  const { isDarkMode } = useTheme();

  const addSet = (type = 'normal') => {
    const last = exercise.sets[exercise.sets.length - 1];
    const weight = isBodyweight ? userWeight : (last?.weight || 0);
    const newSet = createSet(type, weight, last?.reps || 0);
    onStructuralUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const deleteSet = (i) => {
    if (exercise.sets.length <= 1) return;
    onStructuralUpdate({ ...exercise, sets: exercise.sets.filter((_, idx) => idx !== i) });
  };

  const updateSet = (i, updated) => {
    const sets = [...exercise.sets];
    sets[i] = updated;
    onUpdate({ ...exercise, sets });
  };

  const completeSet = (i, updated) => {
    const sets = [...exercise.sets];
    sets[i] = updated;
    onUpdate({ ...exercise, sets });
    if (updated.completed) {
      if ('vibrate' in navigator) navigator.vibrate(50);
      playSetBell();
      onTimerStart(exercise);
    }
  };

  const completedCount = exercise.sets.filter(s => s.completed).length;

  // Calculate the 90-day peak 1RM for PR detection from previousSets
  const peak1RM = previousSets.reduce((max, s) => {
    const rm = epley1RM(s.weight, s.reps);
    return rm > max ? rm : max;
  }, 0);

  const imgSrc = isDarkMode ? (exercise.image_url_dark || exercise.image_url) : exercise.image_url;

  const cardBg = isDarkMode ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.88)';
  const cardBorder = isDarkMode ? '0.5px solid rgba(212,175,55,0.12)' : '0.5px solid rgba(184,148,31,0.18)';
  const gold = isDarkMode ? '#9C7E46' : '#7A6318';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1E1C18';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(30,28,24,0.50)';
  const colHeaderColor = isDarkMode ? 'rgba(255,255,255,0.20)' : 'rgba(30,28,24,0.35)';
  const addBtnBg = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(30,28,24,0.05)';
  const addBtnColor = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(30,28,24,0.50)';
  const replaceBtnBg = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(30,28,24,0.06)';
  const replaceBtnBorder = isDarkMode ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(30,28,24,0.15)';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: cardBg, border: cardBorder, boxShadow: isDarkMode ? 'none' : '0 1px 8px rgba(0,0,0,0.05)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-1">
        <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
          {imgSrc && (
            <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.2)' : 'rgba(184,148,31,0.25)'}`, background: '#ffffff' }}>
              <img src={imgSrc} alt={exercise.exercise_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base truncate" style={{ color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}>
              {exercise.exercise_name}
            </h3>
            <p className="text-xs capitalize mt-0.5" style={{ color: textMuted }}>
              {exercise.muscle_group && `${exercise.muscle_group} · `}
              {completedCount}/{exercise.sets.length} sets
              {exercise.default_rest && (
                <span style={{ color: gold, opacity: 0.8 }} className="ml-1">· {exercise.default_rest}s rest</span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={onReplace}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          style={{ background: replaceBtnBg, border: replaceBtnBorder }}
        >
          <RefreshCw className="w-3 h-3" style={{ color: textMuted }} />
          <span className="text-xs" style={{ color: textMuted }}>Replace</span>
        </button>
      </div>

      {/* Previous session ghost label */}
      {previousSets.length > 0 && (
        <div className="px-4 pb-1">
          <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: gold, fontFamily: 'Montserrat, sans-serif' }}>
            Last session · {previousSets[0]?.weight}kg × {previousSets[0]?.reps}
          </p>
        </div>
      )}

      {/* Column headers */}
      <div className="flex items-center gap-2 px-4 pt-1 pb-0.5">
        <div className="w-7" />
        <div className="w-4" />
        <div className="flex-1 text-center text-[9px] uppercase tracking-widest" style={{ color: colHeaderColor }}>Weight</div>
        <div className="w-4" />
        <div className="flex-1 text-center text-[9px] uppercase tracking-widest" style={{ color: colHeaderColor }}>Reps</div>
        <div className="w-9" />
        <div className="w-7" />
      </div>

      {/* Sets */}
      <div className="px-3 space-y-1.5 pb-2">
        {exercise.sets.map((set, i) => (
          <SetRow
            key={set.id}
            set={set}
            index={i}
            onUpdate={updated => updateSet(i, updated)}
            onDelete={() => deleteSet(i)}
            onComplete={updated => completeSet(i, updated)}
            previousSet={previousSets[i] || previousSets[0] || null}
            peak1RM={peak1RM}
            isBodyweight={isBodyweight}
          />
        ))}
      </div>

      {/* Add set buttons */}
      <div className="flex gap-2 px-3 pb-4">
        <button
          onClick={() => addSet('normal')}
          className="flex-1 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          style={{ background: addBtnBg, color: addBtnColor }}
        >
          <Plus className="w-3 h-3" />
          Add Set
        </button>
        <button
          onClick={() => addSet('warmup')}
          className="px-3 py-2.5 rounded-xl text-xs transition-colors"
          style={{ background: isDarkMode ? 'rgba(245,158,11,0.10)' : 'rgba(180,83,9,0.08)', color: isDarkMode ? 'rgba(251,191,36,0.85)' : '#b45309' }}
        >
          + Warm-up
        </button>
        <button
          onClick={() => addSet('dropset')}
          className="px-3 py-2.5 rounded-xl text-xs transition-colors"
          style={{ background: isDarkMode ? 'rgba(59,130,246,0.10)' : 'rgba(29,78,216,0.08)', color: isDarkMode ? 'rgba(96,165,250,0.85)' : '#1d4ed8' }}
        >
          + Drop
        </button>
      </div>
    </div>
  );
}