import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Calculator, Dumbbell, Trash2, X, History, GripVertical } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';
import VoidBackground from '@/components/dashboard/VoidBackground';
import GoldButton from '@/components/ui/GoldButton';
import PlateCalculator from '@/components/workouts/PlateCalculator';
import AureumLogger from '@/components/workouts/AureumLogger';
import SmartSaveModal from '@/components/workouts/SmartSaveModal';
import WorkoutSummary from '@/components/workouts/WorkoutSummary';
import ExercisePicker from '@/components/workouts/ExercisePicker';
import WorkoutLogDetail from '@/components/workouts/WorkoutLogDetail';
import RoutineCard from '@/components/workouts/RoutineCard';
import WorkoutHero from '@/components/workouts/WorkoutHero';
import CreateExerciseModal from '@/components/workouts/CreateExerciseModal';
import WeeklyMuscleVolume from '@/components/workouts/WeeklyMuscleVolume';
import TrainLikeThem from '@/components/workouts/TrainLikeThem';
import { Input } from '@/components/ui/input';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const STORAGE_KEY = 'aureum_active_workout';

const createSetDefault = () => ({
  id: Math.random().toString(36).slice(2),
  type: 'normal',
  weight: 0,
  reps: 0,
  rpe: 7,
  completed: false,
});

const buildWorkoutExercises = (routine) => {
  return (routine.exercises || []).map(ex => ({
    ...ex,
    sets: Array.from({ length: ex.sets || 3 }, createSetDefault),
  }));
};

const playGoldenChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Cathedral choir + harmonic overtones — majestic, premium finish
    const sequence = [
      { freq: 261.63, delay: 0,    vol: 0.20, dur: 3.0 },  // C4 — foundation
      { freq: 329.63, delay: 0.12, vol: 0.18, dur: 2.8 },  // E4
      { freq: 392.00, delay: 0.26, vol: 0.16, dur: 2.6 },  // G4
      { freq: 523.25, delay: 0.42, vol: 0.22, dur: 3.2 },  // C5 — lift
      { freq: 659.25, delay: 0.62, vol: 0.20, dur: 3.0 },  // E5
      { freq: 783.99, delay: 0.84, vol: 0.17, dur: 2.8 },  // G5
      { freq: 1046.5, delay: 1.10, vol: 0.19, dur: 3.5 },  // C6 — crown
      { freq: 1318.5, delay: 1.42, vol: 0.12, dur: 3.8 },  // E6 — ethereal
    ];
    sequence.forEach(({ freq, delay, vol, dur }) => {
      [1, 2, 3].forEach((harmonic, hi) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = hi === 0 ? 'sine' : 'sine';
        osc.frequency.value = freq * harmonic;
        const t = ctx.currentTime + delay;
        const v = hi === 0 ? vol : vol / (harmonic * 2.5);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(v, t + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.start(t); osc.stop(t + dur + 0.05);
      });
    });
  } catch (_) {}
};

