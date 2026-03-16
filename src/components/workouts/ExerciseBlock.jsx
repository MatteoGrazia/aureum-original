import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import SetRow from './SetRow';

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

export default function ExerciseBlock({ exercise, onUpdate, onStructuralUpdate, onReplace, onTimerStart, previousSets = [] }) {

  const addSet = (type = 'normal') => {
    const last = exercise.sets[exercise.sets.length - 1];
    const newSet = createSet(type, last?.weight || 0, last?.reps || 0);
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

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '0.5px solid rgba(212,175,55,0.12)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-1">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-white text-base truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {exercise.exercise_name}
          </h3>
          <p className="text-white/35 text-xs capitalize mt-0.5">
            {exercise.muscle_group && `${exercise.muscle_group} · `}
            {completedCount}/{exercise.sets.length} sets
            {exercise.default_rest && (
              <span className="text-[#9C7E46]/70 ml-1">· {exercise.default_rest}s rest</span>
            )}
          </p>
        </div>
        <button
          onClick={onReplace}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <RefreshCw className="w-3 h-3 text-white/40" />
          <span className="text-white/40 text-xs">Replace</span>
        </button>
      </div>

      {/* Previous session ghost label */}
      {previousSets.length > 0 && (
        <div className="px-4 pb-1">
          <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: '#9C7E46', fontFamily: 'Montserrat, sans-serif' }}>
            Last session · {previousSets[0]?.weight}kg × {previousSets[0]?.reps}
          </p>
        </div>
      )}

      {/* Column headers */}
      <div className="flex items-center gap-2 px-4 pt-1 pb-0.5">
        <div className="w-7" />
        <div className="w-4" />
        <div className="flex-1 text-center text-[9px] uppercase tracking-widest text-white/20">Weight</div>
        <div className="w-4" />
        <div className="flex-1 text-center text-[9px] uppercase tracking-widest text-white/20">Reps</div>
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
          />
        ))}
      </div>

      {/* Add set buttons */}
      <div className="flex gap-2 px-3 pb-4">
        <button
          onClick={() => addSet('normal')}
          className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/35 text-xs flex items-center justify-center gap-1.5 hover:bg-white/10 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Set
        </button>
        <button
          onClick={() => addSet('warmup')}
          className="px-3 py-2.5 rounded-xl bg-orange-500/10 text-orange-400/80 text-xs hover:bg-orange-500/20 transition-colors"
        >
          + Warm-up
        </button>
        <button
          onClick={() => addSet('dropset')}
          className="px-3 py-2.5 rounded-xl bg-blue-500/10 text-blue-400/80 text-xs hover:bg-blue-500/20 transition-colors"
        >
          + Drop
        </button>
      </div>
    </div>
  );
}