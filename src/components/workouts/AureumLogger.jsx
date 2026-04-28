import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import ExerciseBlock from './ExerciseBlock';
import RestTimerBar from './RestTimerBar';
import ExercisePicker from './ExercisePicker';
import PlateCalculator from './PlateCalculator';
import GoldButton from '@/components/ui/GoldButton';

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
    new Notification('Rest Over — Aureum', {
      body: `Time to hit your next set on ${exerciseName}`,
      icon: '/favicon.ico',
    });
  }
  if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
};

const createSet = (type = 'normal', weight = 0, reps = 0) => ({
  id: Math.random().toString(36).slice(2),
  type,
  weight,
  reps,
  rpe: 7,
  completed: false,
});

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function AureumLogger({
  activeWorkout, allExercises, onUpdateWorkout,
  onFinish, onCancel, previousWorkoutSets = {},
  workoutStartTime, isMinimized, onMinimize, onRestore,
  userWeight = 70,
}) {
  const [elapsed, setElapsed] = useState(() => {
    if (workoutStartTime) return Math.floor((Date.now() - new Date(workoutStartTime).getTime()) / 1000);
    return 0;
  });
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [restKey, setRestKey] = useState(0);
  const [currentRestExercise, setCurrentRestExercise] = useState('');
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Always keep timer running regardless of minimized state
  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerRestTimer = (exercise) => {
    const dur = getRestDuration(exercise);
    setRestDuration(dur);
    setCurrentRestExercise(exercise?.exercise_name || '');
    setRestKey(k => k + 1);
    setShowRestTimer(true);
  };

  const handleRestComplete = () => {
    sendRestCompleteNotification(currentRestExercise);
    setShowRestTimer(false);
  };

  const updateExercise = (index, exercise) => {
    const exercises = [...activeWorkout.exercises];
    exercises[index] = exercise;
    onUpdateWorkout({ ...activeWorkout, exercises });
  };

  const structuralUpdateExercise = (index, exercise) => {
    const exercises = [...activeWorkout.exercises];
    exercises[index] = exercise;
    onUpdateWorkout({ ...activeWorkout, exercises, is_modified: true });
  };

  const addExercise = (ex) => {
    const newEx = {
      exercise_id: ex.id,
      exercise_name: ex.name,
      muscle_group: ex.muscle_group,
      equipment: ex.equipment,
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
    };
    onUpdateWorkout({ ...activeWorkout, exercises, is_modified: true });
    setShowExercisePicker(false);
    setReplaceIndex(null);
  };

  const totalSets = activeWorkout.exercises.reduce((s, ex) => s + ex.sets.length, 0);
  const completedSets = activeWorkout.exercises.reduce((s, ex) => s + ex.sets.filter(set => set.completed).length, 0);
  const totalVolume = activeWorkout.exercises.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed && s.type !== 'warmup').reduce((s2, s) => s2 + (s.weight || 0) * (s.reps || 0), 0), 0
  );

  // Minimized pill — always visible, shows timer + volume + restore
  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between px-4 py-3 rounded-2xl"
        style={{
          background: 'rgba(8,8,8,0.97)',
          border: '0.5px solid rgba(212,175,55,0.4)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 24px rgba(212,175,55,0.15)',
        }}
      >
        <div>
          <p className="text-[#D4AF37] text-xs uppercase tracking-[0.2em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {activeWorkout.routine_name}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-white/60 text-sm tabular-nums">{formatTime(elapsed)}</span>
            <span className="text-white/30 text-xs">{completedSets}/{totalSets} sets</span>
            {totalVolume > 0 && <span className="text-[#D4AF37]/70 text-xs">{totalVolume.toLocaleString()} kg</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showRestTimer && (
            <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          )}
          <button
            onClick={onRestore}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', fontFamily: 'Montserrat, sans-serif' }}
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
      <div className="relative z-10 min-h-screen bg-[#080808]" style={{ paddingBottom: '140px' }}>
        {/* Sticky top bar — volume + timer + controls */}
        <div
          className="sticky top-0 z-30 px-4"
          style={{
            background: 'rgba(8,8,8,0.98)',
            backdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)',
            paddingBottom: 12,
            borderBottom: '0.5px solid rgba(212,175,55,0.12)',
          }}
        >
          {/* Row 1: name + minimize + cancel */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white text-base truncate flex-1 mr-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {activeWorkout.routine_name}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCalculator(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.08)', border: '0.5px solid rgba(212,175,55,0.2)' }}
              >
                <Calculator className="w-4 h-4 text-[#D4AF37]/70" />
              </button>
              <button
                onClick={onMinimize}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
              >
                <ChevronDown className="w-5 h-5 text-white/50" />
              </button>
              <button
                onClick={onCancel}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.2)' }}
              >
                <X className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>

          {/* Row 2: stats bar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-white/40 text-[10px] uppercase tracking-wider">Time</span>
              <span className="text-white/80 text-sm tabular-nums" style={{ fontFamily: 'Montserrat, sans-serif' }}>{formatTime(elapsed)}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="text-white/40 text-[10px] uppercase tracking-wider">Sets</span>
              <span className="text-white/80 text-sm">{completedSets}/{totalSets}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="text-white/40 text-[10px] uppercase tracking-wider">Vol</span>
              <span className="text-[#D4AF37] text-sm tabular-nums" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {totalVolume > 0 ? `${totalVolume.toLocaleString()} kg` : '—'}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-white/5 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#BFA030] rounded-full"
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
              onTimerStart={triggerRestTimer}
              previousSets={previousWorkoutSets[exercise.exercise_name] || []}
              userWeight={userWeight}
            />
          ))}

          <button
            onClick={() => { setReplaceIndex(null); setShowExercisePicker(true); }}
            className="w-full py-4 rounded-2xl text-white/30 text-sm flex items-center justify-center gap-2"
            style={{ border: '1.5px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </button>
        </div>

        {/* Fixed Finish button */}
        <div
          className="fixed bottom-0 left-0 right-0 z-[60] px-4 pt-4"
          style={{
            background: 'linear-gradient(to top, rgba(8,8,8,1) 70%, transparent)',
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