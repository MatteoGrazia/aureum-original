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
import { useTheme } from '@/components/shared/ThemeContext';

export default function RestTimerBar({ duration = 90, onComplete, onDismiss }) {
  const { isDarkMode } = useTheme();
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

  const gold = isDarkMode ? '#D4AF37' : '#9A7A14';
  const btnBg = isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(30,28,24,0.08)';
  const iconColor = isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(30,28,24,0.55)';
  const trackBg = isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(30,28,24,0.12)';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        background: isDarkMode ? 'rgba(212,175,55,0.07)' : 'rgba(154,122,20,0.06)',
        border: `0.5px solid ${isUrgent ? 'rgba(239,68,68,0.5)' : (isDarkMode ? 'rgba(212,175,55,0.25)' : 'rgba(154,122,20,0.30)')}`,
        backdropFilter: 'blur(20px)',
        borderRadius: '14px',
        padding: '10px 14px',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase tracking-widest" style={{ color: isDarkMode ? 'rgba(212,175,55,0.6)' : 'rgba(154,122,20,0.7)' }}>Rest</span>
            <span
              className="text-xl tabular-nums"
              style={{ color: isUrgent ? '#b91c1c' : gold, fontFamily: 'Montserrat, sans-serif' }}
            >
              {m}:{s.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: trackBg }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: isUrgent ? '#b91c1c' : gold }}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        <button onClick={() => adjust(-15)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: btnBg }}>
          <Minus className="w-3 h-3" style={{ color: iconColor }} />
        </button>
        <button onClick={() => adjust(15)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: btnBg }}>
          <Plus className="w-3 h-3" style={{ color: iconColor }} />
        </button>
        <button onClick={onDismiss} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(30,28,24,0.05)' }}>
          <X className="w-3 h-3" style={{ color: isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(30,28,24,0.45)' }} />
        </button>
      </div>
    </motion.div>
  );
}