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
    bio: 'Starting in a small Austrian village with nothing but a vision, Arnold revolutionized bodybuilding by combining raw powerlifting strength with a sculptor\'s eye for symmetry. From 7-time Mr. Olympia to global icon, his legacy is built on "The Pump" - the belief that blood flow and mental connection are the keys to ascending beyond physical limits.',
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
    bio: 'Representing the new guard of the Syndicate, "Cbum" reclaimed the Golden Era silhouette for the modern age. Battling through health adversity and the pressure of a digital era, he dominated the Classic Physique stage with a focus on vacuum poses and leg density. His journey is one of "Intentionality" - proving that a legendary physique is built rep-by-rep with a calm, stoic discipline.',
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
    era: '8x Mr. Olympia',
    focus: ['back', 'legs', 'shoulders'],
    photo: BASE + 'e59d17c1d_5.png',
    bio: 'A former police officer from Texas, Ronnie redefined what was humanly possible in terms of muscle mass. Known for moving "Lightweight" (800lb squats and deadlifts), his journey was one of sheer, brutal force. He climbed to a record-breaking 8 Mr. Olympia titles by outworking every human on the planet, leaving a legacy that remains the high-water mark for the Juggernaut archetype.',
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
    bio: 'The personification of resilience, Jay Cutler spent years in the shadow of Ronnie Coleman before finally stomping his way to the throne. His journey is a masterclass in business-like consistency and FST-7 volume. Jay didn\'t just train - he engineered his body with a 24/7 dedication to nutrition and recovery, proving that persistence is the fastest way to the top.',
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
    era: '3x Mr. Olympia',
    focus: ['back', 'biceps'],
    photo: BASE + '7cf33f361_4.png',
    bio: 'While others chased mass, Frank Zane chased perfection. A math and science teacher by trade, he used an analytical mind to build the most aesthetic physique in history. His journey proved that a smaller, more symmetric man could defeat giants. He is the patron saint of the Artist - focusing on the lines, the vacuum, and the mind-muscle connection over raw poundage.',
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
    era: '6x Mr. Olympia',
    focus: ['chest', 'back', 'legs'],
    photo: BASE + 'dd524978b_2.png',
    bio: 'Emerging from a grim industrial background in England, Dorian Yates changed the sport forever with High-Intensity Training (HIT). He operated in "The Shadow," staying away from cameras only to emerge once a year looking like a marble statue. His journey is about "Quality over Quantity" - short, brutal sessions that take the muscle to absolute failure.',
    exercises: [
      { exercise_name: 'Incline Bench Press', sets: 2, reps: 'To Failure' },
      { exercise_name: 'Machine Row', sets: 1, reps: 'To Failure' },
      { exercise_name: 'Hack Squat', sets: 1, reps: 'To Failure' },
    ],
  },
  {
    name: 'Sergio Oliva',
    split: 'The Myth Volume',
    era: '3x Mr. Olympia',
    focus: ['chest', 'back', 'shoulders'],
    photo: BASE + '8dfd4885e_9.png',
    bio: 'A defecting weightlifter from Cuba, Sergio possessed a physique so gifted it was deemed "The Myth." He was the only man to ever beat Arnold in his prime. He famously worked 12-hour shifts in a foundry before hitting the gym for high-volume supersets, embodying the Worker-Warrior spirit of the Syndicate.',
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
    era: '2x Mr. Olympia',
    focus: ['chest', 'back'],
    photo: BASE + '476e4095f_10.png',
    bio: 'A world-class boxer and powerlifter before he ever touched a bodybuilding stage, Franco was the definition of Dense Power. As Arnold\'s greatest training partner, he proved that being shorter didn\'t mean being smaller. His journey is one of functional dominance - lifting cars and bursting hot water bottles with his breath - reminding us that true Syndicate members are as strong as they look.',
    exercises: [
      { exercise_name: 'Bench Press', sets: 3, reps: '15-4' },
      { exercise_name: 'Cable Fly', sets: 3, reps: '20' },
      { exercise_name: 'Deadlift', sets: 5, reps: '6-2' },
    ],
  },
  {
    name: 'Mike Mentzer',
    split: 'Heavy Duty',
    era: 'Mr. Universe Champion',
    focus: ['legs', 'chest'],
    photo: BASE + 'b7c0b29f2_8.png',
    bio: 'The most controversial and intellectual figure in bodybuilding history, Mentzer viewed the gym as a laboratory for logic. His journey was a crusade against "More is Better." He advocated for Heavy Duty training - extreme weights with massive recovery periods. His legacy is for the Thinking Athlete - those who believe that the mind is the primary tool for physical growth.',
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
    photo: BASE + 'd0ba2e3b7_7.png',
    bio: 'Tom Platz didn\'t just train legs; he turned them into a religion. Despite being told he had "poor genetics" for squats, he obsessively mastered the movement until he had the most legendary lower body in history. His journey is about "The Dark Place" - the mental ability to push through 20+ reps of heavy squats when the body is screaming for mercy.',
    exercises: [
      { exercise_name: 'Squat', sets: 10, reps: '5-20' },
      { exercise_name: 'Hack Squat', sets: 5, reps: '10-15' },
      { exercise_name: 'Leg Extension', sets: 6, reps: '10-15' },
      { exercise_name: 'Leg Curl', sets: 6, reps: '10-15' },
    ],
  },
  // ── Female Icons ────────────────────────────────────────────────────────────
  {
    name: 'Rachel McLish',
    split: 'The First Queen',
    era: 'Ms. Olympia 1980-1982',
    focus: ['chest', 'biceps', 'core'],
    focusColor: '#BDB5D5',
    photo: BASE + 'd1becbd92_13.png',
    bio: 'The inaugural Ms. Olympia who defined the "Aesthetic" standard before mass became the primary goal. Her journey was about grace and variety, proving that women could be muscular and elegant simultaneously. She famously used a "non-routine" style to keep the body in a constant state of adaptation.',
    exercises: [
      { exercise_name: 'Cable Fly', sets: 3, reps: '15' },
      { exercise_name: 'Incline Dumbbell Curl', sets: 3, reps: '12' },
      { exercise_name: 'Hanging Leg Raise', sets: 4, reps: '25' },
      { exercise_name: 'Dumbbell Chest Press', sets: 3, reps: '12' },
    ],
  },
  {
    name: 'Cory Everson',
    split: 'The Six-Time Standard',
    era: '6x Ms. Olympia',
    focus: ['legs', 'chest', 'back', 'shoulders'],
    focusColor: '#BDB5D5',
    photo: BASE + 'c8f06f192_12.png',
    bio: 'A high-level track athlete who brought "Functional Mass" to the stage, Cory never lost a contest she entered. Her six consecutive titles were built on a foundation of heavy basic lifts and explosive movements, bridging the gap between raw athleticism and high-end bodybuilding.',
    exercises: [
      { exercise_name: 'Squat', sets: 8, reps: '15-8' },
      { exercise_name: 'Bench Press', sets: 5, reps: '8-12' },
      { exercise_name: 'Lat Pulldown', sets: 4, reps: '10' },
      { exercise_name: 'Barbell Overhead Press', sets: 4, reps: '10' },
    ],
  },
  {
    name: 'Lenda Murray',
    split: 'The Eight-Time Legend',
    era: '8x Ms. Olympia',
    focus: ['legs', 'back', 'glutes'],
    focusColor: '#BDB5D5',
    photo: BASE + '521f1b4c3_14.png',
    bio: 'The most dominant force of the 90s, Lenda redefined the female silhouette with 8 Ms. Olympia titles. Her journey is a masterclass in "Lower Body Logic" and longevity, focusing on intelligent loading to maintain an elite, dense physique for over two decades.',
    exercises: [
      { exercise_name: 'Squat', sets: 4, reps: '10' },
      { exercise_name: 'Walking Lunge', sets: 4, reps: '12' },
      { exercise_name: 'Romanian Deadlift', sets: 4, reps: '10' },
      { exercise_name: 'T-Bar Row', sets: 4, reps: '10' },
    ],
  },
  {
    name: 'Iris Kyle',
    split: 'The G.O.A.T.',
    era: '10x Ms. Olympia',
    focus: ['legs', 'back', 'shoulders', 'core'],
    focusColor: '#BDB5D5',
    photo: BASE + '4c8bfec9a_11.png',
    bio: 'The most successful professional bodybuilder in history with 10 Ms. Olympia titles. Her journey is the definition of the "Unyielding Spirit." Moving from basketball to the iron, she built a physique so conditioned and separated it remained untouched for a decade.',
    exercises: [
      { exercise_name: 'Leg Press', sets: 4, reps: '15' },
      { exercise_name: 'Seated Cable Row', sets: 4, reps: '12' },
      { exercise_name: 'Machine Shoulder Press', sets: 4, reps: '10' },
      { exercise_name: 'Leg Extension', sets: 4, reps: '20' },
    ],
  },
  {
    name: 'Dana Linn Bailey',
    split: 'The Modern Pioneer',
    era: '1st Women\'s Physique Olympia',
    focus: ['shoulders', 'back', 'legs'],
    focusColor: '#BDB5D5',
    photo: BASE + 'a07b479f1_15.png',
    bio: 'The first-ever Women\'s Physique Olympia champion, DLB bridged the gap between old-school training and the modern era. Her "Flag Nor Fail" mentality is the heartbeat of the Syndicate, combining powerlifting and hypertrophy for a truly functional frame.',
    exercises: [
      { exercise_name: 'Cable Lateral Raise', sets: 4, reps: '20' },
      { exercise_name: 'Barbell Row', sets: 4, reps: '8-12' },
      { exercise_name: 'Lateral Raise', sets: 5, reps: '15' },
      { exercise_name: 'Walking Lunge', sets: 4, reps: '20' },
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
  const [bioExpanded, setBioExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [adopting, setAdopting] = useState(false);
  const [adoptedRoutineId, setAdoptedRoutineId] = useState(null);
  const [showAdoptSuccess, setShowAdoptSuccess] = useState(false);
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

  // Adopt: just save the routine, no navigation
  const scrollTo = (idx) => {
    if (!scrollRef.current) return;
    const clamped = Math.max(0, Math.min(idx, ICONS.length - 1));
    setActiveIndex(clamped);
    const cardWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({ left: clamped * cardWidth, behavior: 'smooth' });
  };

  const openDossier = (icon) => {
    setSelected(icon);
    setBioExpanded(false);
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

      await base44.entities.Routine.create({
        name: `${icon.name} - ${icon.split}`,
        description: `Heritage routine from ${icon.name} (${icon.era})`,
        exercises: routineExercises,
        target_muscles: targetMuscles,
      });

      queryClient.invalidateQueries(['routines']);
      setShowAdoptSuccess(true);
    } catch (e) {
      toast('Failed to adopt routine.', { icon: '✗' });
    }
    setAdopting(false);
  };

  return (
  <div style={{ paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 0px))' }}>
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

      {/* Carousel wrapper */}
      <div className="relative">
        {/* Snap scroll container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            gap: 12,
            paddingLeft: 4,
            paddingRight: 4,
            paddingBottom: 4,
            scrollBehavior: 'smooth',
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
              className="flex-shrink-0 relative rounded-2xl overflow-hidden active:scale-[0.97] transition-transform"
              style={{
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always',
                width: 'calc(100vw - 60px)',
                height: 300,
                border: '0.5px solid rgba(212,175,55,0.25)',
              }}
            >
              {/* Full image — cover, shifted down so face shows */}
              <img
                src={icon.photo}
                alt={icon.name}
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
              />
              {/* Bottom gradient */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(8,8,8,0.98) 100%)' }} />
              {/* Era badge */}
              <div
                className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[9px] uppercase tracking-widest"
                style={{ background: 'rgba(212,175,55,0.15)', border: '0.5px solid rgba(212,175,55,0.35)', color: '#D4AF37', fontFamily: 'Montserrat' }}
              >
                {icon.era}
              </div>
              {/* Bottom info */}
              <div className="absolute bottom-10 left-4 right-4 text-left">
                <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: '#D4AF37', fontFamily: 'Montserrat' }}>
                  {icon.split}
                </p>
                <p className="text-xl mb-2" style={{ color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', fontWeight: 400, letterSpacing: '0.05em' }}>
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
              {/* Dots + arrows — overlaid at bottom */}
              <div className="absolute bottom-2 left-0 right-0 flex items-center justify-between px-3 pointer-events-none">
                <div style={{ pointerEvents: 'all' }} onClick={e => { e.stopPropagation(); scrollTo(activeIndex - 1); }}>
                  <div style={{ opacity: activeIndex === 0 ? 0.2 : 1 }}><ArrowLeft /></div>
                </div>
                <div className="flex gap-1.5">
                  {ICONS.map((_, di) => (
                    <div
                      key={di}
                      className="rounded-full transition-all duration-200"
                      style={{
                        width: di === activeIndex ? 14 : 4,
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
                {selected.focus.map(m => {
                  const fc = selected.focusColor || '#BDB5D5';
                  const fcBg = fc === '#BDB5D5' ? 'rgba(189,181,213,0.1)' : 'rgba(212,175,55,0.1)';
                  const fcBorder = fc === '#BDB5D5' ? 'rgba(189,181,213,0.35)' : 'rgba(212,175,55,0.3)';
                  return (
                    <span
                      key={m}
                      className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider"
                      style={{ background: fcBg, border: `0.5px solid ${fcBorder}`, color: fc, fontFamily: 'Montserrat' }}
                    >
                      {m}
                    </span>
                  );
                })}
              </div>

              {/* Learn the Legacy — retractable bio */}
              {selected.bio && (
                <div className="mt-4">
                  <button
                    onClick={() => setBioExpanded(p => !p)}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: '#D4AF37', fontFamily: 'Montserrat', opacity: 0.75 }}
                  >
                    <span>{bioExpanded ? 'Close Legacy' : 'Learn the Legacy'}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: bioExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}>
                      <polyline points="2,4 6,8 10,4" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <AnimatePresence>
                    {bioExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p
                          className="mt-3 text-sm"
                          style={{
                            color: '#E5E5E7',
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 300,
                            lineHeight: 1.4,
                            background: 'rgba(255,255,255,0.04)',
                            border: '0.5px solid rgba(212,175,55,0.12)',
                            borderRadius: 12,
                            padding: '12px 14px',
                          }}
                        >
                          {selected.bio}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
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

            {/* Adopt Success Popup */}
            <AnimatePresence>
              {showAdoptSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[300] flex items-center justify-center px-6"
                  style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
                >
                  <motion.div
                    initial={{ scale: 0.85, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.85, y: 20 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    className="w-full max-w-sm rounded-3xl p-6 text-center"
                    style={{ background: 'rgba(14,12,6,0.98)', border: '0.5px solid rgba(212,175,55,0.4)', boxShadow: '0 0 60px rgba(212,175,55,0.15)' }}
                  >
                    <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: '#D4AF37', fontFamily: 'Montserrat' }}>Routine Acquired</p>
                    <p className="text-lg mb-1" style={{ color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{selected?.name}</p>
                    <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Montserrat' }}>Successfully added to your routines vault.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setShowAdoptSuccess(false); closeDossier(); }}
                        className="flex-1 py-3 rounded-2xl text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Montserrat' }}
                      >
                        Keep for Later
                      </button>
                      <button
                        onClick={() => { setShowAdoptSuccess(false); closeDossier(); window.location.href = '/Workouts'; }}
                        className="flex-1 py-3 rounded-2xl text-sm"
                        style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #BFA030 100%)', color: '#080808', fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                      >
                        Log Now
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}