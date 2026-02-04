import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Link2, Flame } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import GoldButton from '@/components/ui/GoldButton';

export default function LiveLogger({ 
  exercise, 
  setNumber, 
  previousSet, 
  isSuperset, 
  onComplete, 
  onSkip 
}) {
  const [weight, setWeight] = useState(previousSet?.weight?.toString() || '');
  const [reps, setReps] = useState(previousSet?.reps?.toString() || '');
  const [rpe, setRpe] = useState(7);
  const [isWarmup, setIsWarmup] = useState(false);

  const handleComplete = () => {
    onComplete({
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      set_number: setNumber,
      weight: parseFloat(weight) || 0,
      reps: parseInt(reps) || 0,
      rpe,
      is_warmup: isWarmup
    });
    setWeight('');
    setReps('');
    setRpe(7);
    setIsWarmup(false);
  };

  return (
    <GlassCard className="p-5" glow>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            {isSuperset && (
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Link2 className="w-3 h-3 text-purple-400" />
              </div>
            )}
            <h3 className="text-white text-lg">{exercise.name}</h3>
          </div>
          <p className="text-white/40 text-sm mt-1">Set {setNumber}</p>
        </div>
        
        <button
          onClick={() => setIsWarmup(!isWarmup)}
          className={`px-3 py-1 rounded-full text-xs transition-all ${
            isWarmup 
              ? 'bg-orange-500/20 text-orange-400 border border-orange-400/50' 
              : 'bg-white/10 text-white/40'
          }`}
        >
          <Flame className="w-3 h-3 inline mr-1" />
          Warmup
        </button>
      </div>

      {/* Previous Set Reference */}
      {previousSet && (
        <div className="mb-4 p-3 rounded-xl bg-white/5">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Previous</p>
          <p className="text-white/60 text-sm">
            {previousSet.weight}kg × {previousSet.reps} reps 
            {previousSet.rpe && <span className="text-white/40"> @ RPE {previousSet.rpe}</span>}
          </p>
        </div>
      )}

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Weight (kg)</label>
          <Input
            type="number"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0"
            className="text-center text-2xl py-6 bg-white/5 border-[#D4AF37]/20"
          />
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Reps</label>
          <Input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="0"
            className="text-center text-2xl py-6 bg-white/5 border-[#D4AF37]/20"
          />
        </div>
      </div>

      {/* RPE Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-white/40 text-xs uppercase tracking-wider">RPE (Rate of Perceived Exertion)</label>
          <span className="text-[#D4AF37] text-lg">{rpe}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="10"
            value={rpe}
            onChange={(e) => setRpe(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${(rpe - 1) * 11.1}%, rgba(255,255,255,0.1) ${(rpe - 1) * 11.1}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
          <div className="flex justify-between mt-2 text-[10px] text-white/30">
            <span>Easy</span>
            <span>Moderate</span>
            <span>Max Effort</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-xl bg-white/5 text-white/50 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Skip
        </button>
        <GoldButton 
          onClick={handleComplete} 
          className="flex-1 flex items-center justify-center gap-2"
          disabled={!weight || !reps}
        >
          <Check className="w-4 h-4" />
          Complete
        </GoldButton>
      </div>
    </GlassCard>
  );
}