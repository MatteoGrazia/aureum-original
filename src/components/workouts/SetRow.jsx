// FIX 4 — SQUARE INPUT BOXES: 56×56px fixed square inputs for weight and reps

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, MessageSquare, X } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';

const SET_TYPES = [
  { key: 'normal',  label: 'N', darkClass: 'text-white/50 bg-white/10',          lightClass: 'text-[#1E1C18]/50 bg-[#1E1C18]/08' },
  { key: 'warmup',  label: 'W', darkClass: 'text-orange-400 bg-orange-500/20',    lightClass: 'text-orange-600 bg-orange-500/15' },
  { key: 'dropset', label: 'D', darkClass: 'text-blue-400 bg-blue-500/20',        lightClass: 'text-blue-700 bg-blue-500/15' },
  { key: 'failure', label: 'F', darkClass: 'text-red-400 bg-red-500/20',          lightClass: 'text-red-700 bg-red-500/15' },
];

const epley1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 1) return weight || 0;
  return Math.round(weight * (1 + reps / 30));
};

// FIX 4: square input box — 56×56px on mobile, 64×64px on larger screens
const SQUARE_INPUT_STYLE = {
  width: 56,
  height: 56,
  minWidth: 56,
  flexShrink: 0,
  borderRadius: 8,
  textAlign: 'center',
  fontSize: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Montserrat, sans-serif',
};

