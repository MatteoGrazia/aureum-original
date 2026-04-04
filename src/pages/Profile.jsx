import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  User, Settings, Scale, Target, Ruler, Calendar,
  LogOut, ChevronRight, Edit3, Save, Droplets, Share2, Zap, Sun, Moon
} from 'lucide-react';

const ASCENSION_ICON = 'https://media.base44.com/images/public/698347d058d3014d6271ccff/4158e2305_AscensionIcon.png';

function WingIcon({ size = 16 }) {
  return (
    <img
      src={ASCENSION_ICON}
      alt="Ascension"
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}
import { useTheme } from '@/components/shared/ThemeContext';
import ProfilePictureUpload from '@/components/profile/ProfilePictureUpload';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import WeightGraph from '@/components/profile/WeightGraph';
import ProgressPhotoVault from '@/components/profile/ProgressPhotoVault';
import VolumeBenchmarks from '@/components/profile/VolumeBenchmarks';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Profile() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [followModal, setFollowModal] = useState({ open: false, type: 'followers' });
  const [syndicateVisible, setSyndicateVisible] = useState(true);
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

  const { data: athleteIdentity, refetch: refetchIdentity } = useQuery({
    queryKey: ['athleteIdentity'],
    queryFn: async () => {
      const records = await base44.entities.AthleteIdentity.filter({});
      return records[0] || null;
    },
  });

  const { data: followStats = { followers: 0, following: 0 } } = useQuery({
    queryKey: ['followStats', user?.email],
    queryFn: async () => {
      if (!user?.email) return { followers: 0, following: 0 };
      const followers = await base44.entities.Follow.filter({ following_id: user.email });
      const following = await base44.entities.Follow.filter({ follower_id: user.email });
      return { followers: followers.length, following: following.length };
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (athleteIdentity) {
      setSyndicateVisible(athleteIdentity.syndicate_visible ?? true);
      setNewUsername(athleteIdentity.username || '');
    }
    if (user) setNewEmail(user.email || '');
  }, [athleteIdentity, user]);

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

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || !athleteIdentity) return;
    
    // Global update: Update athlete identity
    await base44.entities.AthleteIdentity.update(athleteIdentity.id, {
      username: newUsername.trim(),
      display_name: newUsername.trim()
    });
    
    // Global sync: Update all historical posts
    const allPosts = await base44.entities.PerformanceFeed.filter({ 
      created_by: user.email 
    });
    
    for (const post of allPosts) {
      await base44.entities.PerformanceFeed.update(post.id, {
        athlete_name: newUsername.trim()
      });
    }
    
    // Refresh queries
    queryClient.invalidateQueries(['athleteIdentity']);
    queryClient.invalidateQueries(['performanceFeed']);
    
    refetchIdentity();
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

  const handleShareProfile = () => {
    const username = athleteIdentity?.username || user?.full_name?.replace(/\s+/g, '').toLowerCase() || 'athlete';
    const shareUrl = `https://aureum.app/athlete/${username}`;
    const shareData = {
      title: `${user?.full_name || 'Athlete'} on Aureum`,
      text: `Check out my Athlete Profile on Aureum — premium fitness tracking.`,
      url: shareUrl,
    };
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard?.writeText(shareUrl);
    }
  };

  const handleSyndicateToggle = async () => {
    const next = !syndicateVisible;
    setSyndicateVisible(next);
    if (athleteIdentity) {
      await base44.entities.AthleteIdentity.update(athleteIdentity.id, {
        syndicate_visible: next,
        network_consent: next ? athleteIdentity.network_consent : false,
      });
      if (!next) localStorage.removeItem('aureum_syndicate_consent');
      refetchIdentity();
    }
  };

  // Ascension Score
  const { data: myPosts = [] } = useQuery({
    queryKey: ['myPosts', user?.email],
    queryFn: () => base44.entities.PerformanceFeed.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });
  const totalAscensions = myPosts.reduce((s, p) => s + (p.voltage_count || 0), 0);
  const myWorkouts = workoutStats?.totalWorkouts || 0;
  const myStreak = (() => {
    const days = [...new Set(myPosts.map(p => p.created_date?.split('T')[0]).filter(Boolean))].sort().reverse();
    if (!days.length) return 0;
    let count = 1;
    for (let i = 1; i < days.length; i++) {
      const diff = (new Date(days[i-1]) - new Date(days[i])) / (1000*60*60*24);
      if (diff <= 1.5) count++; else break;
    }
    return count;
  })();
  const ascensionScore = (totalAscensions * 10) + (myWorkouts * 5) + (myStreak * 2);

  // Real-time AP listener
  const prevAPRef = useRef(null);
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.PerformanceFeed.subscribe((event) => {
      if (event.type === 'update' && event.data?.created_by === user.email) {
        queryClient.invalidateQueries(['myPosts', user.email]);
      }
    });
    return unsubscribe;
  }, [user?.email]);

  // Notify when AP rises
  useEffect(() => {
    if (prevAPRef.current !== null && totalAscensions > prevAPRef.current) {
      toast('Your Ascension count has risen.', {
        style: { background: 'rgba(12,12,12,0.97)', border: '0.5px solid #98AB8F', color: '#98AB8F', fontFamily: 'Montserrat, sans-serif' },
        icon: '🪶',
      });
    }
    prevAPRef.current = totalAscensions;
  }, [totalAscensions]);

  const stats = [
    { label: 'Workouts', value: workoutStats?.totalWorkouts || 0 },
    { label: 'Total Volume', value: `${((workoutStats?.totalVolume || 0) / 1000).toFixed(1)}t` },
    { label: 'Ascensions', value: totalAscensions, sage: true },
  ];

  return (
    <div className="min-h-screen p-6 pb-32 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 pt-6 text-center"
      >
        <h1
          className="text-3xl tracking-[0.4em]"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            color: '#D4AF37',
          }}
        >
          PROFILE
        </h1>

        <p
          className="text-white text-[11px] uppercase tracking-[0.25em] mt-3"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
        >
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </motion.div>

      {/* Identity Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div
          className="rounded-2xl p-6 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid #D4AF37',
            boxShadow: '0 0 40px rgba(212,175,55,0.08)',
          }}
        >
          <div className="flex items-center gap-4">
            <ProfilePictureUpload user={user} onUpdate={() => queryClient.invalidateQueries(['currentUser'])} />
            <div className="flex-1">
              <h2 className="text-xl" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{user?.full_name || 'User'}</h2>
              <p className="text-sm mt-0.5" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', fontWeight: 300, opacity: 0.5 }}>{user?.email}</p>
            </div>
            <button
              onClick={handleEditProfile}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(212,175,55,0.2)' }}
            >
              <Settings className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6" style={{ borderTop: '0.5px solid rgba(212,175,55,0.18)' }}>
            {stats.map((stat, i) => (
              <button
                key={stat.label}
                onClick={() => i < 2 ? setFollowModal({ open: true, type: i === 0 ? 'followers' : 'following' }) : null}
                className={`text-center ${i < 2 ? 'active:scale-95 transition-transform' : ''}`}
              >
                {stat.sage ? (
                  <div className="flex items-center justify-center gap-1">
                    <WingIcon size={16} color="#98AB8F" />
                    <p className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, color: '#98AB8F' }}>{stat.value}</p>
                  </div>
                ) : (
                  <p className="text-xl text-white" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>{stat.value}</p>
                )}
                <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: stat.sage ? '#98AB8F' : '#E5E5E7', fontFamily: 'Montserrat, sans-serif', fontWeight: 400, opacity: stat.sage ? 0.7 : 0.4 }}>{stat.label}</p>
              </button>
            ))}
          </div>

          {/* Share Button */}
          <button
            onClick={handleShareProfile}
            className="w-full mt-5 py-3 rounded-xl flex items-center justify-center gap-2 text-sm tracking-[0.12em] transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #98AB8F, #7A9470)',
              color: '#0a0a0a',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              }}
          >
            <Share2 className="w-4 h-4" />
            SHARE ATHLETE PROFILE
          </button>
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] overflow-y-auto"
            style={{ '--hide-nav': 'none' }}
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
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-white mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Settings</h3>
                    
                    <div className="space-y-4">
                      {/* Theme toggle */}
                      <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(212,175,55,0.15)' }}>
                        <div className="flex items-center gap-3">
                          {isDarkMode ? <Moon className="w-4 h-4" style={{ color: '#D4AF37' }} strokeWidth={1.5} /> : <Sun className="w-4 h-4" style={{ color: '#D4AF37' }} strokeWidth={1.5} />}
                          <div>
                            <p className="text-sm" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif' }}>Theme</p>
                            <p className="text-[10px]" style={{ color: 'rgba(229,229,231,0.4)', fontFamily: 'Montserrat, sans-serif' }}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
                          </div>
                        </div>
                        <button
                          onClick={toggleTheme}
                          className="relative w-12 h-6 rounded-full transition-all"
                          style={{ background: isDarkMode ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.3)' }}
                        >
                          <motion.div
                            animate={{ x: isDarkMode ? 24 : 2 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full"
                            style={{ background: isDarkMode ? '#D4AF37' : '#1D1D1F' }}
                          />
                        </button>
                      </div>
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

                  {/* Username */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: 'rgba(212,175,55,0.7)', fontFamily: 'Montserrat, sans-serif' }}>Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      placeholder="athlete_username"
                      className="w-full px-4 py-3 rounded-xl outline-none text-white text-sm"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(212,175,55,0.2)', fontFamily: 'Montserrat, sans-serif' }}
                    />
                  </div>

                  {/* Email (read-only info) */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: 'rgba(212,175,55,0.7)', fontFamily: 'Montserrat, sans-serif' }}>Email</label>
                    <div className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
                      {user?.email || 'N/A'}
                    </div>
                    <p className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Montserrat, sans-serif' }}>Email cannot be changed directly. Contact support if needed.</p>
                  </div>

                  {/* Syndicate Visibility */}
                  {athleteIdentity && (
                    <div className="flex items-center justify-between py-4 px-4 rounded-xl" style={{ background: 'rgba(152,171,143,0.06)', border: '0.5px solid rgba(152,171,143,0.18)' }}>
                      <div>
                        <p className="text-sm" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif' }}>Syndicate Visibility</p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(229,229,231,0.45)', fontFamily: 'Montserrat, sans-serif' }}>Appear in the community feed</p>
                      </div>
                      <button
                        onClick={handleSyndicateToggle}
                        className="relative w-12 h-6 rounded-full transition-all"
                        style={{ background: syndicateVisible ? '#98AB8F' : 'rgba(255,255,255,0.12)' }}
                      >
                        <motion.div
                          animate={{ x: syndicateVisible ? 24 : 2 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          className="absolute top-1 w-4 h-4 rounded-full"
                          style={{ background: syndicateVisible ? '#0a0a0a' : '#E5E5E7' }}
                        />
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    {newUsername !== (athleteIdentity?.username || '') && (
                      <button
                        onClick={handleUpdateUsername}
                        className="w-full py-3 rounded-xl text-sm tracking-[0.08em] transition-all active:scale-[0.98]"
                        style={{
                          background: 'rgba(152,171,143,0.15)',
                          border: '0.5px solid rgba(152,171,143,0.4)',
                          color: '#98AB8F',
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: 500
                        }}
                      >
                        Update Username Globally
                      </button>
                    )}
                    <GoldButton onClick={handleSaveProfile} className="w-full flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </GoldButton>
                  </div>
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