import React from 'react';
import { SectionHeader, SettingRow, Toggle, Segmented, NumberInput, InfoRow, CardSelector } from './SettingsUI';
import { useTheme } from '@/components/shared/ThemeContext';

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', desc: '1–3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active', desc: '3–5 days/week' },
  { value: 'very_active', label: 'Very Active', desc: '6–7 days/week' },
  { value: 'extra_active', label: 'Extra Active', desc: 'Physical job + training' },
];

export default function SettingsProfileTab({ settings, updateSetting }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="space-y-1">
      <SectionHeader title="Personal Info" subtitle="Used for TDEE, macro, and progression calculations" />
      <SettingRow label="Date of Birth">
        <input
          type="date"
          value={settings.profile_dob || ''}
          onChange={e => updateSetting('profile_dob', e.target.value || null)}
          className="text-sm px-3 py-1.5 rounded-lg outline-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}
        />
      </SettingRow>
      <SettingRow label="Gender">
        <Segmented
          options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }, { label: 'N/A', value: 'prefer_not_to_say' }]}
          value={settings.profile_gender}
          onChange={v => updateSetting('profile_gender', v)}
        />
      </SettingRow>
      <SettingRow label="Height" sublabel="Stored in cm">
        <NumberInput value={settings.profile_height_cm} onChange={v => updateSetting('profile_height_cm', v)} unit="cm" min={50} max={300} placeholder="175" />
      </SettingRow>
      <SettingRow label="Current Weight" sublabel="Stored in kg">
        <NumberInput value={settings.profile_weight_kg} onChange={v => updateSetting('profile_weight_kg', v)} unit="kg" min={20} max={400} placeholder="75" />
      </SettingRow>
      <SettingRow label="Body Fat %" sublabel="Required for Katch-McArdle formula">
        <NumberInput value={settings.profile_body_fat_percentage} onChange={v => updateSetting('profile_body_fat_percentage', v)} unit="%" min={3} max={60} placeholder="15" />
      </SettingRow>

      <SectionHeader title="Fitness Context" />
      <p className="text-[10px] mb-1" style={{ color: 'rgba(229,229,231,0.4)', fontFamily: 'Montserrat, sans-serif' }}>Activity Level (TDEE multiplier)</p>
      <div className="space-y-1.5 mt-1">
        {ACTIVITY_LEVELS.map(opt => (
          <button
            key={opt.value}
            onClick={() => updateSetting('profile_activity_level', opt.value)}
            className="w-full text-left px-3 py-2.5 rounded-xl transition-all"
            style={{
              background: settings.profile_activity_level === opt.value ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
              border: settings.profile_activity_level === opt.value ? '0.5px solid rgba(212,175,55,0.45)' : '0.5px solid rgba(255,255,255,0.07)',
            }}
          >
            <span className="text-sm" style={{ color: settings.profile_activity_level === opt.value ? '#D4AF37' : '#E5E5E7', fontFamily: 'Montserrat, sans-serif' }}>{opt.label}</span>
            <span className="text-[9px] ml-2" style={{ color: 'rgba(229,229,231,0.35)', fontFamily: 'Montserrat, sans-serif' }}>{opt.desc}</span>
          </button>
        ))}
      </div>

      <p className="text-[10px] mt-4 mb-1" style={{ color: 'rgba(229,229,231,0.4)', fontFamily: 'Montserrat, sans-serif' }}>Fitness Goal</p>
      <CardSelector
        options={[
          { value: 'lose_fat', label: 'Lose Fat', icon: '🔥' },
          { value: 'build_muscle', label: 'Build Muscle', icon: '💪' },
          { value: 'maintain', label: 'Maintain', icon: '⚖️' },
          { value: 'improve_endurance', label: 'Endurance', icon: '🏃' },
          { value: 'general_fitness', label: 'General', icon: '🎯' },
        ]}
        value={settings.profile_fitness_goal}
        onChange={v => updateSetting('profile_fitness_goal', v)}
        columns={3}
      />

      <SettingRow label="Experience Level" >
        <Segmented
          options={[{ label: 'Beginner', value: 'beginner' }, { label: 'Inter.', value: 'intermediate' }, { label: 'Advanced', value: 'advanced' }, { label: 'Elite', value: 'elite' }]}
          value={settings.profile_experience_level}
          onChange={v => updateSetting('profile_experience_level', v)}
        />
      </SettingRow>

      <SectionHeader title="Tracking Preferences" />
      <SettingRow label="Measurement Frequency" sublabel="Reminder to log weight & measurements">
        <Segmented
          options={[{ label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Biweekly', value: 'biweekly' }, { label: 'Monthly', value: 'monthly' }]}
          value={settings.profile_measurement_frequency}
          onChange={v => updateSetting('profile_measurement_frequency', v)}
        />
      </SettingRow>

      <SectionHeader title="App Preferences" />
      <SettingRow label="Theme">
        <Segmented
          options={[{ label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }]}
          value={isDarkMode ? 'dark' : 'light'}
          onChange={v => {
            updateSetting('profile_theme', v);
            if ((v === 'dark') !== isDarkMode) toggleTheme();
          }}
        />
      </SettingRow>
      <SettingRow label="Language">
        <Segmented
          options={[{ label: 'EN', value: 'en' }, { label: 'FR', value: 'fr' }, { label: 'DE', value: 'de' }, { label: 'ES', value: 'es' }]}
          value={settings.profile_language}
          onChange={v => updateSetting('profile_language', v)}
        />
      </SettingRow>
      <SettingRow label="Timezone">
        <select
          value={settings.profile_timezone || 'UTC'}
          onChange={e => updateSetting('profile_timezone', e.target.value)}
          className="text-xs px-2 py-1.5 rounded-lg outline-none max-w-[160px]"
          style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}
        >
          {['UTC','Europe/Brussels','Europe/London','Europe/Paris','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Asia/Tokyo','Asia/Singapore','Australia/Sydney'].map(tz => (
            <option key={tz} value={tz} style={{ background: '#1a1a1a' }}>{tz}</option>
          ))}
        </select>
      </SettingRow>
    </div>
  );
}