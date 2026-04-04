import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ChevronRight } from 'lucide-react';
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

const MUSCLE_COLORS = {
  chest: '#BDB5D5', back: '#BDB5D5', shoulders: '#D4AF37', biceps: '#D4AF37',
  triceps: '#FFDAB9', legs: '#98AB8F', core: '#E5E5E7', glutes: '#98AB8F', forearms: '#FFDAB9',
};

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
      <div className="mb-5">
        <h2
          className="text-2xl tracking-[0.35em] mb-1"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 700,
            color: '#D4AF37',
            letterSpacing: '0.35em',
          }}
        >
          TRAIN LIKE THEM
        </h2>
        <p
          className="text-xs leading-relaxed"
          style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', fontWeight: 300, opacity: 0.65 }}
        >
          Step into the iron footsteps of the Syndicate's founding icons.
        </p>
      </div>

      {/* Cards grid — horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
        {ICONS.map((icon, i) => (
          <motion.button
            key={icon.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setSelected(icon)}
            className="flex-shrink-0 relative rounded-2xl overflow-hidden active:scale-95 transition-transform"
            style={{
              width: 148,
              height: 200,
              background: 'rgba(255,255,255,0.03)',
              border: '0.5px solid rgba(212,175,55,0.25)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <img
              src={icon.photo}
              alt={icon.name}
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{ filter: 'grayscale(20%) brightness(0.75)', mixBlendMode: 'luminosity' }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, transparent 35%, rgba(8,8,8,0.95) 100%)' }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
              <p className="text-[9px] uppercase tracking-[0.2em] mb-0.5" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif' }}>
                {icon.split}
              </p>
              <p className="text-xs font-medium leading-tight" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif' }}>
                {icon.name.split(' ')[0]}
                {'\n'}
                <span style={{ opacity: 0.6 }}>{icon.name.split(' ').slice(1).join(' ')}</span>
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <ChevronRight className="w-3 h-3" style={{ color: 'rgba(212,175,55,0.6)' }} />
                <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(212,175,55,0.6)', fontFamily: 'Montserrat' }}>
                  View Dossier
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Dossier Overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ background: 'rgba(4,4,4,0.92)', backdropFilter: 'blur(20px)' }}
          >
            {/* Hero photo */}
            <div className="relative flex-shrink-0" style={{ height: '38vh' }}>
              <img
                src={selected.photo}
                alt={selected.name}
                className="w-full h-full object-cover object-top"
                style={{ filter: 'grayscale(30%) brightness(0.65)' }}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(8,8,8,0.3) 0%, rgba(4,4,4,0.98) 100%)' }}
              />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-12 right-5 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-[10px] uppercase tracking-[0.35em] mb-1" style={{ color: '#D4AF37', fontFamily: 'Montserrat' }}>
                  {selected.era}
                </p>
                <h2
                  className="text-3xl mb-1"
                  style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}
                >
                  {selected.name}
                </h2>
                <p className="text-sm" style={{ color: 'rgba(212,175,55,0.8)', fontFamily: 'Montserrat', fontWeight: 300 }}>
                  {selected.split}
                </p>
              </div>
            </div>

            {/* Muscle Focus Tags */}
            <div className="px-5 pt-4 pb-3 flex-shrink-0">
              <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat' }}>
                Anatomical Focus
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.focus.map(m => (
                  <span
                    key={m}
                    className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider"
                    style={{
                      background: 'rgba(189,181,213,0.1)',
                      border: '0.5px solid rgba(189,181,213,0.35)',
                      color: '#BDB5D5',
                      fontFamily: 'Montserrat',
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto px-5 pb-32">
              <p className="text-[9px] uppercase tracking-[0.3em] mb-3" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat' }}>
                The Protocol
              </p>
              <div className="space-y-2">
                {selected.exercises.map((ex, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '0.5px solid rgba(212,175,55,0.12)',
                    }}
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
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-xs" style={{ color: '#D4AF37', fontFamily: 'Montserrat' }}>
                        {ex.sets} × {ex.reps}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Adopt Button */}
            <div
              className="absolute bottom-0 left-0 right-0 px-5 pb-10 pt-4"
              style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(4,4,4,0.98) 40%)' }}
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