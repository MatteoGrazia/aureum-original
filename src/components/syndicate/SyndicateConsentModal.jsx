import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function SyndicateConsentModal({ onAllow, onDecline }) {
  const [username, setUsername] = useState('');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', backgroundColor: 'rgba(8,16,12,0.72)' }}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-t-3xl px-6 pt-8 pb-12"
        style={{
          background: 'rgba(14, 20, 16, 0.92)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid #D4AF37',
          borderBottom: 'none',
          boxShadow: 'inset 0 0 60px rgba(152,171,143,0.02)',
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(152,171,143,0.12)', border: '1px solid rgba(152,171,143,0.3)' }}
          >
            <Zap className="w-8 h-8" style={{ color: '#98AB8F' }} strokeWidth={1.5} />
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
          className="text-center text-sm leading-relaxed mb-6"
          style={{ color: '#E5E5E7', fontFamily: 'Montserrat, sans-serif', fontWeight: 300, lineHeight: 1.7 }}
        >
          To connect with the Aureum community, we need your permission to share your workout and nutrition milestones. Your data remains yours; we only show what you achieve.
        </p>

        {/* Username Input */}
        <div className="mb-6">
          <label
            className="block text-[10px] uppercase tracking-[0.25em] mb-2 text-center"
            style={{ color: 'rgba(152,171,143,0.7)', fontFamily: 'Montserrat, sans-serif' }}
          >
            Choose Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="athlete_username"
            className="w-full px-4 py-3 rounded-xl text-center outline-none text-sm"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(152,171,143,0.3)',
              color: '#E5E5E7',
              fontFamily: 'Montserrat, sans-serif',
            }}
          />
        </div>

        {/* CTA */}
        <button
          onClick={() => username.trim() && onAllow(username.trim())}
          disabled={!username.trim()}
          className="w-full py-4 rounded-2xl mb-4 text-sm tracking-[0.18em] font-semibold transition-all active:scale-[0.97]"
          style={{
            background: username.trim() ? 'linear-gradient(135deg, #98AB8F, #7A9470)' : 'rgba(152,171,143,0.2)',
            color: username.trim() ? '#0a0a0a' : 'rgba(152,171,143,0.4)',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            boxShadow: username.trim() ? '0 0 30px rgba(152,171,143,0.3)' : 'none',
            opacity: username.trim() ? 1 : 0.5,
            cursor: username.trim() ? 'pointer' : 'not-allowed',
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