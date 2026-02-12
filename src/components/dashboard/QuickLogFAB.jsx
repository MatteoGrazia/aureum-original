import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Droplets, Scale } from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function QuickLogFAB({ onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [waterAmount, setWaterAmount] = useState('0.25');
  const [loading, setLoading] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({});
      return profiles[0] || null;
    }
  });

  const waterUnit = profile?.water_unit || 'liters';

  const logWater = async () => {
    setLoading(true);
    try {
      const amount = waterUnit === 'glasses' ? 0.25 : parseFloat(waterAmount);
      const activities = await base44.entities.DailyActivity.filter({ date: today });
      if (activities.length > 0) {
        await base44.entities.DailyActivity.update(activities[0].id, {
          water_liters: (activities[0].water_liters || 0) + amount
        });
      } else {
        await base44.entities.DailyActivity.create({
          date: today,
          water_liters: amount,
          steps: 0,
          active_minutes: 0,
          sedentary_minutes: 0,
          calories_burned: 0
        });
      }
      onUpdate?.();
      setWaterAmount('0.25');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const logWeight = async () => {
    if (!weight) return;
    setLoading(true);
    try {
      await base44.entities.WeightHistory.create({
        date: today,
        weight: parseFloat(weight)
      });
      onUpdate?.();
      setWeight('');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Gold Sidebar Toggle Button */}
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-10 h-24 rounded-l-2xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%)',
          boxShadow: '0 8px 32px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)',
          border: '0.5px solid rgba(212, 175, 55, 0.4)',
          borderRight: 'none'
        }}
        initial={{ x: 40 }}
        animate={{ x: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <Plus className="w-5 h-5 text-[#080808]" strokeWidth={2.5} />
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sliding Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-72 z-50 p-6 flex flex-col"
            style={{
              background: 'linear-gradient(135deg, rgba(160,160,160,0.08) 0%, rgba(255,255,255,0.04) 50%, rgba(180,180,180,0.06) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
              borderLeft: '0.5px solid rgba(212,175,55,0.3)'
            }}
          >
            <div className="flex-1 flex flex-col gap-6 pt-8">
              <div className="mb-4">
                <h2 
                  className="text-lg text-[#D4AF37] tracking-[0.3em] uppercase"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                >
                  Quick Log
                </h2>
                <p 
                  className="text-[9px] text-white/40 uppercase tracking-wider mt-1"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                >
                  Track your progress
                </p>
              </div>

              {/* Water Log */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm">Water</p>
                    <p className="text-white/40 text-xs">
                      {waterUnit === 'glasses' ? 'Log one glass (250ml)' : 'Add liters'}
                    </p>
                  </div>
                </div>
                {waterUnit === 'liters' && (
                  <div className="flex gap-2">
                    {['0.25', '0.5', '0.75', '1'].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setWaterAmount(amount)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${
                          waterAmount === amount
                            ? 'bg-blue-500/20 border border-blue-400/40 text-blue-400'
                            : 'bg-white/5 border border-white/10 text-white/60'
                        }`}
                      >
                        {amount}L
                      </button>
                    ))}
                  </div>
                )}
                <GoldButton 
                  onClick={logWater} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Logging...' : waterUnit === 'glasses' ? '+ 1 Glass' : `+ ${waterAmount}L`}
                </GoldButton>
              </div>

              {/* Weight Log */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-white text-sm">Weight</p>
                    <p className="text-white/40 text-xs">Track progress</p>
                  </div>
                </div>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Enter weight (kg)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
                <GoldButton 
                  onClick={logWeight} 
                  disabled={loading || !weight}
                  className="w-full"
                >
                  {loading ? 'Logging...' : 'Save Weight'}
                </GoldButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}