import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mic } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GOLD = '#D4AF37';
const BRONZE = '#9C7E46';
const R = 85;               // orbit radius px
const LONG_PRESS_MS = 500;
const SWIPE_THRESHOLD = 35;
const SVG_OFFSET = 110;     // how far the SVG canvas extends beyond FAB container
const FAB_HALF = 28;        // half of 56px FAB
const FAB_C = SVG_OFFSET + FAB_HALF; // FAB center in SVG space = 138

// Angles measured from "up" (0° = straight up), positive = clockwise.
// Quarter arc: -90° (straight left) → 0° (straight up) — all fit safely on a right-edge FAB.
// angleToOffset converts to screen-space (dx, dy) relative to FAB center.
const angleToOffset = (deg) => {
  const rad = (deg * Math.PI) / 180;
  return { dx: R * Math.sin(rad), dy: -R * Math.cos(rad) };
};

// Fine-line gold SVG icons — 1px stroke, medical-illustrator style
const BarcodeIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    {[3, 6, 9, 12, 15, 18, 21].map((x, i) => (
      <rect key={x} x={x} y="4" width={i % 2 === 0 ? 2 : 1} height="15" fill={GOLD} opacity={i % 3 === 0 ? 1 : 0.75} />
    ))}
    {/* Laser scan line */}
    <line x1="1" y1="11.5" x2="25" y2="11.5" stroke="#FF5555" strokeWidth="0.8" opacity="0.9" strokeLinecap="round" />
    {/* Bottom text line (decorative) */}
    <line x1="3" y1="21" x2="23" y2="21" stroke={GOLD} strokeWidth="0.5" opacity="0.4" />
  </svg>
);

const ForkKnifeIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={GOLD} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    {/* Fork */}
    <line x1="8" y1="3" x2="8" y2="23" />
    <line x1="6" y1="3" x2="6" y2="9" />
    <line x1="10" y1="3" x2="10" y2="9" />
    <path d="M6 9 Q8 12 10 9" />
    {/* Knife */}
    <line x1="18" y1="3" x2="18" y2="23" />
    <path d="M18 3 Q22 7 22 12 L18 14" />
  </svg>
);

const BarbellIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={GOLD} strokeWidth="1" strokeLinecap="round">
    <line x1="7" y1="13" x2="19" y2="13" />
    {/* Left sleeve + plates */}
    <rect x="3.5" y="9.5" width="2.5" height="7" rx="0.4" />
    <rect x="1" y="10.5" width="2.5" height="5" rx="0.4" />
    {/* Right sleeve + plates */}
    <rect x="20" y="9.5" width="2.5" height="7" rx="0.4" />
    <rect x="22.5" y="10.5" width="2.5" height="5" rx="0.4" />
    {/* Collar marks */}
    <line x1="7" y1="10.5" x2="7" y2="15.5" />
    <line x1="19" y1="10.5" x2="19" y2="15.5" />
  </svg>
);

const ScaleIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={GOLD} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <line x1="13" y1="4" x2="13" y2="22" />
    <line x1="7" y1="22" x2="19" y2="22" />
    <line x1="4" y1="8" x2="22" y2="8" />
    <line x1="4" y1="8" x2="3" y2="15" />
    <line x1="22" y1="8" x2="23" y2="15" />
    <path d="M1 15 Q3.5 17.5 6 15" />
    <path d="M20 15 Q22.5 17.5 25 15" />
  </svg>
);

// Quarter-arc: -90° (far left) → -60° → -30° → 0° (straight up)
const BUTTONS = [
  { angle: -90, label: 'Scan',    action: 'scan',    Icon: BarcodeIcon   },
  { angle: -60, label: 'Food',    action: 'food',    Icon: ForkKnifeIcon },
  { angle: -30, label: 'Workout', action: 'workout', Icon: BarbellIcon   },
  { angle:   0, label: 'Weight',  action: 'weight',  Icon: ScaleIcon     },
];

