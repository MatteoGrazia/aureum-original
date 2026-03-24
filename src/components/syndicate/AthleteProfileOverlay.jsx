import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, Clock, Users, ChevronRight, Lock } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { base44 } from '@/api/base44Client';

function LaurelIcon({ filled, color, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 19 C10 17, 6 15, 4 11 C3 8, 4 5, 7 4 C8 6, 8 8, 9 10 C9.5 11.5, 10.5 13, 12 14"
        stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        fill={filled ? color : 'none'} fillOpacity={filled ? 0.2 : 0} />
      <path d="M12 19 C14 17, 18 15, 20 11 C21 8, 20 5, 17 4 C16 6, 16 8, 15 10 C14.5 11.5, 13.5 13, 12 14"
        stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        fill={filled ? color : 'none'} fillOpacity={filled ? 0.2 : 0} />
      <path d="M10 19.5 Q12 21 14 19.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function FollowersModal({ title, athleteIdentityId, onClose, onSelectAthlete }) {
  const { data: identity } = useQuery({
    queryKey: ['identityById', athleteIdentityId],
    queryFn: async () => {
      const all = await base44.entities.AthleteIdentity.list('-last_active', 100);
      return all.find(a => a.id === athleteIdentityId) || null;
    },
    enabled: !!athleteIdentityId,
  });

  const createdBy = identity?.created_by;

  const { data: list = [] } = useQuery({
    queryKey: ['followList', title, createdBy],
    queryFn: () => title === 'Followers'
      ? base44.entities.Follow.filter({ following_id: createdBy })
      : base44.entities.Follow.filter({ follower_id: createdBy }),
    enabled: !!createdBy,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-end"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        className="w-full rounded-t-3xl overflow-hidden"
        style={{ background: 'rgba(12,12,12,0.97)', border: '0.5px solid rgba(212,175,55,0.2)', maxHeight: '70vh', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))'  }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '0.5px solid rgba(212,175,55,0.12)' }}>
          <p className="text-sm uppercase tracking-[0.2em]" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif' }}>{title}</p>
          <button onClick={onClose}><X className="w-5 h-5 text-white/30" /></button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '55vh' }}>
          {list.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Montserrat, sans-serif' }}>No connections yet</p>
          )}
          {list.map(f => {
            const name = title === 'Followers' ? f.follower_name : f.following_name;
            const avatar = title === 'Followers' ? f.follower_avatar : f.following_avatar;
            return (
              <button
                key={f.id}
                onClick={() => onSelectAthlete({ name, avatar })}
                className="w-full flex items-center gap-3 px-5 py-3 transition-all hover:bg-white/5"
              >
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
                  style={{ background: avatar ? `url(${avatar}) center/cover` : 'rgba(152,171,143,0.2)', border: '1px solid rgba(152,171,143,0.3)', color: '#D4AF37', fontFamily: 'Montserrat, sans-serif' }}>
                  {!avatar && (name?.[0] || '?')}
                </div>
                <p className="flex-1 text-sm text-left" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif' }}>{name || 'Athlete'}</p>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AthleteProfileOverlay({ athleteName, athleteAvatar, athleteId, onClose }) {
  const queryClient = useQueryClient();
  const [followModal, setFollowModal] = useState(null); // 'Followers' | 'Following' | null
  const [nestedProfile, setNestedProfile] = useState(null);

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me(), staleTime: 10 * 60 * 1000 });

  // Fetch identity record by id
  const { data: identity } = useQuery({
    queryKey: ['identityById', athleteId],
    queryFn: async () => {
      const all = await base44.entities.AthleteIdentity.list('-last_active', 100);
      return all.find(a => a.id === athleteId) || null;
    },
    enabled: !!athleteId,
  });

  const createdBy = identity?.created_by;

  const { data: posts = [] } = useQuery({
    queryKey: ['athletePosts', athleteId],
    queryFn: () => base44.entities.PerformanceFeed.filter({ athlete_id: athleteId }, '-created_date', 20),
    enabled: !!athleteId,
  });

  const { data: workoutCount = 0 } = useQuery({
    queryKey: ['workoutCount', createdBy],
    queryFn: async () => {
      const logs = await base44.entities.WorkoutLog.filter({ created_by: createdBy });
      return logs.length;
    },
    enabled: !!createdBy,
  });

  const { data: followStats = { followers: 0, following: 0 } } = useQuery({
    queryKey: ['followStats', createdBy],
    queryFn: async () => {
      const [followers, following] = await Promise.all([
        base44.entities.Follow.filter({ following_id: createdBy }),
        base44.entities.Follow.filter({ follower_id: createdBy }),
      ]);
      return { followers: followers.length, following: following.length };
    },
    enabled: !!createdBy,
  });

  const { data: isFollowing = false } = useQuery({
    queryKey: ['isFollowing', currentUser?.email, createdBy],
    queryFn: async () => {
      if (!currentUser?.email || !createdBy) return false;
      const res = await base44.entities.Follow.filter({ follower_id: currentUser.email, following_id: createdBy });
      return res.length > 0;
    },
    enabled: !!currentUser?.email && !!createdBy,
  });

  const handleFollow = async () => {
    if (!currentUser || !createdBy || isFollowing) return;
    await base44.entities.Follow.create({
      follower_id: currentUser.email,
      following_id: createdBy,
      follower_name: currentUser.full_name || '',
      following_name: athleteName || '',
      follower_avatar: '',
      following_avatar: athleteAvatar || '',
      status: identity?.is_private ? 'pending' : 'accepted',
    });
    queryClient.invalidateQueries(['isFollowing']);
    queryClient.invalidateQueries(['followStats']);
  };

  const isPrivate = identity?.is_private && !isFollowing && createdBy !== currentUser?.email;
  const totalTributes = posts.reduce((s, p) => s + (p.voltage_count || 0), 0);
  const isFounder = identity?.is_founder;

  // Ascension Score: (Tributes * 10) + (Workouts * 5) + (Streak * 2)
  const ascensionScore = (totalTributes * 10) + (workoutCount * 5) + (streak * 2);
  const ascensionCredits = Math.floor(ascensionScore / 100);

  const workoutPosts = posts.filter(p => p.post_type === 'workout');
  const bestVolume = workoutPosts.reduce((max, p) => Math.max(max, p.volume_kg || 0), 0);
  const avgCalories = posts.filter(p => p.post_type === 'nutrition').length > 0
    ? Math.round(posts.filter(p => p.post_type === 'nutrition').reduce((s, p) => s + (p.calories || 0), 0) / Math.max(posts.filter(p => p.post_type === 'nutrition').length, 1))
    : null;

  // Day streak: count consecutive days with a post
  const streak = (() => {
    const days = [...new Set(posts.map(p => p.created_date?.split('T')[0]).filter(Boolean))].sort().reverse();
    if (!days.length) return 0;
    let count = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = (prev - curr) / (1000 * 60 * 60 * 24);
      if (diff <= 1.5) count++;
      else break;
    }
    return count;
  })();

  const coverUrl = posts.find(p => p.photos?.length > 0)?.photos?.[0] || athleteAvatar;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.04 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[300] overflow-y-auto"
        style={{ background: '#0F0F0F' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-5 left-5 z-[310] w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.12)' }}
        >
          <X className="w-5 h-5 text-white/70" />
        </button>

        {/* Cover + Identity Block */}
        <div className="relative" style={{ minHeight: 220 }}>
          {/* Cover photo */}
          {coverUrl && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${coverUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(20px) brightness(0.35)',
                transform: 'scale(1.1)',
              }}
            />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,15,15,0.2) 0%, rgba(15,15,15,0.85) 100%)' }} />
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }}
          />

          {/* Identity */}
          <div className="relative z-10 flex flex-col items-center pt-16 pb-8 px-6">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl"
              style={{
                background: athleteAvatar ? `url(${athleteAvatar}) center/cover` : 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(152,171,143,0.2))',
                border: `1.5px solid ${isFounder ? '#D4AF37' : '#98AB8F'}`,
                boxShadow: `0 0 24px ${isFounder ? 'rgba(212,175,55,0.4)' : 'rgba(152,171,143,0.3)'}`,
                color: '#D4AF37',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {!athleteAvatar && (athleteName?.[0] || '?')}
            </div>

            <h2 className="text-2xl tracking-[0.2em] mb-1" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
              {identity?.username || athleteName || 'Athlete'}
            </h2>
            {identity?.bio && (
              <p className="text-sm text-center mb-2" style={{ color: 'rgba(229,229,231,0.55)', fontFamily: 'Montserrat, sans-serif', maxWidth: 260 }}>{identity.bio}</p>
            )}
            {isFounder && (
              <div className="px-3 py-0.5 rounded-full text-[9px] uppercase tracking-[0.2em] mb-1" style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '0.5px solid rgba(212,175,55,0.4)' }}>
                ★ Founder
              </div>
            )}
            {/* Total Ascension Score */}
            <div className="px-4 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] mb-3" style={{ background: 'rgba(212,175,55,0.08)', border: '0.5px solid rgba(212,175,55,0.25)' }}>
              <span style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif' }}>{ascensionScore.toLocaleString()} AP</span>
              <span style={{ color: 'rgba(212,175,55,0.45)', fontFamily: 'Montserrat, sans-serif' }}> · {ascensionCredits} Credits</span>

            {/* Stats Row */}
            <div className="flex gap-8 mt-2 mb-5">
              {[
                { label: 'Followers', value: followStats.followers, action: () => setFollowModal('Followers') },
                { label: 'Following', value: followStats.following, action: () => setFollowModal('Following') },
                { label: 'Tributes', value: totalTributes, icon: true },
              ].map(({ label, value, action, icon }) => (
                <button key={label} onClick={action} className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    {icon && <LaurelIcon filled color="#D4AF37" size={14} />}
                    <p className="text-xl" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>{value}</p>
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.18em]" style={{ color: 'rgba(229,229,231,0.4)', fontFamily: 'Montserrat, sans-serif' }}>{label}</p>
                </button>
              ))}
            </div>

            {/* CTA */}
            {createdBy !== currentUser?.email && (
              <button
                onClick={handleFollow}
                className="px-8 py-2.5 rounded-xl text-xs uppercase tracking-[0.2em] transition-all active:scale-95"
                style={{
                  background: isFollowing ? 'rgba(152,171,143,0.12)' : '#98AB8F',
                  color: isFollowing ? '#98AB8F' : '#0a0a0a',
                  border: `0.5px solid ${isFollowing ? 'rgba(152,171,143,0.4)' : 'transparent'}`,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                }}
              >
                {isFollowing ? 'SYNDICATE SYNCED' : 'JOIN SYNDICATE'}
              </button>
            )}
          </div>
        </div>

        {/* Biometric Audit — Pinned Cards */}
        <div className="px-4 pt-5 pb-3">
          <p className="text-[9px] uppercase tracking-[0.3em] mb-3 pl-1" style={{ color: 'rgba(212,175,55,0.5)', fontFamily: 'Montserrat, sans-serif' }}>Biometric Audit</p>
          <div className="grid grid-cols-3 gap-3">
            {/* Strength */}
            <div className="p-3 rounded-xl flex flex-col" style={{ background: 'rgba(189,181,213,0.07)', border: '0.5px solid rgba(189,181,213,0.2)' }}>
              <p className="text-[8px] uppercase tracking-[0.15em] mb-2" style={{ color: 'rgba(189,181,213,0.6)', fontFamily: 'Montserrat, sans-serif' }}>Strength</p>
              <p className="text-base" style={{ color: '#BDB5D5', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>{bestVolume > 0 ? `${bestVolume.toLocaleString()}` : '—'}</p>
              <p className="text-[8px] mt-0.5" style={{ color: 'rgba(189,181,213,0.4)', fontFamily: 'Montserrat, sans-serif' }}>Top Volume kg</p>
            </div>
            {/* Fuel */}
            <div className="p-3 rounded-xl flex flex-col" style={{ background: 'rgba(255,218,185,0.06)', border: '0.5px solid rgba(255,218,185,0.18)' }}>
              <p className="text-[8px] uppercase tracking-[0.15em] mb-2" style={{ color: 'rgba(255,218,185,0.6)', fontFamily: 'Montserrat, sans-serif' }}>Fuel</p>
              <p className="text-base" style={{ color: '#FFDAB9', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>{avgCalories ? `${avgCalories}` : '—'}</p>
              <p className="text-[8px] mt-0.5" style={{ color: 'rgba(255,218,185,0.4)', fontFamily: 'Montserrat, sans-serif' }}>Avg kcal/day</p>
            </div>
            {/* Consistency */}
            <div className="p-3 rounded-xl flex flex-col" style={{ background: 'rgba(212,175,55,0.07)', border: '0.5px solid rgba(212,175,55,0.2)' }}>
              <p className="text-[8px] uppercase tracking-[0.15em] mb-2" style={{ color: 'rgba(212,175,55,0.6)', fontFamily: 'Montserrat, sans-serif' }}>Streak</p>
              <p className="text-base" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>{streak}</p>
              <p className="text-[8px] mt-0.5" style={{ color: 'rgba(212,175,55,0.4)', fontFamily: 'Montserrat, sans-serif' }}>Day streak</p>
            </div>
          </div>
        </div>

        {/* Legacy Feed */}
        <div className="px-4 pt-2 pb-32">
          <p className="text-[9px] uppercase tracking-[0.3em] mb-3 pl-1" style={{ color: 'rgba(152,171,143,0.5)', fontFamily: 'Montserrat, sans-serif' }}>Legacy Feed</p>

          {isPrivate ? (
            <div
              className="rounded-2xl p-8 flex flex-col items-center text-center"
              style={{ background: 'rgba(212,175,55,0.04)', border: '0.5px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(20px)' }}
            >
              <Lock className="w-8 h-8 mb-3" style={{ color: 'rgba(212,175,55,0.4)' }} />
              <p className="text-[10px] uppercase tracking-[0.22em] leading-relaxed mb-2" style={{ color: 'rgba(229,229,231,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
                ASCENSION DATA RESTRICTED.
              </p>
              <p className="text-[10px] tracking-[0.12em] leading-relaxed" style={{ color: 'rgba(229,229,231,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
                Join Syndicate to view performance.
              </p>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Montserrat, sans-serif' }}>No activity yet</p>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(189,181,213,0.05)', border: '0.5px solid rgba(189,181,213,0.15)' }}
                >
                  {/* Photos strip */}
                  {post.photos?.length > 0 && (
                    <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                      {post.photos.map((url, i) => (
                        <img key={i} src={url} alt="" className="w-28 h-20 object-cover flex-shrink-0 first:rounded-tl-2xl last:rounded-tr-2xl" />
                      ))}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: '#BDB5D5', fontFamily: 'Montserrat, sans-serif' }}>{post.title}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(189,181,213,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
                          {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <LaurelIcon filled={false} color="rgba(212,175,55,0.4)" size={13} />
                        <span className="text-xs" style={{ color: 'rgba(212,175,55,0.5)', fontFamily: 'Montserrat, sans-serif' }}>{post.voltage_count || 0}</span>
                      </div>
                    </div>
                    {(post.volume_kg > 0 || post.duration_minutes > 0) && (
                      <div className="flex gap-4 mt-2.5">
                        {post.volume_kg > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Dumbbell className="w-3 h-3" style={{ color: 'rgba(189,181,213,0.5)' }} strokeWidth={1.5} />
                            <span className="text-[10px]" style={{ color: 'rgba(189,181,213,0.6)', fontFamily: 'Montserrat, sans-serif' }}>{post.volume_kg.toLocaleString()} kg</span>
                          </div>
                        )}
                        {post.duration_minutes > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" style={{ color: 'rgba(189,181,213,0.5)' }} strokeWidth={1.5} />
                            <span className="text-[10px]" style={{ color: 'rgba(189,181,213,0.6)', fontFamily: 'Montserrat, sans-serif' }}>{post.duration_minutes}m</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Follow modal */}
        <AnimatePresence>
          {followModal && (
            <FollowersModal
              title={followModal}
              athleteIdentityId={athleteId}
              onClose={() => setFollowModal(null)}
              onSelectAthlete={(a) => {
                setFollowModal(null);
                setNestedProfile(a);
              }}
            />
          )}
        </AnimatePresence>

        {/* Nested profile surf */}
        <AnimatePresence>
          {nestedProfile && (
            <AthleteProfileOverlay
              athleteName={nestedProfile.name}
              athleteAvatar={nestedProfile.avatar}
              athleteId={nestedProfile.id}
              onClose={() => setNestedProfile(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}