import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Check, ChevronRight, Loader2, Plus, Minus, ScanLine } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/shared/ThemeContext';

const PEACH = '#FFDAB9';
const PEACH_DIM = 'rgba(255,218,185,0.15)';
const PEACH_BORDER = 'rgba(255,218,185,0.3)';

// Tutorial carousel slides
const TUTORIAL_SLIDES = [
  {
    icon: Camera,
    title: 'Photograph Your Meal',
    desc: 'Take a photo of your plate and Aureum AI will identify every item for you.'
  },
  {
    icon: Check,
    title: 'Select What to Log',
    desc: 'Review the detected foods. Toggle what you want and tap any item to adjust the serving.'
  },
  {
    icon: ScanLine,
    title: 'Log in One Tap',
    desc: 'Confirm your selections and log the entire meal at once. Fast, accurate, effortless.'
  }
];

export default function MealScanModal({ isOpen, onClose, onFoodsSelected, selectedMeal }) {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState('tutorial'); // tutorial | capture | review
  const [tutorialPage, setTutorialPage] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState({});
  const fileInputRef = useRef(null);

  const bg = isDarkMode ? 'rgba(10,8,4,0.97)' : 'rgba(255,252,245,0.97)';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(29,29,31,0.45)';
  const cardBg = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDarkMode ? 'rgba(255,218,185,0.12)' : 'rgba(255,218,185,0.35)';

  useEffect(() => {
    if (!isOpen) {
      setStep('tutorial');
      setTutorialPage(0);
      setCapturedImage(null);
      setDetectedFoods([]);
      setSelectedFoods({});
    }
  }, [isOpen]);

  const handleImageCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setCapturedImage(dataUrl);
      setStep('review');
      setScanning(true);

      // Upload the file and scan
      const blob = await fetch(dataUrl).then(r => r.blob());
      const formFile = new File([blob], 'meal.jpg', { type: file.type });
      const { file_url } = await base44.integrations.Core.UploadFile({ file: formFile });
      const response = await base44.functions.invoke('mealScan', { action: 'scan_meal', image_url: file_url });
      const foods = response.data?.foods || [];
      setDetectedFoods(foods);
      const sel = {};
      foods.forEach((_, i) => { sel[i] = true; });
      setSelectedFoods(sel);
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const toggleFood = (idx) => {
    setSelectedFoods(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleLog = () => {
    const toLog = detectedFoods.filter((_, i) => selectedFoods[i]);
    onFoodsSelected(toLog);
    onClose();
  };

  const selectedCount = Object.values(selectedFoods).filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: bg, backdropFilter: 'blur(30px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0">
        <button onClick={onClose}>
          <X className="w-5 h-5" style={{ color: textMuted }} />
        </button>
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>
          Meal Scan
        </p>
        <div className="w-5" />
      </div>

      {/* TUTORIAL STEP */}
      {step === 'tutorial' && (
        <div className="flex-1 flex flex-col px-6 pb-10">
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Slide icon */}
            <motion.div
              key={tutorialPage}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8"
              style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}` }}
            >
              {React.createElement(TUTORIAL_SLIDES[tutorialPage].icon, { className: 'w-10 h-10', style: { color: PEACH }, strokeWidth: 1.5 })}
            </motion.div>

            {/* Dots */}
            <div className="flex gap-2 mb-6">
              {TUTORIAL_SLIDES.map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-300"
                  style={{ width: i === tutorialPage ? 20 : 6, height: 6, background: i === tutorialPage ? PEACH : 'rgba(255,218,185,0.25)' }} />
              ))}
            </div>

            <motion.h2
              key={`title-${tutorialPage}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-2xl text-center mb-3"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: textPrimary }}
            >
              {TUTORIAL_SLIDES[tutorialPage].title}
            </motion.h2>
            <motion.p
              key={`desc-${tutorialPage}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-sm text-center leading-relaxed"
              style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}
            >
              {TUTORIAL_SLIDES[tutorialPage].desc}
            </motion.p>
          </div>

          {/* CTA */}
          {tutorialPage < TUTORIAL_SLIDES.length - 1 ? (
            <button
              onClick={() => setTutorialPage(p => p + 1)}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
              style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}`, color: PEACH, fontFamily: 'Montserrat, sans-serif', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => { setStep('capture'); setTimeout(() => fileInputRef.current?.click(), 100); }}
              className="w-full py-4 rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, color: '#1D1D1F', fontFamily: 'Montserrat, sans-serif', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}
            >
              Start Scanning
            </button>
          )}
        </div>
      )}

      {/* CAPTURE STEP */}
      {step === 'capture' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}` }}>
            <Camera className="w-9 h-9" style={{ color: PEACH }} strokeWidth={1.5} />
          </div>
          <p className="text-center text-sm" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
            Choose a photo from your gallery or take a new one
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)`, color: '#1D1D1F', fontFamily: 'Montserrat, sans-serif', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}
          >
            Select Photo
          </button>
        </div>
      )}

      {/* REVIEW STEP */}
      {step === 'review' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Captured image preview */}
          {capturedImage && (
            <div className="mx-5 mb-4 rounded-2xl overflow-hidden flex-shrink-0"
              style={{ height: 160, border: `0.5px solid ${PEACH_BORDER}` }}>
              <img src={capturedImage} alt="meal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {scanning ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: PEACH }} />
              <p className="text-sm" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
                Analysing your meal…
              </p>
            </div>
          ) : (
            <>
              <div className="px-5 mb-3 flex-shrink-0">
                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>
                  {detectedFoods.length} items detected · {selectedCount} selected
                </p>
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
                      background: selectedFoods[i] ? 'rgba(255,218,185,0.1)' : cardBg,
                      border: `0.5px solid ${selectedFoods[i] ? PEACH_BORDER : cardBorder}`
                    }}
                  >
                    <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all"
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

              {/* Bottom log button */}
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
            </>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageCapture} />
    </motion.div>
  );
}