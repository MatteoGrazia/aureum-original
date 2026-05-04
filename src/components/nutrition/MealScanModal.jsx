import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Camera, ScanLine, MessageSquare, ChevronRight, Send,
  AlertTriangle, RefreshCw, Search, Minus, Plus, Check,
  AlertCircle, Info, Lock
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/shared/ThemeContext';
import { checkDailyLimit, incrementUsage, timeUntilMidnight } from '@/lib/dailyLimitUtils';

const PEACH = '#FFDAB9';
const PEACH_DIM = 'rgba(255,218,185,0.12)';
const PEACH_BORDER = 'rgba(255,218,185,0.28)';
const GOLD = '#D4AF37';

// ─── Tutorial slides data ─────────────────────────────────────────────────────
const TUTORIAL_SLIDES = [
  {
    icon: Camera,
    title: 'Photograph Your Meal',
    desc: 'Take a clear photo from directly above your plate. Include the whole meal — sides, sauces, and drinks all count.',
    chips: [
      { label: 'Good lighting — natural or bright overhead light' },
      { label: 'Top-down angle — shoot from directly above' },
      { label: 'Full plate — include sides, sauces and drinks' },
    ],
  },
  {
    icon: MessageSquare,
    title: 'Describe the Details',
    desc: 'Add any context the camera cannot see. Cooking method, restaurant name, extra sauce, or portion size. Every detail improves accuracy.',
    chips: [
      ['Large portion', 'Cooked in butter', 'Restaurant meal'],
      ['Extra sauce', 'Homemade', 'Half portion'],
    ],
  },
  {
    icon: ScanLine,
    title: 'Log in One Tap',
    desc: 'Aureum breaks down every ingredient with calories, protein, carbs and fat. Review, adjust if needed, and log in one tap.',
    mockItems: [
      { name: 'Chicken Breast', cal: 165, p: 31, c: 0, f: 3.6 },
      { name: 'White Rice', cal: 260, p: 5.4, c: 56, f: 0.6 },
      { name: 'Broccoli', cal: 34, p: 2.8, c: 7, f: 0.4 },
    ],
  },
];

// ─── PORTION STOPS ────────────────────────────────────────────────────────────
const PORTION_STOPS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const PORTION_LABELS = ['½x', '¾x', '1x', '1¼x', '1½x', '2x'];

// ─── Cycling loading messages ─────────────────────────────────────────────────
const LOADING_MESSAGES = [
  'Identifying ingredients...',
  'Estimating portions...',
  'Calculating macros...',
  'Almost done...',
];

function useLoadingMessage() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % LOADING_MESSAGES.length), 2000);
    return () => clearInterval(t);
  }, []);
  return LOADING_MESSAGES[idx];
}

