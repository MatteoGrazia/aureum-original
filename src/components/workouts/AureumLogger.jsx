// Changes applied:
// C1  — ReorderModal integration
// C3  — Unified sticky header (title + timer + Finish in one bar)
// C11 — Isolated ElapsedTimer component (no parent re-renders from ticks)
// C13 — Auto-minimize when navigating away
// Flutter equivalent: ReorderableListView with onReorder callback

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronDown, ChevronUp, Calculator, CheckCircle2 } from 'lucide-react';
import ExerciseBlock from './ExerciseBlock';
import RestTimerBar from './RestTimerBar';
import ExercisePicker from './ExercisePicker';
import PlateCalculator from './PlateCalculator';
import ReorderModal from './ReorderModal';
import ElapsedTimer from './ElapsedTimer';
import GoldButton from '@/components/ui/GoldButton';
import { useTheme } from '@/components/shared/ThemeContext';
import { useSettings, weightUnitLabel } from '@/lib/SettingsContext';

const REST_BY_MUSCLE = {
  legs: 180, back: 150, chest: 120, shoulders: 90,
  biceps: 60, triceps: 60, core: 60, glutes: 120,
  calves: 60, forearms: 60,
};

const REST_BY_NAME = {
  'squat': 180, 'deadlift': 210, 'bench press': 120,
  'romanian deadlift': 150, 'leg press': 150,
  'shoulder press': 90, 'barbell row': 120,
};

const getRestDuration = (exercise) => {
  if (exercise.default_rest) return exercise.default_rest;
  const lname = (exercise.exercise_name || '').toLowerCase();
  for (const [key, val] of Object.entries(REST_BY_NAME)) {
    if (lname.includes(key)) return val;
  }
  return REST_BY_MUSCLE[exercise.muscle_group] || 90;
};

const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

const sendRestCompleteNotification = (exerciseName) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Rest Over - Aureum', {
      body: `Time to hit your next set on ${exerciseName}`,
      icon: '/favicon.ico',
    });
  }
  if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
};

const createSet = (type = 'normal', weight = 0, reps = 0) => ({
  id: Math.random().toString(36).slice(2),
  type, weight, reps, rpe: 7, completed: false,
});

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

function calculateTotalVolume(exercises) {
  return exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((exTotal, set) => {
      if (!set.completed) return exTotal;
      const weight = parseFloat(set.weight) || 0;
      const reps = parseInt(set.reps) || 0;
      return exTotal + weight * reps;
    }, 0);
  }, 0);
}

// C11: Minimized pill elapsed timer — isolated
const MinimizedTimer = React.memo(function MinimizedTimer({ workoutStartTime, style }) {
  const [elapsed, setElapsed] = useState(() => {
    if (workoutStartTime) return Math.floor((Date.now() - new Date(workoutStartTime).getTime()) / 1000);
    return 0;
  });
  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  return <span className="text-sm tabular-nums" style={style}>{formatTime(elapsed)}</span>;
});

