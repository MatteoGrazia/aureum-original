import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Check } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';
import { format, subDays, startOfWeek, addDays, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from 'date-fns';

const STORAGE_KEY = 'aureum_supplement_log';

function getLog() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function calcStreak(log) {
  let streak = 0;
  let date = new Date();
  if (!log[format(date, 'yyyy-MM-dd')]) date = subDays(date, 1);
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
  const [view, setView] = useState('daily');
  const today = format(new Date(), 'yyyy-MM-dd');
  const takenToday = !!log[today];

  useEffect(() => { setStreak(calcStreak(log)); }, [log]);

  // Sync with FAB (same-tab localStorage polling)
  useEffect(() => {
    const interval = setInterval(() => { setLog(getLog()); }, 1500);
    return () => clearInterval(interval);
  }, []);

  const toggle = () => {
    const updated = { ...log };
    if (updated[today]) { delete updated[today]; } else { updated[today] = true; }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setLog(updated);
  };

  const subColor = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(29,29,31,0.45)';

  // Daily: last 7 days
  const dailyDays = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    return { key, dayLabel: format(d, 'EEE')[0], done: !!log[key], isToday: key === today };
  });

  // Weekly: last 6 weeks
  const weeklyData = Array.from({ length: 6 }, (_, i) => {
    const weekStart = startOfWeek(subDays(new Date(), (5 - i) * 7), { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, j) => !!log[format(addDays(weekStart, j), 'yyyy-MM-dd')]);
    const count = days.filter(Boolean).length;
    return { label: format(weekStart, 'MMM d'), count, pct: Math.round((count / 7) * 100) };
  });

  // Monthly: last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subMonths(new Date(), 5 - i));
    const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(monthStart) });
    const count = days.filter(d => !!log[format(d, 'yyyy-MM-dd')]).length;
    const pct = Math.round((count / days.length) * 100);
    return { label: format(monthStart, 'MMM'), count, total: days.length, pct };
  });

  const barStyle = (pct, i, delay = 0.05) => ({
    height: `${pct}%`,
    minHeight: pct > 0 ? 4 : 0,
    background: pct >= 100 ? 'linear-gradient(180deg, #F4D03F, #D4AF37)' : 'rgba(212,175,55,0.5)',
    borderRadius: 4,
    width: '100%',
  });

  return (
    <div>
      {/* Header */}
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
          <Flame style={{ width: 18, height: 18, color: '#D4AF37', filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.5))' }} strokeWidth={1.5} />
          <span className="text-xl" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{streak}</span>
        </div>
      </div>

      {/* View switcher */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
        {['daily', 'weekly', 'monthly'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className="flex-1 py-1.5 rounded-lg transition-all duration-200"
            style={{
              fontFamily: 'Montserrat, sans-serif', fontWeight: 500,
              fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em',
              background: view === v ? 'rgba(212,175,55,0.18)' : 'transparent',
              color: view === v ? '#D4AF37' : subColor,
              border: view === v ? '0.5px solid rgba(212,175,55,0.3)' : '0.5px solid transparent',
              cursor: 'pointer',
            }}>
            {v}
          </button>
        ))}
      </div>

      {/* Daily */}
      {view === 'daily' && (
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dailyDays.map((d) => (
            <div key={d.key} className="flex flex-col items-center gap-1">
              <div className="w-full h-8 rounded-lg flex items-center justify-center transition-all duration-300"
                style={{
                  background: d.done ? 'linear-gradient(135deg, #D4AF37, #F4D03F)' : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: d.isToday ? '1px solid rgba(212,175,55,0.7)' : d.done ? '0.5px solid rgba(212,175,55,0.4)' : '0.5px solid rgba(255,255,255,0.08)',
                  boxShadow: d.done ? '0 2px 8px rgba(212,175,55,0.3)' : 'none',
                }}>
                {d.done && <span style={{ fontSize: 11 }}>✓</span>}
              </div>
              <p className="text-[8px] uppercase" style={{ color: d.isToday ? '#D4AF37' : subColor, fontFamily: 'Montserrat, sans-serif' }}>
                {d.dayLabel}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Weekly */}
      {view === 'weekly' && (
        <div className="flex gap-2 mb-4 items-end" style={{ height: 80 }}>
          {weeklyData.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <p style={{ color: '#D4AF37', fontFamily: 'Montserrat', fontSize: 8, marginBottom: 2 }}>{w.count}/7</p>
              <div className="w-full rounded-md flex flex-col justify-end overflow-hidden"
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${w.pct}%` }}
                  transition={{ delay: i * 0.06, type: 'spring', damping: 20 }}
                  style={barStyle(w.pct)} />
              </div>
              <p style={{ color: subColor, fontFamily: 'Montserrat', fontSize: 7, textAlign: 'center', lineHeight: 1.3 }}>{w.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Monthly */}
      {view === 'monthly' && (
        <div className="flex gap-2 mb-4 items-end" style={{ height: 80 }}>
          {monthlyData.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <p style={{ color: '#D4AF37', fontFamily: 'Montserrat', fontSize: 8, marginBottom: 2 }}>{m.pct}%</p>
              <div className="w-full rounded-md flex flex-col justify-end overflow-hidden"
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${m.pct}%` }}
                  transition={{ delay: i * 0.07, type: 'spring', damping: 20 }}
                  style={barStyle(m.pct)} />
              </div>
              <p style={{ color: subColor, fontFamily: 'Montserrat', fontSize: 8 }}>{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Today toggle button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={toggle}
        className="w-full py-3 rounded-xl uppercase tracking-wider transition-all duration-300"
        style={{
          fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 10,
          background: takenToday ? (isDarkMode ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.12)') : 'linear-gradient(135deg, #D4AF37, #F4D03F)',
          color: takenToday ? '#D4AF37' : '#080808',
          border: takenToday ? '0.5px solid rgba(212,175,55,0.4)' : 'none',
          boxShadow: takenToday ? 'none' : '0 4px 16px rgba(212,175,55,0.3)',
        }}>
        {takenToday ? '✓ Taken Today' : 'Mark as Taken'}
      </motion.button>
    </div>
  );
}