// ─── Chip component ───────────────────────────────────────────────────────────
function Chip({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase tracking-wider"
      style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}`, color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>
      {children}
    </span>
  );
}

// ─── Confidence badge ─────────────────────────────────────────────────────────
function ConfidenceBadge({ confidence }) {
  const map = {
    high: { dot: '#22c55e', label: 'High confidence' },
    medium: { dot: '#f59e0b', label: 'Review portions' },
    low: { dot: '#ef4444', label: 'Estimate only' },
  };
  const { dot, label } = map[confidence] || map.medium;
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px]"
      style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Montserrat' }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
      {label}
    </span>
  );
}

// ─── Macro pill ───────────────────────────────────────────────────────────────
function MacroPill({ label, value, color }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded"
      style={{ background: 'rgba(255,255,255,0.06)', color, fontFamily: 'Montserrat' }}>
      {label} {value}g
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MealScanModal({ isOpen, onClose, onFoodsSelected, selectedMeal, userSettings, onSettingsChanged }) {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState('tutorial'); // tutorial | capture | context | scanning | results | error
  const [tutorialPage, setTutorialPage] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null); // data URL
  const [capturedBase64, setCapturedBase64] = useState(null);
  const [userNote, setUserNote] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [portionIdx, setPortionIdx] = useState(2); // default 1x
  const [items, setItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const abortRef = useRef(null);
  const loadingMsg = useLoadingMessage();

  const bg = isDarkMode ? 'rgba(10,8,4,0.97)' : 'rgba(255,252,245,0.97)';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(29,29,31,0.45)';
  const cardBg = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDarkMode ? 'rgba(255,218,185,0.12)' : 'rgba(255,218,185,0.3)';

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep('tutorial');
      setTutorialPage(0);
      setCapturedImage(null);
      setCapturedBase64(null);
      setUserNote('');
      setScanResult(null);
      setPortionIdx(2);
      setItems([]);
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleImageFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setCapturedImage(dataUrl);
      // Extract base64 (strip prefix)
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      setCapturedBase64(base64);
      setStep('context');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyse = useCallback(async () => {
    setStep('scanning');
    setErrorMsg('');

    const controller = new AbortController();
    abortRef.current = controller;

    const timeout = setTimeout(() => {
      controller.abort();
      setErrorMsg('Taking longer than usual. Try again or log manually.');
      setStep('error');
    }, 15000);

    try {
      const response = await base44.functions.invoke('analyzeMealWithGemini', {
        imageBase64: capturedBase64,
        userNote: userNote.trim(),
      });

      clearTimeout(timeout);
      if (controller.signal.aborted) return;

      const data = response.data;
      if (!data || !data.items || data.items.length === 0) {
        setErrorMsg('We could not identify a meal. Try better lighting or a closer shot.');
        setStep('error');
        return;
      }

      setScanResult(data);
      setItems(data.items.map(item => ({ ...item, removed: false })));
      setPortionIdx(2);
      setStep('results');
      // Increment usage counter after successful analysis
      if (userSettings) {
        await incrementUsage(userSettings, 'ai_scan');
        if (onSettingsChanged) onSettingsChanged();
      }
    } catch (err) {
      clearTimeout(timeout);
      if (controller.signal.aborted) return;
      if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
        setErrorMsg('No connection. Try again when online.');
      } else {
        setErrorMsg('Something went wrong. Try again or log manually.');
      }
      setStep('error');
    }
  }, [capturedBase64, userNote]);

  const handleCancelScan = () => {
    abortRef.current?.abort();
    setStep('context');
  };

  // Computed totals from active items × portion multiplier
  const multiplier = PORTION_STOPS[portionIdx];
  const activeItems = items.filter(i => !i.removed);
  const total = activeItems.reduce((acc, item) => ({
    calories: acc.calories + (item.calories || 0),
    protein: acc.protein + (item.protein || 0),
    carbs: acc.carbs + (item.carbs || 0),
    fat: acc.fat + (item.fat || 0),
    fiber: acc.fiber + (item.fiber || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const adjustedTotal = {
    calories: Math.round(total.calories * multiplier),
    protein: Math.round(total.protein * multiplier * 10) / 10,
    carbs: Math.round(total.carbs * multiplier * 10) / 10,
    fat: Math.round(total.fat * multiplier * 10) / 10,
    fiber: Math.round(total.fiber * multiplier * 10) / 10,
  };

  const handleLogMeal = async () => {
    await base44.entities.FoodLog.create({
      food_name: scanResult?.meal_name || 'Scanned Meal',
      calories: adjustedTotal.calories,
      protein: adjustedTotal.protein,
      carbs: adjustedTotal.carbs,
      fat: adjustedTotal.fat,
      fiber: adjustedTotal.fiber,
      meal_type: selectedMeal,
      serving_size: 1,
      serving_unit: 'serving',
    });

    // Also call the parent callback with items list for display
    onFoodsSelected(activeItems.map(item => ({
      name: item.name,
      calories: Math.round((item.calories || 0) * multiplier),
      protein: Math.round((item.protein || 0) * multiplier * 10) / 10,
      carbs: Math.round((item.carbs || 0) * multiplier * 10) / 10,
      fat: Math.round((item.fat || 0) * multiplier * 10) / 10,
      fiber: Math.round((item.fiber || 0) * multiplier * 10) / 10,
      serving_size: 1,
      serving_unit: 'serving',
    })));
    onClose();
  };

  if (!isOpen) return null;

  const limit = checkDailyLimit(userSettings, 'ai_scan');
  const showCounter = !limit.allowed || limit.remaining <= 5;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: bg }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0">
        <button onClick={onClose}>
          <X className="w-5 h-5" style={{ color: textMuted }} />
        </button>
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: PEACH, fontFamily: 'Montserrat' }}>
          {step === 'context' ? 'Describe Your Meal'
            : step === 'scanning' ? 'Analysing…'
            : step === 'results' ? 'Review & Log'
            : step === 'error' ? 'Scan Failed'
            : 'AI Meal Scan'}
        </p>
        {showCounter && limit.allowed ? (
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat' }}>
            {limit.used}/30
          </p>
        ) : (
          <div className="w-5" />
        )}
      </div>

      {/* Blocked state */}
      {!limit.allowed && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.1)', border: '0.5px solid rgba(212,175,55,0.25)' }}>
            <Lock className="w-9 h-9" style={{ color: GOLD }} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-base mb-2" style={{ color: textPrimary, fontFamily: 'Montserrat' }}>Daily limit reached</p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: textMuted, fontFamily: 'Montserrat' }}>
              You have used all 30 AI scans for today. Your limit resets at midnight.
            </p>
            <p className="text-xs" style={{ color: 'rgba(212,175,55,0.7)', fontFamily: 'Montserrat' }}>
              Resets in {timeUntilMidnight()}
            </p>
          </div>
          <button onClick={onClose}
            className="w-full py-4 rounded-2xl text-sm uppercase tracking-[0.12em]"
            style={{ background: 'transparent', border: `0.5px solid ${PEACH_BORDER}`, color: PEACH, fontFamily: 'Montserrat' }}>
            Log Manually
          </button>
        </div>
      )}

      {/* ── TUTORIAL ── */}
      {limit.allowed && <AnimatePresence mode="wait">
        {step === 'tutorial' && (
          <TutorialStep
            key="tutorial"
            tutorialPage={tutorialPage}
            setTutorialPage={setTutorialPage}
            textPrimary={textPrimary}
            textMuted={textMuted}
            cardBg={cardBg}
            cardBorder={cardBorder}
            onStart={() => {
              setStep('capture');
              setTimeout(() => fileInputRef.current?.click(), 100);
            }}
          />
        )}

        {/* ── CAPTURE ── */}
        {step === 'capture' && (
          <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
            {/* Viewfinder */}
            <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl" style={{ border: '2px dashed rgba(212,175,55,0.5)' }} />
              <div className="flex flex-col items-center gap-3">
                <Camera className="w-16 h-16" style={{ color: 'rgba(212,175,55,0.4)' }} strokeWidth={1} />
                <p className="text-[10px] uppercase tracking-[0.25em] text-center" style={{ color: 'rgba(212,175,55,0.6)', fontFamily: 'Montserrat' }}>
                  Position your meal here
                </p>
                <p className="text-[10px] text-center" style={{ color: textMuted, fontFamily: 'Montserrat' }}>
                  Works best in good lighting
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="w-full flex items-center justify-between px-4 gap-4">
              <button onClick={() => galleryInputRef.current?.click()}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: cardBg, border: `0.5px solid ${cardBorder}` }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth={1.5} strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>

              <button onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'transparent', border: `2.5px solid ${GOLD}`, boxShadow: '0 0 20px rgba(212,175,55,0.25)' }}>
                <div className="w-14 h-14 rounded-full" style={{ background: `linear-gradient(135deg, ${PEACH}, #FFB888)` }} />
              </button>

              {/* Flash toggle placeholder */}
              <div className="w-14 h-14" />
            </div>
          </motion.div>
        )}

        {/* ── CONTEXT (photo confirmation + note) ── */}
        {step === 'context' && (
          <motion.div key="context" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden">
            {capturedImage && (
              <div className="relative mx-5 mb-4 rounded-2xl overflow-hidden flex-shrink-0"
                style={{ height: 200, border: `0.5px solid ${PEACH_BORDER}` }}>
                <img src={capturedImage} alt="meal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="absolute bottom-3 right-3">
                  <button onClick={() => { setCapturedImage(null); setCapturedBase64(null); setStep('capture'); setTimeout(() => fileInputRef.current?.click(), 100); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
                    style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.85)', fontFamily: 'Montserrat', backdropFilter: 'blur(8px)' }}>
                    <RefreshCw className="w-3 h-3" /> Retake
                  </button>
                </div>
              </div>
            )}

            <div className="px-5 flex-1 flex flex-col gap-3 pb-6">
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: textMuted, fontFamily: 'Montserrat' }}>
                Add context (optional)
              </p>
              <textarea
                value={userNote}
                onChange={e => setUserNote(e.target.value.slice(0, 200))}
                placeholder="e.g. large portion, cooked in butter, restaurant meal, extra sauce..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm resize-none"
                style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, color: textPrimary, fontFamily: 'Montserrat', lineHeight: 1.6 }}
              />
              <p className="text-right text-[10px]" style={{ color: textMuted, fontFamily: 'Montserrat' }}>{userNote.length}/200</p>

              <button onClick={handleAnalyse}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-[0.12em] mt-auto"
                style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, color: '#1D1D1F', fontFamily: 'Montserrat', fontWeight: 500 }}>
                <Send className="w-4 h-4" strokeWidth={2} />
                Analyse Meal
              </button>
            </div>
          </motion.div>
        )}

        {/* ── SCANNING (loading) ── */}
        {step === 'scanning' && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            {capturedImage && (
              <div className="w-full rounded-2xl overflow-hidden mb-2 flex-shrink-0"
                style={{ height: 150, border: `0.5px solid ${PEACH_BORDER}` }}>
                <img src={capturedImage} alt="meal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {/* Pulse ring */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, ${GOLD}33 0%, transparent 70%)`, border: `1.5px solid rgba(212,175,55,0.35)` }}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.3, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                className="absolute inset-2 rounded-full"
                style={{ border: `1.5px solid rgba(212,175,55,0.5)` }}
              />
              <ScanLine className="w-8 h-8" style={{ color: GOLD }} strokeWidth={1.5} />
            </div>

            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.p key={loadingMsg}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm mb-2" style={{ color: textPrimary, fontFamily: 'Montserrat' }}>
                  {loadingMsg}
                </motion.p>
              </AnimatePresence>
              <p className="text-[11px]" style={{ color: textMuted, fontFamily: 'Montserrat' }}>Usually takes 3 to 6 seconds</p>
            </div>

            <button onClick={handleCancelScan}
              className="mt-4 px-6 py-3 rounded-2xl text-sm uppercase tracking-[0.12em]"
              style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: textMuted, fontFamily: 'Montserrat' }}>
              Cancel
            </button>
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {step === 'results' && scanResult && (
          <ResultsStep
            key="results"
            scanResult={scanResult}
            capturedImage={capturedImage}
            items={items}
            setItems={setItems}
            portionIdx={portionIdx}
            setPortionIdx={setPortionIdx}
            multiplier={multiplier}
            adjustedTotal={adjustedTotal}
            selectedMeal={selectedMeal}
            onLog={handleLogMeal}
            onClose={onClose}
            textPrimary={textPrimary}
            textMuted={textMuted}
            cardBg={cardBg}
            cardBorder={cardBorder}
            bg={bg}
            isDarkMode={isDarkMode}
          />
        )}

        {/* ── ERROR ── */}
        {step === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)' }}>
              <AlertTriangle className="w-9 h-9 text-red-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-base mb-2" style={{ color: textPrimary, fontFamily: 'Montserrat' }}>{errorMsg}</p>
              <p className="text-xs" style={{ color: textMuted, fontFamily: 'Montserrat' }}>No data was saved.</p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <button onClick={() => { setStep('context'); }}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-[0.12em]"
                style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, color: '#1D1D1F', fontFamily: 'Montserrat', fontWeight: 500 }}>
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <button onClick={onClose}
                className="w-full py-4 rounded-2xl text-sm uppercase tracking-[0.12em]"
                style={{ background: 'rgba(255,255,255,0.04)', border: `0.5px solid ${PEACH_BORDER}`, color: PEACH, fontFamily: 'Montserrat' }}>
                <Search className="w-4 h-4 inline mr-2" />Log Manually
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>}

      {/* Hidden file inputs */}
      {limit.allowed && <>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleImageFile(e.target.files?.[0])} />
        <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageFile(e.target.files?.[0])} />
      </>}
    </motion.div>
  );
}

