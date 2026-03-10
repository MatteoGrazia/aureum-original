import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Scale, Droplets, Zap, Pill, Check, Moon, Sun, Flame, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/shared/ThemeContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

const GOLD   = '#D4AF37';
const BRONZE = '#9C7E46';
const BLUE   = '#8ECAE6';
const AMBER  = '#F4A261';

// Darker versions for light mode
const GOLD_DARK   = '#7A5C10';
const BRONZE_DARK = '#5C3A0A';
const BLUE_DARK   = '#1E6A8C';
const AMBER_DARK  = '#A04D10';
const SUPPLEMENT_LOG_KEY = 'aureum_supplement_log';
const getSupplementLog = () => { try { return JSON.parse(localStorage.getItem(SUPPLEMENT_LOG_KEY) || '{}'); } catch { return {}; } };

const R          = 150;
const SVG_OFFSET = 200;
const FAB_HALF   = 28;
const FAB_C      = SVG_OFFSET + FAB_HALF;
const SVG_SIZE   = SVG_OFFSET * 2 + 56;

const angleToOffset = (deg) => {
  const rad = (deg * Math.PI) / 180;
  return { dx: R * Math.sin(rad), dy: -R * Math.cos(rad) };
};

const ARC_START = { x: FAB_C + R * Math.sin((-90 * Math.PI) / 180), y: FAB_C - R * Math.cos((-90 * Math.PI) / 180) };
const ARC_END   = { x: FAB_C, y: FAB_C - R };
const ARC_PATH  = `M ${ARC_START.x} ${ARC_START.y} A ${R} ${R} 0 0 1 ${ARC_END.x} ${ARC_END.y}`;

const BUTTONS = [
  { angle: -90, label: 'Streak',    action: 'streak',    Icon: Pill,     color: BRONZE },
  { angle: -60, label: 'Readiness', action: 'readiness', Icon: Zap,      color: AMBER  },
  { angle: -30, label: 'Water',     action: 'water',     Icon: Droplets, color: BLUE   },
  { angle:   0, label: 'Weight',    action: 'weight',    Icon: Scale,    color: GOLD   },
];

const haptic = (type) => {
  if (!navigator.vibrate) return;
  if (type === 'medium') navigator.vibrate(15);
  else if (type === 'light') navigator.vibrate(6);
  else if (type === 'select') navigator.vibrate([8, 40, 8]);
};

const getTodayKey = () => `streak_${format(new Date(), 'yyyy-MM-dd')}`;

