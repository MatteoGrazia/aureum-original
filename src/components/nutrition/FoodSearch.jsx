import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';

export default function FoodSearch({ onSelectFood }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const searchOpenFoodFactsFallback = async (searchQuery) => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery)}&search_simple=1&action=process&json=1&page_size=20`
      );
      
      const data = await response.json();
      const products = data.products || [];
      
      return products
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

  const searchFood = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setShowEmptyState(false);
      return;
    }

    setLoading(true);
    setShowEmptyState(false);

    const timeoutId = setTimeout(() => {
      if (results.length === 0) {
        setShowEmptyState(true);
      }
    }, 4000);

    try {
      const response = await base44.functions.invoke('fatsecretSearch', {
        action: 'search',
        query: searchQuery
      });

      let foods = (response.data.foods || []).map(food => ({
        id: food.id,
        name: food.name,
        brand: food.brand,
        calories: Math.round(food.calories),
        protein: Math.round(food.protein),
        carbs: Math.round(food.carbs),
        fat: Math.round(food.fat),
        fiber: Math.round(food.fiber),
        serving_size: food.servingSize || '100g',
        source: 'fatsecret'
      }));

      // Priority 1: FatSecret results
      if (foods.length > 0) {
        clearTimeout(timeoutId);
        setResults(foods);
        setShowEmptyState(false);
      } else {
        // Priority 2/3: OpenFoodFacts fallback for barcodes and generic items
        const fallbackFoods = await searchOpenFoodFactsFallback(searchQuery);
        clearTimeout(timeoutId);
        setResults(fallbackFoods);
        setShowEmptyState(fallbackFoods.length === 0);
      }
    } catch (error) {
      console.error('Search error:', error);
      const foods = await searchOpenFoodFactsFallback(searchQuery);
      setResults(foods);
      setShowEmptyState(foods.length === 0);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    const timeoutId = setTimeout(() => {
      searchFood(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          type="text"
          placeholder="Search foods..."
          value={query}
          onChange={handleSearch}
          className="pl-11 py-6 bg-white/5 border-[#D4AF37]/20 text-white placeholder:text-white/30 rounded-xl"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showEmptyState && query.length >= 2 && !loading && (
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
              <p 
                className="text-white/60 text-sm mb-4"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                No perfect match found
              </p>
              <p 
                className="text-white/40 text-xs"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
              >
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
            className="space-y-2 max-h-80 overflow-y-auto overflow-x-hidden pr-2"
          >
            {results.map((food, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className="p-3 rounded-xl cursor-pointer hover:border-[#D4AF37]/50 transition-all w-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '0.5px solid rgba(212, 175, 55, 0.1)'
                  }}
                  onClick={() => onSelectFood(food)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectFood(food);
                    }
                  }}
                >
                  <div className="flex items-start gap-2 w-full">
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm text-white truncate"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                      >
                        {food.name}
                      </p>
                      {food.brand && (
                        <p 
                          className="text-[11px] text-white/40 truncate mt-0.5"
                          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}
                        >
                          {food.brand}
                        </p>
                      )}
                       <div 
                        className="flex flex-wrap gap-x-2 gap-y-1 mt-1.5 text-[11px]"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                      >
                        <span className="text-[#D4AF37] whitespace-nowrap">{food.calories}kcal</span>
                        <span className="text-white/40 whitespace-nowrap">P:{food.protein}g</span>
                        <span className="text-white/40 whitespace-nowrap">C:{food.carbs}g</span>
                        <span className="text-white/40 whitespace-nowrap">F:{food.fat}g</span>
                      </div>
                      {food.serving_size !== 100 && (
                        <p className="text-[10px] text-white/30 mt-1">
                          Per {food.serving_size}{food.serving_unit}
                        </p>
                      )}
                    </div>
                    <button className="flex-shrink-0 w-7 h-7 rounded-full bg-[#D4AF37]/20 flex items-center justify-center hover:bg-[#D4AF37]/30 transition-colors mt-0.5">
                      <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}