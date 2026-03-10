import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/shared/ThemeContext';

export default function GlassCard({ children, className, glow = false, style, ...props }) {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={cn(
        "backdrop-blur-[25px] backdrop-saturate-[160%] border-[0.5px] border-[#D4AF37]/20 rounded-2xl",
        className
      )}
      style={{
        background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
        boxShadow: isDarkMode
          ? (glow ? '0 0 20px rgba(212,175,55,0.15)' : undefined)
          : '0 10px 30px rgba(225,193,110,0.15)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}