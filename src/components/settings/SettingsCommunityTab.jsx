import React from 'react';
import { SectionHeader, SettingRow, Toggle, Segmented, InfoRow, CardSelector } from './SettingsUI';

export default function SettingsCommunityTab({ settings, updateSetting }) {
  return (
    <div className="space-y-1">
      <SectionHeader title="Profile Visibility" />
      <CardSelector
        options={[
          { value: 'public', label: 'Public 🌍', desc: 'Anyone can view your profile' },
          { value: 'friends', label: 'Friends Only 👥', desc: 'Only approved connections' },
          { value: 'private', label: 'Private 🔒', desc: 'Only visible to you' },
        ]}
        value={settings.community_profile_visibility}
        onChange={v => updateSetting('community_profile_visibility', v)}
        columns={3}
      />
      <SettingRow label="Allow Friend Requests" sublabel="If off, hides Add Friend button on your profile">
        <Toggle value={settings.community_allow_friend_requests} onChange={v => updateSetting('community_allow_friend_requests', v)} />
      </SettingRow>

      <SectionHeader title="What Others Can See" />
      <InfoRow text="These settings only apply when your profile is Public or Friends Only." />
      <SettingRow label="Show My Workouts">
        <Toggle value={settings.community_show_workouts} onChange={v => updateSetting('community_show_workouts', v)} />
      </SettingRow>
      <SettingRow label="Show Body Stats" sublabel="Weight and measurements">
        <Toggle value={settings.community_show_body_stats} onChange={v => updateSetting('community_show_body_stats', v)} />
      </SettingRow>
      <SettingRow label="Show Nutrition">
        <Toggle value={settings.community_show_nutrition} onChange={v => updateSetting('community_show_nutrition', v)} />
      </SettingRow>

      <SectionHeader title="Leaderboards" />
      <SettingRow label="Appear in Leaderboards">
        <Toggle value={settings.community_show_in_leaderboards} onChange={v => updateSetting('community_show_in_leaderboards', v)} />
      </SettingRow>
      {settings.community_show_in_leaderboards && (
        <SettingRow label="Leaderboard Metric">
          <Segmented
            options={[
              { label: 'Volume', value: 'volume' },
              { label: 'Streak', value: 'streak' },
              { label: 'Steps', value: 'steps' },
              { label: 'Workouts', value: 'workouts' },
            ]}
            value={settings.community_leaderboard_metric}
            onChange={v => updateSetting('community_leaderboard_metric', v)}
          />
        </SettingRow>
      )}

      <SectionHeader title="Notifications" />
      <SettingRow label="Likes on my posts">
        <Toggle value={settings.community_notifications_likes} onChange={v => updateSetting('community_notifications_likes', v)} />
      </SettingRow>
      <SettingRow label="Comments on my posts">
        <Toggle value={settings.community_notifications_comments} onChange={v => updateSetting('community_notifications_comments', v)} />
      </SettingRow>
      <SettingRow label="Friend requests">
        <Toggle value={settings.community_notifications_friend_requests} onChange={v => updateSetting('community_notifications_friend_requests', v)} />
      </SettingRow>
    </div>
  );
}