import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VoidCard from '@/components/ui/VoidCard';
import GoldButton from '@/components/ui/GoldButton';

export default function GoogleFitConnect({ isConnected, onSyncComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Auto-sync on mount if connected
  useEffect(() => {
    if (isConnected) {
      handleSync();
    }
  }, [isConnected]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const response = await base44.functions.invoke('googleFitSync', { action: 'init' });
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error('Failed to initiate Google Fit connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsLoading(true);
      const response = await base44.functions.invoke('googleFitSync', { action: 'sync' });
      console.log('Sync response:', response.data);
      if (response.data.success) {
        setLastSyncTime(new Date());
        onSyncComplete?.();
      } else {
        console.error('Sync failed:', response.data);
      }
    } catch (error) {
      console.error('Failed to sync Google Fit data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <VoidCard className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-3">
              <img 
                src="https://media.base44.com/images/public/698347d058d3014d6271ccff/71b7fb0a2_googlefitlogo.png" 
                alt="Google Fit"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
              Connect Google Fit
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Sync your step data directly from your device via Google Fit to keep Aureum updated.
            </p>
          </div>
          <GoldButton 
            onClick={handleConnect} 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            {isLoading ? 'Connecting...' : 'Connect Google Fit'}
          </GoldButton>
        </VoidCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <VoidCard className="text-center">
        <div className="w-16 h-16 mx-auto mb-3">
          <img 
            src="https://media.base44.com/images/public/698347d058d3014d6271ccff/71b7fb0a2_googlefitlogo.png" 
            alt="Google Fit"
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
          Google Fit Connected
        </h3>
        <p className="text-white/60 text-sm">
          Your step data is synced from Google Fit automatically.
        </p>
        {lastSyncTime && (
          <p className="text-[#4285F4]/70 text-xs mt-2">
            Last synced: {lastSyncTime.toLocaleTimeString()}
          </p>
        )}
      </VoidCard>
    </motion.div>
  );
}