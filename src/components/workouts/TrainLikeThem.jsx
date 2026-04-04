import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const BASE = 'https://media.base44.com/images/public/698347d058d3014d6271ccff/';

const ICONS = [
  {
    name: 'Arnold Schwarzenegger',
    split: 'The Golden Six',
    era: '7× Mr. Olympia',
    focus: ['chest', 'back', 'shoulders', 'biceps', 'core', 'legs'],
    photo: BASE + '236289ad6_1.png',
    exercises: [
      { exercise_name: 'Squat', sets: 4, reps: '10' },
      { exercise_name: 'Bench Press', sets: 3, reps: '10' },
      { exercise_name: 'Pull-ups', sets: 3, reps: 'AMRAP' },
      { exercise_name: 'Barbell Overhead Press', sets: 4, reps: '10' },
      { exercise_name: 'Barbell Curl', sets: 3, reps: '10' },
      { exercise_name: 'Plank', sets: 3, reps: '20' },
    ],
  },
  {
    name: 'Chris Bumstead',
    split: 'Modern Classic',
    era: '5× Classic Physique Olympia',
    focus: ['chest', 'biceps', 'legs'],
    photo: BASE + '429680946_6.png',
    exercises: [
      { exercise_name: 'Incline Dumbbell Press', sets: 5, reps: '15-10' },
      { exercise_name: 'Bench Press', sets: 4, reps: '12-8' },
      { exercise_name: 'Cable Fly', sets: 3, reps: '15-12' },
      { exercise_name: 'Barbell Curl', sets: 3, reps: '15' },
      { exercise_name: 'Leg Extension', sets: 3, reps: '15' },
    ],
  },
  {
    name: 'Ronnie Coleman',
    split: "King's Power",
    era: '8× Mr. Olympia',
    focus: ['back', 'legs', 'shoulders'],
    photo: BASE + 'e59d17c1d_5.png',
    exercises: [
      { exercise_name: 'Deadlift', sets: 4, reps: '6-12' },
      { exercise_name: 'Barbell Row', sets: 3, reps: '10-12' },
      { exercise_name: 'T-Bar Row', sets: 3, reps: '10-12' },
      { exercise_name: 'Barbell Overhead Press', sets: 4, reps: '10-12' },
      { exercise_name: 'Squat', sets: 5, reps: '2-12' },
    ],
  },
  {
    name: 'Jay Cutler',
    split: 'FST-7 Engine',
    era: '4× Mr. Olympia',
    focus: ['chest', 'shoulders'],
    photo: BASE + '7e547372c_3.png',
    exercises: [
      { exercise_name: 'Incline Bench Press', sets: 5, reps: '12' },
      { exercise_name: 'Bench Press', sets: 3, reps: '10' },
      { exercise_name: 'Incline Dumbbell Press', sets: 3, reps: '10' },
      { exercise_name: 'Cable Fly', sets: 7, reps: '12' },
    ],
  },
  {
    name: 'Frank Zane',
    split: 'Aesthetic Pull',
    era: '3× Mr. Olympia',
    focus: ['back', 'biceps'],
    photo: BASE + 'd0ba2e3b7_7.png',
    exercises: [
      { exercise_name: 'Deadlift', sets: 6, reps: '15-8' },
      { exercise_name: 'T-Bar Row', sets: 3, reps: '12-8' },
      { exercise_name: 'Single Arm Dumbbell Row', sets: 3, reps: '8-10' },
      { exercise_name: 'Concentration Curl', sets: 3, reps: '8-10' },
    ],
  },
  {
    name: 'Dorian Yates',
    split: 'Blood & Guts',
    era: '6× Mr. Olympia',
    focus: ['chest', 'back', 'legs'],
    photo: BASE + 'b7c0b29f2_8.png',
    exercises: [
      { exercise_name: 'Incline Bench Press', sets: 2, reps: 'To Failure' },
      { exercise_name: 'Machine Row', sets: 1, reps: 'To Failure' },
      { exercise_name: 'Hack Squat', sets: 1, reps: 'To Failure' },
    ],
  },
  {
    name: 'Sergio Oliva',
    split: 'The Myth Volume',
    era: '3× Mr. Olympia',
    focus: ['chest', 'back', 'shoulders'],
    photo: BASE + '7cf33f361_4.png',
    exercises: [
      { exercise_name: 'Bench Press', sets: 5, reps: '8' },
      { exercise_name: 'Pull-ups', sets: 5, reps: '15' },
      { exercise_name: 'Cable Fly', sets: 5, reps: '15' },
      { exercise_name: 'Chest Dip', sets: 5, reps: 'AMRAP' },
      { exercise_name: 'Barbell Overhead Press', sets: 5, reps: '5' },
    ],
  },
  {
    name: 'Franco Columbu',
    split: 'Sardinian Strength',
    era: '2× Mr. Olympia',
    focus: ['chest', 'back'],
    photo: BASE + 'dd524978b_2.png',
    exercises: [
      { exercise_name: 'Bench Press', sets: 3, reps: '15-4' },
      { exercise_name: 'Cable Fly', sets: 3, reps: '20' },
      { exercise_name: 'Pullover (Dumbbell)', sets: 4, reps: '15' },
      { exercise_name: 'Deadlift', sets: 5, reps: '6-2' },
    ],
  },
  {
    name: 'Mike Mentzer',
    split: 'Heavy Duty',
    era: 'Mr. Universe Champion',
    focus: ['legs', 'chest'],
    photo: BASE + '8dfd4885e_9.png',
    exercises: [
      { exercise_name: 'Leg Extension', sets: 1, reps: '12-20 to failure' },
      { exercise_name: 'Leg Press', sets: 1, reps: '12-20 to failure' },
      { exercise_name: 'Cable Fly', sets: 1, reps: '12-20 to failure' },
      { exercise_name: 'Incline Bench Press', sets: 1, reps: '12-20 to failure' },
    ],
  },
  {
    name: 'Tom Platz',
    split: 'Quadfather Legs',
    era: 'IFBB Pro Legend',
    focus: ['legs'],
    photo: BASE + '476e4095f_10.png',
    exercises: [
      { exercise_name: 'Squat', sets: 10, reps: '5-20' },
      { exercise_name: 'Hack Squat', sets: 5, reps: '10-15' },
      { exercise_name: 'Leg Extension', sets: 6, reps: '10-15' },
      { exercise_name: 'Leg Curl', sets: 6, reps: '10-15' },
    ],
  },
];

