// ─── Query Normalisation ──────────────────────────────────────────────────────
export function normaliseQuery(raw) {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/s$/, ''); // naive depluralization: "eggs" → "egg"
}

// ─── Local Common Foods Database ─────────────────────────────────────────────
export const COMMON_FOODS = [
  // PROTEIN
  { name: "Egg", calories: 155, protein: 13, carbs: 1.1, fat: 11, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Egg White", calories: 52, protein: 11, carbs: 0.7, fat: 0.2, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Chicken Thigh", calories: 209, protein: 26, carbs: 0, fat: 11, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Chicken Drumstick", calories: 172, protein: 28, carbs: 0, fat: 5.7, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Turkey Breast", calories: 135, protein: 30, carbs: 0, fat: 1, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Salmon (raw)", calories: 208, protein: 20, carbs: 0, fat: 13, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Salmon (cooked)", calories: 206, protein: 28, carbs: 0, fat: 9, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Tuna (canned in water)", calories: 116, protein: 26, carbs: 0, fat: 1, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Cod", calories: 82, protein: 18, carbs: 0, fat: 0.7, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Beef Mince (lean)", calories: 215, protein: 26, carbs: 0, fat: 12, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Beef Steak (sirloin)", calories: 207, protein: 26, carbs: 0, fat: 11, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Pork Chop", calories: 231, protein: 25, carbs: 0, fat: 14, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Bacon (grilled)", calories: 276, protein: 24, carbs: 0, fat: 20, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Whey Protein Powder", calories: 400, protein: 80, carbs: 8, fat: 5, serving_size: 100, serving_unit: "g", category: "supplement" },
  { name: "Casein Protein Powder", calories: 370, protein: 78, carbs: 6, fat: 2, serving_size: 100, serving_unit: "g", category: "supplement" },
  { name: "Tofu (firm)", calories: 76, protein: 8, carbs: 2, fat: 4.2, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Tempeh", calories: 193, protein: 20, carbs: 9, fat: 11, serving_size: 100, serving_unit: "g", category: "protein" },
  { name: "Edamame", calories: 121, protein: 11, carbs: 9, fat: 5, serving_size: 100, serving_unit: "g", category: "protein" },
  // DAIRY
  { name: "Whole Milk", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, serving_size: 100, serving_unit: "ml", category: "dairy" },
  { name: "Skimmed Milk", calories: 35, protein: 3.4, carbs: 5, fat: 0.1, serving_size: 100, serving_unit: "ml", category: "dairy" },
  { name: "Semi-skimmed Milk", calories: 47, protein: 3.3, carbs: 4.8, fat: 1.6, serving_size: 100, serving_unit: "ml", category: "dairy" },
  { name: "Greek Yogurt", calories: 97, protein: 9, carbs: 3.6, fat: 5, serving_size: 100, serving_unit: "g", category: "dairy" },
  { name: "Plain Yogurt", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, serving_size: 100, serving_unit: "g", category: "dairy" },
  { name: "Cottage Cheese", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, serving_size: 100, serving_unit: "g", category: "dairy" },
  { name: "Cheddar Cheese", calories: 402, protein: 25, carbs: 1.3, fat: 33, serving_size: 100, serving_unit: "g", category: "dairy" },
  { name: "Mozzarella", calories: 280, protein: 22, carbs: 2.2, fat: 22, serving_size: 100, serving_unit: "g", category: "dairy" },
  { name: "Butter", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, serving_size: 100, serving_unit: "g", category: "fat" },
  // CARBS / GRAINS
  { name: "White Rice (cooked)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "Brown Rice (cooked)", calories: 112, protein: 2.6, carbs: 24, fat: 0.9, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "Basmati Rice (cooked)", calories: 121, protein: 3.5, carbs: 25, fat: 0.4, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "Oats (dry)", calories: 389, protein: 17, carbs: 66, fat: 7, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "Oats (cooked)", calories: 71, protein: 2.5, carbs: 12, fat: 1.5, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "Pasta (dry)", calories: 371, protein: 13, carbs: 74, fat: 1.5, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "Pasta (cooked)", calories: 158, protein: 5.8, carbs: 31, fat: 0.9, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "White Bread", calories: 265, protein: 9, carbs: 49, fat: 3.2, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "Whole Wheat Bread", calories: 247, protein: 13, carbs: 41, fat: 4.2, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "Sourdough Bread", calories: 274, protein: 9, carbs: 52, fat: 1.8, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "White Potato (boiled)", calories: 77, protein: 2, carbs: 17, fat: 0.1, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "Quinoa (cooked)", calories: 120, protein: 4.4, carbs: 22, fat: 1.9, serving_size: 100, serving_unit: "g", category: "carbs" },
  { name: "Corn", calories: 86, protein: 3.3, carbs: 19, fat: 1.4, serving_size: 100, serving_unit: "g", category: "carbs" },
  // LEGUMES
  { name: "Lentils (cooked)", calories: 116, protein: 9, carbs: 20, fat: 0.4, serving_size: 100, serving_unit: "g", category: "legume" },
  { name: "Chickpeas (cooked)", calories: 164, protein: 8.9, carbs: 27, fat: 2.6, serving_size: 100, serving_unit: "g", category: "legume" },
  { name: "Black Beans (cooked)", calories: 132, protein: 8.9, carbs: 24, fat: 0.5, serving_size: 100, serving_unit: "g", category: "legume" },
  { name: "Kidney Beans (cooked)", calories: 127, protein: 8.7, carbs: 23, fat: 0.5, serving_size: 100, serving_unit: "g", category: "legume" },
  // FATS / OILS
  { name: "Olive Oil", calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: "ml", category: "fat" },
  { name: "Coconut Oil", calories: 892, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: "ml", category: "fat" },
  { name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15, serving_size: 100, serving_unit: "g", category: "fat" },
  { name: "Almond", calories: 579, protein: 21, carbs: 22, fat: 50, serving_size: 100, serving_unit: "g", category: "fat" },
  { name: "Walnut", calories: 654, protein: 15, carbs: 14, fat: 65, serving_size: 100, serving_unit: "g", category: "fat" },
  { name: "Cashew", calories: 553, protein: 18, carbs: 30, fat: 44, serving_size: 100, serving_unit: "g", category: "fat" },
  { name: "Peanut Butter", calories: 588, protein: 25, carbs: 20, fat: 50, serving_size: 100, serving_unit: "g", category: "fat" },
  { name: "Almond Butter", calories: 614, protein: 21, carbs: 19, fat: 56, serving_size: 100, serving_unit: "g", category: "fat" },
  // VEGETABLES
  { name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, serving_size: 100, serving_unit: "g", category: "vegetable" },
  { name: "Spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving_size: 100, serving_unit: "g", category: "vegetable" },
  { name: "Kale", calories: 35, protein: 2.9, carbs: 4.4, fat: 1.5, serving_size: 100, serving_unit: "g", category: "vegetable" },
  { name: "Carrot", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, serving_size: 100, serving_unit: "g", category: "vegetable" },
  { name: "Cucumber", calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, serving_size: 100, serving_unit: "g", category: "vegetable" },
  { name: "Tomato", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, serving_size: 100, serving_unit: "g", category: "vegetable" },
  { name: "Bell Pepper", calories: 31, protein: 1, carbs: 6, fat: 0.3, serving_size: 100, serving_unit: "g", category: "vegetable" },
  { name: "Onion", calories: 40, protein: 1.1, carbs: 9, fat: 0.1, serving_size: 100, serving_unit: "g", category: "vegetable" },
  { name: "Garlic", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, serving_size: 100, serving_unit: "g", category: "vegetable" },
  { name: "Mushroom", calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, serving_size: 100, serving_unit: "g", category: "vegetable" },
  { name: "Lettuce", calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, serving_size: 100, serving_unit: "g", category: "vegetable" },
  { name: "Zucchini", calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, serving_size: 100, serving_unit: "g", category: "vegetable" },
  // FRUIT
  { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, serving_size: 100, serving_unit: "g", category: "fruit" },
  { name: "Apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, serving_size: 100, serving_unit: "g", category: "fruit" },
  { name: "Orange", calories: 47, protein: 0.9, carbs: 12, fat: 0.1, serving_size: 100, serving_unit: "g", category: "fruit" },
  { name: "Blueberries", calories: 57, protein: 0.7, carbs: 14, fat: 0.3, serving_size: 100, serving_unit: "g", category: "fruit" },
  { name: "Strawberries", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, serving_size: 100, serving_unit: "g", category: "fruit" },
  { name: "Mango", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, serving_size: 100, serving_unit: "g", category: "fruit" },
  { name: "Grapes", calories: 69, protein: 0.7, carbs: 18, fat: 0.2, serving_size: 100, serving_unit: "g", category: "fruit" },
  { name: "Watermelon", calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, serving_size: 100, serving_unit: "g", category: "fruit" },
  { name: "Pineapple", calories: 50, protein: 0.5, carbs: 13, fat: 0.1, serving_size: 100, serving_unit: "g", category: "fruit" },
  // DRINKS
  { name: "Orange Juice", calories: 45, protein: 0.7, carbs: 10, fat: 0.2, serving_size: 100, serving_unit: "ml", category: "drink" },
  { name: "Coffee (black)", calories: 2, protein: 0.3, carbs: 0, fat: 0, serving_size: 240, serving_unit: "ml", category: "drink" },
  { name: "Whole Milk Latte", calories: 54, protein: 3.1, carbs: 5, fat: 2.3, serving_size: 100, serving_unit: "ml", category: "drink" },
  { name: "Green Tea", calories: 1, protein: 0, carbs: 0.2, fat: 0, serving_size: 240, serving_unit: "ml", category: "drink" },
  // SNACKS
  { name: "Dark Chocolate (85%)", calories: 598, protein: 8, carbs: 46, fat: 43, serving_size: 100, serving_unit: "g", category: "snack" },
  { name: "Rice Cake", calories: 387, protein: 8, carbs: 81, fat: 3, serving_size: 100, serving_unit: "g", category: "snack" },
  { name: "Granola Bar", calories: 471, protein: 8, carbs: 64, fat: 20, serving_size: 100, serving_unit: "g", category: "snack" },
  { name: "Hummus", calories: 166, protein: 7.9, carbs: 14, fat: 9.6, serving_size: 100, serving_unit: "g", category: "snack" },
  // CONDIMENTS / EXTRAS
  { name: "Honey", calories: 304, protein: 0.3, carbs: 82, fat: 0, serving_size: 100, serving_unit: "g", category: "condiment" },
  { name: "Tomato Sauce", calories: 29, protein: 1.5, carbs: 6.3, fat: 0.2, serving_size: 100, serving_unit: "g", category: "condiment" },
  { name: "Mayonnaise", calories: 680, protein: 1, carbs: 0.6, fat: 75, serving_size: 100, serving_unit: "g", category: "condiment" },
  { name: "Soy Sauce", calories: 53, protein: 8.1, carbs: 4.9, fat: 0.1, serving_size: 100, serving_unit: "ml", category: "condiment" },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────
function scoreMatch(normalisedName, query) {
  if (normalisedName === query) return 100;
  if (normalisedName.startsWith(query)) return 90;
  const words = normalisedName.split(' ');
  if (words.some(w => w === query)) return 80;
  if (normalisedName.includes(query)) return 70;
  if (words.some(w => w.startsWith(query))) return 60;
  return 0;
}

// ─── Local Foods Search ───────────────────────────────────────────────────────
export function searchLocalFoods(normalisedQuery) {
  if (!normalisedQuery || normalisedQuery.length < 2) return [];
  return COMMON_FOODS
    .map(food => ({ ...food, score: scoreMatch(normaliseQuery(food.name), normalisedQuery) }))
    .filter(food => food.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// ─── History Search ───────────────────────────────────────────────────────────
let _historyCache = null;

export function setFoodHistoryCache(logs) {
  const freq = {};
  logs.forEach(log => {
    const key = normaliseQuery(log.food_name);
    freq[key] = (freq[key] || 0) + 1;
  });
  _historyCache = { logs, freq };
}

export function getFoodHistoryCache() {
  return _historyCache;
}

export function searchFoodHistory(normalisedQuery) {
  if (!_historyCache) return [];
  const seen = new Set();
  return _historyCache.logs
    .filter(log => {
      const norm = normaliseQuery(log.food_name);
      if (!norm.includes(normalisedQuery)) return false;
      if (seen.has(norm)) return false;
      seen.add(norm);
      return true;
    })
    .map(log => ({
      name: log.food_name,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      fiber: log.fiber,
      serving_size: log.serving_size,
      serving_unit: log.serving_unit,
      score: 95 + (_historyCache.freq[normaliseQuery(log.food_name)] || 0),
      source: 'history',
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export function getRecentFoods(limit = 5) {
  if (!_historyCache || !_historyCache.logs.length) return [];
  const seen = new Set();
  const result = [];
  for (const log of _historyCache.logs) {
    const norm = normaliseQuery(log.food_name);
    if (seen.has(norm)) continue;
    seen.add(norm);
    result.push({
      name: log.food_name,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      fiber: log.fiber,
      serving_size: log.serving_size,
      serving_unit: log.serving_unit,
      source: 'history',
    });
    if (result.length >= limit) break;
  }
  return result;
}

// ─── Timeout fetch ────────────────────────────────────────────────────────────
async function fetchWithTimeout(url, options = {}, timeoutMs = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// ─── Open Food Facts ──────────────────────────────────────────────────────────
export async function searchOpenFoodFacts(query) {
  try {
    const fields = 'product_name,nutriments,serving_size,brands';
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=${fields}`;
    const res = await fetchWithTimeout(url, {}, 3000);
    const data = await res.json();
    return (data.products || [])
      .filter(p => p.product_name && p.nutriments?.['energy-kcal_100g'])
      .map(p => ({
        name: p.product_name,
        brand: p.brands || '',
        calories: Math.round(p.nutriments['energy-kcal_100g'] || 0),
        protein: Math.round((p.nutriments['proteins_100g'] || 0) * 10) / 10,
        carbs: Math.round((p.nutriments['carbohydrates_100g'] || 0) * 10) / 10,
        fat: Math.round((p.nutriments['fat_100g'] || 0) * 10) / 10,
        fiber: Math.round((p.nutriments['fiber_100g'] || 0) * 10) / 10,
        serving_size: 100,
        serving_unit: 'g',
        source: 'off',
        score: 50,
      }));
  } catch {
    return [];
  }
}

// ─── Data Normalisation ───────────────────────────────────────────────────────
export function normaliseFood(raw) {
  return {
    name: (raw.name || 'Unknown Food')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .trim(),
    brand: raw.brand || '',
    calories: Math.max(0, Math.round(raw.calories || 0)),
    protein: Math.max(0, Math.round((raw.protein || 0) * 10) / 10),
    carbs: Math.max(0, Math.round((raw.carbs || 0) * 10) / 10),
    fat: Math.max(0, Math.round((raw.fat || 0) * 10) / 10),
    fiber: Math.max(0, Math.round((raw.fiber || 0) * 10) / 10),
    serving_size: raw.serving_size || 100,
    serving_unit: raw.serving_unit || 'g',
    source: raw.source || 'unknown',
    score: raw.score || 0,
  };
}

// ─── Merge & Rank ─────────────────────────────────────────────────────────────
const SOURCE_PRIORITY = { history: 3, local: 2, off: 1, fatsecret: 1, usda: 1 };

export function mergeAndRank(local, history, openFoodFacts = [], fatSecret = []) {
  const all = [
    ...history.map(f => ({ ...f, source: 'history' })),
    ...local.map(f => ({ ...f, source: 'local' })),
    ...openFoodFacts.map(f => ({ ...f, source: 'off' })),
    ...fatSecret.map(f => ({ ...f, source: f.source || 'fatsecret' })),
  ];

  const seen = new Set();
  const deduped = all.filter(food => {
    const key = normaliseQuery(food.name || '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped
    .map(normaliseFood)
    .sort((a, b) => {
      const pd = (SOURCE_PRIORITY[b.source] || 0) - (SOURCE_PRIORITY[a.source] || 0);
      if (pd !== 0) return pd;
      return (b.score || 0) - (a.score || 0);
    })
    .slice(0, 25);
}