// Arc endpoints in SVG canvas space
// -90° → straight left of FAB center
const ARC_START = { x: FAB_C + R * Math.sin((-90 * Math.PI) / 180), y: FAB_C - R * Math.cos((-90 * Math.PI) / 180) }; // (53, 138)
// 0° → straight above FAB center
const ARC_END   = { x: FAB_C + R * Math.sin(0), y: FAB_C - R * Math.cos(0) };                                          // (138, 53)
// Clockwise arc (sweep=1), small arc (large-arc=0) through upper-left
const ARC_PATH  = `M ${ARC_START.x} ${ARC_START.y} A ${R} ${R} 0 0 1 ${ARC_END.x} ${ARC_END.y}`;
const SVG_SIZE  = SVG_OFFSET * 2 + 56; // 276

const haptic = (type) => {
  if (!navigator.vibrate) return;
  if (type === 'medium') navigator.vibrate(15);
  else if (type === 'light') navigator.vibrate(6);
  else if (type === 'select') navigator.vibrate([8, 40, 8]);
};

export default function QuickLogFAB({ onUpdate }) {
  const [isOpen, setIsOpen]         = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [weight, setWeight]         = useState('');
  const [loading, setLoading]       = useState(false);

  const navigate     = useNavigate();
  const today        = format(new Date(), 'yyyy-MM-dd');
  const pointerStart = useRef(null);
  const longTimer    = useRef(null);
  const handled      = useRef(false);

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['todayFoodLogs', today],
    queryFn: () => base44.entities.FoodLog.filter({ date: today }),
    staleTime: 60_000,
  });
  const { data: todayActivity } = useQuery({
    queryKey: ['todayActivity', today],
    queryFn: async () => { const a = await base44.entities.DailyActivity.filter({ date: today }); return a[0] || null; },
    staleTime: 60_000,
  });

  const shouldPulse = todayLogs.length === 0 && (!todayActivity || !todayActivity.water_liters);

  const logWeight = async () => {
    if (!weight) return;
    setLoading(true);
    try {
      await base44.entities.WeightHistory.create({ date: today, weight: parseFloat(weight) });
      onUpdate?.();
      setWeight('');
      setActiveAction(null);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAction = (action) => {
    haptic('select');
    setIsOpen(false);
    if (action === 'scan')    navigate(createPageUrl('Nutrition') + '?openScanner=true');
    else if (action === 'food')    navigate(createPageUrl('Nutrition'));
    else if (action === 'workout') navigate(createPageUrl('Workouts'));
    else if (action === 'weight')  setActiveAction('weight');
  };

  const onPointerDown = (e) => {
    handled.current = false;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    longTimer.current = setTimeout(() => {
      if (!handled.current) {
        handled.current = true;
        haptic('medium');
        setIsOpen(false);
        setActiveAction('voice');
      }
    }, LONG_PRESS_MS);
  };

  const onPointerUp = (e) => {
    clearTimeout(longTimer.current);
    if (handled.current) return;
    handled.current = true;
    const dx = e.clientX - (pointerStart.current?.x || e.clientX);
    const dy = e.clientY - (pointerStart.current?.y || e.clientY);
    if (Math.abs(dx) > SWIPE_THRESHOLD && dx > 0 && Math.abs(dx) > Math.abs(dy)) {
      haptic('medium');
      navigate(createPageUrl('Nutrition') + '?openScanner=true');
    } else {
      const opening = !isOpen;
      setIsOpen(opening);
      if (opening) setTimeout(() => haptic('medium'), 280);
    }
  };

  const close = () => { setIsOpen(false); setActiveAction(null); };

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
            style={{ background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(4px)', zIndex: 999 }}
          />
        )}
      </AnimatePresence>

      {/* Weight mini-form */}
      <AnimatePresence>
        {activeAction === 'weight' && (
          <motion.div
            key="wf"
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 8 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            style={{ position: 'fixed', bottom: 175, right: 20, zIndex: 1002, width: 186 }}
          >
            <div style={{
              background: 'rgba(8,8,8,0.94)',
              border: '0.5px solid rgba(212,175,55,0.4)',
              backdropFilter: 'blur(32px)',
              borderRadius: 18, padding: 16,
            }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: 12, fontFamily: 'Montserrat' }}>
                Log Weight
              </p>
              <input
                autoFocus type="number" step="0.1" placeholder="kg"
                value={weight} onChange={e => setWeight(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && logWeight()}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 12, outline: 'none',
                  border: '0.5px solid rgba(212,175,55,0.3)',
                  background: 'rgba(255,255,255,0.04)', color: 'white',
                  textAlign: 'center', fontSize: 14, fontFamily: 'Montserrat', marginBottom: 12,
                }}
              />
              <button
                onClick={logWeight} disabled={!weight || loading}
                style={{
                  width: '100%', padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${GOLD}, #F4D03F, ${GOLD})`,
                  color: '#080808', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em',
                  fontFamily: 'Montserrat', minHeight: 40, opacity: (!weight || loading) ? 0.4 : 1,
                }}
              >{loading ? '…' : 'Save'}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice / AI macro overlay */}
      <AnimatePresence>
        {activeAction === 'voice' && (
          <motion.div
            key="vo"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            style={{ position: 'fixed', bottom: 175, left: 16, right: 16, zIndex: 1002 }}
          >
            <div style={{
              background: 'rgba(212,175,55,0.06)',
              border: '0.5px solid rgba(212,175,55,0.38)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              borderRadius: 22, padding: '22px 20px', textAlign: 'center',
            }}>
              <motion.div
                animate={{ scale: [1, 1.14, 1], opacity: [0.65, 1, 0.65] }}
                transition={{ duration: 1.3, repeat: Infinity }}
                style={{
                  width: 60, height: 60, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                  background: 'rgba(212,175,55,0.1)',
                  border: '0.5px solid rgba(212,175,55,0.3)',
                }}
              >
                <Mic style={{ width: 26, height: 26, color: GOLD }} strokeWidth={1} />
              </motion.div>
              <p style={{ color: GOLD, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.32em', marginBottom: 6, fontFamily: 'Montserrat' }}>
                Voice Log
              </p>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontFamily: 'Montserrat' }}>
                Say something like "100g Greek yogurt"
              </p>
              <button onClick={close} style={{ marginTop: 18, padding: '8px 20px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB + Orbital system ── */}
      <div style={{ position: 'fixed', bottom: 100, right: 20, width: 56, height: 56, zIndex: 1000 }}>

        {/* Thin bronze orbit arc */}
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
              <path
                d={ARC_PATH}
                stroke={BRONZE}
                strokeWidth="0.75"
                fill="none"
                strokeDasharray="2.5 5"
                opacity="0.55"
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Orbital sub-buttons */}
        <AnimatePresence>
          {isOpen && BUTTONS.map((btn, i) => {
            const { dx, dy } = angleToOffset(btn.angle);
            const Icon = btn.Icon;
            return (
              <motion.button
                key={btn.action}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.15 }}
                animate={{ x: dx, y: dy, opacity: 1, scale: 1 }}
                exit={{ x: 0, y: 0, opacity: 0, scale: 0.15, transition: { duration: 0.18, delay: (BUTTONS.length - 1 - i) * 0.03 } }}
                transition={{ type: 'spring', damping: 15, stiffness: 120, delay: i * 0.055 }}
                onHoverStart={() => haptic('light')}
                onClick={() => handleAction(btn.action)}
                style={{
                  position: 'absolute',
                  left: 7, top: 7,          // center at (28,28) = FAB center
                  width: 42, height: 42,
                  borderRadius: '50%',
                  background: 'rgba(255,191,0,0.07)',
                  backdropFilter: 'blur(25px)',
                  WebkitBackdropFilter: 'blur(25px)',
                  border: '0.5px solid rgba(212,175,55,0.52)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 22px rgba(0,0,0,0.45), inset 0 0 12px rgba(212,175,55,0.04)',
                  touchAction: 'none', cursor: 'pointer',
                }}
              >
                <Icon />
                <span style={{
                  fontSize: 6.5,
                  color: 'rgba(212,175,55,0.72)',
                  marginTop: 2,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                }}>
                  {btn.label}
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
          animate={shouldPulse && !isOpen
            ? { boxShadow: ['0 0 20px rgba(225,193,110,0.3)', '0 0 42px rgba(225,193,110,0.72)', '0 0 20px rgba(225,193,110,0.3)'] }
            : { boxShadow: '0 0 20px rgba(225,193,110,0.28)' }
          }
          transition={shouldPulse && !isOpen ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : {}}
          whileTap={{ scale: 0.88 }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${GOLD} 0%, #F4D03F 50%, ${GOLD} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
          }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 200 }}
          >
            <Plus style={{ width: 24, height: 24, color: '#080808' }} strokeWidth={2.5} />
          </motion.div>
        </motion.button>
      </div>
    </>
  );
}