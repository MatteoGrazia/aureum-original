import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Global step state for cross-component communication
let globalStepCount = 0;
let globalListeners = [];

const notifyListeners = (steps) => {
  globalListeners.forEach(callback => callback(steps));
};

export const subscribeToSteps = (callback) => {
  globalListeners.push(callback);
  callback(globalStepCount);
  return () => {
    globalListeners = globalListeners.filter(cb => cb !== callback);
  };
};

export const getGlobalStepCount = () => globalStepCount;

// Request iOS DeviceMotion permission (must be called from user gesture)
export const requestMotionPermission = async () => {
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const result = await DeviceMotionEvent.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }
  // Android / desktop — no explicit permission needed
  return true;
};

export const useStepTracker = () => {
  const [steps, setSteps] = useState(() => {
    // Load today's persisted steps immediately
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`steps_${today}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.steps || 0;
      } catch { return 0; }
    }
    return 0;
  });
  const [isTracking, setIsTracking] = useState(false);
  const [sensorStatus, setSensorStatus] = useState('idle'); // idle | calibrating | active | error

  const accelRef = useRef([0, 0, 0]);
  const magnitudeBufferRef = useRef([]);
  const stepCounterRef = useRef(globalStepCount);
  const lastStepTimeRef = useRef(0);
  const calibrationCounterRef = useRef(0);
  const motionListenerRef = useRef(null);
  const sensorRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const isTrackingRef = useRef(false);

  const MIN_STEP_INTERVAL = 500; // ms — stricter to avoid double/triple counting
  const BUFFER_SIZE = 60;
  const CALIBRATION_SAMPLES = 150;

  const lowPassFilter = (accel) => {
    const alpha = 0.2;
    accelRef.current[0] = accelRef.current[0] * (1 - alpha) + accel.x * alpha;
    accelRef.current[1] = accelRef.current[1] * (1 - alpha) + accel.y * alpha;
    accelRef.current[2] = accelRef.current[2] * (1 - alpha) + accel.z * alpha;
    return accelRef.current;
  };

  const calculateMagnitude = (a) => Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);

  const shouldCountStep = (magnitude) => {
    const now = Date.now();
    if (now - lastStepTimeRef.current < MIN_STEP_INTERVAL) return false;

    magnitudeBufferRef.current.push(magnitude);
    if (magnitudeBufferRef.current.length > BUFFER_SIZE) magnitudeBufferRef.current.shift();
    if (magnitudeBufferRef.current.length < 10) return false;

    const mean = magnitudeBufferRef.current.reduce((a, b) => a + b) / magnitudeBufferRef.current.length;
    const stdDev = Math.sqrt(
      magnitudeBufferRef.current.reduce((s, v) => s + (v - mean) ** 2, 0) / magnitudeBufferRef.current.length
    );
    const threshold = mean + stdDev * 1.2;
    return magnitude > threshold && magnitude > 10;
  };

  const saveStepData = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`steps_${today}`, JSON.stringify({ date: today, steps: globalStepCount, timestamp: Date.now() }));
  };

  const syncStepsToBackend = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (globalStepCount === 0) return;
    try {
      const activities = await base44.entities.DailyActivity.filter({ date: today });
      const caloriesBurned = Math.round(globalStepCount * 0.04);
      const activeMinutes = Math.round(globalStepCount / 100);
      if (activities.length > 0) {
        await base44.entities.DailyActivity.update(activities[0].id, {
          steps: globalStepCount,
          calories_burned: caloriesBurned,
          active_minutes: activeMinutes
        });
      } else {
        await base44.entities.DailyActivity.create({
          date: today,
          steps: globalStepCount,
          calories_burned: caloriesBurned,
          active_minutes: activeMinutes,
          sedentary_minutes: 0,
          water_liters: 0
        });
      }
    } catch {
      // ignore offline errors
    }
  };

  const processAcceleration = (accel) => {
    if (!isTrackingRef.current) return;
    if (!accel || (accel.x === null && accel.y === null && accel.z === null)) return;

    const x = accel.x || 0, y = accel.y || 0, z = accel.z || 0;
    if (x === 0 && y === 0 && z === 0) return;

    const filtered = lowPassFilter({ x, y, z });
    const magnitude = calculateMagnitude(filtered);

    // Calibration phase
    if (calibrationCounterRef.current < CALIBRATION_SAMPLES) {
      magnitudeBufferRef.current.push(magnitude);
      if (magnitudeBufferRef.current.length > BUFFER_SIZE) magnitudeBufferRef.current.shift();
      calibrationCounterRef.current++;
      if (calibrationCounterRef.current === CALIBRATION_SAMPLES) {
        setSensorStatus('active');
      }
      return;
    }

    if (shouldCountStep(magnitude)) {
      stepCounterRef.current++;
      lastStepTimeRef.current = Date.now();
      globalStepCount = stepCounterRef.current;
      setSteps(stepCounterRef.current);
      notifyListeners(stepCounterRef.current);
      if (stepCounterRef.current % 10 === 0) saveStepData();
    }
  };

  const startTracking = () => {
    if (isTrackingRef.current) return;
    isTrackingRef.current = true;
    setIsTracking(true);
    setSensorStatus('calibrating');
    calibrationCounterRef.current = 0;

    // Try modern Accelerometer API first (better on Android)
    if ('Accelerometer' in window) {
      try {
        sensorRef.current = new Accelerometer({ frequency: 60 });
        sensorRef.current.addEventListener('reading', () => {
          processAcceleration({ x: sensorRef.current.x, y: sensorRef.current.y, z: sensorRef.current.z });
        });
        sensorRef.current.addEventListener('error', () => {
          // fallback to DeviceMotion
          sensorRef.current = null;
          attachDeviceMotion();
        });
        sensorRef.current.start();
        return;
      } catch {
        // fall through
      }
    }
    attachDeviceMotion();
  };

  const attachDeviceMotion = () => {
    const handler = (e) => processAcceleration(e.acceleration || e.accelerationIncludingGravity);
    motionListenerRef.current = handler;
    window.addEventListener('devicemotion', handler);
  };

  const stopTracking = () => {
    isTrackingRef.current = false;
    setIsTracking(false);
    setSensorStatus('idle');

    if (sensorRef.current) { sensorRef.current.stop(); sensorRef.current = null; }
    if (motionListenerRef.current) {
      window.removeEventListener('devicemotion', motionListenerRef.current);
      motionListenerRef.current = null;
    }
    if (syncIntervalRef.current) { clearInterval(syncIntervalRef.current); syncIntervalRef.current = null; }
    syncStepsToBackend();
    saveStepData();
  };

  const resetSteps = () => {
    stepCounterRef.current = 0;
    globalStepCount = 0;
    setSteps(0);
    magnitudeBufferRef.current = [];
    calibrationCounterRef.current = 0;
    notifyListeners(0);
    localStorage.removeItem(`steps_${new Date().toISOString().split('T')[0]}`);
  };

  // On mount: restore persisted steps, set up backend sync interval
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`steps_${today}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const count = data.steps || 0;
        globalStepCount = count;
        stepCounterRef.current = count;
        setSteps(count);
        notifyListeners(count);
      } catch { /* ignore */ }
    }
    return () => stopTracking();
  }, []);

  // Start backend sync interval when tracking
  useEffect(() => {
    if (isTracking) {
      syncIntervalRef.current = setInterval(syncStepsToBackend, 30000);
    } else {
      if (syncIntervalRef.current) { clearInterval(syncIntervalRef.current); syncIntervalRef.current = null; }
    }
    return () => { if (syncIntervalRef.current) clearInterval(syncIntervalRef.current); };
  }, [isTracking]);

  return { steps, isTracking, sensorStatus, startTracking, stopTracking, resetSteps };
};