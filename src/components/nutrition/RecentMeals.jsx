import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function RecentMeals({ onSelectFood, selectedDate }) {
  const { data: recentFoods = [] } = useQuery({
    queryKey: ['recentFoods', selectedDate],
    queryFn: async () => {
      const logs = await base44.entities.FoodLog.filter({});
      
      // Group by food name and get most recent unique foods
      const foodMap = new Map();
      logs
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(log => {
          const key = `${log.food_name}|${log.brand || ''}`;
          if (!foodMap.has(key)) {
            foodMap.set(key, {
              name: log.food_name,
              brand: log.brand,
              calories: log.calories,
              protein: log.protein,
              carbs: log.carbs,
              fat: log.fat,
              fiber: log.fiber,
              serving_size: log.serving_size,
              serving_unit: log.serving_unit,
              date: log.date
            });
          }
        });

      return Array.from(foodMap.values()).slice(0, 8);
    }
  });

  if (recentFoods.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-[#D4AF37]" />
        <p 
          className="text-xs uppercase tracking-widest text-white/60"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
        >
          Recently Logged
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {recentFoods.map((food, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectFood(food)}
            className="relative group"
          >
            <div
              className="p-2.5 rounded-lg text-center cursor-pointer transition-all hover:border-[#D4AF37]/50"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(30px) saturate(180%)',
                border: '0.5px solid rgba(212, 175, 55, 0.15)'
              }}
            >
              <p 
                className="text-[10px] text-white truncate mb-1.5 group-hover:text-[#D4AF37] transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
              >
                {food.name}
              </p>
              <p className="text-[9px] text-[#D4AF37]">{Math.round(food.calories)} kcal</p>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-3 h-3 text-[#D4AF37]" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}