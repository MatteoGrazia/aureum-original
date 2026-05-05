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

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert kg → display weight string with unit label */
export function fmtWeight(kg, weightUnit = 'kg') {
  if (kg == null || isNaN(kg)) return '—';
  if (weightUnit === 'lbs') return `${Math.round(kg * 2.20462)}`;
  return `${Math.round(kg * 10) / 10}`;
}

export function weightUnitLabel(weightUnit = 'kg') {
  return weightUnit === 'lbs' ? 'lbs' : 'kg';
}

/** Convert km → display distance string */
export function fmtDistance(km, distanceUnit = 'km') {
  if (km == null || isNaN(km)) return '—';
  if (distanceUnit === 'miles') return `${(km * 0.621371).toFixed(1)} mi`;
  return `${km.toFixed(1)} km`;
}

/** Convert kcal → display value with unit label */
export function fmtCalories(kcal, displayUnit = 'kcal') {
  if (kcal == null || isNaN(kcal)) return '0';
  if (displayUnit === 'kJ') return `${Math.round(kcal * 4.184)}`;
  return `${Math.round(kcal)}`;
}

export function calorieUnitLabel(displayUnit = 'kcal') {
  return displayUnit === 'kJ' ? 'kJ' : 'kcal';
}

/** Derive calorie goal from UserSettings */
export function getCalorieGoal(settings) {
  const s = { ...SETTINGS_DEFAULTS, ...settings };
  if (s.nutrition_goal === 'custom' && s.nutrition_custom_calories) {
    return s.nutrition_custom_calories;
  }
  // Fall back to UserProfile maintenance calories if available (passed separately)
  return null; // caller should combine with profile.maintenance_calories
}

/** Derive macro goals (g) from settings + calorie goal */
export function getMacroGoals(settings, calorieGoal = 2000) {
  const s = { ...SETTINGS_DEFAULTS, ...settings };
  const proteinMethod = s.nutrition_protein_target_method;
  const weight = s.profile_weight_kg || 70;

  let proteinG;
  if (proteinMethod === 'per_kg') {
    proteinG = Math.round((s.nutrition_protein_per_kg || 2.0) * weight);
  } else {
    proteinG = Math.round((s.nutrition_macro_split_protein / 100) * calorieGoal / 4);
  }

  const carbsG  = Math.round((s.nutrition_macro_split_carbs / 100) * calorieGoal / 4);
  const fatG    = Math.round((s.nutrition_macro_split_fat   / 100) * calorieGoal / 9);

  return { protein: proteinG, carbs: carbsG, fat: fatG };
}