export default function QuickLogFAB({ onUpdate }) {
  const [isOpen, setIsOpen]           = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [weight, setWeight]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [waterPulse, setWaterPulse]   = useState(false);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [streakDone, setStreakDone]   = useState(() => !!getSupplementLog()[format(new Date(), 'yyyy-MM-dd')]);
  const [waterFlash, setWaterFlash]   = useState(false);
  const { isDarkMode } = useTheme();

  const weightInputRef = useRef(null);
  const queryClient    = useQueryClient();
  const today          = format(new Date(), 'yyyy-MM-dd');
  const pointerStart   = useRef(null);
  const longTimer      = useRef(null);
  const handled        = useRef(false);

  const { data: todayActivity } = useQuery({
    queryKey: ['todayActivity', today],
    queryFn: async () => {
      const a = await base44.entities.DailyActivity.filter({ date: today });
      return a[0] || null;
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (activeAction === 'weight') {
      setTimeout(() => weightInputRef.current?.focus(), 150);
    }
  }, [activeAction]);

  /* ── Actions ─────────────────────────────────────────── */

  const logWeight = async () => {
    if (!weight || loading) return;
    setLoading(true);
    await base44.entities.WeightHistory.create({ date: today, weight: parseFloat(weight) });
    onUpdate?.();
    queryClient.invalidateQueries({ queryKey: ['weightHistory'] });
    setWeight('');
    setActiveAction(null);
    setIsOpen(false);
    setLoading(false);
  };

  const addWater = async () => {
    haptic('light');
    setIsOpen(false);
    setWaterPulse(true);
    setWaterFlash(true);
    setTimeout(() => setWaterPulse(false), 900);
    setTimeout(() => setWaterFlash(false), 1200);

    if (todayActivity) {
      await base44.entities.DailyActivity.update(todayActivity.id, {
        water_liters: (todayActivity.water_liters || 0) + 0.25,
      });
    } else {
      await base44.entities.DailyActivity.create({
        date: today, water_liters: 0.25,
        steps: 0, active_minutes: 0, sedentary_minutes: 0, calories_burned: 0,
      });
    }
    queryClient.invalidateQueries({ queryKey: ['todayActivity', today] });
    onUpdate?.();
  };

  const logEnergy = async (level) => {
    if (todayActivity) {
      await base44.entities.DailyActivity.update(todayActivity.id, { energy_level: level });
    } else {
      await base44.entities.DailyActivity.create({
        date: today, energy_level: level,
        steps: 0, water_liters: 0, active_minutes: 0, sedentary_minutes: 0, calories_burned: 0,
      });
    }
    queryClient.invalidateQueries({ queryKey: ['todayActivity', today] });
    onUpdate?.();
    setActiveAction(null);
    setIsOpen(false);
  };

  const toggleStreak = () => {
    const log = getSupplementLog();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const next = !streakDone;
    if (next) { log[todayStr] = true; } else { delete log[todayStr]; }
    localStorage.setItem(SUPPLEMENT_LOG_KEY, JSON.stringify(log));
    setStreakDone(next);
    haptic(next ? 'select' : 'light');
    setIsOpen(false);
  };

  const handleAction = (action) => {
    haptic('select');
    if (action === 'water')  { addWater(); }
    else if (action === 'streak')   { toggleStreak(); }
    else { setIsOpen(false); setActiveAction(action); }
  };

  /* ── FAB gesture ─────────────────────────────────────── */

  const onPointerDown = (e) => {
    handled.current = false;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    longTimer.current = setTimeout(() => {
      if (!handled.current) { handled.current = true; haptic('medium'); }
    }, 500);
  };

  const onPointerUp = () => {
    clearTimeout(longTimer.current);
    if (handled.current) return;
    handled.current = true;
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) setTimeout(() => haptic('medium'), 280);
  };

  const close = () => { setIsOpen(false); setActiveAction(null); };

  const ENERGY_ICONS = [
    { Icon: Moon,     color: '#8ECAE6', label: 'Low'      },
    { Icon: Activity, color: '#9BB7D4', label: 'Moderate' },
    { Icon: Zap,      color: '#F4A261', label: 'Good'     },
    { Icon: Zap,      color: '#E8C44A', label: 'High'     },
    { Icon: Flame,    color: '#E8734A', label: 'Peak'     },
  ];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {(isOpen || activeAction) && (
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(5px)', zIndex: 999 }}
          />
        )}
      </AnimatePresence>

      {/* ── Weight Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {activeAction === 'weight' && (
          <motion.div
            key="wf"
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 12 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            style={{ position: 'fixed', bottom: 185, right: 20, zIndex: 1002, width: 224 }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              border: `0.5px solid rgba(212,175,55,0.55)`,
              backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
              borderRadius: 26, padding: '22px 20px',
            }}>
              <p style={{
                color: 'rgba(212,175,55,0.65)', fontSize: 8.5, textTransform: 'uppercase',
                letterSpacing: '0.26em', marginBottom: 16, fontFamily: 'Montserrat', textAlign: 'center',
              }}>
                Body Weight
              </p>

              <input
                ref={weightInputRef}
                type="number" step="0.1" placeholder="0.0"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && logWeight()}
                style={{
                  width: '100%', padding: '12px 8px', borderRadius: 16, outline: 'none',
                  border: '0.5px solid rgba(212,175,55,0.3)',
                  background: 'rgba(255,255,255,0.04)', color: 'white',
                  textAlign: 'center', fontSize: 38, fontFamily: 'Montserrat',
                  marginBottom: 6, letterSpacing: '0.04em', boxSizing: 'border-box',
                }}
              />
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, textAlign: 'center', marginBottom: 18, fontFamily: 'Montserrat', letterSpacing: '0.1em' }}>
                KG
              </p>

              <button
                onClick={logWeight} disabled={!weight || loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 16, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${GOLD}, #F4D03F, ${GOLD})`,
                  color: '#080808', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em',
                  fontFamily: 'Montserrat', minHeight: 50,
                  opacity: (!weight || loading) ? 0.35 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Check style={{ width: 15, height: 15 }} strokeWidth={2.5} />
                {loading ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Readiness / Energy Slider ─────────────────────── */}
      <AnimatePresence>
        {activeAction === 'readiness' && (
          <motion.div
            key="rs"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            style={{ position: 'fixed', bottom: 185, right: 20, zIndex: 1002, width: 240 }}
          >
            <div style={{
              background: 'rgba(244,162,97,0.07)',
              border: '0.5px solid rgba(244,162,97,0.45)',
              backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
              borderRadius: 26, padding: '22px 20px',
            }}>
              <p style={{
                color: 'rgba(244,162,97,0.7)', fontSize: 8.5, textTransform: 'uppercase',
                letterSpacing: '0.26em', marginBottom: 10, fontFamily: 'Montserrat', textAlign: 'center',
              }}>
                Energy Level
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 8 }}>
                {(() => { const e = ENERGY_ICONS[energyLevel - 1]; return (
                  <>
                    <e.Icon style={{ width: 32, height: 32, color: e.color, filter: `drop-shadow(0 0 8px ${e.color}80)` }} strokeWidth={1.5} />
                    <span style={{ color: e.color, fontFamily: 'Montserrat', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{e.label}</span>
                  </>
                ); })()}
              </div>

              <style>{`
                .energy-slider {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 100%;
                  height: 6px;
                  border-radius: 4px;
                  background: linear-gradient(90deg, #F4A261 ${(energyLevel - 1) * 25}%, rgba(255,255,255,0.12) ${(energyLevel - 1) * 25}%);
                  outline: none;
                  cursor: pointer;
                  margin-bottom: 12px;
                }
                .energy-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  width: 22px; height: 22px;
                  border-radius: 50%;
                  background: #F4A261;
                  box-shadow: 0 0 12px rgba(244,162,97,0.6);
                  cursor: pointer;
                }
                .energy-slider::-moz-range-thumb {
                  width: 22px; height: 22px;
                  border-radius: 50%;
                  background: #F4A261;
                  border: none;
                  cursor: pointer;
                }
              `}</style>

              <input
                className="energy-slider"
                type="range" min="1" max="5" step="1"
                value={energyLevel}
                onChange={e => setEnergyLevel(Number(e.target.value))}
                onMouseUp={() => logEnergy(energyLevel)}
                onTouchEnd={() => logEnergy(energyLevel)}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {['1','2','3','4','5'].map(n => (
                  <span key={n} style={{
                    color: Number(n) <= energyLevel ? 'rgba(244,162,97,0.7)' : 'rgba(255,255,255,0.2)',
                    fontSize: 10, fontFamily: 'Montserrat',
                    transition: 'color 0.2s',
                  }}>{n}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB + Orbital system ─────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 100, right: 20, width: 56, height: 56, zIndex: 1000 }}>

        {/* Orbit arc */}
        <AnimatePresence>
          {isOpen && (
            <motion.svg
              key="arc"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              width={SVG_SIZE} height={SVG_SIZE}
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              style={{ position: 'absolute', left: -SVG_OFFSET, top: -SVG_OFFSET, pointerEvents: 'none', overflow: 'visible' }}
            >
              <path d={ARC_PATH} stroke={BRONZE} strokeWidth="0.75" fill="none" strokeDasharray="2.5 5" opacity="0.5" />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Orbital sub-buttons */}
        <AnimatePresence>
          {isOpen && BUTTONS.map((btn, i) => {
            const { dx, dy } = angleToOffset(btn.angle);
            const Icon = btn.Icon;
            const isStreak = btn.action === 'streak';

            // Pick dark variants for light mode
            const lightColorMap = { [GOLD]: GOLD_DARK, [BRONZE]: BRONZE_DARK, [BLUE]: BLUE_DARK, [AMBER]: AMBER_DARK };
            const baseColor = isDarkMode ? btn.color : (lightColorMap[btn.color] || btn.color);
            const btnColor = isStreak
              ? (streakDone ? (isDarkMode ? GOLD : GOLD_DARK) : (isDarkMode ? BRONZE : BRONZE_DARK))
              : baseColor;

            return (
              <motion.button
                key={btn.action}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.15 }}
                animate={{ x: dx, y: dy, opacity: 1, scale: 1 }}
                exit={{ x: 0, y: 0, opacity: 0, scale: 0.15, transition: { duration: 0.18, delay: (BUTTONS.length - 1 - i) * 0.03 } }}
                transition={{ type: 'spring', damping: 15, stiffness: 120, delay: i * 0.055 }}
                onClick={() => handleAction(btn.action)}
                style={{
                 position: 'absolute',
                 left: -24, top: -24,
                 width: 72, height: 72,
                 borderRadius: '50%',
                 background: isStreak && streakDone
                   ? `${btnColor}30`
                   : isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(212,175,55,0.12)',
                 backdropFilter: 'blur(8px)',
                 WebkitBackdropFilter: 'blur(8px)',
                 border: `2px solid ${btnColor}`,
                 display: 'flex', flexDirection: 'column',
                 alignItems: 'center', justifyContent: 'center',
                 boxShadow: `0 0 22px ${btnColor}80, 0 0 6px ${btnColor}40, inset 0 0 10px ${btnColor}18`,
                 touchAction: 'none', cursor: 'pointer',
                 transition: 'border-color 0.3s, box-shadow 0.3s, background 0.3s',
                }}
              >
                <Icon style={{ width: 26, height: 26, color: btnColor, transition: 'color 0.3s' }} strokeWidth={1.5} />
                <span style={{
                  fontSize: 8, color: btnColor, marginTop: 3,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontFamily: 'Montserrat, sans-serif', fontWeight: 500, opacity: 0.85,
                  transition: 'color 0.3s',
                }}>
                  {isStreak && streakDone ? 'Done!' : btn.label}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Central FAB */}
        <motion.button
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => clearTimeout(longTimer.current)}
          animate={waterPulse
            ? { boxShadow: ['0 0 20px rgba(142,202,230,0.4)', '0 0 55px rgba(142,202,230,0.9)', '0 0 20px rgba(142,202,230,0.2)'] }
            : { boxShadow: '0 0 20px rgba(225,193,110,0.28)' }
          }
          transition={waterPulse ? { duration: 0.7, ease: 'easeOut' } : {}}
          whileTap={{ scale: 0.88 }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: waterPulse
              ? `linear-gradient(135deg, ${BLUE} 0%, #A8D8EA 50%, ${BLUE} 100%)`
              : `linear-gradient(135deg, ${GOLD} 0%, #F4D03F 50%, ${GOLD} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
            transition: 'background 0.25s ease', overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait">
            {waterFlash ? (
              <motion.div
                key="water"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
              >
                <Droplets style={{ width: 18, height: 18, color: '#080808' }} strokeWidth={2} />
                <span style={{ fontSize: 7, color: '#080808', fontFamily: 'Montserrat', fontWeight: 600, letterSpacing: '0.04em' }}>+250ml</span>
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div animate={{ rotate: isOpen ? 135 : 0 }} transition={{ type: 'spring', damping: 14, stiffness: 200 }}>
                  <Plus style={{ width: 24, height: 24, color: '#080808' }} strokeWidth={2.5} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}