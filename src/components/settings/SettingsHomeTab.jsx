import React from 'react';
import { SectionHeader, SettingRow, Toggle, Segmented } from './SettingsUI';

export default function SettingsHomeTab({ settings, updateSetting }) {
  const WIDGETS = ['nutrition', 'activity', 'workouts', 'sleep'];
  const order = settings.home_widget_order || WIDGETS;

  const moveWidget = (idx, dir) => {
    const next = [...order];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    updateSetting('home_widget_order', next);
  };

  return (
    <div className="space-y-1">
      <SectionHeader title="App Display" subtitle="General behaviour and dashboard preferences" />
      <SettingRow label="Default Dashboard View">
        <Segmented
          options={[{ label: 'Today', value: 'today' }, { label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }]}
          value={settings.home_default_tab}
          onChange={v => updateSetting('home_default_tab', v)}
        />
      </SettingRow>
      <SettingRow label="Show Motivational Quote" sublabel="Display daily quote block on Home">
        <Toggle value={settings.home_show_motivational_quote} onChange={v => updateSetting('home_show_motivational_quote', v)} />
      </SettingRow>
      <SettingRow label="Show Streak Banner" sublabel="Display streak counter on Home">
        <Toggle value={settings.home_show_streak_banner} onChange={v => updateSetting('home_show_streak_banner', v)} />
      </SettingRow>

      <SectionHeader title="Widget Order" subtitle="Drag to reorder sections on the Home page" />
      <div className="space-y-2 mt-2">
        {order.map((w, i) => (
          <div key={w} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <p className="text-sm capitalize" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif' }}>{w}</p>
            <div className="flex gap-1">
              <button onClick={() => moveWidget(i, -1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(229,229,231,0.5)' }} disabled={i === 0}>↑</button>
              <button onClick={() => moveWidget(i, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(229,229,231,0.5)' }} disabled={i === order.length - 1}>↓</button>
            </div>
          </div>
        ))}
      </div>

      <SectionHeader title="Units (Global)" subtitle="Affects weight and distance displays across the entire app" />
      <SettingRow label="Weight Unit">
        <Segmented
          options={[{ label: 'kg', value: 'kg' }, { label: 'lbs', value: 'lbs' }]}
          value={settings.home_units_weight}
          onChange={v => updateSetting('home_units_weight', v)}
        />
      </SettingRow>
      <SettingRow label="Distance Unit">
        <Segmented
          options={[{ label: 'km', value: 'km' }, { label: 'miles', value: 'miles' }]}
          value={settings.home_units_distance}
          onChange={v => updateSetting('home_units_distance', v)}
        />
      </SettingRow>
    </div>
  );
}