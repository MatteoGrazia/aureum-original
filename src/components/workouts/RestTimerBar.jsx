// FIX 3 — BLACK SCREEN ON TIMER END
// Flutter equivalent: use AnimatedBuilder with a Ticker for countdown, dispose ticker on unmount

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';

const playRestBell = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
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

export default function RestTimerBar({ duration = 90, onComplete, onDismiss }) {
  const { isDarkMode } = useTheme();
  const [time, setTime] = useState(duration);
  const [done, setDone] = useState(false);
  const totalRef = useRef(duration);
  const intervalRef = useRef(null);
  // FIX 3: mounted check to prevent state updates after unmount
  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    // FIX 3: clear any existing interval before starting
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTime(prev => {
        if (!isMounted.current) return prev;
        if (prev <= 1) {
          // FIX 3: stop timer, do NOT call onComplete (which was causing unmount + black screen)
          // Instead show "Rest complete" in UI and just call onComplete safely
          clearInterval(intervalRef.current);
          if (isMounted.current) {
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
            playRestBell();
            setDone(true);
            // Notify parent but don't unmount — parent can decide to hide after toast
            setTimeout(() => {
              if (isMounted.current) onComplete?.();
            }, 1800);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // FIX 3: always clear interval on cleanup
    return () => clearInterval(intervalRef.current);
  }, []);

  const adjust = (delta) => {
    if (!isMounted.current) return;
    setDone(false);
    setTime(t => {
      const next = Math.max(5, t + delta);
      if (next > totalRef.current) totalRef.current = next;
      return next;
    });
    // restart interval if it stopped
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTime(prev => {
        if (!isMounted.current) return prev;
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (isMounted.current) {
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
            playRestBell();
            setDone(true);
            setTimeout(() => { if (isMounted.current) onComplete?.(); }, 1800);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const m = Math.floor(time / 60);
  const s = time % 60;
  const pct = Math.min(1, time / totalRef.current);
  const isUrgent = time <= 5 && !done;

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
        background: done
          ? (isDarkMode ? 'rgba(34,197,94,0.08)' : 'rgba(22,101,52,0.07)')
          : (isDarkMode ? 'rgba(212,175,55,0.07)' : 'rgba(154,122,20,0.06)'),
        border: `0.5px solid ${done ? 'rgba(34,197,94,0.4)' : isUrgent ? 'rgba(239,68,68,0.5)' : (isDarkMode ? 'rgba(212,175,55,0.25)' : 'rgba(154,122,20,0.30)')}`,
        backdropFilter: 'blur(20px)',
        borderRadius: '14px',
        padding: '10px 14px',
      }}
    >
      {done ? (
        // FIX 3: "Rest complete" toast — no navigation, no unmount
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: '#22c55e', fontFamily: 'Montserrat, sans-serif' }}>
            ✓ Rest complete, time to work!
          </span>
          <button onClick={onDismiss} className="w-8 h-8 rounded-lg flex items-center justify-center ml-3" style={{ background: btnBg }}>
            <X className="w-3 h-3" style={{ color: iconColor }} />
          </button>
        </div>
      ) : (
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
      )}
    </motion.div>
  );
}