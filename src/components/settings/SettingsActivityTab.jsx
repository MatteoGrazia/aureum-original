import React from 'react';
import { SectionHeader, SettingRow, Toggle, Segmented, Stepper, NumberInput, InfoRow } from './SettingsUI';

export default function SettingsActivityTab({ settings, updateSetting }) {
  return (
    <div className="space-y-1">
      <SectionHeader title="Daily Goals" />
      <SettingRow label="Daily Steps Goal">
        <Stepper value={settings.activity_daily_steps_goal || 10000} onChange={v => updateSetting('activity_daily_steps_goal', v)} min={1000} max={50000} step={500} />
      </SettingRow>
      <SettingRow label="Active Minutes Goal" sublabel="Minutes of activity per day">
        <Stepper value={settings.activity_active_minutes_goal || 30} onChange={v => updateSetting('activity_active_minutes_goal', v)} min={5} max={180} step={5} />
      </SettingRow>
      <SettingRow label="Show Steps on Home">
        <Toggle value={settings.activity_show_steps_on_home} onChange={v => updateSetting('activity_show_steps_on_home', v)} />
      </SettingRow>

      <SectionHeader title="Calorie Burn" />
      <SettingRow label="Calorie Burn Method">
        <Segmented
          options={[{ label: 'Auto', value: 'auto' }, { label: 'Manual', value: 'manual' }]}
          value={settings.activity_calorie_burn_method}
          onChange={v => updateSetting('activity_calorie_burn_method', v)}
        />
      </SettingRow>
      {settings.activity_calorie_burn_method === 'manual' && (
        <SettingRow label="Daily Calorie Burn" sublabel="Replaces TDEE-calculated burn">
          <NumberInput value={settings.activity_manual_tdee_adjustment} onChange={v => updateSetting('activity_manual_tdee_adjustment', v)} unit="kcal" min={500} max={8000} />
        </SettingRow>
      )}
      <SettingRow label="Add Cardio Cals to Nutrition Budget" sublabel="Burn 300 kcal running → target increases by 300">
        <Toggle value={settings.activity_cardio_calories_in_nutrition} onChange={v => updateSetting('activity_cardio_calories_in_nutrition', v)} />
      </SettingRow>
      <SettingRow label="Count Workout Steps in Daily Total">
        <Toggle value={settings.activity_count_workout_steps} onChange={v => updateSetting('activity_count_workout_steps', v)} />
      </SettingRow>

      <SectionHeader title="Tracking" />
      <SettingRow label="Track Floors Climbed">
        <Toggle value={settings.activity_track_floors} onChange={v => updateSetting('activity_track_floors', v)} />
      </SettingRow>
      <SettingRow label="Track Distance">
        <Toggle value={settings.activity_track_distance} onChange={v => updateSetting('activity_track_distance', v)} />
      </SettingRow>

      <SectionHeader title="Health Platform" />
      <InfoRow text="When connected, steps, distance, active minutes and heart rate sync automatically." />
      <SettingRow label="Connect Apple HealthKit" sublabel="iOS only">
        <Toggle value={settings.activity_connect_healthkit} onChange={v => updateSetting('activity_connect_healthkit', v)} />
      </SettingRow>
      <SettingRow label="Connect Google Health Connect" sublabel="Android only">
        <Toggle value={settings.activity_connect_google_fit} onChange={v => updateSetting('activity_connect_google_fit', v)} />
      </SettingRow>
    </div>
  );
}