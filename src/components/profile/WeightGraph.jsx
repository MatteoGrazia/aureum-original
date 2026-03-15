import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/components/shared/ThemeContext';

export default function WeightGraph({ data }) {
  const { isDarkMode } = useTheme();
  const chartData = data
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30)
    .map(entry => ({
      date: format(new Date(entry.date), 'MMM d'),
      weight: entry.weight,
      fullDate: entry.date
    }));

  const weights = chartData.map(d => d.weight);
  const minWeight = Math.min(...weights) - 2;
  const maxWeight = Math.max(...weights) + 2;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-white/10 border border-[#D4AF37]/30 rounded-lg p-3">
          <p className="text-[#D4AF37] text-lg">{payload[0].value} kg</p>
          <p className="text-white/50 text-xs">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="p-5">
      <h3 className="text-xs uppercase tracking-widest mb-4" style={{ color: isDarkMode ? '#FFFFFF' : '#1D1D1F' }}>Weight Progress</h3>
      
      {chartData.length > 1 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
                <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feFlood floodColor="#D4AF37" floodOpacity="0.5" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(29,29,31,0.4)', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[minWeight, maxWeight]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(29,29,31,0.4)', fontSize: 10 }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={{ fill: '#D4AF37', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 6, fill: '#D4AF37', filter: 'url(#goldGlow)' }}
                filter="url(#goldGlow)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center">
          <p className="text-white/40 text-sm">Log more weights to see your progress</p>
        </div>
      )}

      {/* Stats */}
      {chartData.length > 1 && (
        <div className="flex justify-between mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-white text-lg">{chartData[0]?.weight}</p>
            <p className="text-white/30 text-[10px] uppercase">Start</p>
          </div>
          <div className="text-center">
            <p className="text-[#D4AF37] text-lg">{chartData[chartData.length - 1]?.weight}</p>
            <p className="text-white/30 text-[10px] uppercase">Current</p>
          </div>
          <div className="text-center">
            <p className={`text-lg ${chartData[chartData.length - 1]?.weight - chartData[0]?.weight < 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(chartData[chartData.length - 1]?.weight - chartData[0]?.weight).toFixed(1)}
            </p>
            <p className="text-white/30 text-[10px] uppercase">Change</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}