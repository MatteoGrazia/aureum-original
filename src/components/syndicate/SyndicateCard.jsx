import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Dumbbell, Flame, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { base44 } from '@/api/base44Client';

const haptic = () => { if (navigator.vibrate) navigator.vibrate(8); };

export default function SyndicateCard({ post, currentUserEmail, onVoltage, index = 0 }) {
  const hasGivenVoltage = (post.voltage_by || []).includes(currentUserEmail);
  const [voltageFlash, setVoltageFlash] = useState(false);

  const handleVoltage = async () => {
    if (hasGivenVoltage) return;
    haptic();
    setVoltageFlash(true);
    setTimeout(() => setVoltageFlash(false), 600);
    onVoltage?.(post);
  };

  const isWorkout = post.post_type === 'workout';
  const isNutrition = post.post_type === 'nutrition';

  const timeAgo = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="mx-4 mb-4 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '0.5px solid #D4AF37',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3" style={{ borderBottom: '0.5px solid rgba(212,175,55,0.12)' }}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
          style={{
            background: post.athlete_avatar
              ? `url(${post.athlete_avatar}) center/cover`
              : 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(178,216,216,0.2))',
            border: '1px solid rgba(212,175,55,0.3)',
            color: '#D4AF37',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {!post.athlete_avatar && (post.athlete_name?.[0] || '?')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
            {post.athlete_name || 'Athlete'}
          </p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', opacity: 0.5 }}>
            {timeAgo}
          </p>
        </div>
        {/* Post type badge */}
        <div
          className="px-2 py-1 rounded-lg text-[9px] uppercase tracking-[0.15em]"
          style={{
            background: isWorkout ? 'rgba(189,181,213,0.12)' : isNutrition ? 'rgba(255,218,185,0.12)' : 'rgba(212,175,55,0.12)',
            color: isWorkout ? '#BDB5D5' : isNutrition ? '#FFDAB9' : '#D4AF37',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {post.post_type}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <p className="text-base mb-3" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
          {post.title}
        </p>

        {/* Workout stats */}
        {isWorkout && (post.volume_kg || post.duration_minutes) && (
          <div className="flex gap-4">
            {post.volume_kg > 0 && (
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" style={{ color: '#BDB5D5' }} strokeWidth={1.5} />
                <span className="text-sm" style={{ color: '#BDB5D5', fontFamily: 'Montserrat, sans-serif' }}>
                  {post.volume_kg.toLocaleString()} kg
                </span>
              </div>
            )}
            {post.duration_minutes > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: '#BDB5D5' }} strokeWidth={1.5} />
                <span className="text-sm" style={{ color: '#BDB5D5', fontFamily: 'Montserrat, sans-serif' }}>
                  {post.duration_minutes}m
                </span>
              </div>
            )}
          </div>
        )}

        {/* Nutrition stats */}
        {isNutrition && (post.calories || post.protein_g) && (
          <div className="flex gap-4">
            {post.calories > 0 && (
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" style={{ color: '#FFDAB9' }} strokeWidth={1.5} />
                <span className="text-sm" style={{ color: '#FFDAB9', fontFamily: 'Montserrat, sans-serif' }}>
                  {post.calories} kcal
                </span>
              </div>
            )}
            {post.protein_g > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#FFDAB9' }} strokeWidth={1.5} />
                <span className="text-sm" style={{ color: '#FFDAB9', fontFamily: 'Montserrat, sans-serif' }}>
                  {post.protein_g}g protein
                </span>
              </div>
            )}
          </div>
        )}

        {post.notes && (
          <p className="text-xs mt-3 leading-relaxed" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', opacity: 0.55 }}>
            {post.notes}
          </p>
        )}
      </div>

      {/* Footer — Voltage */}
      <div className="flex items-center justify-between px-4 pb-4" style={{ borderTop: '0.5px solid rgba(212,175,55,0.08)' }}>
        <div />
        <motion.button
          onClick={handleVoltage}
          disabled={hasGivenVoltage}
          animate={voltageFlash ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl mt-3 transition-all active:scale-95"
          style={{
            background: hasGivenVoltage ? 'rgba(178,216,216,0.12)' : 'rgba(178,216,216,0.06)',
            border: `0.5px solid ${hasGivenVoltage ? 'rgba(178,216,216,0.4)' : 'rgba(178,216,216,0.2)'}`,
          }}
        >
          <Zap
            className="w-4 h-4"
            style={{ color: hasGivenVoltage ? '#B2D8D8' : 'rgba(178,216,216,0.4)' }}
            strokeWidth={1.5}
            fill={hasGivenVoltage ? '#B2D8D8' : 'none'}
          />
          <span
            className="text-xs"
            style={{ color: hasGivenVoltage ? '#B2D8D8' : 'rgba(178,216,216,0.4)', fontFamily: 'Montserrat, sans-serif' }}
          >
            {post.voltage_count || 0}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}