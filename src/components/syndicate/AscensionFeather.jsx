import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Soft Lift haptic — light impact + subtle vibration 200ms later
const softLift = () => {
  if (!navigator.vibrate) return;
  navigator.vibrate(12);
  setTimeout(() => navigator.vibrate(6), 200);
};

// Minimalist vertical feather SVG matching Aureum aesthetic
function FeatherSVG({ filled, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="featherGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4D03F" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8960C" />
        </linearGradient>
      </defs>
      {/* Central quill */}
      <line x1="12" y1="21" x2="12" y2="3"
        stroke={filled ? 'url(#featherGold)' : '#E5E5E7'}
        strokeWidth="1.2" strokeLinecap="round" />
      {/* Left barbs */}
      <path d="M12 6 C10 7, 7.5 8.5, 6 11" stroke={filled ? 'url(#featherGold)' : '#E5E5E7'} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M12 9 C10 10, 7 11.5, 5.5 14" stroke={filled ? 'url(#featherGold)' : '#E5E5E7'} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M12 12 C10 13, 7.5 14, 6 16.5" stroke={filled ? 'url(#featherGold)' : '#E5E5E7'} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M12 15 C10.5 15.8, 8.5 16.5, 7.5 18.5" stroke={filled ? 'url(#featherGold)' : '#E5E5E7'} strokeWidth="0.9" strokeLinecap="round" fill="none" />
      {/* Right barbs */}
      <path d="M12 6 C14 7, 16.5 8.5, 18 11" stroke={filled ? 'url(#featherGold)' : '#E5E5E7'} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M12 9 C14 10, 17 11.5, 18.5 14" stroke={filled ? 'url(#featherGold)' : '#E5E5E7'} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M12 12 C14 13, 16.5 14, 18 16.5" stroke={filled ? 'url(#featherGold)' : '#E5E5E7'} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M12 15 C13.5 15.8, 15.5 16.5, 16.5 18.5" stroke={filled ? 'url(#featherGold)' : '#E5E5E7'} strokeWidth="0.9" strokeLinecap="round" fill="none" />
      {/* Feather tip */}
      <path d="M11 3.5 Q12 2 13 3.5" stroke={filled ? 'url(#featherGold)' : '#E5E5E7'} strokeWidth="1" strokeLinecap="round" fill={filled ? 'url(#featherGold)' : 'none'} fillOpacity={0.3} />
    </svg>
  );
}

export default function AscensionFeather({ count = 0, hasGiven = false, onAscend, disabled = false }) {
  const [animating, setAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  const handleTap = () => {
    if (hasGiven || disabled) return;
    softLift();
    setAnimating(true);
    setShowPulse(true);
    setTimeout(() => setAnimating(false), 500);
    setTimeout(() => setShowPulse(false), 700);
    onAscend?.();
  };

  return (
    <button
      onClick={handleTap}
      disabled={hasGiven || disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 relative"
      style={{
        background: hasGiven ? 'rgba(212,175,55,0.10)' : 'rgba(229,229,231,0.04)',
        border: `0.5px solid ${hasGiven ? 'rgba(212,175,55,0.45)' : 'rgba(229,229,231,0.15)'}`,
      }}
    >
      {/* Gold radial pulse ring */}
      <AnimatePresence>
        {showPulse && (
          <motion.div
            initial={{ opacity: 0.6, scale: 0.6 }}
            animate={{ opacity: 0, scale: 2.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.35) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      {/* Feather with float animation */}
      <motion.div
        animate={animating ? { y: [-8, 0] } : { y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <FeatherSVG filled={hasGiven} size={20} />
      </motion.div>

      <span
        className="text-xs"
        style={{
          color: hasGiven ? '#D4AF37' : 'rgba(229,229,231,0.45)',
          fontFamily: 'Montserrat, sans-serif',
          letterSpacing: '0.08em',
        }}
      >
        {count} {count === 1 ? 'ASCENSION' : 'ASCENSIONS'}
      </span>
    </button>
  );
}