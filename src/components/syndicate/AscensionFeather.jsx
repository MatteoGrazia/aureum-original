import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Light-snap haptic
const softSnap = () => { if (navigator.vibrate) navigator.vibrate(8); };

// Official Aureum Feather Logo — diagonal quill, solid fill with highlight cuts
function AureumFeatherSVG({ filled, size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="goldFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5E17A" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9A7B10" />
        </linearGradient>
        <linearGradient id="sheenSweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFF8C0" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFF8C0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFF8C0" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Main feather body — diagonal, top-right to bottom-left */}
      <path
        d="M72 8 C88 18, 95 38, 85 56 C78 68, 62 74, 50 78 C42 82, 30 88, 22 94
           C24 86, 28 80, 32 74 C20 70, 10 58, 12 44 C14 28, 30 12, 50 10 C57 9, 65 7, 72 8 Z"
        fill={filled ? 'url(#goldFill)' : 'none'}
        stroke={filled ? 'url(#goldFill)' : '#E5E5E7'}
        strokeWidth={filled ? 0 : 1.5}
        strokeLinejoin="round"
      />

      {/* Central quill highlight — white cut through middle */}
      <path
        d="M68 14 C60 28, 46 52, 28 82"
        stroke="white"
        strokeWidth={filled ? 2.5 : 0}
        strokeLinecap="round"
        opacity={filled ? 0.85 : 0}
      />

      {/* Upper highlight barb cut */}
      <path
        d="M74 28 C66 30, 58 34, 52 42"
        stroke="white"
        strokeWidth={filled ? 1.8 : 0}
        strokeLinecap="round"
        opacity={filled ? 0.7 : 0}
      />

      {/* Lower barb split */}
      <path
        d="M56 58 C50 62, 44 68, 38 76"
        stroke="white"
        strokeWidth={filled ? 1.5 : 0}
        strokeLinecap="round"
        opacity={filled ? 0.6 : 0}
      />

      {/* Quill tip tuft — bottom-left curling barbs */}
      <path
        d="M22 94 C18 90, 16 84, 20 80 C17 78, 14 74, 18 70"
        stroke={filled ? 'url(#goldFill)' : '#E5E5E7'}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
        opacity={filled ? 0.9 : 0.6}
      />
    </svg>
  );
}

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