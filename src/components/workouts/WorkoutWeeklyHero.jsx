import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, subDays, format } from 'date-fns';
import { Flame } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';

const GOLD = '#D4AF37';
const PEACH = '#FFDAB9';
const PURPLE = '#BDB5D5';
const DEFAULT_GOAL = 5;

const RING_SIZE = 220;
const STROKE = 2.5;
const R = (RING_SIZE - STROKE * 2) / 2;
const CIRC = 2 * Math.PI * R;

function AnimatedNumber({ target, duration = 0.8 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      setVal(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{val}</>;
}

export default function WorkoutWeeklyHero({ logs = [], userProfile = null }) {
  const appSettings = useSettings();
  const weeklyGoal = appSettings.workout_weekly_goal || userProfile?.weekly_workout_goal || DEFAULT_GOAL;

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weekLogs = logs.filter(log => {
      try { return isWithinInterval(parseISO(log.date), { start: weekStart, end: weekEnd }); }
      catch { return false; }
    });

    const uniqueDays = new Set(weekLogs.map(l => l.date));
    const workoutsThisWeek = uniqueDays.size;

    let volumeThisWeek = 0;
    weekLogs.forEach(log => {
      (log.sets || []).forEach(s => {
        if (!s.is_warmup) volumeThisWeek += (s.weight || 0) * (s.reps || 0);
      });
      if ((log.sets || []).length === 0 && log.total_volume) volumeThisWeek += log.total_volume;
    });

    const durationThisWeek = weekLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);

    let streak = 0;
    let checkDate = now;
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (logs.some(l => l.date === dateStr)) { streak++; checkDate = subDays(checkDate, 1); }
      else break;
    }

    return { workoutsThisWeek, volumeThisWeek, durationThisWeek, streak };
  }, [logs]);

  const formatDuration = (mins) => {
    if (!mins) return '–';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const formatVolume = (vol) => {
    if (!vol) return '–';
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return `${Math.round(vol)}`;
  };

  const progress = Math.min(stats.workoutsThisWeek / weeklyGoal, 1);
  const arcLength = progress * CIRC;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center pt-6 pb-4"
    >
      {/* Label */}
      <p className="text-[9px] uppercase tracking-[0.35em] mb-5"
        style={{ color: 'rgba(229,229,231,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
        This Week
      </p>

      {/* Ring */}
      <div className="relative flex items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
        {/* Radial glow */}
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(189,181,213,0.10) 0%, transparent 70%)',
        }} />

        <svg width={RING_SIZE} height={RING_SIZE} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={R}
            fill="none" stroke="rgba(189,181,213,0.12)" strokeWidth={STROKE} />
          {/* Progress arc */}
          <motion.circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={R}
            fill="none" stroke={PURPLE} strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: CIRC - arcLength }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 4px rgba(189,181,213,0.6))` }}
          />
        </svg>

        {/* Inner content */}
        <div className="flex flex-col items-center justify-center z-10">
          <p className="leading-none" style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 100, fontSize: 52, color: '#FFFFFF',
            textShadow: '0 0 20px rgba(255,255,255,0.1)',
          }}>
            <AnimatedNumber target={stats.workoutsThisWeek} />
            <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.3)' }}>
              {' '}/{weeklyGoal}
            </span>
          </p>
          <p className="text-[9px] uppercase tracking-[0.3em] mt-2"
            style={{ color: GOLD, fontFamily: 'Montserrat, sans-serif' }}>
            This Week
          </p>
        </div>
      </div>

      {/* Stat pills */}
      <div className="flex gap-3 mt-5 w-full max-w-xs">
        <div className="flex-1 rounded-xl px-3 py-2.5 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(212,175,55,0.14)' }}>
          <p className="text-base leading-none" style={{ color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
            {formatVolume(stats.volumeThisWeek)}
          </p>
          <p className="text-[8px] uppercase tracking-[0.18em] mt-1" style={{ color: 'rgba(229,229,231,0.3)', fontFamily: 'Montserrat, sans-serif' }}>
            kg this week
          </p>
        </div>
        <div className="flex-1 rounded-xl px-3 py-2.5 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(212,175,55,0.14)' }}>
          <p className="text-base leading-none" style={{ color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
            {formatDuration(stats.durationThisWeek)}
          </p>
          <p className="text-[8px] uppercase tracking-[0.18em] mt-1" style={{ color: 'rgba(229,229,231,0.3)', fontFamily: 'Montserrat, sans-serif' }}>
            time this week
          </p>
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-2 mt-3">
        <Flame style={{ width: 16, height: 16, color: GOLD, filter: 'drop-shadow(0 0 5px rgba(212,175,55,0.5))' }} strokeWidth={1.5} />
        <p className="text-[11px]" style={{
          color: stats.streak > 0 ? PEACH : 'rgba(229,229,231,0.28)',
          fontFamily: 'Montserrat, sans-serif',
        }}>
          {stats.streak > 0 ? `${stats.streak} day streak` : 'Start your streak today'}
        </p>
      </div>
    </motion.div>
  );
}