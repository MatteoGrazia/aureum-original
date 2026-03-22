import React from 'react';
import { motion } from 'framer-motion';
import { differenceInHours } from 'date-fns';

const SHIMMER_KEYFRAMES = `
  @keyframes goldShimmer {
    0%, 100% { border-color: #D4AF37; box-shadow: 0 0 8px rgba(212,175,55,0.4); }
    50% { border-color: #F4D03F; box-shadow: 0 0 16px rgba(244,208,63,0.6); }
  }
`;

export default function AthleteAvatar({ 
  athlete, 
  size = 'md', 
  showBorder = true,
  onClick 
}) {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-xs' },
    md: { container: 'w-10 h-10', text: 'text-sm' },
    lg: { container: 'w-14 h-14', text: 'text-base' },
    xl: { container: 'w-20 h-20', text: 'text-xl' }
  };

  const sizeClasses = sizes[size] || sizes.md;
  
  // Determine border state
  const isActive = athlete?.last_active 
    ? differenceInHours(new Date(), new Date(athlete.last_active)) < 12
    : false;
  
  const isFounder = athlete?.is_founder === true;

  // Border styles based on state hierarchy
  let borderStyle = {};
  if (!showBorder) {
    borderStyle = { border: 'none' };
  } else if (isFounder) {
    borderStyle = { 
      border: '2px solid #D4AF37',
      animation: 'goldShimmer 2s ease-in-out infinite'
    };
  } else if (isActive) {
    borderStyle = { 
      border: '1.5px solid #B2D8D8',
      boxShadow: '0 0 8px rgba(178,216,216,0.3)'
    };
  } else {
    borderStyle = { border: '1px solid #E5E5E7' };
  }

  return (
    <>
      <style>{SHIMMER_KEYFRAMES}</style>
      <motion.div
        onClick={onClick}
        whileTap={onClick ? { scale: 0.95 } : {}}
        className={`${sizeClasses.container} rounded-full flex items-center justify-center flex-shrink-0 ${onClick ? 'cursor-pointer' : ''}`}
        style={{
          background: athlete?.avatar_url
            ? `url(${athlete.avatar_url}) center/cover`
            : 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(178,216,216,0.2))',
          color: '#D4AF37',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 500,
          ...borderStyle
        }}
      >
        {!athlete?.avatar_url && (
          <span className={sizeClasses.text}>
            {(athlete?.username?.[0] || athlete?.display_name?.[0] || '?').toUpperCase()}
          </span>
        )}
      </motion.div>
    </>
  );
}