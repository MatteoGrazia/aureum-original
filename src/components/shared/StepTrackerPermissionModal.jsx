import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Smartphone, Activity } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';
import GoldButton from '@/components/ui/GoldButton';

export default function StepTrackerPermissionModal({ onRequestPermission, onDismiss }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState(null);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === 'granted') {
          onRequestPermission(true);
        } else {
          setError('Permission denied. Enable in Settings > [App] > Motion & Fitness');
        }
      } else {
        // Non-iOS/older devices
        onRequestPermission(true);
      }
    } catch (err) {
      setError('Failed to request permission. Try again.');
      console.error(err);
    }
    setIsRequesting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center p-4"
      >
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="w-full max-w-lg"
        >
          <VoidCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl text-white">Enable Step Tracking</h3>
            </div>

            <p className="text-white/70 mb-4 text-sm leading-relaxed">
              We need access to your device's motion sensors to accurately track your steps in the background. This uses minimal battery and only activates when you're exercising.
            </p>

            {/* Device Requirements */}
            <div className="bg-white/5 rounded-lg p-4 mb-4 border border-[#D4AF37]/10">
              <p className="text-white/60 text-xs font-semibold mb-2">Required Access:</p>
              <ul className="text-white/50 text-xs space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                  Device Motion & Accelerometer
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                  Background App Refresh (optional)
                </li>
              </ul>
            </div>

            {/* Privacy Note */}
            <div className="flex gap-2 mb-6 text-[11px] text-white/40">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Your step data stays on-device. We never access location, health records, or personal data.</p>
            </div>

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4 text-red-300 text-xs"
              >
                {error}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onDismiss}
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-[#D4AF37]/20 text-white text-sm hover:bg-white/10 transition-colors"
                disabled={isRequesting}
              >
                Maybe Later
              </button>
              <button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="flex-1 py-3 px-4 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37]/30 transition-colors disabled:opacity-50"
              >
                {isRequesting ? 'Requesting...' : 'Enable'}
              </button>
            </div>

            {/* Platform-Specific Instructions */}
            <details className="mt-4 cursor-pointer">
              <summary className="text-white/40 text-xs hover:text-white/60 transition-colors">
                Having issues? Tap for troubleshooting
              </summary>
              <div className="mt-3 text-[11px] text-white/40 space-y-2">
                <p><span className="text-white/60">iOS 13+:</span> Settings → [App] → Motion & Fitness → Enable</p>
                <p><span className="text-white/60">Android:</span> Settings → Apps → [App] → Permissions → Sensors</p>
                <p><span className="text-white/60">Web only:</span> Not available on non-mobile browsers</p>
              </div>
            </details>
          </VoidCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}