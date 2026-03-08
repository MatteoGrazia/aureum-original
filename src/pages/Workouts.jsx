import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Play, Calculator, Dumbbell, ChevronDown, Trash2, X, History } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';
import VoidBackground from '@/components/dashboard/VoidBackground';
import GoldButton from '@/components/ui/GoldButton';
import PlateCalculator from '@/components/workouts/PlateCalculator';
import HevyLogger from '@/components/workouts/HevyLogger';
import SmartSaveModal from '@/components/workouts/SmartSaveModal';
import WorkoutSummary from '@/components/workouts/WorkoutSummary';
import ExercisePicker from '@/components/workouts/ExercisePicker';
import WorkoutLogDetail from '@/components/workouts/WorkoutLogDetail';
import { Input } from '@/components/ui/input';

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
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.start(t);
      osc.stop(t + 0.6);
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
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const persistTimerRef = useRef(null);

  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => base44.entities.Routine.list(),
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
  });

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

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setActiveWorkout(data.workout);
        setWorkoutStartTime(new Date(data.startTime));
        setView('active');
      }
    } catch (_) {}
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

  // Seed exercises
  useEffect(() => {
    if (exercises.length === 0) {
      const defaults = [
        { name: 'Bench Press', muscle_group: 'chest', equipment: 'barbell' },
        { name: 'Squat', muscle_group: 'legs', equipment: 'barbell' },
        { name: 'Deadlift', muscle_group: 'back', equipment: 'barbell' },
        { name: 'Shoulder Press', muscle_group: 'shoulders', equipment: 'barbell' },
        { name: 'Barbell Row', muscle_group: 'back', equipment: 'barbell' },
        { name: 'Pull-ups', muscle_group: 'back', equipment: 'bodyweight' },
        { name: 'Dumbbell Curl', muscle_group: 'biceps', equipment: 'dumbbell' },
        { name: 'Tricep Pushdown', muscle_group: 'triceps', equipment: 'cable' },
        { name: 'Leg Press', muscle_group: 'legs', equipment: 'machine' },
        { name: 'Lat Pulldown', muscle_group: 'back', equipment: 'cable' },
        { name: 'Incline Dumbbell Press', muscle_group: 'chest', equipment: 'dumbbell' },
        { name: 'Romanian Deadlift', muscle_group: 'legs', equipment: 'barbell' },
        { name: 'Plank', muscle_group: 'core', equipment: 'bodyweight' },
        { name: 'Cable Fly', muscle_group: 'chest', equipment: 'cable' },
        { name: 'Hip Thrust', muscle_group: 'glutes', equipment: 'barbell' },
      ];
      base44.entities.Exercise.bulkCreate(defaults).then(() =>
        queryClient.invalidateQueries(['exercises'])
      );
    }
  }, [exercises.length]);

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

  const saveRoutine = async () => {
    if (!newRoutine.name || newRoutine.exercises.length === 0) return;
    const targetMuscles = [...new Set(newRoutine.exercises.map(e => e.muscle_group))];
    await base44.entities.Routine.create({ ...newRoutine, target_muscles: targetMuscles });
    setNewRoutine({ name: '', exercises: [] });
    setView('routines');
    queryClient.invalidateQueries(['routines']);
  };

  const deleteRoutine = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this routine?')) return;
    await base44.entities.Routine.delete(id);
    queryClient.invalidateQueries(['routines']);
  };

  return (
    <div className="min-h-screen relative bg-[#080808]">
      <VoidBackground />
      <PlateCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />

      {view === 'active' && activeWorkout && (
        <HevyLogger
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

      {(view === 'routines' || view === 'create') && (
        <div className="relative z-10 p-5">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 pt-8">
            <h1
              className="text-3xl tracking-[0.4em] text-center"
              style={{
                fontFamily: 'Montserrat, sans-serif', fontWeight: 400,
                background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 50%, #F4D03F 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              WORKOUTS
            </h1>
          </motion.div>

          {view === 'routines' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex gap-3">
                <GoldButton onClick={() => setView('create')} className="flex-1 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Routine
                </GoldButton>
                <button
                  onClick={() => setShowCalculator(true)}
                  className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center"
                >
                  <Calculator className="w-5 h-5 text-white/50" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Your Routines
                </p>
                {routines.length === 0 ? (
                  <VoidCard className="py-12 text-center">
                    <Dumbbell className="w-10 h-10 text-white/20 mx-auto mb-3" strokeWidth={1} />
                    <p className="text-white/40 text-sm">No routines yet</p>
                  </VoidCard>
                ) : (
                  routines.map(routine => (
                    <motion.div key={routine.id} whileTap={{ scale: 0.98 }}>
                      <VoidCard
                        className="cursor-pointer"
                        onClick={() => setSelectedRoutine(selectedRoutine?.id === routine.id ? null : routine)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{routine.name}</h3>
                            <p className="text-white/35 text-sm mt-0.5">{routine.exercises?.length || 0} exercises</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={(e) => deleteRoutine(e, routine.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                              <Trash2 className="w-3.5 h-3.5 text-red-400/70" />
                            </button>
                            <ChevronDown
                              className={`w-5 h-5 text-white/25 transition-transform ${selectedRoutine?.id === routine.id ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>

                        <AnimatePresence>
                          {selectedRoutine?.id === routine.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-4 pt-4 border-t border-white/10"
                            >
                              <div className="space-y-1.5 mb-4">
                                {routine.exercises?.map((ex, i) => (
                                  <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-white/55">{ex.exercise_name}</span>
                                    <span className="text-white/25">{ex.sets} × {ex.reps}</span>
                                  </div>
                                ))}
                              </div>
                              {routine.target_muscles?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                  {routine.target_muscles.map(m => (
                                    <span key={m} className="px-2 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs capitalize">
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <GoldButton
                                onClick={(e) => { e.stopPropagation(); startWorkout(routine); }}
                                className="w-full flex items-center justify-center gap-2"
                              >
                                <Play className="w-4 h-4" />
                                Start Workout
                              </GoldButton>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </VoidCard>
                    </motion.div>
                  ))
                )}
              </div>

              {recentWorkouts.length > 0 && (
                <div className="space-y-3 mb-24">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      History
                    </p>
                    <p className="text-white/20 text-[10px]">{recentWorkouts.length} sessions</p>
                  </div>
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
                              <p className="text-[#D4AF37] text-sm">{w.total_volume ? `${(w.total_volume / 1000).toFixed(1)}k` : '—'}</p>
                              <p className="text-white/25 text-[10px]">kg vol</p>
                            </div>
                            <History className="w-4 h-4 text-white/15" />
                          </div>
                        </div>
                      </VoidCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'create' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mb-24">
              <div className="flex items-center gap-4">
                <button onClick={() => setView('routines')} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </button>
                <h2 className="text-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>Create Routine</h2>
              </div>

              <Input
                placeholder="Routine name..."
                value={newRoutine.name}
                onChange={e => setNewRoutine(p => ({ ...p, name: e.target.value }))}
                className="py-5 bg-white/5 border-[#D4AF37]/20 text-white"
              />

              {newRoutine.exercises.map((ex, i) => (
                <VoidCard key={i}>
                  <div className="flex items-center justify-between">
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
                      className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </VoidCard>
              ))}

              <button
                onClick={() => setShowExercisePicker(true)}
                className="w-full py-4 rounded-2xl text-white/30 text-sm flex items-center justify-center gap-2"
                style={{ border: '1.5px dashed rgba(255,255,255,0.15)' }}
              >
                <Plus className="w-4 h-4" />
                Add Exercise
              </button>

              <GoldButton
                onClick={saveRoutine}
                className="w-full"
                disabled={!newRoutine.name || newRoutine.exercises.length === 0}
              >
                Save Routine
              </GoldButton>

              <AnimatePresence>
                {showExercisePicker && (
                  <ExercisePicker
                    exercises={exercises}
                    mode="add"
                    onSelect={addExerciseToRoutine}
                    onClose={() => setShowExercisePicker(false)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}