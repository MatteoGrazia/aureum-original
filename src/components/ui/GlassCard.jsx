import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/shared/ThemeContext';

export default function GlassCard({ children, className, glow = false, style, ...props }) {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={cn(
        "backdrop-blur-[25px] saturate-[160%] border-[0.5px] border-[#D4AF37]/20 rounded-2xl",
        className
      )}
      style={{
        background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255, 248, 220, 0.52)',
        boxShadow: isDarkMode
          ? (glow ? '0 0 20px rgba(212,175,55,0.15)' : undefined)
          : '0 8px 32px rgba(180, 130, 30, 0.13), 0 0 0 0.5px rgba(212, 175, 55, 0.18) inset',
        border: isDarkMode ? undefined : '0.5px solid rgba(212, 175, 55, 0.32)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}