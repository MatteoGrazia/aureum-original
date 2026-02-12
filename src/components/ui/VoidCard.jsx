import React from 'react';
import { cn } from '@/lib/utils';

export default function VoidCard({ children, className, ...props }) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(30px) saturate(180%)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        border: '0.5px solid rgba(212, 175, 55, 0.1)',
        padding: '20px 18px',
        borderRadius: '14px'
      }}
      {...props}
    >

      {/* Subtle white reflection */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(255, 255, 255, 0.01) 0%, transparent 60%)',
          borderRadius: '14px 14px 0 0'
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}