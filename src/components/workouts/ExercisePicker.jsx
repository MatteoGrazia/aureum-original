import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';

const MUSCLES   = ['all','chest','back','shoulders','biceps','triceps','legs','core','glutes','forearms','calves'];
const EQUIPMENT = ['all','barbell','dumbbell','cable','machine','bodyweight','kettlebell','bands'];

// Map our DB muscle groups → API parameter
const MUSCLE_API = {
  chest:     'Chest',
  back:      'Lats,Traps',
  shoulders: 'Shoulders',
  biceps:    'Biceps',
  triceps:   'Triceps',
  legs:      'Quads,Hamstrings',
  core:      'Abs',
  glutes:    'Glutes',
  forearms:  'Forearms',
  calves:    'Calves',
};

function getWgerAnatomyUrl(muscleGroup) {
  const wgerMap = {
    chest: '15', back: '2', shoulders: '13', biceps: '4', triceps: '6',
    legs: '10', core: '12', glutes: '32', forearms: '26', calves: '5'
  };
  const muscleId = wgerMap[muscleGroup] || '15';
  return `https://wger.de/static/images/muscles/main/${muscleId}.png`;
}

// Fallback universal anatomy silhouette
const FALLBACK_ANATOMY = 'https://wger.de/static/images/exercises/main/1.png';

// ─── Muscle-group icons (filter pills only) ───────────────────────────────────
function MuscleIcon({ muscle, size = 11, color }) {
  const paths = {
    chest:     <><path d="M4 10 Q8 5 12 10 Q8 15 4 10z M20 10 Q16 5 12 10 Q16 15 20 10z"/></>,
    back:      <><line x1="7" y1="4" x2="7" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    shoulders: <><circle cx="7" cy="9" r="3.5"/><circle cx="17" cy="9" r="3.5"/><line x1="10.5" y1="9" x2="13.5" y2="9"/></>,
    biceps:    <><path d="M7 18 Q4 12 8 8 Q12 4 15 7 Q18 10 16 15"/></>,
    triceps:   <><path d="M6 7 Q4 12 7 16 Q10 20 14 18 Q18 16 18 11 Q17 7 13 6"/></>,
    legs:      <><path d="M9 4 L9 12 L7 20 M15 4 L15 12 L17 20 M9 12 L15 12"/></>,
    core:      <><rect x="7" y="4" width="4" height="3" rx="0.8"/><rect x="13" y="4" width="4" height="3" rx="0.8"/><rect x="7" y="9" width="4" height="3" rx="0.8"/><rect x="13" y="9" width="4" height="3" rx="0.8"/></>,
    glutes:    <><path d="M5 14 Q5 7 12 6 Q19 7 19 14 Q19 21 12 22 Q5 21 5 14z"/></>,
    forearms:  <><path d="M10 3 L8 20 M14 3 L16 20 M8 11 L16 9"/></>,
    calves:    <><path d="M9 4 Q7 10 9 14 Q11 18 12 21 Q13 18 15 14 Q17 10 15 4"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {paths[muscle] || <circle cx="12" cy="12" r="8"/>}
    </svg>
  );
}