// ─── Tutorial Step ────────────────────────────────────────────────────────────
function TutorialStep({ tutorialPage, setTutorialPage, textPrimary, textMuted, cardBg, cardBorder, onStart }) {
  const slide = TUTORIAL_SLIDES[tutorialPage];
  const Icon = slide.icon;
  const isLast = tutorialPage === TUTORIAL_SLIDES.length - 1;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col px-6 pb-10 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div key={tutorialPage}
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center flex-shrink-0"
          style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}` }}>
          <Icon className="w-10 h-10" style={{ color: PEACH }} strokeWidth={1.5} />
        </motion.div>

        {/* Dot indicators */}
        <div className="flex gap-2">
          {TUTORIAL_SLIDES.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{ width: i === tutorialPage ? 20 : 6, height: 6, background: i === tutorialPage ? PEACH : 'rgba(255,218,185,0.25)' }} />
          ))}
        </div>

        <motion.h2 key={`t-${tutorialPage}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-2xl text-center" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: textPrimary }}>
          {slide.title}
        </motion.h2>

        <motion.p key={`d-${tutorialPage}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-sm text-center leading-relaxed" style={{ color: textMuted, fontFamily: 'Montserrat' }}>
          {slide.desc}
        </motion.p>

        {/* Screen 1 bullet list */}
        {tutorialPage === 0 && slide.chips && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="w-full flex flex-col gap-2.5">
            {slide.chips.map((c, i) => (
              <div key={c.label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}` }}>
                <span className="text-[8px] tracking-[0.3em] uppercase flex-shrink-0"
                  style={{ color: 'rgba(255,218,185,0.4)', fontFamily: 'Montserrat', minWidth: 16 }}>
                  0{i + 1}
                </span>
                <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(255,218,185,0.2)' }} />
                <span className="text-xs tracking-wider" style={{ color: PEACH, fontFamily: 'Montserrat' }}>
                  {c.label}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Screen 2 hint chips */}
        {tutorialPage === 1 && slide.chips && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-col gap-2 w-full">
            {slide.chips.map((row, ri) => (
              <div key={ri} className="flex gap-2 flex-wrap justify-center">
                {row.map(label => <Chip key={label}>{label}</Chip>)}
              </div>
            ))}
          </motion.div>
        )}

        {/* Screen 3 mock preview */}
        {tutorialPage === 2 && slide.mockItems && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="w-full rounded-2xl p-4 space-y-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,218,185,0.12)', backdropFilter: 'blur(12px)' }}>
            <p className="text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,218,185,0.4)', fontFamily: 'Montserrat' }}>Preview</p>
            {slide.mockItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,218,185,0.08)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Montserrat' }}>{item.name}</p>
                  <div className="flex gap-2 mt-0.5">
                    <MacroPill label="P" value={item.p} color={PEACH} />
                    <MacroPill label="C" value={item.c} color="rgba(255,229,204,0.8)" />
                    <MacroPill label="F" value={item.f} color="rgba(225,169,95,0.8)" />
                  </div>
                </div>
                <span className="text-xs ml-3 flex-shrink-0" style={{ color: PEACH, fontFamily: 'Montserrat' }}>{item.cal} kcal</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {!isLast ? (
        <button onClick={() => setTutorialPage(p => p + 1)}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 flex-shrink-0"
          style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}`, color: PEACH, fontFamily: 'Montserrat', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Next <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button onClick={onStart}
          className="w-full py-4 rounded-2xl flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, color: '#1D1D1F', fontFamily: 'Montserrat', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          Start Scanning
        </button>
      )}
    </motion.div>
  );
}

// ─── Results Step ─────────────────────────────────────────────────────────────
function ResultsStep({
  scanResult, capturedImage, items, setItems,
  portionIdx, setPortionIdx, multiplier, adjustedTotal,
  selectedMeal, onLog, onClose,
  textPrimary, textMuted, cardBg, cardBorder, bg, isDarkMode,
}) {
  const [editingIdx, setEditingIdx] = useState(null);
  const [editQty, setEditQty] = useState('');

  const startEdit = (i) => {
    setEditingIdx(i);
    setEditQty(String(items[i].quantity ?? 1));
  };

  const commitEdit = (i) => {
    const qty = parseFloat(editQty);
    if (!isNaN(qty) && qty > 0) {
      setItems(prev => {
        const next = [...prev];
        const orig = scanResult.items[i];
        const ratio = qty / (orig.quantity || 1);
        next[i] = {
          ...next[i],
          quantity: qty,
          calories: (orig.calories || 0) * ratio,
          protein: (orig.protein || 0) * ratio,
          carbs: (orig.carbs || 0) * ratio,
          fat: (orig.fat || 0) * ratio,
        };
        return next;
      });
    }
    setEditingIdx(null);
  };

  const removeItem = (i) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, removed: true } : item));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-hidden relative">

      {/* Photo header */}
      {capturedImage && (
        <div className="mx-5 mb-3 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ height: 110, border: `0.5px solid ${PEACH_BORDER}` }}>
          <img src={capturedImage} alt="meal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 pb-36 space-y-4">
        {/* Meal name + confidence */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium truncate" style={{ color: textPrimary, fontFamily: 'Montserrat' }}>
              {scanResult.meal_name}
            </p>
            {scanResult.confidence !== 'high' && scanResult.confidence_reason && (
              <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: textMuted, fontFamily: 'Montserrat' }}>
                {scanResult.confidence_reason}
              </p>
            )}
          </div>
          <ConfidenceBadge confidence={scanResult.confidence} />
        </div>

        {/* Macro summary */}
        <div className="rounded-2xl p-4 flex flex-col items-center gap-3"
          style={{ background: 'rgba(255,218,185,0.06)', border: `0.5px solid ${PEACH_BORDER}` }}>
          <p className="text-3xl font-light" style={{ color: PEACH, fontFamily: 'Montserrat' }}>
            {adjustedTotal.calories} <span className="text-base opacity-60">kcal</span>
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <MacroPill label="P" value={adjustedTotal.protein} color={PEACH} />
            <MacroPill label="C" value={adjustedTotal.carbs} color="rgba(255,229,204,0.9)" />
            <MacroPill label="F" value={adjustedTotal.fat} color="rgba(225,169,95,0.9)" />
          </div>
        </div>

        {/* Portion slider */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: textMuted, fontFamily: 'Montserrat' }}>
            Adjust portion size
          </p>
          <div className="flex items-center gap-2">
            {PORTION_STOPS.map((_, i) => (
              <button key={i} onClick={() => setPortionIdx(i)}
                className="flex-1 py-2 rounded-xl text-[10px] transition-all"
                style={{
                  background: i === portionIdx ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `0.5px solid ${i === portionIdx ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.08)'}`,
                  color: i === portionIdx ? GOLD : textMuted,
                  fontFamily: 'Montserrat',
                }}>
                {PORTION_LABELS[i]}
              </button>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {scanResult.warnings?.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '0.5px solid rgba(245,158,11,0.25)' }}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" strokeWidth={1.5} />
            <div className="space-y-1">
              {scanResult.warnings.map((w, i) => (
                <p key={i} className="text-[11px]" style={{ color: 'rgba(245,158,11,0.85)', fontFamily: 'Montserrat' }}>{w}</p>
              ))}
            </div>
          </div>
        )}

        {/* Items list */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: textMuted, fontFamily: 'Montserrat' }}>
            Ingredients
          </p>
          <div className="space-y-1.5">
            {items.map((item, i) => item.removed ? null : (
              <motion.div key={i} layout
                className="flex items-center gap-3 px-3 py-3 rounded-xl"
                style={{ background: cardBg, border: `0.5px solid ${cardBorder}` }}>
                {editingIdx === i ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="number"
                      value={editQty}
                      onChange={e => setEditQty(e.target.value)}
                      onBlur={() => commitEdit(i)}
                      onKeyDown={e => e.key === 'Enter' && commitEdit(i)}
                      autoFocus
                      className="w-16 text-center rounded-lg px-2 py-1 text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', color: textPrimary, border: `0.5px solid ${PEACH_BORDER}`, fontFamily: 'Montserrat' }}
                    />
                    <span className="text-xs" style={{ color: textMuted }}>{item.unit}</span>
                  </div>
                ) : (
                  <button className="flex-1 text-left" onClick={() => startEdit(i)}>
                    <p className="text-xs" style={{ color: textPrimary, fontFamily: 'Montserrat' }}>
                      {item.name}
                      <span className="ml-1.5" style={{ color: textMuted }}>{item.quantity} {item.unit}</span>
                    </p>
                    <div className="flex gap-2 mt-1">
                      <MacroPill label="P" value={Math.round((item.protein || 0) * multiplier * 10) / 10} color={PEACH} />
                      <MacroPill label="C" value={Math.round((item.carbs || 0) * multiplier * 10) / 10} color="rgba(255,229,204,0.8)" />
                      <MacroPill label="F" value={Math.round((item.fat || 0) * multiplier * 10) / 10} color="rgba(225,169,95,0.8)" />
                    </div>
                  </button>
                )}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px]" style={{ color: PEACH, fontFamily: 'Montserrat' }}>
                    {Math.round((item.calories || 0) * multiplier)} kcal
                  </span>
                  <button onClick={() => removeItem(i)}
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <Minus className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pt-4 pb-8 flex gap-3"
        style={{ background: `linear-gradient(to top, ${bg} 65%, transparent)` }}>
        <button onClick={onClose}
          className="flex-1 py-4 rounded-2xl text-sm uppercase tracking-[0.1em]"
          style={{ background: 'transparent', border: `0.5px solid ${PEACH_BORDER}`, color: PEACH, fontFamily: 'Montserrat' }}>
          Edit First
        </button>
        <button onClick={onLog}
          className="flex-[2] py-4 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-[0.1em]"
          style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, color: '#1D1D1F', fontFamily: 'Montserrat', fontWeight: 500 }}>
          <Check className="w-4 h-4" strokeWidth={2.5} />
          Log Meal
        </button>
      </div>
    </motion.div>
  );
}