import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function SyndicateConsentModal({ onAllow, onDecline }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-t-3xl px-6 pt-8 pb-12"
        style={{
          background: 'rgba(18, 18, 18, 0.9)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid #D4AF37',
          borderBottom: 'none',
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(178,216,216,0.12)', border: '1px solid rgba(178,216,216,0.3)' }}
          >
            <Zap className="w-8 h-8" style={{ color: '#B2D8D8' }} strokeWidth={1.5} />
          </div>
        </div>

        {/* Header */}
        <h2
          className="text-center text-2xl mb-4 tracking-[0.25em]"
          style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
        >
          JOIN THE SYNDICATE
        </h2>

        {/* Body */}
        <p
          className="text-center text-sm leading-relaxed mb-8"
          style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', fontWeight: 300, lineHeight: 1.7 }}
        >
          To connect with the Aureum community, we need your permission to share your workout and nutrition milestones. Your data remains yours; we only show what you achieve.
        </p>

        {/* CTA */}
        <button
          onClick={onAllow}
          className="w-full py-4 rounded-2xl mb-4 text-sm tracking-[0.18em] font-semibold transition-all active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #B2D8D8, #8BBCBC)',
            color: '#0a0a0a',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            boxShadow: '0 0 30px rgba(178,216,216,0.3)',
          }}
        >
          ALLOW & ENTER
        </button>

        {/* Decline */}
        <button
          onClick={onDecline}
          className="w-full py-3 text-sm text-center transition-opacity hover:opacity-70 active:opacity-50"
          style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}
        >
          Not now.
        </button>
      </motion.div>
    </motion.div>
  );
}