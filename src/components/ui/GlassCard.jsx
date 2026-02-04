import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassCard({ children, className, glow = false, ...props }) {
  return (
    <div
      className={cn(
        "backdrop-blur-[20px] bg-white/[0.03] border-[0.5px] border-[#D4AF37]/20 rounded-2xl",
        glow && "shadow-[0_0_20px_rgba(212,175,55,0.15)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}