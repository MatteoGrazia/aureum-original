import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/shared/ThemeContext';
import { format, subDays } from 'date-fns';

const STORAGE_KEY = 'aureum_supplement_log';
const today = format(new Date(), 'yyyy-MM-dd');

function getLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function calcStreak(log) {
  let streak = 0;
  let date = new Date();
  // If today is already checked, start from today; else start from yesterday
  const todayStr = format(date, 'yyyy-MM-dd');
  if (!log[todayStr]) date = subDays(date, 1);
  while (true) {
    const key = format(date, 'yyyy-MM-dd');
    if (!log[key]) break;
    streak++;
    date = subDays(date, 1);
  }
  return streak;
}

export default function SupplementStreak() {
  const { isDarkMode } = useTheme();
  const [log, setLog] = useState(getLog);
  const [streak, setStreak] = useState(0);
  const takenToday = !!log[today];

  useEffect(() => {
    setStreak(calcStreak(log));
  }, [log]);

  const toggle = () => {
    const updated = { ...log };
    if (updated[today]) {
      delete updated[today];
    } else {
      updated[today] = true;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setLog(updated);
  };

  // Last 7 days for the pill strip
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    return { key, label: format(d, 'EEE')[0], done: !!log[key] };
  });

  const textColor = isDarkMode ? 'rgba(255,255,255,0.85)' : '#1D1D1F';
  const subColor = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(29,29,31,0.45)';

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            Supplement Streak
          </p>
          <p className="text-[9px] mt-0.5" style={{ color: subColor, fontFamily: 'Montserrat, sans-serif' }}>
            {streak > 0 ? `${streak} day${streak !== 1 ? 's' : ''} in a row` : 'Start your streak today'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl" style={{ lineHeight: 1 }}>🔥</span>
          <span className="text-xl font-medium" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif' }}>
            {streak}
          </span>
        </div>
      </div>

      {/* 7-day strip */}
      <div className="flex gap-1.5 mb-4">
        {days.map((d) => (
          <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-7 rounded-lg flex items-center justify-center transition-all duration-300"
              style={{
                background: d.done
                  ? 'linear-gradient(135deg, #D4AF37, #F4D03F)'
                  : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: d.done
                  ? '0.5px solid rgba(212,175,55,0.5)'
                  : isDarkMode ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.08)',
                boxShadow: d.done ? '0 2px 8px rgba(212,175,55,0.3)' : 'none',
              }}
            >
              {d.done && <span style={{ fontSize: 12 }}>✓</span>}
            </div>
            <p className="text-[9px] uppercase" style={{ color: subColor, fontFamily: 'Montserrat, sans-serif' }}>
              {d.label}
            </p>
          </div>
        ))}
      </div>

      {/* Today button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={toggle}
        className="w-full py-3 rounded-xl text-sm uppercase tracking-wider transition-all duration-300"
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 400,
          background: takenToday
            ? isDarkMode ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.12)'
            : 'linear-gradient(135deg, #D4AF37, #F4D03F)',
          color: takenToday ? '#D4AF37' : '#080808',
          border: takenToday ? '0.5px solid rgba(212,175,55,0.4)' : 'none',
          boxShadow: takenToday ? 'none' : '0 4px 16px rgba(212,175,55,0.3)',
        }}
      >
        {takenToday ? '✓ Taken Today' : 'Mark as Taken'}
      </motion.button>
    </div>
  );
}