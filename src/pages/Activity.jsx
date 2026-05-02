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
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // 5 min instead of 30s — reduces server load dramatically
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

  const [timeView, setTimeView] = useState('week');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.

  // Get start/end dates for the selected week
  const getWeekRange = (offset) => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + offset * 7);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getWeekRange(weekOffset);
  const startDateStr = format(startOfWeek, 'yyyy-MM-dd');
  const endDateStr = format(endOfWeek, 'yyyy-MM-dd');

  const { data: weeklyActivity = [] } = useQuery({
    queryKey: ['weeklyActivity', weekOffset],
    queryFn: async () => {
      const all = await base44.entities.DailyActivity.filter({}, '-date', 90);
      return all.filter(d => d.date >= startDateStr && d.date <= endDateStr).sort((a, b) => a.date.localeCompare(b.date));
    },
    staleTime: 5 * 60 * 1000,
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
    queryFn: () => base44.entities.DailyActivity.filter({}, '-date', 30),
    staleTime: 5 * 60 * 1000,
  });
  
  const { data: yearlyActivity = [] } = useQuery({
    queryKey: ['yearlyActivity'],
    queryFn: () => base44.entities.DailyActivity.filter({}, '-date', 365),
    staleTime: 10 * 60 * 1000,
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
              background: 'linear-gradient(135deg, #D4AF37 0%, #D4AF37 50%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            ACTIVITY
          </h1>
          <p 
            className="text-white text-[11px] uppercase tracking-[0.25em]"
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
          sedentaryMinutes={dailyActivity?.sedentary_minutes || 0}
          caloriesBurned={dailyActivity?.calories_burned || 0}
          steps={dailyActivity?.steps || 0}
          profile={profile}
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
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex-1">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-white" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                  {timeView === 'week' ? (weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : `${Math.abs(weekOffset)} Weeks Ago`) : timeView === 'month' ? 'This Month' : 'This Year'}
                </h3>
                <div className="text-white/40 text-xs mt-0.5">
                  {timeView === 'week' &&
                    `${format(startOfWeek, 'MMM d')} – ${format(endOfWeek, 'MMM d')}`}
                  {timeView === 'month' && monthlyActivity.length > 0 &&
                    `${format(new Date(monthlyActivity[monthlyActivity.length - 1]?.date || new Date()), 'MMM d')} – ${format(new Date(monthlyActivity[0]?.date || new Date()), 'MMM d')}`}
                  {timeView === 'year' &&
                    `${format(new Date(new Date().getFullYear(), 0, 1), 'MMM d')} – ${format(new Date(), 'MMM d, yyyy')}`}
                </div>
              </div>
              {/* Week navigation arrows */}
              {timeView === 'week' && (
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={() => { setWeekOffset(o => o - 1); setSelectedDay(null); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  {weekOffset < 0 && (
                    <button
                      onClick={() => { setWeekOffset(o => o + 1); setSelectedDay(null); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  )}
                </div>
              )}
              <div className="text-white text-lg font-medium">
                {(timeView === 'week' ? weeklySteps : timeView === 'month' ? monthlySteps : yearlySteps).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Dynamic View */}
          {timeView === 'week' ? (
            <div className="mb-4">
              <div className="relative" style={{ paddingLeft: '32px', paddingRight: '8px' }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-right" style={{ width: '28px' }}>
                  <span className="text-[9px] text-white/30">{(stepGoal * 1.5).toLocaleString()}</span>
                  <span className="text-[9px] text-[#D4AF37]/70">{stepGoal.toLocaleString()}</span>
                  <span className="text-[9px] text-white/30">{Math.floor(stepGoal * 0.5).toLocaleString()}</span>
                  <span className="text-[9px] text-white/30">0</span>
                </div>

                {/* Chart area */}
                <div className="relative flex items-end justify-between gap-1" style={{ height: '200px' }}>
                  {/* Goal line */}
                  <div 
                    className="absolute left-0 right-0 border-t border-dashed border-[#D4AF37]/40 pointer-events-none"
                    style={{ bottom: '133px' }}
                  />
                  
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(startOfWeek);
                    d.setDate(startOfWeek.getDate() + i);
                    const dateStr = format(d, 'yyyy-MM-dd');
                    const dayData = weeklyActivity.find(a => a.date === dateStr);
                    const steps = dayData?.steps || 0;
                    const heightPx = stepGoal > 0 ? Math.min((steps / stepGoal) * 133, 240) : 0;
                    const isToday = dateStr === today;
                    const isSelected = selectedDay?.date === dateStr;
                    const hitGoal = steps >= stepGoal;
                    const isFuture = d > new Date();

                    return (
                      <div key={dateStr} className="flex flex-col items-center flex-1">
                        <div className="w-full h-full flex items-end justify-center relative">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: isFuture ? '4px' : `${Math.max(heightPx, steps > 0 ? 8 : 4)}px` }}
                            transition={{ delay: i * 0.05, duration: 0.4 }}
                            onClick={() => !isFuture && setSelectedDay(isSelected ? null : dayData || { date: dateStr, steps: 0 })}
                            className="w-5 rounded-t-md cursor-pointer transition-all relative"
                            style={{
                              boxShadow: (isSelected || isToday) ? '0 0 12px rgba(142,202,230,0.5)' : 'none',
                              background: isFuture ? 'rgba(255,255,255,0.08)' : 'linear-gradient(to top, #8ECAE6, rgba(255,255,255,0.9))',
                              opacity: isFuture ? 0.3 : 1,
                            }}
                          >
                            {hitGoal && !isFuture && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.05 + 0.3, type: 'spring' }}
                                className="absolute -top-5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ boxShadow: '0 2px 8px rgba(142,202,230,0.4)', background: '#8ECAE6' }}
                              >
                                <svg className="w-2.5 h-2.5 text-[#080808]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                        <p className={`text-[11px] mt-2 ${isSelected || isToday ? 'text-[#D4AF37] font-medium' : 'text-white/40'}`}>
                          {format(d, 'EEE')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedDay && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-3 py-2 rounded-lg text-xs font-medium mt-4 text-center"
                  style={{ border: '1px solid #D4AF37', background: 'transparent' }}
                >
                  <div className="text-[10px] text-white/60 mb-0.5">{format(new Date(selectedDay?.date || new Date()), 'MMM d')}</div>
                  <div className="text-sm font-semibold text-white">{(selectedDay?.steps || 0).toLocaleString()} steps</div>
                </motion.div>
              )}
            </div>
          ) : timeView === 'month' ? (
            <div className="mb-4">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={idx} className="text-center text-[9px] text-white/40 uppercase tracking-wider pb-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {monthlyActivity.slice(-31).reverse().map((day, index) => {
                  const steps = day?.steps || 0;
                  const intensity = stepGoal > 0 ? Math.min((steps / stepGoal), 1) : 0;
                  const isToday = day?.date === today;
                  const isSelected = selectedDay?.id === day?.id;
                  const hitGoal = steps >= stepGoal;
                  
                  const opacity = intensity > 0 ? 0.3 + (intensity * 0.7) : 0.1;
                  const scale = intensity > 0 ? 0.7 + (intensity * 0.3) : 0.5;
                  
                  return (
                    <motion.div
                      key={day?.id || index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02, duration: 0.3 }}
                      className="aspect-square flex items-center justify-center relative"
                    >
                      <motion.div
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                        className="w-full h-full rounded-full cursor-pointer flex items-center justify-center transition-all relative"
                        style={{ 
                          opacity: isSelected || isToday ? 1 : opacity,
                          transform: `scale(${isSelected ? 1 : scale})`,
                          background: 'linear-gradient(135deg, #8ECAE6, rgba(255,255,255,0.9))',
                          boxShadow: (isSelected || isToday) ? '0 0 12px rgba(142,202,230,0.6)' : 'none'
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {hitGoal ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.02 + 0.2, type: 'spring' }}
                            className="w-full h-full rounded-full flex items-center justify-center"
                            style={{ background: '#8ECAE6', boxShadow: '0 2px 8px rgba(142,202,230,0.4)' }}
                          >
                            <svg className="w-[55%] h-[55%] text-[#080808]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        ) : (
                          <span className="text-[10px] text-[#080808] font-medium">
                            {format(new Date(day?.date || new Date()), 'd')}
                          </span>
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {selectedDay && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-3 py-2 rounded-lg text-xs font-medium mt-4 text-center"
                  style={{ border: '1px solid #D4AF37', background: 'transparent' }}
                >
                  <div className="text-[10px] text-white/60 mb-0.5">{format(new Date(selectedDay?.date || new Date()), 'MMM d')}</div>
                  <div className="text-sm font-semibold text-white">{(selectedDay?.steps || 0).toLocaleString()} steps</div>
                </motion.div>
              )}
            </div>
          ) : (
            // ── Year view: total steps per month ──
            <div className="mb-4">
              {(() => {
                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth();
                const monthTotals = Array.from({ length: 12 }, (_, i) => {
                  const total = yearlyActivity
                    .filter(d => new Date(d.date).getFullYear() === currentYear && new Date(d.date).getMonth() === i)
                    .reduce((sum, d) => sum + (d.steps || 0), 0);
                  return { month: i, total };
                });
                const maxTotal = Math.max(...monthTotals.map(m => m.total), stepGoal * 30);
                // goal line as a monthly total approximation
                const monthGoal = stepGoal * 30;

                return (
                  <>
                    <div className="relative" style={{ paddingLeft: '32px', paddingRight: '8px' }}>
                      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-right" style={{ width: '28px' }}>
                        <span className="text-[9px] text-white/30">{Math.round(maxTotal / 1000)}k</span>
                        <span className="text-[9px] text-[#D4AF37]/70">{Math.round(monthGoal / 1000)}k</span>
                        <span className="text-[9px] text-white/30">0</span>
                      </div>

                      <div className="relative flex items-end justify-between gap-1" style={{ height: '200px' }}>
                        <div
                          className="absolute left-0 right-0 border-t border-dashed border-[#D4AF37]/40 pointer-events-none"
                          style={{ bottom: `${(monthGoal / maxTotal) * 200}px` }}
                        />
                        {monthTotals.map(({ month, total }) => {
                          const heightPx = maxTotal > 0 ? Math.min((total / maxTotal) * 200, 200) : 0;
                          const isCurrentMonth = month === currentMonth;
                          const isSelected = selectedMonth === month;
                          const hitGoal = total >= monthGoal;
                          const isFuture = month > currentMonth;

                          return (
                            <div key={month} className="flex flex-col items-center flex-1">
                              <div className="w-full h-full flex items-end justify-center relative">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${heightPx}px` }}
                                  transition={{ delay: month * 0.05, duration: 0.4 }}
                                  onClick={() => !isFuture && setSelectedMonth(isSelected ? null : month)}
                                  className="w-5 rounded-t-md relative"
                                  style={{
                                    minHeight: !isFuture && total > 0 ? '6px' : '3px',
                                    cursor: isFuture ? 'default' : 'pointer',
                                    boxShadow: isSelected || isCurrentMonth ? '0 0 12px rgba(142,202,230,0.5)' : 'none',
                                    background: isFuture
                                      ? 'rgba(255,255,255,0.08)'
                                      : `linear-gradient(to top, #8ECAE6, rgba(255,255,255,0.9))`,
                                    opacity: isFuture ? 0.3 : 1,
                                  }}
                                >
                                  {hitGoal && !isFuture && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: month * 0.05 + 0.3, type: 'spring' }}
                                      className="absolute -top-5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center"
                                      style={{ background: '#8ECAE6', boxShadow: '0 2px 8px rgba(142,202,230,0.4)' }}
                                    >
                                      <svg className="w-2.5 h-2.5 text-[#080808]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </motion.div>
                                  )}
                                </motion.div>
                              </div>
                              <p className={`text-[11px] mt-2 ${isSelected || isCurrentMonth ? 'text-[#D4AF37] font-medium' : 'text-white/40'}`}>
                                {format(new Date(currentYear, month, 1), 'MMM').slice(0, 1)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {selectedMonth !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-3 py-2 rounded-lg text-xs font-medium mt-4 text-center"
                        style={{ border: '1px solid #D4AF37', background: 'transparent' }}
                      >
                        <div className="text-[10px] text-white/60 mb-0.5">
                          {format(new Date(currentYear, selectedMonth, 1), 'MMMM yyyy')}
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {monthTotals[selectedMonth]?.total.toLocaleString()} steps total
                        </div>
                        <div className="text-[10px] text-white/40 mt-0.5">
                          ~{Math.round(monthTotals[selectedMonth]?.total / new Date(currentYear, selectedMonth + 1, 0).getDate()).toLocaleString()} / day avg
                        </div>
                      </motion.div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Dynamic Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-3 h-3 text-[#D4AF37]" strokeWidth={1.5} />
              </div>
              <p className="text-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                {(timeView === 'week' ? weeklySteps : timeView === 'month' ? monthlySteps : yearlySteps).toLocaleString()}
              </p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Total</p>
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
            className="text-[10px] uppercase tracking-[0.3em] text-white mb-3"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            Monthly Average
          </h3>
          <p className="text-3xl text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{monthlyAverage.toLocaleString()}</p>
          <p className="text-white/30 text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>steps per day</p>
        </VoidCard>
        
        <VoidCard>
          <h3 
            className="text-[10px] uppercase tracking-[0.3em] text-white mb-3"
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