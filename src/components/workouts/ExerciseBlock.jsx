// Changes applied:
// C1  — Three-dot menu replacing Replace button; Reorder opens ReorderModal
// C4  — Warmup pill matches orange W badge
// C9  — Exercise circular image (36px) next to title
// C10 — Remove Set mode with red minus + Confirm
// C11 — React.memo to prevent re-renders from timer ticks
// C12 — Active set glow only on first incomplete set
// Flutter equivalent: ReorderableListView with onReorder callback

import React, { useState, useRef, useCallback } from 'react';
import { Plus, MessageSquare, GripVertical, MoreVertical, RefreshCw, Trash2, AlignJustify, Check } from 'lucide-react';
import SetRow from './SetRow';
import { useTheme } from '@/components/shared/ThemeContext';

const playSetBell = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[880, 0, 0.18], [1760, 0, 0.09], [880, 0.06, 0.12]].forEach(([freq, delay, vol]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      osc.start(t);
      osc.stop(t + 0.9);
    });
  } catch (_) {}
};

const createSet = (type = 'normal', weight = 0, reps = 0) => ({
  id: Math.random().toString(36).slice(2),
  type, weight, reps, rpe: 7, completed: false,
});

const epley1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 1) return weight || 0;
  return Math.round(weight * (1 + reps / 30));
};

const BODYWEIGHT_EQUIPMENT = ['bodyweight'];

// C9: small circular exercise image / placeholder
function ExerciseAvatar({ name, imageUrl, isDarkMode }) {
  const [imgErr, setImgErr] = useState(false);
  const gold = isDarkMode ? '#D4AF37' : '#9A7A14';
  const fallbackBg = isDarkMode ? 'rgba(212,175,55,0.1)' : 'rgba(154,122,20,0.1)';

  if (imageUrl && !imgErr) {
    return (
      <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#ffffff' }}>
        <img
          src={imageUrl}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
          onError={() => setImgErr(true)}
        />
      </div>
    );
  }
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: fallbackBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: gold, fontSize: 14, fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
        {(name || '?')[0].toUpperCase()}
      </span>
    </div>
  );
}

// C1: three-dot dropdown menu
function ThreeDotMenu({ onReorder, onReplace, onDelete, isDarkMode, onClose }) {
  const bg = isDarkMode ? 'rgba(18,12,4,0.95)' : 'rgba(255,255,255,0.98)';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1E1C18';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(30,28,24,0.55)';
  const border = isDarkMode ? 'rgba(212,175,55,0.15)' : 'rgba(184,148,31,0.2)';

  const items = [
    { label: 'Reorder', icon: AlignJustify, color: textPrimary, action: onReorder },
    { label: 'Replace', icon: RefreshCw, color: textPrimary, action: onReplace },
    { label: 'Delete', icon: Trash2, color: '#ef4444', action: onDelete },
  ];

  return (
    <div
      className="absolute right-0 top-8 z-50 rounded-xl overflow-hidden shadow-lg"
      style={{ minWidth: 160, background: bg, border: `0.5px solid ${border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
    >
      {items.map(({ label, icon: Icon, color, action }) => (
        <button
          key={label}
          onClick={() => { action(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-white/5"
          style={{ color, fontFamily: 'Montserrat, sans-serif' }}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </button>
      ))}
    </div>
  );
}

// Exercise-level comment
function ExerciseComment({ comment, onChange, isDarkMode }) {
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(30,28,24,0.50)';
  return (
    <div className="px-4 pb-2">
      <textarea
        value={comment || ''}
        onChange={e => onChange(e.target.value.slice(0, 300))}
        onBlur={e => onChange(e.target.value.trim().slice(0, 300))}
        placeholder="Add a note for this exercise..."
        rows={2}
        maxLength={300}
        className="w-full text-xs outline-none resize-none rounded-xl px-3 py-2"
        style={{
          background: isDarkMode ? 'rgba(212,175,55,0.05)' : 'rgba(154,122,20,0.05)',
          border: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.18)' : 'rgba(184,148,31,0.25)'}`,
          color: isDarkMode ? 'rgba(229,229,231,0.75)' : 'rgba(30,28,24,0.75)',
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.5,
        }}
      />
      <p className="text-right text-[9px] mt-0.5" style={{ color: textMuted }}>
        {(comment || '').length}/300
      </p>
    </div>
  );
}

