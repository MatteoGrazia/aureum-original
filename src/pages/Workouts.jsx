import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Play, Calculator, Clock, Dumbbell, ChevronRight, 
  X, Trash2, Edit3, Link2, ChevronDown 
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import MuscleHeatmap from '@/components/workouts/MuscleHeatmap';
import PlateCalculator from '@/components/workouts/PlateCalculator';
import RestTimer from '@/components/workouts/RestTimer';
import LiveLogger from '@/components/workouts/LiveLogger';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Workouts() {
  const [view, setView] = useState('routines'); // routines, create, active
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [completedSets, setCompletedSets] = useState([]);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [showRestTimer, setShowRestTimer] = useState(false);

  // Create routine state
  const [newRoutine, setNewRoutine] = useState({ name: '', exercises: [] });
  const [showExerciseSelect, setShowExerciseSelect] = useState(false);

  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => base44.entities.Routine.list()
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list()
  });

  const { data: recentWorkouts = [] } = useQuery({
    queryKey: ['recentWorkouts'],
    queryFn: () => base44.entities.WorkoutLog.filter({}, '-date', 10)
  });

  const startWorkout = (routine) => {
    setActiveWorkout(routine);
    setWorkoutStartTime(new Date());
    setCurrentExerciseIndex(0);
    setCurrentSetNumber(1);
    setCompletedSets([]);
    setView('active');
  };

  const handleSetComplete = async (setData) => {
    const newSets = [...completedSets, setData];
    setCompletedSets(newSets);

    const currentExercise = activeWorkout.exercises[currentExerciseIndex];
    
    // Check if we need to move to next set or next exercise
    if (currentSetNumber < currentExercise.sets) {
      setCurrentSetNumber(currentSetNumber + 1);
      setShowRestTimer(true);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetNumber(1);
        setShowRestTimer(true);
      } else {
        // Workout complete
        await finishWorkout(newSets);
      }
    }
  };

  const handleSkipSet = () => {
    const currentExercise = activeWorkout.exercises[currentExerciseIndex];
    
    if (currentSetNumber < currentExercise.sets) {
      setCurrentSetNumber(currentSetNumber + 1);
    } else {
      if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetNumber(1);
      } else {
        finishWorkout(completedSets);
      }
    }
  };

  const finishWorkout = async (sets) => {
    const duration = Math.round((new Date() - workoutStartTime) / 60000);
    const totalVolume = sets.reduce((sum, set) => 
      set.is_warmup ? sum : sum + (set.weight * set.reps), 0
    );

    await base44.entities.WorkoutLog.create({
      routine_id: activeWorkout.id,
      routine_name: activeWorkout.name,
      date: today,
      duration_minutes: duration,
      total_volume: totalVolume,
      sets: sets
    });

    // Update lifetime volume in profile
    const profiles = await base44.entities.UserProfile.filter({});
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, {
        lifetime_volume: (profiles[0].lifetime_volume || 0) + totalVolume
      });
    }

    setActiveWorkout(null);
    setView('routines');
    queryClient.invalidateQueries(['recentWorkouts']);
  };

  const cancelWorkout = () => {
    if (completedSets.length > 0 && !window.confirm('Are you sure you want to cancel? Progress will be lost.')) {
      return;
    }
    setActiveWorkout(null);
    setView('routines');
  };

  const addExerciseToRoutine = (exercise) => {
    setNewRoutine(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        muscle_group: exercise.muscle_group,
        sets: 3,
        reps: '8-12',
        is_superset: false,
        superset_with: null
      }]
    }));
    setShowExerciseSelect(false);
  };

  const saveRoutine = async () => {
    if (!newRoutine.name || newRoutine.exercises.length === 0) return;

    const targetMuscles = [...new Set(newRoutine.exercises.map(e => e.muscle_group))];
    
    await base44.entities.Routine.create({
      name: newRoutine.name,
      exercises: newRoutine.exercises,
      target_muscles: targetMuscles
    });

    setNewRoutine({ name: '', exercises: [] });
    setView('routines');
    queryClient.invalidateQueries(['routines']);
  };

  // Seed exercises if empty
  useEffect(() => {
    const seedExercises = async () => {
      if (exercises.length === 0) {
        const defaultExercises = [
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
        
        await base44.entities.Exercise.bulkCreate(defaultExercises);
        queryClient.invalidateQueries(['exercises']);
      }
    };
    seedExercises();
  }, [exercises.length]);

  const currentExercise = activeWorkout?.exercises?.[currentExerciseIndex];
  const previousSet = completedSets.filter(s => 
    s.exercise_name === currentExercise?.exercise_name
  ).pop();

  return (
    <div className="min-h-screen p-6">
      <PlateCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl tracking-wide">
          <span className="text-white">Hevy</span>
          <span className="text-[#D4AF37] ml-2">Platinum</span>
        </h1>
      </motion.div>

      {/* Active Workout View */}
      {view === 'active' && activeWorkout && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Workout Header */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-lg">{activeWorkout.name}</h2>
                <p className="text-white/40 text-sm">
                  {Math.round((new Date() - workoutStartTime) / 60000)} min
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCalculator(true)}
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
                >
                  <Calculator className="w-5 h-5 text-white/50" />
                </button>
                <button
                  onClick={cancelWorkout}
                  className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>Progress</span>
                <span>{currentExerciseIndex + 1}/{activeWorkout.exercises.length}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#D4AF37]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentExerciseIndex + 1) / activeWorkout.exercises.length) * 100}%` }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Rest Timer */}
          <AnimatePresence>
            {showRestTimer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <RestTimer
                  defaultTime={60}
                  onComplete={() => setShowRestTimer(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Logger */}
          {currentExercise && (
            <LiveLogger
              exercise={currentExercise}
              setNumber={currentSetNumber}
              previousSet={previousSet}
              isSuperset={currentExercise.is_superset}
              onComplete={handleSetComplete}
              onSkip={handleSkipSet}
            />
          )}

          {/* Muscle Heatmap */}
          <MuscleHeatmap targetMuscles={activeWorkout.target_muscles || []} />
        </motion.div>
      )}

      {/* Routines View */}
      {view === 'routines' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Action Buttons */}
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

          {/* Routines List */}
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-[#D4AF37]">Your Routines</h2>
            
            {routines.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <Dumbbell className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">No routines yet</p>
                <p className="text-white/20 text-sm">Create your first workout routine</p>
              </GlassCard>
            ) : (
              routines.map((routine) => (
                <motion.div
                  key={routine.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <GlassCard 
                    className="p-4 cursor-pointer"
                    onClick={() => setSelectedRoutine(selectedRoutine?.id === routine.id ? null : routine)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white">{routine.name}</h3>
                        <p className="text-white/40 text-sm">
                          {routine.exercises?.length || 0} exercises
                        </p>
                      </div>
                      <ChevronDown 
                        className={`w-5 h-5 text-white/30 transition-transform ${
                          selectedRoutine?.id === routine.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    <AnimatePresence>
                      {selectedRoutine?.id === routine.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-white/10"
                        >
                          {/* Exercise list */}
                          <div className="space-y-2 mb-4">
                            {routine.exercises?.map((ex, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-white/60">{ex.exercise_name}</span>
                                <span className="text-white/30">{ex.sets} × {ex.reps}</span>
                              </div>
                            ))}
                          </div>

                          {/* Muscle preview */}
                          {routine.target_muscles && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {routine.target_muscles.map(muscle => (
                                <span
                                  key={muscle}
                                  className="px-2 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs capitalize"
                                >
                                  {muscle}
                                </span>
                              ))}
                            </div>
                          )}

                          <GoldButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              startWorkout(routine);
                            }}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Start Workout
                          </GoldButton>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>

          {/* Recent Workouts */}
          {recentWorkouts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest text-[#D4AF37]">Recent Workouts</h2>
              
              {recentWorkouts.slice(0, 5).map((workout) => (
                <GlassCard key={workout.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white">{workout.routine_name}</h3>
                      <p className="text-white/40 text-sm">
                        {format(new Date(workout.date), 'MMM d')} • {workout.duration_minutes} min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#D4AF37]">{workout.total_volume?.toLocaleString()}</p>
                      <p className="text-white/30 text-xs">kg volume</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Create Routine View */}
      {view === 'create' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('routines')}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-white text-lg">Create Routine</h2>
          </div>

          <Input
            placeholder="Routine name..."
            value={newRoutine.name}
            onChange={(e) => setNewRoutine(prev => ({ ...prev, name: e.target.value }))}
            className="py-6 bg-white/5 border-[#D4AF37]/20"
          />

          {/* Selected Exercises */}
          <div className="space-y-2">
            {newRoutine.exercises.map((ex, index) => (
              <GlassCard key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">{ex.exercise_name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => {
                            const updated = [...newRoutine.exercises];
                            updated[index].sets = parseInt(e.target.value) || 1;
                            setNewRoutine(prev => ({ ...prev, exercises: updated }));
                          }}
                          className="w-16 text-center bg-white/5 border-white/10"
                        />
                        <span className="text-white/40 text-sm">sets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={ex.reps}
                          onChange={(e) => {
                            const updated = [...newRoutine.exercises];
                            updated[index].reps = e.target.value;
                            setNewRoutine(prev => ({ ...prev, exercises: updated }));
                          }}
                          className="w-20 text-center bg-white/5 border-white/10"
                        />
                        <span className="text-white/40 text-sm">reps</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setNewRoutine(prev => ({
                        ...prev,
                        exercises: prev.exercises.filter((_, i) => i !== index)
                      }));
                    }}
                    className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Add Exercise Button */}
          <button
            onClick={() => setShowExerciseSelect(true)}
            className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 text-white/40 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Exercise
          </button>

          {/* Muscle Preview */}
          {newRoutine.exercises.length > 0 && (
            <MuscleHeatmap 
              targetMuscles={[...new Set(newRoutine.exercises.map(e => e.muscle_group))]} 
            />
          )}

          {/* Save Button */}
          <GoldButton 
            onClick={saveRoutine} 
            className="w-full"
            disabled={!newRoutine.name || newRoutine.exercises.length === 0}
          >
            Save Routine
          </GoldButton>

          {/* Exercise Selector Modal */}
          <AnimatePresence>
            {showExerciseSelect && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50 flex items-end"
                onClick={() => setShowExerciseSelect(false)}
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="w-full max-h-[80vh] rounded-t-3xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-lg">Select Exercise</h3>
                      <button
                        onClick={() => setShowExerciseSelect(false)}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {exercises.map((exercise) => (
                        <button
                          key={exercise.id}
                          onClick={() => addExerciseToRoutine(exercise)}
                          className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                        >
                          <p className="text-white">{exercise.name}</p>
                          <p className="text-white/40 text-sm capitalize">
                            {exercise.muscle_group} • {exercise.equipment}
                          </p>
                        </button>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}