import React from 'react';
import { cn } from '@/lib/utils';

export default function GoldButton({ children, className, variant = 'filled', ...props }) {
  const variants = {
    filled: "bg-gradient-to-r from-[#D4AF37] via-[#F4D03F] to-[#D4AF37] text-[#080808] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]",
    outline: "border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10",
    ghost: "text-[#D4AF37] hover:bg-[#D4AF37]/10"
  };

  return (
    <button
      className={cn(
        "px-6 py-3 rounded-xl font-light tracking-wider uppercase text-sm transition-all duration-300",
        variants[variant],
        className
      )}
      style={{ minHeight: '48px', ...props.style }}
      {...props}
    >
      {children}
    </button>
  );
}