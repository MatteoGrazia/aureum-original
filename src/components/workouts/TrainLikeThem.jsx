import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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

function ArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="14" y1="9" x2="4" y2="9" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
      <polyline points="8,5 4,9 8,13" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="4" y1="9" x2="14" y2="9" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
      <polyline points="10,5 14,9 10,13" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export default function TrainLikeThem({ onAdopt, exercises = [] }) {
  const [selected, setSelected] = useState(null);
  const [adopting, setAdopting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  // Build a name->image_url map from the exercises prop
  const exerciseImageMap = React.useMemo(() => {
    const map = {};
    exercises.forEach(ex => {
      if (ex.name && ex.image_url) map[ex.name] = ex.image_url;
    });
    return map;
  }, [exercises]);

  const scrollTo = (idx) => {
    if (!scrollRef.current) return;
    const clamped = Math.max(0, Math.min(idx, ICONS.length - 1));
    setActiveIndex(clamped);
    const cardWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({ left: clamped * cardWidth, behavior: 'smooth' });
  };

  const openDossier = (icon) => {
    setSelected(icon);
    document.documentElement.style.setProperty('--hide-nav', 'none');
  };

  const closeDossier = () => {
    setSelected(null);
    document.documentElement.style.setProperty('--hide-nav', 'block');
  };

  const handleAdopt = async (icon) => {
    setAdopting(true);
    try {
      const targetMuscles = [...new Set(icon.focus)];
      const routineExercises = icon.exercises.map(ex => ({
        exercise_name: ex.exercise_name,
        exercise_id: '',
        muscle_group: icon.focus[0],
        sets: ex.sets,
        reps: ex.reps,
      }));

      const routine = await base44.entities.Routine.create({
        name: `${icon.name} — ${icon.split}`,
        description: `Heritage routine from ${icon.name} (${icon.era})`,
        exercises: routineExercises,
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

      closeDossier();
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
        <p
          className="text-base uppercase tracking-[0.3em] mb-1"
          style={{ fontFamily: 'Montserrat, sans-serif', color: '#D4AF37', fontWeight: 500 }}
        >
          Train Like Them
        </p>
        <p className="text-white/35 text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
          Step into the iron footsteps of the Syndicate's founding icons.
        </p>
      </div>

      {/* Carousel wrapper — card is self-contained, arrows/dots overlaid inside */}
      <div className="relative" style={{ marginLeft: -20, marginRight: -20 }}>
        {/* Snap scroll container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            gap: 0,
          }}
          onScroll={(e) => {
            const idx = Math.round(e.target.scrollLeft / e.target.clientWidth);
            setActiveIndex(idx);
          }}
        >
          {ICONS.map((icon, i) => (
            <motion.button
              key={icon.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => openDossier(icon)}
              className="flex-shrink-0 relative overflow-hidden active:scale-[0.97] transition-transform"
              style={{
                scrollSnapAlign: 'start',
                width: '100vw',
                height: 320,
              }}
            >
              {/* Full bleed image — cover so no black bars */}
              <img
                src={icon.photo}
                alt={icon.name}
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
              {/* Side vignettes to hide any edge artifacts */}
              <div className="absolute inset-y-0 left-0 w-6 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(8,8,8,0.6), transparent)' }} />
              <div className="absolute inset-y-0 right-0 w-6 pointer-events-none" style={{ background: 'linear-gradient(270deg, rgba(8,8,8,0.6), transparent)' }} />
              {/* Bottom gradient */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(8,8,8,0.98) 100%)' }} />
              {/* Era badge */}
              <div
                className="absolute top-3 right-4 px-2 py-1 rounded-lg text-[9px] uppercase tracking-widest"
                style={{ background: 'rgba(212,175,55,0.15)', border: '0.5px solid rgba(212,175,55,0.35)', color: '#D4AF37', fontFamily: 'Montserrat' }}
              >
                {icon.era}
              </div>
              {/* Bottom info */}
              <div className="absolute bottom-14 left-5 right-5 text-left">
                <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: '#D4AF37', fontFamily: 'Montserrat' }}>
                  {icon.split}
                </p>
                <p className="text-xl mb-3" style={{ color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', fontWeight: 400, letterSpacing: '0.05em' }}>
                  {icon.name}
                </p>
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
              {/* Dots + arrows — overlaid at bottom of card */}
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
                <div style={{ pointerEvents: 'all' }} onClick={e => { e.stopPropagation(); scrollTo(activeIndex - 1); }}>
                  <div style={{ opacity: activeIndex === 0 ? 0.2 : 1 }}><ArrowLeft /></div>
                </div>
                <div className="flex gap-1.5">
                  {ICONS.map((_, di) => (
                    <div
                      key={di}
                      className="rounded-full transition-all duration-200"
                      style={{
                        width: di === activeIndex ? 16 : 4,
                        height: 4,
                        background: di === activeIndex ? '#D4AF37' : 'rgba(212,175,55,0.3)',
                      }}
                    />
                  ))}
                </div>
                <div style={{ pointerEvents: 'all' }} onClick={e => { e.stopPropagation(); scrollTo(activeIndex + 1); }}>
                  <div style={{ opacity: activeIndex === ICONS.length - 1 ? 0.2 : 1 }}><ArrowRight /></div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Dossier Overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[200] overflow-y-auto"
            style={{ background: 'rgba(4,4,4,0.99)' }}
          >
            {/* Hero photo — full bleed, cover, no black bg */}
            <div className="relative flex-shrink-0" style={{ height: '45vh' }}>
              <img
                src={selected.photo}
                alt={selected.name}
                className="w-full h-full"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(4,4,4,0.1) 0%, rgba(4,4,4,1) 100%)' }}
              />
              <button
                onClick={closeDossier}
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

            {/* Muscle Focus */}
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

            {/* Exercise List with images */}
            <div className="px-5 pb-6">
              <p className="text-[9px] uppercase tracking-[0.3em] mb-3" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat' }}>
                The Protocol
              </p>
              <div className="space-y-2">
                {selected.exercises.map((ex, i) => {
                  const imgUrl = exerciseImageMap[ex.exercise_name];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(212,175,55,0.1)' }}
                    >
                      {/* Exercise image thumbnail */}
                      <div
                        className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
                        style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(212,175,55,0.15)' }}
                      >
                        {imgUrl ? (
                          <img src={imgUrl} alt={ex.exercise_name} className="w-full h-full object-cover" />
                        ) : (
                          <span style={{ color: '#D4AF37', fontFamily: 'Montserrat', fontSize: 13 }}>{i + 1}</span>
                        )}
                      </div>
                      <p className="flex-1 text-sm" style={{ color: '#E5E5E7', fontFamily: 'Montserrat', fontWeight: 300 }}>
                        {ex.exercise_name}
                      </p>
                      <span className="text-xs flex-shrink-0" style={{ color: '#D4AF37', fontFamily: 'Montserrat' }}>
                        {ex.sets} × {ex.reps}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Adopt Button */}
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
                className="w-full py-4 rounded-2xl"
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
                {adopting ? 'ACQUIRING...' : 'ADOPT ROUTINE'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}