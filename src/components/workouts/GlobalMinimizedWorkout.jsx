// Global minimized workout bar — visible on ALL pages when workout is active and minimized
// C13: auto-minimize on navigation
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkout } from '@/lib/WorkoutContext';
import { useTheme } from '@/components/shared/ThemeContext';
import { useSettings, weightUnitLabel } from '@/lib/SettingsContext';

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Isolated timer for minimized pill
const MiniTimer = React.memo(function MiniTimer({ workoutStartTime, style }) {
  const [elapsed, setElapsed] = React.useState(() => {
    if (workoutStartTime) return Math.floor((Date.now() - new Date(workoutStartTime).getTime()) / 1000);
    return 0;
  });
  React.useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  return <span style={style}>{formatTime(elapsed)}</span>;
});

export default function GlobalMinimizedWorkout() {
  const { activeWorkout, workoutStartTime, isMinimized, restoreWorkout } = useWorkout();
  const { isDarkMode } = useTheme();
  const settings = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  if (!activeWorkout || !isMinimized) return null;

  const wUnit = weightUnitLabel(settings.home_units_weight);
  const gold = isDarkMode ? '#D4AF37' : '#9A7A14';
  const pillBg = isDarkMode ? 'rgba(8,8,8,0.97)' : 'rgba(255,255,255,0.97)';
  const textDim = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(30,28,24,0.70)';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(30,28,24,0.50)';

  const totalSets = activeWorkout.exercises.reduce((s, ex) => s + ex.sets.length, 0);
  const completedSets = activeWorkout.exercises.reduce((s, ex) => s + ex.sets.filter(set => set.completed).length, 0);
  const totalVolume = Math.round(activeWorkout.exercises.reduce((total, ex) =>
    total + ex.sets.reduce((t, s) => {
      if (!s.completed) return t;
      return t + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
    }, 0), 0));

  const handleResume = () => {
    restoreWorkout();
    if (!location.pathname.toLowerCase().includes('workout')) {
      navigate('/Workouts');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 z-[200] flex items-center justify-between px-4 py-3 rounded-2xl"
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
            <MiniTimer workoutStartTime={workoutStartTime} style={{ fontSize: 14, color: textDim, fontVariantNumeric: 'tabular-nums' }} />
            <span className="text-xs" style={{ color: textMuted }}>{completedSets}/{totalSets} sets</span>
            {totalVolume > 0 && <span className="text-xs" style={{ color: gold, opacity: 0.8 }}>{totalVolume.toLocaleString()} {wUnit}</span>}
          </div>
        </div>
        <button
          onClick={handleResume}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
          style={{ background: isDarkMode ? 'rgba(212,175,55,0.15)' : 'rgba(154,122,20,0.12)', color: gold, fontFamily: 'Montserrat, sans-serif' }}
        >
          <ChevronUp className="w-4 h-4" />
          Resume
        </button>
      </motion.div>
    </AnimatePresence>
  );
}