const SetRow = React.memo(function SetRow({ set, index, onUpdate, onDelete, onComplete, previousSet, peak1RM, isBodyweight = false }) {
  const [showComment, setShowComment] = useState(false);
  const { isDarkMode } = useTheme();
  const gold = isDarkMode ? '#D4AF37' : '#9A7A14';
  const fieldBg = isDarkMode ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.95)';
  const fieldBorder = isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(184,148,31,0.28)';
  const fieldColor = isDarkMode ? '#FFFFFF' : '#1E1C18';
  const dimText = isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(30,28,24,0.40)';
  const rowBg = set.completed
    ? (isDarkMode ? 'rgba(156,126,70,0.12)' : 'rgba(184,148,31,0.10)')
    : (isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.80)');

  const typeIndex = SET_TYPES.findIndex(t => t.key === set.type);
  const typeInfo = SET_TYPES[typeIndex === -1 ? 0 : typeIndex];

  const cycleType = () => {
    const next = SET_TYPES[(typeIndex + 1) % SET_TYPES.length].key;
    onUpdate({ ...set, type: next });
  };

  const current1RM = epley1RM(set.weight, set.reps);
  const isPR = !set.completed && current1RM > 0 && peak1RM > 0 && current1RM > peak1RM;
  const show1RM = set.weight > 0 && set.reps > 0 && !isBodyweight;

  const ghostWeight = previousSet?.weight ? String(previousSet.weight) : '—';
  const ghostReps = previousSet?.reps ? String(previousSet.reps) : '—';

  return (
    <motion.div
      animate={isPR ? { boxShadow: ['0 0 0px rgba(212,175,55,0)', '0 0 14px rgba(212,175,55,0.35)', '0 0 0px rgba(212,175,55,0)'] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
      className="rounded-xl overflow-hidden"
    >
      {/* Main row */}
      <div
        className="flex items-center gap-2 py-2 px-2 transition-all duration-300"
        style={{
          background: rowBg,
          opacity: set.completed ? 0.75 : 1,
          border: isPR ? `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.4)' : 'rgba(154,122,20,0.45)'}` : '0.5px solid transparent',
          borderRadius: (show1RM || showComment || set.comment) ? '12px 12px 0 0' : 12,
        }}
      >
        {/* Type badge */}
        <button
          onClick={cycleType}
          disabled={set.completed}
          className={`w-7 h-7 rounded-lg text-xs font-medium flex items-center justify-center flex-shrink-0 transition-colors ${isDarkMode ? typeInfo.darkClass : typeInfo.lightClass}`}
        >
          {typeInfo.label}
        </button>

        {/* Set index */}
        <span className="text-xs w-4 text-center flex-shrink-0" style={{ color: dimText }}>{index + 1}</span>

        {/* FIX 4: Weight — square input box */}
        {isBodyweight ? (
          <div
            style={{
              ...SQUARE_INPUT_STYLE,
              background: 'rgba(212,175,55,0.05)',
              border: '1px solid rgba(212,175,55,0.15)',
              color: 'rgba(212,175,55,0.70)',
            }}
          >
            BW
          </div>
        ) : (
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={set.weight || ''}
            onChange={e => onUpdate({ ...set, weight: parseFloat(e.target.value) || 0 })}
            placeholder={ghostWeight}
            disabled={set.completed}
            className="disabled:opacity-50 outline-none"
            style={{
              ...SQUARE_INPUT_STYLE,
              background: fieldBg,
              border: fieldBorder,
              color: fieldColor,
            }}
          />
        )}
        <span className="text-[10px] flex-shrink-0" style={{ color: dimText, width: 14, textAlign: 'center' }}>
          {isBodyweight ? '' : 'kg'}
        </span>

        {/* FIX 4: Reps — square input box */}
        <input
          type="number"
          inputMode="numeric"
          value={set.reps || ''}
          onChange={e => onUpdate({ ...set, reps: parseInt(e.target.value) || 0 })}
          placeholder={ghostReps}
          disabled={set.completed}
          className="disabled:opacity-50 outline-none"
          style={{
            ...SQUARE_INPUT_STYLE,
            background: fieldBg,
            border: fieldBorder,
            color: fieldColor,
          }}
        />
        <span className="text-[10px] flex-shrink-0" style={{ color: dimText, width: 14, textAlign: 'center' }}>rps</span>

        {/* Comment toggle */}
        <button
          onClick={() => setShowComment(p => !p)}
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ background: (showComment || set.comment) ? (isDarkMode ? 'rgba(212,175,55,0.12)' : 'rgba(154,122,20,0.10)') : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(30,28,24,0.06)') }}
        >
          <MessageSquare className="w-3 h-3" style={{ color: set.comment ? gold : dimText }} />
        </button>

        {/* Complete toggle */}
        <button
          onClick={() => onComplete({ ...set, completed: !set.completed })}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={set.completed
            ? { background: 'rgba(156,126,70,0.25)', border: '1px solid #9C7E46' }
            : { background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(30,28,24,0.06)', border: isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(30,28,24,0.18)' }
          }
        >
          <Check className="w-4 h-4 transition-colors" style={{ color: set.completed ? '#D4AF37' : (isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(30,28,24,0.30)') }} />
        </button>

        {/* Delete */}
        {!set.completed ? (
          <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-3 h-3 text-red-400/70" />
          </button>
        ) : (
          <div className="w-7 flex-shrink-0" />
        )}
      </div>

      {/* Set-level comment field */}
      {(showComment || set.comment) && (
        <div
          className="px-3 py-2 flex items-center gap-2"
          style={{
            background: isDarkMode ? 'rgba(212,175,55,0.04)' : 'rgba(154,122,20,0.05)',
            borderTop: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.1)' : 'rgba(154,122,20,0.18)'}`,
          }}
        >
          <input
            type="text"
            value={set.comment || ''}
            onChange={e => onUpdate({ ...set, comment: e.target.value })}
            placeholder="Note for this set..."
            className="flex-1 text-xs outline-none bg-transparent"
            style={{ color: isDarkMode ? 'rgba(229,229,231,0.7)' : 'rgba(30,28,24,0.70)', fontFamily: 'Montserrat, sans-serif' }}
          />
          {set.comment && (
            <button onClick={() => { onUpdate({ ...set, comment: '' }); setShowComment(false); }}>
              <X className="w-3 h-3" style={{ color: dimText }} />
            </button>
          )}
        </div>
      )}

      {/* Info strip — 1RM */}
      {show1RM && (
        <div
          className="flex items-center justify-between px-3 py-1"
          style={{
            background: isPR ? (isDarkMode ? 'rgba(212,175,55,0.06)' : 'rgba(154,122,20,0.06)') : (isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(30,28,24,0.03)'),
            borderTop: `0.5px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(30,28,24,0.08)'}`,
            borderRadius: '0 0 12px 12px',
          }}
        >
          {isPR ? (
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[9px] uppercase tracking-[0.15em]"
              style={{ color: gold, fontFamily: 'Montserrat, sans-serif' }}
            >
              ★ PR — Peak {current1RM}kg
            </motion.span>
          ) : (
            <span className="text-[9px] tracking-[0.1em]" style={{ color: dimText, fontFamily: 'Montserrat, sans-serif' }}>
              1RM ~{current1RM}kg
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
});

export default SetRow;