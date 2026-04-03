import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Dumbbell, Flame, Clock, TrendingUp, MoreVertical, EyeOff, MessageCircle, Send, Flag } from 'lucide-react';
import AscensionFeather from './AscensionFeather';
import { formatDistanceToNow } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDominantMacroColor } from '@/components/nutrition/MacroMicroBar';
import AthleteProfileOverlay from './AthleteProfileOverlay';

// Heavy Thud haptic — simulates the weight of a gold medal
const haptic = () => { if (navigator.vibrate) navigator.vibrate([40, 10, 60]); };

export default function SyndicateCard({ post, currentUserEmail, onVoltage, index = 0, currentUserIsFounder = false }) {
  const hasGivenVoltage = (post.voltage_by || []).includes(currentUserEmail);
  const [voltageFlash, setVoltageFlash] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAthleteProfile, setShowAthleteProfile] = useState(false);
  const [reported, setReported] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: () => base44.entities.Comment.filter({ post_id: post.id }, 'created_date', 20),
    enabled: showComments,
  });

  const handleVoltage = async () => {
    if (hasGivenVoltage) return;
    haptic();
    setVoltageFlash(true);
    setTimeout(() => setVoltageFlash(false), 600);
    onVoltage?.(post);
  };

  const handleReport = async () => {
    if (reported || post.created_by === currentUserEmail) return;
    const currentReports = post.reported_by || [];
    if (currentReports.includes(currentUserEmail)) return;
    const newReported = [...currentReports, currentUserEmail];
    const newCount = newReported.length;
    await base44.entities.PerformanceFeed.update(post.id, {
      report_count: newCount,
      reported_by: newReported,
    });
    setReported(true);
    toast('Report submitted to the Syndicate.', {
      style: { background: 'rgba(12,12,12,0.97)', border: '0.5px solid #98AB8F', color: '#98AB8F', fontFamily: 'Montserrat, sans-serif' },
      icon: '🪶',
    });
    setShowMenu(false);
  };

  const handleMute = async () => {
    const postAuthor = post.created_by || post.athlete_id;
    if (!postAuthor || postAuthor === currentUserEmail) return;
    await base44.entities.MutedUser.create({ muted_user_id: postAuthor, muted_user_name: post.athlete_name });
    queryClient.invalidateQueries(['mutedUsers']);
    queryClient.invalidateQueries(['performanceFeed']);
    setShowMenu(false);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    const user = await base44.auth.me();
    const identities = await base44.entities.AthleteIdentity.filter({ created_by: user.email });
    const identity = identities[0];
    await base44.entities.Comment.create({
      post_id: post.id,
      commenter_name: identity?.username || user.full_name || 'Athlete',
      commenter_avatar: identity?.avatar_url || '',
      text: commentText.trim(),
    });
    await base44.entities.PerformanceFeed.update(post.id, {
      comment_count: (post.comment_count || 0) + 1,
    });
    setCommentText('');
    setSubmitting(false);
    refetchComments();
    queryClient.invalidateQueries(['performanceFeed']);
  };

  const isWorkout = post.post_type === 'workout';
  const isNutrition = post.post_type === 'nutrition';
  const voltageCount = post.voltage_count || 0;
  const reportCount = post.report_count || 0;
  const isUnderReview = reportCount >= 3;
  const isElite = voltageCount >= 500;
  const commentCount = post.comment_count || 0;

  const timeAgo = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true })
    : '';

  const cardBorderStyle = isElite
    ? { border: '0.5px solid #D4AF37', animation: 'goldShimmer 2s ease-in-out infinite' }
    : { border: '0.5px solid #D4AF37' };

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

      {showAthleteProfile && (
        <AthleteProfileOverlay
          athleteName={post.athlete_name}
          athleteAvatar={post.athlete_avatar}
          athleteId={post.athlete_id}
          onClose={() => setShowAthleteProfile(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="mx-4 mb-4 rounded-2xl overflow-hidden relative"
        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(25px)', ...cardBorderStyle }}
      >
        {isElite && (
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl z-0"
            style={{
              background: 'repeating-linear-gradient(45deg, rgba(212,175,55,0.04) 0px, rgba(212,175,55,0.04) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(-45deg, rgba(212,175,55,0.03) 0px, rgba(212,175,55,0.03) 1px, transparent 1px, transparent 8px)',
            }}
          />
        )}

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3" style={{ borderBottom: '0.5px solid rgba(212,175,55,0.12)' }}>
          <button
            onClick={() => setShowAthleteProfile(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 active:scale-90 transition-transform overflow-hidden"
            style={{
              background: post.athlete_avatar ? undefined : 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(152,171,143,0.2))',
              border: '1px solid rgba(152,171,143,0.4)',
              color: '#D4AF37',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            {post.athlete_avatar
              ? <img src={post.athlete_avatar} alt="" className="w-full h-full object-cover" />
              : (post.athlete_name?.[0] || '?')
            }
          </button>

          <div className="flex-1 min-w-0">
            <button onClick={() => setShowAthleteProfile(true)} className="text-left w-full">
              <p className="text-sm truncate" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                {post.athlete_name || 'Athlete'}
              </p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', opacity: 0.5 }}>
                {timeAgo}
              </p>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {post.created_by !== currentUserEmail && (
              <button
                onClick={handleReport}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ opacity: reported ? 0.3 : 0.5 }}
              >
                <Flag className="w-3.5 h-3.5" style={{ color: reported ? '#98AB8F' : 'rgba(152,171,143,0.7)' }} strokeWidth={1.5} />
              </button>
            )}
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
                    style={{ background: 'rgba(18,12,4,0.95)', border: '0.5px solid rgba(212,175,55,0.3)', minWidth: 160, backdropFilter: 'blur(25px)', zIndex: 10 }}
                  >
                    <button
                      onClick={handleMute}
                      className="w-full flex items-center gap-2 px-4 py-3 text-left transition-all hover:bg-white/5"
                    >
                      <EyeOff className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Montserrat, sans-serif' }}>Hide posts</span>
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>

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

        {isUnderReview && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl"
            style={{ background: 'rgba(8,8,8,0.75)', backdropFilter: 'blur(12px)' }}
          >
            <div className="text-center px-6">
              <p className="text-xs uppercase tracking-[0.25em] mb-1" style={{ color: '#98AB8F', fontFamily: 'Montserrat, sans-serif' }}>Post Under Review</p>
              <p className="text-[10px]" style={{ color: 'rgba(152,171,143,0.55)', fontFamily: 'Montserrat, sans-serif' }}>by the Syndicate</p>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-4 py-4">
          <p className="text-base mb-3" style={{ color: titleColor, fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
            {post.title}
          </p>
          {isWorkout && (post.volume_kg || post.duration_minutes) && (
            <div className="flex gap-4">
              {post.volume_kg > 0 && (
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" style={{ color: '#BDB5D5' }} strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: '#BDB5D5', fontFamily: 'Montserrat, sans-serif' }}>{post.volume_kg.toLocaleString()} kg</span>
                </div>
              )}
              {post.duration_minutes > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: '#BDB5D5' }} strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: '#BDB5D5', fontFamily: 'Montserrat, sans-serif' }}>{post.duration_minutes}m</span>
                </div>
              )}
            </div>
          )}
          {isNutrition && (post.calories || post.protein_g) && (
            <div className="flex gap-4">
              {post.calories > 0 && (
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" style={{ color: '#FFDAB9' }} strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: '#FFDAB9', fontFamily: 'Montserrat, sans-serif' }}>{post.calories} kcal</span>
                </div>
              )}
              {post.protein_g > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" style={{ color: '#FFDAB9' }} strokeWidth={1.5} />
                  <span className="text-sm" style={{ color: '#FFDAB9', fontFamily: 'Montserrat, sans-serif' }}>{post.protein_g}g protein</span>
                </div>
              )}
            </div>
          )}
          {post.notes && (
            <p className="text-xs mt-3 leading-relaxed" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', opacity: 0.55 }}>{post.notes}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 pb-3" style={{ borderTop: '0.5px solid rgba(212,175,55,0.08)' }}>
          {isElite ? (
            <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', opacity: 0.8 }}>✦ Elite</span>
          ) : <div />}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setShowComments(s => !s)}
              className="flex items-center gap-1.5 px-3 transition-all active:scale-90"
              style={{
                height: 36,
                background: showComments ? 'rgba(229,229,231,0.06)' : 'rgba(229,229,231,0.04)',
                border: `0.5px solid ${showComments ? 'rgba(229,229,231,0.3)' : 'rgba(229,229,231,0.12)'}`,
                borderRadius: 10,
              }}
            >
              <MessageCircle className="w-4 h-4" style={{ color: '#E5E5E7', opacity: showComments ? 0.9 : 0.4 }} strokeWidth={1.3} />
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: '#E5E5E7', opacity: showComments ? 0.9 : 0.45, lineHeight: 1 }}>
                {commentCount}
              </span>
            </button>
            <AscensionFeather
              count={voltageCount}
              hasGiven={hasGivenVoltage}
              onAscend={handleVoltage}
              isFounder={currentUserIsFounder}
            />
          </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4" style={{ borderTop: '0.5px solid rgba(212,175,55,0.06)' }}>
                <div className="space-y-3 pt-3 mb-3">
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px]"
                        style={{
                          background: c.commenter_avatar ? `url(${c.commenter_avatar}) center/cover` : 'rgba(152,171,143,0.2)',
                          backgroundSize: 'cover', backgroundPosition: 'center',
                          border: '1px solid #98AB8F',
                          color: '#98AB8F',
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                      >
                        {!c.commenter_avatar && (c.commenter_name?.[0] || '?')}
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px]" style={{ color: '#98AB8F', fontFamily: 'Montserrat, sans-serif' }}>{c.commenter_name} </span>
                        <span className="text-xs" style={{ color: 'rgba(229,229,231,0.65)', fontFamily: 'Montserrat, sans-serif' }}>{c.text}</span>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-xs py-1" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Montserrat, sans-serif' }}>No discussions yet. Be first.</p>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Add to the discussion…"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
                    className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: 'rgba(229,229,231,0.06)',
                      border: '0.5px solid rgba(229,229,231,0.15)',
                      color: '#E5E5E7',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || submitting}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                    style={{
                      background: commentText.trim() ? '#D4AF37' : 'rgba(212,175,55,0.15)',
                      border: '0.5px solid rgba(212,175,55,0.3)',
                    }}
                  >
                    <Send className="w-4 h-4" style={{ color: commentText.trim() ? '#080808' : 'rgba(212,175,55,0.4)' }} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}