import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export function useStepCounter() {
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  
  const lastStepTime = useRef(0);
  const accelerationHistory = useRef([]);
  const stepCount = useRef(0);
  
  // Step detection algorithm
  const detectStep = (acceleration) => {
    const magnitude = Math.sqrt(
      acceleration.x ** 2 + 
      acceleration.y ** 2 + 
      acceleration.z ** 2
    );
    
    accelerationHistory.current.push(magnitude);
    if (accelerationHistory.current.length > 10) {
      accelerationHistory.current.shift();
    }
    
    // Calculate average
    const avg = accelerationHistory.current.reduce((a, b) => a + b, 0) / accelerationHistory.current.length;
    
    // Step detection: significant spike above average
    const threshold = avg + 2.5;
    const now = Date.now();
    
    if (magnitude > threshold && now - lastStepTime.current > 300) {
      lastStepTime.current = now;
      stepCount.current += 1;
      setSteps(stepCount.current);
      return true;
    }
    
    return false;
  };
  
  // Start tracking
  const startTracking = () => {
    if (typeof DeviceMotionEvent === 'undefined') {
      console.warn('DeviceMotionEvent not supported');
      return false;
    }
    
    const handleMotion = (event) => {
      if (event.accelerationIncludingGravity) {
        const acc = event.accelerationIncludingGravity;
        detectStep({
          x: acc.x || 0,
          y: acc.y || 0,
          z: acc.z || 0
        });
      }
    };
    
    window.addEventListener('devicemotion', handleMotion);
    setIsTracking(true);
    
    // Save steps to database every 60 seconds
    const saveInterval = setInterval(async () => {
      if (stepCount.current > 0) {
        try {
          const today = format(new Date(), 'yyyy-MM-dd');
          const activities = await base44.entities.DailyActivity.filter({ date: today });
          
          if (activities.length > 0) {
            const currentSteps = activities[0].steps || 0;
            const newTotal = currentSteps + stepCount.current;
            
            await base44.entities.DailyActivity.update(activities[0].id, {
              steps: newTotal,
              calories_burned: Math.round(newTotal * 0.04),
              active_minutes: Math.round(newTotal / 100)
            });
          } else {
            await base44.entities.DailyActivity.create({
              date: today,
              steps: stepCount.current,
              calories_burned: Math.round(stepCount.current * 0.04),
              active_minutes: Math.round(stepCount.current / 100),
              sedentary_minutes: 0,
              water_liters: 0
            });
          }
          
          stepCount.current = 0;
        } catch (error) {
          console.error('Error saving steps:', error);
        }
      }
    }, 60000);
    
    // Cleanup
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      clearInterval(saveInterval);
    };
  };
  
  return {
    steps,
    isTracking,
    startTracking
  };
}