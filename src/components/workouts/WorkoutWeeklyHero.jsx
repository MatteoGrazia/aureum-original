import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, differenceInCalendarDays, subDays, format } from 'date-fns';

const GOLD = '#D4AF37';
const PEACH = '#FFDAB9';

const DEFAULT_GOAL = 5;

export default function WorkoutWeeklyHero({ logs = [], userProfile = null, isLoading = false }) {
  const weeklyGoal = userProfile?.weekly_workout_goal || DEFAULT_GOAL;

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weekLogs = logs.filter(log => {
      try {
        return isWithinInterval(parseISO(log.date), { start: weekStart, end: weekEnd });
      } catch { return false; }
    });

    // Workouts completed this week (unique days)
    const uniqueDays = new Set(weekLogs.map(l => l.date));
    const workoutsThisWeek = uniqueDays.size;

    // Total volume this week: sum of (reps × weight) across all completed sets
    let volumeThisWeek = 0;
    weekLogs.forEach(log => {
      (log.sets || []).forEach(s => {
        if (!s.is_warmup) {
          volumeThisWeek += (s.weight || 0) * (s.reps || 0);
        }
      });
      // Fallback: use total_volume if sets are empty
      if ((log.sets || []).length === 0 && log.total_volume) {
        volumeThisWeek += log.total_volume;
      }
    });

    // Total duration this week
    let durationThisWeek = weekLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);

    // Streak: consecutive days with at least one workout, going back from today
    let streak = 0;
    let checkDate = now;
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const hasWorkout = logs.some(l => l.date === dateStr);
      if (hasWorkout) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return { workoutsThisWeek, volumeThisWeek, durationThisWeek, streak };
  }, [logs]);

  const formatDuration = (mins) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const formatVolume = (vol) => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return `${Math.round(vol)}`;
  };

  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-5 mb-1"
        style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(212,175,55,0.15)' }}
      >
        <div className="h-4 w-32 rounded bg-white/10 mb-4 animate-pulse" />
        <div className="flex gap-2 mb-4">
          {Array.from({ length: DEFAULT_GOAL }).map((_, i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-white/10 animate-pulse" />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-14 rounded-xl bg-white/10 animate-pulse" />
          <div className="flex-1 h-14 rounded-xl bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-5 mb-1"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid rgba(212,175,55,0.18)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-[9px] uppercase tracking-[0.3em]"
          style={{ color: 'rgba(229,229,231,0.45)', fontFamily: 'Montserrat, sans-serif' }}
        >
          This Week
        </p>
        <p
          className="text-[11px]"
          style={{ color: GOLD, fontFamily: 'Montserrat, sans-serif' }}
        >
          {stats.workoutsThisWeek} / {weeklyGoal}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2.5 mb-5">
        {Array.from({ length: weeklyGoal }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-full"
            style={{
              width: 28,
              height: 28,
              background: i < stats.workoutsThisWeek
                ? `radial-gradient(circle at 38% 35%, rgba(255,255,255,0.18) 0%, rgba(212,175,55,0.9) 100%)`
                : 'rgba(255,255,255,0.06)',
              border: i < stats.workoutsThisWeek
                ? '0.5px solid rgba(212,175,55,0.8)'
                : '0.5px solid rgba(255,255,255,0.12)',
              boxShadow: i < stats.workoutsThisWeek
                ? '0 0 8px rgba(212,175,55,0.45)'
                : 'none',
            }}
          />
        ))}
        {/* Overflow dots if somehow exceeded goal */}
        {stats.workoutsThisWeek > weeklyGoal && (
          <span className="text-[10px]" style={{ color: GOLD, fontFamily: 'Montserrat, sans-serif' }}>
            +{stats.workoutsThisWeek - weeklyGoal}
          </span>
        )}
      </div>

      {/* Stat pills */}
      <div className="flex gap-2.5 mb-4">
        <div
          className="flex-1 rounded-xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(212,175,55,0.12)' }}
        >
          <p className="text-lg leading-none" style={{ color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
            {stats.volumeThisWeek > 0 ? formatVolume(stats.volumeThisWeek) : '–'}
          </p>
          <p className="text-[9px] uppercase tracking-[0.18em] mt-1" style={{ color: 'rgba(229,229,231,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
            kg this week
          </p>
        </div>
        <div
          className="flex-1 rounded-xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(212,175,55,0.12)' }}
        >
          <p className="text-lg leading-none" style={{ color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
            {stats.durationThisWeek > 0 ? formatDuration(stats.durationThisWeek) : '–'}
          </p>
          <p className="text-[9px] uppercase tracking-[0.18em] mt-1" style={{ color: 'rgba(229,229,231,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
            this week
          </p>
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-2">
        <span className="text-base">🔥</span>
        <p
          className="text-[11px]"
          style={{ color: stats.streak > 0 ? PEACH : 'rgba(229,229,231,0.3)', fontFamily: 'Montserrat, sans-serif' }}
        >
          {stats.streak > 0 ? `${stats.streak} day streak` : 'Start your streak today'}
        </p>
      </div>
    </motion.div>
  );
}