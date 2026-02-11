import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function GyroGlow() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [hasGyro, setHasGyro] = useState(false);

  useEffect(() => {
    // Check if device motion is available
    if (window.DeviceOrientationEvent) {
      const handleOrientation = (event) => {
        if (event.gamma !== null && event.beta !== null) {
          setHasGyro(true);
          // gamma: left to right tilt (-90 to 90)
          // beta: front to back tilt (-180 to 180)
          const x = Math.max(0, Math.min(100, 50 + (event.gamma / 90) * 50));
          const y = Math.max(0, Math.min(100, 50 + (event.beta / 180) * 50));
          setPosition({ x, y });
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      
      // Fallback: if no gyro after 1 second, use touch
      const timeout = setTimeout(() => {
        if (!hasGyro) {
          window.addEventListener('touchmove', handleTouch);
        }
      }, 1000);

      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
        window.removeEventListener('touchmove', handleTouch);
        clearTimeout(timeout);
      };
    } else {
      // Fallback to touch
      window.addEventListener('touchmove', handleTouch);
      return () => window.removeEventListener('touchmove', handleTouch);
    }

    function handleTouch(event) {
      if (event.touches && event.touches[0]) {
        const touch = event.touches[0];
        const x = (touch.clientX / window.innerWidth) * 100;
        const y = (touch.clientY / window.innerHeight) * 100;
        setPosition({ x, y });
      }
    }
  }, [hasGyro]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute w-[800px] h-[800px]"
        animate={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 30
        }}
        style={{
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(212,175,55,0.02) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      
      {/* Secondary slower glow */}
      <motion.div
        className="absolute w-[600px] h-[600px]"
        animate={{
          left: `${100 - position.x}%`,
          top: `${100 - position.y}%`,
        }}
        transition={{
          type: "spring",
          stiffness: 30,
          damping: 40
        }}
        style={{
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(156,126,70,0.015) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
}