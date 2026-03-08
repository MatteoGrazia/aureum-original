import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator } from 'lucide-react';

const PLATES = [
  { weight: 25, bg: 'rgba(185, 70, 70, 0.25)', border: 'rgba(185, 70, 70, 0.6)', label: '25' },
  { weight: 20, bg: 'rgba(70, 110, 185, 0.25)', border: 'rgba(70, 110, 185, 0.6)', label: '20' },
  { weight: 15, bg: 'rgba(212, 175, 55, 0.22)', border: 'rgba(212, 175, 55, 0.55)', label: '15' },
  { weight: 10, bg: 'rgba(80, 150, 100, 0.25)', border: 'rgba(80, 150, 100, 0.6)', label: '10' },
  { weight: 5, bg: 'rgba(180, 180, 180, 0.18)', border: 'rgba(200, 200, 200, 0.5)', label: '5' },
  { weight: 2.5, bg: 'rgba(160, 160, 160, 0.15)', border: 'rgba(180, 180, 180, 0.45)', label: '2.5' },
  { weight: 1.25, bg: 'rgba(120, 120, 120, 0.15)', border: 'rgba(150, 150, 150, 0.4)', label: '1.25' },
];

const haptic = () => { if ('vibrate' in navigator) navigator.vibrate(18); };