export default function TrainLikeThem({ onAdopt }) {
  const [selected, setSelected] = useState(null);
  const [adopting, setAdopting] = useState(false);
  const queryClient = useQueryClient();

  const handleAdopt = async (icon) => {
    setAdopting(true);
    try {
      const targetMuscles = [...new Set(icon.focus)];
      const exercises = icon.exercises.map(ex => ({
        exercise_name: ex.exercise_name,
        exercise_id: '',
        muscle_group: icon.focus[0],
        sets: ex.sets,
        reps: ex.reps,
      }));

      const routine = await base44.entities.Routine.create({
        name: `${icon.name} — ${icon.split}`,
        description: `Heritage routine from ${icon.name} (${icon.era})`,
        exercises,
        target_muscles: targetMuscles,
      });

      queryClient.invalidateQueries(['routines']);

      toast('Heritage Acquired. Routine added to your Vault.', {
        style: {
          background: 'rgba(12,12,12,0.97)',
          border: '0.5px solid rgba(212,175,55,0.5)',
          color: '#D4AF37',
          fontFamily: 'Montserrat, sans-serif',
        },
        icon: '⚡',
        duration: 3000,
      });

      setSelected(null);
      onAdopt?.(routine, icon);
    } catch (e) {
      toast('Failed to adopt routine.', { icon: '✗' });
    }
    setAdopting(false);
  };

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Train Like Them
        </p>
        <p className="text-white/35 text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
          Step into the iron footsteps of the Syndicate's founding icons.
        </p>
      </div>

      {/* Snap carousel — one card at a time */}
      <div
        className="flex overflow-x-auto gap-4"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 4,
          marginLeft: -20,
          marginRight: -20,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        {ICONS.map((icon, i) => (
          <motion.button
            key={icon.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelected(icon)}
            className="flex-shrink-0 relative rounded-2xl overflow-hidden active:scale-[0.97] transition-transform"
            style={{
              scrollSnapAlign: 'center',
              width: 'calc(100vw - 40px)',
              height: 280,
              background: 'rgba(255,255,255,0.03)',
              border: '0.5px solid rgba(212,175,55,0.25)',
            }}
          >
            <img
              src={icon.photo}
              alt={icon.name}
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{ filter: 'brightness(0.7)' }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, transparent 20%, rgba(8,8,8,0.97) 100%)' }}
            />
            {/* Top-right era badge */}
            <div
              className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[9px] uppercase tracking-widest"
              style={{ background: 'rgba(212,175,55,0.15)', border: '0.5px solid rgba(212,175,55,0.35)', color: '#D4AF37', fontFamily: 'Montserrat' }}
            >
              {icon.era}
            </div>
            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
              <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: '#D4AF37', fontFamily: 'Montserrat' }}>
                {icon.split}
              </p>
              <p className="text-xl mb-3" style={{ color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', fontWeight: 400, letterSpacing: '0.05em' }}>
                {icon.name}
              </p>
              {/* Preview exercises */}
              <div className="flex flex-wrap gap-1.5">
                {icon.exercises.slice(0, 3).map((ex, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontFamily: 'Montserrat' }}
                  >
                    {ex.exercise_name}
                  </span>
                ))}
                {icon.exercises.length > 3 && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.1)', color: 'rgba(212,175,55,0.6)', fontFamily: 'Montserrat' }}>
                    +{icon.exercises.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {ICONS.map((_, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{ width: 4, height: 4, background: 'rgba(212,175,55,0.25)' }}
          />
        ))}
      </div>

      {/* Dossier Overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col overflow-y-auto"
            style={{ background: 'rgba(4,4,4,0.96)', backdropFilter: 'blur(20px)' }}
          >
            {/* Hero photo */}
            <div className="relative flex-shrink-0" style={{ height: '40vh' }}>
              <img
                src={selected.photo}
                alt={selected.name}
                className="w-full h-full object-cover object-top"
                style={{ filter: 'brightness(0.6)' }}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(4,4,4,0.2) 0%, rgba(4,4,4,1) 100%)' }}
              />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-12 right-5 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.15)' }}
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-[9px] uppercase tracking-[0.35em] mb-1" style={{ color: '#D4AF37', fontFamily: 'Montserrat' }}>
                  {selected.era}
                </p>
                <h2 className="text-3xl mb-0.5" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                  {selected.name}
                </h2>
                <p className="text-sm" style={{ color: 'rgba(212,175,55,0.75)', fontFamily: 'Montserrat', fontWeight: 300 }}>
                  {selected.split}
                </p>
              </div>
            </div>

            {/* Muscle Focus Tags */}
            <div className="px-5 pt-5 pb-3">
              <p className="text-[9px] uppercase tracking-[0.3em] mb-2.5" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat' }}>
                Anatomical Focus
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.focus.map(m => (
                  <span
                    key={m}
                    className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider"
                    style={{ background: 'rgba(189,181,213,0.1)', border: '0.5px solid rgba(189,181,213,0.35)', color: '#BDB5D5', fontFamily: 'Montserrat' }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="px-5 pb-6">
              <p className="text-[9px] uppercase tracking-[0.3em] mb-3" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat' }}>
                The Protocol
              </p>
              <div className="space-y-2">
                {selected.exercises.map((ex, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(212,175,55,0.1)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] flex-shrink-0"
                        style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', fontFamily: 'Montserrat' }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm" style={{ color: '#E5E5E7', fontFamily: 'Montserrat', fontWeight: 300 }}>
                        {ex.exercise_name}
                      </p>
                    </div>
                    <span className="text-xs ml-3 flex-shrink-0" style={{ color: '#D4AF37', fontFamily: 'Montserrat' }}>
                      {ex.sets} × {ex.reps}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Adopt Button — fixed above nav */}
            <div
              className="sticky bottom-0 px-5 pt-4"
              style={{
                paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 16px))',
                background: 'linear-gradient(180deg, transparent 0%, rgba(4,4,4,1) 30%)',
              }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAdopt(selected)}
                disabled={adopting}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-3"
                style={{
                  background: adopting ? 'rgba(212,175,55,0.4)' : 'linear-gradient(135deg, #D4AF37 0%, #BFA030 100%)',
                  color: '#080808',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  fontSize: 13,
                  letterSpacing: '0.2em',
                  boxShadow: adopting ? 'none' : '0 0 30px rgba(212,175,55,0.35)',
                }}
              >
                <Zap className="w-4 h-4" />
                {adopting ? 'ACQUIRING...' : 'ADOPT ROUTINE'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}