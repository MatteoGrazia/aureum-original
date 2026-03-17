import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { useTheme } from '@/components/shared/ThemeContext';

function CustomDot(props) {
  const { cx, cy, payload, selectedIndex, index, color } = props;
  const isSelected = selectedIndex === index;
  return (
    <g>
      {isSelected && (
        <>
          <circle cx={cx} cy={cy} r={10} fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
          <circle cx={cx} cy={cy} r={6} fill="none" stroke={color} strokeWidth={1} opacity={0.5} />
        </>
      )}
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 4 : 2.5}
        fill={isSelected ? color : 'transparent'}
        stroke={color}
        strokeWidth={1}
        style={{ cursor: 'pointer' }}
      />
    </g>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  return (
    <div style={{
      background: 'rgba(18,12,4,0.95)',
      border: '0.5px solid rgba(212,175,55,0.4)',
      borderRadius: 10,
      padding: '8px 12px',
      fontSize: 11,
      fontFamily: 'Montserrat, sans-serif',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{entry?.dateLabel}</p>
      <p style={{ color: '#D4AF37', fontWeight: 500 }}>{entry?.weight} kg</p>
    </div>
  );
}

export default function WeightTrendMini({ weightHistory }) {
  const { isDarkMode } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(null);

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

  const data = last90Days.map((entry, i) => ({
    weight: entry.weight,
    dateLabel: format(new Date(entry.date), 'MMM d, yyyy'),
    index: i,
  }));

  const minWeight = Math.min(...data.map(d => d.weight));
  const maxWeight = Math.max(...data.map(d => d.weight));
  const range = maxWeight - minWeight || 1;
  const yMin = minWeight - range * 0.15;
  const yMax = maxWeight + range * 0.15;

  const textColor = isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(29,29,31,0.5)';
  const selectedEntry = selectedIndex !== null ? data[selectedIndex] : null;

  const handleClick = (chartData) => {
    if (!chartData?.activePayload?.length) return;
    const idx = chartData.activePayload[0]?.payload?.index;
    setSelectedIndex(prev => prev === idx ? null : idx);
  };

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
        className="h-28"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 5, left: 5 }} onClick={handleClick}>
            <defs>
              <linearGradient id="goldLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8ECAE6" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#8ECAE6" stopOpacity="1" />
                <stop offset="100%" stopColor="#8ECAE6" stopOpacity="0.3" />
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
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="url(#goldLineGradient)"
              strokeWidth={1.5}
              dot={(props) => (
                <CustomDot
                  key={props.index}
                  {...props}
                  selectedIndex={selectedIndex}
                  color="#8ECAE6"
                />
              )}
              activeDot={false}
              filter="url(#goldGlow)"
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Selected entry callout */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            key={selectedEntry.index}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-center mt-1 mb-1"
          >
            <span
              className="inline-block px-3 py-1 rounded-lg text-xs"
              style={{
                border: '0.5px solid rgba(212,175,55,0.45)',
                background: 'rgba(212,175,55,0.07)',
                color: '#D4AF37',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {selectedEntry.dateLabel} — {selectedEntry.weight} kg
            </span>
          </motion.div>
        )}
      </AnimatePresence>

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