import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function WingIcon({ size = 16, color = '#E5E5E7', opacity = 1, glowing = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ opacity, filter: glowing ? 'drop-shadow(0 0 5px rgba(212,175,55,0.7))' : 'none' }}>
      {/* Left wing */}
      <path d="M12 18 Q8 14 4 15 Q6 10 10 9 Q8 6 12 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill={glowing ? 'rgba(212,175,55,0.15)' : 'none'}/>
      {/* Right wing */}
      <path d="M12 18 Q16 14 20 15 Q18 10 14 9 Q16 6 12 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill={glowing ? 'rgba(212,175,55,0.15)' : 'none'}/>
      {/* Center spine */}
      <line x1="12" y1="4" x2="12" y2="18" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

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
      className="relative flex items-center gap-2 px-3 transition-all active:scale-90"
      style={{
        height: 36,
        background: isActive ? 'rgba(212,175,55,0.10)' : 'rgba(229,229,231,0.04)',
        border: `0.5px solid ${isActive ? 'rgba(212,175,55,0.5)' : 'rgba(229,229,231,0.15)'}`,
        borderRadius: 10,
        boxShadow: isActive && isFounder ? '0 0 12px rgba(212,175,55,0.25)' : 'none',
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
            style={{ borderRadius: 10, background: 'radial-gradient(circle, rgba(212,175,55,0.45) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      {/* Wing icon */}
      <motion.div
        animate={animating ? { scale: [1, 1.25, 1], y: [0, -3, 0] } : { scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <WingIcon
          size={16}
          color={isActive ? '#D4AF37' : '#E5E5E7'}
          opacity={isActive ? 1 : 0.4}
          glowing={isActive}
        />
      </motion.div>

      {/* Counter */}
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayCount}
          initial={{ y: 4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -4, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 12,
            color: isActive ? '#D4AF37' : '#98AB8F',
            letterSpacing: '0.04em',
            lineHeight: 1,
            textShadow: flicker ? '0 0 8px rgba(212,175,55,0.8)' : (isActive ? '0 0 4px rgba(212,175,55,0.3)' : 'none'),
          }}
        >
          {displayCount}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}