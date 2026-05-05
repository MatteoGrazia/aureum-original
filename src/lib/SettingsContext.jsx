import React, { createContext, useContext } from 'react';
import { useUserSettings, SETTINGS_DEFAULTS } from './useUserSettings';

const SettingsContext = createContext(SETTINGS_DEFAULTS);

export function SettingsProvider({ children }) {
  const { settings, isLoading } = useUserSettings();
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

// ─── Unit conversion helpers ──────────────────────────────────────────────────

/** kg → display weight string with unit label */
export function formatWeight(kg, weightUnit) {
  if (kg == null || isNaN(kg)) return '—';
  if (weightUnit === 'lbs') return `${(kg * 2.20462).toFixed(1)} lbs`;
  return `${kg} kg`;
}

/** kg → numeric value in preferred unit */
export function toDisplayWeight(kg, weightUnit) {
  if (kg == null || isNaN(kg)) return 0;
  if (weightUnit === 'lbs') return Math.round(kg * 2.20462 * 10) / 10;
  return kg;
}

/** km → display distance string */
export function formatDistance(km, distanceUnit) {
  if (km == null || isNaN(km)) return '—';
  if (distanceUnit === 'miles') return `${(km * 0.621371).toFixed(2)} mi`;
  return `${km} km`;
}

/** kcal → display calorie string */
export function formatCalories(kcal, displayUnit) {
  if (kcal == null || isNaN(kcal)) return '0';
  if (displayUnit === 'kJ') return `${Math.round(kcal * 4.184)} kJ`;
  return `${Math.round(kcal)} kcal`;
}

/** Get numeric calorie value in preferred unit */
export function toDisplayCalories(kcal, displayUnit) {
  if (kcal == null || isNaN(kcal)) return 0;
  if (displayUnit === 'kJ') return Math.round(kcal * 4.184);
  return Math.round(kcal);
}

/** Weight unit label */
export function weightUnitLabel(weightUnit) {
  return weightUnit === 'lbs' ? 'lbs' : 'kg';
}