import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Footprints, Dumbbell, Droplets } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';
import ChronosOrbital from '@/components/dashboard/ChronosOrbital';
import AureumPulse from '@/components/dashboard/AureumPulse';
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
    staleTime: 5 * 60 * 1000
  });

  const { data: dailyActivity, refetch: refetchActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['dailyActivity', today],
    queryFn: async () => {
      const activities = await base44.entities.DailyActivity.filter({ date: today });
      return activities[0] || { steps: 0, water_glasses: 0, active_minutes: 0, calories_burned: 0 };
    },
    staleTime: 1 * 60 * 1000
  });

  const { data: todaysFoodLogs, isLoading: foodLoading } = useQuery({
    queryKey: ['foodLogs', today],
    queryFn: async () => {
      return await base44.entities.FoodLog.filter({ date: today });
    },
    staleTime: 1 * 60 * 1000
  });

  const { data: todaysWorkout, isLoading: workoutLoading } = useQuery({
    queryKey: ['workoutLogs', today],
    queryFn: async () => {
      const workouts = await base44.entities.WorkoutLog.filter({ date: today });
      return workouts[0] || null;
    },
    staleTime: 1 * 60 * 1000
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
  const waterGoal = profile?.water_goal_glasses || 8;

  const pulseStats = [
    {
      label: 'Energy Remaining',
      value: remainingCalories,
      goal: maintenanceCalories + activityCalories,
      unit: 'kcal'
    },
    {
      label: 'Steps',
      value: dailyActivity?.steps || 0,
      goal: stepsGoal,
      unit: 'steps'
    },
    {
      label: 'Volume Lifted',
      value: workoutVolume,
      goal: 5000,
      unit: 'kg'
    },
    {
      label: 'Hydration',
      value: dailyActivity?.water_glasses || 0,
      goal: waterGoal,
      unit: 'glasses'
    }
  ];


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
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Ambient Gyro-Glow Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.02) 0%, transparent 50%)'
          }}
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -30, 30, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {showWelcome && <WelcomeModal onComplete={handleWelcomeComplete} />}
      
      {/* Minimalist Magazine Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center relative z-10">

        {/* Subtle Golden Feather Icon */}
        <svg className="w-12 h-12 mx-auto mb-6 opacity-80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        
        {/* Ultra-light Serif Typography */}
        <h1 
          className="text-3xl tracking-[0.5em] text-[#D4AF37] mb-6"
          style={{ fontFamily: 'Cinzel, serif', fontWeight: 300 }}
        >
          A U R E U M
        </h1>
        
        {/* Muted Bronze Date - always visible but subtle */}
        <p className="text-[#9C7E46] text-[10px] uppercase tracking-[0.3em]" style={{ fontWeight: 200 }}>
          {format(new Date(), 'EEEE, MMMM d')}
        </p>

        {/* Scroll-triggered Date Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: showDatePill ? 1 : 0, y: showDatePill ? 0 : -10 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 backdrop-blur-xl bg-white/5 border border-[#D4AF37]/20 rounded-full"
        >
          <p className="text-[9px] text-[#D4AF37] uppercase tracking-[0.2em]">
            {format(new Date(), 'MMM d')}
          </p>
        </motion.div>
      </motion.div>

      {/* Chronos Orbital Progress System */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}>

        <VoidCard className="mb-8">
          <ChronosOrbital
            calories={consumedCalories}
            caloriesGoal={maintenanceCalories + activityCalories}
            steps={dailyActivity?.steps || 0}
            stepsGoal={stepsGoal}
            volume={workoutVolume}
            volumeGoal={5000} />

          {/* Orbital Legend - Ultra minimal */}
          <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-[1px] h-3 bg-[#D4AF37]" />
              <span className="text-[9px] text-white/40 uppercase tracking-[0.2em]" style={{ fontWeight: 200 }}>Cal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[1px] h-3 bg-[#C0C0C0]" />
              <span className="text-[9px] text-white/40 uppercase tracking-[0.2em]" style={{ fontWeight: 200 }}>Steps</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[1px] h-3 bg-[#CD7F32]" />
              <span className="text-[9px] text-white/40 uppercase tracking-[0.2em]" style={{ fontWeight: 200 }}>Vol</span>
            </div>
          </div>
        </VoidCard>
      </motion.div>

      {/* Aureum Pulse Horizontal Visualizations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 mb-8">

        <VoidCard>
          <AureumPulse
            label="Energy Remaining"
            value={Math.max(remainingCalories, 0)}
            goal={maintenanceCalories}
            unit="kcal"
            icon={Flame}
          />
        </VoidCard>

        <VoidCard>
          <AureumPulse
            label="Daily Steps"
            value={dailyActivity?.steps || 0}
            goal={stepsGoal}
            unit="steps"
            icon={Footprints}
          />
        </VoidCard>

        <VoidCard>
          <AureumPulse
            label="Training Volume"
            value={workoutVolume}
            goal={5000}
            unit="kg"
            icon={Dumbbell}
          />
        </VoidCard>

        <VoidCard>
          <AureumPulse
            label="Hydration"
            value={dailyActivity?.water_glasses || 0}
            goal={profile?.water_goal_glasses || 8}
            unit="glasses"
            icon={Droplets}
          />
        </VoidCard>
      </motion.div>

      {/* AI Insight - Void Card Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8">

        <VoidCard>
          <AIInsight
            stats={{
              caloriesConsumed: consumedCalories,
              caloriesGoal: maintenanceCalories,
              steps: dailyActivity?.steps || 0,
              stepsGoal: stepsGoal,
              waterGlasses: dailyActivity?.water_glasses || 0,
              workedOut: !!todaysWorkout
            }} />
        </VoidCard>
      </motion.div>

      {/* Energy Balance - Editorial Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}>

        <VoidCard>
          <h3 
            className="text-[10px] uppercase tracking-[0.4em] text-[#9C7E46] mb-6 text-center"
            style={{ fontFamily: 'Cinzel, serif', fontWeight: 300 }}
          >
            Energy Balance
          </h3>
          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <p className="text-2xl text-white/90" style={{ fontWeight: 100 }}>{maintenanceCalories}</p>
              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-1">Base</p>
            </div>
            <span className="text-[#9C7E46] mx-2" style={{ fontWeight: 100 }}>+</span>
            <div className="flex-1">
              <p className="text-2xl text-green-400/70" style={{ fontWeight: 100 }}>{activityCalories}</p>
              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-1">Active</p>
            </div>
            <span className="text-[#9C7E46] mx-2" style={{ fontWeight: 100 }}>−</span>
            <div className="flex-1">
              <p className="text-2xl text-[#9C7E46]" style={{ fontWeight: 100 }}>{consumedCalories}</p>
              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-1">Eaten</p>
            </div>
            <span className="text-[#9C7E46] mx-2" style={{ fontWeight: 100 }}>═</span>
            <div className="flex-1">
              <p className={`text-2xl ${remainingCalories >= 0 ? 'text-[#D4AF37]' : 'text-red-400/70'}`} style={{ fontWeight: 100 }}>
                {remainingCalories}
              </p>
              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-1">Remain</p>
            </div>
          </div>
        </VoidCard>
      </motion.div>

      <QuickLogFAB onUpdate={handleUpdate} />
    </div>);

}