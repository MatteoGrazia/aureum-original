import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';
import GoldButton from '@/components/ui/GoldButton';

export default function MotionPermissionModal({ onGrant, onDismiss }) {
  const handleGrant = async () => {
    try {
      // Request DeviceMotion and DeviceOrientation permissions
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === 'granted') {
          onGrant();
        } else {
          alert('Motion permission was denied. Step tracking will not work.');
          onDismiss();
        }
      } else if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          onGrant();
        } else {
          alert('Motion permission was denied. Step tracking will not work.');
          onDismiss();
        }
      } else {
        // No permission needed (Android or older browsers)
        onGrant();
      }
    } catch (error) {
      console.error('Permission error:', error);
      onDismiss();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md"
      >
        <VoidCard className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <h2 
              className="text-2xl text-white mb-3"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
            >
              Motion & Fitness
            </h2>
            <p className="text-white/60 text-sm mb-2">
              Aureum needs access to your device's motion sensors to automatically count your steps throughout the day.
            </p>
            <p className="text-white/40 text-xs">
              This enables always-on step tracking, even when the app is closed.
            </p>
          </div>

          <div className="space-y-3">
            <GoldButton
              onClick={handleGrant}
              className="w-full"
            >
              Enable Motion Tracking
            </GoldButton>
            
            <button
              onClick={onDismiss}
              className="w-full py-3 px-6 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-all"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
            >
              Not Now
            </button>
          </div>
        </VoidCard>
      </motion.div>
    </motion.div>
  );
}