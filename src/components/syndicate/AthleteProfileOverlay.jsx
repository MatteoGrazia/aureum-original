import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Dumbbell, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AthleteProfileOverlay({ athleteName, athleteAvatar, athleteId, onClose }) {
  const { data: posts = [] } = useQuery({
    queryKey: ['athletePosts', athleteId],
    queryFn: () => base44.entities.PerformanceFeed.filter({ athlete_id: athleteId }, '-created_date', 10),
    enabled: !!athleteId,
  });

  const totalVolume = posts.filter(p => p.post_type === 'workout').reduce((s, p) => s + (p.volume_kg || 0), 0);
  const totalVoltage = posts.reduce((s, p) => s + (p.voltage_count || 0), 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-md rounded-t-3xl overflow-hidden"
          style={{
            background: 'rgba(10, 14, 12, 0.94)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '0.5px solid rgba(152,171,143,0.3)',
            borderBottom: 'none',
            boxShadow: 'inset 0 0 60px rgba(152,171,143,0.03)',
            paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(152,171,143,0.3)' }} />
          </div>

          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <X className="w-4 h-4 text-white/40" />
          </button>

          {/* Avatar + Name */}
          <div className="flex flex-col items-center pt-4 pb-6 px-6">
            <div
              className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-2xl font-semibold"
              style={{
                background: athleteAvatar
                  ? `url(${athleteAvatar}) center/cover`
                  : 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(152,171,143,0.2))',
                border: '2px solid #98AB8F',
                boxShadow: '0 0 20px rgba(152,171,143,0.3)',
                color: '#D4AF37',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {!athleteAvatar && (athleteName?.[0] || '?')}
            </div>
            <h2 className="text-xl tracking-[0.15em]" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
              {athleteName || 'Athlete'}
            </h2>
            <div
              className="mt-1.5 px-3 py-0.5 rounded-full text-[9px] uppercase tracking-[0.2em]"
              style={{ background: 'rgba(152,171,143,0.12)', color: '#98AB8F', fontFamily: 'Montserrat, sans-serif' }}
            >
              Syndicate Member
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mx-6 mb-6">
            {[
              { label: 'Posts', value: posts.length, icon: Dumbbell },
              { label: 'Volume', value: `${(totalVolume / 1000).toFixed(1)}t`, icon: Clock },
              { label: 'Voltage', value: totalVoltage, icon: Zap },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center py-3 rounded-xl"
                style={{ background: 'rgba(152,171,143,0.06)', border: '0.5px solid rgba(152,171,143,0.15)' }}
              >
                <Icon className="w-3.5 h-3.5 mb-1.5" style={{ color: '#98AB8F' }} strokeWidth={1.5} />
                <p className="text-base" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>{value}</p>
                <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', opacity: 0.45 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="mx-6">
            <p className="text-[9px] uppercase tracking-[0.25em] mb-3" style={{ color: 'rgba(152,171,143,0.6)', fontFamily: 'Montserrat, sans-serif' }}>Recent Activity</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {posts.slice(0, 5).map(post => (
                <div
                  key={post.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(212,175,55,0.08)' }}
                >
                  <p className="text-xs truncate flex-1" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', opacity: 0.7 }}>
                    {post.title}
                  </p>
                  <span
                    className="ml-2 text-[9px] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: post.post_type === 'workout' ? 'rgba(189,181,213,0.12)' : 'rgba(255,218,185,0.12)',
                      color: post.post_type === 'workout' ? '#BDB5D5' : '#FFDAB9',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    {post.post_type}
                  </span>
                </div>
              ))}
              {posts.length === 0 && (
                <p className="text-center text-xs py-3" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Montserrat, sans-serif' }}>No activity yet</p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}