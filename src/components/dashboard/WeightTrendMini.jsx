import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line } from 'recharts';

export default function WeightTrendMini({ weightHistory }) {
  // Get last 90 days of weight data
  const last90Days = weightHistory.slice(0, 90).reverse();
  
  if (last90Days.length < 2) {
    return (
      <div className="text-center py-8">
        <p className="text-white/40 text-sm">Not enough data yet</p>
        <p className="text-white/20 text-xs mt-1">Log more weights to see your trend</p>
      </div>
    );
  }

  const data = last90Days.map(entry => ({
    weight: entry.weight
  }));

  const minWeight = Math.min(...data.map(d => d.weight));
  const maxWeight = Math.max(...data.map(d => d.weight));
  const range = maxWeight - minWeight;
  const yMin = Math.floor(minWeight - range * 0.1);
  const yMax = Math.ceil(maxWeight + range * 0.1);

  return (
    <div className="relative">
      {/* Ambient glow behind chart */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="h-24"
      >
        <LineChart width={350} height={96} data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
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
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="url(#goldLineGradient)"
            strokeWidth={1}
            dot={false}
            filter="url(#goldGlow)"
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </LineChart>
      </motion.div>

      {/* Stats overlay */}
      <div className="flex justify-between mt-2 text-xs">
        <div>
          <p className="text-[#D4AF37]">{last90Days[0].weight} kg</p>
          <p className="text-white/30">90d ago</p>
        </div>
        <div className="text-right">
          <p className="text-[#D4AF37]">{last90Days[last90Days.length - 1].weight} kg</p>
          <p className="text-white/30">Today</p>
        </div>
      </div>
    </div>
  );
}