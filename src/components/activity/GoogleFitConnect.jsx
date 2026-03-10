import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, RefreshCw, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VoidCard from '@/components/ui/VoidCard';
import GoldButton from '@/components/ui/GoldButton';

export default function GoogleFitConnect({ isConnected, onSyncComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      // Call the function with action=init as query param
      const response = await fetch(`/api/googleFitSync?action=init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
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
      const response = await fetch(`/api/googleFitSync?action=sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setLastSyncTime(new Date());
        onSyncComplete?.();
      }
    } catch (error) {
      console.error('Failed to sync Google Fit data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <VoidCard className="text-center">
        <div className="mb-4">
          <div className="w-12 h-12 rounded-full bg-[#4285F4]/10 flex items-center justify-center mx-auto mb-3">
            <Smartphone className="w-6 h-6 text-[#4285F4]" />
          </div>
          <h3 className="text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
            {isConnected ? 'Google Fit Connected' : 'Connect Google Fit'}
          </h3>
          <p className="text-white/60 text-sm mb-4">
            {isConnected 
              ? 'Your step data is synced from Google Fit. Sync manually anytime to get the latest data.'
              : 'Sync your step data directly from your device via Google Fit to keep Aureum updated.'
            }
          </p>
          {lastSyncTime && (
            <p className="text-[#4285F4]/70 text-xs mb-4">
              Last synced: {lastSyncTime.toLocaleTimeString()}
            </p>
          )}
        </div>
        {isConnected ? (
          <GoldButton 
            onClick={handleSync} 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
            {isLoading ? 'Syncing...' : 'Sync Now'}
          </GoldButton>
        ) : (
          <GoldButton 
            onClick={handleConnect} 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
            {isLoading ? 'Connecting...' : 'Connect Google Fit'}
          </GoldButton>
        )}
      </VoidCard>
    </motion.div>
  );
}