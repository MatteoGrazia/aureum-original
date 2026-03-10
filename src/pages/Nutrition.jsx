import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Scan, ChevronLeft, ChevronRight, Trash2, Coffee, Sun, Moon, Cookie, Loader2 } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';
import VoidBackground from '@/components/dashboard/VoidBackground';
import GoldButton from '@/components/ui/GoldButton';
import FoodSearch from '@/components/nutrition/FoodSearch';
import BarcodeScanner from '@/components/nutrition/BarcodeScanner';
import MacroHeatmap from '@/components/nutrition/MacroHeatmap';
import WaterTracker from '@/components/nutrition/WaterTracker';
import RecentMeals from '@/components/nutrition/RecentMeals';
import CopyFromYesterdayButton from '@/components/nutrition/CopyFromYesterdayButton';

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
  const [amount, setAmount] = useState(100);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const queryClient = useQueryClient();

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data: foodLogs = [], refetch } = useQuery({
    queryKey: ['foodLogs', dateStr],
    queryFn: () => base44.entities.FoodLog.filter({ date: dateStr }),
    staleTime: 30_000,
  });

  const { data: dailyActivity, refetch: refetchActivity } = useQuery({
    queryKey: ['dailyActivity', dateStr],
    queryFn: async () => {
      const activities = await base44.entities.DailyActivity.filter({ date: dateStr });
      return activities[0] || null;
    },
    staleTime: 30_000,
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({});
      return profiles[0] || null;
    },
    staleTime: 5 * 60_000,
  });

  const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalProtein = foodLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const totalCarbs = foodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const totalFat = foodLogs.reduce((sum, log) => sum + (log.fat || 0), 0);

  const handleSelectFood = async (food) => {
    // If food already has availableUnits (e.g. from USDA search), use directly
    if (food.availableUnits && food.availableUnits.length > 0) {
      const defaultUnit = food.availableUnits.find(u => u.isDefault) || food.availableUnits[0];
      setSelectedFood(food);
      setSelectedUnit(defaultUnit);
      setAmount(1);
      return;
    }

    setLoadingDetails(true);

    // Try to fetch detailed FatSecret data if food has a FatSecret ID
    if (food.id && food.source === 'fatsecret') {
      try {
        const response = await base44.functions.invoke('fatsecretSearch', {
          action: 'get',
          foodId: food.id
        });
        const detailedFood = response.data.food;
        if (detailedFood?.availableUnits?.length > 0) {
          const defaultUnit = detailedFood.availableUnits.find(u => u.isDefault) || detailedFood.availableUnits[0];
          setSelectedFood(detailedFood);
          setSelectedUnit(defaultUnit);
          setAmount(1);
          setLoadingDetails(false);
          return;
        }
      } catch (error) {
        console.error('FatSecret fetch failed:', error);
      }
    }

    // Fallback: 100g serving
    const fallbackUnit = {
      servingDescription: '100g',
      unit: 'g',
      amount: 100,
      metricUnit: 'g',
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
      isDefault: true
    };
    setSelectedFood({ ...food, availableUnits: [fallbackUnit] });
    setSelectedUnit(fallbackUnit);
    setAmount(1);
    setLoadingDetails(false);
  };

  const handleLogFood = async () => {
    if (!selectedFood || !selectedUnit) return;
    
    const macros = calculateLiveMacros();
    
    await base44.entities.FoodLog.create({
      date: dateStr,
      meal_type: selectedMeal,
      food_name: selectedFood.name,
      brand: selectedFood.brand || '',
      serving_size: amount,
      serving_unit: getSmartLabel(selectedUnit.servingDescription || selectedUnit.unit),
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber: Math.round((selectedUnit.fiber || 0) * amount),
      barcode: selectedFood.barcode
    });

    setSelectedFood(null);
    setAmount(1);
    setSelectedUnit(null);
    refetch();
  };

  // Live calculation of displayed macros
  // Formula: Total Macros = Quantity × Macros Per Selected Serving
  const calculateLiveMacros = () => {
    if (!selectedUnit || !amount) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return {
      calories: Math.round(selectedUnit.calories * amount),
      protein: Math.round(selectedUnit.protein * amount),
      carbs: Math.round(selectedUnit.carbs * amount),
      fat: Math.round(selectedUnit.fat * amount)
    };
  };

  // Smart label: Strip "1 " from serving descriptions
  const getSmartLabel = (servingDesc) => {
    if (!servingDesc) return 'Serving';
    const cleaned = servingDesc.replace(/^1\s+/i, '');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  // Convert units based on user preference
  const convertToPreferredUnit = (value, fromUnit, userPreference) => {
    if (userPreference === 'imperial' && fromUnit === 'g') {
      return { value: (value / 28.35).toFixed(1), unit: 'oz' };
    }
    if (userPreference === 'metric' && fromUnit === 'oz') {
      return { value: (value * 28.35).toFixed(0), unit: 'g' };
    }
    return { value, unit: fromUnit };
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
    <div className="min-h-screen relative bg-[#080808] overflow-x-hidden">
      <VoidBackground />
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={(food) => {
          setShowScanner(false);
          handleSelectFood(food);
        }}
      />

      <div className="relative z-10 p-6" style={{ paddingBottom: 'calc(120px + env(safe-area-inset-bottom))' }}>
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

      {/* Recent Meals */}
      <RecentMeals onSelectFood={handleSelectFood} selectedDate={selectedDate} />

      {/* Search & Scan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 space-y-3"
      >
        <div className="flex gap-3 items-stretch">
          <div className="flex-1 min-w-0">
            <FoodSearch onSelectFood={handleSelectFood} />
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="w-14 flex-shrink-0 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center hover:bg-[#D4AF37]/30 transition-colors"
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
            className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end"
            onClick={() => setSelectedFood(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full"
              style={{ 
                maxHeight: '90vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <VoidCard className="p-5 rounded-b-none" style={{ overflow: 'visible', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, margin: 0, width: '100%' }}>
                {loadingDetails ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mb-3" />
                    <p className="text-white/40 text-sm">Loading detailed nutrition...</p>
                  </div>
                ) : (
                  <>
                <h3 
                  className="text-xl text-white mb-1"
                  style={{ 
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {selectedFood.name}
                </h3>
                {selectedFood.brand && (
                  <p 
                    className="text-white/40 text-sm mb-4"
                    style={{ 
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {selectedFood.brand}
                  </p>
                )}

                {/* Meal Selection */}
                <div className="grid grid-cols-4 gap-1.5 mb-4">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => {
                    const Icon = mealIcons[meal];
                    return (
                      <button
                        key={meal}
                        onClick={() => setSelectedMeal(meal)}
                        className="py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                        style={{
                          background: selectedMeal === meal ? 'rgba(255,191,0,0.20)' : 'rgba(255,255,255,0.05)',
                          border: selectedMeal === meal ? '1px solid rgba(255,191,0,0.45)' : '1px solid transparent'
                        }}
                      >
                        <Icon className={`w-4 h-4 ${selectedMeal === meal ? 'text-[#D4AF37]' : 'text-white/40'}`} />
                        <span className={`text-[10px] capitalize truncate w-full text-center ${selectedMeal === meal ? 'text-[#D4AF37]' : 'text-white/40'}`}>
                          {meal}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quantity & Serving Size Selection */}
                <div className="space-y-3 mb-4" style={{ position: 'relative', zIndex: 10 }}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-white/40 text-xs mb-1 block">Quantity</label>
                      <input
                        type="number"
                        step="0.1"
                        value={amount}
                        onChange={(e) => setAmount(Math.max(0.1, parseFloat(e.target.value) || 1))}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 text-white text-center"
                        style={{ fontFamily: 'Montserrat, sans-serif', minHeight: '48px' }}
                      />
                    </div>
                    <div className="flex-1" style={{ position: 'relative' }}>
                      <label className="text-white/40 text-xs mb-1 block">Serving Size</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={selectedUnit ? JSON.stringify(selectedUnit) : ''}
                          onChange={(e) => setSelectedUnit(JSON.parse(e.target.value))}
                          className="w-full px-3 py-3 rounded-xl border border-[#D4AF37]/30 cursor-pointer"
                          style={{ 
                            fontFamily: 'Montserrat, sans-serif',
                            backdropFilter: 'blur(30px)',
                            background: '#050505',
                            color: '#D4AF37',
                            minHeight: '48px',
                            position: 'relative',
                            zIndex: 10000,
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23D4AF37' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                            paddingRight: '36px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {selectedFood?.availableUnits?.map((unit, idx) => (
                            <option 
                              key={idx} 
                              value={JSON.stringify(unit)}
                              style={{ 
                                background: '#050505', 
                                color: '#D4AF37',
                                padding: '8px'
                              }}
                            >
                              {getSmartLabel(unit.servingDescription)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {profile?.measurement_system === 'imperial' && selectedUnit?.metricUnit === 'g' && (
                    <p className="text-white/30 text-xs text-center">
                      ≈ {(amount / 28.35).toFixed(1)} oz
                    </p>
                  )}
                </div>

                {/* Nutrition Info - Live Calculation */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  <div className="text-center p-3 rounded-xl bg-white/5 flex-1 min-w-[70px]">
                    <p className="text-lg text-[#D4AF37]">{calculateLiveMacros().calories}</p>
                    <p className="text-[10px] text-white/40 uppercase" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>kcal</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5 flex-1 min-w-[70px]">
                    <p className="text-lg text-white">{calculateLiveMacros().protein}g</p>
                    <p className="text-[10px] text-white/40 uppercase" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>protein</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5 flex-1 min-w-[70px]">
                    <p className="text-lg text-white">{calculateLiveMacros().carbs}g</p>
                    <p className="text-[10px] text-white/40 uppercase" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>carbs</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5 flex-1 min-w-[70px]">
                    <p className="text-lg text-white">{calculateLiveMacros().fat}g</p>
                    <p className="text-[10px] text-white/40 uppercase" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>fat</p>
                  </div>
                </div>

                <div className="mt-4">
                  <GoldButton 
                    onClick={handleLogFood} 
                    className="w-full" 
                    style={{ minHeight: '52px', marginBottom: '20px' }}
                    disabled={!selectedUnit}
                  >
                    Add to Diary
                  </GoldButton>
                </div>
                </>
                )}
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
                <div className="flex items-center gap-2">
                  <span className="text-[#D4AF37] text-sm" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{mealCalories} kcal</span>
                  <CopyFromYesterdayButton 
                    mealType={type} 
                    selectedDate={selectedDate}
                    onCopied={refetch}
                  />
                </div>
              </div>

              {logs.length > 0 ? (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/5"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{log.food_name}</p>
                        <p className="text-white/40 text-xs truncate">
                          {log.serving_size}{log.serving_unit} • {log.calories} kcal
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="w-8 h-8 flex-shrink-0 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm text-center py-4">No items logged yet</p>
              )}
            </VoidCard>
          );
        })}
        </motion.div>
      </div>
    </div>
  );
}