// ─── SVG fallback icon (when image fails) ─────────────────────────────────────
function ExerciseIcon({ name = '', muscle = '', size = 20, color = '#D4AF37' }) {
  const n = name.toLowerCase();
  const s = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

  if (n.includes('bench') || n.includes('push-up') || n.includes('pushup') || n.includes('chest press'))
    return <svg {...s}><line x1="2" y1="7" x2="22" y2="7"/><line x1="2" y1="5.5" x2="2" y2="8.5"/><line x1="5" y1="5" x2="5" y2="9"/><line x1="19" y1="5" x2="19" y2="9"/><line x1="22" y1="5.5" x2="22" y2="8.5"/><circle cx="12" cy="14" r="2"/><line x1="10.2" y1="13" x2="7" y2="7.5"/><line x1="13.8" y1="13" x2="17" y2="7.5"/><line x1="12" y1="16" x2="9" y2="21"/><line x1="12" y1="16" x2="15" y2="21"/></svg>;
  if ((n.includes('press') && (n.includes('shoulder') || n.includes('overhead') || n.includes('arnold') || n.includes('military'))) || n.includes('push press'))
    return <svg {...s}><line x1="3" y1="4" x2="21" y2="4"/><line x1="3" y1="2.5" x2="3" y2="5.5"/><line x1="6" y1="2" x2="6" y2="6"/><line x1="18" y1="2" x2="18" y2="6"/><line x1="21" y1="2.5" x2="21" y2="5.5"/><circle cx="12" cy="10" r="2"/><line x1="10.2" y1="9.2" x2="7" y2="5.5"/><line x1="13.8" y1="9.2" x2="17" y2="5.5"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="12" y1="17" x2="9" y2="21"/><line x1="12" y1="17" x2="15" y2="21"/></svg>;
  if (n.includes('deadlift') && !n.includes('romanian') && !n.includes('rdl') && !n.includes('sumo'))
    return <svg {...s}><line x1="3" y1="21" x2="21" y2="21"/><line x1="3" y1="19" x2="3" y2="23"/><line x1="6" y1="18" x2="6" y2="24"/><line x1="18" y1="18" x2="18" y2="24"/><line x1="21" y1="19" x2="21" y2="23"/><circle cx="16" cy="4" r="2"/><line x1="16" y1="6" x2="10" y2="13"/><line x1="10" y1="13" x2="8" y2="21"/><line x1="10" y1="13" x2="12" y2="21"/></svg>;
  if (n.includes('romanian') || n.includes('rdl') || n.includes('sumo'))
    return <svg {...s}><line x1="3" y1="21" x2="21" y2="21"/><line x1="6" y1="18.5" x2="6" y2="23.5"/><line x1="18" y1="18.5" x2="18" y2="23.5"/><circle cx="17" cy="5" r="2"/><line x1="17" y1="7" x2="10" y2="14"/><line x1="10" y1="14" x2="9" y2="21"/><line x1="10" y1="14" x2="12" y2="21"/></svg>;
  if (n.includes('hip thrust') || n.includes('glute bridge') || n.includes('bridge'))
    return <svg {...s}><line x1="2" y1="19" x2="8" y2="19"/><circle cx="10" cy="18" r="2"/><line x1="12" y1="17" x2="17" y2="12"/><line x1="17" y1="12" x2="20" y2="8"/><circle cx="21.5" cy="7" r="1.5" fill={color} stroke="none"/><line x1="8" y1="19" x2="12" y2="17"/><line x1="10" y1="16" x2="12" y2="22"/></svg>;
  if (n.includes('squat') || n.includes('hack'))
    return <svg {...s}><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="6.5" x2="3" y2="9.5"/><line x1="6" y1="6" x2="6" y2="10"/><line x1="18" y1="6" x2="18" y2="10"/><line x1="21" y1="6.5" x2="21" y2="9.5"/><circle cx="12" cy="5" r="1.8"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="13" x2="7" y2="18"/><line x1="12" y1="13" x2="17" y2="18"/><line x1="7" y1="18" x2="6" y2="22"/><line x1="17" y1="18" x2="18" y2="22"/></svg>;
  if (n.includes('lunge') || n.includes('split squat') || n.includes('bulgarian'))
    return <svg {...s}><circle cx="12" cy="4" r="2"/><line x1="12" y1="6" x2="12" y2="11"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="12" y1="11" x2="7" y2="16"/><line x1="7" y1="16" x2="5" y2="22"/><line x1="12" y1="11" x2="17" y2="14"/><line x1="17" y1="14" x2="19" y2="22"/></svg>;
  if (n.includes('pull-up') || n.includes('pullup') || n.includes('chin-up') || n.includes('lat pull') || n.includes('pulldown'))
    return <svg {...s}><line x1="2" y1="3" x2="22" y2="3"/><circle cx="12" cy="9" r="2"/><line x1="8" y1="5" x2="12" y2="9"/><line x1="16" y1="5" x2="12" y2="9"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="12" y1="17" x2="9" y2="22"/><line x1="12" y1="17" x2="15" y2="22"/></svg>;
  if (n.includes('row') || n.includes('t-bar'))
    return <svg {...s}><circle cx="18" cy="5" r="2"/><line x1="18" y1="7" x2="11" y2="13"/><line x1="11" y1="13" x2="9" y2="20"/><line x1="11" y1="13" x2="13" y2="20"/><line x1="15" y1="10" x2="4" y2="14"/><line x1="13" y1="11.5" x2="4" y2="16"/><line x1="2" y1="14" x2="5" y2="14"/></svg>;
  if (n.includes('curl') && !n.includes('wrist') && !n.includes('leg curl'))
    return <svg {...s}><line x1="7" y1="6" x2="13" y2="6"/><circle cx="6" cy="6" r="1.5" fill={color} stroke="none"/><circle cx="14" cy="6" r="1.5" fill={color} stroke="none"/><circle cx="10" cy="10" r="2"/><line x1="10" y1="12" x2="10" y2="17"/><line x1="8" y1="10" x2="6" y2="6"/><line x1="10" y1="17" x2="7" y2="22"/><line x1="10" y1="17" x2="13" y2="22"/></svg>;
  if (n.includes('pushdown') || (n.includes('tricep') && !n.includes('push')) || n.includes('skull') || n.includes('close grip'))
    return <svg {...s}><circle cx="12" cy="3" r="2"/><line x1="12" y1="5" x2="12" y2="10"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="10" x2="7" y2="17"/><line x1="16" y1="10" x2="17" y2="17"/><line x1="6" y1="17" x2="8" y2="17"/><line x1="6" y1="15.5" x2="6" y2="18.5"/><line x1="16" y1="17" x2="18" y2="17"/></svg>;
  if (n.includes('lateral raise') || n.includes('front raise') || n.includes('upright row'))
    return <svg {...s}><circle cx="12" cy="8" r="2"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="4" y1="10" x2="12" y2="10"/><line x1="12" y1="10" x2="20" y2="10"/><circle cx="3" cy="11" r="1.5" fill={color} stroke="none"/><circle cx="21" cy="11" r="1.5" fill={color} stroke="none"/><line x1="12" y1="16" x2="9" y2="21"/><line x1="12" y1="16" x2="15" y2="21"/></svg>;
  if (n.includes('fly') || n.includes('flye') || n.includes('pec deck') || n.includes('cable cross'))
    return <svg {...s}><circle cx="12" cy="8" r="2"/><path d="M 10.5 9.5 Q 7 12 3.5 10.5"/><path d="M 13.5 9.5 Q 17 12 20.5 10.5"/><circle cx="3" cy="10.5" r="1.5" fill={color} stroke="none"/><circle cx="21" cy="10.5" r="1.5" fill={color} stroke="none"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="12" y1="16" x2="9" y2="21"/><line x1="12" y1="16" x2="15" y2="21"/></svg>;
  if (n.includes('calf'))
    return <svg {...s}><circle cx="12" cy="4" r="2"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="12" x2="9" y2="17"/><line x1="12" y1="12" x2="15" y2="17"/><line x1="9" y1="17" x2="8.5" y2="22"/><line x1="15" y1="17" x2="15.5" y2="22"/><line x1="6" y1="22" x2="11" y2="22"/><line x1="14" y1="22" x2="18" y2="22"/></svg>;
  if (n.includes('plank') || n.includes('farmer') || n.includes('carry'))
    return <svg {...s}><circle cx="18" cy="11" r="2"/><line x1="16" y1="11" x2="6" y2="11"/><line x1="6" y1="11" x2="4" y2="14"/><line x1="6" y1="11" x2="4" y2="8"/><line x1="11" y1="11" x2="11" y2="16"/><line x1="14" y1="11" x2="14" y2="16"/><line x1="3" y1="16" x2="22" y2="16"/></svg>;
  if (n.includes('dip'))
    return <svg {...s}><line x1="4" y1="6" x2="4" y2="20"/><line x1="20" y1="6" x2="20" y2="20"/><line x1="4" y1="9" x2="7" y2="9"/><line x1="17" y1="9" x2="20" y2="9"/><circle cx="12" cy="6" r="2"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="7" y1="9" x2="12" y2="11.5"/><line x1="17" y1="9" x2="12" y2="11.5"/><line x1="12" y1="13" x2="9" y2="19"/><line x1="12" y1="13" x2="15" y2="19"/></svg>;
  if (n.includes('leg press') || n.includes('leg curl') || n.includes('leg extension'))
    return <svg {...s}><circle cx="5" cy="9" r="2"/><line x1="7" y1="9" x2="14" y2="9"/><line x1="14" y1="9" x2="19" y2="14"/><circle cx="21" cy="15" r="1.5" fill={color} stroke="none"/><line x1="5" y1="11" x2="5" y2="16"/><line x1="5" y1="16" x2="3" y2="21"/><line x1="5" y1="16" x2="8" y2="21"/></svg>;

  const fallback = {
    chest:     <><path d="M4 10 Q8 5 12 10 Q8 15 4 10z"/><path d="M20 10 Q16 5 12 10 Q16 15 20 10z"/></>,
    back:      <><line x1="7" y1="4" x2="7" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    shoulders: <><circle cx="7" cy="9" r="3.5"/><circle cx="17" cy="9" r="3.5"/><line x1="10.5" y1="9" x2="13.5" y2="9"/></>,
    biceps:    <><path d="M7 18 Q4 12 8 8 Q12 4 15 7 Q18 10 16 15"/></>,
    triceps:   <><path d="M6 7 Q4 12 7 16 Q10 20 14 18 Q18 16 18 11 Q17 7 13 6"/></>,
    legs:      <><path d="M9 4 L9 12 L7 20 M15 4 L15 12 L17 20 M9 12 L15 12"/></>,
    core:      <><rect x="7" y="4" width="4" height="3" rx="0.8"/><rect x="13" y="4" width="4" height="3" rx="0.8"/><rect x="7" y="9" width="4" height="3" rx="0.8"/><rect x="13" y="9" width="4" height="3" rx="0.8"/><rect x="7" y="14" width="4" height="3" rx="0.8"/><rect x="13" y="14" width="4" height="3" rx="0.8"/></>,
    glutes:    <><path d="M5 14 Q5 7 12 6 Q19 7 19 14 Q19 21 12 22 Q5 21 5 14z"/></>,
    forearms:  <><path d="M10 3 L8 20 M14 3 L16 20 M8 11 L16 9"/></>,
    calves:    <><path d="M9 4 Q7 10 9 14 Q11 18 12 21 Q13 18 15 14 Q17 10 15 4"/></>,
  };
  return <svg {...s}>{fallback[muscle] || <circle cx="12" cy="12" r="8"/>}</svg>;
}