export default function PlateCalculator({ isOpen, onClose }) {
  const [targetWeight, setTargetWeight] = useState('');
  const [isSmith, setIsSmith] = useState(false);
  const [smithOffset, setSmithOffset] = useState('7');
  const [enabledPlates, setEnabledPlates] = useState(
    PLATES.reduce((acc, p) => ({ ...acc, [p.weight]: true }), {})
  );

  const barWeight = isSmith ? (parseFloat(smithOffset) || 0) : 20;

  const togglePlate = (weight) => {
    haptic();
    setEnabledPlates(prev => ({ ...prev, [weight]: !prev[weight] }));
  };

  const calculatePlates = (total) => {
    if (!total || total <= barWeight) return [];
    let remaining = (total - barWeight) / 2;
    const result = [];
    for (const plate of PLATES.filter(p => enabledPlates[p.weight])) {
      while (remaining >= plate.weight - 0.001) {
        result.push(plate);
        remaining -= plate.weight;
      }
    }
    return result;
  };

  const plates = calculatePlates(parseFloat(targetWeight));
  const actualWeight = barWeight + plates.reduce((s, p) => s + p.weight, 0) * 2;

  if (!isOpen) return null;

  const plateHeight = (w) => Math.max(22, Math.min(56, 14 + w * 1.7));
  const plateWidth = (w) => Math.max(7, Math.min(16, 5 + w * 0.35));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: '#080808' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-10 pb-4"
          style={{ borderBottom: '0.5px solid rgba(212,175,55,0.15)' }}
        >
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-white tracking-[0.15em] text-base uppercase" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
              Plate Calculator
            </h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 space-y-5 py-5" style={{ paddingBottom: 120 }}>

          {/* Bar mode toggle */}
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(212,175,55,0.18)' }}
          >
            <div>
              <p className="text-white/80 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {isSmith ? 'Smith Machine' : 'Olympic Bar'}
              </p>
              <p className="text-white/30 text-xs mt-0.5">
                {isSmith ? `Starting resistance: ${smithOffset}kg` : 'Bar: 20kg'}
              </p>
            </div>
            {/* Amber Glass Toggle */}
            <button
              onClick={() => { haptic(); setIsSmith(s => !s); }}
              className="relative w-14 h-7 rounded-full transition-all duration-300 flex items-center"
              style={{
                background: isSmith
                  ? 'rgba(156, 126, 70, 0.35)'
                  : 'rgba(255,255,255,0.08)',
                border: isSmith ? '0.5px solid rgba(212,175,55,0.5)' : '0.5px solid rgba(255,255,255,0.15)',
              }}
            >
              <motion.div
                animate={{ x: isSmith ? 30 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="w-5 h-5 rounded-full absolute"
                style={{
                  background: isSmith
                    ? 'linear-gradient(135deg, #D4AF37, #F4D03F)'
                    : 'rgba(255,255,255,0.4)',
                  boxShadow: isSmith ? '0 0 8px rgba(212,175,55,0.6)' : 'none',
                }}
              />
            </button>
          </div>

          {/* Smith offset input */}
          <AnimatePresence>
            {isSmith && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(156,126,70,0.08)', border: '0.5px solid rgba(156,126,70,0.3)' }}
                >
                  <p className="text-[#9C7E46] text-xs uppercase tracking-[0.15em] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Starting Resistance (kg)
                  </p>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={smithOffset}
                    onChange={e => setSmithOffset(e.target.value)}
                    className="w-full text-center text-white text-xl py-3 rounded-xl outline-none"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '0.5px solid rgba(156,126,70,0.4)',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Target weight input */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(212,175,55,0.18)' }}
          >
            <p className="text-white/30 text-xs uppercase tracking-[0.15em] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Target Weight (kg)
            </p>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 100"
              value={targetWeight}
              onChange={e => setTargetWeight(e.target.value)}
              className="w-full text-center text-white text-3xl py-3 rounded-xl outline-none"
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '0.5px solid rgba(212,175,55,0.2)',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 300,
              }}
            />
          </div>

          {/* Available plates */}
          <div>
            <p className="text-white/30 text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Available Plates
            </p>
            <div className="flex flex-wrap gap-2">
              {PLATES.map(plate => {
                const on = enabledPlates[plate.weight];
                return (
                  <button
                    key={plate.weight}
                    onClick={() => togglePlate(plate.weight)}
                    className="px-3 py-2 rounded-xl text-xs transition-all"
                    style={{
                      background: on ? plate.bg : 'rgba(255,255,255,0.04)',
                      border: `0.5px solid ${on ? plate.border : 'rgba(255,255,255,0.1)'}`,
                      color: on ? '#fff' : 'rgba(255,255,255,0.3)',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    {plate.label}kg
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barbell visualization */}
          {plates.length > 0 && (
            <div>
              <p className="text-white/30 text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Barbell
              </p>
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(212,175,55,0.12)' }}
              >
                <div className="relative h-16 flex items-center">
                  {/* Bar line */}
                  <div
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full"
                    style={{
                      background: isSmith
                        ? 'linear-gradient(90deg, rgba(156,126,70,0.5), rgba(156,126,70,0.8), rgba(156,126,70,0.5))'
                        : 'linear-gradient(90deg, rgba(140,140,140,0.4), rgba(200,200,200,0.7), rgba(140,140,140,0.4))',
                      boxShadow: isSmith ? '0 0 12px rgba(156,126,70,0.4)' : 'none',
                    }}
                  />

                  {/* Left plates */}
                  <div className="absolute left-4 flex items-center h-full">
                    {[...plates].reverse().map((plate, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
                        style={{
                          width: plateWidth(plate.weight),
                          height: plateHeight(plate.weight),
                          background: plate.bg,
                          border: `0.5px solid ${plate.border}`,
                          borderRadius: 3,
                          marginLeft: i === 0 ? 0 : -1,
                          boxShadow: `inset 0 0 6px rgba(0,0,0,0.3), 0 0 4px rgba(212,175,55,0.12)`,
                          outline: '0.5px solid rgba(212,175,55,0.25)',
                          outlineOffset: '-1px',
                        }}
                      />
                    ))}
                  </div>

                  {/* Right plates */}
                  <div className="absolute right-4 flex items-center h-full flex-row-reverse">
                    {[...plates].reverse().map((plate, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
                        style={{
                          width: plateWidth(plate.weight),
                          height: plateHeight(plate.weight),
                          background: plate.bg,
                          border: `0.5px solid ${plate.border}`,
                          borderRadius: 3,
                          marginRight: i === 0 ? 0 : -1,
                          boxShadow: `inset 0 0 6px rgba(0,0,0,0.3), 0 0 4px rgba(212,175,55,0.12)`,
                          outline: '0.5px solid rgba(212,175,55,0.25)',
                          outlineOffset: '-1px',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plate breakdown */}
          {plates.length > 0 && (
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(212,175,55,0.12)' }}
            >
              <p className="text-white/30 text-xs uppercase tracking-[0.2em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Per Side
              </p>
              <div className="flex flex-wrap gap-2">
                {[...new Set(plates.map(p => p.weight))].map(w => {
                  const count = plates.filter(p => p.weight === w).length;
                  const plate = PLATES.find(p => p.weight === w);
                  return (
                    <div
                      key={w}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: plate.bg, border: `0.5px solid ${plate.border}` }}
                    >
                      <span className="text-white/80 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {count}× {w}kg
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-white/8 flex items-center justify-between">
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-[0.1em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {isSmith ? 'Smith Machine' : 'Bar'}
                  </p>
                  <p className="text-white/50 text-sm">{barWeight}kg</p>
                </div>
                <div className="text-right">
                  <p className="text-white/30 text-xs uppercase tracking-[0.1em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Total
                  </p>
                  <p className="text-2xl" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    background: 'linear-gradient(135deg, #F4D03F, #D4AF37)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {actualWeight}kg
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Clear button */}
          <button
            onClick={() => { setTargetWeight(''); haptic(); }}
            className="w-full py-4 rounded-2xl text-white/30 text-sm tracking-[0.15em] uppercase transition-all hover:text-white/50"
            style={{
              border: '0.5px dashed rgba(255,255,255,0.12)',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            Clear
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}