const ExerciseBlock = React.memo(function ExerciseBlock({
  exercise, onUpdate, onStructuralUpdate, onReplace, onTimerStart,
  onDelete, onOpenReorder,
  previousSets = [], userWeight = 70,
  draggable, onDragStart, onDragOver, onDragEnd, onDrop, isDraggingOver,
  isHistoryView = false,
}) {
  const isBodyweight = BODYWEIGHT_EQUIPMENT.includes(exercise.equipment);
  const { isDarkMode } = useTheme();
  const [showComment, setShowComment] = useState(!!(exercise.comment));
  const [showMenu, setShowMenu] = useState(false);
  // C10: remove mode state
  const [removeMode, setRemoveMode] = useState(false);
  const [selectedForRemoval, setSelectedForRemoval] = useState(new Set());

  const menuRef = useRef(null);

  const addSet = useCallback((type = 'normal') => {
    const last = exercise.sets[exercise.sets.length - 1];
    const weight = isBodyweight ? userWeight : (last?.weight || 0);
    const newSet = createSet(type, weight, last?.reps || 0);
    onStructuralUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  }, [exercise, isBodyweight, userWeight, onStructuralUpdate]);

  const deleteSet = useCallback((i) => {
    if (exercise.sets.length <= 1) return;
    onStructuralUpdate({ ...exercise, sets: exercise.sets.filter((_, idx) => idx !== i) });
  }, [exercise, onStructuralUpdate]);

  const updateSet = useCallback((i, updated) => {
    const sets = [...exercise.sets];
    sets[i] = updated;
    onUpdate({ ...exercise, sets });
  }, [exercise, onUpdate]);

  const completeSet = useCallback((i, updated) => {
    const sets = [...exercise.sets];
    sets[i] = updated;
    onUpdate({ ...exercise, sets });
    if (updated.completed) {
      if ('vibrate' in navigator) navigator.vibrate(50);
      playSetBell();
      onTimerStart(exercise);
    }
  }, [exercise, onUpdate, onTimerStart]);

  const updateComment = useCallback((comment) => {
    onUpdate({ ...exercise, comment });
  }, [exercise, onUpdate]);

  // C10: remove mode handlers
  const toggleRemoveSelect = useCallback((idx) => {
    setSelectedForRemoval(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }, []);

  const confirmRemove = useCallback(() => {
    if (selectedForRemoval.size === 0) { setRemoveMode(false); return; }
    const newSets = exercise.sets.filter((_, i) => !selectedForRemoval.has(i));
    if (newSets.length === 0) { setRemoveMode(false); return; }
    onStructuralUpdate({ ...exercise, sets: newSets });
    setSelectedForRemoval(new Set());
    setRemoveMode(false);
  }, [exercise, selectedForRemoval, onStructuralUpdate]);

  const cancelRemove = useCallback(() => {
    setSelectedForRemoval(new Set());
    setRemoveMode(false);
  }, []);

  const completedCount = exercise.sets.filter(s => s.completed).length;

  const peak1RM = previousSets.reduce((max, s) => {
    const rm = epley1RM(s.weight, s.reps);
    return rm > max ? rm : max;
  }, 0);

  // C12: find first incomplete set index for glow
  const firstIncompleteIdx = exercise.sets.findIndex(s => !s.completed);

  const imgSrc = isDarkMode
    ? (exercise.image_url_dark || exercise.image_url)
    : exercise.image_url;

  const cardBg = isDarkMode ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.88)';
  const cardBorder = isDarkMode ? '0.5px solid rgba(212,175,55,0.12)' : '0.5px solid rgba(184,148,31,0.18)';
  const gold = isDarkMode ? '#9C7E46' : '#7A6318';
  const goldBright = isDarkMode ? '#D4AF37' : '#9A7A14';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1E1C18';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(30,28,24,0.50)';
  const colHeaderColor = isDarkMode ? 'rgba(255,255,255,0.20)' : 'rgba(30,28,24,0.35)';
  const addBtnBg = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(30,28,24,0.05)';
  const addBtnColor = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(30,28,24,0.50)';
  const hasComment = !!(exercise.comment && exercise.comment.trim());

  // Drop set pill styling — purple
  const dropPillBg = isDarkMode ? 'rgba(139,92,246,0.18)' : 'rgba(109,40,217,0.10)';
  const dropPillColor = isDarkMode ? 'rgb(167,139,250)' : '#6d28d9';
  const dropPillBorder = isDarkMode ? '1px solid rgba(139,92,246,0.35)' : '1px solid rgba(109,40,217,0.25)';

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: cardBg,
        border: isDraggingOver ? `1px solid ${goldBright}` : cardBorder,
        boxShadow: isDarkMode ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
        opacity: draggable ? 0.85 : 1,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-3 pt-4 pb-1">
        {!isHistoryView && (
          <div
            className="flex items-center justify-center w-7 h-7 mr-1 flex-shrink-0 cursor-grab active:cursor-grabbing mt-0.5"
            style={{ color: textMuted, touchAction: 'none' }}
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          {/* C9: circular exercise image */}
          <ExerciseAvatar name={exercise.exercise_name} imageUrl={imgSrc} isDarkMode={isDarkMode} />

          <div className="flex-1 min-w-0">
            <h3 className="text-base truncate" style={{ color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}>
              {exercise.exercise_name}
            </h3>
            <p className="text-xs capitalize mt-0.5" style={{ color: textMuted }}>
              {exercise.muscle_group && `${exercise.muscle_group} · `}
              {completedCount}/{exercise.sets.length} sets
              {exercise.default_rest && (
                <span style={{ color: gold, opacity: 0.8 }} className="ml-1">· {exercise.default_rest}s rest</span>
              )}
            </p>
            {isHistoryView && hasComment && (
              <p className="text-[11px] italic mt-1" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
                {exercise.comment}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Comment icon */}
          {!isHistoryView && (
            <button
              onClick={() => setShowComment(p => !p)}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
              style={{
                background: (showComment || hasComment)
                  ? (isDarkMode ? 'rgba(212,175,55,0.12)' : 'rgba(154,122,20,0.10)')
                  : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(30,28,24,0.06)'),
              }}
            >
              <MessageSquare className="w-3.5 h-3.5" style={{ color: hasComment ? goldBright : textMuted }} />
              {hasComment && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: goldBright }} />
              )}
            </button>
          )}

          {/* C1: three-dot menu */}
          {!isHistoryView && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(p => !p)}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(30,28,24,0.06)' }}
              >
                <MoreVertical className="w-4 h-4" style={{ color: textMuted }} />
              </button>
              {showMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <ThreeDotMenu
                    isDarkMode={isDarkMode}
                    onReorder={() => onOpenReorder?.()}
                    onReplace={() => onReplace?.()}
                    onDelete={() => onDelete?.()}
                    onClose={() => setShowMenu(false)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Exercise comment field */}
      {!isHistoryView && (showComment || hasComment) && (
        <ExerciseComment comment={exercise.comment} onChange={updateComment} isDarkMode={isDarkMode} />
      )}

      {/* Previous session ghost label */}
      {previousSets.length > 0 && (
        <div className="px-4 pb-1">
          <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: gold, fontFamily: 'Montserrat, sans-serif' }}>
            Last session: {previousSets[0]?.weight}kg x {previousSets[0]?.reps}
          </p>
        </div>
      )}

      {/* Column headers */}
      <div className="flex items-center gap-2 px-3 pt-1 pb-0.5">
        <div className="w-7" />
        <div className="w-4" />
        <div className="text-center text-[9px] uppercase tracking-widest" style={{ width: 40, color: colHeaderColor }}>Weight</div>
        <div style={{ width: 50 }} />
        <div className="text-center text-[9px] uppercase tracking-widest" style={{ width: 40, color: colHeaderColor }}>Reps</div>
        <div className="flex-1" />
      </div>

      {/* Sets */}
      <div className="px-3 space-y-1.5 pb-2">
        {exercise.sets.map((set, i) => (
          <SetRow
            key={set.id}
            set={set}
            index={i}
            onUpdate={updated => updateSet(i, updated)}
            onDelete={() => deleteSet(i)}
            onComplete={updated => completeSet(i, updated)}
            previousSet={previousSets[i] || previousSets[0] || null}
            peak1RM={peak1RM}
            isBodyweight={isBodyweight}
            isActiveSet={i === firstIncompleteIdx}
            isRemoveMode={removeMode}
            onRemoveSelect={toggleRemoveSelect}
            isSelectedForRemoval={selectedForRemoval.has(i)}
          />
        ))}
      </div>

      {/* Add / Remove set buttons */}
      {!isHistoryView && (
        <div className="flex gap-2 px-3 pb-4">
          {removeMode ? (
            <>
              <button
                onClick={confirmRemove}
                className="flex-1 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <Check className="w-3 h-3" />
                Confirm Remove
              </button>
              <button
                onClick={cancelRemove}
                className="px-3 py-2.5 rounded-xl text-xs transition-colors"
                style={{ background: addBtnBg, color: addBtnColor }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => addSet('normal')}
                className="flex-1 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                style={{ background: addBtnBg, color: addBtnColor }}
              >
                <Plus className="w-3 h-3" />
                Add Set
              </button>
              {/* C10: Remove Set button */}
              <button
                onClick={() => setRemoveMode(true)}
                className="px-3 py-2.5 rounded-xl text-xs transition-colors"
                style={{ background: isDarkMode ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.07)', color: isDarkMode ? 'rgba(252,165,165,0.85)' : '#b91c1c' }}
              >
                Remove Set
              </button>
              {/* Drop set pill */}
              <button
                onClick={() => addSet('dropset')}
                className="px-3 py-2.5 rounded-xl text-xs transition-colors"
                style={{ background: dropPillBg, color: dropPillColor, border: dropPillBorder }}
              >
                + Drop Set
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default ExerciseBlock;