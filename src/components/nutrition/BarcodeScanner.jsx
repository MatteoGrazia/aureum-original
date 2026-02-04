import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Loader2, Keyboard } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import GoldButton from '@/components/ui/GoldButton';

export default function BarcodeScanner({ isOpen, onClose, onScan }) {
  const [manualBarcode, setManualBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('manual'); // 'manual' only for now

  const lookupBarcode = async (barcode) => {
    if (!barcode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
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
          barcode: barcode
        };
        onScan(food);
      } else {
        setError('Product not found. Try a different barcode.');
      }
    } catch (err) {
      setError('Error looking up product. Please try again.');
    }
    setLoading(false);
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      lookupBarcode(manualBarcode.trim());
    }
  };

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
        <h2 className="text-lg text-white">Barcode Lookup</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <GlassCard className="w-full max-w-sm p-6" glow>
          <div className="flex items-center gap-3 mb-6">
            <Keyboard className="w-6 h-6 text-[#D4AF37]" />
            <h3 className="text-white">Enter Barcode</h3>
          </div>

          <Input
            type="text"
            inputMode="numeric"
            placeholder="Enter barcode number..."
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            className="mb-4 text-center text-lg py-6 bg-white/5 border-[#D4AF37]/20"
          />

          {error && (
            <p className="text-red-400 text-sm text-center mb-4">{error}</p>
          )}

          <GoldButton
            onClick={handleManualSubmit}
            disabled={loading || !manualBarcode.trim()}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Looking up...
              </>
            ) : (
              'Look Up Product'
            )}
          </GoldButton>

          <p className="text-white/40 text-xs text-center mt-4">
            Enter the barcode number found on the product packaging
          </p>
        </GlassCard>
      </div>

      {/* Instructions */}
      <div className="p-6">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-[#D4AF37]" />
            <p className="text-white/50 text-sm">
              Enter the barcode number (usually found below the barcode lines) to look up nutrition info
            </p>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}