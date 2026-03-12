import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Target, TrendingUp, Award } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';
import VoidBackground from '@/components/dashboard/VoidBackground';
import StepCounter from '@/components/activity/StepCounter';
import ActivityStats from '@/components/activity/ActivityStats';
import GoogleFitConnect from '@/components/activity/GoogleFitConnect';

export default function Activity() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [isGoogleFitConnected, setIsGoogleFitConnected] = useState(false);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !isGoogleFitConnected) {
      // Exchange the code for tokens
      base44.functions.invoke('googleFitSync', { action: 'exchange', code })
        .then(response => {
          if (response.data.success) {
            localStorage.setItem('google_fit_connected', 'true');
            setIsGoogleFitConnected(true);
            // Clean up URL
            window.history.replaceState({}, document.title, '/Activity');
          }
        })
        .catch(error => {
          console.error('Failed to exchange code:', error);
        });
    }
  }, [isGoogleFitConnected]);

  const { data: dailyActivity, refetch } = useQuery({
    queryKey: ['dailyActivity', today],
    queryFn: async () => {
      const activities = await base44.entities.DailyActivity.filter({ date: today });
      return activities[0] || { steps: 0, water_liters: 0, active_minutes: 0, calories_burned: 0, sedentary_minutes: 480 };
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({});
      return profiles[0] || null;
    }
  });

  // Check Google Fit connection from profile
  useEffect(() => {
    if (profile?.google_fit_refresh_token) {
      setIsGoogleFitConnected(true);
    }
  }, [profile]);

  // Listen for Google Fit sync events
  useEffect(() => {
    const handleSync = () => {
      refetch();
      queryClient.invalidateQueries(['dailyActivity']);
      queryClient.invalidateQueries(['weeklyActivity']);
      queryClient.invalidateQueries(['monthlyActivity']);
      queryClient.invalidateQueries(['yearlyActivity']);
    };
    window.addEventListener('googleFitSynced', handleSync);
    return () => window.removeEventListener('googleFitSynced', handleSync);
  }, [refetch, queryClient]);

  const [timeView, setTimeView] = useState('week'); // 'today', 'week', 'month', 'year'
  const [selectedDay, setSelectedDay] = useState(null);

  const { data: weeklyActivity = [] } = useQuery({
    queryKey: ['weeklyActivity'],
    queryFn: async () => {
      return base44.entities.DailyActivity.filter({}, '-date', 7);
    },
    refetchInterval: 30000
  });

  const stepGoal = profile?.daily_step_goal || 10000;
  const currentSteps = dailyActivity?.steps || 0;

  // Calculate weekly stats
  const weeklySteps = weeklyActivity.reduce((sum, day) => sum + (day.steps || 0), 0);
  const weeklyAverage = Math.round(weeklySteps / Math.max(weeklyActivity.length, 1));
  const bestDay = Math.max(...weeklyActivity.map(d => d.steps || 0), 0);
  
  // Calculate monthly and yearly averages
  const { data: monthlyActivity = [] } = useQuery({
    queryKey: ['monthlyActivity'],
    queryFn: async () => {
      return base44.entities.DailyActivity.filter({}, '-date', 30);
    },
    refetchInterval: 30000
  });
  
  const { data: yearlyActivity = [] } = useQuery({
    queryKey: ['yearlyActivity'],
    queryFn: async () => {
      return base44.entities.DailyActivity.filter({}, '-date', 365);
    },
    refetchInterval: 30000
  });
  
  const monthlySteps = monthlyActivity.reduce((sum, day) => sum + (day.steps || 0), 0);
  const monthlyAverage = Math.round(monthlySteps / Math.max(monthlyActivity.length, 1));
  const yearlySteps = yearlyActivity.reduce((sum, day) => sum + (day.steps || 0), 0);
  const yearlyAverage = Math.round(yearlySteps / Math.max(yearlyActivity.length, 1));

  return (
    <div className="min-h-screen relative bg-[#080808] overflow-x-hidden">
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

      {/* Google Fit Connect */}
      <GoogleFitConnect 
        isConnected={isGoogleFitConnected}
        onSyncComplete={() => {
          setIsGoogleFitConnected(true);
          queryClient.invalidateQueries(['dailyActivity']);
          queryClient.invalidateQueries(['userProfile']);
        }}
      />



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

      {/* Time View Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-4"
      >
        <div className="flex gap-2">
          {[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' }
          ].map(view => (
            <button
              key={view.value}
              onClick={() => setTimeView(view.value)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs uppercase tracking-wider transition-all ${
                timeView === view.value
                  ? 'bg-[#D4AF37] text-[#080808]'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              {view.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Time-based Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <VoidCard>
          <h3 
            className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-4"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            {timeView === 'week' ? 'This Week' : timeView === 'month' ? 'This Month' : 'This Year'}
          </h3>
          
          {/* Dynamic Bar Chart */}
          {(
            <div className="flex items-end justify-between mb-4 gap-1" style={{ minHeight: '180px' }}>
              {(timeView === 'week' ? weeklyActivity.slice(-7).reverse() : 
                timeView === 'month' ? monthlyActivity.filter((_, i) => i % 4 === 0).slice(-7).reverse() :
                yearlyActivity.filter((_, i) => i % 52 === 0).slice(-7).reverse()
              ).map((day, index) => {
                const steps = day?.steps || 0;
                const heightPercent = stepGoal > 0 ? Math.min((steps / stepGoal) * 70, 70) : 0;
                const isToday = day?.date === today;
                const isSelected = selectedDay?.id === day?.id;
                
                return (
                  <div key={day?.id || index} className="flex flex-col items-center flex-1">
                    {isSelected && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#D4AF37] text-[#080808] px-2 py-1 rounded text-[10px] whitespace-nowrap font-medium mb-2"
                      >
                        <div>{format(new Date(day?.date || new Date()), 'MMM d')}</div>
                        <div className="font-semibold">{steps.toLocaleString()} steps</div>
                      </motion.div>
                    )}
                    <div className="w-full h-28 flex items-end justify-center relative">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                        className={`w-4 rounded-t-full cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-gradient-to-t from-[#D4AF37] to-[#F4D03F] shadow-[0_0_12px_rgba(212,175,55,0.6)]' 
                            : isToday 
                            ? 'bg-gradient-to-t from-[#D4AF37] to-[#F4D03F]' 
                            : 'bg-white/20 hover:bg-white/30'
                        }`}
                        style={{ minHeight: heightPercent > 0 ? '8px' : '4px' }}
                      />
                    </div>
                    <p className={`text-[10px] mt-2 ${isSelected || isToday ? 'text-[#D4AF37]' : 'text-white/30'}`}>
                      {timeView === 'week' ? format(new Date(day?.date || new Date()), 'EEE').charAt(0) :
                       timeView === 'month' ? format(new Date(day?.date || new Date()), 'd') :
                       format(new Date(day?.date || new Date()), 'MMM').charAt(0)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dynamic Stats */}
          {(
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-3 h-3 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <p className="text-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                  {(timeView === 'week' ? weeklySteps : timeView === 'month' ? monthlySteps : yearlySteps).toLocaleString()}
                </p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Total Steps</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <p className="text-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                  {(timeView === 'week' ? weeklyAverage : timeView === 'month' ? monthlyAverage : yearlyAverage).toLocaleString()}
                </p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Daily Avg</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="w-3 h-3 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <p className="text-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                  {Math.max(...(timeView === 'week' ? weeklyActivity : timeView === 'month' ? monthlyActivity : yearlyActivity).map(d => d.steps || 0), 0).toLocaleString()}
                </p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Best Day</p>
              </div>
            </div>
          )}
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