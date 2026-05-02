import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import SyndicateConsentModal from '@/components/syndicate/SyndicateConsentModal';
import SyndicateLeaderboard from '@/components/syndicate/SyndicateLeaderboard';
import SyndicateCard from '@/components/syndicate/SyndicateCard';
import PulseRow from '@/components/syndicate/PulseRow';
import VoidBackground from '@/components/dashboard/VoidBackground';
import AthleteProfileOverlay from '@/components/syndicate/AthleteProfileOverlay';
import { AnimatePresence as APulse } from 'framer-motion';

const CONSENT_KEY = 'aureum_syndicate_consent';

export default function Community() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConsent, setShowConsent] = useState(false);
  const [consentGranted, setConsentGranted] = useState(() => {
    return localStorage.getItem(CONSENT_KEY) === 'true';
  });
  const [pulseProfile, setPulseProfile] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [feedTab, setFeedTab] = useState('discover'); // 'discover' | 'following'
  const myPostAPRef = useRef({});

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000,
  });

  // Global Prestige Listener
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.PerformanceFeed.subscribe((event) => {
      if (event.type === 'update' && event.data?.created_by === user.email) {
        const postId = event.id;
        const newCount = event.data?.voltage_count || 0;
        const prev = myPostAPRef.current[postId] ?? null;
        if (prev !== null && newCount > prev) {
          toast('Your Ascension count has risen.', {
            style: { background: 'rgba(12,12,12,0.97)', border: '0.5px solid #98AB8F', color: '#98AB8F', fontFamily: 'Montserrat, sans-serif' },
            icon: '🪶',
          });
        }
        myPostAPRef.current[postId] = newCount;
        queryClient.invalidateQueries(['performanceFeed']);
      } else if (event.type === 'update') {
        queryClient.invalidateQueries(['performanceFeed']);
      }
    });
    return unsubscribe;
  }, [user?.email]);

  // Check consent on mount
  useEffect(() => {
    if (!consentGranted) {
      setShowConsent(true);
    }
  }, [consentGranted]);

  // Sync profile picture → AthleteIdentity for existing users
  useEffect(() => {
    if (!consentGranted || !user) return;
    const syncAvatar = async () => {
      const pic = user.profile_picture;
      if (!pic) return;
      const identities = await base44.entities.AthleteIdentity.filter({ created_by: user.email });
      if (identities.length > 0 && identities[0].avatar_url !== pic) {
        await base44.entities.AthleteIdentity.update(identities[0].id, { avatar_url: pic });
        queryClient.invalidateQueries(['syndicateAthletes']);
        queryClient.invalidateQueries(['performanceFeed']);
      }
    };
    syncAvatar();
  }, [consentGranted, user?.email, user?.profile_picture]);

  const { data: currentIdentity } = useQuery({
    queryKey: ['myIdentity', user?.email],
    queryFn: async () => {
      const records = await base44.entities.AthleteIdentity.filter({ created_by: user.email });
      return records[0] || null;
    },
    enabled: !!user?.email && consentGranted,
    staleTime: 5 * 60 * 1000,
  });

  // Upsert Athlete_Identity on consent
  const ensureAthleteIdentity = async (username) => {
    if (!user) return;
    const existing = await base44.entities.AthleteIdentity.filter({ created_by: user.email });
    const payload = {
      network_consent: true,
      syndicate_visible: true,
      username: username || user.full_name || user.email?.split('@')[0] || 'Athlete',
      last_active: new Date().toISOString(),
    };
    if (existing.length > 0) {
      await base44.entities.AthleteIdentity.update(existing[0].id, payload);
    } else {
      await base44.entities.AthleteIdentity.create(payload);
    }
    queryClient.invalidateQueries(['athleteIdentity']);
  };

  const handleAllow = async (username) => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setConsentGranted(true);
    setShowConsent(false);
    await ensureAthleteIdentity(username);
  };

  const handleDecline = () => {
    setShowConsent(false);
    navigate('/Dashboard');
  };

  // Feed data
  const { data: rawFeed = [], isLoading: feedLoading } = useQuery({
    queryKey: ['performanceFeed'],
    queryFn: () => base44.entities.PerformanceFeed.list('-created_date', 60),
    enabled: consentGranted,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Following list
  const { data: following = [] } = useQuery({
    queryKey: ['myFollowing', user?.email],
    queryFn: () => base44.entities.Follow.filter({ follower_id: user.email, status: 'accepted' }),
    enabled: !!user?.email && consentGranted,
    staleTime: 2 * 60 * 1000,
  });

  // Muted users
  const { data: mutedUsers = [] } = useQuery({
    queryKey: ['mutedUsers'],
    queryFn: () => base44.entities.MutedUser.list(),
    enabled: consentGranted,
    staleTime: 5 * 60 * 1000,
  });

  const mutedIds = useMemo(() => new Set(mutedUsers.map(m => m.muted_user_id)), [mutedUsers]);
  const followingIds = useMemo(() => new Set(following.map(f => f.following_id)), [following]);

  // Engagement decay: posts older than 12h with 0 voltage drop in ranking
  const feed = useMemo(() => {
    const now = Date.now();
    const filtered = rawFeed.filter(p => {
      if (p.is_hidden) return false;
      if (mutedIds.has(p.created_by)) return false;
      if (feedTab === 'following') return followingIds.has(p.created_by) || p.created_by === user?.email;
      return true;
    });
    return [...filtered].sort((a, b) => {
      const ageA = (now - new Date(a.created_date).getTime()) / (1000 * 60 * 60);
      const ageB = (now - new Date(b.created_date).getTime()) / (1000 * 60 * 60);
      const decayA = ageA > 12 && (a.voltage_count || 0) === 0 ? -1000000 : 0;
      const decayB = ageB > 12 && (b.voltage_count || 0) === 0 ? -1000000 : 0;
      const scoreA = (a.voltage_count || 0) * 100 - ageA * 10 + decayA;
      const scoreB = (b.voltage_count || 0) * 100 - ageB * 10 + decayB;
      return scoreB - scoreA;
    });
  }, [rawFeed, feedTab, mutedIds, followingIds, user?.email]);

  // Athletes for Pulse Row
  const { data: athletes = [] } = useQuery({
    queryKey: ['syndicateAthletes'],
    queryFn: () => base44.entities.AthleteIdentity.filter({ syndicate_visible: true }, '-last_active', 20),
    enabled: consentGranted,
    staleTime: 2 * 60 * 1000,
  });

  const handleTribute = async (post) => {
    if (!user) return;
    const newBy = [...(post.voltage_by || []), user.email];
    await base44.entities.PerformanceFeed.update(post.id, {
      voltage_count: (post.voltage_count || 0) + 1,
      voltage_by: newBy,
    });
    // Legacy Sync — notify the post author
    if (post.created_by && post.created_by !== user.email) {
      const identities = await base44.entities.AthleteIdentity.filter({ created_by: user.email });
      const senderName = identities[0]?.username || user.full_name || 'An Athlete';
      await base44.entities.SyndicateNotification.create({
        recipient_id: post.created_by,
        sender_id: user.email,
        sender_name: senderName,
        type: 'voltage',
        message: `Athlete ${senderName} has bestowed a Laurel on your performance`,
        read: false,
      });
    }
    queryClient.invalidateQueries(['performanceFeed']);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#080808' }}>
      <VoidBackground />

      {/* Consent Gate */}
      <AnimatePresence>
        {showConsent && (
          <SyndicateConsentModal onAllow={handleAllow} onDecline={handleDecline} />
        )}
      </AnimatePresence>

      {consentGranted && (
        <div className="relative z-10 pb-28">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 pt-6 text-center"
          >
            <h1
              className="text-3xl tracking-[0.4em]"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400,
                background: 'linear-gradient(135deg, #D4AF37 0%, #D4AF37 50%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              COMMUNITY
            </h1>
            <p
              className="text-white text-[11px] uppercase tracking-[0.25em] mt-3"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </motion.div>

          {/* Pulse Row */}
          <PulseRow athletes={athletes} onAthleteTap={(a) => setPulseProfile({ name: a.username, avatar: a.avatar_url, id: a.id })} />

          {/* Full-screen Athlete Profile from Pulse Row */}
          <AnimatePresence>
            {pulseProfile && (
              <AthleteProfileOverlay
                athleteName={pulseProfile.name}
                athleteAvatar={pulseProfile.avatar}
                athleteId={pulseProfile.id}
                onClose={() => setPulseProfile(null)}
              />
            )}
          </AnimatePresence>

          {/* Dual Feed Toggle */}
          <div className="flex items-center justify-center mb-5 px-4">
            <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(212,175,55,0.15)' }}>
              {[{ key: 'discover', label: 'DISCOVER' }, { key: 'following', label: 'FOLLOWING' }].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setFeedTab(tab.key); setShowLeaderboard(false); }}
                  className="relative px-6 py-2.5 text-[10px] tracking-[0.22em] transition-all"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: feedTab === tab.key && !showLeaderboard ? '#E5E5E7' : 'rgba(229,229,231,0.35)',
                    background: feedTab === tab.key && !showLeaderboard ? 'rgba(212,175,55,0.08)' : 'transparent',
                  }}
                >
                  {tab.label}
                  {feedTab === tab.key && !showLeaderboard && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full" style={{ background: '#D4AF37', boxShadow: '0 0 8px rgba(212,175,55,0.6)' }} />
                  )}
                </button>
              ))}
              <button
                onClick={() => setShowLeaderboard(true)}
                className="relative px-6 py-2.5 text-[10px] tracking-[0.22em] transition-all"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: showLeaderboard ? '#E5E5E7' : 'rgba(229,229,231,0.35)',
                  background: showLeaderboard ? 'rgba(212,175,55,0.08)' : 'transparent',
                }}
              >
                RANKS
                {showLeaderboard && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full" style={{ background: '#D4AF37', boxShadow: '0 0 8px rgba(212,175,55,0.6)' }} />
                )}
              </button>
            </div>
          </div>

          {showLeaderboard ? (
            <SyndicateLeaderboard />
          ) : (
          <>
          {/* Feed */}
          {feedLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
            </div>
          ) : feed.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 px-8"
            >
              <p className="text-2xl mb-3 tracking-[0.2em]" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
                {feedTab === 'following' ? 'INNER CIRCLE EMPTY' : 'NO ACTIVITY YET'}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', fontWeight: 300, opacity: 0.5 }}>
                {feedTab === 'following' ? 'Join athletes from the Discover feed to see their performance here.' : 'No one has completed a workout yet.'}
              </p>
            </motion.div>
          ) : (
            <div className="mt-2">
              {feed.map((post, i) => (
                <SyndicateCard
                  key={post.id}
                  post={post}
                  currentUserEmail={user?.email}
                  onVoltage={handleTribute}
                  index={i}
                  currentUserIsFounder={currentIdentity?.is_founder === true}
                />
              ))}
            </div>
          )}
          </>
          )}
        </div>
      )}
    </div>
  );
}