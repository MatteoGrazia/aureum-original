import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Scan, ChevronLeft, ChevronRight, Trash2, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';
import VoidBackground from '@/components/dashboard/VoidBackground';
import GoldButton from '@/components/ui/GoldButton';
import FoodSearch from '@/components/nutrition/FoodSearch';
import BarcodeScanner from '@/components/nutrition/BarcodeScanner';
import MacroHeatmap from '@/components/nutrition/MacroHeatmap';
import WaterTracker from '@/components/nutrition/WaterTracker';

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie
};

export default function Nutrition() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showScanner, setShowScanner] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState('lunch');
  const [servings, setServings] = useState(1);
  const queryClient = useQueryClient();

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data: foodLogs = [], refetch } = useQuery({
    queryKey: ['foodLogs', dateStr],
    queryFn: () => base44.entities.FoodLog.filter({ date: dateStr })
  });

  const { data: dailyActivity, refetch: refetchActivity } = useQuery({
    queryKey: ['dailyActivity', dateStr],
    queryFn: async () => {
      const activities = await base44.entities.DailyActivity.filter({ date: dateStr });
      return activities[0] || null;
    }
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({});
      return profiles[0] || null;
    }
  });

  const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalProtein = foodLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const totalCarbs = foodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const totalFat = foodLogs.reduce((sum, log) => sum + (log.fat || 0), 0);

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setServings(1);
  };

  const handleLogFood = async () => {
    if (!selectedFood) return;
    
    const multiplier = servings;
    await base44.entities.FoodLog.create({
      date: dateStr,
      meal_type: selectedMeal,
      food_name: selectedFood.name,
      brand: selectedFood.brand,
      serving_size: selectedFood.serving_size * multiplier,
      serving_unit: selectedFood.serving_unit,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier),
      carbs: Math.round(selectedFood.carbs * multiplier),
      fat: Math.round(selectedFood.fat * multiplier),
      fiber: Math.round((selectedFood.fiber || 0) * multiplier),
      barcode: selectedFood.barcode
    });

    setSelectedFood(null);
    setServings(1);
    refetch();
  };

  const handleDeleteLog = async (logId) => {
    await base44.entities.FoodLog.delete(logId);
    refetch();
  };

  const handleWaterAdd = async () => {
    try {
      const waterUnit = profile?.water_unit || 'liters';
      const amount = waterUnit === 'glasses' ? 0.25 : 0.25;
      
      if (dailyActivity) {
        await base44.entities.DailyActivity.update(dailyActivity.id, {
          water_liters: (dailyActivity.water_liters || 0) + amount
        });
      } else {
        await base44.entities.DailyActivity.create({
          date: dateStr,
          water_liters: amount,
          steps: 0,
          active_minutes: 0,
          sedentary_minutes: 0,
          calories_burned: 0
        });
      }
      await refetchActivity();
    } catch (error) {
      console.error('Water add error:', error);
    }
  };

  const handleWaterRemove = async () => {
    if (!dailyActivity || (dailyActivity.water_liters || 0) <= 0) return;
    try {
      const waterUnit = profile?.water_unit || 'liters';
      const amount = waterUnit === 'glasses' ? 0.25 : 0.25;
      
      await base44.entities.DailyActivity.update(dailyActivity.id, {
        water_liters: Math.max(0, (dailyActivity.water_liters || 0) - amount)
      });
      await refetchActivity();
    } catch (error) {
      console.error('Water remove error:', error);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const mealGroups = ['breakfast', 'lunch', 'dinner', 'snack'].map(meal => ({
    type: meal,
    logs: foodLogs.filter(log => log.meal_type === meal)
  }));

  return (
    <div className="min-h-screen relative bg-[#080808]">
      <VoidBackground />
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={(food) => {
          setShowScanner(false);
          handleSelectFood(food);
        }}
      />

      <div className="relative z-10 p-6">
        {/* Header with Date Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 pt-6"
        >
          <h1 
            className="text-3xl tracking-[0.4em] mb-4 text-center"
            style={{ 
              fontFamily: 'Montserrat, sans-serif', 
              fontWeight: 400,
              background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 50%, #F4D03F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            NUTRITION
          </h1>

          <VoidCard className="p-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white/50" />
            </button>
            <div className="text-center">
              <p className="text-white">{format(selectedDate, 'EEEE')}</p>
              <p className="text-white/40 text-sm">{format(selectedDate, 'MMMM d, yyyy')}</p>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white/50" />
            </button>
          </div>
        </VoidCard>
        </motion.div>

        {/* Calorie Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <VoidCard className="text-center">
            <p className="text-5xl text-[#D4AF37]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{totalCalories}</p>
            <p 
              className="text-white/40 text-xs uppercase tracking-widest mt-2"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
            >
              of {profile?.maintenance_calories || 2000} kcal consumed
            </p>
          </VoidCard>
        </motion.div>

      {/* Search & Scan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 space-y-3"
      >
        <div className="flex gap-3">
          <div className="flex-1">
            <FoodSearch onSelectFood={handleSelectFood} />
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="w-14 h-14 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center hover:bg-[#D4AF37]/30 transition-colors"
          >
            <Scan className="w-6 h-6 text-[#D4AF37]" />
          </button>
        </div>
      </motion.div>

      {/* Selected Food Modal */}
      <AnimatePresence>
        {selectedFood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center p-4"
            onClick={() => setSelectedFood(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <VoidCard className="p-6">
                <h3 className="text-xl text-white mb-1">{selectedFood.name}</h3>
                {selectedFood.brand && (
                  <p className="text-white/40 text-sm mb-4">{selectedFood.brand}</p>
                )}

                {/* Meal Selection */}
                <div className="flex gap-2 mb-4">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => {
                    const Icon = mealIcons[meal];
                    return (
                      <button
                        key={meal}
                        onClick={() => setSelectedMeal(meal)}
                        className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                          selectedMeal === meal
                            ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50'
                            : 'bg-white/5 border border-transparent'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${selectedMeal === meal ? 'text-[#D4AF37]' : 'text-white/40'}`} />
                        <span className={`text-xs capitalize ${selectedMeal === meal ? 'text-[#D4AF37]' : 'text-white/40'}`}>
                          {meal}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Serving Size */}
                <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-white/5">
                  <span className="text-white/60">Servings</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-white w-12 text-center">{servings}</span>
                    <button
                      onClick={() => setServings(servings + 0.5)}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Nutrition Info */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <p className="text-lg text-[#D4AF37]">{Math.round(selectedFood.calories * servings)}</p>
                    <p className="text-[10px] text-white/40 uppercase">kcal</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <p className="text-lg text-white">{Math.round(selectedFood.protein * servings)}</p>
                    <p className="text-[10px] text-white/40 uppercase">protein</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <p className="text-lg text-white">{Math.round(selectedFood.carbs * servings)}</p>
                    <p className="text-[10px] text-white/40 uppercase">carbs</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <p className="text-lg text-white">{Math.round(selectedFood.fat * servings)}</p>
                    <p className="text-[10px] text-white/40 uppercase">fat</p>
                  </div>
                </div>

                <GoldButton onClick={handleLogFood} className="w-full" style={{ marginBottom: '20px' }}>
                  Log Food
                </GoldButton>
              </VoidCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Macro Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <MacroHeatmap
          protein={totalProtein}
          carbs={totalCarbs}
          fat={totalFat}
          goals={{ protein: 150, carbs: 250, fat: 70 }}
        />
      </motion.div>

      {/* Water Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <WaterTracker
          glasses={Math.round((dailyActivity?.water_liters || 0) / 0.25)}
          goal={Math.round((profile?.water_goal || 2.5) / 0.25)}
          onAdd={handleWaterAdd}
          onRemove={handleWaterRemove}
        />
      </motion.div>

      {/* Food Logs by Meal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        {mealGroups.map(({ type, logs }) => {
          if (logs.length === 0) return null;
          const Icon = mealIcons[type];
          const mealCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
          const iconColors = { breakfast: '#F4A261', lunch: '#8ECAE6', dinner: '#E8C5A5', snack: '#C9ADA7' };

          return (
            <VoidCard key={type}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: iconColors[type] }} strokeWidth={1.5} />
                  <span className="text-white capitalize" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{type}</span>
                </div>
                <span className="text-[#D4AF37] text-sm" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{mealCalories} kcal</span>
              </div>

              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                  >
                    <div>
                      <p className="text-white text-sm">{log.food_name}</p>
                      <p className="text-white/40 text-xs">
                        {log.serving_size}{log.serving_unit} • {log.calories} kcal
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </VoidCard>
          );
        })}
        </motion.div>
      </div>
    </div>
  );
}