import React from 'react';
import { ScanBarcode, Scan, Mic, Zap, UtensilsCrossed } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';

const PEACH = '#FFDAB9';
const PURPLE = '#BDB5D5';

const AI_ACTIONS = [
  { id: 'scan_meal',    label: 'AI Scan',   icon: Scan },
  { id: 'voice_log',   label: 'Voice',     icon: Mic },
  { id: 'quick_add',   label: 'Quick Add', icon: Zap },
  { id: 'create_food', label: 'Create',    icon: UtensilsCrossed },
];

export default function NutritionToolbar({ onAction, onOpenScanner }) {
  const { isDarkMode } = useTheme();

  const cardBg = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.88)';
  const cardBorder = isDarkMode ? 'rgba(212,175,55,0.2)' : 'rgba(225,193,110,0.45)';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(29,29,31,0.45)';

  const btnStyle = {
    background: cardBg,
    border: `0.5px solid ${cardBorder}`,
    backdropFilter: 'blur(12px)',
  };

  return (
    <div className="space-y-2">
      {/* Barcode scanner — full-width */}
      <button
        onClick={onOpenScanner}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl transition-all active:scale-95"
        style={{ ...btnStyle, minHeight: 48 }}
      >
        <ScanBarcode className="w-4 h-4" style={{ color: PURPLE }} strokeWidth={1.5} />
        <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
          Scan Barcode
        </span>
      </button>

      {/* AI tools row */}
      <div className="flex gap-2">
        {AI_ACTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onAction(id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all active:scale-95"
            style={{ ...btnStyle, minHeight: 54 }}
          >
            <Icon className="w-4 h-4" style={{ color: PEACH }} strokeWidth={1.5} />
            <span className="text-[9px] uppercase tracking-[0.10em]" style={{ color: textMuted, fontFamily: 'Montserrat, sans-serif' }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}