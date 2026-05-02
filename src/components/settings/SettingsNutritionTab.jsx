import React, { useMemo } from 'react';
import { SectionHeader, SettingRow, Toggle, Segmented, Stepper, NumberInput, InfoRow, CardSelector } from './SettingsUI';

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725, extra_active: 1.9
};

function calcTDEE(settings) {
  const w = settings.profile_weight_kg;
  const h = settings.profile_height_cm;
  const dob = settings.profile_dob;
  const g = settings.profile_gender;
  const bf = settings.profile_body_fat_percentage;
  const method = settings.nutrition_tdee_calculation_method;
  const al = settings.profile_activity_level || 'moderately_active';
  if (!w || !h || !dob) return null;
  const age = Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
  let bmr = 0;
  if (method === 'mifflin') {
    bmr = g === 'male' ? (10*w + 6.25*h - 5*age + 5) : (10*w + 6.25*h - 5*age - 161);
  } else if (method === 'harris') {
    bmr = g === 'male' ? (88.362 + 13.397*w + 4.799*h - 5.677*age) : (447.593 + 9.247*w + 3.098*h - 4.330*age);
  } else if (method === 'katch') {
    if (!bf) return null;
    const lbm = w * (1 - bf / 100);
    bmr = 370 + 21.6 * lbm;
  }
  return bmr > 0 ? Math.round(bmr * (ACTIVITY_MULTIPLIERS[al] || 1.55)) : null;
}

