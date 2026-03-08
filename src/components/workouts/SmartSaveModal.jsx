import React from 'react';
import { motion } from 'framer-motion';
import { Save, Clock } from 'lucide-react';

export default function SmartSaveModal({ routineName, onUpdateTemplate, onSaveAsLog, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-end"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        className="w-full rounded-t-3xl p-6 pt-4"
        style={{
          background: 'rgba(14,14,14,0.99)',
          border: '0.5px solid rgba(212,175,55,0.2)',
          borderBottom: 'none',
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mb-6" />

        <h2 className="text-white text-xl mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Routine Modified
        </h2>
        <p className="text-white/45 text-sm mb-6 leading-relaxed">
          You made changes to <span className="text-[#D4AF37]">{routineName}</span>.
          Save these changes to the template?
        </p>

        <div className="space-y-3">
          <button
            onClick={onUpdateTemplate}
            className="w-full p-4 rounded-xl border border-[#D4AF37]/30 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
            style={{ background: 'rgba(212,175,55,0.07)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
              <Save className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-white text-sm">Update Template</p>
              <p className="text-white/35 text-xs mt-0.5">Permanently update "{routineName}"</p>
            </div>
          </button>

          <button
            onClick={onSaveAsLog}
            className="w-full p-4 rounded-xl border border-white/10 bg-white/5 flex items-center gap-4 text-left hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white/50" />
            </div>
            <div>
              <p className="text-white text-sm">Save as One-Time Log</p>
              <p className="text-white/35 text-xs mt-0.5">Keep the template unchanged</p>
            </div>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-3 text-white/35 hover:text-white/55 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}