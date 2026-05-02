import React from 'react';
import { SectionHeader, SettingRow, Toggle, Segmented, Stepper, NumberInput, InfoRow } from './SettingsUI';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

export default function SettingsWorkoutsTab({ settings, updateSetting }) {
  const preferred = settings.workout_preferred_days || ['monday','tuesday','wednesday','thursday','friday'];

  const toggleDay = (day) => {
    const next = preferred.includes(day) ? preferred.filter(d => d !== day) : [...preferred, day];
    updateSetting('workout_preferred_days', next);
  };

  const hasOverride = settings.workout_sbd_squat_override != null || settings.workout_sbd_bench_override != null || settings.workout_sbd_deadlift_override != null;

  return (
    <div className="space-y-1">
      <SectionHeader title="Weekly Planning" />
      <SettingRow label="Weekly Workout Goal" sublabel="Drives the progress arc on hero">
        <Stepper value={settings.workout_weekly_goal || 5} onChange={v => updateSetting('workout_weekly_goal', v)} min={1} max={14} />
      </SettingRow>
      <div className="py-3">
        <p className="text-sm mb-2" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>Preferred Training Days</p>
        <div className="flex gap-2">
          {DAYS.map((d, i) => (
            <button key={d} onClick={() => toggleDay(d)}
              className="flex-1 py-2 rounded-xl text-[9px] uppercase tracking-wider transition-all active:scale-95"
              style={{
                background: preferred.includes(d) ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
                border: preferred.includes(d) ? '0.5px solid rgba(212,175,55,0.5)' : '0.5px solid rgba(255,255,255,0.1)',
                color: preferred.includes(d) ? '#D4AF37' : 'rgba(229,229,231,0.4)',
                fontFamily: 'Montserrat, sans-serif',
              }}>
              {DAY_LABELS[i]}
            </button>
          ))}
        </div>
      </div>

      <SectionHeader title="During Workout" />
      <SettingRow label="Default Rest Timer">
        <Segmented
          options={[{ label: '30s', value: 30 }, { label: '1m', value: 60 }, { label: '1m30', value: 90 }, { label: '2m', value: 120 }, { label: '3m', value: 180 }]}
          value={settings.workout_default_rest_timer}
          onChange={v => updateSetting('workout_default_rest_timer', v)}
        />
      </SettingRow>
      <SettingRow label="Auto-Start Rest Timer" sublabel="Starts timer after logging a set">
        <Toggle value={settings.workout_rest_timer_auto_start} onChange={v => updateSetting('workout_rest_timer_auto_start', v)} />
      </SettingRow>
      <SettingRow label="Default Set Count">
        <Stepper value={settings.workout_default_set_count || 3} onChange={v => updateSetting('workout_default_set_count', v)} min={1} max={10} />
      </SettingRow>
      <SettingRow label="Default Rep Range Min">
        <Stepper value={settings.workout_default_rep_range_min || 8} onChange={v => updateSetting('workout_default_rep_range_min', v)} min={1} max={50} />
      </SettingRow>
      <SettingRow label="Default Rep Range Max">
        <Stepper value={settings.workout_default_rep_range_max || 12} onChange={v => updateSetting('workout_default_rep_range_max', v)} min={1} max={50} />
      </SettingRow>
      <SettingRow label="Show Previous Performance" sublabel="Ghost text during workout logging">
        <Toggle value={settings.workout_show_previous_performance} onChange={v => updateSetting('workout_show_previous_performance', v)} />
      </SettingRow>

      <SectionHeader title="Progression" />
      <SettingRow label="Auto Progression" sublabel="Suggest weight increases each session">
        <Toggle value={settings.workout_auto_progression} onChange={v => updateSetting('workout_auto_progression', v)} />
      </SettingRow>
      {settings.workout_auto_progression && (
        <SettingRow label="Increment per Session" sublabel="kg to add">
          <Stepper value={settings.workout_progression_increment || 2.5} onChange={v => updateSetting('workout_progression_increment', v)} min={0.5} max={10} step={0.5} />
        </SettingRow>
      )}

      <SectionHeader title="Equipment" />
      <SettingRow label="Plate Calculator" sublabel="Show in workout logger">
        <Toggle value={settings.workout_plate_calculator_enabled} onChange={v => updateSetting('workout_plate_calculator_enabled', v)} />
      </SettingRow>
      <SettingRow label="Bar Weight" sublabel="Subtracted in plate calculator">
        <Stepper value={settings.workout_bar_weight || 20} onChange={v => updateSetting('workout_bar_weight', v)} min={10} max={60} step={0.5} />
      </SettingRow>

      <SectionHeader title="Dashboard Display" />
      <SettingRow label="Volume Calculation">
        <Segmented
          options={[{ label: 'All Sets', value: 'all_sets' }, { label: 'Working Only', value: 'working_sets_only' }]}
          value={settings.workout_volume_method}
          onChange={v => updateSetting('workout_volume_method', v)}
        />
      </SettingRow>
      <SettingRow label="Show Latest PR Section">
        <Toggle value={settings.workout_show_pr_section} onChange={v => updateSetting('workout_show_pr_section', v)} />
      </SettingRow>
      <SettingRow label="Show SBD Total Section">
        <Toggle value={settings.workout_show_sbd_section} onChange={v => updateSetting('workout_show_sbd_section', v)} />
      </SettingRow>

      <SectionHeader title="SBD Manual Override" subtitle="Override auto-calculated values with competition or tested maxes" />
      {hasOverride && <InfoRow text="⚠️ Manual override active — values below replace auto-calculated SBD totals" />}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          { key: 'workout_sbd_squat_override', label: 'Squat' },
          { key: 'workout_sbd_bench_override', label: 'Bench' },
          { key: 'workout_sbd_deadlift_override', label: 'Deadlift' },
        ].map(({ key, label }) => (
          <div key={key} className="text-center">
            <p className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(229,229,231,0.45)', fontFamily: 'Montserrat, sans-serif' }}>{label}</p>
            <div className="relative">
              <input
                type="number"
                value={settings[key] ?? ''}
                onChange={e => updateSetting(key, e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="auto"
                className="w-full text-center text-sm px-2 py-2 rounded-xl outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: settings[key] != null ? '0.5px solid rgba(212,175,55,0.4)' : '0.5px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}
              />
              {settings[key] != null && (
                <button onClick={() => updateSetting(key, null)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center"
                  style={{ background: 'rgba(255,60,60,0.5)', color: '#fff' }}>×</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}