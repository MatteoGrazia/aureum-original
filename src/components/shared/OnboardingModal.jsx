import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const TOTAL_STEPS = 4; // basics, activity, goal, result

// ── Activity level configs ────────────────────────────────────────────────────
const ACTIVITY_LEVELS = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    desc: 'Little or no exercise, desk job',
    multiplier: 1.2,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#BDB5D5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="8" r="3"/>
        <path d="M12 14 L16 18 L20 14"/>
        <path d="M16 18 L14 26 M16 18 L18 26"/>
        <path d="M11 22 L21 22"/>
      </svg>
    ),
  },
  {
    value: 'light',
    label: 'Lightly Active',
    desc: '1–3 days exercise / week',
    multiplier: 1.375,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#BDB5D5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="7" r="3"/>
        <path d="M13 12 Q16 16 19 12"/>
        <path d="M16 16 L15 24 M16 16 L17 24"/>
        <path d="M12 19 L20 19"/>
      </svg>
    ),
  },
  {
    value: 'moderate',
    label: 'Moderately Active',
    desc: '3–5 days exercise / week',
    multiplier: 1.55,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#BDB5D5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="7" r="3"/>
        <path d="M10 12 L16 10 L22 12"/>
        <path d="M16 10 L16 18"/>
        <path d="M16 18 L13 26 M16 18 L19 26"/>
      </svg>
    ),
  },
  {
    value: 'active',
    label: 'Very Active',
    desc: '6–7 days hard exercise / week',
    multiplier: 1.725,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#BDB5D5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="7" r="3"/>
        <path d="M8 14 Q14 10 18 10 Q22 10 24 14"/>
        <path d="M18 10 L17 18 L14 25"/>
        <path d="M17 18 L20 25"/>
      </svg>
    ),
  },
  {
    value: 'very_active',
    label: 'Extra Active',
    desc: 'Athlete / physical job',
    multiplier: 1.9,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#BDB5D5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="7" r="3"/>
        <path d="M8 12 L14 9 L20 9 L26 12"/>
        <path d="M20 9 L18 17 L15 25"/>
        <path d="M18 17 L21 24"/>
        <path d="M8 12 L12 17"/>
      </svg>
    ),
  },
];

const GOALS = [
  { value: 'lose', label: 'Fat Loss', emoji: '🔥', adj: -500 },
  { value: 'maintain', label: 'Maintenance', emoji: '⚖️', adj: 0 },
  { value: 'gain', label: 'Muscle Gain', emoji: '💪', adj: 300 },
];

// Mifflin-St Jeor TDEE
function calcTDEE({ gender, age, heightCm, weightKg, activityMultiplier }) {
  const bmr = gender === 'female'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
    : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  return Math.round(bmr * activityMultiplier);
}

