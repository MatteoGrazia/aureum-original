import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Activity, ChevronRight, Sparkles } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';

export default function WelcomeModal({ onComplete }) {
  const [step, setStep] = useState(0);
  const [permissions, setPermissions] = useState({ camera: false, motion: false });

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, camera: true }));
    } catch (error) {
      console.log('Camera permission denied');
    }
    setStep(1);
  };

  const requestMotionPermission = async () => {
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const response = await DeviceMotionEvent.requestPermission();
        setPermissions(prev => ({ ...prev, motion: response === 'granted' }));
      } else {
        setPermissions(prev => ({ ...prev, motion: true }));
      }
    } catch (error) {
      console.log('Motion permission denied');
    }
    setStep(2);
  };

  const steps = [
    {
      icon: Camera,
      title: 'Camera Access',
      description: 'Enable camera to scan barcodes and take progress photos',
      action: requestCameraPermission,
      actionText: 'Allow Camera'
    },
    {
      icon: Activity,
      title: 'Motion Sensors',
      description: 'Track your steps and daily activity automatically',
      action: requestMotionPermission,
      actionText: 'Allow Motion'
    },
    {
      icon: Sparkles,
      title: 'You\'re All Set',
      description: 'Welcome to Aureum. Your premium fitness journey begins now.',
      action: onComplete,
      actionText: 'Enter Aureum'
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[#080808] z-50 flex items-center justify-center p-6"
    >
      <GlassCard className="w-full max-w-sm p-8 text-center" glow>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-3xl tracking-[0.3em] text-[#D4AF37]">AUREUM</h1>
            <p className="text-[10px] tracking-[0.2em] text-white/30 mt-1">PREMIUM FITNESS</p>
          </div>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center"
          >
            <Icon className="w-10 h-10 text-[#D4AF37]" strokeWidth={1} />
          </motion.div>

          {/* Content */}
          <div>
            <h2 className="text-xl text-white mb-2">{currentStep.title}</h2>
            <p className="text-white/50 text-sm">{currentStep.description}</p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'bg-[#D4AF37] w-6' : i < step ? 'bg-[#D4AF37]/50' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Action */}
          <GoldButton onClick={currentStep.action} className="w-full flex items-center justify-center gap-2">
            {currentStep.actionText}
            <ChevronRight className="w-4 h-4" />
          </GoldButton>

          {step < 2 && (
            <button
              onClick={() => setStep(step + 1)}
              className="text-white/30 text-xs hover:text-white/50 transition-colors"
            >
              Skip for now
            </button>
          )}
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}