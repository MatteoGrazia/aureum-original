import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Target, TrendingUp, Award, RefreshCw } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import StepCounter from '@/components/activity/StepCounter';
import ActivityStats from '@/components/activity/ActivityStats';
import { Input } from '@/components/ui/input';

export default function Activity() {
  const [motionSupported, setMotionSupported] = useState(false);
  const [manualSteps, setManualSteps] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const stepBuffer = useRef(0);
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: dailyActivity, refetch } = useQuery({
    queryKey: ['dailyActivity', today],
    queryFn: async () => {
      const activities = await base44.entities.DailyActivity.filter({ date: today });
      if (activities.length > 0) return activities[0];
      
      // Create today's activity record
      const newActivity = await base44.entities.DailyActivity.create({
        date: today,
        steps: 0,
        active_minutes: 0,
        sedentary_minutes: 480, // 8 hours default
        calories_burned: 0,
        water_glasses: 0,
        step_goal: 10000
      });
      return newActivity;
    }
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({});
      return profiles[0] || null;
    }
  });

  const { data: weeklyActivity = [] } = useQuery({
    queryKey: ['weeklyActivity'],
    queryFn: async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return base44.entities.DailyActivity.filter({}, '-date', 7);
    }
  });

  const stepGoal = profile?.daily_step_goal || 10000;
  const currentSteps = dailyActivity?.steps || 0;

  // Check for motion sensor support
  useEffect(() => {
    if ('DeviceMotionEvent' in window) {
      setMotionSupported(true);
    }
  }, []);

  // Motion tracking
  useEffect(() => {
    if (!isTracking || !motionSupported) return;

    let stepCount = 0;
    const threshold = 12;
    const minInterval = 300;
    let lastStepTime = 0;

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const magnitude = Math.sqrt(
        Math.pow(acc.x - lastAcceleration.current.x, 2) +
        Math.pow(acc.y - lastAcceleration.current.y, 2) +
        Math.pow(acc.z - lastAcceleration.current.z, 2)
      );

      const now = Date.now();
      if (magnitude > threshold && now - lastStepTime > minInterval) {
        stepCount++;
        lastStepTime = now;
        stepBuffer.current = stepCount;
      }

      lastAcceleration.current = { x: acc.x, y: acc.y, z: acc.z };
    };

    window.addEventListener('devicemotion', handleMotion);

    // Sync steps every 30 seconds
    const syncInterval = setInterval(async () => {
      if (stepBuffer.current > 0 && dailyActivity) {
        const newSteps = dailyActivity.steps + stepBuffer.current;
        const caloriesBurned = Math.round(newSteps * 0.04);
        const activeMinutes = Math.round(stepBuffer.current / 100);

        await base44.entities.DailyActivity.update(dailyActivity.id, {
          steps: newSteps,
          calories_burned: caloriesBurned,
          active_minutes: (dailyActivity.active_minutes || 0) + activeMinutes
        });

        stepBuffer.current = 0;
        refetch();
      }
    }, 30000);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      clearInterval(syncInterval);
    };
  }, [isTracking, motionSupported, dailyActivity]);

  const handleManualSteps = async () => {
    const steps = parseInt(manualSteps);
    if (!steps || !dailyActivity) return;

    const newSteps = dailyActivity.steps + steps;
    const caloriesBurned = Math.round(newSteps * 0.04);
    const activeMinutes = Math.round(steps / 100);

    await base44.entities.DailyActivity.update(dailyActivity.id, {
      steps: newSteps,
      calories_burned: caloriesBurned,
      active_minutes: (dailyActivity.active_minutes || 0) + activeMinutes
    });

    setManualSteps('');
    refetch();
  };

  const requestMotionPermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          setIsTracking(true);
        }
      } catch (error) {
        console.error('Motion permission error:', error);
      }
    } else {
      setIsTracking(true);
    }
  };

  // Calculate weekly stats
  const weeklySteps = weeklyActivity.reduce((sum, day) => sum + (day.steps || 0), 0);
  const weeklyAverage = Math.round(weeklySteps / Math.max(weeklyActivity.length, 1));
  const bestDay = Math.max(...weeklyActivity.map(d => d.steps || 0), 0);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-white/40 text-xs uppercase tracking-[0.3em]">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <h1 className="text-3xl mt-2 tracking-wide">
          <span className="text-white">Movement</span>
          <span className="text-[#D4AF37] ml-2">Pulse</span>
        </h1>
      </motion.div>

      {/* Step Counter */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <StepCounter steps={currentSteps} goal={stepGoal} />
      </motion.div>

      {/* Tracking Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <GlassCard className="p-5">
          <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Step Tracking</h3>
          
          {motionSupported ? (
            <div className="space-y-4">
              <GoldButton
                onClick={isTracking ? () => setIsTracking(false) : requestMotionPermission}
                variant={isTracking ? 'outline' : 'filled'}
                className="w-full flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isTracking ? 'animate-spin' : ''}`} />
                {isTracking ? 'Tracking Active' : 'Start Tracking'}
              </GoldButton>
              
              {isTracking && (
                <p className="text-center text-white/40 text-xs">
                  Walk around to track your steps automatically
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-white/40 text-sm text-center">
                Motion sensors not available on this device
              </p>
              
              {/* Manual Entry */}
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Add steps manually"
                  value={manualSteps}
                  onChange={(e) => setManualSteps(e.target.value)}
                  className="flex-1 bg-white/5 border-[#D4AF37]/20"
                />
                <GoldButton onClick={handleManualSteps} disabled={!manualSteps}>
                  Add
                </GoldButton>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Activity Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <ActivityStats
          activeMinutes={dailyActivity?.active_minutes || 0}
          sedentaryMinutes={dailyActivity?.sedentary_minutes || 480}
          caloriesBurned={dailyActivity?.calories_burned || 0}
        />
      </motion.div>

      {/* Weekly Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="p-5">
          <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4">This Week</h3>
          
          {/* Weekly Bar Chart */}
          <div className="flex items-end justify-between h-32 mb-4">
            {weeklyActivity.slice(-7).reverse().map((day, index) => {
              const height = stepGoal > 0 ? (day.steps / stepGoal) * 100 : 0;
              const isToday = day.date === today;
              
              return (
                <div key={day.id || index} className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(height, 100)}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`w-4 rounded-t-full ${
                      isToday 
                        ? 'bg-gradient-to-t from-[#D4AF37] to-[#F4D03F]' 
                        : 'bg-white/20'
                    }`}
                    style={{ minHeight: '4px' }}
                  />
                  <p className={`text-[10px] mt-2 ${isToday ? 'text-[#D4AF37]' : 'text-white/30'}`}>
                    {format(new Date(day.date), 'EEE').charAt(0)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Weekly Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-3 h-3 text-[#D4AF37]" />
              </div>
              <p className="text-white text-lg">{weeklySteps.toLocaleString()}</p>
              <p className="text-white/30 text-[10px] uppercase">Total Steps</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
              </div>
              <p className="text-white text-lg">{weeklyAverage.toLocaleString()}</p>
              <p className="text-white/30 text-[10px] uppercase">Daily Avg</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="w-3 h-3 text-purple-400" />
              </div>
              <p className="text-white text-lg">{bestDay.toLocaleString()}</p>
              <p className="text-white/30 text-[10px] uppercase">Best Day</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}