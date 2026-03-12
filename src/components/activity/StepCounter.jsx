import React from 'react';
import { motion } from 'framer-motion';
import { Footprints } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';

export default function StepCounter({ steps, goal }) {
  const { isDarkMode } = useTheme();
  const progress = Math.min(steps / goal, 1);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress * circumference);
  
  // Glow intensity increases as we approach goal
  const glowIntensity = Math.min(progress * 1.5, 1);

  return (
    <div 
      className="relative overflow-hidden"
      style={{
        background: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: isDarkMode ? '0 20px 50px rgba(0, 0, 0, 0.6)' : '0 10px 30px rgba(225, 193, 110, 0.15)',
        border: '0.5px solid rgba(212, 175, 55, 0.18)',
        padding: '20px 18px',
        borderRadius: '14px'
      }}
    >
      {/* Subtle white reflection */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(255, 255, 255, 0.01) 0%, transparent 60%)',
          borderRadius: '14px 14px 0 0'
        }}
      />

      <div className="relative z-10 flex items-center justify-center py-8">
        <svg className="w-52 h-52 -rotate-90" viewBox="0 0 200 200">
          {/* Background ring */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgba(156, 126, 70, 0.2)"
            strokeWidth="2"
          />
          
          {/* Progress ring */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#stepGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              filter: progress > 0.8 
                ? 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.5))' 
                : 'drop-shadow(0 0 3px rgba(212, 175, 55, 0.3))'
            }}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="stepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9C7E46" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>

          {/* Shimmer effect - removed for performance */}
        </svg>

        {/* Center Content */}
        <div className="absolute text-center">
          <Footprints 
            className="w-8 h-8 mx-auto mb-2" 
            style={{ color: '#8ECAE6' }}
            strokeWidth={1.5}
          />
          
          <p
            className="text-4xl text-white"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
          >
            {steps.toLocaleString()}
          </p>
          
          <p 
            className="text-white/40 text-xs uppercase tracking-widest mt-1"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
          >
            of {goal.toLocaleString()}
          </p>
          
          <p 
            className="text-[#C9A961] text-sm mt-2 tracking-wider"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            {Math.round(progress * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}