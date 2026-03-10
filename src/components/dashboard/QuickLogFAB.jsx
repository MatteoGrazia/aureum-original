import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Scan, Dumbbell, Scale, Droplets } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GOLD = '#D4AF37';
const SWIPE_THRESHOLD = 35;
const LONG_PRESS_MS = 500;

// Positions relative to FAB center — arc opens up & left (safe for right-edge FAB)
const SUB_BUTTONS = [
  { icon: Scan,     label: 'Scan',    dx: -85, dy:   0,  action: 'scan',    color: GOLD },
  { icon: Dumbbell, label: 'Workout', dx: -60, dy: -60,  action: 'workout', color: '#B0B0B0' },
  { icon: Scale,    label: 'Weight',  dx:   0, dy: -85,  action: 'weight',  color: '#BFA68F' },
  { icon: Droplets, label: 'Water',   dx:  22, dy: -70,  action: 'water',   color: '#7EC8E3' },
];

const haptic = (type) => {
  if (!navigator.vibrate) return;
  if (type === 'medium') navigator.vibrate(15);
  else if (type === 'light') navigator.vibrate(6);
  else if (type === 'select') navigator.vibrate([8, 40, 8]);
};

export default function QuickLogFAB({ onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAction, setActiveAction] = useState(null); // 'weight' | 'quick_note'
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const pointerStart = useRef(null);
  const longPressTimer = useRef(null);
  const gestureHandled = useRef(false);

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['todayFoodLogs', today],
    queryFn: () => base44.entities.FoodLog.filter({ date: today }),
    staleTime: 60_000,
  });

  const { data: todayActivity } = useQuery({
    queryKey: ['todayActivity', today],
    queryFn: async () => {
      const a = await base44.entities.DailyActivity.filter({ date: today });
      return a[0] || null;
    },
    staleTime: 60_000,
  });

  const shouldPulse = todayLogs.length === 0 && (!todayActivity || !todayActivity.water_liters);

  const logWater = async (amount = 0.5) => {
    try {
      const activities = await base44.entities.DailyActivity.filter({ date: today });
      if (activities.length > 0) {
        await base44.entities.DailyActivity.update(activities[0].id, {
          water_liters: (activities[0].water_liters || 0) + amount
        });
      } else {
        await base44.entities.DailyActivity.create({
          date: today, water_liters: amount, steps: 0,
          active_minutes: 0, sedentary_minutes: 0, calories_burned: 0
        });
      }
      onUpdate?.();
    } catch (e) { console.error(e); }
  };

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
    if (action === 'scan') navigate(createPageUrl('Nutrition') + '?openScanner=true');
    else if (action === 'workout') navigate(createPageUrl('Workouts'));
    else if (action === 'water') logWater(0.5);
    else if (action === 'weight') setActiveAction('weight');
  };

  const handlePointerDown = (e) => {
    gestureHandled.current = false;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      if (!gestureHandled.current) {
        gestureHandled.current = true;
        haptic('medium');
        setIsOpen(false);
        setActiveAction('quick_note');
      }
    }, LONG_PRESS_MS);
  };

  const handlePointerUp = (e) => {
    clearTimeout(longPressTimer.current);
    if (gestureHandled.current) return;
    gestureHandled.current = true;

    const dx = e.clientX - (pointerStart.current?.x || e.clientX);
    const dy = e.clientY - (pointerStart.current?.y || e.clientY);
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > SWIPE_THRESHOLD && dx > 0 && absDx > absDy) {
      // Swipe right → instant scan
      haptic('medium');
      navigate(createPageUrl('Nutrition') + '?openScanner=true');
    } else if (absDy > SWIPE_THRESHOLD && dy < 0 && absDy > absDx) {
      // Swipe up → log 500ml water
      haptic('medium');
      logWater(0.5);
    } else {
      // Tap → toggle orbital
      const opening = !isOpen;
      setIsOpen(opening);
      if (opening) setTimeout(() => haptic('medium'), 250);
    }
  };

  const close = () => { setIsOpen(false); setActiveAction(null); };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {(isOpen || activeAction) && (
          <motion.div
            key="fab-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            style={{ zIndex: 9997 }}
          />
        )}
      </AnimatePresence>

      {/* Weight mini-form */}
      <AnimatePresence>
        {activeAction === 'weight' && (
          <motion.div
            key="weight-form"
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed"
            style={{ bottom: 175, right: 20, zIndex: 9999, width: 190 }}
          >
            <div style={{
              background: 'rgba(10,10,10,0.9)',
              border: '0.5px solid rgba(212,175,55,0.4)',
              backdropFilter: 'blur(30px)',
              borderRadius: 18, padding: 16
            }}>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3"
                style={{ fontFamily: 'Montserrat' }}>Log Weight</p>
              <input
                autoFocus type="number" step="0.1" placeholder="kg"
                value={weight} onChange={e => setWeight(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && logWeight()}
                className="w-full px-3 py-2.5 rounded-xl text-white text-center text-sm mb-3 focus:outline-none"
                style={{
                  fontFamily: 'Montserrat',
                  background: 'rgba(255,255,255,0.05)',
                  border: '0.5px solid rgba(212,175,55,0.3)'
                }}
              />
              <button onClick={logWeight} disabled={!weight || loading}
                className="w-full py-2.5 rounded-xl text-[#080808] text-xs uppercase tracking-wider disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #F4D03F 50%, ${GOLD} 100%)`, minHeight: 40 }}>
                {loading ? '…' : 'Save'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Note overlay */}
      <AnimatePresence>
        {activeAction === 'quick_note' && (
          <motion.div
            key="quick-note"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-x-4"
            style={{ bottom: 170, zIndex: 9999 }}
          >
            <div style={{
              background: 'rgba(212,175,55,0.06)',
              border: '0.5px solid rgba(212,175,55,0.35)',
              backdropFilter: 'blur(40px)',
              borderRadius: 22, padding: 20
            }}>
              <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] mb-3"
                style={{ fontFamily: 'Montserrat' }}>Quick Note</p>
              <textarea
                autoFocus rows={4}
                placeholder="Gym thoughts, energy notes, PRs..."
                value={note} onChange={e => setNote(e.target.value)}
                className="w-full bg-transparent text-white/70 text-sm resize-none focus:outline-none"
                style={{ fontFamily: 'Montserrat', fontWeight: 300 }}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={close}
                  className="px-4 py-2 rounded-xl text-white/30 text-xs uppercase tracking-wider">
                  Dismiss
                </button>
                <button onClick={() => { setNote(''); close(); }}
                  className="px-4 py-2.5 rounded-xl text-[#080808] text-xs uppercase tracking-wider"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, #F4D03F)` }}>
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB container */}
      <div className="fixed" style={{ bottom: 100, right: 20, width: 56, height: 56, zIndex: 9999 }}>

        {/* Orbital sub-buttons */}
        <AnimatePresence>
          {isOpen && SUB_BUTTONS.map((btn, i) => {
            const Icon = btn.icon;
            return (
              <motion.button
                key={btn.action}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
                animate={{ x: btn.dx, y: btn.dy, opacity: 1, scale: 1 }}
                exit={{ x: 0, y: 0, opacity: 0, scale: 0.2, transition: { duration: 0.12 } }}
                transition={{ type: 'spring', damping: 12, stiffness: 120, delay: i * 0.05 }}
                onHoverStart={() => haptic('light')}
                onClick={() => handleAction(btn.action)}
                className="absolute flex flex-col items-center justify-center"
                style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '0.5px solid rgba(212,175,55,0.55)',
                  left: 7, top: 7,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 12px rgba(212,175,55,0.15)',
                  touchAction: 'none',
                }}
              >
                <Icon style={{ width: 15, height: 15, color: btn.color }} strokeWidth={1.5} />
                <span style={{
                  fontSize: 7, color: 'rgba(0,0,0,0.45)', marginTop: 2,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontFamily: 'Montserrat, sans-serif', fontWeight: 500
                }}>
                  {btn.label}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => clearTimeout(longPressTimer.current)}
          animate={shouldPulse && !isOpen ? {
            boxShadow: [
              '0 0 20px rgba(225,193,110,0.3)',
              '0 0 38px rgba(225,193,110,0.65)',
              '0 0 20px rgba(225,193,110,0.3)'
            ]
          } : {
            boxShadow: '0 0 20px rgba(225,193,110,0.3)'
          }}
          transition={shouldPulse && !isOpen ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : {}}
          whileTap={{ scale: 0.9 }}
          className="absolute inset-0 flex items-center justify-center rounded-full"
          style={{
            background: `linear-gradient(135deg, ${GOLD} 0%, #F4D03F 50%, ${GOLD} 100%)`,
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          >
            <Plus className="w-6 h-6 text-[#080808]" strokeWidth={2.5} />
          </motion.div>
        </motion.button>
      </div>
    </>
  );
}