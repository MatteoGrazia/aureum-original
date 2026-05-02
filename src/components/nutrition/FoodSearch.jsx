import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';

export default function FoodSearch({ onSelectFood }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Dismiss results on outside click
  React.useEffect(() => {
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

  const searchOpenFoodFactsFallback = async (searchQuery) => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery)}&search_simple=1&action=process&json=1&page_size=20`
      );
      const data = await response.json();
      return (data.products || [])
        .filter(p => p.product_name && p.nutriments?.['energy-kcal_100g'] > 0)
        .slice(0, 12)
        .map(p => ({
          name: p.product_name,
          brand: p.brands || '',
          calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
          protein: Math.round(p.nutriments?.proteins_100g || 0),
          carbs: Math.round(p.nutriments?.carbohydrates_100g || 0),
          fat: Math.round(p.nutriments?.fat_100g || 0),
          fiber: Math.round(p.nutriments?.fiber_100g || 0),
          serving_size: '100g',
          source: 'openfoods'
        }));
    } catch {
      return [];
    }
  };

  const translateIfNeeded = async (text) => {
    // Detect if text is non-English (simple heuristic: contains non-ASCII or known patterns)
    const isLikelyNonEnglish = /[^\x00-\x7F]/.test(text) || /^[a-z]{1,3}$/i.test(text) === false && !/^[a-zA-Z\s\-']+$/.test(text);
    if (!isLikelyNonEnglish) return text;
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate this food search term to English. Return ONLY the English translation, nothing else: "${text}"`,
      });
      return (typeof result === 'string' ? result : result?.text || text).trim().replace(/["']/g, '');
    } catch {
      return text;
    }
  };

  // Normalize query: lowercase, trim — backend handles singular/plural
  const normalizeQuery = (q) => q.toLowerCase().trim().replace(/\s+/g, ' ');

  const searchFood = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setShowEmptyState(false);
      return;
    }

    setLoading(true);
    setShowEmptyState(false);

    const translatedQuery = await translateIfNeeded(searchQuery);
    const normalized = normalizeQuery(translatedQuery);

    try {
      // Run USDA and FatSecret in parallel for faster results
      const [usdaResponse, fsResponse] = await Promise.allSettled([
        base44.functions.invoke('usdaFoodSearch', { query: normalized }),
        base44.functions.invoke('fatsecretSearch', { action: 'search', query: normalized }),
      ]);

      const usdaFoods = usdaResponse.status === 'fulfilled' ? (usdaResponse.value.data.foods || []) : [];
      const fsFoods = fsResponse.status === 'fulfilled'
        ? (fsResponse.value.data.foods || []).map(food => ({
            id: food.id,
            name: food.name,
            brand: food.brand,
            calories: Math.round(food.calories),
            protein: Math.round(food.protein),
            carbs: Math.round(food.carbs),
            fat: Math.round(food.fat),
            fiber: Math.round(food.fiber),
            serving_size: food.servingSize || '100g',
            source: 'fatsecret',
            needsDetails: food.needsDetails,
          }))
        : [];

      // Prefer USDA results (whole foods), supplement with FatSecret (branded foods)
      let combined = [...usdaFoods];
      const usdaNames = new Set(usdaFoods.map(f => f.name?.toLowerCase()));
      for (const f of fsFoods) {
        if (!usdaNames.has(f.name?.toLowerCase())) combined.push(f);
      }

      if (combined.length === 0) {
        // Fallback to OpenFoodFacts
        combined = await searchOpenFoodFactsFallback(normalized);
      }

      setResults(combined);
      setShowEmptyState(combined.length === 0);
    } catch (error) {
      console.error('Search error:', error);
      const foods = await searchOpenFoodFactsFallback(normalized);
      setResults(foods);
      setShowEmptyState(foods.length === 0);
    }

    setLoading(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    const trimmed = value.trim();

    // Immediately clear if too short
    if (!trimmed || trimmed.length < 2) {
      clearTimeout(debounceRef.current);
      setResults([]);
      setShowEmptyState(false);
      setLoading(false);
      return;
    }

    // Debounced search — trim spaces so "apple" and "apple " are identical
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchFood(trimmed);
    }, 600);
  };

  return (
    <div ref={containerRef} className="space-y-4 w-full max-w-full overflow-visible">
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
            border: '0.5px solid rgba(255, 218, 185, 0.2)',
          }}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#FFDAB9' }} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {/* Only show empty state when loading is fully done */}
        {showEmptyState && query.trim().length >= 2 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div
              className="p-6 rounded-xl text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(30px) saturate(180%)',
                border: '0.5px solid rgba(212, 175, 55, 0.1)'
              }}
            >
              <p className="text-white/60 text-sm mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                No perfect match found
              </p>
              <p className="text-white/40 text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                Try scanning a barcode or adding a custom food
              </p>
            </div>
          </motion.div>
        )}

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 max-h-96 overflow-y-auto overflow-x-hidden pr-2"
          >
            {results.map((food, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <button
                onClick={() => onSelectFood(food)}
                className="w-full text-left p-2 rounded-lg transition-all active:scale-95"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '0.5px solid rgba(229, 229, 231, 0.1)',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(255, 218, 185, 0.03)'
                }}
                >
                <div className="flex items-start gap-1.5 w-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <p className="text-xs text-white flex-1"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {food.name}
                      </p>
                      <span 
                        className="text-[11px] font-semibold flex-shrink-0 whitespace-nowrap"
                        style={{ color: '#FFDAB9' }}
                      >
                        {food.calories}kcal
                      </span>
                    </div>
                    {food.brand && (
                      <p 
                        className="text-[9px] mb-1"
                        style={{ 
                          fontFamily: 'Montserrat, sans-serif', 
                          fontWeight: 300, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          color: '#E5E5E7'
                        }}
                      >
                        {food.brand}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                      <span style={{ color: '#FFDAB9' }}>P: {food.protein}g</span>
                      <span style={{ color: '#FFE5CC' }}>C: {food.carbs}g</span>
                      <span style={{ color: '#E1A95F' }}>F: {food.fat}g</span>
                    </div>
                  </div>
                  <div 
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors mt-0.5"
                    style={{ 
                      background: 'rgba(255, 218, 185, 0.15)',
                      border: '0.5px solid rgba(255, 218, 185, 0.2)'
                    }}
                  >
                    <Plus className="w-3 h-3" style={{ color: '#FFDAB9' }} />
                  </div>
                </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}