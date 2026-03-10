import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mic, ScanLine, Utensils, Dumbbell, Scale } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GOLD = '#D4AF37';
const BRONZE = '#9C7E46';
const R = 100;              // orbit radius px
const LONG_PRESS_MS = 500;
const SWIPE_THRESHOLD = 35;
const SVG_OFFSET = 140;     // how far the SVG canvas extends beyond FAB container
const FAB_HALF = 28;        // half of 56px FAB
const FAB_C = SVG_OFFSET + FAB_HALF; // FAB center in SVG space

// Angles measured from "up" (0° = straight up), positive = clockwise.
// Quarter arc: -90° (straight left) → 0° (straight up) — all fit safely on a right-edge FAB.
// angleToOffset converts to screen-space (dx, dy) relative to FAB center.
const angleToOffset = (deg) => {
  const rad = (deg * Math.PI) / 180;
  return { dx: R * Math.sin(rad), dy: -R * Math.cos(rad) };
};

// Quarter-arc: -90° (far left) → -60° → -30° → 0° (straight up)
const BUTTONS = [
  { angle: -90, label: 'Scan',    action: 'scan',    Icon: ScanLine,  color: '#D4AF37' },
  { angle: -60, label: 'Food',    action: 'food',    Icon: Utensils,  color: '#F4A261' },
  { angle: -30, label: 'Workout', action: 'workout', Icon: Dumbbell,  color: '#C9ADA7' },
  { angle:   0, label: 'Weight',  action: 'weight',  Icon: Scale,     color: '#8ECAE6' },
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
                  left: 0, top: 0,
                  width: 56, height: 56,
                  borderRadius: '50%',
                  background: 'transparent',
                  border: `1.5px solid ${btn.color}`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 14px ${btn.color}40`,
                  touchAction: 'none', cursor: 'pointer',
                }}
              >
                <Icon style={{ width: 22, height: 22, color: btn.color }} strokeWidth={1.5} />
                <span style={{
                  fontSize: 7,
                  color: btn.color,
                  marginTop: 3,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  opacity: 0.85,
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