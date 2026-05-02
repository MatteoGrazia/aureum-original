import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useUserSettings } from '@/lib/useUserSettings';
import SettingsHomeTab from './SettingsHomeTab';
import SettingsNutritionTab from './SettingsNutritionTab';
import SettingsWorkoutsTab from './SettingsWorkoutsTab';
import SettingsActivityTab from './SettingsActivityTab';
import SettingsCommunityTab from './SettingsCommunityTab';
import SettingsProfileTab from './SettingsProfileTab';

const GOLD = '#D4AF37';

const TABS = [
  { key: 'home', label: 'Home' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'workouts', label: 'Workouts' },
  { key: 'activity', label: 'Activity' },
  { key: 'community', label: 'Community' },
  { key: 'profile', label: 'Profile' },
];

export default function SettingsPanel({ onClose, defaultTab = 'home' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { settings, updateSetting, isLoading } = useUserSettings();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          background: '#0E0E0E',
          border: '0.5px solid rgba(212,175,55,0.18)',
          maxHeight: '92vh',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[11px] uppercase tracking-[0.35em]" style={{ color: GOLD, fontFamily: 'Montserrat, sans-serif' }}>Settings</p>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex-shrink-0 overflow-x-auto px-4 py-2"
          style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div className="flex gap-1 min-w-max">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-[0.15em] transition-all whitespace-nowrap"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  background: activeTab === tab.key ? 'rgba(212,175,55,0.14)' : 'rgba(255,255,255,0.04)',
                  color: activeTab === tab.key ? GOLD : 'rgba(229,229,231,0.4)',
                  border: activeTab === tab.key ? '0.5px solid rgba(212,175,55,0.4)' : '0.5px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: GOLD }} />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'home' && <SettingsHomeTab settings={settings} updateSetting={updateSetting} />}
                {activeTab === 'nutrition' && <SettingsNutritionTab settings={settings} updateSetting={updateSetting} />}
                {activeTab === 'workouts' && <SettingsWorkoutsTab settings={settings} updateSetting={updateSetting} />}
                {activeTab === 'activity' && <SettingsActivityTab settings={settings} updateSetting={updateSetting} />}
                {activeTab === 'community' && <SettingsCommunityTab settings={settings} updateSetting={updateSetting} />}
                {activeTab === 'profile' && <SettingsProfileTab settings={settings} updateSetting={updateSetting} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}