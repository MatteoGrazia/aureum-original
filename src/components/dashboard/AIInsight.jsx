import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
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
    <GlassCard className="p-5" glow>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs uppercase tracking-widest text-[#D4AF37]">Today's Insight</h3>
            <button
              onClick={generateInsight}
              disabled={loading}
              className="text-white/30 hover:text-[#D4AF37] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <motion.p
            key={insight}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/70 text-sm leading-relaxed"
          >
            {loading ? 'Analyzing your day...' : insight}
          </motion.p>
        </div>
      </div>
    </GlassCard>
  );
}