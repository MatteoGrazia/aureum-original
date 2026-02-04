import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Droplets, Scale, X } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function QuickLogFAB({ onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const logWater = async () => {
    setLoading(true);
    try {
      const activities = await base44.entities.DailyActivity.filter({ date: today });
      if (activities.length > 0) {
        await base44.entities.DailyActivity.update(activities[0].id, {
          water_glasses: (activities[0].water_glasses || 0) + 1
        });
      } else {
        await base44.entities.DailyActivity.create({
          date: today,
          water_glasses: 1,
          steps: 0,
          active_minutes: 0,
          sedentary_minutes: 0,
          calories_burned: 0
        });
      }
      onUpdate?.();
      setShowWaterModal(false);
      setIsOpen(false);
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
      setShowWeightModal(false);
      setIsOpen(false);
      setWeight('');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <>
      {/* FAB Button */}
      <motion.div
        className="fixed right-6 bottom-28 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-16 right-0 flex flex-col gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWaterModal(true)}
                className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center"
              >
                <Droplets className="w-5 h-5 text-blue-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWeightModal(true)}
                className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center"
              >
                <Scale className="w-5 h-5 text-[#D4AF37]" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8960C] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)]"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="w-6 h-6 text-[#080808]" /> : <Plus className="w-6 h-6 text-[#080808]" />}
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Water Modal */}
      <AnimatePresence>
        {showWaterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            onClick={() => setShowWaterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="p-6 w-72 text-center">
                <Droplets className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl text-white mb-2">Log Water</h3>
                <p className="text-white/50 text-sm mb-6">Add one glass of water</p>
                <GoldButton onClick={logWater} disabled={loading} className="w-full">
                  {loading ? 'Logging...' : '+ 1 Glass'}
                </GoldButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weight Modal */}
      <AnimatePresence>
        {showWeightModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            onClick={() => setShowWeightModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="p-6 w-72">
                <Scale className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl text-white mb-2 text-center">Log Weight</h3>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Enter weight (kg)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 text-white text-center text-lg mb-4 focus:outline-none focus:border-[#D4AF37]"
                />
                <GoldButton onClick={logWeight} disabled={loading || !weight} className="w-full">
                  {loading ? 'Logging...' : 'Save Weight'}
                </GoldButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}