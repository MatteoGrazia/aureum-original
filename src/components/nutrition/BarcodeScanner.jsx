import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, CheckCircle, AlertCircle, Edit3 } from 'lucide-react';
import MacroMicroBar from './MacroMicroBar';
import { Html5Qrcode } from 'html5-qrcode';
import { base44 } from '@/api/base44Client';

const GOLD = '#D4AF37';

export default function BarcodeScanner({ isOpen, onClose, onScan }) {
  const [status, setStatus] = useState('scanning'); // scanning | looking_up | found | not_found
  const [foundProduct, setFoundProduct] = useState(null);
  const [manualFood, setManualFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
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

  const handleQuickAdd = () => {
    if (!foundProduct) return;
    onScan({
      name: foundProduct.name,
      brand: foundProduct.brand,
      barcode: foundProduct.barcode,
      source: 'openfoodfacts',
      availableUnits: [{
        servingDescription: '100g',
        unit: 'g',
        amount: 100,
        metricUnit: 'g',
        calories: foundProduct.calories_100g,
        protein: foundProduct.protein_100g,
        carbs: foundProduct.carbs_100g,
        fat: foundProduct.fat_100g,
        fiber: foundProduct.fiber_100g || 0,
        isDefault: true
      }]
    });
  };

  const handleManualAdd = () => {
    onScan({
      name: manualFood.name || 'Custom Food',
      source: 'manual',
      availableUnits: [{
        servingDescription: '100g',
        unit: 'g',
        amount: 100,
        metricUnit: 'g',
        calories: parseFloat(manualFood.calories) || 0,
        protein: parseFloat(manualFood.protein) || 0,
        carbs: parseFloat(manualFood.carbs) || 0,
        fat: parseFloat(manualFood.fat) || 0,
        fiber: 0,
        isDefault: true
      }]
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    setStatus('scanning');
    setFoundProduct(null);
    setError(null);
    isProcessingRef.current = false;

    let html5QrCode = null;

    const initScanner = async () => {
      try {
        // Clear any leftover DOM/stream state from previous session
        const el = document.getElementById("barcode-reader");
        if (el) el.innerHTML = '';

        html5QrCode = new Html5Qrcode("barcode-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 100 }, aspectRatio: 1.0 },
          async (decodedText) => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            setStatus('looking_up');
            setError(null);

            try {
              await html5QrCode.stop();
              scannerRef.current = null;

              // 1. Try Open Food Facts (free, no key)
              const offResponse = await base44.functions.invoke('openFoodFactsSearch', { barcode: decodedText });

              if (offResponse.data?.found && offResponse.data?.product) {
                if (navigator.vibrate) navigator.vibrate(200);
                setFoundProduct({ ...offResponse.data.product, barcode: decodedText });
                setStatus('found');
                return;
              }

              // 2. Fallback: FatSecret
              try {
                const fatResponse = await base44.functions.invoke('fatsecretSearch', {
                  action: 'barcode',
                  barcode: decodedText
                });
                if (fatResponse.data?.food) {
                  if (navigator.vibrate) navigator.vibrate(200);
                  onScan({ ...fatResponse.data.food, barcode: decodedText, source: 'fatsecret' });
                  return;
                }
              } catch {}

              // 3. Nothing found → manual entry
              setStatus('not_found');

            } catch (err) {
              console.error('Barcode lookup error:', err);
              setError('Lookup failed. Please try again.');
              isProcessingRef.current = false;
              setStatus('scanning');
            }
          },
          () => {}
        );
      } catch (err) {
        console.error('Scanner init error:', err);
        setError('Could not access camera. Please check permissions.');
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isCameraView = status === 'scanning' || status === 'looking_up' || status === 'found';
  const isManualView = status === 'not_found' || status === 'editing';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[100] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-6">
        <h2
          className="text-lg tracking-[0.2em] uppercase text-white"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
        >
          {(status === 'not_found' || status === 'editing') ? 'Manual Entry' : 'Scan Barcode'}
        </h2>
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Camera View */}
      {isCameraView && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-black"
            style={{ aspectRatio: '1' }}
          >
            <div id="barcode-reader" className="w-full h-full" style={{ background: 'transparent' }} />

            {/* Scanning Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border border-[#D4AF37]/30 rounded-2xl" />

              {/* Animated gold scan line */}
              <motion.div
                className="absolute left-6 right-6 h-[1.5px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                  boxShadow: `0 0 8px ${GOLD}, 0 0 16px rgba(212,175,55,0.4)`
                }}
                animate={{ top: ['20%', '80%', '20%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37] rounded-tl" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37] rounded-tr" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37] rounded-bl" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37] rounded-br" />
            </div>
          </div>

          {/* Status message */}
          <div className="mt-6 flex items-center gap-3 h-6">
            {status === 'looking_up' ? (
              <>
                <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
                <p className="text-white/50 text-sm">Looking up product...</p>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-[#D4AF37]" />
                <p className="text-white/50 text-sm">Position barcode within frame</p>
              </>
            )}
          </div>

          {error && <p className="mt-3 text-red-400 text-sm text-center">{error}</p>}
        </div>
      )}

      {/* Manual Entry Form */}
      {isManualView && (
        <div className="flex-1 p-5 overflow-y-auto">
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(212,175,55,0.25)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {status === 'not_found' && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <p className="text-white/50 text-sm">Product not found. Enter nutrition info manually.</p>
              </div>
            )}

            {[
              { key: 'name', label: 'Product Name', type: 'text', placeholder: 'e.g. Protein Bar' },
              { key: 'calories', label: 'Calories per 100g', type: 'number', placeholder: '0' },
              { key: 'protein', label: 'Protein (g) per 100g', type: 'number', placeholder: '0' },
              { key: 'carbs', label: 'Carbs (g) per 100g', type: 'number', placeholder: '0' },
              { key: 'fat', label: 'Fat (g) per 100g', type: 'number', placeholder: '0' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-white/40 text-xs mb-1.5 block uppercase tracking-wider">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={manualFood[key]}
                  onChange={e => setManualFood(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4AF37]/20 text-white"
                  style={{ fontFamily: 'Montserrat, sans-serif', minHeight: '48px' }}
                />
              </div>
            ))}

            <button
              onClick={handleManualAdd}
              className="w-full py-4 rounded-xl text-[#080808] uppercase tracking-wider text-sm"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%)',
                minHeight: '52px',
                marginTop: '8px'
              }}
            >
              Add to Diary
            </button>
          </div>
        </div>
      )}

      {/* Bottom Instructions (scanning only) */}
      {status === 'scanning' && (
        <div className="p-4 pb-6">
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(212,175,55,0.1)' }}
          >
            <Camera className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            <p className="text-white/40 text-xs">
              Point your camera at a product barcode to automatically look up nutrition info
            </p>
          </div>
        </div>
      )}

      {/* Found Product — Pearl Glass Bottom Sheet */}
      <AnimatePresence>
        {status === 'found' && foundProduct && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 p-4"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '0.5px solid rgba(212,175,55,0.4)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)'
              }}
            >
              {/* Product header */}
              <div className="flex gap-4 mb-4">
                {foundProduct.image ? (
                  <img
                    src={foundProduct.image}
                    alt={foundProduct.name}
                    className="w-20 h-20 rounded-xl object-contain flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(212,175,55,0.08)' }}
                  >
                    <Camera className="w-8 h-8 text-[#D4AF37]/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest">Product Found</span>
                  </div>
                  <p className="text-white text-base leading-snug" style={{ wordBreak: 'break-word' }}>
                    {foundProduct.name}
                  </p>
                  {foundProduct.brand && (
                    <p className="text-white/40 text-sm mt-0.5">{foundProduct.brand}</p>
                  )}
                </div>
              </div>

              {/* Macros per 100g */}
              <div className="grid grid-cols-4 gap-2 mb-1">
                {[
                  { label: 'kcal', value: foundProduct.calories_100g },
                  { label: 'prot.', value: `${foundProduct.protein_100g}g` },
                  { label: 'carbs', value: `${foundProduct.carbs_100g}g` },
                  { label: 'fat', value: `${foundProduct.fat_100g}g` },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="text-center py-2 px-1 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-[#D4AF37] text-sm">{value}</p>
                    <p className="text-white/40 text-[10px] uppercase">{label}</p>
                  </div>
                ))}
              </div>
              <MacroMicroBar
                protein={foundProduct.protein_100g || 0}
                carbs={foundProduct.carbs_100g || 0}
                fat={foundProduct.fat_100g || 0}
                className="mb-1"
              />
              <p className="text-white/25 text-[10px] text-center mb-4">per 100g</p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setManualFood({
                      name: foundProduct.name,
                      calories: String(foundProduct.calories_100g),
                      protein: String(foundProduct.protein_100g),
                      carbs: String(foundProduct.carbs_100g),
                      fat: String(foundProduct.fat_100g)
                    });
                    setStatus('editing');
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-white/60 text-sm uppercase tracking-wider"
                  style={{ border: '0.5px solid rgba(255,255,255,0.15)', minHeight: '48px' }}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={handleQuickAdd}
                  className="flex-1 py-3 rounded-xl text-[#080808] text-sm uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%)',
                    minHeight: '48px'
                  }}
                >
                  Quick Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}