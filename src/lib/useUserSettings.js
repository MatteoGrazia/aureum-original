import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

export const SETTINGS_DEFAULTS = {
  home_default_tab: 'today',
  home_show_motivational_quote: true,
  home_show_streak_banner: true,
  home_widget_order: ['nutrition', 'activity', 'workouts', 'sleep'],
  home_units_weight: 'kg',
  home_units_distance: 'km',
  nutrition_tdee_calculation_method: 'mifflin',
  nutrition_goal: 'maintain',
  nutrition_custom_calories: null,
  nutrition_calorie_deficit: 300,
  nutrition_calorie_surplus: 250,
  nutrition_macro_split_protein: 30,
  nutrition_macro_split_carbs: 45,
  nutrition_macro_split_fat: 25,
  nutrition_protein_per_kg: 2.0,
  nutrition_protein_target_method: 'per_kg',
  nutrition_meal_count: 3,
  nutrition_show_micronutrients: false,
  nutrition_water_goal_ml: 2500,
  nutrition_water_reminder_enabled: false,
  nutrition_water_reminder_interval_hours: 2,
  nutrition_diary_start_time: '06:00',
  nutrition_barcode_scanner_default_serving: 'serving',
  nutrition_show_calories_remaining: true,
  workout_weekly_goal: 5,
  workout_preferred_days: ['monday','tuesday','wednesday','thursday','friday'],
  workout_default_rest_timer: 90,
  workout_rest_timer_auto_start: true,
  workout_volume_method: 'all_sets',
  workout_show_pr_section: true,
  workout_show_sbd_section: true,
  workout_sbd_squat_override: null,
  workout_sbd_bench_override: null,
  workout_sbd_deadlift_override: null,
  workout_default_rep_range_min: 8,
  workout_default_rep_range_max: 12,
  workout_default_set_count: 3,
  workout_plate_calculator_enabled: true,
  workout_bar_weight: 20,
  workout_show_previous_performance: true,
  workout_progression_increment: 2.5,
  workout_auto_progression: false,
  activity_daily_steps_goal: 10000,
  activity_show_steps_on_home: true,
  activity_calorie_burn_method: 'auto',
  activity_manual_tdee_adjustment: null,
  activity_connect_healthkit: false,
  activity_connect_google_fit: false,
  activity_track_floors: true,
  activity_track_distance: true,
  activity_active_minutes_goal: 30,
  activity_count_workout_steps: true,
  activity_cardio_calories_in_nutrition: true,
  community_profile_visibility: 'public',
  community_show_workouts: true,
  community_show_body_stats: false,
  community_show_nutrition: false,
  community_allow_friend_requests: true,
  community_show_in_leaderboards: true,
  community_leaderboard_metric: 'volume',
  community_notifications_likes: true,
  community_notifications_comments: true,
  community_notifications_friend_requests: true,
  profile_dob: null,
  profile_gender: null,
  profile_height_cm: null,
  profile_weight_kg: null,
  profile_body_fat_percentage: null,
  profile_activity_level: 'moderately_active',
  profile_fitness_goal: 'build_muscle',
  profile_experience_level: 'intermediate',
  profile_measurement_frequency: 'weekly',
  profile_show_age: true,
  profile_timezone: 'UTC',
  profile_language: 'en',
  profile_theme: 'dark',
};

export function useUserSettings() {
  const queryClient = useQueryClient();
  const saveTimerRef = useRef(null);

  const { data: userSettingsRaw, isLoading } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      const records = await base44.entities.UserSettings.filter({ user_id: user.email });
      if (records.length > 0) return records[0];
      // Auto-create defaults
      const newRecord = await base44.entities.UserSettings.create({
        user_id: user.email,
        ...SETTINGS_DEFAULTS,
      });
      return newRecord;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Merge with defaults so any missing key always returns default
  const settings = { ...SETTINGS_DEFAULTS, ...(userSettingsRaw || {}) };

  const updateSetting = useCallback((key, value) => {
    // Just optimistic update in cache — no auto-save anymore
    queryClient.setQueryData(['userSettings'], (old) => ({
      ...old,
      [key]: value,
    }));
  }, [queryClient]);

  const saveSettings = useCallback(async (pendingValues) => {
    if (!userSettingsRaw?.id) return;
    await base44.entities.UserSettings.update(userSettingsRaw.id, pendingValues);
    queryClient.invalidateQueries(['userSettings']);
  }, [userSettingsRaw?.id, queryClient]);

  return { settings, updateSetting, saveSettings, isLoading, settingsId: userSettingsRaw?.id };
}