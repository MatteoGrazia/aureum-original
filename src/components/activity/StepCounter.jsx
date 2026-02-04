import React from 'react';
import { motion } from 'framer-motion';
import { Footprints } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function StepCounter({ steps, goal }) {
  const progress = Math.min(steps / goal, 1);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress * circumference);
  
  // Glow intensity increases as we approach goal
  const glowIntensity = Math.min(progress * 1.5, 1);

  return (
    <GlassCard 
      className="p-6" 
      glow
      style={{
        boxShadow: `0 0 ${30 * glowIntensity}px rgba(212, 175, 55, ${0.3 * glowIntensity}), 0 0 ${60 * glowIntensity}px rgba(212, 175, 55, ${0.1 * glowIntensity})`
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              `inset 0 0 60px rgba(212, 175, 55, ${0.05 * glowIntensity})`,
              `inset 0 0 80px rgba(212, 175, 55, ${0.1 * glowIntensity})`,
              `inset 0 0 60px rgba(212, 175, 55, ${0.05 * glowIntensity})`,
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <svg className="w-52 h-52 -rotate-90" viewBox="0 0 200 200">
          {/* Outer glow */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background ring */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgba(212, 175, 55, 0.1)"
            strokeWidth="8"
          />
          
          {/* Progress ring */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            filter="url(#glow)"
            style={{
              filter: `drop-shadow(0 0 ${15 * glowIntensity}px rgba(212, 175, 55, ${0.8 * glowIntensity}))`
            }}
          />

          {/* Animated particles along the ring when near goal */}
          {progress > 0.8 && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx="100"
                  cy="10"
                  r="3"
                  fill="#D4AF37"
                  animate={{
                    rotate: [0, 360],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ 
                    transformOrigin: '100px 100px',
                    filter: 'blur(1px)'
                  }}
                />
              ))}
            </>
          )}
        </svg>

        {/* Center Content */}
        <div className="absolute text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Footprints 
              className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]" 
              style={{
                filter: `drop-shadow(0 0 ${10 * glowIntensity}px rgba(212, 175, 55, ${0.5 * glowIntensity}))`
              }}
            />
          </motion.div>
          
          <motion.p
            key={steps}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl text-white"
            style={{
              textShadow: `0 0 ${20 * glowIntensity}px rgba(212, 175, 55, ${0.5 * glowIntensity})`
            }}
          >
            {steps.toLocaleString()}
          </motion.p>
          
          <p className="text-white/40 text-xs uppercase tracking-widest mt-1">
            of {goal.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Percentage indicator */}
      <div className="text-center mt-4">
        <motion.p
          className={`text-lg ${progress >= 1 ? 'text-[#D4AF37]' : 'text-white/60'}`}
          animate={progress >= 1 ? {
            scale: [1, 1.1, 1],
            textShadow: ['0 0 0px transparent', '0 0 20px #D4AF37', '0 0 0px transparent']
          } : {}}
          transition={{ duration: 0.5, repeat: progress >= 1 ? Infinity : 0, repeatDelay: 2 }}
        >
          {Math.round(progress * 100)}% {progress >= 1 ? '🎉' : ''}
        </motion.p>
      </div>
    </GlassCard>
  );
}