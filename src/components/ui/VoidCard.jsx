import React from 'react';
import { cn } from '@/lib/utils';

export default function VoidCard({ children, className, ...props }) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(255,255,255,0.03) 50%, rgba(212,175,55,0.05) 100%)',
        backdropFilter: 'blur(30px) saturate(180%)',
        boxShadow: 'inset 0px 1px 20px rgba(244,208,63,0.08), inset 0px 4px 12px rgba(0,0,0,0.3), 0px 10px 30px rgba(0,0,0,0.2)',
        borderTop: '0.5px solid rgba(212,175,55,0.6)',
        borderLeft: '0.5px solid rgba(212,175,55,0.1)',
        borderRight: '0.5px solid rgba(212,175,55,0.1)',
        borderBottom: 'none',
        padding: '20px 18px',
        borderRadius: '14px'
      }}
      {...props}
    >
      {/* Subtle ambient glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(244,208,63,0.04) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}