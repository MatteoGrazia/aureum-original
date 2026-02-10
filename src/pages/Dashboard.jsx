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

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({});
      return profiles[0] || null;
    }
  });

  const { data: dailyActivity, refetch: refetchActivity } = useQuery({
    queryKey: ['dailyActivity', today],
    queryFn: async () => {
      const activities = await base44.entities.DailyActivity.filter({ date: today });
      return activities[0] || { steps: 0, water_glasses: 0, active_minutes: 0, calories_burned: 0 };
    }
  });

  const { data: todaysFoodLogs } = useQuery({
    queryKey: ['foodLogs', today],
    queryFn: async () => {
      return await base44.entities.FoodLog.filter({ date: today });
    }
  });

  const { data: todaysWorkout } = useQuery({
    queryKey: ['workoutLogs', today],
    queryFn: async () => {
      const workouts = await base44.entities.WorkoutLog.filter({ date: today });
      return workouts[0] || null;
    }
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
      color: 'text-[#BFA68F]',
      bgColor: 'from-[#BFA68F]/20'
    },
    { 
      icon: Droplets, 
      label: 'Water', 
      value: dailyActivity?.water_glasses || 0, 
      unit: `/ ${profile?.water_goal_glasses || 8}`,
      color: 'text-blue-400',
      bgColor: 'from-blue-400/20'
    },
  ];

  const handleUpdate = () => {
    refetchActivity();
    queryClient.invalidateQueries(['weightHistory']);
  };

  return (
    <div className="min-h-screen p-6">
      {showWelcome && <WelcomeModal onComplete={handleWelcomeComplete} />}
      
      {/* Header with Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        {/* Golden Feather Logo */}
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698347d058d3014d6271ccff/7a73e1737_1.png" 
          alt="Aureum Logo" 
          className="w-16 h-16 mx-auto mb-3 object-contain"
        />
        
        <h1 className="text-4xl tracking-[0.4em]" style={{ fontFamily: 'Inter', fontWeight: 100 }}>
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
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-6 mb-6" glow>
          <ActivityRings
            calories={consumedCalories}
            caloriesGoal={maintenanceCalories + activityCalories}
            steps={dailyActivity?.steps || 0}
            stepsGoal={stepsGoal}
            volume={workoutVolume}
            volumeGoal={5000}
          />
          
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
              <div className="w-3 h-3 rounded-full bg-[#BFA68F]" />
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
        className="grid grid-cols-2 gap-4 mb-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <GlassCard className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.bgColor} to-transparent flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} strokeWidth={1.5} />
                </div>
                <p className="text-2xl text-white">{stat.value}</p>
                <p className="text-xs text-white/30 mt-1">
                  {stat.label} <span className="text-white/20">{stat.unit}</span>
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AIInsight
          stats={{
            caloriesConsumed: consumedCalories,
            caloriesGoal: maintenanceCalories,
            steps: dailyActivity?.steps || 0,
            stepsGoal: stepsGoal,
            waterGlasses: dailyActivity?.water_glasses || 0,
            workedOut: !!todaysWorkout
          }}
        />
      </motion.div>

      {/* Calorie Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
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
    </div>
  );
}