export default function AureumLogger({
  activeWorkout, allExercises, onUpdateWorkout,
  onFinish, onCancel, previousWorkoutSets = {},
  workoutStartTime, isMinimized, onMinimize, onRestore,
  userWeight = 70,
}) {
  const { isDarkMode } = useTheme();
  const settings = useSettings();
  const wUnit = weightUnitLabel(settings.home_units_weight);

  const bg = isDarkMode ? '#080808' : '#F2EFE9';
  const panelBg = isDarkMode ? 'rgba(8,8,8,0.98)' : 'rgba(242,239,233,0.98)';
  const pillBg = isDarkMode ? 'rgba(8,8,8,0.97)' : 'rgba(255,255,255,0.97)';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1E1C18';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(30,28,24,0.50)';
  const textDim = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(30,28,24,0.70)';
  const divider = isDarkMode ? 'rgba(212,175,55,0.12)' : 'rgba(184,148,31,0.18)';
  const trackBg = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(30,28,24,0.10)';
  const addBtnBg = isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(30,28,24,0.04)';
  const addBtnBorder = isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(184,148,31,0.30)';
  const finishGradient = isDarkMode ? 'linear-gradient(to top, rgba(8,8,8,1) 70%, transparent)' : 'linear-gradient(to top, rgba(242,239,233,1) 70%, transparent)';
  const gold = isDarkMode ? '#D4AF37' : '#9A7A14';

  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [restKey, setRestKey] = useState(0);
  const [currentRestExercise, setCurrentRestExercise] = useState('');
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReorder, setShowReorder] = useState(false);

  // C11: drag state (no timer in parent state)
  const dragIndexRef = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // C13: auto-minimize when navigating away during active workout
  useEffect(() => {
    if (isMinimized) return;
    const handleVisibilityChange = () => {
      if (document.hidden) onMinimize?.();
    };
    // Listen for route changes via popstate / pushState intercept
    const handlePopState = () => { onMinimize?.(); };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // We don't add popstate here as NavigationContext handles it;
    // instead listen to clicks on nav links via capture
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMinimized, onMinimize]);

  const triggerRestTimer = (exercise) => {
    const dur = exercise.default_rest || settings.workout_default_rest_timer || getRestDuration(exercise);
    setRestDuration(dur);
    setCurrentRestExercise(exercise?.exercise_name || '');
    setRestKey(k => k + 1);
    setShowRestTimer(true);
  };

  const handleRestComplete = () => {
    sendRestCompleteNotification(currentRestExercise);
    setShowRestTimer(false);
  };

  const activeWorkoutRef = useRef(activeWorkout);
  activeWorkoutRef.current = activeWorkout;

  const updateExercise = useCallback((index, exercise) => {
    const current = activeWorkoutRef.current;
    const exercises = [...current.exercises];
    exercises[index] = exercise;
    onUpdateWorkout({ ...current, exercises });
  }, [onUpdateWorkout]);

  const structuralUpdateExercise = useCallback((index, exercise) => {
    const current = activeWorkoutRef.current;
    const exercises = [...current.exercises];
    exercises[index] = exercise;
    onUpdateWorkout({ ...current, exercises, is_modified: true });
  }, [onUpdateWorkout]);

  const deleteExercise = useCallback((index) => {
    const current = activeWorkoutRef.current;
    const exercises = current.exercises.filter((_, i) => i !== index);
    onUpdateWorkout({ ...current, exercises, is_modified: true });
  }, [onUpdateWorkout]);

  const addExercise = (ex) => {
    const newEx = {
      exercise_id: ex.id,
      exercise_name: ex.name,
      muscle_group: ex.muscle_group,
      equipment: ex.equipment,
      image_url: ex.image_url,
      image_url_dark: ex.image_url_dark,
      sets: [createSet()],
    };
    onUpdateWorkout({ ...activeWorkout, exercises: [...activeWorkout.exercises, newEx], is_modified: true });
    setShowExercisePicker(false);
  };

  const replaceExercise = (ex) => {
    const exercises = [...activeWorkout.exercises];
    exercises[replaceIndex] = {
      ...exercises[replaceIndex],
      exercise_id: ex.id,
      exercise_name: ex.name,
      muscle_group: ex.muscle_group,
      equipment: ex.equipment,
      image_url: ex.image_url,
      image_url_dark: ex.image_url_dark,
    };
    onUpdateWorkout({ ...activeWorkout, exercises, is_modified: true });
    setShowExercisePicker(false);
    setReplaceIndex(null);
  };

  // C1: confirm reorder from ReorderModal
  const handleReorderConfirm = useCallback((reordered) => {
    onUpdateWorkout({ ...activeWorkoutRef.current, exercises: reordered, is_modified: true });
    setShowReorder(false);
  }, [onUpdateWorkout]);

  // Inline drag handlers
  const handleDragStart = useCallback((index) => {
    dragIndexRef.current = index;
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }
    const current = activeWorkoutRef.current;
    const exercises = [...current.exercises];
    const [moved] = exercises.splice(dragIndex, 1);
    exercises.splice(dropIndex, 0, moved);
    onUpdateWorkout({ ...current, exercises, is_modified: true });
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }, [onUpdateWorkout]);

  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }, []);

  const totalSets = activeWorkout.exercises.reduce((s, ex) => s + ex.sets.length, 0);
  const completedSets = activeWorkout.exercises.reduce((s, ex) => s + ex.sets.filter(set => set.completed).length, 0);
  const totalVolume = Math.round(calculateTotalVolume(activeWorkout.exercises));

  // Minimized pill
  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between px-4 py-3 rounded-2xl"
        style={{
          background: pillBg,
          border: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.4)' : 'rgba(184,148,31,0.40)'}`,
          backdropFilter: 'blur(20px)',
          boxShadow: isDarkMode ? '0 0 24px rgba(212,175,55,0.15)' : '0 4px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: gold, fontFamily: 'Montserrat, sans-serif' }}>
            {activeWorkout.routine_name}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            {/* C11: isolated timer in minimized pill */}
            <MinimizedTimer workoutStartTime={workoutStartTime} style={{ color: textDim }} />
            <span className="text-xs" style={{ color: textMuted }}>{completedSets}/{totalSets} sets</span>
            {totalVolume > 0 && <span className="text-xs" style={{ color: gold, opacity: 0.8 }}>{totalVolume.toLocaleString()} {wUnit}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showRestTimer && (
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: gold }} />
          )}
          <button
            onClick={onRestore}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            style={{ background: isDarkMode ? 'rgba(212,175,55,0.15)' : 'rgba(154,122,20,0.12)', color: gold, fontFamily: 'Montserrat, sans-serif' }}
          >
            <ChevronUp className="w-4 h-4" />
            Resume
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="relative z-10 min-h-screen" style={{ background: bg, paddingBottom: '140px' }}>

        {/* C3: Unified sticky header: title, timer, Finish + stats row */}
        <div
          className="sticky top-0 z-[100] px-4"
          style={{
            background: panelBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 44px)',
            paddingBottom: 10,
            borderBottom: `0.5px solid ${divider}`,
          }}
        >
          {/* Row 1: title | elapsed timer (center) | Finish button */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="text-sm truncate flex-1" style={{ color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}>
              {activeWorkout.routine_name}
            </h2>

            {/* C3: elapsed timer centered */}
            <div className="flex-shrink-0">
              {/* C11: isolated ElapsedTimer component */}
              <ElapsedTimer
                workoutStartTime={workoutStartTime}
                style={{ color: gold, fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 500 }}
              />
            </div>

            {/* Finish + utility buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setShowCalculator(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: isDarkMode ? 'rgba(212,175,55,0.08)' : 'rgba(154,122,20,0.08)', border: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.2)' : 'rgba(154,122,20,0.25)'}` }}
              >
                <Calculator className="w-3.5 h-3.5" style={{ color: gold, opacity: 0.8 }} />
              </button>
              <button
                onClick={onMinimize}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(30,28,24,0.06)', border: `0.5px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(30,28,24,0.15)'}` }}
              >
                <ChevronDown className="w-4 h-4" style={{ color: textMuted }} />
              </button>
              <button
                onClick={onCancel}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.2)' }}
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
              {/* C3: Finish button in header */}
              <button
                onClick={onFinish}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
                style={{
                  background: `linear-gradient(135deg, ${gold} 0%, ${isDarkMode ? '#BFA030' : '#C4A020'} 100%)`,
                  color: '#080808',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Finish
              </button>
            </div>
          </div>

          {/* Row 2: stats bar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: textMuted }}>Sets</span>
              <span className="text-xs" style={{ color: textDim }}>{completedSets}/{totalSets}</span>
            </div>
            <div className="w-px h-3" style={{ background: isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(30,28,24,0.15)' }} />
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: textMuted }}>Vol</span>
              <span className="text-xs tabular-nums" style={{ color: gold, fontFamily: 'Montserrat, sans-serif' }}>
                {totalVolume > 0 ? `${totalVolume.toLocaleString()} ${wUnit}` : '-'}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 rounded-full overflow-hidden mt-2" style={{ background: trackBg }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${gold}, ${isDarkMode ? '#BFA030' : '#C4A020'})` }}
              animate={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pt-3 space-y-3">
          <AnimatePresence>
            {showRestTimer && (
              <RestTimerBar
                key={restKey}
                duration={restDuration}
                onComplete={handleRestComplete}
                onDismiss={() => setShowRestTimer(false)}
              />
            )}
          </AnimatePresence>

          {activeWorkout.exercises.map((exercise, i) => (
            <ExerciseBlock
              key={`${exercise.exercise_id || i}-${i}`}
              exercise={exercise}
              onUpdate={updated => updateExercise(i, updated)}
              onStructuralUpdate={updated => structuralUpdateExercise(i, updated)}
              onReplace={() => { setReplaceIndex(i); setShowExercisePicker(true); }}
              onDelete={() => deleteExercise(i)}
              onOpenReorder={() => setShowReorder(true)}
              onTimerStart={triggerRestTimer}
              previousSets={previousWorkoutSets[exercise.exercise_name] || []}
              userWeight={userWeight}
              draggable={true}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              isDraggingOver={dragOverIndex === i && dragIndexRef.current !== i}
            />
          ))}

          <button
            onClick={() => { setReplaceIndex(null); setShowExercisePicker(true); }}
            className="w-full py-4 rounded-2xl text-sm flex items-center justify-center gap-2"
            style={{ border: `1.5px dashed ${addBtnBorder}`, background: addBtnBg, color: textMuted }}
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </button>
        </div>

        {/* Fixed Finish button at bottom (fallback for long sessions) */}
        <div
          className="fixed bottom-0 left-0 right-0 z-[60] px-4 pt-4"
          style={{
            background: finishGradient,
            paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <GoldButton onClick={onFinish} className="w-full py-4 text-base">
            Finish Workout
          </GoldButton>
        </div>
      </div>

      {showCalculator && (
        <PlateCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      )}

      {/* C1: Reorder modal */}
      <AnimatePresence>
        {showReorder && (
          <ReorderModal
            exercises={activeWorkout.exercises}
            onConfirm={handleReorderConfirm}
            onClose={() => setShowReorder(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExercisePicker && (
          <ExercisePicker
            exercises={allExercises}
            mode={replaceIndex !== null ? 'replace' : 'add'}
            onSelect={replaceIndex !== null ? replaceExercise : addExercise}
            onClose={() => { setShowExercisePicker(false); setReplaceIndex(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}