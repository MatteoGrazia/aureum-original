import React from 'react';
import { cn } from '@/lib/utils';

export default function VoidCard({ children, className, ...props }) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: 'linear-gradient(135deg, rgba(160,160,160,0.04) 0%, rgba(255,255,255,0.02) 50%, rgba(180,180,180,0.03) 100%)',
        backdropFilter: 'blur(30px) saturate(180%)',
        boxShadow: 'inset 0px 1px 20px rgba(200,200,200,0.06), inset 0px 4px 12px rgba(0,0,0,0.4), 0px 10px 40px rgba(0,0,0,0.3)',
        borderTop: '0.5px solid rgba(212,175,55,0.5)',
        borderLeft: '0.5px solid rgba(160,160,160,0.08)',
        borderRight: '0.5px solid rgba(160,160,160,0.08)',
        borderBottom: 'none',
        padding: '24px 20px',
        borderRadius: '16px'
      }}
      {...props}
    >
      {/* Subtle ambient glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.015) 0%, transparent 60%)',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}