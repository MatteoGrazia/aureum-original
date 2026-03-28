import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/components/shared/ThemeContext';

export default function SavedMealsSection({ onLogMeal, selectedMeal }) {
  const { isDarkMode } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const queryClient = useQueryClient();

  const { data: savedMeals = [] } = useQuery({
    queryKey: ['savedMeals'],
    queryFn: async () => {
      const all = await base44.entities.SavedMeal.list('-created_date', 50);
      // Deduplicate by meal_name — keep only the most recent per name
      const seen = new Set();
      return all.filter(m => {
        const key = m.meal_name?.toLowerCase().trim() || m.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
  });

  const textPrimary = isDarkMode ? '#FFFFFF' : '#1D1D1F';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(29,29,31,0.45)';
  const cardBg = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)';
  const borderColor = isDarkMode ? 'rgba(255,218,185,0.12)' : 'rgba(255,218,185,0.28)';
  const PEACH = '#FFDAB9';

  const handleLogSavedMeal = (meal) => {
    onLogMeal(meal.foods);
  };

  const handleDelete = async (e, mealId) => {
    e.stopPropagation();
    await base44.entities.SavedMeal.delete(mealId);
    queryClient.invalidateQueries(['savedMeals']);
  };

  if (savedMeals.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" style={{ color: PEACH }} strokeWidth={1.5} />
          <p className="text-xs uppercase tracking-widest" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
            My Saved Meals
          </p>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,218,185,0.1)', color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>
            {savedMeals.length}
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
              {savedMeals.map((meal, idx) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: cardBg, border: `0.5px solid ${borderColor}` }}
                >
                  <button
                    onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    {/* Image or placeholder */}
                    <div
                      className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden"
                      style={{ background: 'rgba(255,218,185,0.08)', border: `0.5px solid ${borderColor}` }}
                    >
                      {meal.image_url ? (
                        <img src={meal.image_url} alt={meal.meal_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6" style={{ color: PEACH, opacity: 0.4 }} strokeWidth={1.2} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: textPrimary, fontFamily: 'Montserrat, sans-serif' }}>{meal.meal_name}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>
                        {meal.total_calories} kcal · P{meal.total_protein}g C{meal.total_carbs}g F{meal.total_fat}g
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
                        {meal.foods?.length || 0} items
                      </p>
                    </div>

                    <ChevronRight
                      className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                      style={{ color: textMuted, transform: expandedMeal === meal.id ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      strokeWidth={1.5}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedMeal === meal.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4" style={{ borderTop: `0.5px solid ${borderColor}` }}>
                          {/* Food items list */}
                          <div className="pt-3 space-y-1.5 mb-4">
                            {(meal.foods || []).map((food, fi) => (
                              <div key={fi} className="flex items-center justify-between">
                                <p className="text-xs truncate flex-1" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>{food.name}</p>
                                <p className="text-[10px] ml-3 flex-shrink-0" style={{ color: PEACH, fontFamily: 'Montserrat, sans-serif' }}>{food.calories} kcal</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleLogSavedMeal(meal)}
                              className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs uppercase tracking-[0.1em]"
                              style={{ background: 'rgba(255,218,185,0.12)', border: `0.5px solid ${borderColor}`, color: PEACH, fontFamily: 'Montserrat, sans-serif' }}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Log to {selectedMeal}
                            </button>
                            <button
                              onClick={e => handleDelete(e, meal.id)}
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(255,60,60,0.07)' }}
                            >
                              <X className="w-4 h-4 text-red-400" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}