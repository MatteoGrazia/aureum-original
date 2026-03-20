import React from 'react';
import { motion } from 'framer-motion';
import { differenceInHours } from 'date-fns';

export default function PulseRow({ athletes }) {
  if (!athletes || athletes.length === 0) return null;

  // Deduplicate athletes by created_by/id
  const uniqueAthletes = React.useMemo(() => {
    const seen = new Set();
    return athletes.filter(a => {
      const key = a.created_by || a.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [athletes]);

  return (
    <div className="px-4 mb-6">
      <p
        className="text-[9px] uppercase tracking-[0.3em] mb-3 pl-1"
        style={{ color: 'rgba(178,216,216,0.6)', fontFamily: 'Montserrat, sans-serif' }}
      >
        Active Now
      </p>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {athletes.map((athlete, i) => {
          const isRecent = athlete.last_active
            ? differenceInHours(new Date(), new Date(athlete.last_active)) < 12
            : false;

          return (
            <motion.div
              key={athlete.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              {/* Avatar ring */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold"
                style={{
                  background: athlete.avatar_url
                    ? `url(${athlete.avatar_url}) center/cover`
                    : 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(178,216,216,0.15))',
                  border: isRecent ? '1.5px solid #B2D8D8' : '1.5px solid rgba(212,175,55,0.25)',
                  boxShadow: isRecent ? '0 0 12px rgba(178,216,216,0.3)' : 'none',
                  color: '#D4AF37',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {!athlete.avatar_url && (athlete.username?.[0]?.toUpperCase() || '?')}
              </div>

              {/* Name */}
              <p
                className="text-[10px] text-center truncate max-w-[56px]"
                style={{ color: isRecent ? '#B2D8D8' : '#E5E5E7', fontFamily: 'Montserrat, sans-serif', opacity: isRecent ? 1 : 0.5 }}
              >
                {athlete.username || 'Athlete'}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}