// ─── Pearl Glass circle — theme-aware border + glow ───────────────────────────
function PearlCircle({ size = 48, isDarkMode, children }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `0.5px solid ${isDarkMode ? '#D4AF37' : '#9C7E46'}`,
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(15px)',
      WebkitBackdropFilter: 'blur(15px)',
      overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: isDarkMode ? '0 0 10px rgba(212,175,55,0.1)' : 'none',
    }}>
      {children}
    </div>
  );
}

// ─── Lazy image — IntersectionObserver + error fallback ───────────────────────
function LazyAnatomical({ src, alt, fallback, customSrc, customSrcDark, isDarkMode }) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [err, setErr] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShouldLoad(true); obs.disconnect(); } },
      { rootMargin: '400px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const imageUrl = isDarkMode ? (customSrcDark || customSrc || src) : (customSrc || src);

  // wger anatomy images: white background, black sketch lines, red highlighted muscle.
  // Target highlight color: #BDB5D5 (light purple, matching app workout elements).
  // Dark mode: invert → black bg, white sketch, cyan highlight → hue-rotate+saturate → light purple
  // Light mode: keep white bg + black sketch, shift red → light purple via hue-rotate
  const darkFilter = 'invert(1) hue-rotate(60deg) saturate(0.6) brightness(1.1)';
  const lightFilter = 'hue-rotate(240deg) saturate(0.45) brightness(1.05)';

  const imgFilter = isDarkMode ? darkFilter : lightFilter;

  return (
    <div ref={ref} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {shouldLoad && !err
        ? <img src={imageUrl} alt={alt} loading="lazy" onError={() => setErr(true)}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain', 
              objectPosition: 'center',
              filter: imgFilter
            }} />
        : err ? fallback : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{fallback}</div>}
    </div>
  );
}

