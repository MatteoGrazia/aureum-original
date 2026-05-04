import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2, ChevronDown, Clock, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import {
  normaliseQuery,
  searchLocalFoods,
  searchFoodHistory,
  searchOpenFoodFacts,
  mergeAndRank,
  setFoodHistoryCache,
  getRecentFoods,
  COMMON_FOODS,
} from '@/lib/foodSearch';

const QUICK_ADD = ['Egg', 'Chicken Breast', 'White Rice (cooked)', 'Oats (dry)', 'Banana'];
const INITIAL_LIMIT = 5;

export default function FoodSearch({ onSelectFood }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [recentFoods, setRecentFoods] = useState([]);

  const debounceRef = useRef(null);
  const searchIdRef = useRef(0);
  const containerRef = useRef(null);
  const historyLoadedRef = useRef(false);

  // Load food history once on mount
  useEffect(() => {
    if (historyLoadedRef.current) return;
    historyLoadedRef.current = true;
    (async () => {
      try {
        const user = await base44.auth.me();
        const logs = await base44.entities.FoodLog.filter({ created_by: user.email }, '-created_date', 200);
        setFoodHistoryCache(logs);
        setRecentFoods(getRecentFoods(5));
      } catch {
        // silently ignore — history is optional
      }
    })();
  }, []);

  // Dismiss on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setResults([]);
        setShowEmptyState(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const runSearch = useCallback(async (rawQuery) => {
    const norm = normaliseQuery(rawQuery);
    if (norm.length < 2) {
      setResults([]);
      setShowEmptyState(false);
      setLoading(false);
      return;
    }

    const myId = ++searchIdRef.current;

    // --- Tier 1 & 2: instant local results ---
    const local = searchLocalFoods(norm);
    const history = searchFoodHistory(norm);
    const instant = mergeAndRank(local, history, [], []);
    setResults(instant);
    setShowEmptyState(false);
    setShowAll(false);

    // --- Tier 3: parallel API calls ---
    setLoading(true);

    const [offResult, fsResult] = await Promise.allSettled([
      searchOpenFoodFacts(norm),
      base44.functions.invoke('fatsecretSearch', { action: 'search', query: norm })
        .then(r => (r.data?.foods || []).map(f => ({
          name: f.name, brand: f.brand,
          calories: f.calories, protein: f.protein,
          carbs: f.carbs, fat: f.fat, fiber: f.fiber,
          serving_size: f.servingSize || 100, serving_unit: 'g',
          source: 'fatsecret', score: 50,
          needsDetails: f.needsDetails,
        }))),
    ]);

    if (searchIdRef.current !== myId) return; // stale

    const offFoods = offResult.status === 'fulfilled' ? offResult.value : [];
    const fsFoods = fsResult.status === 'fulfilled' ? fsResult.value : [];
    const merged = mergeAndRank(local, history, offFoods, fsFoods);

    setResults(merged);
    setShowEmptyState(merged.length === 0);
    setLoading(false);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceRef.current);

    if (!value.trim() || value.trim().length < 2) {
      setResults([]);
      setShowEmptyState(false);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => runSearch(value), 300);
  };

  const handleSelect = (food) => {
    onSelectFood(food);
    setQuery('');
    setResults([]);
    setShowEmptyState(false);
    setFocused(false);
  };

  const showQuickPanel = focused && !query.trim();
  const displayed = showAll ? results : results.slice(0, INITIAL_LIMIT);

  return (
    <div ref={containerRef} className="space-y-3 w-full max-w-full overflow-visible">
      {/* Search input */}
      <div className="relative h-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#D4AF37' }} />
        <Input
          type="text"
          placeholder="Search foods..."
          value={query}
          onChange={handleSearch}
          onFocus={() => setFocused(true)}
          className="pl-11 h-12 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '0.5px solid rgba(255,218,185,0.2)',
          }}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#FFDAB9' }} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {/* Quick panel — shown when focused with no query */}
        {showQuickPanel && (
          <motion.div
            key="quick-panel"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="space-y-4"
          >
            {/* Quick-add tiles */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] mb-2" style={{ color: 'rgba(255,218,185,0.45)', fontFamily: 'Montserrat' }}>
                Common Foods
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {QUICK_ADD.map(name => {
                  const food = COMMON_FOODS.find(f => f.name === name);
                  if (!food) return null;
                  return (
                    <button
                      key={name}
                      onClick={() => handleSelect({ ...food, source: 'local' })}
                      className="flex-shrink-0 px-3 py-2 rounded-xl text-left"
                      style={{ background: 'rgba(212,175,55,0.08)', border: '0.5px solid rgba(212,175,55,0.2)' }}
                    >
                      <p className="text-[11px] whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Montserrat' }}>{name.split(' ')[0]}</p>
                      <p className="text-[9px]" style={{ color: 'rgba(212,175,55,0.6)' }}>{food.calories} kcal</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recently logged */}
            {recentFoods.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] mb-2" style={{ color: 'rgba(255,218,185,0.45)', fontFamily: 'Montserrat' }}>
                  Recently Logged
                </p>
                <div className="space-y-1">
                  {recentFoods.map((food, i) => (
                    <FoodRow key={i} food={food} onSelect={handleSelect} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {showEmptyState && query.trim().length >= 2 && !loading && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="p-6 rounded-xl text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(212,175,55,0.1)' }}
          >
            <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Montserrat' }}>
              No results for "{query.trim()}"
            </p>
            <p className="text-white/30 text-xs" style={{ fontFamily: 'Montserrat' }}>
              Try a simpler term or scan a barcode
            </p>
          </motion.div>
        )}

        {/* Results */}
        {results.length > 0 && !showQuickPanel && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1.5"
          >
            {displayed.map((food, i) => (
              <FoodRow key={`${food.name}-${i}`} food={food} onSelect={handleSelect} showBadge />
            ))}

            {results.length > INITIAL_LIMIT && (
              <button
                onClick={() => setShowAll(p => !p)}
                className="w-full flex items-center justify-center gap-1.5 py-2"
                style={{ color: 'rgba(255,218,185,0.45)', fontFamily: 'Montserrat', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}
              >
                <ChevronDown className="w-3.5 h-3.5" style={{ transform: showAll ? 'rotate(180deg)' : 'rotate(0)' }} />
                {showAll ? 'Show less' : `${results.length - INITIAL_LIMIT} more results`}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FoodRow({ food, onSelect, showBadge = false }) {
  return (
    <button
      onClick={() => onSelect(food)}
      className="w-full text-left p-2.5 rounded-xl transition-all active:scale-[0.98]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(229,229,231,0.08)',
      }}
    >
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {showBadge && food.source === 'history' && (
              <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,218,185,0.5)' }} />
            )}
            {showBadge && food.source === 'local' && (
              <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(212,175,55,0.6)' }} />
            )}
            <p
              className="text-xs text-white flex-1 truncate"
              style={{ fontFamily: 'Montserrat' }}
            >
              {food.name}
            </p>
            <span className="text-[11px] flex-shrink-0" style={{ color: '#FFDAB9' }}>
              {food.calories} kcal
            </span>
          </div>
          {food.brand && (
            <p className="text-[9px] truncate mb-0.5" style={{ color: 'rgba(229,229,231,0.45)', fontFamily: 'Montserrat' }}>
              {food.brand}
            </p>
          )}
          <div className="flex gap-3 text-[9px]" style={{ fontFamily: 'Montserrat' }}>
            <span style={{ color: '#FFDAB9' }}>P {food.protein}g</span>
            <span style={{ color: '#FFE5CC' }}>C {food.carbs}g</span>
            <span style={{ color: '#E1A95F' }}>F {food.fat}g</span>
          </div>
        </div>
        <div
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,218,185,0.12)', border: '0.5px solid rgba(255,218,185,0.2)' }}
        >
          <Plus className="w-3 h-3" style={{ color: '#FFDAB9' }} />
        </div>
      </div>
    </button>
  );
}