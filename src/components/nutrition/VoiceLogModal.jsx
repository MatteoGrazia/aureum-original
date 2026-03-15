import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Check, Loader2, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/shared/ThemeContext';

const PEACH = '#FFDAB9';
const PEACH_DIM = 'rgba(255,218,185,0.12)';
const PEACH_BORDER = 'rgba(255,218,185,0.3)';

const EXAMPLES = [
  'Two scrambled eggs with toast and orange juice',
  'A bowl of oatmeal with berries and a coffee',
  '150g chicken breast with rice and salad',
];

export default function VoiceLogModal({ isOpen, onClose, onFoodsSelected, selectedMeal }) {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState('input'); // input | processing | review
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [foods, setFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState({});
  const recognitionRef = useRef(null);

  const bg = isDarkMode ? 'rgba(10,8,4,0.97)' : 'rgba(255,252,245,0.97)';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(29,29,31,0.45)';
  const cardBg = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDarkMode ? 'rgba(255,218,185,0.12)' : 'rgba(255,218,185,0.35)';

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported on this browser. Please type instead.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join(' ');
      setText(transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setStep('processing');
    const response = await base44.functions.invoke('mealScan', { action: 'voice_log', voice_text: text });
    const detected = response.data?.foods || [];
    setFoods(detected);
    const sel = {};
    detected.forEach((_, i) => { sel[i] = true; });
    setSelectedFoods(sel);
    setStep('review');
  };

  const handleLog = () => {
    const toLog = foods.filter((_, i) => selectedFoods[i]);
    onFoodsSelected(toLog);
    onClose();
    setStep('input'); setText(''); setFoods([]); setSelectedFoods({});
  };

  const selectedCount = Object.values(selectedFoods).filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: bg, backdropFilter: 'blur(30px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0">
        <button onClick={() => { onClose(); setStep('input'); setText(''); setFoods([]); }}>
          <X className="w-5 h-5" style={{ color: textMuted }} />
        </button>
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>
          Voice Log
        </p>
        <div className="w-5" />
      </div>

      {/* INPUT STEP */}
      {step === 'input' && (
        <div className="flex-1 flex flex-col px-5 pb-10">
          {/* Mic button */}
          <div className="flex justify-center py-8">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={isRecording ? stopRecording : startRecording}
              animate={isRecording ? { boxShadow: ['0 0 20px rgba(255,218,185,0.3)', '0 0 50px rgba(255,218,185,0.6)', '0 0 20px rgba(255,218,185,0.3)'] } : {}}
              transition={isRecording ? { duration: 1.2, repeat: Infinity } : {}}
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: isRecording ? `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)` : PEACH_DIM,
                border: `1px solid ${PEACH_BORDER}`,
              }}
            >
              {isRecording
                ? <MicOff className="w-10 h-10" style={{ color: '#1D1D1F' }} strokeWidth={1.5} />
                : <Mic className="w-10 h-10" style={{ color: PEACH }} strokeWidth={1.5} />
              }
            </motion.button>
          </div>

          <p className="text-center text-xs mb-5" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
            {isRecording ? 'Listening… tap to stop' : 'Tap the mic or type below'}
          </p>

          {/* Text area */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. Two eggs, a slice of toast, and a glass of orange juice…"
            rows={4}
            className="w-full p-4 rounded-2xl resize-none outline-none text-sm mb-4"
            style={{
              background: cardBg, border: `0.5px solid ${cardBorder}`,
              color: textPrimary, fontFamily: 'Montserrat, sans-serif',
            }}
          />

          {/* Example chips */}
          <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>Try saying:</p>
          <div className="flex flex-col gap-2 mb-6">
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => setText(ex)}
                className="text-left px-4 py-2.5 rounded-xl text-xs"
                style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}`, color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>
                "{ex}"
              </button>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!text.trim()}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              background: text.trim() ? `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)` : PEACH_DIM,
              color: text.trim() ? '#1D1D1F' : PEACH,
              fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              border: text.trim() ? 'none' : `0.5px solid ${PEACH_BORDER}`,
              opacity: text.trim() ? 1 : 0.6
            }}
          >
            Analyse Meal <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PROCESSING */}
      {step === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: PEACH }} />
          <p className="text-sm" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
            Aureum AI is calculating your nutrition…
          </p>
        </div>
      )}

      {/* REVIEW STEP */}
      {step === 'review' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 mb-3 flex-shrink-0">
            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>
              {foods.length} items found
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-5 space-y-2 pb-32">
            {foods.map((food, i) => (
              <motion.button key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedFoods(prev => ({ ...prev, [i]: !prev[i] }))}
                className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3"
                style={{ background: selectedFoods[i] ? 'rgba(255,218,185,0.1)' : cardBg, border: `0.5px solid ${selectedFoods[i] ? PEACH_BORDER : cardBorder}` }}
              >
                <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center"
                  style={{ background: selectedFoods[i] ? PEACH : 'transparent', border: `1.5px solid ${selectedFoods[i] ? PEACH : PEACH_BORDER}` }}>
                  {selectedFoods[i] && <Check className="w-3 h-3" style={{ color: '#1D1D1F' }} strokeWidth={2.5} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{food.name}</p>
                  <p className="text-[10px]" style={{ color: textMuted }}>{food.serving_description} · {food.calories} kcal</p>
                </div>
                <span className="text-[10px] flex-shrink-0" style={{ color: PEACH }}>P{food.protein}g</span>
              </motion.button>
            ))}
          </div>

          {selectedCount > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: `linear-gradient(0deg, ${bg} 60%, transparent)` }}>
              <button onClick={handleLog} className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, color: '#1D1D1F', fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <Check className="w-4 h-4" strokeWidth={2.5} />
                Log {selectedCount} Item{selectedCount !== 1 ? 's' : ''} to {selectedMeal}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}