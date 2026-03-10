import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { Html5Qrcode } from 'html5-qrcode';

export default function BarcodeScanner({ isOpen, onClose, onScan }) {
  const [scanning, setScanning] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const handleClose = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode = null;

    const initScanner = async () => {
      try {
        setScanning(true);
        setError(null);
        isProcessingRef.current = false;

        html5QrCode = new Html5Qrcode("barcode-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 100 }, aspectRatio: 1.0 },
          async (decodedText) => {
            // Lock to prevent duplicate calls for same scan
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            setLookingUp(true);
            setError(null);

            try {
              await html5QrCode.stop();
              const { base44 } = await import('@/api/base44Client');
              const response = await base44.functions.invoke('fatsecretSearch', {
                action: 'barcode',
                barcode: decodedText
              });

              if (response.data?.food) {
                // Pass full food object including availableUnits directly
                onScan({ ...response.data.food, barcode: decodedText, source: 'fatsecret' });
              } else {
                setError('Product not found in database. Try scanning again or search by name.');
                setLookingUp(false);
                isProcessingRef.current = false;
                // Restart scanner for retry
                await html5QrCode.start(
                  { facingMode: "environment" },
                  { fps: 10, qrbox: { width: 250, height: 100 }, aspectRatio: 1.0 },
                  async () => {}, () => {}
                );
              }
            } catch (err) {
              console.error('Barcode lookup error:', err);
              setError('Barcode was read but the product lookup failed. Please try again.');
              setLookingUp(false);
              isProcessingRef.current = false;
            }
          },
          () => {} // scan errors - ignore
        );
      } catch (err) {
        console.error('Scanner error:', err);
        setError('Could not access camera. Please ensure camera permissions are granted.');
        setScanning(false);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen, onScan]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg text-white">Scan Barcode</h2>
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-black">
          <div id="barcode-reader" className="w-full h-full" style={{ background: 'transparent' }} />
          
          {/* Scanning overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-2 border-[#D4AF37]/50 rounded-2xl" />
            <motion.div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
              animate={{ top: ['20%', '80%', '20%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>

        {lookingUp && (
          <div className="mt-6 flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
            <p className="text-white/50 text-sm">Looking up product...</p>
          </div>
        )}
        {scanning && !lookingUp && !error && (
          <div className="mt-6 flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
            <p className="text-white/50 text-sm">Position barcode within frame</p>
          </div>
        )}

        {error && (
          <GlassCard className="mt-6 p-4 max-w-sm">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </GlassCard>
        )}
      </div>

      {/* Instructions */}
      <div className="p-6 pb-32">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-[#D4AF37]" />
            <p className="text-white/50 text-sm">
              Point your camera at a product barcode to automatically look up nutrition info
            </p>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}