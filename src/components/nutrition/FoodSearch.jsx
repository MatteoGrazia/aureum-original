import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { simpleIngredients } from './simpleIngredientsData';

export default function FoodSearch({ onSelectFood }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);

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
      // Priority 1: Check local cache for instant match
      const localMatch = simpleIngredients.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (localMatch.length > 0) {
        clearTimeout(timeoutId);
        const foods = localMatch.map(food => ({
          ...food,
          serving_size: '100g',
          source: 'local'
        }));
        setResults(foods);
        setShowEmptyState(false);
        setLoading(false);
        return;
      }

      // Priority 2: USDA for raw ingredients (SR Legacy)
      const usdaResponse = await base44.functions.invoke('usdaFoodSearch', {
        query: searchQuery
      });

      let foods = usdaResponse.data.foods || [];

      if (foods.length > 0) {
        clearTimeout(timeoutId);
        setResults(foods);
        setShowEmptyState(false);
        setLoading(false);
        return;
      }

      // Priority 3: FatSecret for branded/restaurant items
      const fsResponse = await base44.functions.invoke('fatsecretSearch', {
        action: 'search',
        query: searchQuery
      });

      foods = (fsResponse.data.foods || []).map(food => ({
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
        needsDetails: food.needsDetails
      }));

      clearTimeout(timeoutId);
      setResults(foods);
      setShowEmptyState(foods.length === 0);
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
                  className="w-full text-left p-2 rounded-lg transition-all hover:border-[#D4AF37]/50 active:scale-95"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '0.5px solid rgba(212, 175, 55, 0.1)'
                  }}
                >
                  <div className="flex items-start gap-1.5 w-full">
                  <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <p 
                      className="text-xs text-white truncate flex-1"
                      style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                    >
                      {food.name}
                    </p>
                    <span className="text-[11px] text-[#D4AF37] font-semibold flex-shrink-0 whitespace-nowrap">
                      {food.calories}kcal
                    </span>
                  </div>
                  {food.brand && (
                    <p 
                      className="text-[9px] text-white/40 truncate mb-1"
                      style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}
                    >
                      {food.brand}
                    </p>
                  )}
                  <div 
                    className="grid grid-cols-3 gap-1.5 text-[9px]"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                  >
                    <div className="flex items-center gap-0.5">
                      <span style={{ color: '#9C7E46' }}>P:</span>
                      <span style={{ color: '#9C7E46' }}>{food.protein}g</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span style={{ color: '#9C7E46' }}>C:</span>
                      <span style={{ color: '#9C7E46' }}>{food.carbs}g</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span style={{ color: '#9C7E46' }}>F:</span>
                      <span style={{ color: '#9C7E46' }}>{food.fat}g</span>
                    </div>
                  </div>
                  </div>
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center hover:bg-[#D4AF37]/30 transition-colors mt-0.5">
                      <Plus className="w-3 h-3 text-[#D4AF37]" />
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