import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Dumbbell, Flame, Clock, TrendingUp, MoreVertical, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { getDominantMacroColor } from '@/components/nutrition/MacroMicroBar';

const haptic = () => { if (navigator.vibrate) navigator.vibrate(8); };

export default function SyndicateCard({ post, currentUserEmail, onVoltage, index = 0 }) {
  const hasGivenVoltage = (post.voltage_by || []).includes(currentUserEmail);
  const [voltageFlash, setVoltageFlash] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();

  const handleVoltage = async () => {
    if (hasGivenVoltage) return;
    haptic();
    setVoltageFlash(true);
    setTimeout(() => setVoltageFlash(false), 600);
    onVoltage?.(post);
  };

  const handleMute = async () => {
    const postAuthor = post.created_by || post.athlete_id;
    if (!postAuthor || postAuthor === currentUserEmail) return;
    try {
      await base44.entities.MutedUser.create({
        muted_user_id: postAuthor,
        muted_user_name: post.athlete_name,
      });
      queryClient.invalidateQueries(['mutedUsers']);
      queryClient.invalidateQueries(['performanceFeed']);
      setShowMenu(false);
    } catch (err) {
      console.error('Mute failed:', err);
    }
  };

  const isWorkout = post.post_type === 'workout';
  const isNutrition = post.post_type === 'nutrition';
  const voltageCount = post.voltage_count || 0;
  const isHighVoltage = voltageCount > 50;

  const timeAgo = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true })
    : '';

  // Card border: pulsing gold shimmer if >50 voltages
  const cardBorderStyle = isHighVoltage
    ? { border: '0.5px solid #D4AF37', animation: 'goldShimmer 2s ease-in-out infinite' }
    : { border: '0.5px solid #D4AF37' };

  // Title color: nutrition posts get dominant macro apricot tone
  const titleColor = isNutrition && (post.calories || post.protein_g)
    ? getDominantMacroColor(post.protein_g || 0, post.calories ? post.calories / 4 : 0, 0)
    : 'rgba(255,255,255,0.85)';

  return (
    <>
      <style>{`
        @keyframes goldShimmer {
          0%, 100% { border-color: #D4AF37; box-shadow: 0 0 8px rgba(212,175,55,0.3); }
          50% { border-color: #F4D03F; box-shadow: 0 0 20px rgba(244,208,63,0.5); }
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="mx-4 mb-4 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(25px)',
          ...cardBorderStyle,
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
          {post.created_by !== currentUserEmail && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <MoreVertical className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
              </button>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-10 right-0 rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(18,12,4,0.95)',
                    border: '0.5px solid rgba(212,175,55,0.3)',
                    minWidth: 160,
                    backdropFilter: 'blur(25px)',
                  }}
                >
                  <button
                    onClick={handleMute}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left transition-all hover:bg-white/5"
                  >
                    <EyeOff className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Montserrat, sans-serif' }}>
                      Hide posts
                    </span>
                  </button>
                </motion.div>
              )}
            </div>
          )}
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
          {/* Title — tinted by dominant macro for nutrition posts */}
          <p
            className="text-base mb-3"
            style={{ color: titleColor, fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}
          >
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
          {isHighVoltage && (
            <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', opacity: 0.6 }}>
              ⚡ High Voltage
            </span>
          )}
          {!isHighVoltage && <div />}
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
              {voltageCount}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}