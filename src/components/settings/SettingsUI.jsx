// Shared primitive UI components for the Settings panel
import React from 'react';
import { motion } from 'framer-motion';

const GOLD = '#D4AF37';
const PURPLE = '#BDB5D5';

export function SettingRow({ label, sublabel, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5"
      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>{label}</p>
        {sublabel && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(229,229,231,0.35)', fontFamily: 'Montserrat, sans-serif' }}>{sublabel}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-3 mt-5">
      <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: GOLD, fontFamily: 'Montserrat, sans-serif' }}>{title}</p>
      {subtitle && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(229,229,231,0.35)', fontFamily: 'Montserrat, sans-serif' }}>{subtitle}</p>}
    </div>
  );
}

export function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full flex-shrink-0 transition-all duration-200"
      style={{ background: value ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.1)', border: value ? '0.5px solid rgba(212,175,55,0.6)' : '0.5px solid rgba(255,255,255,0.15)' }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="absolute top-1 w-4 h-4 rounded-full"
        style={{ background: value ? GOLD : '#6B6B6B' }}
      />
    </button>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="flex rounded-xl overflow-hidden flex-shrink-0"
      style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
      {options.map(opt => {
        const isActive = (opt.value ?? opt) === value;
        const label = opt.label ?? opt;
        return (
          <button
            key={label}
            onClick={() => onChange(opt.value ?? opt)}
            className="px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] transition-all"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              background: isActive ? 'rgba(212,175,55,0.18)' : 'transparent',
              color: isActive ? GOLD : 'rgba(229,229,231,0.4)',
              border: isActive ? '0.5px solid rgba(212,175,55,0.35)' : '0.5px solid transparent',
              borderRadius: 10,
              margin: 2,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 100, step = 1 }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all active:scale-90"
        style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#E5E5E7' }}
      >−</button>
      <span className="text-sm min-w-[40px] text-center" style={{ color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}>{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all active:scale-90"
        style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#E5E5E7' }}
      >+</button>
    </div>
  );
}

export function NumberInput({ value, onChange, placeholder, unit, min, max }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <input
        type="number"
        value={value ?? ''}
        min={min}
        max={max}
        onChange={e => onChange(parseFloat(e.target.value) || null)}
        placeholder={placeholder}
        className="w-20 text-right text-sm px-2 py-1.5 rounded-lg outline-none"
        style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}
      />
      {unit && <span className="text-[10px]" style={{ color: 'rgba(229,229,231,0.4)', fontFamily: 'Montserrat, sans-serif' }}>{unit}</span>}
    </div>
  );
}

export function InfoRow({ text }) {
  return (
    <div className="px-3 py-2.5 rounded-xl my-2"
      style={{ background: 'rgba(189,181,213,0.05)', border: '0.5px solid rgba(189,181,213,0.15)' }}>
      <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(189,181,213,0.6)', fontFamily: 'Montserrat, sans-serif' }}>{text}</p>
    </div>
  );
}

export function CardSelector({ options, value, onChange, columns = 2 }) {
  return (
    <div className={`grid gap-2 mt-2`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map(opt => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="py-3 px-3 rounded-xl text-left transition-all active:scale-95"
            style={{
              background: isActive ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
              border: isActive ? '1px solid rgba(212,175,55,0.5)' : '0.5px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-base mb-0.5">{opt.icon}</p>
            <p className="text-xs font-medium" style={{ color: isActive ? GOLD : '#E5E5E7', fontFamily: 'Montserrat, sans-serif' }}>{opt.label}</p>
            {opt.desc && <p className="text-[9px] mt-0.5" style={{ color: 'rgba(229,229,231,0.35)', fontFamily: 'Montserrat, sans-serif' }}>{opt.desc}</p>}
          </button>
        );
      })}
    </div>
  );
}