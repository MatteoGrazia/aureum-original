import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { differenceInHours } from 'date-fns';

export default function PulseRow({ athletes, onAthleteTap }) {
  // Deduplicate athletes by created_by/id
  const uniqueAthletes = useMemo(() => {
    if (!athletes || athletes.length === 0) return [];
    const seen = new Set();
    return athletes.filter(a => {
      const key = a.created_by || a.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [athletes]);

  if (!uniqueAthletes.length) return null;

  return (
    <div className="px-4 mb-6">
      <p
        className="text-[9px] uppercase tracking-[0.3em] mb-3 pl-1"
        style={{ color: 'rgba(178,216,216,0.6)', fontFamily: 'Montserrat, sans-serif' }}
      >
        Active Now
      </p>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {uniqueAthletes.map((athlete, i) => {
          const isRecent = athlete.last_active
            ? differenceInHours(new Date(), new Date(athlete.last_active)) < 12
            : false;

          return (
            <motion.button
              key={athlete.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="flex flex-col items-center gap-1 flex-shrink-0 active:scale-90 transition-transform"
              onClick={() => onAthleteTap?.(athlete)}
            >
              {/* Avatar ring */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold overflow-hidden"
                style={{
                  background: athlete.avatar_url
                    ? undefined
                    : 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(178,216,216,0.15))',
                  border: isRecent ? '1.5px solid #98AB8F' : '1.5px solid rgba(212,175,55,0.25)',
                  boxShadow: isRecent ? '0 0 12px rgba(152,171,143,0.35)' : 'none',
                  color: '#D4AF37',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {athlete.avatar_url
                  ? <img src={athlete.avatar_url} alt={athlete.username} className="w-full h-full object-cover" loading="lazy" />
                  : (athlete.username?.[0]?.toUpperCase() || '?')
                }
              </div>

              {/* Name */}
              <p
                className="text-[10px] text-center truncate max-w-[56px]"
                style={{ color: isRecent ? '#98AB8F' : '#E5E5E7', fontFamily: 'Montserrat, sans-serif', opacity: isRecent ? 1 : 0.5 }}
              >
                {athlete.username || 'Athlete'}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}