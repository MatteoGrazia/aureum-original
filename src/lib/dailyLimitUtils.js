import { base44 } from '@/api/base44Client';

const LIMIT = 30;

export function checkDailyLimit(settings, type) {
  const today = new Date().toISOString().split('T')[0];

  if (type === 'ai_scan') {
    const lastDate = settings?.daily_ai_usage?.ai_scan_date;
    const count = lastDate === today ? (settings?.daily_ai_usage?.ai_scan_count || 0) : 0;
    return { allowed: count < LIMIT, used: count, remaining: Math.max(0, LIMIT - count) };
  }

  if (type === 'voice') {
    const lastDate = settings?.daily_ai_usage?.voice_date;
    const count = lastDate === today ? (settings?.daily_ai_usage?.voice_count || 0) : 0;
    return { allowed: count < LIMIT, used: count, remaining: Math.max(0, LIMIT - count) };
  }

  return { allowed: true, used: 0, remaining: LIMIT };
}

export async function incrementUsage(settings, type) {
  if (!settings?.id) return;
  const today = new Date().toISOString().split('T')[0];
  const usage = settings.daily_ai_usage || {};

  if (type === 'ai_scan') {
    const isToday = usage.ai_scan_date === today;
    await base44.entities.UserSettings.update(settings.id, {
      daily_ai_usage: {
        ...usage,
        ai_scan_count: isToday ? (usage.ai_scan_count || 0) + 1 : 1,
        ai_scan_date: today,
      },
    });
  }

  if (type === 'voice') {
    const isToday = usage.voice_date === today;
    await base44.entities.UserSettings.update(settings.id, {
      daily_ai_usage: {
        ...usage,
        voice_count: isToday ? (usage.voice_count || 0) + 1 : 1,
        voice_date: today,
      },
    });
  }
}

export function timeUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`;
}