import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Dumbbell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/shared/ThemeContext';

const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'glutes', 'forearms', 'calves'];
const EQUIPMENT_OPTIONS = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'bands'];

export default function CreateExerciseModal({ onClose, onCreated }) {
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState({
    name: '',
    muscle_group: '',
    equipment: '',
    secondary_muscles: [],
    instructions: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(29,29,31,0.45)';
  const cardBg = isDarkMode ? 'rgba(20,16,6,0.98)' : 'rgba(255,252,240,0.98)';
  const inputBg = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.75)';
  const borderColor = isDarkMode ? 'rgba(212,175,55,0.2)' : 'rgba(225,193,110,0.4)';
  const chipBg = isDarkMode ? 'rgba(212,175,55,0.07)' : 'rgba(156,126,70,0.08)';
  const chipActiveBg = isDarkMode ? 'rgba(212,175,55,0.2)' : 'rgba(156,126,70,0.18)';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleSecondary = (muscle) => {
    setForm(prev => ({
      ...prev,
      secondary_muscles: prev.secondary_muscles.includes(muscle)
        ? prev.secondary_muscles.filter(m => m !== muscle)
        : [...prev.secondary_muscles, muscle],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.muscle_group) return;
    setSaving(true);

    let image_url = null;
    if (imageFile) {
      setUploading(true);
      const result = await base44.integrations.Core.UploadFile({ file: imageFile });
      image_url = result.file_url;
      setUploading(false);
    }

    const exercise = await base44.entities.Exercise.create({
      name: form.name.trim(),
      muscle_group: form.muscle_group,
      equipment: form.equipment || undefined,
      secondary_muscles: form.secondary_muscles,
      instructions: form.instructions.trim() || undefined,
      image_url: image_url || undefined,
      image_url_dark: image_url || undefined,
    });

    setSaving(false);
    onCreated(exercise);
  };

  const isValid = form.name.trim() && form.muscle_group;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full rounded-t-3xl overflow-y-auto"
        style={{
          background: cardBg,
          border: `0.5px solid ${borderColor}`,
          borderBottom: 'none',
          maxHeight: '90vh',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mt-4 mb-5" style={{ background: isDarkMode ? 'rgba(212,175,55,0.25)' : 'rgba(156,126,70,0.3)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 mb-6">
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: textPrimary, fontSize: 17 }}>
            Create Exercise
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" style={{ color: textMuted }} />
          </button>
        </div>

        <div className="px-6 space-y-5">
          {/* Image Upload */}
          <label className="block cursor-pointer">
            <p className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: isDarkMode ? 'rgba(212,175,55,0.7)' : '#9C7E46', fontFamily: 'Montserrat, sans-serif' }}>
              Photo (optional)
            </p>
            <div
              className="w-full h-36 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{ background: inputBg, border: `1.5px dashed ${borderColor}` }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-7 h-7" style={{ color: textMuted }} strokeWidth={1.5} />
                  <span className="text-xs" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>Tap to upload</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>

          {/* Name */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: isDarkMode ? 'rgba(212,175,55,0.7)' : '#9C7E46', fontFamily: 'Montserrat, sans-serif' }}>
              Exercise Name *
            </p>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Cable Pullover"
              className="w-full px-4 py-3 rounded-xl outline-none text-sm"
              style={{ background: inputBg, border: `0.5px solid ${borderColor}`, color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>

          {/* Primary Muscle Group */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: isDarkMode ? 'rgba(212,175,55,0.7)' : '#9C7E46', fontFamily: 'Montserrat, sans-serif' }}>
              Primary Muscle Group *
            </p>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map(m => (
                <button
                  key={m}
                  onClick={() => setForm(p => ({ ...p, muscle_group: m }))}
                  className="px-3 py-1.5 rounded-full text-xs capitalize"
                  style={{
                    background: form.muscle_group === m ? chipActiveBg : chipBg,
                    border: `${form.muscle_group === m ? '1px' : '0.5px'} solid ${form.muscle_group === m ? 'rgba(212,175,55,0.6)' : borderColor}`,
                    color: form.muscle_group === m ? '#D4AF37' : textMuted,
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: isDarkMode ? 'rgba(212,175,55,0.7)' : '#9C7E46', fontFamily: 'Montserrat, sans-serif' }}>
              Equipment
            </p>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map(eq => (
                <button
                  key={eq}
                  onClick={() => setForm(p => ({ ...p, equipment: p.equipment === eq ? '' : eq }))}
                  className="px-3 py-1.5 rounded-full text-xs capitalize"
                  style={{
                    background: form.equipment === eq ? 'rgba(156,126,70,0.18)' : chipBg,
                    border: `${form.equipment === eq ? '1px' : '0.5px'} solid ${form.equipment === eq ? 'rgba(156,126,70,0.6)' : borderColor}`,
                    color: form.equipment === eq ? (isDarkMode ? '#D4AF37' : '#9C7E46') : textMuted,
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Muscles */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: isDarkMode ? 'rgba(212,175,55,0.7)' : '#9C7E46', fontFamily: 'Montserrat, sans-serif' }}>
              Secondary Muscles
            </p>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.filter(m => m !== form.muscle_group).map(m => (
                <button
                  key={m}
                  onClick={() => toggleSecondary(m)}
                  className="px-3 py-1.5 rounded-full text-xs capitalize"
                  style={{
                    background: form.secondary_muscles.includes(m) ? 'rgba(189,181,213,0.15)' : chipBg,
                    border: `${form.secondary_muscles.includes(m) ? '1px' : '0.5px'} solid ${form.secondary_muscles.includes(m) ? 'rgba(189,181,213,0.5)' : borderColor}`,
                    color: form.secondary_muscles.includes(m) ? '#BDB5D5' : textMuted,
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: isDarkMode ? 'rgba(212,175,55,0.7)' : '#9C7E46', fontFamily: 'Montserrat, sans-serif' }}>
              Instructions (optional)
            </p>
            <textarea
              value={form.instructions}
              onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
              placeholder="How to perform this exercise..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
              style={{ background: inputBg, border: `0.5px solid ${borderColor}`, color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>

          {/* Save Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={!isValid || saving}
            className="w-full py-4 rounded-2xl text-sm flex items-center justify-center gap-2"
            style={{
              background: isValid ? 'linear-gradient(135deg, #D4AF37, #D4AF37)' : 'rgba(212,175,55,0.15)',
              color: isValid ? '#0a0a0a' : 'rgba(212,175,55,0.4)',
              fontFamily: 'Montserrat, sans-serif',
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}
          >
            <Dumbbell className="w-4 h-4" strokeWidth={1.5} />
            {saving ? (uploading ? 'Uploading image…' : 'Saving…') : 'Create Exercise'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}