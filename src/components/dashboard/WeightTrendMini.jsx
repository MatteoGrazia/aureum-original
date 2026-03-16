import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useTheme } from '@/components/shared/ThemeContext';

export default function WeightTrendMini({ weightHistory }) {
  const { isDarkMode } = useTheme();

  // Sort ascending by date, take last 90 entries
  const last90Days = [...weightHistory]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-90);

  if (last90Days.length < 2) {
    return (
      <div className="text-center py-8">
        <p className="text-white/40 text-sm">Not enough data yet</p>
        <p className="text-white/20 text-xs mt-1">Log more weights to see your trend</p>
      </div>
    );
  }

  const data = last90Days.map(entry => ({ weight: entry.weight }));
  const minWeight = Math.min(...data.map(d => d.weight));
  const maxWeight = Math.max(...data.map(d => d.weight));
  const range = maxWeight - minWeight || 1;
  const yMin = minWeight - range * 0.15;
  const yMax = maxWeight + range * 0.15;

  const textColor = isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(29,29,31,0.5)';

  return (
    <div className="relative">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="h-24"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="goldLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#D4AF37" stopOpacity="1" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.3" />
              </linearGradient>
              <filter id="goldGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <YAxis domain={[yMin, yMax]} hide />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="url(#goldLineGradient)"
              strokeWidth={1.5}
              dot={false}
              filter="url(#goldGlow)"
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Stats overlay */}
      <div className="flex justify-between mt-2 text-xs">
        <div>
          <p style={{ color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }}>{last90Days[0].weight} kg</p>
          <p style={{ color: textColor }}>90d ago</p>
        </div>
        <div className="text-right">
          <p style={{ color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }}>{last90Days[last90Days.length - 1].weight} kg</p>
          <p style={{ color: textColor }}>Today</p>
        </div>
      </div>
    </div>
  );
}