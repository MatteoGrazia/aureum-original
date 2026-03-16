import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Clock } from 'lucide-react';
import ExerciseBlock from './ExerciseBlock';
import RestTimerBar from './RestTimerBar';
import ExercisePicker from './ExercisePicker';
import GoldButton from '@/components/ui/GoldButton';

// Default rest times by muscle group (seconds)
const REST_BY_MUSCLE = {
  legs: 180, back: 150, chest: 120, shoulders: 90,
  biceps: 60, triceps: 60, core: 60, glutes: 120,
  calves: 60, forearms: 60,
};

// Known exercise overrides
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
      vibrate: [200, 100, 200],
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

export default function AureumLogger({ activeWorkout, allExercises, onUpdateWorkout, onFinish, onCancel, previousWorkoutSets = {} }) {
  const [elapsed, setElapsed] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [restKey, setRestKey] = useState(0);
  const [currentRestExercise, setCurrentRestExercise] = useState('');
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState(null);

  useEffect(() => {
    requestNotificationPermission();
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatElapsed = () => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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

  return (
    <>
      <div className="relative z-10 min-h-screen bg-[#080808]" style={{ paddingBottom: '120px' }}>
        {/* Sticky header */}
        <div
          className="sticky top-0 z-30 pt-14 pb-3 px-5"
          style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {activeWorkout.routine_name}
              </h2>
              <div className="flex items-center gap-3 mt-0.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-white/30" />
                  <span className="text-white/35 text-xs tabular-nums">{formatElapsed()}</span>
                </div>
                <span className="text-white/20 text-xs">{completedSets}/{totalSets} sets</span>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-xl border border-red-500/20 flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.1)' }}
            >
              <X className="w-5 h-5 text-red-400" />
            </button>
          </div>
          <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#D4AF37] rounded-full"
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
            />
          ))}

          <button
            onClick={() => { setReplaceIndex(null); setShowExercisePicker(true); }}
            className="w-full py-4 rounded-2xl text-white/30 text-sm flex items-center justify-center gap-2 transition-all hover:text-[#D4AF37]/50"
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