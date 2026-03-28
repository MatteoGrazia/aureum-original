import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Dumbbell, ChevronRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/shared/ThemeContext';

const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'glutes', 'forearms', 'calves'];
const EQUIPMENT_OPTIONS = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'bands'];

function SelectDrawer({ title, options, value, onSelect, onClose, multi = false, selected = [] }) {
  const { isDarkMode } = useTheme();
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(29,29,31,0.45)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-end"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full rounded-t-3xl overflow-hidden"
        style={{
          background: isDarkMode ? 'rgba(12,12,12,0.98)' : 'rgba(248,248,246,0.98)',
          border: isDarkMode ? '0.5px solid rgba(212,175,55,0.15)' : '0.5px solid rgba(225,193,110,0.3)',
          borderBottom: 'none',
          backdropFilter: 'blur(30px)',
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-0.5 rounded-full mx-auto mt-4 mb-4" style={{ background: isDarkMode ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.2)' }} />
        <div className="flex items-center justify-between px-6 pb-4" style={{ borderBottom: `0.5px solid ${isDarkMode ? 'rgba(180,160,100,0.1)' : 'rgba(180,150,80,0.15)'}` }}>
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: isDarkMode ? 'rgba(212,175,55,0.5)' : 'rgba(156,126,70,0.6)', fontFamily: 'Montserrat, sans-serif' }}>{title}</p>
          <button onClick={onClose}><X className="w-4 h-4" style={{ color: textMuted }} /></button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '55vh' }}>
          {options.map((opt, i) => {
            const isActive = multi ? selected.includes(opt) : value === opt;
            return (
              <button
                key={opt}
                onClick={() => onSelect(opt)}
                className="w-full flex items-center justify-between px-6 py-4 transition-all capitalize"
                style={{
                  borderBottom: i < options.length - 1 ? `0.5px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` : 'none',
                  background: isActive ? 'rgba(212,175,55,0.07)' : 'transparent',
                }}
              >
                <span className="text-sm capitalize" style={{ color: isActive ? '#D4AF37' : textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{opt}</span>
                {isActive && <Check className="w-4 h-4" style={{ color: '#D4AF37' }} strokeWidth={1.5} />}
              </button>
            );
          })}
        </div>
        {multi && (
          <div className="px-6 pt-4">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl text-sm"
              style={{ background: 'rgba(212,175,55,0.08)', border: '0.5px solid rgba(212,175,55,0.2)', color: '#D4AF37', fontFamily: 'Montserrat, sans-serif' }}
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function CreateExerciseModal({ onClose, onCreated }) {
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState({ name: '', muscle_group: '', equipment: '', secondary_muscles: [], instructions: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(null); // 'muscle' | 'equipment' | 'secondary'

  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(29,29,31,0.45)';
  const cardBg = isDarkMode ? 'rgba(12,12,12,0.98)' : 'rgba(248,248,246,0.98)';
  const borderColor = isDarkMode ? 'rgba(212,175,55,0.15)' : 'rgba(225,193,110,0.35)';
  const labelColor = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(29,29,31,0.4)';
  const rowBg = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)';
  const valueColor = isDarkMode ? 'rgba(255,255,255,0.75)' : 'rgba(29,29,31,0.75)';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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

  const FieldRow = ({ label, value, placeholder, onTap }) => (
    <button
      onClick={onTap}
      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all active:scale-[0.99]"
      style={{ background: rowBg, border: `0.5px solid ${borderColor}` }}
    >
      <div className="text-left">
        <p className="text-[9px] uppercase tracking-[0.22em] mb-0.5" style={{ color: labelColor, fontFamily: 'Montserrat, sans-serif' }}>{label}</p>
        <p className="text-sm capitalize" style={{ color: value ? valueColor : textMuted, fontFamily: 'Montserrat, sans-serif' }}>{value || placeholder}</p>
      </div>
      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: textMuted }} strokeWidth={1.5} />
    </button>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
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
            maxHeight: '92vh',
            paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-8 h-0.5 rounded-full mx-auto mt-4 mb-5" style={{ background: isDarkMode ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.2)' }} />

          <div className="flex items-center justify-between px-6 mb-6">
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: textPrimary, fontSize: 17, letterSpacing: '0.08em' }}>
              Create Exercise
            </h2>
            <button onClick={onClose}>
              <X className="w-5 h-5" style={{ color: textMuted }} />
            </button>
          </div>

          <div className="px-6 space-y-3">
            {/* Image Upload */}
            <label className="block cursor-pointer">
              <div
                className="w-full h-32 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: rowBg, border: `0.5px solid ${borderColor}` }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6" style={{ color: textMuted }} strokeWidth={1.5} />
                    <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>Add photo</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>

            {/* Name */}
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Exercise name…"
              className="w-full px-4 py-3.5 rounded-xl outline-none text-sm"
              style={{ background: rowBg, border: `0.5px solid ${borderColor}`, color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}
            />

            {/* Drawer fields */}
            <FieldRow
              label="Primary Muscle"
              value={form.muscle_group}
              placeholder="Select muscle group"
              onTap={() => setOpenDrawer('muscle')}
            />
            <FieldRow
              label="Equipment"
              value={form.equipment}
              placeholder="Select equipment"
              onTap={() => setOpenDrawer('equipment')}
            />
            <FieldRow
              label="Secondary Muscles"
              value={form.secondary_muscles.length > 0 ? form.secondary_muscles.join(', ') : ''}
              placeholder="Select secondary muscles"
              onTap={() => setOpenDrawer('secondary')}
            />

            {/* Instructions */}
            <textarea
              value={form.instructions}
              onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
              placeholder="Instructions (optional)…"
              rows={3}
              className="w-full px-4 py-3.5 rounded-xl outline-none text-sm resize-none"
              style={{ background: rowBg, border: `0.5px solid ${borderColor}`, color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}
            />

            {/* Save */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={!isValid || saving}
              className="w-full py-4 rounded-2xl text-sm flex items-center justify-center gap-2 mt-2"
              style={{
                background: isValid
                  ? 'linear-gradient(135deg, #D4AF37 0%, #D4AF37 100%)'
                  : (isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                border: `0.5px solid ${isValid ? 'rgba(212,175,55,0.6)' : borderColor}`,
                color: isValid ? '#0a0a0a' : textMuted,
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '0.12em',
                cursor: isValid ? 'pointer' : 'not-allowed',
              }}
            >
              <Dumbbell className="w-4 h-4" strokeWidth={1.5} />
              {saving ? (uploading ? 'Uploading…' : 'Saving…') : 'CREATE EXERCISE'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Drawers */}
      <AnimatePresence>
        {openDrawer === 'muscle' && (
          <SelectDrawer
            title="Primary Muscle Group"
            options={MUSCLE_GROUPS}
            value={form.muscle_group}
            onSelect={v => { setForm(p => ({ ...p, muscle_group: v })); setOpenDrawer(null); }}
            onClose={() => setOpenDrawer(null)}
          />
        )}
        {openDrawer === 'equipment' && (
          <SelectDrawer
            title="Equipment"
            options={EQUIPMENT_OPTIONS}
            value={form.equipment}
            onSelect={v => { setForm(p => ({ ...p, equipment: p.equipment === v ? '' : v })); setOpenDrawer(null); }}
            onClose={() => setOpenDrawer(null)}
          />
        )}
        {openDrawer === 'secondary' && (
          <SelectDrawer
            title="Secondary Muscles"
            options={MUSCLE_GROUPS.filter(m => m !== form.muscle_group)}
            value={null}
            multi
            selected={form.secondary_muscles}
            onSelect={v => setForm(p => ({
              ...p,
              secondary_muscles: p.secondary_muscles.includes(v)
                ? p.secondary_muscles.filter(m => m !== v)
                : [...p.secondary_muscles, v],
            }))}
            onClose={() => setOpenDrawer(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}