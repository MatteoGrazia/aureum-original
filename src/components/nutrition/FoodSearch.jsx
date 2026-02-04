import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';

export default function FoodSearch({ onSelectFood }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchFood = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery)}&search_simple=1&action=process&json=1&page_size=10`
      );
      const data = await response.json();
      
      const foods = (data.products || []).map(product => ({
        name: product.product_name || 'Unknown',
        brand: product.brands || '',
        calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
        protein: Math.round(product.nutriments?.proteins_100g || 0),
        carbs: Math.round(product.nutriments?.carbohydrates_100g || 0),
        fat: Math.round(product.nutriments?.fat_100g || 0),
        fiber: Math.round(product.nutriments?.fiber_100g || 0),
        serving_size: 100,
        serving_unit: 'g',
        barcode: product.code
      })).filter(f => f.name && f.name !== 'Unknown');

      setResults(foods);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
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
    <div className="space-y-4">
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
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37] animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 max-h-80 overflow-y-auto"
          >
            {results.map((food, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  className="p-4 cursor-pointer hover:border-[#D4AF37]/50 transition-all"
                  onClick={() => onSelectFood(food)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">{food.name}</p>
                      {food.brand && (
                        <p className="text-xs text-white/40 truncate">{food.brand}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-[#D4AF37]">{food.calories} kcal</span>
                        <span className="text-white/40">P: {food.protein}g</span>
                        <span className="text-white/40">C: {food.carbs}g</span>
                        <span className="text-white/40">F: {food.fat}g</span>
                      </div>
                    </div>
                    <button className="ml-4 w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center hover:bg-[#D4AF37]/30 transition-colors">
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}