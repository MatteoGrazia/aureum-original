import React from 'react';
import { motion } from 'framer-motion';
const ASCENSION_ICON = 'https://media.base44.com/images/public/698347d058d3014d6271ccff/4158e2305_AscensionIcon.png';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function SyndicateLeaderboard() {
  const { data: athletes = [], isLoading: loadingAthletes } = useQuery({
    queryKey: ['syndicateAthletes'],
    queryFn: () => base44.entities.AthleteIdentity.filter({ syndicate_visible: true }, '-last_active', 50),
    staleTime: 2 * 60 * 1000,
  });

  const { data: allPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['allPostsForLeaderboard'],
    queryFn: () => base44.entities.PerformanceFeed.list('-created_date', 200),
    staleTime: 60 * 1000,
  });

  const isLoading = loadingAthletes || loadingPosts;

  // Build AP map: athlete_id → total voltage_count
  const apMap = {};
  for (const post of allPosts) {
    const id = post.athlete_id;
    if (!id) continue;
    apMap[id] = (apMap[id] || 0) + (post.voltage_count || 0);
  }

  const ranked = athletes
    .map(a => ({ ...a, totalAP: apMap[a.id] || 0 }))
    .sort((a, b) => b.totalAP - a.totalAP);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#98AB8F]/30 border-t-[#98AB8F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-8">
      <p className="text-[9px] uppercase tracking-[0.3em] mb-4 pl-1" style={{ color: 'rgba(152,171,143,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
        Syndicate Prestige Ranking
      </p>
      <div className="space-y-2">
        {ranked.map((athlete, i) => (
          <motion.div
            key={athlete.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: i === 0
                ? 'rgba(152,171,143,0.1)'
                : 'rgba(255,255,255,0.03)',
              border: `0.5px solid ${i === 0 ? 'rgba(152,171,143,0.35)' : 'rgba(152,171,143,0.1)'}`,
            }}
          >
            {/* Rank */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px]"
              style={{
                background: i < 3 ? 'rgba(152,171,143,0.15)' : 'rgba(255,255,255,0.04)',
                color: i < 3 ? '#98AB8F' : 'rgba(255,255,255,0.25)',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500,
                border: i < 3 ? '0.5px solid rgba(152,171,143,0.3)' : 'none',
              }}
            >
              {i + 1}
            </div>

            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
              style={{
                background: athlete.avatar_url
                  ? `url(${athlete.avatar_url}) center/cover`
                  : 'linear-gradient(135deg, rgba(152,171,143,0.2), rgba(212,175,55,0.1))',
                border: `1px solid ${i === 0 ? '#98AB8F' : 'rgba(152,171,143,0.25)'}`,
                color: '#98AB8F',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {!athlete.avatar_url && (athlete.username?.[0]?.toUpperCase() || '?')}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: i === 0 ? '#98AB8F' : '#E5E5E7', fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                {athlete.username || 'Athlete'}
              </p>
              {athlete.is_founder && (
                <p className="text-[9px]" style={{ color: 'rgba(212,175,55,0.5)', fontFamily: 'Montserrat, sans-serif' }}>★ Founder</p>
              )}
            </div>

            {/* AP */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <img src={ASCENSION_ICON} alt="AP" style={{ width: 16, height: 16, objectFit: 'contain' }} />
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: '#98AB8F', fontWeight: 300 }}>
                {athlete.totalAP.toLocaleString()}
              </span>
            </div>
          </motion.div>
        ))}

        {ranked.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Montserrat, sans-serif' }}>
            No athletes in the Syndicate yet.
          </p>
        )}
      </div>
    </div>
  );
}