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

export const useStepTracker = () => {
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [sensorStatus, setSensorStatus] = useState('idle'); // idle, calibrating, active, error
  
  const accelRef = useRef([0, 0, 0]);
  const magnitudeBufferRef = useRef([]);
  const stepCounterRef = useRef(0);
  const lastStepTimeRef = useRef(0);
  const calibrationCounterRef = useRef(0);
  const zeroReadingCounterRef = useRef(0);
  const motionEventRef = useRef(null);
  const sensorRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const isTrackingRef = useRef(false); // ref to avoid stale closure in event handler

  const MIN_STEP_INTERVAL = 300; // ms - minimum time between steps
  const BUFFER_SIZE = 50; // samples for moving average
  const CALIBRATION_SAMPLES = 200;
  const ZERO_READING_THRESHOLD = 100; // triggers recalibration warning

  // Low-pass filter (5Hz cutoff for ~100Hz sampling)
  const lowPassFilter = (acceleration) => {
    const alpha = 0.2; // Filter coefficient for 5Hz cutoff at 100Hz sampling
    accelRef.current[0] = accelRef.current[0] * (1 - alpha) + acceleration.x * alpha;
    accelRef.current[1] = accelRef.current[1] * (1 - alpha) + acceleration.y * alpha;
    accelRef.current[2] = accelRef.current[2] * (1 - alpha) + acceleration.z * alpha;
    return accelRef.current;
  };

  // Calculate magnitude of acceleration vector
  const calculateMagnitude = (accel) => {
    return Math.sqrt(accel[0] ** 2 + accel[1] ** 2 + accel[2] ** 2);
  };

  // Dynamic thresholding with moving average
  const shouldCountStep = (magnitude) => {
    const now = Date.now();
    
    // Enforce minimum step interval
    if (now - lastStepTimeRef.current < MIN_STEP_INTERVAL) {
      return false;
    }

    magnitudeBufferRef.current.push(magnitude);
    if (magnitudeBufferRef.current.length > BUFFER_SIZE) {
      magnitudeBufferRef.current.shift();
    }

    // Need enough samples for meaningful average
    if (magnitudeBufferRef.current.length < 10) {
      return false;
    }

    const mean = magnitudeBufferRef.current.reduce((a, b) => a + b) / magnitudeBufferRef.current.length;
    const variance = magnitudeBufferRef.current.reduce((sum, val) => sum + (val - mean) ** 2, 0) / magnitudeBufferRef.current.length;
    const stdDev = Math.sqrt(variance);

    // Step detected when magnitude exceeds mean + 1.5 standard deviations
    const threshold = mean + stdDev * 1.5;
    
    return magnitude > threshold && magnitude > 15; // Also enforce minimum magnitude
  };

  // Save step data to localStorage for persistence
  const saveStepData = () => {
    const today = new Date().toISOString().split('T')[0];
    const data = {
      date: today,
      steps: globalStepCount,
      timestamp: Date.now()
    };
    localStorage.setItem(`steps_${today}`, JSON.stringify(data));
  };

  // Sync steps to backend periodically
  const syncStepsToBackend = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (globalStepCount === 0) return;

    try {
      const activities = await base44.entities.DailyActivity.filter({ date: today });
      if (activities.length > 0) {
        await base44.entities.DailyActivity.update(activities[0].id, {
          steps: globalStepCount
        });
      } else {
        await base44.entities.DailyActivity.create({
          date: today,
          steps: globalStepCount,
          active_minutes: 0,
          sedentary_minutes: 0,
          calories_burned: 0,
          water_liters: 0
        });
      }
    } catch (err) {
      console.log('Backend sync skipped (offline or error)');
    }
  };

  // Handle motion events
  const handleMotionEvent = (event) => {
    if (!isTracking) return;

    const { acceleration } = event;
    if (!acceleration) return;

    // Check for zero readings (sensor issue)
    if (acceleration.x === 0 && acceleration.y === 0 && acceleration.z === 0) {
      zeroReadingCounterRef.current++;
      if (zeroReadingCounterRef.current > ZERO_READING_THRESHOLD) {
        setSensorStatus('error');
      }
      return;
    }

    zeroReadingCounterRef.current = 0;

    // Apply low-pass filter
    const filteredAccel = lowPassFilter(acceleration);
    const magnitude = calculateMagnitude(filteredAccel);

    // Calibration phase
    if (calibrationCounterRef.current < CALIBRATION_SAMPLES) {
      magnitudeBufferRef.current.push(magnitude);
      if (magnitudeBufferRef.current.length > BUFFER_SIZE) {
        magnitudeBufferRef.current.shift();
      }
      calibrationCounterRef.current++;
      
      if (calibrationCounterRef.current === CALIBRATION_SAMPLES) {
        setSensorStatus('active');
      }
      return;
    }

    // Step detection
    if (shouldCountStep(magnitude)) {
      stepCounterRef.current++;
      lastStepTimeRef.current = Date.now();

      // Update global state every 5 steps for efficiency
      if (stepCounterRef.current % 5 === 0) {
        globalStepCount = stepCounterRef.current;
        setSteps(stepCounterRef.current);
        notifyListeners(stepCounterRef.current);
        saveStepData();
      }
    }
  };

  // Request device motion permission (iOS 13+)
  const requestPermission = async () => {
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) {
        const permission = await DeviceMotionEvent.requestPermission();
        return permission === 'granted';
      }
      // Non-iOS devices allow by default
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  };

  const startTracking = async (skipPermissionRequest = false) => {
    // Skip second permission request if already granted via modal
    if (!skipPermissionRequest) {
      const permitted = await requestPermission();
      if (!permitted) {
        setSensorStatus('error');
        return;
      }
    }

    setSensorStatus('calibrating');
    setIsTracking(true);

    // Try modern Sensor API first (better background support on Android)
    if ('Accelerometer' in window) {
      try {
        sensorRef.current = new Accelerometer({ frequency: 100 });
        sensorRef.current.addEventListener('reading', () => {
          const accel = {
            x: sensorRef.current.x,
            y: sensorRef.current.y,
            z: sensorRef.current.z
          };
          handleMotionEvent({ acceleration: accel });
        });
        sensorRef.current.start();
        console.log('Using Sensor API for background tracking');
      } catch (err) {
        console.log('Sensor API unavailable, using DeviceMotion');
        startDeviceMotionTracking();
      }
    } else {
      startDeviceMotionTracking();
    }

    // Sync to backend every 60 seconds while tracking
    syncIntervalRef.current = setInterval(syncStepsToBackend, 60000);
  };

  const startDeviceMotionTracking = () => {
    motionEventRef.current = (event) => handleMotionEvent(event);
    window.addEventListener('devicemotion', motionEventRef.current, true);
  };

  const stopTracking = () => {
    setIsTracking(false);
    setSensorStatus('idle');

    if (sensorRef.current) {
      sensorRef.current.stop();
      sensorRef.current = null;
    }

    if (motionEventRef.current) {
      window.removeEventListener('devicemotion', motionEventRef.current, true);
      motionEventRef.current = null;
    }

    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    // Final sync
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

  useEffect(() => {
     // Load persisted steps on mount
     const today = new Date().toISOString().split('T')[0];
     const saved = localStorage.getItem(`steps_${today}`);
     if (saved) {
       const data = JSON.parse(saved);
       globalStepCount = data.steps;
       stepCounterRef.current = data.steps;
       setSteps(data.steps);
     }

     // Sync any pending steps when app reopens
     if (isTracking) {
       syncStepsToBackend();
     }

     return () => {
       stopTracking();
     };
   }, []);

  return {
    steps,
    isTracking,
    sensorStatus,
    startTracking,
    stopTracking,
    resetSteps
  };
};