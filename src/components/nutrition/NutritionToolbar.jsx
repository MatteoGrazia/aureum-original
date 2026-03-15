import React from 'react';
import { Scan, Mic, Zap, UtensilsCrossed } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';

const PEACH = '#FFDAB9';
const PEACH_DIM = 'rgba(255,218,185,0.12)';
const PEACH_BORDER = 'rgba(255,218,185,0.28)';

const ACTIONS = [
  { id: 'scan_meal', label: 'Scan', icon: Scan },
  { id: 'voice_log', label: 'Voice', icon: Mic },
  { id: 'quick_add', label: 'Quick Add', icon: Zap },
  { id: 'create_food', label: 'Create', icon: UtensilsCrossed },
];

export default function NutritionToolbar({ onAction, onOpenScanner }) {
  const { isDarkMode } = useTheme();
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(29,29,31,0.45)';

  return (
    <div className="flex gap-2">
      {ACTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => id === 'scan_barcode' ? onOpenScanner() : onAction(id)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all active:scale-95"
          style={{
            background: PEACH_DIM,
            border: `0.5px solid ${PEACH_BORDER}`,
            minHeight: 54,
          }}
        >
          <Icon className="w-4 h-4" style={{ color: PEACH }} strokeWidth={1.5} />
          <span className="text-[9px] uppercase tracking-[0.12em]" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}