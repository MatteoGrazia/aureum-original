import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mic, ScanLine, ChevronRight, Check, Minus,
  AlertTriangle, RefreshCw, Search, Info, MicOff
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/shared/ThemeContext';

const PEACH = '#FFDAB9';
const PEACH_DIM = 'rgba(255,218,185,0.12)';
const PEACH_BORDER = 'rgba(255,218,185,0.28)';
const GOLD = '#D4AF37';

const EXAMPLES = [
  'Two scrambled eggs with toast and orange juice',
  'A bowl of oatmeal with berries and a coffee with milk',
  '150g chicken breast with rice and a side salad',
];

const LOADING_MESSAGES = [
  'Transcribing your meal...',
  'Identifying ingredients...',
  'Calculating macros...',
  'Almost done...',
];

const PORTION_STOPS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const PORTION_LABELS = ['½x', '¾x', '1x', '1¼x', '1½x', '2x'];

function useLoadingMessage() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % LOADING_MESSAGES.length), 2000);
    return () => clearInterval(t);
  }, []);
  return LOADING_MESSAGES[idx];
}

function MacroPill({ label, value, color }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded"
      style={{ background: 'rgba(255,255,255,0.06)', color, fontFamily: 'Montserrat' }}>
      {label} {value}g
    </span>
  );
}

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

