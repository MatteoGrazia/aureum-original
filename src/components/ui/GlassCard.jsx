import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassCard({ children, className, glow = false, ...props }) {
  return (
    <div
      className={cn(
        "backdrop-blur-[25px] saturate-[160%] bg-white/[0.05] border-[0.5px] border-[#D4AF37]/20 rounded-2xl",
        glow && "shadow-[0_0_20px_rgba(212,175,55,0.15)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}