import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

// ── Activity level configs ────────────────────────────────────────────────────
const ACTIVITY_LEVELS = [
  { value: 'sedentary',   label: 'Sedentary',         desc: 'Little or no exercise, desk job',     multiplier: 1.2 },
  { value: 'light',       label: 'Lightly Active',    desc: '1–3 days exercise / week',            multiplier: 1.375 },
  { value: 'moderate',    label: 'Moderately Active', desc: '3–5 days exercise / week',            multiplier: 1.55 },
  { value: 'active',      label: 'Very Active',       desc: '6–7 days hard exercise / week',       multiplier: 1.725 },
  { value: 'very_active', label: 'Extra Active',      desc: 'Athlete / physical job',              multiplier: 1.9 },
];

// Goal images from user's uploaded files
const GOALS = [
  {
    value: 'lose',
    label: 'Fat Loss',
    desc: 'Burn fat, lean out',
    adj: -500,
    img: 'https://media.base44.com/images/public/698347d058d3014d6271ccff/2bafcd604_7.png',
  },
  {
    value: 'maintain',
    label: 'Maintenance',
    desc: 'Stay balanced & healthy',
    adj: 0,
    img: 'https://media.base44.com/images/public/698347d058d3014d6271ccff/a3b835d5d_9.png',
  },
  {
    value: 'gain',
    label: 'Muscle Gain',
    desc: 'Build strength & size',
    adj: 300,
    img: 'https://media.base44.com/images/public/698347d058d3014d6271ccff/48b7374e3_8.png',
  },
];

// Mifflin-St Jeor TDEE
function calcTDEE({ gender, age, heightCm, weightKg, activityMultiplier }) {
  const bmr = gender === 'female'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
    : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  return Math.round(bmr * activityMultiplier);
}

// Gold progress bar
function ProgressBar({ step, total }) {
  const pct = (step / total) * 100;
  return (
    <div className="w-full h-px rounded-full mb-8" style={{ background: 'rgba(212,175,55,0.15)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(90deg, #9C7E46, #D4AF37)' }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}

// Glass input — matches app VoidCard style
function GoldInput({ label, type = 'text', value, onChange, placeholder, min, max }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
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
          background: 'rgba(255,255,255,0.05)',
          border: '0.5px solid rgba(212,175,55,0.2)',
          fontFamily: 'Montserrat, sans-serif',
        }}
      />
    </div>
  );
}

