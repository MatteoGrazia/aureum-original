import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { Html5Qrcode } from 'html5-qrcode';

export default function BarcodeScanner({ isOpen, onClose, onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode = null;

    const initScanner = async () => {
      try {
        setScanning(true);
        setError(null);

        html5QrCode = new Html5Qrcode("barcode-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 100 },
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            // Barcode scanned
            try {
              const response = await fetch(
                `https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`
              );
              const data = await response.json();

              if (data.status === 1 && data.product) {
                const product = data.product;
                const food = {
                  name: product.product_name || 'Unknown Product',
                  brand: product.brands || '',
                  calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
                  protein: Math.round(product.nutriments?.proteins_100g || 0),
                  carbs: Math.round(product.nutriments?.carbohydrates_100g || 0),
                  fat: Math.round(product.nutriments?.fat_100g || 0),
                  fiber: Math.round(product.nutriments?.fiber_100g || 0),
                  serving_size: 100,
                  serving_unit: 'g',
                  barcode: decodedText
                };
                await html5QrCode.stop();
                onScan(food);
              } else {
                setError('Product not found in database');
              }
            } catch (err) {
              setError('Error looking up product');
            }
          },
          (errorMessage) => {
            // Scan error - ignore, keep scanning
          }
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
          onClick={onClose}
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

        {scanning && !error && (
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
      <div className="p-6">
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