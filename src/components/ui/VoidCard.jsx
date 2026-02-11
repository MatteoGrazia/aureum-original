import React from 'react';
import { cn } from '@/lib/utils';

export default function VoidCard({ children, className, ...props }) {
  return (
    <div
      className={cn("relative", className)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(25px) saturate(160%)',
        boxShadow: 'inset 0px 4px 12px rgba(0,0,0,0.5), 0px 10px 30px rgba(0,0,0,0.3)',
        borderTop: '0.5px solid #D4AF37',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        padding: '24px 20px',
        borderRadius: '16px'
      }}
      {...props}
    >
      {children}
    </div>
  );
}