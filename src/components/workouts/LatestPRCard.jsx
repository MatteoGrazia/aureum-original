import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { Zap } from 'lucide-react';

const GOLD = '#D4AF37';

const RING_SIZE = 180;
const STROKE = 2;
const R = (RING_SIZE - STROKE * 2) / 2;

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

function AnimatedNumber({ target, duration = 0.6 }) {
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

export default function LatestPRCard({ logs = [] }) {
  const latestPR = useMemo(() => {
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
    const entries = Object.entries(exerciseBests);
    entries.sort((a, b) => {
      try { return parseISO(b[1].date) - parseISO(a[1].date); }
      catch { return 0; }
    });
    const [name, { weight, date }] = entries[0];
    return { name, weight, date };
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="flex flex-col items-center pt-2 pb-4"
    >
      {/* Label */}
      <div className="flex items-center gap-1.5 mb-4">
        <Zap className="w-3 h-3" style={{ color: GOLD }} strokeWidth={1.5} />
        <p className="text-[9px] uppercase tracking-[0.35em]"
          style={{ color: 'rgba(229,229,231,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
          Latest PR
        </p>
      </div>

      {/* Ring */}
      <div className="relative flex items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
        {/* Radial glow */}
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
        }} />

        <svg width={RING_SIZE} height={RING_SIZE} className="absolute inset-0">
          <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={R}
            fill="none" stroke={GOLD} strokeWidth={STROKE}
            strokeOpacity={0.5}
            style={{ filter: `drop-shadow(0 0 3px rgba(212,175,55,0.4))` }}
          />
        </svg>

        {/* Inner content */}
        <div className="flex flex-col items-center justify-center z-10 px-4">
          {latestPR ? (
            <>
              <div className="leading-none text-center mb-1">
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 100, fontSize: 44, color: '#FFFFFF' }}>
                  <AnimatedNumber target={latestPR.weight} />
                </span>
                <span style={{ fontSize: 16, color: 'rgba(212,175,55,0.7)', marginLeft: 3, fontFamily: 'Montserrat, sans-serif' }}>kg</span>
              </div>
              <p className="text-[10px] text-center truncate w-full"
                style={{ color: 'rgba(229,229,231,0.7)', fontFamily: 'Montserrat, sans-serif', fontWeight: 300, maxWidth: 120 }}
                title={latestPR.name}>
                {latestPR.name}
              </p>
              <p className="text-[9px] mt-1" style={{ color: 'rgba(229,229,231,0.3)', fontFamily: 'Montserrat, sans-serif' }}>
                {timeAgoLabel(latestPR.date)}
              </p>
            </>
          ) : (
            <p className="text-[9px] text-center leading-relaxed px-3"
              style={{ color: 'rgba(229,229,231,0.25)', fontFamily: 'Montserrat, sans-serif' }}>
              Log a workout to set your first PR
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}