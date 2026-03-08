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
          : 'rgba(255, 248, 220, 0.52)',
        backdropFilter: 'blur(24px) saturate(200%)',
        boxShadow: isDarkMode
          ? '0 20px 50px rgba(0, 0, 0, 0.6)'
          : '0 8px 32px rgba(180, 130, 30, 0.13), 0 0 0 0.5px rgba(212, 175, 55, 0.18) inset',
        border: isDarkMode
          ? '0.5px solid rgba(212, 175, 55, 0.2)'
          : '0.5px solid rgba(212, 175, 55, 0.32)',
        padding: '20px 18px',
        borderRadius: '14px',
        width: '92%',
        margin: '10px auto',
        overflow: 'hidden',
        transition: 'background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
        ...style,
      }}
      {...props}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: isDarkMode
            ? 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(255,255,255,0.01) 0%, transparent 60%)'
            : 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(255,255,255,0.60) 0%, transparent 60%)',
          borderRadius: '14px 14px 0 0',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}