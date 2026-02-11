import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIInsight({ stats }) {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a luxury fitness concierge. Based on these stats, give ONE brief, motivating insight (max 2 sentences). Be elegant and encouraging.
        
Stats:
- Calories consumed: ${stats.caloriesConsumed || 0} / ${stats.caloriesGoal || 2000}
- Steps: ${stats.steps || 0} / ${stats.stepsGoal || 10000}
- Water: ${stats.waterGlasses || 0} / 8 glasses
- Workout today: ${stats.workedOut ? 'Yes' : 'No'}

Keep it sophisticated and brief.`,
      });
      setInsight(response);
    } catch (error) {
      setInsight("Every step forward is progress. Your dedication today shapes tomorrow's results.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (stats && !insight) {
      generateInsight();
    }
  }, [stats]);

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <h3 
          className="text-[10px] uppercase tracking-[0.4em] text-[#9C7E46]"
          style={{ fontFamily: 'Cinzel, serif', fontWeight: 300 }}
        >
          Daily Insight
        </h3>
        <button
          onClick={generateInsight}
          disabled={loading}
          className="text-white/30 hover:text-[#D4AF37] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" strokeWidth={1} />
        </button>
      </div>
      
      <motion.p
        key={insight}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white/50 text-xs leading-relaxed"
        style={{ fontWeight: 200 }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-[1px] h-3 bg-[#D4AF37] animate-pulse" />
            <span className="w-[1px] h-3 bg-[#D4AF37] animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-[1px] h-3 bg-[#D4AF37] animate-pulse" style={{ animationDelay: '0.4s' }} />
          </span>
        ) : insight}
      </motion.p>
    </div>
  );
}