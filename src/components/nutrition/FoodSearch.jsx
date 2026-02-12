import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';

export default function FoodSearch({ onSelectFood }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const searchOpenFoodFacts = async (searchQuery) => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery)}&search_simple=1&action=process&json=1&page_size=20&tagtype_0=categories&tag_contains_0=contains&tag_0=en:foods&sort_by=unique_scans_n`
      );
      const data = await response.json();
      
      const searchTerms = searchQuery.toLowerCase().split(' ');
      
      const foods = (data.products || [])
        .filter(product => {
          const name = (product.product_name || '').toLowerCase();
          const hasBasicNutrition = product.nutriments?.['energy-kcal_100g'] > 0;
          const matchesSearch = searchTerms.some(term => name.includes(term));
          return matchesSearch && hasBasicNutrition && name !== '';
        })
        .map(product => ({
          name: product.product_name || 'Unknown',
          brand: product.brands || '',
          calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
          protein: Math.round(product.nutriments?.proteins_100g || 0),
          carbs: Math.round(product.nutriments?.carbohydrates_100g || 0),
          fat: Math.round(product.nutriments?.fat_100g || 0),
          fiber: Math.round(product.nutriments?.fiber_100g || 0),
          serving_size: 100,
          serving_unit: 'g',
          barcode: product.code,
          completeness: product.completeness || 0
        }))
        .sort((a, b) => b.completeness - a.completeness)
        .slice(0, 10);

      return foods;
    } catch (error) {
      console.error('OpenFoodFacts error:', error);
      return [];
    }
  };

  const searchNutritionix = async (searchQuery) => {
    try {
      const response = await fetch(
        `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'x-app-id': '8c8b3e2f',
            'x-app-key': '4e3e0f9a8c8b3e2f4e3e0f9a8c8b3e2f'
          }
        }
      );
      const data = await response.json();
      
      const common = (data.common || []).slice(0, 5).map(item => ({
        name: item.food_name,
        brand: '',
        calories: Math.round(item.nf_calories || 0),
        protein: Math.round(item.nf_protein || 0),
        carbs: Math.round(item.nf_total_carbohydrate || 0),
        fat: Math.round(item.nf_total_fat || 0),
        fiber: Math.round(item.nf_dietary_fiber || 0),
        serving_size: Math.round(item.serving_qty || 1),
        serving_unit: item.serving_unit || 'serving',
        barcode: null,
        completeness: 100
      }));

      return common;
    } catch (error) {
      console.error('Nutritionix error:', error);
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
    }, 3000);

    try {
      let foods = await searchOpenFoodFacts(searchQuery);
      
      if (foods.length < 5) {
        const nutritionixResults = await searchNutritionix(searchQuery);
        foods = [...foods, ...nutritionixResults].slice(0, 10);
      }

      clearTimeout(timeoutId);
      setResults(foods);
      setShowEmptyState(foods.length === 0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setShowEmptyState(true);
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
            className="space-y-2 max-h-80 overflow-y-auto"
          >
            {results.map((food, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className="p-4 rounded-xl cursor-pointer hover:border-[#D4AF37]/50 transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '0.5px solid rgba(212, 175, 55, 0.1)'
                  }}
                  onClick={() => onSelectFood(food)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-white truncate"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                      >
                        {food.name}
                      </p>
                      {food.brand && (
                        <p 
                          className="text-xs text-white/40 truncate mt-0.5"
                          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}
                        >
                          {food.brand}
                        </p>
                      )}
                      <div 
                        className="flex gap-4 mt-2 text-xs"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                      >
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
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}