import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import GoldButton from '@/components/ui/GoldButton';
import VoidCard from '@/components/ui/VoidCard';
import { base44 } from '@/api/base44Client';

const MUSCLE_DATA = {
  'Bench Press': { primary: ['Chest'], secondary: ['Front Deltoids', 'Triceps'] },
  'Squat': { primary: ['Quads'], secondary: ['Glutes', 'Hamstrings', 'Core'] },
  'Deadlift': { primary: ['Back', 'Hamstrings'], secondary: ['Glutes', 'Core', 'Forearms'] },
  'Shoulder Press': { primary: ['Shoulders'], secondary: ['Triceps', 'Core'] },
  'Barbell Row': { primary: ['Back'], secondary: ['Biceps', 'Rear Deltoids'] },
  'Pull-ups': { primary: ['Back'], secondary: ['Biceps', 'Core'] },
  'Dumbbell Curl': { primary: ['Biceps'], secondary: ['Forearms'] },
  'Tricep Pushdown': { primary: ['Triceps'], secondary: ['Forearms'] },
  'Leg Press': { primary: ['Quads'], secondary: ['Glutes', 'Hamstrings'] },
  'Lat Pulldown': { primary: ['Back'], secondary: ['Biceps'] },
  'Incline Dumbbell Press': { primary: ['Upper Chest'], secondary: ['Front Deltoids', 'Triceps'] },
  'Romanian Deadlift': { primary: ['Hamstrings'], secondary: ['Glutes', 'Lower Back'] },
  'Plank': { primary: ['Core'], secondary: ['Shoulders', 'Glutes'] },
  'Cable Fly': { primary: ['Chest'], secondary: ['Front Deltoids'] },
  'Hip Thrust': { primary: ['Glutes'], secondary: ['Hamstrings', 'Core'] },
};

