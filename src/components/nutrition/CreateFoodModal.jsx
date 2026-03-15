import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/shared/ThemeContext';

const PEACH = '#FFDAB9';
const PEACH_DIM = 'rgba(255,218,185,0.12)';
const PEACH_BORDER = 'rgba(255,218,185,0.3)';

const NUTRITION_FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', required: true },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Total Carbohydrates', unit: 'g' },
  { key: 'fat', label: 'Total Fat', unit: 'g' },
  { key: 'fiber', label: 'Dietary Fiber', unit: 'g' },
];

export default function CreateFoodModal({ isOpen, onClose, onCreated }) {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState(1); // 1: basic info | 2: nutrition
  const [form, setForm] = useState({ name: '', brand: '', serving_size: '100', serving_unit: 'g', calories: '', protein: '', carbs: '', fat: '', fiber: '' });
  const [saving, setSaving] = useState(false);

  const bg = isDarkMode ? 'rgba(10,8,4,0.97)' : 'rgba(255,252,245,0.97)';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(29,29,31,0.45)';
  const inputBg = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)';
  const inputBorder = isDarkMode ? 'rgba(255,218,185,0.2)' : 'rgba(255,218,185,0.45)';
  const sectionBg = isDarkMode ? 'rgba(255,218,185,0.05)' : 'rgba(255,218,185,0.08)';

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.name || !form.calories) return;
    setSaving(true);
    const cal = parseFloat(form.calories) || 0;
    const prot = parseFloat(form.protein) || 0;
    const carbs = parseFloat(form.carbs) || 0;
    const fat = parseFloat(form.fat) || 0;
    const fiber = parseFloat(form.fiber) || 0;
    const servSize = parseFloat(form.serving_size) || 100;

    // Pass directly as a food object (will be handled as manual food)
    onCreated({
      name: form.name,
      brand: form.brand,
      calories: cal,
      protein: prot,
      carbs,
      fat,
      fiber,
      serving_size: servSize,
      serving_unit: form.serving_unit,
      source: 'custom',
      availableUnits: [
        {
          servingDescription: `${servSize}${form.serving_unit}`,
          unit: form.serving_unit,
          amount: servSize,
          metricUnit: form.serving_unit,
          calories: cal,
          protein: prot,
          carbs,
          fat,
          fiber,
          isDefault: true
        },
        {
          servingDescription: `1${form.serving_unit}`,
          unit: form.serving_unit,
          amount: 1,
          metricUnit: form.serving_unit,
          calories: cal / servSize,
          protein: prot / servSize,
          carbs: carbs / servSize,
          fat: fat / servSize,
          fiber: fiber / servSize,
          isDefault: false
        }
      ]
    });
    setSaving(false);
    onClose();
    setStep(1);
    setForm({ name: '', brand: '', serving_size: '100', serving_unit: 'g', calories: '', protein: '', carbs: '', fat: '', fiber: '' });
  };

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
        <button onClick={() => { if (step === 2) setStep(1); else onClose(); }}>
          <X className="w-5 h-5" style={{ color: textMuted }} />
        </button>
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>
          {step === 1 ? 'Create Food' : 'Nutrition Facts'}
        </p>
        {step === 2 ? (
          <button onClick={handleSave} disabled={!form.calories || saving}>
            <span className="text-xs uppercase tracking-[0.15em]" style={{ color: form.calories ? PEACH : textMuted, fontFamily: 'Montserrat, sans-serif' }}>
              {saving ? 'Saving…' : 'Save'}
            </span>
          </button>
        ) : (
          <button onClick={() => form.name && setStep(2)} disabled={!form.name}>
            <span className="text-xs uppercase tracking-[0.15em]" style={{ color: form.name ? PEACH : textMuted, fontFamily: 'Montserrat, sans-serif' }}>Next</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {step === 1 && (
          <div className="space-y-4 mt-2">
            {/* Basic info section */}
            <div className="rounded-2xl overflow-hidden" style={{ background: sectionBg, border: `0.5px solid ${PEACH_BORDER}` }}>
              <div className="px-4 py-2 border-b" style={{ borderColor: PEACH_BORDER }}>
                <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>Food Info</p>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] mb-1.5 block" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>Brand (optional)</label>
                  <input type="text" placeholder="e.g. Homemade, Trader Joe's" value={form.brand} onChange={e => set('brand', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                    style={{ background: inputBg, border: `0.5px solid ${inputBorder}`, color: textPrimary, fontFamily: 'Montserrat, sans-serif' }} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] mb-1.5 block" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>Food Name *</label>
                  <input type="text" placeholder="e.g. Chicken & Rice Bowl" value={form.name} onChange={e => set('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                    style={{ background: inputBg, border: `0.5px solid ${form.name ? PEACH_BORDER : inputBorder}`, color: textPrimary, fontFamily: 'Montserrat, sans-serif' }} />
                </div>
              </div>
            </div>

            {/* Serving size section */}
            <div className="rounded-2xl overflow-hidden" style={{ background: sectionBg, border: `0.5px solid ${PEACH_BORDER}` }}>
              <div className="px-4 py-2 border-b" style={{ borderColor: PEACH_BORDER }}>
                <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>Serving</p>
              </div>
              <div className="p-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-[0.15em] mb-1.5 block" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>Size *</label>
                    <input type="number" placeholder="100" value={form.serving_size} onChange={e => set('serving_size', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl outline-none text-sm text-center"
                      style={{ background: inputBg, border: `0.5px solid ${inputBorder}`, color: textPrimary, fontFamily: 'Montserrat, sans-serif' }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-[0.15em] mb-1.5 block" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>Unit *</label>
                    <select value={form.serving_unit} onChange={e => set('serving_unit', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                      style={{ background: inputBg, border: `0.5px solid ${inputBorder}`, color: textPrimary, fontFamily: 'Montserrat, sans-serif', WebkitAppearance: 'none' }}>
                      {['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'portion', 'piece', 'slice', 'container'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => form.name && setStep(2)} disabled={!form.name}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
              style={{
                background: form.name ? `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)` : PEACH_DIM,
                color: form.name ? '#1D1D1F' : PEACH, fontFamily: 'Montserrat, sans-serif',
                fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
                opacity: form.name ? 1 : 0.5
              }}>
              Next: Nutrition Facts <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-1 mt-2">
            <div className="rounded-2xl overflow-hidden" style={{ background: sectionBg, border: `0.5px solid ${PEACH_BORDER}` }}>
              <div className="px-4 py-2 border-b" style={{ borderColor: PEACH_BORDER }}>
                <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>
                  Nutrition Facts · per {form.serving_size}{form.serving_unit}
                </p>
              </div>
              <div className="divide-y" style={{ borderColor: isDarkMode ? 'rgba(255,218,185,0.07)' : 'rgba(255,218,185,0.15)' }}>
                {NUTRITION_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm" style={{ color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{field.label}</p>
                      <p className="text-[9px]" style={{ color: textMuted }}>{field.unit}{field.required ? ' · required' : ' · optional'}</p>
                    </div>
                    <input
                      type="number" inputMode="decimal" placeholder="—"
                      value={form[field.key]}
                      onChange={e => set(field.key, e.target.value)}
                      className="w-20 text-right px-3 py-2 rounded-lg outline-none text-sm"
                      style={{ background: inputBg, border: `0.5px solid ${field.required && !form[field.key] ? 'rgba(255,100,100,0.3)' : inputBorder}`, color: field.required ? PEACH : textPrimary, fontFamily: 'Montserrat, sans-serif' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleSave} disabled={!form.calories || saving}
              className="w-full mt-6 py-4 rounded-2xl"
              style={{
                background: form.calories ? `linear-gradient(135deg, ${PEACH} 0%, #FFB888 100%)` : PEACH_DIM,
                color: form.calories ? '#1D1D1F' : PEACH, fontFamily: 'Montserrat, sans-serif',
                fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
                opacity: form.calories ? 1 : 0.5
              }}>
              {saving ? 'Saving…' : 'Add to Diary'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}