export default function SettingsNutritionTab({ settings, updateSetting }) {
  const tdee = useMemo(() => calcTDEE(settings), [
    settings.profile_weight_kg, settings.profile_height_cm, settings.profile_dob,
    settings.profile_gender, settings.profile_body_fat_percentage,
    settings.nutrition_tdee_calculation_method, settings.profile_activity_level
  ]);

  const targetCalories = (() => {
    if (!tdee) return null;
    const g = settings.nutrition_goal;
    if (g === 'cut') return tdee - (settings.nutrition_calorie_deficit || 300);
    if (g === 'bulk') return tdee + (settings.nutrition_calorie_surplus || 250);
    if (g === 'custom') return settings.nutrition_custom_calories;
    return tdee;
  })();

  const proteinG = settings.nutrition_protein_target_method === 'per_kg' && settings.profile_weight_kg
    ? Math.round(settings.profile_weight_kg * (settings.nutrition_protein_per_kg || 2))
    : targetCalories ? Math.round(targetCalories * ((settings.nutrition_macro_split_protein || 30) / 100) / 4) : null;

  const carbsG = targetCalories ? Math.round(targetCalories * ((settings.nutrition_macro_split_carbs || 45) / 100) / 4) : null;
  const fatG = targetCalories ? Math.round(targetCalories * ((settings.nutrition_macro_split_fat || 25) / 100) / 9) : null;

  const adjustMacro = (key, newVal) => {
    const others = ['nutrition_macro_split_protein', 'nutrition_macro_split_carbs', 'nutrition_macro_split_fat'].filter(k => k !== key);
    const currentOtherSum = (settings[others[0]] || 0) + (settings[others[1]] || 0);
    const remaining = 100 - newVal;
    const ratio0 = currentOtherSum > 0 ? (settings[others[0]] || 0) / currentOtherSum : 0.5;
    const ratio1 = 1 - ratio0;
    updateSetting(key, newVal);
    updateSetting(others[0], Math.round(remaining * ratio0));
    updateSetting(others[1], Math.round(remaining * ratio1));
  };

  return (
    <div className="space-y-1">
      <SectionHeader title="Calorie Target" />
      <p className="text-[10px] mb-2" style={{ color: 'rgba(229,229,231,0.4)', fontFamily: 'Montserrat, sans-serif' }}>Nutrition Goal</p>
      <CardSelector
        options={[
          { value: 'cut', label: 'Cut', icon: '🔽', desc: 'Calorie deficit' },
          { value: 'maintain', label: 'Maintain', icon: '⚖️', desc: 'TDEE = target' },
          { value: 'bulk', label: 'Bulk', icon: '🔼', desc: 'Calorie surplus' },
          { value: 'custom', label: 'Custom', icon: '🎯', desc: 'Set manually' },
        ]}
        value={settings.nutrition_goal}
        onChange={v => updateSetting('nutrition_goal', v)}
      />
      {settings.nutrition_goal === 'cut' && (
        <SettingRow label="Calorie Deficit" sublabel={targetCalories ? `Your target: ${targetCalories} kcal/day` : ''}>
          <Stepper value={settings.nutrition_calorie_deficit || 300} onChange={v => updateSetting('nutrition_calorie_deficit', v)} min={100} max={1000} step={50} />
        </SettingRow>
      )}
      {settings.nutrition_goal === 'bulk' && (
        <SettingRow label="Calorie Surplus" sublabel={targetCalories ? `Your target: ${targetCalories} kcal/day` : ''}>
          <Stepper value={settings.nutrition_calorie_surplus || 250} onChange={v => updateSetting('nutrition_calorie_surplus', v)} min={100} max={500} step={50} />
        </SettingRow>
      )}
      {settings.nutrition_goal === 'custom' && (
        <SettingRow label="Custom Target (kcal)">
          <NumberInput value={settings.nutrition_custom_calories} onChange={v => updateSetting('nutrition_custom_calories', v)} unit="kcal" min={500} max={10000} />
        </SettingRow>
      )}

      <SectionHeader title="TDEE Formula" />
      <Segmented
        options={[
          { label: 'Mifflin', value: 'mifflin' },
          { label: 'Harris', value: 'harris' },
          { label: 'Katch', value: 'katch' },
        ]}
        value={settings.nutrition_tdee_calculation_method}
        onChange={v => updateSetting('nutrition_tdee_calculation_method', v)}
      />
      <p className="text-[9px] mt-1.5" style={{ color: 'rgba(229,229,231,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
        {settings.nutrition_tdee_calculation_method === 'mifflin' && 'Mifflin-St Jeor — most accurate for general population'}
        {settings.nutrition_tdee_calculation_method === 'harris' && 'Harris-Benedict — classic formula, slightly overestimates'}
        {settings.nutrition_tdee_calculation_method === 'katch' && 'Katch-McArdle — most accurate if body fat % is known'}
      </p>
      {settings.nutrition_tdee_calculation_method === 'katch' && !settings.profile_body_fat_percentage && (
        <InfoRow text="⚠️ Katch-McArdle requires body fat %. Set it in the Profile tab." />
      )}
      {tdee && <InfoRow text={`Your estimated TDEE: ${tdee} kcal/day`} />}

      <SectionHeader title="Macros" />
      <SettingRow label="Protein Target Method">
        <Segmented
          options={[{ label: 'per kg', value: 'per_kg' }, { label: '% cal', value: 'percentage' }]}
          value={settings.nutrition_protein_target_method}
          onChange={v => updateSetting('nutrition_protein_target_method', v)}
        />
      </SettingRow>
      {settings.nutrition_protein_target_method === 'per_kg' ? (
        <SettingRow label="Protein per kg BW" sublabel={proteinG ? `= ${proteinG}g/day` : ''}>
          <Stepper value={settings.nutrition_protein_per_kg || 2.0} onChange={v => updateSetting('nutrition_protein_per_kg', v)} min={1.0} max={3.5} step={0.1} />
        </SettingRow>
      ) : (
        <>
          <SettingRow label={`Protein ${settings.nutrition_macro_split_protein}%`} sublabel={proteinG ? `${proteinG}g` : ''}>
            <Stepper value={settings.nutrition_macro_split_protein || 30} onChange={v => adjustMacro('nutrition_macro_split_protein', v)} min={5} max={60} step={1} />
          </SettingRow>
          <SettingRow label={`Carbs ${settings.nutrition_macro_split_carbs}%`} sublabel={carbsG ? `${carbsG}g` : ''}>
            <Stepper value={settings.nutrition_macro_split_carbs || 45} onChange={v => adjustMacro('nutrition_macro_split_carbs', v)} min={5} max={70} step={1} />
          </SettingRow>
          <SettingRow label={`Fat ${settings.nutrition_macro_split_fat}%`} sublabel={fatG ? `${fatG}g` : ''}>
            <Stepper value={settings.nutrition_macro_split_fat || 25} onChange={v => adjustMacro('nutrition_macro_split_fat', v)} min={5} max={60} step={1} />
          </SettingRow>
        </>
      )}
      <SettingRow label="Show Micronutrients" sublabel="Vitamins & minerals in food diary">
        <Toggle value={settings.nutrition_show_micronutrients} onChange={v => updateSetting('nutrition_show_micronutrients', v)} />
      </SettingRow>

      <SectionHeader title="Diary Behaviour" />
      <SettingRow label="Meals Per Day">
        <Stepper value={settings.nutrition_meal_count || 3} onChange={v => updateSetting('nutrition_meal_count', v)} min={1} max={8} />
      </SettingRow>
      <SettingRow label="Diary Reset Time">
        <input
          type="time"
          value={settings.nutrition_diary_start_time || '06:00'}
          onChange={e => updateSetting('nutrition_diary_start_time', e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg outline-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}
        />
      </SettingRow>
      <SettingRow label="Barcode Scanner Default">
        <Segmented
          options={[{ label: 'Serving', value: 'serving' }, { label: '100g', value: '100g' }]}
          value={settings.nutrition_barcode_scanner_default_serving}
          onChange={v => updateSetting('nutrition_barcode_scanner_default_serving', v)}
        />
      </SettingRow>
      <SettingRow label="Show Remaining Calories" sublabel="Toggle consumed ↔ remaining view">
        <Toggle value={settings.nutrition_show_calories_remaining} onChange={v => updateSetting('nutrition_show_calories_remaining', v)} />
      </SettingRow>

      <SectionHeader title="Hydration" />
      <SettingRow label="Daily Water Goal" sublabel={`${Math.round((settings.nutrition_water_goal_ml || 2500) / 1000 * 10) / 10}L`}>
        <Stepper value={settings.nutrition_water_goal_ml || 2500} onChange={v => updateSetting('nutrition_water_goal_ml', v)} min={500} max={6000} step={250} />
      </SettingRow>
      <SettingRow label="Water Reminders">
        <Toggle value={settings.nutrition_water_reminder_enabled} onChange={v => updateSetting('nutrition_water_reminder_enabled', v)} />
      </SettingRow>
      {settings.nutrition_water_reminder_enabled && (
        <SettingRow label="Remind every" sublabel="hours">
          <Segmented
            options={[{ label: '1h', value: 1 }, { label: '2h', value: 2 }, { label: '3h', value: 3 }, { label: '4h', value: 4 }]}
            value={settings.nutrition_water_reminder_interval_hours}
            onChange={v => updateSetting('nutrition_water_reminder_interval_hours', v)}
          />
        </SettingRow>
      )}
    </div>
  );
}