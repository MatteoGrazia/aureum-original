import React from 'react';
import { cn } from '@/lib/utils';

export default function VoidCard({ children, className, ...props }) {
  return (
    <div
      className={cn("relative", className)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(25px) saturate(160%)',
        WebkitBackdropFilter: 'blur(25px) saturate(160%)',
        boxShadow: 'inset 0px 8px 16px rgba(0,0,0,0.8)',
        borderTop: '0.5px solid rgba(212,175,55,1)',
        borderLeft: '0.5px solid rgba(212,175,55,0.05)',
        borderRight: '0.5px solid rgba(212,175,55,0.05)',
        borderBottom: '0.5px solid rgba(212,175,55,0.05)',
        padding: '24px 20px',
        borderRadius: '16px'
      }}
      {...props}
    >
      {children}
    </div>
  );
}