export default function Workouts() {
  const [view, setView] = useState('routines');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [showSmartSave, setShowSmartSave] = useState(false);
  const [pendingSave, setPendingSave] = useState(null);
  const [workoutSummary, setWorkoutSummary] = useState(null);
  const [newRoutine, setNewRoutine] = useState({ name: '', exercises: [] });
  const [editingRoutineId, setEditingRoutineId] = useState(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const persistTimerRef = useRef(null);
  const seededRef = useRef(false);

  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => base44.entities.Routine.list(),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: allExercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list('-created_date', 500),
  });

  const exercises = useMemo(() => {
    return allExercises;
  }, [allExercises]);

  const { data: recentWorkouts = [] } = useQuery({
    queryKey: ['recentWorkouts'],
    queryFn: () => base44.entities.WorkoutLog.list('-date', 200),
  });

  // Build a map of exercise_name -> last sets for ghosting
  const previousWorkoutSets = useMemo(() => {
    const map = {};
    if (!recentWorkouts.length) return map;
    // Go through recent logs oldest-first so latest overwrites
    [...recentWorkouts].reverse().forEach(log => {
      const grouped = {};
      (log.sets || []).forEach(s => {
        if (!grouped[s.exercise_name]) grouped[s.exercise_name] = [];
        grouped[s.exercise_name].push(s);
      });
      Object.assign(map, grouped);
    });
    return map;
  }, [recentWorkouts]);

  // Restore from localStorage on mount — only if there's a valid in-progress workout
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // Only restore if the workout has at least one exercise (not a stale/empty entry)
        if (data.workout && data.workout.exercises && data.workout.exercises.length > 0 && data.startTime) {
          setActiveWorkout(data.workout);
          setWorkoutStartTime(new Date(data.startTime));
          setView('active');
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persist every 10s
  useEffect(() => {
    if (view === 'active' && activeWorkout) {
      persistTimerRef.current = setInterval(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          workout: activeWorkout,
          startTime: workoutStartTime,
        }));
      }, 10000);
    }
    return () => clearInterval(persistTimerRef.current);
  }, [view, activeWorkout, workoutStartTime]);

  // Deduplicate + seed exercises
  useEffect(() => {
    if (exercises.length === 0) return; // wait for data to load

    // Deduplicate: keep only the first occurrence of each exercise name
    const seen = new Set();
    const toDelete = [];
    exercises.forEach(ex => {
      if (seen.has(ex.name)) {
        toDelete.push(ex.id);
      } else {
        seen.add(ex.name);
      }
    });
    if (toDelete.length > 0) {
      Promise.all(toDelete.map(id => base44.entities.Exercise.delete(id))).then(() =>
        queryClient.invalidateQueries(['exercises'])
      );
      return;
    }
    if (false) {
      const defaults = [
        // CHEST
        { name: 'Bench Press', muscle_group: 'chest', equipment: 'barbell' },
        { name: 'Incline Bench Press', muscle_group: 'chest', equipment: 'barbell' },
        { name: 'Decline Bench Press', muscle_group: 'chest', equipment: 'barbell' },
        { name: 'Dumbbell Chest Press', muscle_group: 'chest', equipment: 'dumbbell' },
        { name: 'Incline Dumbbell Press', muscle_group: 'chest', equipment: 'dumbbell' },
        { name: 'Cable Fly', muscle_group: 'chest', equipment: 'cable' },
        { name: 'Pec Deck Machine', muscle_group: 'chest', equipment: 'machine' },
        { name: 'Push-ups', muscle_group: 'chest', equipment: 'bodyweight' },
        { name: 'Chest Dip', muscle_group: 'chest', equipment: 'bodyweight' },
        // BACK
        { name: 'Barbell Row', muscle_group: 'back', equipment: 'barbell' },
        { name: 'Deadlift', muscle_group: 'back', equipment: 'barbell' },
        { name: 'Pull-ups', muscle_group: 'back', equipment: 'bodyweight' },
        { name: 'Chin-ups', muscle_group: 'back', equipment: 'bodyweight' },
        { name: 'Lat Pulldown', muscle_group: 'back', equipment: 'cable' },
        { name: 'Seated Cable Row', muscle_group: 'back', equipment: 'cable' },
        { name: 'Single Arm Dumbbell Row', muscle_group: 'back', equipment: 'dumbbell' },
        { name: 'T-Bar Row', muscle_group: 'back', equipment: 'barbell' },
        { name: 'Machine Row', muscle_group: 'back', equipment: 'machine' },
        // SHOULDERS
        { name: 'Barbell Overhead Press', muscle_group: 'shoulders', equipment: 'barbell' },
        { name: 'Dumbbell Shoulder Press', muscle_group: 'shoulders', equipment: 'dumbbell' },
        { name: 'Lateral Raise', muscle_group: 'shoulders', equipment: 'dumbbell' },
        { name: 'Front Raise', muscle_group: 'shoulders', equipment: 'dumbbell' },
        { name: 'Cable Lateral Raise', muscle_group: 'shoulders', equipment: 'cable' },
        { name: 'Arnold Press', muscle_group: 'shoulders', equipment: 'dumbbell' },
        { name: 'Upright Row', muscle_group: 'shoulders', equipment: 'barbell' },
        { name: 'Machine Shoulder Press', muscle_group: 'shoulders', equipment: 'machine' },
        // BICEPS
        { name: 'Barbell Curl', muscle_group: 'biceps', equipment: 'barbell' },
        { name: 'Dumbbell Curl', muscle_group: 'biceps', equipment: 'dumbbell' },
        { name: 'Hammer Curl', muscle_group: 'biceps', equipment: 'dumbbell' },
        { name: 'Cable Curl', muscle_group: 'biceps', equipment: 'cable' },
        { name: 'Preacher Curl', muscle_group: 'biceps', equipment: 'machine' },
        { name: 'Concentration Curl', muscle_group: 'biceps', equipment: 'dumbbell' },
        { name: 'Incline Dumbbell Curl', muscle_group: 'biceps', equipment: 'dumbbell' },
        // TRICEPS
        { name: 'Tricep Pushdown', muscle_group: 'triceps', equipment: 'cable' },
        { name: 'Skull Crusher', muscle_group: 'triceps', equipment: 'barbell' },
        { name: 'Overhead Tricep Extension', muscle_group: 'triceps', equipment: 'cable' },
        { name: 'Close Grip Bench Press', muscle_group: 'triceps', equipment: 'barbell' },
        { name: 'Tricep Dip', muscle_group: 'triceps', equipment: 'bodyweight' },
        { name: 'Dumbbell Kickback', muscle_group: 'triceps', equipment: 'dumbbell' },
        // LEGS
        { name: 'Squat', muscle_group: 'legs', equipment: 'barbell' },
        { name: 'Romanian Deadlift', muscle_group: 'legs', equipment: 'barbell' },
        { name: 'Leg Press', muscle_group: 'legs', equipment: 'machine' },
        { name: 'Leg Curl', muscle_group: 'legs', equipment: 'machine' },
        { name: 'Leg Extension', muscle_group: 'legs', equipment: 'machine' },
        { name: 'Front Squat', muscle_group: 'legs', equipment: 'barbell' },
        { name: 'Bulgarian Split Squat', muscle_group: 'legs', equipment: 'dumbbell' },
        { name: 'Hack Squat', muscle_group: 'legs', equipment: 'machine' },
        { name: 'Walking Lunge', muscle_group: 'legs', equipment: 'dumbbell' },
        { name: 'Goblet Squat', muscle_group: 'legs', equipment: 'kettlebell' },
        // CORE
        { name: 'Plank', muscle_group: 'core', equipment: 'bodyweight' },
        { name: 'Cable Crunch', muscle_group: 'core', equipment: 'cable' },
        { name: 'Hanging Leg Raise', muscle_group: 'core', equipment: 'bodyweight' },
        { name: 'Russian Twist', muscle_group: 'core', equipment: 'bodyweight' },
        { name: 'Ab Rollout', muscle_group: 'core', equipment: 'bodyweight' },
        { name: 'Decline Crunch', muscle_group: 'core', equipment: 'bodyweight' },
        // GLUTES
        { name: 'Hip Thrust', muscle_group: 'glutes', equipment: 'barbell' },
        { name: 'Cable Kickback', muscle_group: 'glutes', equipment: 'cable' },
        { name: 'Sumo Deadlift', muscle_group: 'glutes', equipment: 'barbell' },
        { name: 'Glute Bridge', muscle_group: 'glutes', equipment: 'bodyweight' },
        // CALVES
        { name: 'Standing Calf Raise', muscle_group: 'calves', equipment: 'machine' },
        { name: 'Seated Calf Raise', muscle_group: 'calves', equipment: 'machine' },
        { name: 'Single Leg Calf Raise', muscle_group: 'calves', equipment: 'bodyweight' },
        // FOREARMS
        { name: 'Wrist Curl', muscle_group: 'forearms', equipment: 'barbell' },
        { name: 'Reverse Curl', muscle_group: 'forearms', equipment: 'barbell' },
        { name: 'Farmer Carry', muscle_group: 'forearms', equipment: 'dumbbell' },
      ];
      base44.entities.Exercise.bulkCreate(defaults).then(() =>
        queryClient.invalidateQueries(['exercises'])
      );
    }
  }, [exercises]);

  const startWorkout = (routine) => {
    const built = {
      routine_id: routine.id,
      routine_name: routine.name,
      exercises: buildWorkoutExercises(routine),
      is_modified: false,
    };
    setActiveWorkout(built);
    setWorkoutStartTime(new Date());
    setView('active');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ workout: built, startTime: new Date() }));
  };

  const handleFinishWorkout = () => {
    const duration = Math.round((new Date() - new Date(workoutStartTime)) / 60000) || 1;
    const allSets = activeWorkout.exercises.flatMap(ex =>
      ex.sets.filter(s => s.completed).map(s => ({
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        set_number: ex.sets.indexOf(s) + 1,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
        is_warmup: s.type === 'warmup',
        set_type: s.type,
      }))
    );
    const totalVolume = allSets
      .filter(s => s.set_type !== 'warmup')
      .reduce((sum, s) => sum + s.weight * s.reps, 0);

    const saveData = { allSets, duration, totalVolume };

    if (activeWorkout.is_modified) {
      setPendingSave(saveData);
      setShowSmartSave(true);
    } else {
      commitSave(saveData, false);
    }
  };

  const commitSave = async ({ allSets, duration, totalVolume }, updateTemplate) => {
    if (updateTemplate && activeWorkout.routine_id) {
      const exs = activeWorkout.exercises.map(ex => ({
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        muscle_group: ex.muscle_group,
        sets: ex.sets.length,
        reps: ex.sets[0]?.reps?.toString() || '8-12',
      }));
      await base44.entities.Routine.update(activeWorkout.routine_id, { exercises: exs });
    }

    await base44.entities.WorkoutLog.create({
      routine_id: activeWorkout.routine_id,
      routine_name: activeWorkout.routine_name,
      date: today,
      duration_minutes: duration,
      total_volume: totalVolume,
      sets: allSets,
    });

    const profiles = await base44.entities.UserProfile.filter({});
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, {
        lifetime_volume: (profiles[0].lifetime_volume || 0) + totalVolume,
      });
    }

    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 300]);
    playGoldenChime();

    localStorage.removeItem(STORAGE_KEY);
    setShowSmartSave(false);

    setWorkoutSummary({
      routineName: activeWorkout.routine_name,
      duration,
      totalVolume,
      exercises: activeWorkout.exercises,
    });
    setView('summary');
    queryClient.invalidateQueries(['recentWorkouts']);
  };

  const handleSummaryDone = () => {
    setWorkoutSummary(null);
    setActiveWorkout(null);
    setWorkoutStartTime(null);
    setView('routines');
  };

  const cancelWorkout = () => {
    if (!window.confirm('Cancel workout? Progress will be lost.')) return;
    localStorage.removeItem(STORAGE_KEY);
    setActiveWorkout(null);
    setView('routines');
  };

  const addExerciseToRoutine = (ex) => {
    setNewRoutine(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
        exercise_id: ex.id,
        exercise_name: ex.name,
        muscle_group: ex.muscle_group,
        sets: 3,
        reps: '8-12',
      }],
    }));
    setShowExercisePicker(false);
  };

  const handleExerciseCreated = (ex) => {
    queryClient.invalidateQueries(['exercises']);
    setShowCreateExercise(false);
    addExerciseToRoutine(ex);
  };

  const handleEditRoutine = (routine) => {
    setNewRoutine({ name: routine.name, exercises: routine.exercises || [] });
    setEditingRoutineId(routine.id);
    setView('create');
  };

  const saveRoutine = async () => {
    if (!newRoutine.name || newRoutine.exercises.length === 0) return;
    const targetMuscles = [...new Set(newRoutine.exercises.map(e => e.muscle_group).filter(Boolean))];
    if (editingRoutineId) {
      await base44.entities.Routine.update(editingRoutineId, { ...newRoutine, target_muscles: targetMuscles });
    } else {
      await base44.entities.Routine.create({ ...newRoutine, target_muscles: targetMuscles });
    }
    setNewRoutine({ name: '', exercises: [] });
    setEditingRoutineId(null);
    setView('routines');
    queryClient.invalidateQueries(['routines']);
  };

  const deleteRoutine = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this routine?')) return;
    await base44.entities.Routine.delete(id);
    queryClient.invalidateQueries(['routines']);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(newRoutine.exercises);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setNewRoutine(p => ({ ...p, exercises: items }));
  };

  return (
    <div className="min-h-screen relative bg-[#080808] overflow-x-hidden">
      <VoidBackground />
      <PlateCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />

      {view === 'active' && activeWorkout && (
        <AureumLogger
          activeWorkout={activeWorkout}
          allExercises={exercises}
          onUpdateWorkout={setActiveWorkout}
          onFinish={handleFinishWorkout}
          onCancel={cancelWorkout}
          previousWorkoutSets={previousWorkoutSets}
        />
      )}

      <AnimatePresence>
        {showSmartSave && (
          <SmartSaveModal
            routineName={activeWorkout?.routine_name}
            onUpdateTemplate={() => commitSave(pendingSave, true)}
            onSaveAsLog={() => commitSave(pendingSave, false)}
            onCancel={() => setShowSmartSave(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {view === 'summary' && workoutSummary && (
          <WorkoutSummary summary={workoutSummary} onDone={handleSummaryDone} />
        )}
      </AnimatePresence>

      {view === 'logDetail' && selectedLog && (
        <WorkoutLogDetail log={selectedLog} onBack={() => { setSelectedLog(null); setView('routines'); }} />
      )}

      <AnimatePresence>
        {showCreateExercise && (
          <CreateExerciseModal
            onClose={() => setShowCreateExercise(false)}
            onCreated={handleExerciseCreated}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExercisePicker && (
          <ExercisePicker
            exercises={exercises}
            mode="add"
            onSelect={addExerciseToRoutine}
            onClose={() => setShowExercisePicker(false)}
            previousWorkoutSets={previousWorkoutSets}
          />
        )}
      </AnimatePresence>

      {(view === 'routines' || view === 'create') && (
        <div className="relative z-10 p-5">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 pt-6 text-center">
            <h1
              className="text-3xl tracking-[0.4em]"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400,
                background: 'linear-gradient(135deg, #D4AF37 0%, #D4AF37 50%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              WORKOUTS
            </h1>
            <p
              className="text-white text-[11px] uppercase tracking-[0.25em] mt-3"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </motion.div>

          {/* Floating Gold Orb FAB */}
          {view === 'routines' && (
            <motion.button
              onClick={() => setView('create')}
              whileTap={{ scale: 0.93 }}
              className="fixed right-5 z-50 flex items-center justify-center rounded-full"
              style={{
                bottom: 100,
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, #D4AF37 0%, #D4AF37 100%)',
                boxShadow: '0 0 24px rgba(212,175,55,0.45)',
              }}
            >
              <Plus className="w-6 h-6 text-black" strokeWidth={2} />
            </motion.button>
          )}

          {view === 'routines' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

              {/* Hero: Big 3 Total + Wilks */}
              <WorkoutHero logs={recentWorkouts} />

              {/* Routines label */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  My Routines
                </p>
                <button
                  onClick={() => setShowCalculator(true)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <Calculator className="w-4 h-4 text-white/30" />
                </button>
              </div>

              {/* Routine Cards */}
              <div className="space-y-3">
                {routines.length === 0 ? (
                  <VoidCard className="py-12 text-center">
                    <Dumbbell className="w-10 h-10 text-white/20 mx-auto mb-3" strokeWidth={1} />
                    <p className="text-white/40 text-sm">No routines yet</p>
                  </VoidCard>
                ) : (
                  routines.map(routine => (
                    <RoutineCard
                      key={routine.id}
                      routine={routine}
                      isExpanded={selectedRoutine?.id === routine.id}
                      onToggle={() => setSelectedRoutine(selectedRoutine?.id === routine.id ? null : routine)}
                      onStart={startWorkout}
                      onDelete={deleteRoutine}
                      onEdit={handleEditRoutine}
                      allLogs={recentWorkouts}
                      allExercises={exercises}
                    />
                  ))
                )}
              </div>

              {/* Weekly Muscle Volume */}
              <WeeklyMuscleVolume logs={recentWorkouts} />

              {/* History — retractable */}
              {recentWorkouts.length > 0 && (
                <div className="space-y-3 mb-2">
                  <button
                    onClick={() => setShowHistory(p => !p)}
                    className="flex items-center justify-between w-full"
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      History
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-white/20 text-[10px]">{recentWorkouts.length} sessions</p>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}>
                        <polyline points="3,5 7,9 11,5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </button>
                  <AnimatePresence>
                    {showHistory && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden space-y-3"
                      >
                        {recentWorkouts.map(w => (
                          <motion.div key={w.id} whileTap={{ scale: 0.98 }}>
                            <VoidCard
                              className="cursor-pointer"
                              onClick={() => { setSelectedLog(w); setView('logDetail'); }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-white text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{w.routine_name || 'Workout'}</h3>
                                  <p className="text-white/35 text-xs mt-0.5">
                                    {format(new Date(w.date), 'MMM d, yyyy')}
                                    {w.duration_minutes ? ` · ${w.duration_minutes} min` : ''}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="text-[#D4AF37] text-sm">{w.total_volume ? `${(w.total_volume / 1000).toFixed(1)}k` : '-'}</p>
                                    <p className="text-white/25 text-[10px]">kg vol</p>
                                  </div>
                                </div>
                              </div>
                            </VoidCard>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Train Like Them */}
              <TrainLikeThem onAdopt={() => {}} exercises={exercises} />
            </motion.div>
          )}

          {view === 'create' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-[140px]">
              <div className="flex items-center gap-4">
                <button onClick={() => { setView('routines'); setEditingRoutineId(null); setNewRoutine({ name: '', exercises: [] }); }} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </button>
                <h2 className="text-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{editingRoutineId ? 'Edit Routine' : 'Create Routine'}</h2>
              </div>

              <Input
                placeholder="Routine name..."
                value={newRoutine.name}
                onChange={e => setNewRoutine(p => ({ ...p, name: e.target.value }))}
                className="py-5 bg-white/5 border-[#D4AF37]/20 text-white"
              />

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="new-routine">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {newRoutine.exercises.map((ex, i) => (
                        <Draggable key={`${ex.exercise_id || ex.exercise_name}-${i}`} draggableId={`ex-${i}`} index={i}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps}>
                              <VoidCard>
                                <div className="flex items-center justify-between">
                                  <div {...provided.dragHandleProps} className="mr-3 flex-shrink-0 cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4 text-white/20" />
                                  </div>
                                  <div className="flex-1 min-w-0 mr-3">
                                    <p className="text-white text-sm truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{ex.exercise_name}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          value={ex.sets}
                                          onChange={e => {
                                            const updated = [...newRoutine.exercises];
                                            updated[i].sets = parseInt(e.target.value) || 1;
                                            setNewRoutine(p => ({ ...p, exercises: updated }));
                                          }}
                                          className="w-14 text-center text-white rounded-lg py-2 bg-white/5 border border-white/10 outline-none"
                                        />
                                        <span className="text-white/30 text-xs">sets</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <input
                                          value={ex.reps}
                                          onChange={e => {
                                            const updated = [...newRoutine.exercises];
                                            updated[i].reps = e.target.value;
                                            setNewRoutine(p => ({ ...p, exercises: updated }));
                                          }}
                                          className="w-16 text-center text-white rounded-lg py-2 bg-white/5 border border-white/10 outline-none"
                                        />
                                        <span className="text-white/30 text-xs">reps</span>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setNewRoutine(p => ({ ...p, exercises: p.exercises.filter((_, idx) => idx !== i) }))}
                                    className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                </div>
                              </VoidCard>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowExercisePicker(true)}
                  className="flex-1 py-4 rounded-2xl text-white/30 text-sm flex items-center justify-center gap-2"
                  style={{ border: '1.5px dashed rgba(255,255,255,0.15)' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Exercise
                </button>
                <button
                  onClick={() => setShowCreateExercise(true)}
                  className="py-4 px-4 rounded-2xl text-sm flex items-center justify-center gap-2"
                  style={{ border: '1.5px dashed rgba(212,175,55,0.35)', color: 'rgba(212,175,55,0.6)' }}
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
              </div>

              <GoldButton
                onClick={saveRoutine}
                className="w-full"
                disabled={!newRoutine.name || newRoutine.exercises.length === 0}
              >
                {editingRoutineId ? 'Update Routine' : 'Save Routine'}
              </GoldButton>


            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}