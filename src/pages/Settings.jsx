import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Ruler, Droplets, Save } from 'lucide-react';
import VoidCard from '@/components/ui/VoidCard';
import GoldButton from '@/components/ui/GoldButton';

export default function Settings() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({});
      return profiles[0] || null;
    }
  });

  const [measurementSystem, setMeasurementSystem] = useState(profile?.measurement_system || 'metric');
  const [waterUnit, setWaterUnit] = useState(profile?.water_unit || 'liters');

  React.useEffect(() => {
    if (profile) {
      setMeasurementSystem(profile.measurement_system || 'metric');
      setWaterUnit(profile.water_unit || 'liters');
    }
  }, [profile]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          measurement_system: measurementSystem,
          water_unit: waterUnit
        });
      } else {
        await base44.entities.UserProfile.create({
          measurement_system: measurementSystem,
          water_unit: waterUnit,
          water_goal: 2.5,
          daily_step_goal: 10000
        });
      }
      queryClient.invalidateQueries(['userProfile']);
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const measurementOptions = [
    {
      id: 'metric',
      name: 'Metric (European)',
      description: 'kg, cm, L, °C',
      icon: '🇪🇺'
    },
    {
      id: 'imperial',
      name: 'Imperial (American)',
      description: 'lbs, ft/in, fl oz, °F',
      icon: '🇺🇸'
    },
    {
      id: 'uk',
      name: 'UK',
      description: 'stone, ft/in, pints, °C',
      icon: '🇬🇧'
    }
  ];

  const waterOptions = [
    {
      id: 'liters',
      name: 'Liters',
      description: 'Track water in liters (0.25L increments)'
    },
    {
      id: 'glasses',
      name: 'Glasses',
      description: 'Track water in 250ml glasses'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 pt-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-6 h-6 text-[#D4AF37]" strokeWidth={1} />
          <h1 
            className="text-2xl tracking-[0.3em] text-white uppercase"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
          >
            Settings
          </h1>
        </div>
        <p 
          className="text-[9px] text-[#9C7E46] uppercase tracking-[0.3em]"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
        >
          Customize your experience
        </p>
      </motion.div>

      <div className="space-y-6 max-w-2xl">
        {/* Measurement System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <VoidCard>
            <div className="flex items-center gap-3 mb-5">
              <Ruler className="w-5 h-5 text-[#9C7E46]" strokeWidth={1} />
              <h2 
                className="text-sm uppercase tracking-[0.3em] text-white"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
              >
                Measurement System
              </h2>
            </div>
            
            <div className="space-y-3">
              {measurementOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setMeasurementSystem(option.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    measurementSystem === option.id
                      ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                      : 'bg-white/5 border border-white/10 hover:border-[#D4AF37]/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{option.icon}</span>
                        <p className="text-white text-sm">{option.name}</p>
                      </div>
                      <p className="text-white/40 text-xs">{option.description}</p>
                    </div>
                    {measurementSystem === option.id && (
                      <div className="w-5 h-5 rounded-full bg-[#D4AF37] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#080808]" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </VoidCard>
        </motion.div>

        {/* Water Tracking Unit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <VoidCard>
            <div className="flex items-center gap-3 mb-5">
              <Droplets className="w-5 h-5 text-[#9C7E46]" strokeWidth={1} />
              <h2 
                className="text-sm uppercase tracking-[0.3em] text-white"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
              >
                Water Tracking
              </h2>
            </div>
            
            <div className="space-y-3">
              {waterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setWaterUnit(option.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    waterUnit === option.id
                      ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                      : 'bg-white/5 border border-white/10 hover:border-[#D4AF37]/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white text-sm mb-1">{option.name}</p>
                      <p className="text-white/40 text-xs">{option.description}</p>
                    </div>
                    {waterUnit === option.id && (
                      <div className="w-5 h-5 rounded-full bg-[#D4AF37] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#080808]" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </VoidCard>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GoldButton
            onClick={saveSettings}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-4"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}