import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Check, Loader2, Plus, ScanLine, MessageSquare, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/shared/ThemeContext';

const PEACH = '#FFDAB9';
const PEACH_DIM = 'rgba(255,218,185,0.12)';
const PEACH_BORDER = 'rgba(255,218,185,0.28)';

export default function MealScanModal({ isOpen, onClose, onFoodsSelected, selectedMeal }) {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState('capture'); // capture | context | scanning | review
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [context, setContext] = useState('');
  const [detectedFoods, setDetectedFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState({});
  const [mealName, setMealName] = useState('');
  const fileInputRef = useRef(null);
  const contextRef = useRef(null);

  const bg = isDarkMode ? 'rgba(10,8,4,0.97)' : 'rgba(255,252,245,0.97)';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(29,29,31,0.45)';
  const cardBg = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDarkMode ? 'rgba(255,218,185,0.12)' : 'rgba(255,218,185,0.3)';

  useEffect(() => {
    if (!isOpen) {
      setStep('capture');
      setCapturedImage(null);
      setCapturedFile(null);
      setContext('');
      setDetectedFoods([]);
      setSelectedFoods({});
      setMealName('');
    }
  }, [isOpen]);

  const handleImageCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target.result);
      setStep('context');
      setTimeout(() => contextRef.current?.focus(), 300);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    setStep('scanning');
    const blob = await fetch(capturedImage).then(r => r.blob());
    const formFile = new File([blob], 'meal.jpg', { type: capturedFile?.type || 'image/jpeg' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file: formFile });

    const response = await base44.functions.invoke('mealScan', {
      action: 'scan_meal',
      image_url: file_url,
      user_context: context.trim(),
    });

    const foods = response.data?.foods || [];
    const name = response.data?.meal_name || 'Scanned Meal';
    setMealName(name);
    setDetectedFoods(foods);
    const sel = {};
    foods.forEach((_, i) => { sel[i] = true; });
    setSelectedFoods(sel);
    setStep('review');
  };

  const toggleFood = (idx) => {
    setSelectedFoods(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleLog = async () => {
    const toLog = detectedFoods.filter((_, i) => selectedFoods[i]);

    // Save as a SavedMeal for the library
    const totals = toLog.reduce((acc, f) => ({
      cal: acc.cal + (f.calories || 0),
      pro: acc.pro + (f.protein || 0),
      carbs: acc.carbs + (f.carbs || 0),
      fat: acc.fat + (f.fat || 0),
    }), { cal: 0, pro: 0, carbs: 0, fat: 0 });

    await base44.entities.SavedMeal.create({
      meal_name: mealName,
      image_url: capturedImage,
      user_context: context.trim() || undefined,
      foods: toLog,
      total_calories: Math.round(totals.cal),
      total_protein: Math.round(totals.pro),
      total_carbs: Math.round(totals.carbs),
      total_fat: Math.round(totals.fat),
      meal_type: selectedMeal,
    });

    onFoodsSelected(toLog);
    onClose();
  };

  const selectedCount = Object.values(selectedFoods).filter(Boolean).length;

  if (!isOpen) return null;

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
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>
          {step === 'context' ? 'Describe Your Meal' : step === 'scanning' ? 'Analysing…' : step === 'review' ? 'Review & Log' : 'AI Meal Scan'}
        </p>
        <div className="w-5" />
      </div>

      {/* CAPTURE STEP */}
      {step === 'capture' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center"
            style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}` }}>
            <Camera className="w-12 h-12" style={{ color: PEACH }} strokeWidth={1.2} />
          </div>
          <div className="text-center">
            <h2 className="text-xl mb-2" style={{ color: textPrimary, fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Photograph Your Meal</h2>
            <p className="text-sm leading-relaxed" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
              Take a photo of your plate. You'll then add some context so the AI can give you the most accurate nutritional breakdown.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 rounded-2xl text-sm uppercase tracking-[0.12em]"
            style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}`, color: PEACH, fontFamily: 'Montserrat, sans-serif' }}
          >
            Take / Choose Photo
          </button>
        </div>
      )}

      {/* CONTEXT STEP */}
      {step === 'context' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Image preview */}
          {capturedImage && (
            <div className="mx-5 mb-4 rounded-2xl overflow-hidden flex-shrink-0"
              style={{ height: 160, border: `0.5px solid ${PEACH_BORDER}` }}>
              <img src={capturedImage} alt="meal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div className="px-5 flex-1 flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}` }}>
              <MessageSquare className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: PEACH }} strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>Tell the AI about your meal</p>
                <p className="text-xs leading-relaxed" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
                  Mention ingredients, cooking methods, portion sizes, restaurant name, or any details that help identify the meal accurately.
                </p>
              </div>
            </div>

            <textarea
              ref={contextRef}
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="e.g. Chicken tikka masala with naan bread, restaurant portion. The sauce looked quite creamy. Also had a side salad with dressing..."
              rows={6}
              className="w-full px-4 py-4 rounded-2xl outline-none text-sm resize-none"
              style={{
                background: cardBg,
                border: `0.5px solid ${cardBorder}`,
                color: textPrimary,
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
              }}
            />

            <p className="text-center text-[10px] uppercase tracking-[0.18em]" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
              Optional — but more detail = more accurate results
            </p>

            <button
              onClick={handleScan}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-[0.12em]"
              style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, color: '#1D1D1F', fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              <Send className="w-4 h-4" strokeWidth={2} />
              Analyse Meal
            </button>
          </div>
        </div>
      )}

      {/* SCANNING STEP */}
      {step === 'scanning' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
          {capturedImage && (
            <div className="w-full rounded-2xl overflow-hidden mb-2" style={{ height: 160, border: `0.5px solid ${PEACH_BORDER}` }}>
              <img src={capturedImage} alt="meal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: PEACH }} />
          <div className="text-center">
            <p className="text-sm mb-1" style={{ color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}>Analysing your meal…</p>
            <p className="text-xs" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>This usually takes 5–10 seconds</p>
          </div>
        </div>
      )}

      {/* REVIEW STEP */}
      {step === 'review' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {capturedImage && (
            <div className="mx-5 mb-3 rounded-2xl overflow-hidden flex-shrink-0"
              style={{ height: 130, border: `0.5px solid ${PEACH_BORDER}` }}>
              <img src={capturedImage} alt="meal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div className="px-5 mb-3 flex-shrink-0">
            <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>
              {detectedFoods.length} items detected · {selectedCount} selected
            </p>
            {mealName && (
              <p className="text-base" style={{ color: textPrimary, fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{mealName}</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-2 pb-32">
            {detectedFoods.map((food, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => toggleFood(i)}
                className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all"
                style={{
                  background: selectedFoods[i] ? 'rgba(255,218,185,0.08)' : cardBg,
                  border: `0.5px solid ${selectedFoods[i] ? PEACH_BORDER : cardBorder}`
                }}
              >
                <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center"
                  style={{ background: selectedFoods[i] ? PEACH : 'transparent', border: `1.5px solid ${selectedFoods[i] ? PEACH : 'rgba(255,218,185,0.3)'}` }}>
                  {selectedFoods[i] && <Check className="w-3 h-3" style={{ color: '#1D1D1F' }} strokeWidth={2.5} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{food.name}</p>
                  <p className="text-[10px]" style={{ color: textMuted }}>{food.serving_description} · {food.calories} kcal</p>
                </div>
                <span className="text-[10px] flex-shrink-0" style={{ color: PEACH }}>
                  P{food.protein}g C{food.carbs}g F{food.fat}g
                </span>
              </motion.button>
            ))}

            {detectedFoods.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: textMuted }}>No foods detected. Try a clearer photo.</p>
              </div>
            )}
          </div>

          {selectedCount > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: `linear-gradient(0deg, ${bg} 60%, transparent)` }}>
              <button
                onClick={handleLog}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, color: '#1D1D1F', fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                <Check className="w-4 h-4" strokeWidth={2.5} />
                Log {selectedCount} Item{selectedCount !== 1 ? 's' : ''} to {selectedMeal}
              </button>
            </div>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageCapture} />
    </motion.div>
  );
}