import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Target, TrendingUp, Award, RefreshCw } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';
import VoidBackground from '@/components/dashboard/VoidBackground';
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

  // Auto-start tracking on mount
  useEffect(() => {
    if (motionSupported && !isTracking) {
      requestMotionPermission();
    }
  }, [motionSupported]);

  // Calculate weekly stats
  const weeklySteps = weeklyActivity.reduce((sum, day) => sum + (day.steps || 0), 0);
  const weeklyAverage = Math.round(weeklySteps / Math.max(weeklyActivity.length, 1));
  const bestDay = Math.max(...weeklyActivity.map(d => d.steps || 0), 0);
  
  // Calculate monthly and yearly averages
  const { data: monthlyActivity = [] } = useQuery({
    queryKey: ['monthlyActivity'],
    queryFn: async () => {
      return base44.entities.DailyActivity.filter({}, '-date', 30);
    }
  });
  
  const { data: yearlyActivity = [] } = useQuery({
    queryKey: ['yearlyActivity'],
    queryFn: async () => {
      return base44.entities.DailyActivity.filter({}, '-date', 365);
    }
  });
  
  const monthlySteps = monthlyActivity.reduce((sum, day) => sum + (day.steps || 0), 0);
  const monthlyAverage = Math.round(monthlySteps / Math.max(monthlyActivity.length, 1));
  const yearlySteps = yearlyActivity.reduce((sum, day) => sum + (day.steps || 0), 0);
  const yearlyAverage = Math.round(yearlySteps / Math.max(yearlyActivity.length, 1));

  return (
    <div className="min-h-screen relative bg-[#080808]">
      <VoidBackground />
      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 pt-6 text-center"
        >
          <h1 
            className="text-3xl tracking-[0.4em] mb-3"
            style={{ 
              fontFamily: 'Montserrat, sans-serif', 
              fontWeight: 400,
              background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 50%, #F4D03F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            ACTIVITY
          </h1>
          <p 
            className="text-[#C9A961] text-[11px] uppercase tracking-[0.25em]"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
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

      {/* Auto-start tracking on mount */}
      {React.useEffect(() => {
        if (motionSupported && !isTracking) {
          requestMotionPermission();
        }
      }, [motionSupported])}

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
        <VoidCard>
          <h3 
            className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-4"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            This Week
          </h3>
          
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
                <Target className="w-3 h-3 text-[#8ECAE6]" strokeWidth={1.5} />
              </div>
              <p className="text-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{weeklySteps.toLocaleString()}</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Total Steps</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-[#A8D5BA]" strokeWidth={1.5} />
              </div>
              <p className="text-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{weeklyAverage.toLocaleString()}</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Daily Avg</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="w-3 h-3 text-[#E8C5A5]" strokeWidth={1.5} />
              </div>
              <p className="text-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{bestDay.toLocaleString()}</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Best Day</p>
            </div>
          </div>
        </VoidCard>
      </motion.div>

      {/* Monthly & Yearly Averages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 gap-4 mb-24"
      >
        <VoidCard>
          <h3 
            className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            Monthly Average
          </h3>
          <p className="text-3xl text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{monthlyAverage.toLocaleString()}</p>
          <p className="text-white/30 text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>steps per day</p>
        </VoidCard>
        
        <VoidCard>
          <h3 
            className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            Yearly Average
          </h3>
          <p className="text-3xl text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{yearlyAverage.toLocaleString()}</p>
          <p className="text-white/30 text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>steps per day</p>
        </VoidCard>
      </motion.div>
      </div>
    </div>
  );
}