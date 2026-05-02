import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function RecentMeals({ onSelectFood, selectedDate }) {
  const [expanded, setExpanded] = useState(false);

  const { data: recentFoods = [] } = useQuery({
    queryKey: ['recentFoods', selectedDate],
    queryFn: async () => {
      const logs = await base44.entities.FoodLog.filter({});

      // Group by food name+brand and get most recent unique foods
      const foodMap = new Map();
      logs
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(log => {
          const key = `${log.food_name}|${log.brand || ''}`;
          if (!foodMap.has(key)) {
            // Store the exact logged macros and build a proper availableUnits entry
            const servingSize = log.serving_size || 1;
            foodMap.set(key, {
              name: log.food_name,
              brand: log.brand,
              source: 'diary',
              // top-level macros are the total for the logged serving
              calories: log.calories,
              protein: log.protein,
              carbs: log.carbs,
              fat: log.fat,
              fiber: log.fiber,
              availableUnits: [{
                servingDescription: log.serving_unit || 'serving',
                unit: log.serving_unit || 'serving',
                amount: servingSize,
                metricUnit: 'g',
                // per-unit macros so the modal multiplies correctly
                calories: (log.calories || 0) / servingSize,
                protein: (log.protein || 0) / servingSize,
                carbs: (log.carbs || 0) / servingSize,
                fat: (log.fat || 0) / servingSize,
                fiber: (log.fiber || 0) / servingSize,
                isDefault: true,
              }],
            });
          }
        });

      return Array.from(foodMap.values()).slice(0, 12);
    }
  });

  if (recentFoods.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid rgba(212,175,55,0.2)',
      }}
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
          <span
            className="text-[10px] uppercase tracking-[0.25em]"
            style={{ color: 'rgba(229,229,231,0.65)', fontFamily: 'Montserrat, sans-serif' }}
          >
            Recently Logged
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(212,175,55,0.12)', color: 'rgba(212,175,55,0.7)', fontFamily: 'Montserrat, sans-serif' }}
          >
            {recentFoods.length}
          </span>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-[#D4AF37]/50" />
          : <ChevronDown className="w-4 h-4 text-[#D4AF37]/50" />}
      </button>

      {/* Expandable grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="grid grid-cols-3 gap-2 px-3 pb-3"
            >
              {recentFoods.map((food, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => onSelectFood(food)}
                  className="relative group text-left rounded-xl p-2.5 transition-all active:scale-95"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '0.5px solid rgba(212,175,55,0.15)',
                  }}
                >
                  <p
                    className="text-[10px] leading-snug mb-1"
                    style={{
                      color: '#E5E5E7',
                      fontFamily: 'Montserrat, sans-serif',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {food.name}
                  </p>
                  <p className="text-[9px]" style={{ color: '#D4AF37' }}>
                    {Math.round(food.calories)} kcal
                  </p>
                  <p className="text-[8px] mt-0.5" style={{ color: 'rgba(229,229,231,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
                    P:{Math.round(food.protein || 0)}g · C:{Math.round(food.carbs || 0)}g · F:{Math.round(food.fat || 0)}g
                  </p>
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(212,175,55,0.2)' }}>
                    <Plus className="w-2.5 h-2.5 text-[#D4AF37]" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}