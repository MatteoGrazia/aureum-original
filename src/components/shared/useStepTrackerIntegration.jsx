import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { subscribeToSteps } from './useStepTracker';
import { toast } from 'sonner';

export const useStepTrackerIntegration = (selectedDate) => {
  const [pendingSync, setPendingSync] = useState(false);

  useEffect(() => {
    // Subscribe to global step changes
    const unsubscribe = subscribeToSteps(async (steps) => {
      if (steps > 0 && !pendingSync) {
        // Sync to database in batches (every 50 steps or 10 seconds)
        setPendingSync(true);
        setTimeout(async () => {
          try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const activities = await base44.entities.DailyActivity.filter({ date: dateStr });
            
            if (activities.length > 0) {
              await base44.entities.DailyActivity.update(activities[0].id, {
                steps: steps
              });
            } else {
              await base44.entities.DailyActivity.create({
                date: dateStr,
                steps: steps,
                active_minutes: 0,
                sedentary_minutes: 0,
                calories_burned: 0,
                water_liters: 0
              });
            }
            setPendingSync(false);
          } catch (error) {
            console.error('Failed to sync steps:', error);
            setPendingSync(false);
          }
        }, 10000); // Sync every 10 seconds
      }
    });

    // Listen for zero reading errors
    const handleSensorError = () => {
      toast.error('Step sensor not responding. Check Settings > Privacy > Motion & Fitness', {
        duration: 6000
      });
    };

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'STEP_SYNC') {
          // Update UI with synced data
          window.dispatchEvent(new CustomEvent('stepsSynced', { detail: event.data.data }));
        }
      });
    }

    return unsubscribe;
  }, [selectedDate, pendingSync]);
};

// Recalibration check utility
export const checkSensorCalibration = async () => {
  const today = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem(`sensor_calibrated_${today}`);
  
  if (!saved) {
    // First run of the day - perform calibration
    localStorage.setItem(`sensor_calibrated_${today}`, 'true');
    return true;
  }
  
  return false;
};

// Persistent background tracking wake lock
export const acquireWakeLock = async () => {
  if ('wakeLock' in navigator) {
    try {
      const wakeLock = await navigator.wakeLock.request('screen');
      return wakeLock;
    } catch (err) {
      console.warn('Wake lock failed:', err);
      return null;
    }
  }
  return null;
};

export const releaseWakeLock = (wakeLock) => {
  if (wakeLock) {
    wakeLock.release().catch(err => console.warn('Wake lock release failed:', err));
  }
};