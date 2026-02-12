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

  const startTracking = async () => {
    const permitted = await requestPermission();
    if (!permitted) {
      setSensorStatus('error');
      return;
    }

    setSensorStatus('calibrating');
    setIsTracking(true);
    
    // Register service worker for background sync
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => 
        console.log('SW registration failed:', err)
      );
    }

    // Initialize motion listener
    motionEventRef.current = (event) => handleMotionEvent(event);
    window.addEventListener('devicemotion', motionEventRef.current, true);
  };

  const stopTracking = () => {
    setIsTracking(false);
    setSensorStatus('idle');
    
    if (motionEventRef.current) {
      window.removeEventListener('devicemotion', motionEventRef.current, true);
      motionEventRef.current = null;
    }

    // Save final count
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