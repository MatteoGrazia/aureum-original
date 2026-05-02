import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/components/shared/ThemeContext';

export default function RecentMeals({ onSelectFood, selectedDate }) {
  const [expanded, setExpanded] = useState(false);
  const { isDarkMode } = useTheme();

  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(29,29,31,0.45)';
  const cardBg = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)';
  const borderColor = isDarkMode ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.28)';
  const GOLD = '#D4AF37';

  const { data: recentFoods = [] } = useQuery({
    queryKey: ['recentFoods', selectedDate],
    staleTime: 60_000,
    queryFn: async () => {
      const logs = await base44.entities.FoodLog.filter({});
      const foodMap = new Map();
      logs
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(log => {
          const key = `${log.food_name}|${log.brand || ''}`;
          if (!foodMap.has(key)) {
            const servingSize = log.serving_size || 1;
            foodMap.set(key, {
              name: log.food_name,
              brand: log.brand,
              source: 'diary',
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
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: GOLD }} strokeWidth={1.5} />
          <p className="text-xs uppercase tracking-widest" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
            Recently Logged
          </p>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.1)', color: GOLD, fontFamily: 'Montserrat, sans-serif' }}>
            {recentFoods.length}
          </span>
        </div>
        <ChevronDown
          className="w-4 h-4 transition-transform duration-300"
          style={{ color: textMuted, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          strokeWidth={1.5}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              {recentFoods.map((food, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => onSelectFood(food)}
                  className="w-full flex items-center gap-3 p-4 text-left rounded-2xl active:scale-[0.98] transition-transform"
                  style={{ background: cardBg, border: `0.5px solid ${borderColor}` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: isDarkMode ? '#FFFFFF' : '#1D1D1F', fontFamily: 'Montserrat, sans-serif' }}>
                      {food.name}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: GOLD, fontFamily: 'Montserrat, sans-serif' }}>
                      {Math.round(food.calories)} kcal · P{Math.round(food.protein || 0)}g C{Math.round(food.carbs || 0)}g F{Math.round(food.fat || 0)}g
                    </p>
                    {food.brand && (
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
                        {food.brand}
                      </p>
                    )}
                  </div>

                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)', border: `0.5px solid ${borderColor}` }}>
                    <Plus className="w-3.5 h-3.5" style={{ color: GOLD }} strokeWidth={1.5} />
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