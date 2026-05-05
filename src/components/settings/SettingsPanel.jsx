import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useUserSettings } from '@/lib/useUserSettings';
import SettingsHomeTab from './SettingsHomeTab';
import SettingsNutritionTab from './SettingsNutritionTab';
import SettingsWorkoutsTab from './SettingsWorkoutsTab';
import SettingsActivityTab from './SettingsActivityTab';
import SettingsCommunityTab from './SettingsCommunityTab';
import SettingsProfileTab from './SettingsProfileTab';

const GOLD = '#D4AF37';

const TABS = [
  { key: 'home',      label: 'Home' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'workouts',  label: 'Workouts' },
  { key: 'activity',  label: 'Activity' },
  { key: 'community', label: 'Community' },
  { key: 'profile',   label: 'Profile' },
];

// Deep-equal check for plain objects
function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every(k => JSON.stringify(a[k]) === JSON.stringify(b[k]));
}

// Unsaved changes guard modal
function UnsavedGuard({ onSave, onDiscard, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#141414', border: '0.5px solid rgba(212,175,55,0.25)' }}
      >
        <p className="text-base mb-1" style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif' }}>Unsaved changes</p>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(229,229,231,0.45)', fontFamily: 'Montserrat, sans-serif' }}>
          You have changes that have not been saved yet. What would you like to do?
        </p>
        <div className="space-y-2.5">
          <button
            onClick={onSave}
            className="w-full py-3.5 rounded-xl text-sm uppercase tracking-[0.12em] transition-all active:scale-[0.98]"
            style={{ background: GOLD, color: '#0a0a0a', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
          >
            Save and exit
          </button>
          <button
            onClick={onDiscard}
            className="w-full py-3.5 rounded-xl text-sm uppercase tracking-[0.12em] transition-all active:scale-[0.98]"
            style={{ background: 'transparent', border: `0.5px solid ${GOLD}`, color: GOLD, fontFamily: 'Montserrat, sans-serif' }}
          >
            Discard changes
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 text-sm transition-all"
            style={{ color: 'rgba(229,229,231,0.4)', fontFamily: 'Montserrat, sans-serif' }}
          >
            Keep editing
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SettingsPanel({ onClose, defaultTab = 'home' }) {
  const { settings, saveSettings, isLoading } = useUserSettings();

  // Pending local state — all changes accumulate here before save
  const [pending, setPending] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Guard state
  const [guard, setGuard] = useState(null); // { onConfirm, onDiscard }

  // When settings load, initialise pending & snapshot
  useEffect(() => {
    if (settings && !pending) {
      setPending({ ...settings });
      setSavedSnapshot({ ...settings });
    }
  }, [settings]);

  // Track unsaved whenever pending changes
  useEffect(() => {
    if (!pending || !savedSnapshot) return;
    setHasUnsaved(!shallowEqual(pending, savedSnapshot));
  }, [pending, savedSnapshot]);

  // updateSetting for tabs — only mutates local pending state
  const updateSetting = useCallback((key, value) => {
    setPending(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    if (!pending) return;
    await saveSettings(pending);
    setSavedSnapshot({ ...pending });
    setHasUnsaved(false);
    toast('Settings saved', {
      duration: 2000,
      style: {
        background: 'rgba(12,12,12,0.97)',
        border: '0.5px solid rgba(212,175,55,0.35)',
        color: GOLD,
        fontFamily: 'Montserrat, sans-serif',
        fontSize: 12,
      },
    });
  };

  // Attempt to close — guard if needed
  const tryClose = () => {
    if (hasUnsaved) {
      setGuard({
        onSave: async () => { setGuard(null); await handleSave(); onClose(); },
        onDiscard: () => { setGuard(null); onClose(); },
      });
    } else {
      onClose();
    }
  };

  // Attempt to switch tab — guard if needed
  const trySetTab = (key) => {
    if (key === activeTab) { setDropdownOpen(false); return; }
    if (hasUnsaved) {
      setGuard({
        onSave: async () => { setGuard(null); await handleSave(); setActiveTab(key); setDropdownOpen(false); },
        onDiscard: () => {
          setGuard(null);
          setPending({ ...savedSnapshot });
          setActiveTab(key);
          setDropdownOpen(false);
        },
      });
    } else {
      setActiveTab(key);
      setDropdownOpen(false);
    }
  };

  const activeLabel = TABS.find(t => t.key === activeTab)?.label || 'Home';

  const tabContent = pending && (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.15 }}
      >
        {activeTab === 'home'      && <SettingsHomeTab      settings={pending} updateSetting={updateSetting} />}
        {activeTab === 'nutrition' && <SettingsNutritionTab settings={pending} updateSetting={updateSetting} />}
        {activeTab === 'workouts'  && <SettingsWorkoutsTab  settings={pending} updateSetting={updateSetting} />}
        {activeTab === 'activity'  && <SettingsActivityTab  settings={pending} updateSetting={updateSetting} />}
        {activeTab === 'community' && <SettingsCommunityTab settings={pending} updateSetting={updateSetting} />}
        {activeTab === 'profile'   && <SettingsProfileTab   settings={pending} updateSetting={updateSetting} />}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={tryClose}
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
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
            style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <p className="text-[11px] uppercase tracking-[0.35em]" style={{ color: GOLD, fontFamily: 'Montserrat, sans-serif' }}>Settings</p>
              {hasUnsaved && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
                  style={{ color: GOLD, background: 'rgba(212,175,55,0.12)', border: '0.5px solid rgba(212,175,55,0.3)', fontFamily: 'Montserrat, sans-serif' }}
                >
                  Unsaved
                </motion.span>
              )}
            </div>
            <button onClick={tryClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </div>

          {/* ── Layout: sidebar on wide, dropdown on narrow ── */}
          <div className="flex flex-1 overflow-hidden min-h-0">

            {/* Desktop sidebar (md+) */}
            <div className="hidden md:flex flex-col flex-shrink-0 py-3 gap-0.5"
              style={{ width: 160, borderRight: '0.5px solid rgba(255,255,255,0.06)' }}>
              {TABS.map(tab => {
                const isActive = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    onClick={() => trySetTab(tab.key)}
                    className="flex items-center gap-3 px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] transition-all relative"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      color: isActive ? GOLD : 'rgba(229,229,231,0.4)',
                      background: isActive ? 'rgba(212,175,55,0.07)' : 'transparent',
                    }}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: GOLD }} />
                    )}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Right side: dropdown (mobile) + content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

              {/* Mobile dropdown selector */}
              <div className="md:hidden flex-shrink-0 px-4 py-2.5"
                style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all"
                  style={{
                    background: 'rgba(212,175,55,0.08)',
                    border: '0.5px solid rgba(212,175,55,0.25)',
                  }}
                >
                  <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: GOLD, fontFamily: 'Montserrat, sans-serif' }}>
                    {activeLabel}
                  </span>
                  <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4" style={{ color: GOLD }} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -6, scaleY: 0.92 }}
                      transition={{ duration: 0.16 }}
                      style={{
                        transformOrigin: 'top',
                        background: '#1A1A1A',
                        border: '0.5px solid rgba(212,175,55,0.2)',
                        borderRadius: 12,
                        marginTop: 6,
                        overflow: 'hidden',
                      }}
                    >
                      {TABS.map(tab => {
                        const isActive = tab.key === activeTab;
                        return (
                          <button
                            key={tab.key}
                            onClick={() => trySetTab(tab.key)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all relative"
                            style={{
                              borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                              background: isActive ? 'rgba(212,175,55,0.08)' : 'transparent',
                            }}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: GOLD }} />
                            )}
                            <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: isActive ? GOLD : 'rgba(229,229,231,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
                              {tab.label}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4">
                {isLoading || !pending ? (
                  <div className="flex justify-center py-16">
                    <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: GOLD }} />
                  </div>
                ) : tabContent}
              </div>

              {/* Save button */}
              <div className="flex-shrink-0 px-5 py-4" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={hasUnsaved ? handleSave : undefined}
                  disabled={!hasUnsaved}
                  className="w-full py-3.5 rounded-xl text-sm uppercase tracking-[0.15em] transition-all"
                  style={{
                    background: hasUnsaved ? GOLD : 'rgba(212,175,55,0.12)',
                    color: hasUnsaved ? '#0a0a0a' : 'rgba(212,175,55,0.3)',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    cursor: hasUnsaved ? 'pointer' : 'default',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Unsaved changes guard */}
      <AnimatePresence>
        {guard && (
          <UnsavedGuard
            onSave={guard.onSave}
            onDiscard={guard.onDiscard}
            onCancel={() => setGuard(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}