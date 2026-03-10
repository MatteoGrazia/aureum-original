import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  User, Settings, Scale, Target, Ruler, Calendar,
  LogOut, ChevronRight, Edit3, Save, Droplets
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import WeightGraph from '@/components/profile/WeightGraph';
import ProgressPhotoVault from '@/components/profile/ProgressPhotoVault';
import VolumeBenchmarks from '@/components/profile/VolumeBenchmarks';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({});
      return profiles[0] || null;
    }
  });

  const { data: weightHistory = [], refetch: refetchWeight } = useQuery({
    queryKey: ['weightHistory'],
    queryFn: () => base44.entities.WeightHistory.filter({}, '-date', 30)
  });

  const { data: progressPhotos = [], refetch: refetchPhotos } = useQuery({
    queryKey: ['progressPhotos'],
    queryFn: () => base44.entities.ProgressPhoto.filter({}, '-date')
  });

  const { data: workoutStats } = useQuery({
    queryKey: ['workoutStats'],
    queryFn: async () => {
      const workouts = await base44.entities.WorkoutLog.list();
      return {
        totalWorkouts: workouts.length,
        totalVolume: workouts.reduce((sum, w) => sum + (w.total_volume || 0), 0),
        totalDuration: workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0)
      };
    }
  });

  const handleEditProfile = () => {
    setEditData({
      height: profile?.height || '',
      current_weight: profile?.current_weight || '',
      goal_weight: profile?.goal_weight || '',
      birth_date: profile?.birth_date || '',
      gender: profile?.gender || '',
      activity_level: profile?.activity_level || 'moderate',
      goal: profile?.goal || 'maintain',
      daily_step_goal: profile?.daily_step_goal || 10000,
      water_goal: profile?.water_goal || 2.5,
      water_unit: profile?.water_unit || 'liters',
      measurement_system: profile?.measurement_system || 'metric'
    });
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    // Calculate maintenance calories using Mifflin-St Jeor
    let bmr = 0;
    if (editData.height && editData.current_weight && editData.birth_date && editData.gender) {
      const age = new Date().getFullYear() - new Date(editData.birth_date).getFullYear();
      const weight = parseFloat(editData.current_weight);
      const height = parseFloat(editData.height);
      
      if (editData.gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const maintenance = Math.round(bmr * (activityMultipliers[editData.activity_level] || 1.55));

    const updateData = {
      ...editData,
      height: parseFloat(editData.height) || null,
      current_weight: parseFloat(editData.current_weight) || null,
      goal_weight: parseFloat(editData.goal_weight) || null,
      daily_step_goal: parseInt(editData.daily_step_goal) || 10000,
      water_goal: parseFloat(editData.water_goal) || 2.5,
      maintenance_calories: maintenance || 2000
    };

    if (profile) {
      await base44.entities.UserProfile.update(profile.id, updateData);
    } else {
      await base44.entities.UserProfile.create(updateData);
    }

    setEditMode(false);
    refetchProfile();
  };

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const stats = [
    { label: 'Workouts', value: workoutStats?.totalWorkouts || 0 },
    { label: 'Total Volume', value: `${((workoutStats?.totalVolume || 0) / 1000).toFixed(1)}t` },
    { label: 'Total Time', value: `${Math.round((workoutStats?.totalDuration || 0) / 60)}h` },
  ];

  return (
    <div className="min-h-screen p-6 pb-32 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1
          className="text-3xl tracking-[0.4em] text-center mb-3"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 50%, #F4D03F 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {user?.full_name?.toUpperCase() || 'PROFILE'}
        </h1>
        <p
          className="text-[#C9A961] text-[11px] uppercase tracking-[0.25em] text-center"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
        >
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </motion.div>

      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <GlassCard className="p-6" glow>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center">
              <User className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl text-white" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{user?.full_name || 'User'}</h2>
              <p className="text-white/40 text-sm" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{user?.email}</p>
            </div>
            <button
              onClick={handleEditProfile}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
            >
              <Settings className="w-5 h-5 text-white/50" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl text-white" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{stat.value}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 overflow-y-auto"
          >
            <div className="min-h-screen p-6">
              <GlassCard className="p-6 max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl text-white" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Edit Profile</h2>
                  <button
                    onClick={() => setEditMode(false)}
                    className="text-white/40 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Height (cm)</label>
                      <Input
                        type="number"
                        value={editData.height}
                        onChange={(e) => setEditData(prev => ({ ...prev, height: e.target.value }))}
                        className="bg-white/5 border-[#D4AF37]/20"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Weight (kg)</label>
                      <Input
                        type="number"
                        value={editData.current_weight}
                        onChange={(e) => setEditData(prev => ({ ...prev, current_weight: e.target.value }))}
                        className="bg-white/5 border-[#D4AF37]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Goal Weight (kg)</label>
                    <Input
                      type="number"
                      value={editData.goal_weight}
                      onChange={(e) => setEditData(prev => ({ ...prev, goal_weight: e.target.value }))}
                      className="bg-white/5 border-[#D4AF37]/20"
                    />
                  </div>

                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Birth Date</label>
                    <Input
                      type="date"
                      value={editData.birth_date}
                      onChange={(e) => setEditData(prev => ({ ...prev, birth_date: e.target.value }))}
                      className="bg-white/5 border-[#D4AF37]/20"
                    />
                  </div>

                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Gender</label>
                    <Select
                      value={editData.gender}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-[#D4AF37]/20">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Activity Level</label>
                    <Select
                      value={editData.activity_level}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, activity_level: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-[#D4AF37]/20">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Lightly Active</SelectItem>
                        <SelectItem value="moderate">Moderately Active</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Goal</label>
                    <Select
                      value={editData.goal}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, goal: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-[#D4AF37]/20">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose">Lose Weight</SelectItem>
                        <SelectItem value="maintain">Maintain</SelectItem>
                        <SelectItem value="gain">Build Muscle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Daily Step Goal</label>
                      <Input
                        type="number"
                        value={editData.daily_step_goal}
                        onChange={(e) => setEditData(prev => ({ ...prev, daily_step_goal: e.target.value }))}
                        className="bg-white/5 border-[#D4AF37]/20"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Water Goal (L)</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editData.water_goal}
                        onChange={(e) => setEditData(prev => ({ ...prev, water_goal: e.target.value }))}
                        className="bg-white/5 border-[#D4AF37]/20"
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 mt-4">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Measurement System</label>
                        <Select
                          value={editData.measurement_system}
                          onValueChange={(value) => setEditData(prev => ({ ...prev, measurement_system: value }))}
                        >
                          <SelectTrigger className="bg-white/5 border-[#D4AF37]/20">
                            <SelectValue placeholder="Select system" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="metric">Metric (kg, cm, L)</SelectItem>
                            <SelectItem value="imperial">Imperial (lbs, in, fl oz)</SelectItem>
                            <SelectItem value="uk">UK (stone, ft, pints)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Water Tracking Unit</label>
                        <Select
                          value={editData.water_unit}
                          onValueChange={(value) => setEditData(prev => ({ ...prev, water_unit: value }))}
                        >
                          <SelectTrigger className="bg-white/5 border-[#D4AF37]/20">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="liters">Liters</SelectItem>
                            <SelectItem value="glasses">Glasses (250ml)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <GoldButton onClick={handleSaveProfile} className="w-full flex items-center justify-center gap-2 mt-6">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </GoldButton>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Stats */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Scale className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white text-lg">{profile.current_weight || '-'} kg</p>
                <p className="text-white/30 text-xs">Current</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white text-lg">{profile.goal_weight || '-'} kg</p>
                <p className="text-white/30 text-xs">Goal</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Weight Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <WeightGraph data={weightHistory} />
      </motion.div>

      {/* Progress Photos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <ProgressPhotoVault 
          photos={progressPhotos} 
          onPhotoAdded={refetchPhotos}
        />
      </motion.div>

      {/* Volume Benchmarks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <VolumeBenchmarks lifetimeVolume={profile?.lifetime_volume || 0} />
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}