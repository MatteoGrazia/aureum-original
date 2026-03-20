import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import SyndicateConsentModal from '@/components/syndicate/SyndicateConsentModal';
import SyndicateCard from '@/components/syndicate/SyndicateCard';
import PulseRow from '@/components/syndicate/PulseRow';
import VoidBackground from '@/components/dashboard/VoidBackground';

const CONSENT_KEY = 'aureum_syndicate_consent';

export default function Community() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConsent, setShowConsent] = useState(false);
  const [consentGranted, setConsentGranted] = useState(() => {
    return localStorage.getItem(CONSENT_KEY) === 'true';
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000,
  });

  // Check consent on mount
  useEffect(() => {
    if (!consentGranted) {
      setShowConsent(true);
    }
  }, [consentGranted]);

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
  const { data: feed = [], isLoading: feedLoading } = useQuery({
    queryKey: ['performanceFeed'],
    queryFn: () => base44.entities.PerformanceFeed.list('-created_date', 40),
    enabled: consentGranted,
    staleTime: 60 * 1000,
  });

  // Athletes for Pulse Row
  const { data: athletes = [] } = useQuery({
    queryKey: ['syndicateAthletes'],
    queryFn: () => base44.entities.AthleteIdentity.filter({ syndicate_visible: true }, '-last_active', 20),
    enabled: consentGranted,
    staleTime: 2 * 60 * 1000,
  });

  const handleVoltage = async (post) => {
    if (!user) return;
    const newBy = [...(post.voltage_by || []), user.email];
    await base44.entities.PerformanceFeed.update(post.id, {
      voltage_count: (post.voltage_count || 0) + 1,
      voltage_by: newBy,
    });
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
          <PulseRow athletes={athletes} />

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
              <p
                className="text-2xl mb-3 tracking-[0.2em]"
                style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}
              >
                NO ACTIVITY YET
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', fontWeight: 300, opacity: 0.5 }}
              >
                No one has completed a workout yet.
              </p>
            </motion.div>
          ) : (
            <div className="mt-2">
              {feed.map((post, i) => (
                <SyndicateCard
                  key={post.id}
                  post={post}
                  currentUserEmail={user?.email}
                  onVoltage={handleVoltage}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}