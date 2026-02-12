import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Footprints, Dumbbell, Droplets } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';
import ChronosOrbital from '@/components/dashboard/ChronosOrbital';
import AureumPulse from '@/components/dashboard/AureumPulse';
import GyroGlow from '@/components/dashboard/GyroGlow';
import QuickLogFAB from '@/components/dashboard/QuickLogFAB';
import AIInsight from '@/components/dashboard/AIInsight';
import WelcomeModal from '@/components/shared/WelcomeModal';

export default function Dashboard() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDatePill, setShowDatePill] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { scrollY } = useScroll();

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
    gcTime: 15 * 60 * 1000
  });

  const { data: dailyActivity, refetch: refetchActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['dailyActivity', today],
    queryFn: async () => {
      const activities = await base44.entities.DailyActivity.filter({ date: today });
      return activities[0] || { steps: 0, water_liters: 0, active_minutes: 0, calories_burned: 0 };
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000
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

  useEffect(() => {
    if (profile === null) {
      const checkProfile = async () => {
        const profiles = await base44.entities.UserProfile.filter({});
        if (profiles.length === 0) {
          setShowWelcome(true);
        }
      };
      checkProfile();
    } else if (profile && !profile.permissions_requested) {
      setShowWelcome(true);
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

  const isLoading = profileLoading || activityLoading || foodLoading || workoutLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1410 50%, #0a0a0a 100%)',
    }}>
      {showWelcome && <WelcomeModal onComplete={handleWelcomeComplete} />}
      
      <div className="relative z-10 p-6">
      
        {/* Minimalist Magazine Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10 text-center pt-6">

          {/* Subtle Golden Feather Icon */}
          <svg className="w-8 h-8 mx-auto mb-3 opacity-40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" stroke="url(#goldGradient)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="16" y1="8" x2="2" y2="22" stroke="url(#goldGradient)" strokeWidth="0.8" strokeLinecap="round" />
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#F4D03F" />
                <stop offset="100%" stopColor="#D4AF37" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Ultra-thin Inter Typography */}
          <h1 
            className="text-3xl tracking-[0.4em] mb-3"
            style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontWeight: 400,
              background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 50%, #F4D03F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            A U R E U M
          </h1>
          
          {/* Muted Bronze Date */}
          <p 
            className="text-[#C9A961] text-[11px] uppercase tracking-[0.25em]"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </motion.div>

        {/* Chronos Orbital Progress System */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}>

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
            label="Energy Remaining"
            value={Math.max(remainingCalories, 0)}
            goal={maintenanceCalories + activityCalories}
            unit="kcal"
            icon={Flame}
            index={0}
          />
          <AureumPulse
            label="Steps"
            value={dailyActivity?.steps || 0}
            goal={stepsGoal}
            unit="steps"
            icon={Footprints}
            index={1}
          />
          <AureumPulse
            label="Training Volume"
            value={workoutVolume}
            goal={5000}
            unit="kg"
            icon={Dumbbell}
            index={2}
          />
          <AureumPulse
            label="Hydration"
            value={dailyActivity?.water_liters || 0}
            goal={waterGoal}
            unit={waterUnit === 'glasses' ? 'glasses' : 'L'}
            icon={Droplets}
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

        {/* Energy Balance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-24">

          <VoidCard>
            <h3 
              className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-4"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              Energy Balance
            </h3>
            <div className="flex items-center justify-between text-center">
              <div>
                <p 
                  className="text-xl text-white"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                >
                  {maintenanceCalories}
                </p>
                <p 
                  className="text-[10px] text-white/40 uppercase tracking-wider mt-1"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                >
                  Base
                </p>
              </div>
              <span className="text-[#D4AF37]/60 text-base">+</span>
              <div>
                <p 
                  className="text-xl text-[#C9A961]"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                >
                  {activityCalories}
                </p>
                <p 
                  className="text-[10px] text-white/40 uppercase tracking-wider mt-1"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                >
                  Active
                </p>
              </div>
              <span className="text-[#D4AF37]/60 text-base">−</span>
              <div>
                <p 
                  className="text-xl text-[#C9A961]"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
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
                  className={`text-xl ${remainingCalories >= 0 ? 'text-[#F4D03F]' : 'text-red-400'}`}
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
    </div>);

}