import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';

const PEACH = '#FFDAB9';
const PEACH_DIM = 'rgba(255,218,185,0.12)';
const PEACH_BORDER = 'rgba(255,218,185,0.3)';

const FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', required: true },
  { key: 'protein', label: 'Protein', unit: 'g', required: false },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g', required: false },
  { key: 'fat', label: 'Fat', unit: 'g', required: false },
  { key: 'fiber', label: 'Fiber', unit: 'g', required: false },
];

export default function QuickAddModal({ isOpen, onClose, onAdd, selectedMeal }) {
  const { isDarkMode } = useTheme();
  const [values, setValues] = useState({ calories: '', protein: '', carbs: '', fat: '', fiber: '' });
  const [name, setName] = useState('');

  const bg = isDarkMode ? 'rgba(10,8,4,0.97)' : 'rgba(255,252,245,0.97)';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(29,29,31,0.45)';
  const inputBg = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)';
  const inputBorder = isDarkMode ? 'rgba(255,218,185,0.2)' : 'rgba(255,218,185,0.45)';

  const handleAdd = () => {
    if (!values.calories) return;
    onAdd({
      name: name || 'Quick Add',
      calories: parseFloat(values.calories) || 0,
      protein: parseFloat(values.protein) || 0,
      carbs: parseFloat(values.carbs) || 0,
      fat: parseFloat(values.fat) || 0,
      fiber: parseFloat(values.fiber) || 0,
      serving_size: 1,
      serving_unit: 'serving',
      availableUnits: [{
        servingDescription: '1 serving',
        unit: 'serving', amount: 1, metricUnit: 'serving',
        calories: parseFloat(values.calories) || 0,
        protein: parseFloat(values.protein) || 0,
        carbs: parseFloat(values.carbs) || 0,
        fat: parseFloat(values.fat) || 0,
        fiber: parseFloat(values.fiber) || 0,
        isDefault: true
      }]
    });
    setValues({ calories: '', protein: '', carbs: '', fat: '', fiber: '' });
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: bg }}
    >
      <div className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0">
        <button onClick={onClose}><X className="w-5 h-5" style={{ color: textMuted }} /></button>
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>Quick Add</p>
        <button onClick={handleAdd} disabled={!values.calories}>
          <Check className="w-5 h-5" style={{ color: values.calories ? PEACH : textMuted }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {/* Name */}
        <div className="mb-1 mt-2">
          <label className="text-[10px] uppercase tracking-[0.2em] mb-2 block" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
            Description (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Post-workout shake"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl outline-none text-sm"
            style={{ background: inputBg, border: `0.5px solid ${inputBorder}`, color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}
          />
        </div>

        {/* Meal chip */}
        <div className="mt-4 mb-6 flex items-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>Adding to</p>
          <div className="px-3 py-1 rounded-full" style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}` }}>
            <span className="text-xs capitalize" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>{selectedMeal}</span>
          </div>
        </div>

        {/* Nutrition fields */}
        <div className="space-y-1">
          {FIELDS.map(field => (
            <div key={field.key} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)', border: `0.5px solid ${isDarkMode ? 'rgba(255,218,185,0.1)' : 'rgba(255,218,185,0.25)'}` }}>
              <div>
                <p className="text-sm" style={{ color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{field.label}</p>
                <p className="text-[10px]" style={{ color: textMuted }}>{field.unit}{field.required ? ' · required' : ' · optional'}</p>
              </div>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={values[field.key]}
                onChange={e => setValues(p => ({ ...p, [field.key]: e.target.value }))}
                className="w-24 text-right px-3 py-2 rounded-lg outline-none text-sm"
                style={{ background: inputBg, border: `0.5px solid ${inputBorder}`, color: field.required ? PEACH : textPrimary, fontFamily: 'Montserrat, sans-serif' }}
              />
            </div>
          ))}
        </div>

        {/* Total calorie preview */}
        {values.calories && (
          <div className="mt-6 p-4 rounded-2xl text-center" style={{ background: PEACH_DIM, border: `0.5px solid ${PEACH_BORDER}` }}>
            <p className="text-3xl" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>{values.calories}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>kcal</p>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!values.calories}
          className="w-full mt-6 py-4 rounded-2xl"
          style={{
            background: values.calories ? `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)` : PEACH_DIM,
            color: values.calories ? '#1D1D1F' : PEACH,
            fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            opacity: values.calories ? 1 : 0.5
          }}
        >
          Add to Diary
        </button>
      </div>
    </motion.div>
  );
}