export default function VoiceLogModal({ isOpen, onClose, onFoodsSelected, selectedMeal }) {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState('input'); // input | recording | processing | results | error
  const [text, setText] = useState('');
  const [recordDuration, setRecordDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [micDenied, setMicDenied] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [items, setItems] = useState([]);
  const [portionIdx, setPortionIdx] = useState(2);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editQty, setEditQty] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const autoStopRef = useRef(null);
  const textInputRef = useRef(null);
  const abortRef = useRef(null);
  const loadingMsg = useLoadingMessage();

  const bg = isDarkMode ? 'rgba(10,8,4,0.97)' : 'rgba(255,252,245,0.97)';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(29,29,31,0.45)';
  const cardBg = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDarkMode ? 'rgba(255,218,185,0.12)' : 'rgba(255,218,185,0.35)';

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      stopMediaRecorder();
      setStep('input');
      setText('');
      setRecordDuration(0);
      setErrorMsg('');
      setMicDenied(false);
      setScanResult(null);
      setItems([]);
      setPortionIdx(2);
      setEditingIdx(null);
    }
  }, [isOpen]);

  const stopMediaRecorder = () => {
    clearInterval(recordTimerRef.current);
    clearTimeout(autoStopRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Start recording (hold)
  const handleMicStart = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true },
      });

      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.start(100);
      mediaRecorderRef.current = recorder;

      setRecordDuration(0);
      setStep('recording');

      recordTimerRef.current = setInterval(() => setRecordDuration(d => d + 1), 1000);
      // Auto stop at 60s
      autoStopRef.current = setTimeout(() => handleMicEnd(), 60000);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicDenied(true);
        setErrorMsg('Microphone access is needed. Please allow it in your browser settings.');
        setStep('error');
      } else {
        setErrorMsg('Could not access microphone. Try typing your meal instead.');
        setStep('error');
      }
    }
  }, []);

  // Stop recording → validate → analyse
  const handleMicEnd = useCallback(async () => {
    clearInterval(recordTimerRef.current);
    clearTimeout(autoStopRef.current);

    const duration = recordDuration;

    if (duration < 1) {
      stopMediaRecorder();
      setStep('input');
      setErrorMsg('Hold a little longer and describe your meal.');
      return;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    const base64 = await new Promise((resolve) => {
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const buf = await blob.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        recorder.stream.getTracks().forEach(t => t.stop());
        resolve(b64);
      };
      recorder.stop();
    });

    if (!base64 || base64.length < 100) {
      setStep('input');
      setErrorMsg('We could not hear anything. Try again or type your meal below.');
      return;
    }

    await analysePayload({ audioBase64: base64, mimeType: 'audio/webm' });
  }, [recordDuration]);

  // Analyse via text
  const handleAnalyseText = useCallback(async () => {
    if (text.trim().length < 5) {
      setErrorMsg('Please describe your meal in a bit more detail.');
      return;
    }
    await analysePayload({ textInput: text.trim() });
  }, [text]);

  const analysePayload = async (payload) => {
    setStep('processing');
    setErrorMsg('');

    const controller = new AbortController();
    abortRef.current = controller;

    const timeout = setTimeout(() => {
      controller.abort();
      setErrorMsg('Taking longer than usual. Try again or log manually.');
      setStep('error');
    }, 25000);

    try {
      const response = await base44.functions.invoke('analyzeVoiceMeal', payload);
      clearTimeout(timeout);
      if (controller.signal.aborted) return;

      const data = response.data;
      if (!data || !data.items || data.items.length === 0) {
        setErrorMsg('We could not identify a meal. Please describe it in more detail.');
        setStep('error');
        return;
      }

      setScanResult(data);
      setItems(data.items.map(item => ({ ...item, removed: false })));
      setPortionIdx(2);
      setStep('results');
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
  };

  const handleCancelProcessing = () => {
    abortRef.current?.abort();
    setStep('input');
  };

  // Computed totals
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
      food_name: scanResult?.meal_name || 'Voice Logged Meal',
      calories: adjustedTotal.calories,
      protein: adjustedTotal.protein,
      carbs: adjustedTotal.carbs,
      fat: adjustedTotal.fat,
      fiber: adjustedTotal.fiber,
      meal_type: selectedMeal,
      serving_size: 1,
      serving_unit: 'serving',
    });
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

  const startEdit = (i) => { setEditingIdx(i); setEditQty(String(items[i].quantity ?? 1)); };
  const commitEdit = (i) => {
    const qty = parseFloat(editQty);
    if (!isNaN(qty) && qty > 0) {
      setItems(prev => {
        const next = [...prev];
        const orig = scanResult.items[i];
        const ratio = qty / (orig.quantity || 1);
        next[i] = { ...next[i], quantity: qty, calories: (orig.calories || 0) * ratio, protein: (orig.protein || 0) * ratio, carbs: (orig.carbs || 0) * ratio, fat: (orig.fat || 0) * ratio };
        return next;
      });
    }
    setEditingIdx(null);
  };
  const removeItem = (i) => setItems(prev => prev.map((item, idx) => idx === i ? { ...item, removed: true } : item));

  const formatDuration = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: bg }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0">
        <button onClick={() => { stopMediaRecorder(); onClose(); }}>
          <X className="w-5 h-5" style={{ color: textMuted }} />
        </button>
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: PEACH, fontFamily: 'Montserrat' }}>
          {step === 'recording' ? 'Listening...'
            : step === 'processing' ? 'Analysing…'
            : step === 'results' ? 'Review & Log'
            : step === 'error' ? 'Error'
            : 'Voice Log'}
        </p>
        <div className="w-5" />
      </div>

      <AnimatePresence mode="wait">

        {/* ── INPUT ── */}
        {step === 'input' && (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col px-5 pb-10 overflow-y-auto">

            {/* Inline error message */}
            {errorMsg ? (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
                style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)' }}>
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-[11px] text-red-400" style={{ fontFamily: 'Montserrat' }}>{errorMsg}</p>
              </motion.div>
            ) : null}

            {/* Mic button */}
            <div className="flex flex-col items-center py-8 gap-3">
              <motion.button
                onMouseDown={handleMicStart}
                onTouchStart={(e) => { e.preventDefault(); handleMicStart(); }}
                className="w-24 h-24 rounded-full flex items-center justify-center select-none"
                style={{ background: PEACH_DIM, border: `1.5px solid ${PEACH_BORDER}`, touchAction: 'none' }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic className="w-10 h-10" style={{ color: PEACH }} strokeWidth={1.5} />
              </motion.button>
              <p className="text-xs" style={{ color: textMuted, fontFamily: 'Montserrat' }}>
                Hold to record, or type below
              </p>
            </div>

            {/* Text input */}
            <textarea
              ref={textInputRef}
              value={text}
              onChange={e => { setText(e.target.value); if (errorMsg) setErrorMsg(''); }}
              placeholder="e.g. Two eggs, a slice of toast with butter..."
              rows={4}
              className="w-full p-4 rounded-2xl resize-none outline-none text-sm mb-3"
              style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, color: textPrimary, fontFamily: 'Montserrat', lineHeight: 1.6 }}
            />

            {/* Example chips */}
            <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: textMuted, fontFamily: 'Montserrat' }}>Try saying:</p>
            <div className="flex flex-col gap-2 mb-5">
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setText(ex)}
                  className="text-left px-4 py-2.5 rounded-xl text-xs"
                  style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}`, color: PEACH, fontFamily: 'Montserrat' }}>
                  "{ex}"
                </button>
              ))}
            </div>

            <button
              onClick={handleAnalyseText}
              disabled={text.trim().length < 5}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
              style={{
                background: text.trim().length >= 5 ? `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)` : PEACH_DIM,
                color: text.trim().length >= 5 ? '#1D1D1F' : PEACH,
                fontFamily: 'Montserrat', fontSize: 13, fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                border: text.trim().length >= 5 ? 'none' : `0.5px solid ${PEACH_BORDER}`,
                opacity: text.trim().length >= 5 ? 1 : 0.55,
              }}>
              Analyse Meal <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ── RECORDING ── */}
        {step === 'recording' && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 px-5">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Outer pulse rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div key={ring}
                  className="absolute inset-0 rounded-full"
                  animate={{ scale: [1, 1.2 + ring * 0.15, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: ring * 0.3, ease: 'easeInOut' }}
                  style={{ border: `1.5px solid rgba(212,175,55,${0.5 - ring * 0.1})` }}
                />
              ))}
              {/* Core mic button — release to stop */}
              <motion.button
                onMouseUp={handleMicEnd}
                onTouchEnd={(e) => { e.preventDefault(); handleMicEnd(); }}
                className="relative w-24 h-24 rounded-full flex items-center justify-center z-10"
                style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, touchAction: 'none' }}
                whileTap={{ scale: 0.95 }}>
                <MicOff className="w-10 h-10" style={{ color: '#1D1D1F' }} strokeWidth={1.5} />
              </motion.button>
            </div>

            <div className="text-center">
              <p className="text-sm mb-1" style={{ color: textPrimary, fontFamily: 'Montserrat' }}>Listening...</p>
              <p className="text-2xl tabular-nums" style={{ color: PEACH, fontFamily: 'Montserrat' }}>
                {formatDuration(recordDuration)}
              </p>
            </div>

            <p className="text-[11px]" style={{ color: textMuted, fontFamily: 'Montserrat' }}>Release to analyse</p>
          </motion.div>
        )}

        {/* ── PROCESSING ── */}
        {step === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            {/* Same pulse ring as AI Scan */}
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
              <p className="text-[11px]" style={{ color: textMuted, fontFamily: 'Montserrat' }}>Usually takes 2 to 4 seconds</p>
            </div>

            <button onClick={handleCancelProcessing}
              className="mt-2 px-6 py-3 rounded-2xl text-sm uppercase tracking-[0.12em]"
              style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: textMuted, fontFamily: 'Montserrat' }}>
              Cancel
            </button>
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {step === 'results' && scanResult && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden relative">

            <div className="flex-1 overflow-y-auto px-5 pb-36 space-y-4">

              {/* Transcript card */}
              <div className="px-4 py-3 rounded-xl"
                style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}` }}>
                <p className="text-[9px] uppercase tracking-[0.25em] mb-1" style={{ color: 'rgba(255,218,185,0.45)', fontFamily: 'Montserrat' }}>
                  We heard:
                </p>
                <p className="text-xs italic leading-relaxed" style={{ color: PEACH, fontFamily: 'Montserrat' }}>
                  "{scanResult.transcript}"
                </p>
                <button onClick={() => setStep('input')}
                  className="text-[10px] mt-1.5 underline underline-offset-2"
                  style={{ color: 'rgba(255,218,185,0.5)', fontFamily: 'Montserrat' }}>
                  Not right? Try again
                </button>
              </div>

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
                          <input type="number" value={editQty}
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
              <button onClick={handleLogMeal}
                className="flex-[2] py-4 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-[0.1em]"
                style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, color: '#1D1D1F', fontFamily: 'Montserrat', fontWeight: 500 }}>
                <Check className="w-4 h-4" strokeWidth={2.5} />
                Log Meal
              </button>
            </div>
          </motion.div>
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
            </div>
            <div className="w-full flex flex-col gap-3">
              {micDenied ? (
                <button onClick={() => { setMicDenied(false); setStep('input'); setTimeout(() => textInputRef.current?.focus(), 200); }}
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-[0.12em]"
                  style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, color: '#1D1D1F', fontFamily: 'Montserrat', fontWeight: 500 }}>
                  Type Instead
                </button>
              ) : (
                <button onClick={() => { setErrorMsg(''); setStep('input'); }}
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-[0.12em]"
                  style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, color: '#1D1D1F', fontFamily: 'Montserrat', fontWeight: 500 }}>
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              )}
              <button onClick={onClose}
                className="w-full py-4 rounded-2xl text-sm uppercase tracking-[0.12em]"
                style={{ background: 'rgba(255,255,255,0.04)', border: `0.5px solid ${PEACH_BORDER}`, color: PEACH, fontFamily: 'Montserrat' }}>
                <Search className="w-4 h-4 inline mr-2" />Log Manually
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}