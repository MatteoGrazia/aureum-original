import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';

const MUSCLES = ['all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'glutes'];

export default function ExercisePicker({ exercises, onSelect, onClose, mode = 'add' }) {
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = muscleFilter === 'all' || ex.muscle_group === muscleFilter;
    return matchSearch && matchMuscle;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#0a0a0a' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <h2 className="text-white text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {mode === 'replace' ? 'Replace Exercise' : 'Add Exercise'}
        </h2>
        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 mb-3">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="flex-1 bg-transparent text-white placeholder-white/25 outline-none"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
            autoFocus
          />
        </div>
      </div>

      {/* Muscle filter chips */}
      <div className="px-5 mb-3 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {MUSCLES.map(m => (
            <button
              key={m}
              onClick={() => setMuscleFilter(m)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs capitalize transition-all ${
                muscleFilter === m
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                  : 'bg-white/5 text-white/35 border border-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-2">
        {filtered.map(ex => (
          <button
            key={ex.id}
            onClick={() => onSelect(ex)}
            className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left border border-white/5"
          >
            <p className="text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{ex.name}</p>
            <p className="text-white/35 text-xs capitalize mt-0.5">{ex.muscle_group} · {ex.equipment}</p>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-white/25 text-center py-16 text-sm">No exercises found</p>
        )}
      </div>
    </motion.div>
  );
}