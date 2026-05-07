// Global workout session state so the minimized bar is visible on all pages
import React, { createContext, useContext, useState, useCallback } from 'react';

const WorkoutContext = createContext(null);

export function WorkoutProvider({ children }) {
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const startWorkout = useCallback((workout, startTime) => {
    setActiveWorkout(workout);
    setWorkoutStartTime(startTime);
    setIsMinimized(false);
  }, []);

  const updateWorkout = useCallback((workout) => {
    setActiveWorkout(workout);
  }, []);

  const minimizeWorkout = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const restoreWorkout = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const clearWorkout = useCallback(() => {
    setActiveWorkout(null);
    setWorkoutStartTime(null);
    setIsMinimized(false);
  }, []);

  return (
    <WorkoutContext.Provider value={{
      activeWorkout, setActiveWorkout,
      workoutStartTime, setWorkoutStartTime,
      isMinimized, setIsMinimized,
      startWorkout, updateWorkout,
      minimizeWorkout, restoreWorkout, clearWorkout,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  return useContext(WorkoutContext);
}