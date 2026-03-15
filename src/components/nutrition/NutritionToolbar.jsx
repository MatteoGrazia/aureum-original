import React from 'react';
import { ScanBarcode, Scan, Mic, Zap, UtensilsCrossed } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';

const PEACH = '#FFDAB9';
const PEACH_DIM = 'rgba(255,218,185,0.10)';
const PEACH_BORDER = 'rgba(255,218,185,0.25)';

// Barcode scanner gets a slightly different accent to distinguish it
const BARCODE_COLOR = '#BDB5D5';
const BARCODE_DIM = 'rgba(189,181,213,0.10)';
const BARCODE_BORDER = 'rgba(189,181,213,0.28)';

const AI_ACTIONS = [
  { id: 'scan_meal',   label: 'AI Scan',    icon: Scan },
  { id: 'voice_log',  label: 'Voice',      icon: Mic },
  { id: 'quick_add',  label: 'Quick Add',  icon: Zap },
  { id: 'create_food', label: 'Create',    icon: UtensilsCrossed },
];

export default function NutritionToolbar({ onAction, onOpenScanner }) {
  const { isDarkMode } = useTheme();
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(29,29,31,0.45)';
  const barcodeTextMuted = isDarkMode ? 'rgba(189,181,213,0.7)' : 'rgba(100,90,140,0.7)';

  return (
    <div className="space-y-2">
      {/* Barcode scanner — full-width, clearly distinct */}
      <button
        onClick={onOpenScanner}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl transition-all active:scale-95"
        style={{
          background: BARCODE_DIM,
          border: `0.5px solid ${BARCODE_BORDER}`,
          minHeight: 48,
        }}
      >
        <ScanBarcode className="w-4 h-4" style={{ color: BARCODE_COLOR }} strokeWidth={1.5} />
        <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: barcodeTextMuted, fontFamily: 'Montserrat, sans-serif' }}>
          Scan Barcode
        </span>
      </button>

      {/* AI-powered tools row */}
      <div className="flex gap-2">
        {AI_ACTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onAction(id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all active:scale-95"
            style={{
              background: PEACH_DIM,
              border: `0.5px solid ${PEACH_BORDER}`,
              minHeight: 54,
            }}
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