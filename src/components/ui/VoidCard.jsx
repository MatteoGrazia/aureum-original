import React from 'react';
import { cn } from '@/lib/utils';

export default function VoidCard({ children, className, ...props }) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(30px) saturate(180%)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 1px rgba(212, 175, 55, 0.1)',
        border: '0.5px solid rgba(212, 175, 55, 0.15)',
        padding: '20px 18px',
        borderRadius: '14px'
      }}
      {...props}
    >

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}