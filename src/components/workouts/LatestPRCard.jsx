import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { Zap } from 'lucide-react';

const GOLD = '#D4AF37';
const PEACH = '#FFDAB9';

function timeAgoLabel(dateStr) {
  if (!dateStr) return '';
  try {
    const days = differenceInCalendarDays(new Date(), parseISO(dateStr));
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return '1 week ago';
    if (weeks < 5) return `${weeks} weeks ago`;
    return `${Math.floor(days / 30)}mo ago`;
  } catch { return ''; }
}

export default function LatestPRCard({ logs = [], isLoading = false }) {
  const latestPR = useMemo(() => {
    // Find max weight per exercise, tracking which date that max was achieved
    const exerciseBests = {};

    logs.forEach(log => {
      (log.sets || []).forEach(s => {
        const name = s.exercise_name;
        if (!name || !s.weight || s.is_warmup) return;
        const w = s.weight || 0;
        if (!exerciseBests[name] || w > exerciseBests[name].weight) {
          exerciseBests[name] = { weight: w, date: log.date };
        }
      });
    });

    if (Object.keys(exerciseBests).length === 0) return null;

    // Find which exercise had its max weight set most recently
    const entries = Object.entries(exerciseBests);
    entries.sort((a, b) => {
      try {
        return parseISO(b[1].date) - parseISO(a[1].date);
      } catch { return 0; }
    });

    const [name, { weight, date }] = entries[0];
    return { name, weight, date };
  }, [logs]);

  if (isLoading) {
    return (
      <div
        className="flex-1 rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(212,175,55,0.15)' }}
      >
        <div className="h-3 w-20 rounded bg-white/10 animate-pulse mb-3" />
        <div className="h-8 w-24 rounded bg-white/10 animate-pulse mb-2" />
        <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="flex-1 rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid rgba(212,175,55,0.18)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Zap className="w-3 h-3" style={{ color: GOLD }} strokeWidth={1.5} />
        <p
          className="text-[9px] uppercase tracking-[0.3em]"
          style={{ color: 'rgba(229,229,231,0.45)', fontFamily: 'Montserrat, sans-serif' }}
        >
          Latest PR
        </p>
      </div>

      {latestPR ? (
        <>
          <p
            className="text-sm leading-tight mb-1 truncate"
            style={{ color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}
            title={latestPR.name}
          >
            {latestPR.name}
          </p>
          <p
            className="text-3xl leading-none mb-1"
            style={{ color: GOLD, fontFamily: 'Inter, sans-serif', fontWeight: 100 }}
          >
            {latestPR.weight}
            <span className="text-sm ml-1" style={{ color: 'rgba(212,175,55,0.5)' }}>kg</span>
          </p>
          <p
            className="text-[9px] uppercase tracking-[0.15em]"
            style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif', opacity: 0.6 }}
          >
            {timeAgoLabel(latestPR.date)}
          </p>
        </>
      ) : (
        <>
          <p
            className="text-2xl leading-none mb-2"
            style={{ color: 'rgba(255,255,255,0.12)', fontFamily: 'Inter, sans-serif', fontWeight: 100 }}
          >
            –
          </p>
          <p
            className="text-[9px] leading-relaxed"
            style={{ color: 'rgba(229,229,231,0.25)', fontFamily: 'Montserrat, sans-serif' }}
          >
            Log a workout to set your first PR
          </p>
        </>
      )}
    </motion.div>
  );
}