// Shared modal shell — matches app glass-card aesthetic
const ModalShell = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.25 }}
    className="fixed inset-0 z-[100] flex items-end justify-center"
    style={{ background: 'rgba(8,8,8,0.82)' }}
  >
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md rounded-t-3xl px-6 pt-8 pb-12"
      style={{
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid rgba(212,175,55,0.2)',
        borderBottom: 'none',
        maxHeight: '92vh',
        overflowY: 'auto',
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  </motion.div>
);

export default function OnboardingModal({ onComplete }) {
  const queryClient = useQueryClient();
  // step -1 = splash, 0–3 = form steps
  const [step, setStep] = useState(-1);
  const [data, setData] = useState({ gender: '', age: '', heightCm: '', weightKg: '', activity: '', goal: '' });
  const [tdee, setTdee] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const canProceedStep0 = data.gender && data.age && data.heightCm && data.weightKg;
  const canProceedStep1 = !!data.activity;
  const canProceedStep2 = !!data.goal;

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

  // ── Splash screen ──────────────────────────────────────────────────────────
  if (step === -1) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
        style={{ backgroundColor: '#080808' }}
      >
        {/* Subtle ambient glow — same as app bg */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />

        <div className="relative z-10 flex flex-col items-center px-8 text-center">
          {/* Feather logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698347d058d3014d6271ccff/f764a7a57_2.png"
              alt="Aureum Feather"
              className="w-28 h-28 mx-auto mb-8"
              style={{ filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.45))' }}
            />
          </motion.div>

          {/* AUREUM wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698347d058d3014d6271ccff/161ef6a6d_Untitleddesign1.png"
              alt="AUREUM"
              className="w-56 h-auto mx-auto mb-4"
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-[11px] uppercase tracking-[0.35em] mb-16"
            style={{ color: 'rgba(212,175,55,0.45)', fontFamily: 'Montserrat, sans-serif' }}
          >
            Premium Fitness
          </motion.p>

          {/* Thin gold divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6, ease: 'easeOut' }}
            className="w-24 h-px mb-12"
            style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }}
          />

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setStep(0)}
            whileTap={{ scale: 0.96 }}
            className="px-10 py-4 rounded-2xl flex items-center gap-3 text-sm"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #9C7E46)',
              color: '#080808',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.14em',
              boxShadow: '0 0 40px rgba(212,175,55,0.25)',
            }}
          >
            GET STARTED <ChevronRight className="w-4 h-4" />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="mt-6 text-[10px] uppercase tracking-[0.2em]"
            style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'Montserrat, sans-serif' }}
          >
            Takes less than a minute
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // ── Form steps ─────────────────────────────────────────────────────────────
  return (
    <ModalShell>
      {/* Logo strip */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698347d058d3014d6271ccff/f764a7a57_2.png"
          alt="Aureum"
          className="w-7 h-7"
          style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.4))' }}
        />
        <span className="text-sm tracking-[0.3em]" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
          AUREUM
        </span>
      </div>

      <ProgressBar step={step + 1} total={4} />

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
              <p className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}>Step 1 of 3</p>
              <h2 className="text-xl text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>The Basics</h2>
              <p className="text-white/30 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>We'll use this to calculate your exact calorie needs.</p>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: 'rgba(212,175,55,0.7)', fontFamily: 'Montserrat, sans-serif' }}>Sex</label>
              <div className="grid grid-cols-2 gap-3">
                {['male', 'female'].map(g => (
                  <button
                    key={g}
                    onClick={() => set('gender', g)}
                    className="py-3 rounded-xl capitalize text-sm transition-all"
                    style={{
                      background: data.gender === g ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `0.5px solid ${data.gender === g ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      color: data.gender === g ? '#D4AF37' : 'rgba(255,255,255,0.35)',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <GoldInput label="Age" type="number" value={data.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 28" min="13" max="100" />
            <GoldInput label="Height (cm)" type="number" value={data.heightCm} onChange={e => set('heightCm', e.target.value)} placeholder="e.g. 178" min="100" max="250" />
            <GoldInput label="Weight (kg)" type="number" value={data.weightKg} onChange={e => set('weightKg', e.target.value)} placeholder="e.g. 80" min="30" max="300" />

            <button
              onClick={() => setStep(1)}
              disabled={!canProceedStep0}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all"
              style={{
                background: canProceedStep0 ? 'linear-gradient(135deg, #D4AF37, #9C7E46)' : 'rgba(212,175,55,0.12)',
                color: canProceedStep0 ? '#080808' : 'rgba(212,175,55,0.35)',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                letterSpacing: '0.08em',
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
              <p className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}>Step 2 of 3</p>
              <h2 className="text-xl text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>Activity Level</h2>
              <p className="text-white/30 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>How active are you on a typical week?</p>
            </div>

            <div className="space-y-2">
              {ACTIVITY_LEVELS.map(level => {
                const isSelected = data.activity === level.value;
                return (
                  <button
                    key={level.value}
                    onClick={() => set('activity', level.value)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-left"
                    style={{
                      background: isSelected ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                      border: `0.5px solid ${isSelected ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: isSelected ? '#D4AF37' : 'rgba(255,255,255,0.65)', fontFamily: 'Montserrat, sans-serif' }}>
                        {level.label}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'Montserrat, sans-serif' }}>
                        {level.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#D4AF37' }}>
                        <Check className="w-3 h-3 text-[#080808]" strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-2xl text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}>
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="flex-[2] py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all"
                style={{
                  background: canProceedStep1 ? 'linear-gradient(135deg, #D4AF37, #9C7E46)' : 'rgba(212,175,55,0.12)',
                  color: canProceedStep1 ? '#080808' : 'rgba(212,175,55,0.35)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
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
              <p className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}>Step 3 of 3</p>
              <h2 className="text-xl text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>Your Focus</h2>
              <p className="text-white/30 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>What is your primary fitness goal?</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {GOALS.map(goal => {
                const isSelected = data.goal === goal.value;
                return (
                  <button
                    key={goal.value}
                    onClick={() => set('goal', goal.value)}
                    className="flex flex-col items-center gap-2 px-2 py-4 rounded-2xl transition-all"
                    style={{
                      background: isSelected ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                      border: `0.5px solid ${isSelected ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    {/* Goal image — white background to show the illustration */}
                    <div
                      className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center"
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.06)',
                        border: `0.5px solid ${isSelected ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        transition: 'background 0.2s ease, border-color 0.2s ease',
                        willChange: 'auto',
                      }}
                    >
                      <img
                        src={goal.img}
                        alt={goal.label}
                        className="w-16 h-16 object-contain"
                        style={{ opacity: isSelected ? 1 : 0.2 }}
                      />
                    </div>
                    <p
                      className="text-[11px] text-center leading-tight"
                      style={{
                        color: isSelected ? '#D4AF37' : 'rgba(255,255,255,0.45)',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: isSelected ? 500 : 300,
                      }}
                    >
                      {goal.label}
                    </p>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#D4AF37' }}>
                        <Check className="w-2.5 h-2.5 text-[#080808]" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-2xl text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}>
                Back
              </button>
              <button
                onClick={goToStep3}
                disabled={!canProceedStep2}
                className="flex-[2] py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all"
                style={{
                  background: canProceedStep2 ? 'linear-gradient(135deg, #D4AF37, #9C7E46)' : 'rgba(212,175,55,0.12)',
                  color: canProceedStep2 ? '#080808' : 'rgba(212,175,55,0.35)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
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
              <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}>Your Daily Target</p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-6xl tracking-tight text-white"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 200 }}
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
              style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(212,175,55,0.18)' }}
            >
              {[
                { label: 'Goal', value: GOALS.find(g => g.value === data.goal)?.label },
                { label: 'Activity', value: ACTIVITY_LEVELS.find(a => a.value === data.activity)?.label },
                { label: 'Weight', value: `${data.weightKg} kg` },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}>{row.label}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Montserrat, sans-serif' }}>{row.value}</span>
                </div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs"
              style={{ color: 'rgba(255,255,255,0.22)', fontFamily: 'Montserrat, sans-serif' }}
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
                fontWeight: 700,
                letterSpacing: '0.14em',
                boxShadow: '0 0 30px rgba(212,175,55,0.2)',
              }}
            >
              {saving ? 'Saving...' : 'ENTER AUREUM'}
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </ModalShell>
  );
}