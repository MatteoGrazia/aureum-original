import React, { useState, useEffect, useRef } from 'react';

const playRestBell = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Tibetan bowl resonance — fundamental + harmonics with long decay
    [
      { freq: 396, delay: 0,    vol: 0.30, dur: 3.5 },
      { freq: 594, delay: 0.04, vol: 0.18, dur: 3.0 },
      { freq: 792, delay: 0.10, vol: 0.10, dur: 2.5 },
      { freq: 990, delay: 0.18, vol: 0.06, dur: 2.0 },
    ].forEach(({ freq, delay, vol, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t); osc.stop(t + dur + 0.05);
    });
  } catch (_) {}
};
import { motion } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';

export default function RestTimerBar({ duration = 90, onComplete, onDismiss }) {
  const [time, setTime] = useState(duration);
  const totalRef = useRef(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
          playRestBell();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const adjust = (delta) => {
    setTime(t => {
      const next = Math.max(5, t + delta);
      if (next > totalRef.current) totalRef.current = next;
      return next;
    });
  };

  const m = Math.floor(time / 60);
  const s = time % 60;
  const pct = Math.min(1, time / totalRef.current);
  const isUrgent = time <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        background: 'rgba(212,175,55,0.07)',
        border: `0.5px solid ${isUrgent ? 'rgba(239,68,68,0.5)' : 'rgba(212,175,55,0.25)'}`,
        backdropFilter: 'blur(20px)',
        borderRadius: '14px',
        padding: '10px 14px',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase tracking-widest text-[#D4AF37]/60">Rest</span>
            <span
              className={`text-xl tabular-nums ${isUrgent ? 'text-red-400' : 'text-[#D4AF37]'}`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {m}:{s.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isUrgent ? 'bg-red-400' : 'bg-[#D4AF37]'}`}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        <button onClick={() => adjust(-15)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Minus className="w-3 h-3 text-white/50" />
        </button>
        <button onClick={() => adjust(15)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Plus className="w-3 h-3 text-white/50" />
        </button>
        <button onClick={onDismiss} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <X className="w-3 h-3 text-white/35" />
        </button>
      </div>
    </motion.div>
  );
}