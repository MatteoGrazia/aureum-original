import React from 'react';
import { cn } from '@/lib/utils';

export default function VoidCard({ children, className, ...props }) {
  return (
    <div
      className={cn("relative", className)}
      style={{
        background: '#050505',
        boxShadow: 'inset 0px 8px 16px rgba(0,0,0,1)',
        borderTop: '0.5px solid rgba(212,175,55,0.3)',
        padding: '24px 20px',
        borderRadius: '16px'
      }}
      {...props}
    >
      {children}
    </div>
  );
}