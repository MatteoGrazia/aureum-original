import React from 'react';
import { cn } from '@/lib/utils';

export default function VoidCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-[#050505] rounded-2xl p-6",
        "shadow-[inset_0px_8px_16px_rgba(0,0,0,1)]",
        "border-t-[0.5px] border-t-[#D4AF37]/30",
        className
      )}
      style={{
        borderTopWidth: '0.5px',
        borderTopStyle: 'solid',
        borderTopColor: 'rgba(212, 175, 55, 0.3)'
      }}
      {...props}
    >
      {children}
    </div>
  );
}