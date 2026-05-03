import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/shared/ThemeContext';

export default function VoidCard({ children, className, style, ...props }) {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={cn("relative", className)}
      style={{
        background: isDarkMode
          ? 'rgba(255, 255, 255, 0.03)'
          : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px) saturate(150%)',
        boxShadow: isDarkMode
          ? '0 8px 30px rgba(0, 0, 0, 0.5)'
          : '0 2px 8px rgba(225, 193, 110, 0.04)',
        border: isDarkMode
          ? '0.5px solid rgba(212, 175, 55, 0.2)'
          : '0.5px solid rgba(225, 193, 110, 0.45)',
        padding: '20px 18px',
        borderRadius: '14px',
        width: '92%',
        margin: '10px auto',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: isDarkMode
            ? 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(255,255,255,0.01) 0%, transparent 60%)'
            : 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(255,255,255,0.55) 0%, transparent 60%)',
          borderRadius: '14px 14px 0 0',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}