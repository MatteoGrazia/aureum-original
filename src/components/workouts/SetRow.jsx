import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, MessageSquare, X } from 'lucide-react';

const SET_TYPES = [
  { key: 'normal', label: 'N', className: 'text-white/50 bg-white/10' },
  { key: 'warmup', label: 'W', className: 'text-orange-400 bg-orange-500/20' },
  { key: 'dropset', label: 'D', className: 'text-blue-400 bg-blue-500/20' },
  { key: 'failure', label: 'F', className: 'text-red-400 bg-red-500/20' },
];

const epley1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 1) return weight || 0;
  return Math.round(weight * (1 + reps / 30));
};

export default function SetRow({ set, index, onUpdate, onDelete, onComplete, previousSet, peak1RM, isBodyweight = false }) {
  const [showComment, setShowComment] = useState(false);

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
          background: set.completed ? 'rgba(156, 126, 70, 0.12)' : 'rgba(255,255,255,0.04)',
          opacity: set.completed ? 0.72 : 1,
          border: isPR ? '0.5px solid rgba(212,175,55,0.4)' : '0.5px solid transparent',
          borderRadius: (show1RM || showComment || set.comment) ? '12px 12px 0 0' : 12,
        }}
      >
        {/* Type badge */}
        <button
          onClick={cycleType}
          disabled={set.completed}
          className={`w-7 h-7 rounded-lg text-xs font-medium flex items-center justify-center flex-shrink-0 transition-colors ${typeInfo.className}`}
        >
          {typeInfo.label}
        </button>

        {/* Set index */}
        <span className="text-white/25 text-xs w-4 text-center flex-shrink-0">{index + 1}</span>

        {/* Weight — locked to bodyweight if bodyweight exercise */}
        {isBodyweight ? (
          <div
            className="flex-1 min-w-0 rounded-lg text-center text-[#D4AF37]/70 text-lg py-2.5"
            style={{
              background: 'rgba(212,175,55,0.05)',
              border: '1px solid rgba(212,175,55,0.15)',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 13,
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
            className="flex-1 min-w-0 rounded-lg text-center text-white text-lg py-2.5 disabled:opacity-50 outline-none"
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'Montserrat, sans-serif',
            }}
          />
        )}
        <span className="text-white/25 text-[10px] flex-shrink-0">{isBodyweight ? '' : 'kg'}</span>

        {/* Reps */}
        <input
          type="number"
          inputMode="numeric"
          value={set.reps || ''}
          onChange={e => onUpdate({ ...set, reps: parseInt(e.target.value) || 0 })}
          placeholder={ghostReps}
          disabled={set.completed}
          className="flex-1 min-w-0 rounded-lg text-center text-white text-lg py-2.5 disabled:opacity-50 outline-none"
          style={{
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'Montserrat, sans-serif',
          }}
        />
        <span className="text-white/25 text-[10px] flex-shrink-0">rps</span>

        {/* Comment toggle */}
        <button
          onClick={() => setShowComment(p => !p)}
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ background: (showComment || set.comment) ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.05)' }}
        >
          <MessageSquare className="w-3 h-3" style={{ color: set.comment ? '#D4AF37' : 'rgba(255,255,255,0.3)' }} />
        </button>

        {/* Complete toggle */}
        <button
          onClick={() => onComplete({ ...set, completed: !set.completed })}
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
            set.completed
              ? 'border border-[#9C7E46]'
              : 'bg-white/5 border border-white/15 hover:border-[#D4AF37]/40'
          }`}
          style={set.completed ? { background: 'rgba(156, 126, 70, 0.25)' } : {}}
        >
          <Check className={`w-4 h-4 transition-colors ${set.completed ? 'text-[#D4AF37]' : 'text-white/25'}`} />
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

      {/* Comment field */}
      {(showComment || set.comment) && (
        <div
          className="px-3 py-2 flex items-center gap-2"
          style={{
            background: 'rgba(212,175,55,0.04)',
            borderTop: '0.5px solid rgba(212,175,55,0.1)',
          }}
        >
          <input
            type="text"
            value={set.comment || ''}
            onChange={e => onUpdate({ ...set, comment: e.target.value })}
            placeholder="Note for this set..."
            className="flex-1 text-xs outline-none bg-transparent"
            style={{ color: 'rgba(229,229,231,0.7)', fontFamily: 'Montserrat, sans-serif' }}
          />
          {set.comment && (
            <button onClick={() => { onUpdate({ ...set, comment: '' }); setShowComment(false); }}>
              <X className="w-3 h-3 text-white/20" />
            </button>
          )}
        </div>
      )}

      {/* Info strip – 1RM */}
      {show1RM && (
        <div
          className="flex items-center justify-between px-3 py-1"
          style={{
            background: isPR ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
            borderTop: '0.5px solid rgba(255,255,255,0.05)',
            borderRadius: '0 0 12px 12px',
          }}
        >
          {isPR ? (
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[9px] uppercase tracking-[0.15em]"
              style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif' }}
            >
              ★ PR — Peak {current1RM}kg
            </motion.span>
          ) : (
            <span className="text-[9px] text-white/20 tracking-[0.1em]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              1RM ~{current1RM}kg
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}