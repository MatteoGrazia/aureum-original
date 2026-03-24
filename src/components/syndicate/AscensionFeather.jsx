import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather } from 'lucide-react';

// Light-snap haptic
const softSnap = () => { if (navigator.vibrate) navigator.vibrate(8); };

export default function AscensionFeather({ count = 0, hasGiven = false, onAscend, disabled = false, isFounder = false }) {
  const [animating, setAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [displayCount, setDisplayCount] = useState(count);
  const [flicker, setFlicker] = useState(false);

  useEffect(() => { setDisplayCount(count); }, [count]);

  const handleTap = () => {
    if (hasGiven || disabled) return;
    softSnap();
    setAnimating(true);
    setShowPulse(true);
    setFlicker(true);
    setTimeout(() => setAnimating(false), 450);
    setTimeout(() => setShowPulse(false), 650);
    setTimeout(() => setFlicker(false), 400);
    onAscend?.();
  };

  const isActive = hasGiven;

  return (
    <button
      onClick={handleTap}
      disabled={isActive || disabled}
      className="relative flex flex-col items-center justify-center transition-all active:scale-90"
      style={{
        width: 52,
        height: 60,
        background: isActive ? 'rgba(212,175,55,0.10)' : 'rgba(229,229,231,0.04)',
        border: `0.5px solid ${isActive ? 'rgba(212,175,55,0.5)' : 'rgba(229,229,231,0.15)'}`,
        borderRadius: 14,
        boxShadow: isActive && isFounder ? '0 0 16px rgba(212,175,55,0.3)' : 'none',
      }}
    >
      {/* Radial pulse burst */}
      <AnimatePresence>
        {showPulse && (
          <motion.div
            initial={{ opacity: 0.7, scale: 0.4 }}
            animate={{ opacity: 0, scale: 2.5 }}
            exit={{}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: 14, background: 'radial-gradient(circle, rgba(212,175,55,0.45) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      {/* Feather icon with fan-scale animation */}
      <motion.div
        animate={animating ? { scale: [1, 1.15, 1], rotate: [-3, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 2 }}
      >
        <AureumFeatherSVG filled={isActive} size={28} />
      </motion.div>

      {/* Counter — always Signature Gold */}
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayCount}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 11,
            color: '#D4AF37',
            letterSpacing: '0.04em',
            lineHeight: 1,
            textShadow: flicker ? '0 0 10px rgba(212,175,55,0.9)' : (isActive ? '0 0 6px rgba(212,175,55,0.4)' : 'none'),
            display: 'block',
          }}
        >
          {displayCount}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}