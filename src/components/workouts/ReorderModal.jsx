// Flutter equivalent: ReorderableListView with onReorder callback
// Dedicated reorder view — bottom sheet with drag handles

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Check } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';

export default function ReorderModal({ exercises, onConfirm, onClose }) {
  const { isDarkMode } = useTheme();
  const [ordered, setOrdered] = useState(exercises.map((ex, i) => ({ ...ex, _origIdx: i })));
  const dragIndexRef = React.useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const bg = isDarkMode ? 'rgba(10,8,4,0.97)' : 'rgba(242,239,233,0.98)';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1E1C18';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(30,28,24,0.5)';
  const gold = isDarkMode ? '#D4AF37' : '#9A7A14';
  const rowBg = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)';
  const rowBorder = isDarkMode ? 'rgba(212,175,55,0.12)' : 'rgba(184,148,31,0.2)';

  const handleDragStart = (i) => { dragIndexRef.current = i; };
  const handleDragOver = (e, i) => { e.preventDefault(); setDragOver(i); };
  const handleDrop = (e, dropIdx) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === dropIdx) { setDragOver(null); return; }
    const next = [...ordered];
    const [moved] = next.splice(from, 1);
    next.splice(dropIdx, 0, moved);
    setOrdered(next);
    dragIndexRef.current = null;
    setDragOver(null);
  };
  const handleDragEnd = () => { dragIndexRef.current = null; setDragOver(null); };

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: bg }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0"
        style={{ borderBottom: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.12)' : 'rgba(184,148,31,0.18)'}` }}>
        <button onClick={onClose} className="text-xs uppercase tracking-[0.2em]" style={{ color: textMuted }}>
          Cancel
        </button>
        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: gold, fontFamily: 'Montserrat' }}>
          Reorder Exercises
        </p>
        <button
          onClick={() => onConfirm(ordered)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
          style={{ background: isDarkMode ? 'rgba(212,175,55,0.15)' : 'rgba(154,122,20,0.12)', color: gold, fontFamily: 'Montserrat' }}
        >
          <Check className="w-3.5 h-3.5" />
          Done
        </button>
      </div>

      <p className="text-[11px] text-center py-3" style={{ color: textMuted, fontFamily: 'Montserrat' }}>
        Drag to reorder
      </p>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-2">
        {ordered.map((ex, i) => (
          <div
            key={`${ex.exercise_id || ex.exercise_name}-${i}`}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{
              background: rowBg,
              border: `0.5px solid ${dragOver === i ? gold : rowBorder}`,
              opacity: dragIndexRef.current === i ? 0.5 : 1,
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: textPrimary, fontFamily: 'Montserrat' }}>
                {ex.exercise_name}
              </p>
              {ex.muscle_group && (
                <p className="text-[10px] capitalize mt-0.5" style={{ color: textMuted }}>
                  {ex.muscle_group}
                </p>
              )}
            </div>
            <GripVertical className="w-5 h-5 flex-shrink-0" style={{ color: textMuted, cursor: 'grab' }} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}