import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Soft-snap haptic — feather-light tap
const softSnap = () => {
  if (!navigator.vibrate) return;
  navigator.vibrate(8);
};

// Deterministic dust particles
const DUST = Array.from({ length: 7 }, (_, i) => ({
  id: i,
  angle: (i * 51 + 20) % 360,
  dist: 14 + (i % 3) * 7,
  size: 1.5 + (i % 2) * 1,
  delay: i * 0.04,
}));

// Highly-detailed feather SVG — Aureum Logo style
function FeatherSVG({ filled, animating, isFounder }) {
  const quillColor = filled ? 'url(#featherGold)' : '#E5E5E7';
  const barbColor = filled ? 'url(#featherGold)' : 'rgba(229,229,231,0.65)';

  // Fan spread: barbs open outward when animating
  const spread = animating ? 1.4 : 1;

  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="featherGold" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#F5E17A" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9A7B10" />
        </linearGradient>
        {isFounder && (
          <linearGradient id="founderSheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFF5B0" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFF5B0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFF5B0" stopOpacity="0" />
          </linearGradient>
        )}
      </defs>

      {/* Quill spine */}
      <motion.line
        x1="13" y1="28" x2="13" y2="2"
        stroke={quillColor}
        strokeWidth="1.3"
        strokeLinecap="round"
        animate={{ scaleY: animating ? [1, 1.06, 1] : 1 }}
        transition={{ duration: 0.4 }}
        style={{ transformOrigin: '13px 28px' }}
      />

      {/* Left barbs — fan open */}
      {[
        { y: 5,  cx: 10, cy: 8,   ex: 5,  ey: 10  },
        { y: 8,  cx: 9,  cy: 11,  ex: 4,  ey: 13  },
        { y: 11, cx: 9,  cy: 14,  ex: 4.5,ey: 16.5 },
        { y: 14, cx: 10, cy: 16.5,ex: 6,  ey: 19  },
        { y: 17, cx: 10.5,cy: 19, ex: 7.5,ey: 21.5 },
        { y: 20, cx: 11, cy: 21.5,ex: 9,  ey: 24  },
      ].map((b, i) => (
        <motion.path
          key={`L${i}`}
          d={`M13 ${b.y} C${b.cx} ${b.cy}, ${b.ex} ${b.ey}, ${b.ex - (spread - 1) * 2} ${b.ey + (spread - 1) * 1.5}`}
          stroke={barbColor}
          strokeWidth={i < 3 ? 1.1 : 0.95}
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: animating ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.35, delay: i * 0.03 }}
        />
      ))}

      {/* Right barbs — fan open */}
      {[
        { y: 5,  cx: 16, cy: 8,   ex: 21, ey: 10  },
        { y: 8,  cx: 17, cy: 11,  ex: 22, ey: 13  },
        { y: 11, cx: 17, cy: 14,  ex: 21.5,ey: 16.5 },
        { y: 14, cx: 16, cy: 16.5,ex: 20, ey: 19  },
        { y: 17, cx: 15.5,cy: 19, ex: 18.5,ey: 21.5 },
        { y: 20, cx: 15, cy: 21.5,ex: 17, ey: 24  },
      ].map((b, i) => (
        <motion.path
          key={`R${i}`}
          d={`M13 ${b.y} C${b.cx} ${b.cy}, ${b.ex} ${b.ey}, ${b.ex + (spread - 1) * 2} ${b.ey + (spread - 1) * 1.5}`}
          stroke={barbColor}
          strokeWidth={i < 3 ? 1.1 : 0.95}
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: animating ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.35, delay: i * 0.03 }}
        />
      ))}

      {/* Tip */}
      <path
        d="M11.5 2.5 Q13 1 14.5 2.5"
        stroke={quillColor}
        strokeWidth="1.1"
        strokeLinecap="round"
        fill={filled ? 'url(#featherGold)' : 'none'}
        fillOpacity={0.25}
      />

      {/* Founder metallic sheen sweep */}
      {isFounder && filled && (
        <motion.rect
          x="-2" y="0" width="8" height="30"
          fill="url(#founderSheen)"
          style={{ mixBlendMode: 'overlay' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.5 }}
        />
      )}
    </svg>
  );
}

function DustParticle({ angle, dist, size, delay, active }) {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * dist;
  const ty = Math.sin(rad) * dist;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
          animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
          exit={{}}
          transition={{ duration: 0.55, delay, ease: 'easeOut' }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size,
            height: size,
            background: '#D4AF37',
            top: '38%',
            left: '50%',
            marginLeft: -size / 2,
            marginTop: -size / 2,
            boxShadow: '0 0 3px rgba(212,175,55,0.8)',
          }}
        />
      )}
    </AnimatePresence>
  );
}

export default function AscensionFeather({ count = 0, hasGiven = false, onAscend, disabled = false, isFounder = false }) {
  const [animating, setAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showDust, setShowDust] = useState(false);
  const [displayCount, setDisplayCount] = useState(count);
  const [floatNum, setFloatNum] = useState(false);

  // Keep displayCount in sync when prop changes externally
  React.useEffect(() => { setDisplayCount(count); }, [count]);

  const handleTap = () => {
    if (hasGiven || disabled) return;
    softSnap();

    setAnimating(true);
    setShowPulse(true);
    setShowDust(true);
    setFloatNum(true);

    setTimeout(() => setAnimating(false), 500);
    setTimeout(() => setShowPulse(false), 700);
    setTimeout(() => setShowDust(false), 650);
    setTimeout(() => setFloatNum(false), 500);

    onAscend?.();
  };

  const isActive = hasGiven;
  const founderActive = isFounder && isActive;

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
        boxShadow: founderActive ? '0 0 14px rgba(212,175,55,0.25)' : 'none',
      }}
    >
      {/* Radial pulse burst */}
      <AnimatePresence>
        {showPulse && (
          <motion.div
            initial={{ opacity: 0.7, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2.4 }}
            exit={{}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 rounded-[14px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      {/* Gold dust particles */}
      {DUST.map(p => (
        <DustParticle key={p.id} {...p} active={showDust} />
      ))}

      {/* Feather icon */}
      <motion.div
        animate={animating ? { y: [-6, 0], rotate: [-4, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <FeatherSVG filled={isActive} animating={animating} isFounder={founderActive} />
      </motion.div>

      {/* Counter — floats up on tick */}
      <div className="relative" style={{ height: 14, marginTop: 2 }}>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={displayCount}
            initial={floatNum ? { y: 6, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 11,
              color: isActive ? '#D4AF37' : 'rgba(229,229,231,0.55)',
              letterSpacing: '0.04em',
              textShadow: isActive ? '0 0 8px rgba(212,175,55,0.6)' : 'none',
              display: 'block',
              lineHeight: 1,
            }}
          >
            {displayCount}
          </motion.span>
        </AnimatePresence>
      </div>
    </button>
  );
}