export default function WorkoutSummary({ summary, onDone }) {
  const { routineName, duration, totalVolume, exercises } = summary;
  const [photos, setPhotos] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  const primaryMuscles = new Set();
  const secondaryMuscles = new Set();
  exercises.forEach(ex => {
    const data = MUSCLE_DATA[ex.exercise_name] || { primary: [ex.muscle_group || 'General'], secondary: [] };
    data.primary.forEach(m => primaryMuscles.add(m));
    data.secondary.forEach(m => secondaryMuscles.add(m));
  });
  [...primaryMuscles].forEach(m => secondaryMuscles.delete(m));

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    // Show local previews immediately
    const previews = files.map(f => URL.createObjectURL(f));
    setPhotos(prev => [...prev, ...previews]);
    setPhotoFiles(prev => [...prev, ...files]);
  };

  const handleRemovePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFinish = async (skipShare = false) => {
    setPosting(true);
    try {
      // Upload pending files now
      const uploadedUrls = [];
      for (const file of photoFiles) {
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(result.file_url);
      }
      // Get user data
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({});
      const profile = profiles[0];
      
      // Get athlete identity
      const identities = await base44.entities.AthleteIdentity.filter({ created_by: user.email });
      let athleteIdentity = identities[0];
      // Replace blob URLs with real upload URLs
      const finalPhotos = uploadedUrls.length > 0 ? uploadedUrls : photos;

      // Only post to community if sharing is enabled (syndicate_visible not explicitly false) and not skipped
      const sharingEnabled = !skipShare && (athleteIdentity?.syndicate_visible !== false);

      if (sharingEnabled) {
      // Create post in PerformanceFeed
      const exercisesList = exercises
        .filter(ex => ex.sets.some(s => s.completed))
        .map(ex => ex.exercise_name)
        .slice(0, 3)
        .join(', ');
      
      const newPost = await base44.entities.PerformanceFeed.create({
        athlete_id: athleteIdentity?.id || user.id,
        athlete_name: athleteIdentity?.username || user.full_name || user.email?.split('@')[0],
        athlete_avatar: athleteIdentity?.avatar_url || profile?.avatar_url || '',
        post_type: 'workout',
        title: routineName || 'Workout Complete',
        workout_name: routineName,
        volume_kg: totalVolume,
        duration_minutes: duration,
        notes: `${exercisesList}${exercises.length > 3 ? ` + ${exercises.length - 3} more` : ''}`,
        voltage_count: 0,
        voltage_by: [],
        photos: finalPhotos,
        comment_count: 0,
        is_hidden: false,
        report_count: 0,
        reported_by: [],
      });

      // Run content moderation on each uploaded photo
      if (finalPhotos.length > 0) {
        for (const photoUrl of finalPhotos) {
          const result = await base44.functions.invoke('moderateContent', {
            post_id: newPost.id,
            image_url: photoUrl,
          });
          if (result?.data?.approved === false) {
            toast('Content does not meet Syndicate standards. Please maintain professional performance imagery.', {
              style: { background: 'rgba(12,12,12,0.97)', border: '0.5px solid rgba(212,175,55,0.4)', color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif' },
              duration: 6000,
            });
            break;
          }
        }
      }
      
      // Update last_active for athlete
      if (athleteIdentity) {
        await base44.entities.AthleteIdentity.update(athleteIdentity.id, {
          last_active: new Date().toISOString(),
        });
      }
      // Media Mirror: copy workout photos to ProgressPhotoVault
      if (finalPhotos.length > 0) {
        const today2 = new Date().toISOString().split('T')[0];
        for (const url of finalPhotos) {
          await base44.entities.ProgressPhoto.create({
            date: today2,
            photo_url: url,
            pose_type: 'front',
            notes: `${routineName || 'Workout'} · Auto-mirrored`,
          });
        }
      }
      } // end if (sharingEnabled)
    } catch (error) {
      console.error('Failed to post to community:', error);
    }
    setPosting(false);
    onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: '#080808' }}
    >
      <div className="p-5 pt-16 pb-32">
        {/* Trophy header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-24 h-24 flex items-center justify-center mx-auto mb-5 relative"
            >
            {/* Wing left */}
            <motion.div
              initial={{ opacity: 0, x: 8, rotate: 20 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute"
              style={{ left: -2, top: 8 }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M12 12 Q6 8 2 10 Q5 6 12 8" fill="rgba(212,175,55,0.55)" />
                <path d="M12 12 Q5 12 1 15 Q4 11 12 12" fill="rgba(212,175,55,0.35)" />
                <path d="M12 12 Q6 16 3 20 Q6 15 12 14" fill="rgba(212,175,55,0.2)" />
              </svg>
            </motion.div>
            {/* Wing right (mirrored) */}
            <motion.div
              initial={{ opacity: 0, x: -8, rotate: -20 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute"
              style={{ right: -2, top: 8, transform: 'scaleX(-1)' }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M12 12 Q6 8 2 10 Q5 6 12 8" fill="rgba(212,175,55,0.55)" />
                <path d="M12 12 Q5 12 1 15 Q4 11 12 12" fill="rgba(212,175,55,0.35)" />
                <path d="M12 12 Q6 16 3 20 Q6 15 12 14" fill="rgba(212,175,55,0.2)" />
              </svg>
            </motion.div>
            {/* Center orb */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1, stiffness: 300, damping: 20 }}
              className="w-14 h-14 rounded-full bg-[#D4AF37]/15 flex items-center justify-center relative z-10"
              style={{ border: '1px solid rgba(212,175,55,0.4)', boxShadow: '0 0 24px rgba(212,175,55,0.25)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="rgba(212,175,55,0.2)" />
              </svg>
            </motion.div>
          </motion.div>
          <h1
            className="text-2xl tracking-[0.4em]"
            style={{
              fontFamily: 'Montserrat, sans-serif', fontWeight: 400,
              background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            COMPLETE
          </h1>
          <p className="text-white/40 text-sm mt-2">{routineName}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <VoidCard>
            <p className="text-white/35 text-[10px] uppercase tracking-wider">Duration</p>
            <p className="text-[#D4AF37] text-2xl mt-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {duration}m
            </p>
          </VoidCard>
          <VoidCard>
            <p className="text-white/35 text-[10px] uppercase tracking-wider">Total Volume</p>
            <p className="text-[#D4AF37] text-2xl mt-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {totalVolume.toLocaleString()}
            </p>
            <p className="text-white/25 text-xs">kg lifted</p>
          </VoidCard>
        </div>

        {/* Exercise breakdown */}
        <div className="space-y-2 mb-5">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">Exercise Breakdown</h3>
          {exercises.map((ex, i) => {
            const done = ex.sets.filter(s => s.completed);
            if (done.length === 0) return null;
            const vol = done.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
            const topSet = [...done].sort((a, b) => (b.weight * b.reps) - (a.weight * a.reps))[0];
            return (
              <VoidCard key={i}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {ex.exercise_name}
                    </p>
                    <p className="text-white/35 text-xs mt-0.5">{done.length} sets completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#D4AF37] text-sm">{vol.toLocaleString()} kg</p>
                    <p className="text-white/25 text-xs">volume</p>
                  </div>
                </div>
                {topSet && topSet.weight > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#D4AF37]/70" />
                    <span className="text-white/50 text-xs">
                      Top set: {topSet.weight}kg × {topSet.reps} reps
                    </span>
                  </div>
                )}
              </VoidCard>
            );
          })}
        </div>

        {/* Muscle analytics */}
        <VoidCard className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-white text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Muscles Trained
            </h3>
          </div>
          {primaryMuscles.size > 0 && (
            <div className="mb-3">
              <p className="text-[9px] uppercase tracking-widest text-[#D4AF37]/50 mb-2">Primary</p>
              <div className="flex flex-wrap gap-2">
                {[...primaryMuscles].map(m => (
                  <span
                    key={m}
                    className="px-3 py-1 rounded-full text-[#D4AF37] text-xs border border-[#D4AF37]/20"
                    style={{ background: 'rgba(212,175,55,0.12)' }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
          {secondaryMuscles.size > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/25 mb-2">Secondary</p>
              <div className="flex flex-wrap gap-2">
                {[...secondaryMuscles].map(m => (
                  <span key={m} className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-xs">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </VoidCard>

        {/* Photo Upload */}
        <VoidCard className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Add Photos (Optional)
            </h3>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(212,175,55,0.1)', border: '0.5px solid rgba(212,175,55,0.3)' }}>
                <Camera className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-[#D4AF37] text-xs">{uploading ? 'Uploading...' : 'Add Photo'}</span>
              </div>
            </label>
          </div>
          
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {photos.length === 0 && (
            <p className="text-white/40 text-xs text-center py-4">Share your progress with the community</p>
          )}
        </VoidCard>

        <GoldButton onClick={() => handleFinish(false)} disabled={posting} className="w-full py-4">
          {posting ? 'Posting...' : 'Finish & Share'}
        </GoldButton>
        <button
          onClick={() => handleFinish(true)}
          disabled={posting}
          className="w-full mt-3 py-3 text-sm tracking-[0.1em]"
          style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}
        >
          Skip & Finish (don't share)
        </button>
      </div>
    </motion.div>
  );
}