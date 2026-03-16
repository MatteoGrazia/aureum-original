import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Footprints, Dumbbell, Droplets } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';
import ChronosOrbital from '@/components/dashboard/ChronosOrbital';
import AureumPulse from '@/components/dashboard/AureumPulse';
import VoidBackground from '@/components/dashboard/VoidBackground';
import QuickLogFAB from '@/components/dashboard/QuickLogFAB';
import AIInsight from '@/components/dashboard/AIInsight';
import SupplementStreak from '@/components/dashboard/SupplementStreak';
import WelcomeModal from '@/components/shared/WelcomeModal';
import WeightTrendMini from '@/components/dashboard/WeightTrendMini';
import PowerliftingTotals from '@/components/dashboard/PowerliftingTotals';


export default function Dashboard() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDatePill, setShowDatePill] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { scrollY } = useScroll();

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const { data: dailyActivity, refetch: refetchActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['dailyActivity', today],
    queryFn: async () => {
      const activities = await base44.entities.DailyActivity.filter({ date: today });
      return activities[0] || { steps: 0, water_liters: 0, active_minutes: 0, calories_burned: 0 };
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Listen for Google Fit sync events
  useEffect(() => {
    const handleSync = () => {
      refetchActivity();
      queryClient.invalidateQueries(['dailyActivity']);
    };
    window.addEventListener('googleFitSynced', handleSync);
    return () => window.removeEventListener('googleFitSynced', handleSync);
  }, [refetchActivity, queryClient]);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      const previous = scrollY.getPrevious();
      if (previous > latest && latest > 100) {
        setShowDatePill(true);
      } else {
        setShowDatePill(false);
      }
    });
  }, [scrollY]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({});
      return profiles[0] || null;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchInterval: 60000 // Refetch every 60 seconds
  });

  const { data: todaysFoodLogs, isLoading: foodLoading } = useQuery({
    queryKey: ['foodLogs', today],
    queryFn: async () => {
      return await base44.entities.FoodLog.filter({ date: today });
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000
  });

  const { data: todaysWorkout, isLoading: workoutLoading } = useQuery({
    queryKey: ['workoutLogs', today],
    queryFn: async () => {
      const workouts = await base44.entities.WorkoutLog.filter({ date: today });
      return workouts[0] || null;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000
  });

  const { data: weightHistory = [], isLoading: weightLoading } = useQuery({
    queryKey: ['weightHistory90'],
    queryFn: () => base44.entities.WeightHistory.filter({}, '-date', 90),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  useEffect(() => {
    if (profile === null) {
      const checkProfile = async () => {
        const profiles = await base44.entities.UserProfile.filter({});
        if (profiles.length === 0) {
          setShowWelcome(true);
        }
      };
      checkProfile();
    } else if (profile) {
      // Check if this is a new user (no basic profile data)
      const isNewUser = !profile.height && !profile.current_weight && !profile.permissions_requested;
      
      if (isNewUser) {
        setShowWelcome(true);
      }
    }
  }, [profile]);

  const handleWelcomeComplete = async () => {
    try {
      const profiles = await base44.entities.UserProfile.filter({});
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, { permissions_requested: true });
      } else {
        await base44.entities.UserProfile.create({
          permissions_requested: true,
          maintenance_calories: 2000,
          daily_step_goal: 10000
        });
      }
    } catch (error) {
      console.error(error);
    }
    setShowWelcome(false);
    queryClient.invalidateQueries(['userProfile']);
  };



  const maintenanceCalories = profile?.maintenance_calories || 2000;
  const activityCalories = dailyActivity?.calories_burned || 0;
  const consumedCalories = todaysFoodLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;
  const remainingCalories = maintenanceCalories + activityCalories - consumedCalories;
  const stepsGoal = profile?.daily_step_goal || 10000;
  const workoutVolume = todaysWorkout?.total_volume || 0;
  const waterGoal = profile?.water_goal || 2.5;
  const waterUnit = profile?.water_unit || 'liters';

  // Pulse stats are now defined inline in the JSX for better icon handling


  const handleUpdate = () => {
    refetchActivity();
    queryClient.invalidateQueries(['weightHistory']);
  };

  const isLoading = profileLoading || activityLoading || foodLoading || workoutLoading || weightLoading;

  if (isLoading || !isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(to bottom, #ffffff 0%, #888888 40%, #080808 100%)'
      }}>
        <div className="text-center">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698347d058d3014d6271ccff/f764a7a57_2.png"
            alt="Aureum"
            className="w-24 h-24 mx-auto mb-6"
            style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.4))' }}
          />
          <div className="w-8 h-8 border-2 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen relative overflow-x-hidden bg-[#080808]">
      <VoidBackground />
      {showWelcome && <WelcomeModal onComplete={handleWelcomeComplete} />}
      
      <div className="relative z-10 px-6 pt-6 pb-4">
      
        {/* Minimalist Magazine Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10 text-center pt-6">

          {/* Golden Feather Icon */}
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698347d058d3014d6271ccff/f764a7a57_2.png"
            alt="Aureum"
            className="w-16 h-16 mx-auto mb-4 opacity-90"
          />
          
          {/* AUREUM Logo */}
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698347d058d3014d6271ccff/161ef6a6d_Untitleddesign1.png"
            alt="AUREUM"
            className="w-64 h-auto mx-auto mb-3"
          />
          
          {/* Muted Bronze Date */}
          <p 
            className="text-white text-[11px] uppercase tracking-[0.25em]"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </motion.div>

        {/* Chronos Orbital Progress System */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative">
          
          {/* Ambient light glow behind orbital */}
          <div 
            className="absolute inset-0 -z-10"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
              filter: 'blur(60px)'
            }}
          />

          <VoidCard className="mb-6 p-6">
            <ChronosOrbital
              calories={consumedCalories}
              caloriesGoal={maintenanceCalories + activityCalories}
              steps={dailyActivity?.steps || 0}
              stepsGoal={stepsGoal}
              volume={workoutVolume}
              volumeGoal={5000}
            />
          </VoidCard>
        </motion.div>

        {/* Aureum Pulse Horizontal Visualizations */}
        <div className="space-y-3 mb-6">
          <AureumPulse
            label="Calories Consumed"
            value={consumedCalories}
            goal={maintenanceCalories + activityCalories}
            unit="kcal"
            icon={Flame}
            iconColor="#FFDAB9"
            index={0}
          />
          <AureumPulse
            label="Steps"
            value={dailyActivity?.steps || 0}
            goal={stepsGoal}
            unit="steps"
            icon={Footprints}
            iconColor="#B2D8D8"
            index={1}
          />
          <AureumPulse
            label="Training Volume"
            value={workoutVolume}
            goal={5000}
            unit="kg"
            icon={Dumbbell}
            iconColor="#BDB5D5"
            index={2}
          />
          <AureumPulse
            label="Hydration"
            value={dailyActivity?.water_liters || 0}
            goal={waterGoal}
            unit={waterUnit === 'glasses' ? 'glasses' : 'L'}
            icon={Droplets}
            iconColor="#9BB7D4"
            index={3}
          />
        </div>

        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6">

          <VoidCard>
            <AIInsight
              stats={{
                caloriesConsumed: consumedCalories,
                caloriesGoal: maintenanceCalories,
                steps: dailyActivity?.steps || 0,
                stepsGoal: stepsGoal,
                waterGlasses: dailyActivity?.water_liters || 0,
                workedOut: !!todaysWorkout
              }}
            />
          </VoidCard>
        </motion.div>

        {/* Powerlifting Totals */}
        <PowerliftingTotals bodyweight={profile?.current_weight || 80} />

        {/* 90-Day Weight Trend */}
        {weightHistory.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6">
            <VoidCard>
              <h3 
                className="text-[10px] uppercase tracking-[0.3em] text-white mb-4"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
              >
                90-Day Weight Evolution
              </h3>
              <WeightTrendMini weightHistory={weightHistory} />
            </VoidCard>
          </motion.div>
        )}

        {/* Supplement Streak */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6">
          <VoidCard>
            <SupplementStreak />
          </VoidCard>
        </motion.div>

        {/* Energy Balance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-24">

          <VoidCard>
            <h3 
              className="text-[10px] uppercase tracking-[0.3em] text-white mb-4"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              Energy Balance
            </h3>
            <div className="flex items-baseline justify-between text-center">
              <div>
                <p 
                  className="text-xl text-white"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                >
                  {maintenanceCalories}
                </p>
                <p 
                  className="text-[10px] uppercase tracking-wider mt-1"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}
                >
                  Base
                </p>
              </div>
              <span className="text-[#D4AF37]/60 text-base">+</span>
              <div>
                <p 
                  className="text-xl"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#8ECAE6' }}
                >
                  {activityCalories}
                </p>
                <p 
                  className="text-[10px] uppercase tracking-wider mt-1"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}
                >
                  Active
                </p>
              </div>
              <span className="text-[#D4AF37]/60 text-base">−</span>
              <div>
                <p 
                  className="text-xl"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#FFDAB9' }}
                >
                  {consumedCalories}
                </p>
                <p 
                  className="text-[10px] text-white/40 uppercase tracking-wider mt-1"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                >
                  Eaten
                </p>
              </div>
              <span className="text-[#D4AF37]/60 text-base">=</span>
              <div>
                <p 
                  className="text-xl text-white"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                >
                  {remainingCalories}
                </p>
                <p 
                  className="text-[10px] text-white/40 uppercase tracking-wider mt-1"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                >
                  Left
                </p>
              </div>
            </div>
          </VoidCard>
        </motion.div>

        <QuickLogFAB onUpdate={handleUpdate} />
      </div>
    </motion.div>);

}