// ─── Muscle label chip ────────────────────────────────────────────────────────
function MuscleLabel({ label, value, color, borderColor, bg }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '5px 10px', borderRadius: 8, background: bg, border: `0.5px solid ${borderColor}` }}>
      <span style={{ fontSize: 8, letterSpacing: '0.22em', color, fontFamily: 'Montserrat, sans-serif', opacity: 0.7 }}>{label}</span>
      <span style={{ fontSize: 11, letterSpacing: '0.08em', color, fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase' }}>{value}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ExercisePicker({ exercises, onSelect, onClose, mode = 'add', previousWorkoutSets = {} }) {
  const { isDarkMode } = useTheme();
  const [search, setSearch]             = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [equipFilter, setEquipFilter]   = useState('all');
  const [selected, setSelected]         = useState(null);
  const sectionRefs = useRef({});

  const iconColor   = isDarkMode ? '#D4AF37' : '#9C7E46';
  const bg          = isDarkMode ? '#0a0a0a' : '#F5F5F2';
  const cardBg      = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.75)';
  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted   = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(29,29,31,0.4)';
  const borderColor = isDarkMode ? 'rgba(212,175,55,0.15)' : 'rgba(225,193,110,0.38)';
  const chipBg      = isDarkMode ? 'rgba(212,175,55,0.07)' : 'rgba(156,126,70,0.08)';
  const chipBorder  = isDarkMode ? 'rgba(212,175,55,0.22)' : 'rgba(156,126,70,0.28)';

  const filtered = useMemo(() => {
    const seen = new Set();
    return exercises
      .filter(ex => {
        if (seen.has(ex.name)) return false;
        seen.add(ex.name);
        const q = search.toLowerCase();
        const matchSearch = !search
          || ex.name.toLowerCase().includes(q)
          || (ex.muscle_group || '').includes(q)
          || (ex.equipment || '').includes(q)
          || (ex.category || '').includes(q);
        const matchMuscle = muscleFilter === 'all' || ex.muscle_group === muscleFilter;
        const matchEquip  = equipFilter  === 'all' || ex.equipment === equipFilter;
        return matchSearch && matchMuscle && matchEquip;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, search, muscleFilter, equipFilter]);

  const letterGroups = useMemo(() => {
    const g = {};
    filtered.forEach(ex => {
      const l = ex.name[0].toUpperCase();
      if (!g[l]) g[l] = [];
      g[l].push(ex);
    });
    return g;
  }, [filtered]);

  const letters = Object.keys(letterGroups).sort();

  const jumpTo = (letter) => sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleAdd = useCallback((ex) => {
    if (navigator.vibrate) navigator.vibrate(10);
    onSelect(ex);
    setSelected(null);
  }, [onSelect]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: bg }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 flex-shrink-0">
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: textPrimary, fontSize: 18 }}>
          {mode === 'replace' ? 'Replace Exercise' : 'Add Exercise'}
        </h2>
        <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
          <X className="w-5 h-5" style={{ color: textPrimary }} />
        </button>
      </div>

      {/* ── Search ── */}
      <div className="px-5 mb-3 flex-shrink-0">
        <div className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: cardBg, border: `0.5px solid ${borderColor}` }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: textMuted }} />
          <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises, muscle, category..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ fontFamily: 'Montserrat, sans-serif', color: textPrimary }} />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4" style={{ color: textMuted }} /></button>}
        </div>
      </div>

      {/* ── Muscle filter pills ── */}
      <div className="px-5 mb-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 pb-1">
          {MUSCLES.map(m => {
            const isActive = muscleFilter === m;
            return (
              <button key={m} onClick={() => setMuscleFilter(m)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs capitalize"
                style={{
                  background: isActive ? 'rgba(212,175,55,0.18)' : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                  color: isActive ? '#D4AF37' : textMuted,
                  border: `${isActive ? '1px' : '0.5px'} solid ${isActive ? 'rgba(212,175,55,0.7)' : borderColor}`,
                  boxShadow: isActive ? 'inset 0 0 8px rgba(212,175,55,0.18)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Equipment filter pills ── */}
      <div className="px-5 mb-3 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 pb-1">
          {EQUIPMENT.map(eq => {
            const isActive = equipFilter === eq;
            return (
              <button key={eq} onClick={() => setEquipFilter(eq)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs capitalize"
                style={{
                  background: isActive ? 'rgba(156,126,70,0.18)' : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                  color: isActive ? iconColor : textMuted,
                  border: `${isActive ? '1px' : '0.5px'} solid ${isActive ? 'rgba(156,126,70,0.7)' : borderColor}`,
                  boxShadow: isActive ? 'inset 0 0 8px rgba(156,126,70,0.18)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                {eq}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Exercise list + A-Z jumper ── */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-y-auto px-5" style={{ paddingRight: '2.2rem', paddingBottom: '140px' }}>
          {letters.map(letter => (
            <div key={letter} ref={el => { sectionRefs.current[letter] = el; }}>
              <p className="text-[10px] uppercase tracking-widest pt-3 pb-1.5 px-1"
                style={{ color: isDarkMode ? 'rgba(212,175,55,0.4)' : 'rgba(156,126,70,0.55)', fontFamily: 'Montserrat' }}>
                {letter}
              </p>
              <div className="space-y-1">
                {letterGroups[letter].map(ex => {
                   const customUrl = ex.image_url;
                   const fallbackUrl = getWgerAnatomyUrl(ex.muscle_group);
                   const ghosts = (previousWorkoutSets[ex.name] || []).filter(s => !s.is_warmup && s.weight > 0);
                   const topSet = [...ghosts].sort((a, b) => (b.weight * b.reps) - (a.weight * a.reps))[0];
                   return (
                     <button key={ex.id} onClick={() => setSelected(ex)}
                       className="w-full px-3 py-2.5 rounded-xl text-left flex items-center gap-3 transition-all active:scale-[0.98]"
                       style={{ background: cardBg, border: `0.5px solid ${borderColor}` }}>
                       <div style={{ 
                         width: 48, 
                         height: 48, 
                         borderRadius: '50%', 
                         overflow: 'hidden', 
                         flexShrink: 0,
                         border: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.2)' : 'rgba(156,126,70,0.2)'}`,
                         background: 'rgba(255,255,255,0.03)'
                       }}>
                          <LazyAnatomical
                            src={fallbackUrl}
                            alt={ex.name}
                            customSrc={ex.image_url}
                            customSrcDark={ex.image_url_dark}
                            isDarkMode={isDarkMode}
                            fallback={<ExerciseIcon name={ex.name} muscle={ex.muscle_group} size={20} color={iconColor} />}
                          />
                        </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ fontFamily: 'Montserrat, sans-serif', color: textPrimary }}>{ex.name}</p>
                        <p className="text-[11px] capitalize mt-0.5" style={{ color: textMuted }}>{ex.muscle_group} · {ex.equipment}</p>
                      </div>
                      {topSet && (
                        <span className="text-[10px] flex-shrink-0 tabular-nums" style={{ color: isDarkMode ? 'rgba(212,175,55,0.65)' : '#9C7E46' }}>
                          ↑ {topSet.weight}kg
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-20 text-sm" style={{ color: textMuted }}>No exercises found</p>
          )}
        </div>

        {/* A-Z jump index */}
        {letters.length > 4 && (
          <div className="absolute right-0.5 top-0 bottom-0 flex flex-col justify-center py-4">
            {letters.map(l => (
              <button key={l} onClick={() => jumpTo(l)}
                className="w-5 py-px text-[9px] text-center"
                style={{ color: isDarkMode ? 'rgba(212,175,55,0.6)' : 'rgba(156,126,70,0.75)', fontFamily: 'Montserrat' }}>
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail bottom sheet ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl z-10"
            style={{
              background: isDarkMode
                ? 'linear-gradient(180deg, rgba(18,14,5,0.98) 0%, rgba(12,10,4,1) 100%)'
                : 'linear-gradient(180deg, rgba(255,252,240,0.98) 0%, rgba(255,248,220,1) 100%)',
              backdropFilter: 'blur(25px)',
              border: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.25)' : 'rgba(225,193,110,0.5)'}`,
              borderBottom: 'none',
              padding: '20px 24px calc(40px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5"
              style={{ background: isDarkMode ? 'rgba(212,175,55,0.25)' : 'rgba(156,126,70,0.3)' }} />

            {/* Exercise header */}
            <div className="flex items-start gap-4 mb-4">
              {/* Large pearl circle */}
              <div style={{
                width: 68, 
                height: 68, 
                borderRadius: '50%',
                overflow: 'hidden', 
                flexShrink: 0,
                border: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.25)' : 'rgba(156,126,70,0.25)'}`,
                background: 'rgba(255,255,255,0.03)'
              }}>
                <img
                    src={isDarkMode ? (selected.image_url_dark || selected.image_url || getWgerAnatomyUrl(selected.muscle_group)) : (selected.image_url || getWgerAnatomyUrl(selected.muscle_group))}
                    alt={selected.name}
                    loading="lazy"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      filter: isDarkMode
                        ? 'invert(1) hue-rotate(60deg) saturate(0.6) brightness(1.1)'
                        : 'hue-rotate(240deg) saturate(0.45) brightness(1.05)'
                    }}
                    onError={e => { e.target.style.display = 'none'; e.target.parentNode.querySelector('.fallback-icon') && (e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex'); }}
                   />
                   <div className="fallback-icon" style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 0, left: 0 }}>
                     <ExerciseIcon name={selected.name} muscle={selected.muscle_group} size={32} color={'#BDB5D5'} />
                   </div>

              </div>

              <div className="flex-1 min-w-0">
                <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: textPrimary, fontSize: 15, marginBottom: 2 }}>
                  {selected.name}
                </h3>
                {/* PRIMARY / SECONDARY Montserrat labels */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {selected.muscle_group && (
                    <MuscleLabel label="PRIMARY" value={selected.muscle_group}
                      color={iconColor} borderColor={chipBorder} bg={chipBg} />
                  )}
                  {selected.secondary_muscles?.length > 0 ? (
                    <MuscleLabel label="SECONDARY" value={selected.secondary_muscles.slice(0, 2).join(', ')}
                      color={textMuted} borderColor={chipBorder} bg={chipBg} />
                  ) : selected.equipment ? (
                    <MuscleLabel label="EQUIPMENT" value={selected.equipment}
                      color={textMuted} borderColor={chipBorder} bg={chipBg} />
                  ) : null}
                </div>
              </div>
              <button onClick={() => setSelected(null)}>
                <X className="w-5 h-5" style={{ color: textMuted }} />
              </button>
            </div>

            {/* Ghost PRs */}
            {(() => {
              const sets = (previousWorkoutSets[selected.name] || []).filter(s => !s.is_warmup && s.weight > 0);
              if (!sets.length) return null;
              return (
                <div className="mb-5 p-4 rounded-2xl" style={{ background: chipBg, border: `0.5px solid ${chipBorder}` }}>
                  <p className="text-[10px] uppercase tracking-[0.25em] mb-3"
                    style={{ color: isDarkMode ? 'rgba(212,175,55,0.6)' : '#9C7E46', fontFamily: 'Montserrat' }}>
                    Previous Session
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sets.slice(0, 5).map((s, idx) => (
                      <div key={idx} className="flex flex-col items-center px-3 py-2 rounded-xl"
                        style={{ background: isDarkMode ? 'rgba(212,175,55,0.06)' : 'rgba(156,126,70,0.08)' }}>
                        <span className="text-sm tabular-nums" style={{ color: iconColor, fontFamily: 'Montserrat' }}>{s.weight}kg</span>
                        <span className="text-[10px]" style={{ color: textMuted }}>× {s.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)}
                className="flex-1 py-3.5 rounded-2xl text-sm"
                style={{ background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: textMuted }}>
                Back
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAdd(selected)}
                className="flex-[2] py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #D4AF37 100%)', color: '#0a0a0a', fontFamily: 'Montserrat, sans-serif' }}>
                <Plus className="w-4 h-4" />
                Add to Routine
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}