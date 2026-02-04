import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function RestTimer({ defaultTime = 60, onComplete }) {
  const [time, setTime] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(defaultTime);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            onComplete?.();
            return 0;
          }
          // Haptic tick at 10, 5, 4, 3, 2, 1
          if ([10, 5, 4, 3, 2, 1].includes(prev - 1) && 'vibrate' in navigator) {
            navigator.vibrate(50);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onComplete]);

  const startTimer = () => {
    if (time === 0) {
      setTime(initialTime);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(initialTime);
  };

  const adjustTime = (amount) => {
    if (!isRunning) {
      const newTime = Math.max(15, initialTime + amount);
      setInitialTime(newTime);
      setTime(newTime);
    }
  };

  const progress = time / initialTime;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <GlassCard className="p-5">
      <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4 text-center">Rest Timer</h3>

      <div className="relative flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="w-32 h-32 -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="rgba(212, 175, 55, 0.1)"
            strokeWidth="4"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={364.4}
            animate={{ strokeDashoffset: 364.4 * (1 - progress) }}
            transition={{ duration: 0.5 }}
            style={{
              filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.5))'
            }}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute text-center">
          <motion.p
            key={time}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-3xl tabular-nums ${time <= 5 ? 'text-red-400' : 'text-white'}`}
          >
            {minutes}:{seconds.toString().padStart(2, '0')}
          </motion.p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => adjustTime(-15)}
          disabled={isRunning}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30"
        >
          <Minus className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="w-14 h-14 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center hover:bg-[#D4AF37]/30 transition-colors"
        >
          {isRunning ? (
            <Pause className="w-6 h-6 text-[#D4AF37]" />
          ) : (
            <Play className="w-6 h-6 text-[#D4AF37] ml-1" />
          )}
        </button>

        <button
          onClick={resetTimer}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={() => adjustTime(15)}
          disabled={isRunning}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>
    </GlassCard>
  );
}