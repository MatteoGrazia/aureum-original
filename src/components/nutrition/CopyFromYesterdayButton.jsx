import React, { useState } from 'react';
import { Copy, Loader2 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { base44 } from '@/api/base44Client';

export default function CopyFromYesterdayButton({ mealType, selectedDate, onCopied }) {
  const [loading, setLoading] = useState(false);

  const handleCopyFromYesterday = async () => {
    setLoading(true);
    try {
      const yesterday = subDays(selectedDate, 1);
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
      const todayStr = format(selectedDate, 'yyyy-MM-dd');

      // Get yesterday's logs for this meal type
      const yesterdayLogs = await base44.entities.FoodLog.filter({
        date: yesterdayStr,
        meal_type: mealType
      });

      if (yesterdayLogs.length === 0) {
        alert(`No ${mealType} logged yesterday`);
        setLoading(false);
        return;
      }

      // Copy all items
      for (const log of yesterdayLogs) {
        await base44.entities.FoodLog.create({
          date: todayStr,
          meal_type: mealType,
          food_name: log.food_name,
          brand: log.brand,
          serving_size: log.serving_size,
          serving_unit: log.serving_unit,
          calories: log.calories,
          protein: log.protein,
          carbs: log.carbs,
          fat: log.fat,
          fiber: log.fiber,
          barcode: log.barcode
        });
      }

      onCopied();
    } catch (error) {
      console.error('Copy error:', error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleCopyFromYesterday}
      disabled={loading}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/60 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all disabled:opacity-50"
      title="Copy yesterday's meals"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      <span className="hidden sm:inline">Copy</span>
    </button>
  );
}