// Gold progress bar at top
function ProgressBar({ step }) {
  const pct = (step / TOTAL_STEPS) * 100;
  return (
    <div className="w-full h-0.5 rounded-full mb-8" style={{ background: 'rgba(212,175,55,0.15)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(90deg, #9C7E46, #D4AF37)' }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}

// Mint-tinted labeled input
function MintInput({ label, type = 'text', value, onChange, placeholder, min, max }) {
  return (
    <div>
      <label
        className="block text-[10px] uppercase tracking-[0.22em] mb-2"
        style={{ color: '#B2D8D8', fontFamily: 'Montserrat, sans-serif' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full px-4 py-3 rounded-xl outline-none text-white text-sm"
        style={{
          background: 'rgba(178,216,216,0.07)',
          border: '0.5px solid rgba(178,216,216,0.35)',
          fontFamily: 'Montserrat, sans-serif',
        }}
      />
    </div>
  );
}

export default function OnboardingModal({ onComplete }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    gender: '',
    age: '',
    heightCm: '',
    weightKg: '',
    activity: '',
    goal: '',
  });
  const [tdee, setTdee] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const canProceedStep0 = data.gender && data.age && data.heightCm && data.weightKg;
  const canProceedStep1 = !!data.activity;
  const canProceedStep2 = !!data.goal;

  const goToStep1 = () => setStep(1);
  const goToStep2 = () => setStep(2);

  const goToStep3 = () => {
    const actLevel = ACTIVITY_LEVELS.find(a => a.value === data.activity);
    const goalAdj = GOALS.find(g => g.value === data.goal)?.adj || 0;
    const rawTdee = calcTDEE({
      gender: data.gender,
      age: parseInt(data.age),
      heightCm: parseFloat(data.heightCm),
      weightKg: parseFloat(data.weightKg),
      activityMultiplier: actLevel?.multiplier || 1.55,
    });
    setTdee(rawTdee + goalAdj);
    setStep(3);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const profiles = await base44.entities.UserProfile.filter({});
      const profileData = {
        gender: data.gender,
        birth_date: `${new Date().getFullYear() - parseInt(data.age)}-01-01`,
        height: parseFloat(data.heightCm),
        current_weight: parseFloat(data.weightKg),
        goal_weight: parseFloat(data.weightKg),
        activity_level: data.activity,
        goal: data.goal,
        maintenance_calories: tdee,
        daily_step_goal: 10000,
        water_goal: 2.5,
        permissions_requested: true,
      };
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, profileData);
      } else {
        await base44.entities.UserProfile.create(profileData);
      }
      queryClient.invalidateQueries(['userProfile']);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ background: 'rgba(8,8,8,0.92)' }}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="w-full max-w-md rounded-t-3xl px-6 pt-8 pb-12"
        style={{
          backdropFilter: 'blur(25px) saturate(180%)',
          WebkitBackdropFilter: 'blur(25px) saturate(180%)',
          background: 'rgba(16,12,4,0.96)',
          border: '1px solid rgba(212,175,55,0.35)',
          borderBottom: 'none',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <h1
            className="text-2xl tracking-[0.35em]"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, color: '#D4AF37' }}
          >
            AUREUM
          </h1>
          <p className="text-[9px] tracking-[0.25em] mt-1" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Montserrat, sans-serif' }}>
            PREMIUM FITNESS
          </p>
        </div>

        <ProgressBar step={step + 1} />

        <AnimatePresence mode="wait">
          {/* ── Step 0: The Basics ── */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(178,216,216,0.55)', fontFamily: 'Montserrat, sans-serif' }}>Step 1 of 3</p>
                <h2 className="text-xl text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>The Basics</h2>
                <p className="text-white/30 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>We'll use this to calculate your exact calorie needs.</p>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: '#B2D8D8', fontFamily: 'Montserrat, sans-serif' }}>Sex</label>
                <div className="grid grid-cols-2 gap-3">
                  {['male', 'female'].map(g => (
                    <button
                      key={g}
                      onClick={() => set('gender', g)}
                      className="py-3 rounded-xl capitalize text-sm transition-all"
                      style={{
                        background: data.gender === g ? 'rgba(178,216,216,0.15)' : 'rgba(178,216,216,0.05)',
                        border: `0.5px solid ${data.gender === g ? 'rgba(178,216,216,0.6)' : 'rgba(178,216,216,0.2)'}`,
                        color: data.gender === g ? '#B2D8D8' : 'rgba(255,255,255,0.4)',
                        fontFamily: 'Montserrat, sans-serif',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <MintInput label="Age" type="number" value={data.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 28" min="13" max="100" />
              <MintInput label="Height (cm)" type="number" value={data.heightCm} onChange={e => set('heightCm', e.target.value)} placeholder="e.g. 178" min="100" max="250" />
              <MintInput label="Weight (kg)" type="number" value={data.weightKg} onChange={e => set('weightKg', e.target.value)} placeholder="e.g. 80" min="30" max="300" />

              <button
                onClick={goToStep1}
                disabled={!canProceedStep0}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all"
                style={{
                  background: canProceedStep0 ? 'linear-gradient(135deg, #D4AF37, #9C7E46)' : 'rgba(212,175,55,0.15)',
                  color: canProceedStep0 ? '#080808' : 'rgba(212,175,55,0.4)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                }}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ── Step 1: Activity Level ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(189,181,213,0.55)', fontFamily: 'Montserrat, sans-serif' }}>Step 2 of 3</p>
                <h2 className="text-xl text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>Activity Level</h2>
                <p className="text-white/30 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>How active are you on a typical week?</p>
              </div>

              <div className="space-y-2">
                {ACTIVITY_LEVELS.map(level => (
                  <button
                    key={level.value}
                    onClick={() => set('activity', level.value)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all"
                    style={{
                      background: data.activity === level.value ? 'rgba(189,181,213,0.12)' : 'rgba(189,181,213,0.04)',
                      border: `0.5px solid ${data.activity === level.value ? 'rgba(189,181,213,0.55)' : 'rgba(189,181,213,0.15)'}`,
                    }}
                  >
                    <div className="flex-shrink-0">{level.icon}</div>
                    <div className="text-left flex-1">
                      <p className="text-sm" style={{ color: data.activity === level.value ? '#BDB5D5' : 'rgba(255,255,255,0.7)', fontFamily: 'Montserrat, sans-serif' }}>
                        {level.label}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}>
                        {level.desc}
                      </p>
                    </div>
                    {data.activity === level.value && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#BDB5D5' }}>
                        <Check className="w-3 h-3 text-[#080808]" strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-2xl text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
                  Back
                </button>
                <button
                  onClick={goToStep2}
                  disabled={!canProceedStep1}
                  className="flex-[2] py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all"
                  style={{
                    background: canProceedStep1 ? 'linear-gradient(135deg, #D4AF37, #9C7E46)' : 'rgba(212,175,55,0.15)',
                    color: canProceedStep1 ? '#080808' : 'rgba(212,175,55,0.4)',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Goal ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(212,175,55,0.55)', fontFamily: 'Montserrat, sans-serif' }}>Step 3 of 3</p>
                <h2 className="text-xl text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>Your Focus</h2>
                <p className="text-white/30 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>What is your primary fitness goal?</p>
              </div>

              <div className="space-y-3">
                {GOALS.map(goal => (
                  <button
                    key={goal.value}
                    onClick={() => set('goal', goal.value)}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all"
                    style={{
                      background: data.goal === goal.value ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.04)',
                      border: `0.5px solid ${data.goal === goal.value ? 'rgba(212,175,55,0.6)' : 'rgba(212,175,55,0.15)'}`,
                    }}
                  >
                    <span className="text-2xl">{goal.emoji}</span>
                    <span
                      className="text-base flex-1 text-left"
                      style={{
                        color: data.goal === goal.value ? '#D4AF37' : 'rgba(255,255,255,0.55)',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: data.goal === goal.value ? 500 : 300,
                      }}
                    >
                      {goal.label}
                    </span>
                    {data.goal === goal.value && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#D4AF37' }}>
                        <Check className="w-3 h-3 text-[#080808]" strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-2xl text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
                  Back
                </button>
                <button
                  onClick={goToStep3}
                  disabled={!canProceedStep2}
                  className="flex-[2] py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all"
                  style={{
                    background: canProceedStep2 ? 'linear-gradient(135deg, #D4AF37, #9C7E46)' : 'rgba(212,175,55,0.15)',
                    color: canProceedStep2 ? '#080808' : 'rgba(212,175,55,0.4)',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  Calculate <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Result ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="text-center space-y-6"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: 'rgba(212,175,55,0.55)', fontFamily: 'Montserrat, sans-serif' }}>Your Daily Target</p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-6xl font-light tracking-tight"
                  style={{ color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif', fontWeight: 200 }}
                >
                  {tdee}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-[11px] uppercase tracking-[0.2em] mt-2"
                  style={{ color: 'rgba(212,175,55,0.6)', fontFamily: 'Montserrat, sans-serif' }}
                >
                  kcal / day
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl p-4 text-left space-y-2"
                style={{ background: 'rgba(212,175,55,0.06)', border: '0.5px solid rgba(212,175,55,0.2)' }}
              >
                {[
                  { label: 'Goal', value: GOALS.find(g => g.value === data.goal)?.label },
                  { label: 'Activity', value: ACTIVITY_LEVELS.find(a => a.value === data.activity)?.label },
                  { label: 'Weight', value: `${data.weightKg} kg` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Montserrat, sans-serif' }}>{row.label}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Montserrat, sans-serif' }}>{row.value}</span>
                  </div>
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Montserrat, sans-serif' }}
              >
                Your calorie goal will adapt as you track your weight and activity over time.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                onClick={handleFinish}
                disabled={saving}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl text-sm transition-all"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #9C7E46)',
                  color: '#080808',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                }}
              >
                {saving ? 'Saving...' : 'ENTER AUREUM'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}