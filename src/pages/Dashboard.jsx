import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Footprints, Dumbbell, Droplets } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import ActivityRings from '@/components/dashboard/ActivityRings';
import QuickLogFAB from '@/components/dashboard/QuickLogFAB';
import AIInsight from '@/components/dashboard/AIInsight';
import WelcomeModal from '@/components/shared/WelcomeModal';

export default function Dashboard() {
  const [showWelcome, setShowWelcome] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

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

  const stats = [
  {
    icon: Flame,
    label: 'Remaining',
    value: remainingCalories,
    unit: 'kcal',
    color: 'text-[#9C7E46]',
    bgColor: 'from-[#9C7E46]/20'
  },
  {
    icon: Footprints,
    label: 'Steps',
    value: dailyActivity?.steps || 0,
    unit: `/ ${stepsGoal.toLocaleString()}`,
    color: 'text-[#C0C0C0]',
    bgColor: 'from-white/10'
  },
  {
    icon: Dumbbell,
    label: 'Volume',
    value: workoutVolume.toLocaleString(),
    unit: 'kg',
    color: 'text-[#CD7F32]',
    bgColor: 'from-[#CD7F32]/20'
  },
  {
    icon: Droplets,
    label: 'Water',
    value: dailyActivity?.water_glasses || 0,
    unit: `/ ${profile?.water_goal_glasses || 8}`,
    color: 'text-blue-400',
    bgColor: 'from-blue-400/20'
  }];


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
    <div className="min-h-screen p-6">
      {showWelcome && <WelcomeModal onComplete={handleWelcomeComplete} />}
      
      {/* Header with Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center">

        {/* Golden Feather Logo */}
        <svg className="w-30 h-24 mx-auto mb-4 object-contain" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="16" y1="8" x2="2" y2="22" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#F4D03F" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
        </svg>
        
        <h1 className="text-4xl tracking-[0.4em] font-extralight">
          <span className="text-[#D4AF37]">AUREUM</span>
        </h1>
        
        <p className="text-white/30 text-xs uppercase tracking-[0.3em] mt-2">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </motion.div>

      {/* Activity Rings */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}>

        <GlassCard className="p-6 mb-6" glow>
          <ActivityRings
            calories={consumedCalories}
            caloriesGoal={maintenanceCalories + activityCalories}
            steps={dailyActivity?.steps || 0}
            stepsGoal={stepsGoal}
            volume={workoutVolume}
            volumeGoal={5000} />

          
          {/* Ring Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
              <span className="text-xs text-white/50">Calories</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#C0C0C0]" />
              <span className="text-xs text-white/50">Steps</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#CD7F32]" />
              <span className="text-xs text-white/50">Volume</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4 mb-6">

        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}>

              <GlassCard className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.bgColor} to-transparent flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} strokeWidth={1.5} />
                </div>
                <p className="text-2xl text-white">{stat.value}</p>
                <p className="text-xs text-white/30 mt-1">
                  {stat.label} <span className="text-white/20">{stat.unit}</span>
                </p>
              </GlassCard>
            </motion.div>);

        })}
      </motion.div>

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}>

        <AIInsight
          stats={{
            caloriesConsumed: consumedCalories,
            caloriesGoal: maintenanceCalories,
            steps: dailyActivity?.steps || 0,
            stepsGoal: stepsGoal,
            waterGlasses: dailyActivity?.water_glasses || 0,
            workedOut: !!todaysWorkout
          }} />

      </motion.div>

      {/* Calorie Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6">

        <GlassCard className="p-5">
          <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Energy Balance</h3>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xl text-white">{maintenanceCalories}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Base</p>
            </div>
            <span className="text-[#D4AF37]">+</span>
            <div className="text-center">
              <p className="text-xl text-green-400">{activityCalories}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Active</p>
            </div>
            <span className="text-[#D4AF37]">−</span>
            <div className="text-center">
              <p className="text-xl text-[#9C7E46]">{consumedCalories}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Eaten</p>
            </div>
            <span className="text-[#D4AF37]">=</span>
            <div className="text-center">
              <p className={`text-xl ${remainingCalories >= 0 ? 'text-[#D4AF37]' : 'text-red-400'}`}>
                {remainingCalories}
              </p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Left</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <QuickLogFAB onUpdate={handleUpdate} />
    </div>);

}