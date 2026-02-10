import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, Settings } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const PLATES = [
  { weight: 25, color: '#EF4444', name: 'Red' },
  { weight: 20, color: '#3B82F6', name: 'Blue' },
  { weight: 15, color: '#FACC15', name: 'Yellow' },
  { weight: 10, color: '#22C55E', name: 'Green' },
  { weight: 5, color: '#F8FAFC', name: 'White' },
  { weight: 2.5, color: '#EF4444', name: 'Red' },
  { weight: 1.25, color: '#6B7280', name: 'Gray' },
];

const BAR_WEIGHT = 20; // Olympic bar

export default function PlateCalculator({ isOpen, onClose }) {
  const [targetWeight, setTargetWeight] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [enabledPlates, setEnabledPlates] = useState(
    PLATES.reduce((acc, plate) => ({ ...acc, [plate.weight]: true }), {})
  );

  const togglePlate = (weight) => {
    setEnabledPlates(prev => ({ ...prev, [weight]: !prev[weight] }));
  };

  const calculatePlates = (total) => {
    if (!total || total <= BAR_WEIGHT) return [];
    
    let remaining = (total - BAR_WEIGHT) / 2; // Per side
    const platesToUse = [];

    const availablePlates = PLATES.filter(plate => enabledPlates[plate.weight]);
    
    for (const plate of availablePlates) {
      while (remaining >= plate.weight) {
        platesToUse.push(plate);
        remaining -= plate.weight;
      }
    }

    return platesToUse;
  };

  const plates = calculatePlates(parseFloat(targetWeight));
  const actualWeight = BAR_WEIGHT + (plates.reduce((sum, p) => sum + p.weight, 0) * 2);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm"
        >
          <GlassCard className="p-6" glow>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calculator className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-lg text-white">Plate Calculator</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Settings className={`w-4 h-4 text-[#D4AF37] transition-transform ${showSettings ? 'rotate-90' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-white/5 rounded-xl p-4 border border-[#D4AF37]/20">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Available Plates</p>
                    <div className="space-y-2">
                      {PLATES.map((plate) => (
                        <div
                          key={plate.weight}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: plate.color }}
                            />
                            <span className="text-white text-sm">{plate.weight}kg</span>
                            <span className="text-white/40 text-xs">({plate.name})</span>
                          </div>
                          <Switch
                            checked={enabledPlates[plate.weight]}
                            onCheckedChange={() => togglePlate(plate.weight)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              type="number"
              placeholder="Target weight (kg)"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="mb-6 text-center text-2xl py-6 bg-white/5 border-[#D4AF37]/20"
            />

            {/* Barbell Visualization */}
            <div className="relative h-20 mb-6">
              {/* Bar */}
              <div className="absolute top-1/2 left-0 right-0 h-3 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full -translate-y-1/2" />
              
              {/* Plates on left */}
              <div className="absolute top-1/2 left-4 flex items-center -translate-y-1/2">
                {[...plates].reverse().map((plate, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded"
                    style={{
                      width: 8 + plate.weight * 0.5,
                      height: 30 + plate.weight * 1.5,
                      backgroundColor: plate.color,
                      marginLeft: i === 0 ? 0 : -2,
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
                    }}
                  />
                ))}
              </div>

              {/* Plates on right */}
              <div className="absolute top-1/2 right-4 flex items-center -translate-y-1/2 flex-row-reverse">
                {[...plates].reverse().map((plate, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded"
                    style={{
                      width: 8 + plate.weight * 0.5,
                      height: 30 + plate.weight * 1.5,
                      backgroundColor: plate.color,
                      marginRight: i === 0 ? 0 : -2,
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Plate breakdown */}
            {plates.length > 0 && (
              <div className="space-y-3">
                <p className="text-center text-white/40 text-xs uppercase tracking-wider">
                  Per Side
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {[...new Set(plates.map(p => p.weight))].map((weight) => {
                    const count = plates.filter(p => p.weight === weight).length;
                    const plate = PLATES.find(p => p.weight === weight);
                    return (
                      <div
                        key={weight}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5"
                      >
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: plate?.color }}
                        />
                        <span className="text-white text-sm">{count}× {weight}kg</span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-white/40 text-xs">Bar: {BAR_WEIGHT}kg</p>
                  <p className="text-2xl text-[#D4AF37] mt-1">{actualWeight}kg</p>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}