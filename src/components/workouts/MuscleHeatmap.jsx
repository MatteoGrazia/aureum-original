import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

const musclePositions = {
  front: {
    chest: { x: 50, y: 25, size: 28 },
    shoulders: { x: 50, y: 18, size: 35 },
    biceps: { x: 25, y: 32, size: 12 },
    triceps: { x: 75, y: 32, size: 12 },
    core: { x: 50, y: 42, size: 20 },
    legs: { x: 50, y: 70, size: 30 },
    forearms: { x: 20, y: 48, size: 8 },
  },
  back: {
    back: { x: 50, y: 30, size: 30 },
    glutes: { x: 50, y: 52, size: 22 },
    calves: { x: 50, y: 85, size: 15 },
  }
};

export default function MuscleHeatmap({ targetMuscles = [] }) {
  const getMuscleIntensity = (muscle) => {
    if (targetMuscles.includes(muscle)) return 1;
    return 0;
  };

  const renderMuscle = (muscle, pos, view) => {
    const intensity = getMuscleIntensity(muscle);
    const isActive = intensity > 0;

    return (
      <motion.div
        key={`${view}-${muscle}`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: isActive ? 0.8 : 0.1,
          scale: 1
        }}
        transition={{ duration: 0.5 }}
        className="absolute rounded-full"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          width: `${pos.size}%`,
          height: `${pos.size * 0.8}%`,
          transform: 'translate(-50%, -50%)',
          background: isActive 
            ? `radial-gradient(circle, rgba(212,175,55,${intensity}) 0%, rgba(212,175,55,0) 70%)`
            : 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          boxShadow: isActive ? `0 0 ${20 * intensity}px rgba(212,175,55,${intensity * 0.5})` : 'none'
        }}
      />
    );
  };

  return (
    <GlassCard className="p-5">
      <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Target Muscles</h3>
      
      <div className="flex gap-4">
        {/* Front View */}
        <div className="flex-1 relative aspect-[1/2] bg-white/5 rounded-xl overflow-hidden">
          <p className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-white/30 uppercase tracking-wider">Front</p>
          
          {/* Body Outline */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 200">
            <ellipse cx="50" cy="15" rx="15" ry="15" fill="none" stroke="white" strokeWidth="0.5"/>
            <line x1="50" y1="30" x2="50" y2="75" stroke="white" strokeWidth="0.5"/>
            <line x1="50" y1="40" x2="20" y2="60" stroke="white" strokeWidth="0.5"/>
            <line x1="50" y1="40" x2="80" y2="60" stroke="white" strokeWidth="0.5"/>
            <line x1="50" y1="75" x2="35" y2="130" stroke="white" strokeWidth="0.5"/>
            <line x1="50" y1="75" x2="65" y2="130" stroke="white" strokeWidth="0.5"/>
          </svg>

          {/* Muscle overlays */}
          {Object.entries(musclePositions.front).map(([muscle, pos]) => 
            renderMuscle(muscle, pos, 'front')
          )}
        </div>

        {/* Back View */}
        <div className="flex-1 relative aspect-[1/2] bg-white/5 rounded-xl overflow-hidden">
          <p className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-white/30 uppercase tracking-wider">Back</p>
          
          {/* Body Outline */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 200">
            <ellipse cx="50" cy="15" rx="15" ry="15" fill="none" stroke="white" strokeWidth="0.5"/>
            <line x1="50" y1="30" x2="50" y2="75" stroke="white" strokeWidth="0.5"/>
            <line x1="50" y1="40" x2="20" y2="60" stroke="white" strokeWidth="0.5"/>
            <line x1="50" y1="40" x2="80" y2="60" stroke="white" strokeWidth="0.5"/>
            <line x1="50" y1="75" x2="35" y2="130" stroke="white" strokeWidth="0.5"/>
            <line x1="50" y1="75" x2="65" y2="130" stroke="white" strokeWidth="0.5"/>
          </svg>

          {/* Muscle overlays */}
          {Object.entries(musclePositions.back).map(([muscle, pos]) => 
            renderMuscle(muscle, pos, 'back')
          )}
        </div>
      </div>

      {/* Legend */}
      {targetMuscles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {targetMuscles.map((muscle) => (
            <span
              key={muscle}
              className="px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-xs capitalize"
            >
              {muscle}
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  );
}