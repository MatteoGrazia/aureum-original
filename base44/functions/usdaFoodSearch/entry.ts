import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const USDA_API_KEY = Deno.env.get('USDA_FOODDATA_API_KEY');
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Fetch detailed food info including food portions (serving sizes)
const getFoodDetails = async (fdcId) => {
  const response = await fetch(
    `${USDA_BASE_URL}/${fdcId}?format=abridged&api_key=${USDA_API_KEY}`
  );
  if (!response.ok) return null;
  return response.json();
};

const getNutrientValue = (nutrients, id) => {
  const n = nutrients.find(n => n.nutrientId === id || n.nutrient?.id === id);
  return n ? parseFloat(n.value || n.amount || 0) : 0;
};

// Detect if a food is liquid based on its name
const isLiquidFood = (name) => {
  return /\b(milk|juice|water|oil|sauce|broth|stock|cream|yogurt|drink|beverage|smoothie|shake|soup|tea|coffee|wine|beer|spirits|syrup|vinegar|kefir|buttermilk|coconut milk|almond milk|oat milk|soy milk|lemonade|soda|cola|energy drink)\b/i.test(name);
};

// Build all available serving units from USDA food portions
const buildServingUnits = (food) => {
  const nutrients = food.foodNutrients || [];
  const per100g = {
    calories: getNutrientValue(nutrients, 1008),
    protein: getNutrientValue(nutrients, 1003),
    carbs: getNutrientValue(nutrients, 1005),
    fat: getNutrientValue(nutrients, 1004),
    fiber: getNutrientValue(nutrients, 1079),
  };

  const foodName = food.description || '';
  const isLiquid = isLiquidFood(foodName);
  const units = [];

  // Add named portions from USDA (e.g. "1 large", "1 medium", "1 cup")
  const portions = food.foodPortions || [];

  // Only skip truly unhelpful ones (sifted flour, pat of butter etc.)
  const skipPattern = /\b(pat|pats|sifted|cup sifted)\b/i;

  for (const portion of portions) {
    const grams = parseFloat(portion.gramWeight) || 0;
    if (grams <= 0) continue;

    let desc = '';
    if (portion.portionDescription) {
      desc = portion.portionDescription;
    } else if (portion.modifier && portion.amount) {
      desc = `${portion.amount} ${portion.modifier}`;
    } else if (portion.modifier) {
      desc = portion.modifier;
    } else {
      desc = `${grams}g`;
    }

    if (skipPattern.test(desc)) continue;

    units.push({
      servingDescription: desc,
      unit: 'g',
      amount: grams,
      metricUnit: 'g',
      calories: Math.round((per100g.calories / 100) * grams * 10) / 10,
      protein: Math.round((per100g.protein / 100) * grams * 10) / 10,
      carbs: Math.round((per100g.carbs / 100) * grams * 10) / 10,
      fat: Math.round((per100g.fat / 100) * grams * 10) / 10,
      fiber: Math.round((per100g.fiber / 100) * grams * 10) / 10,
      isDefault: false,
    });
  }

  // For liquid foods: add common liquid measures if not already present
  if (isLiquid) {
    // USDA nutrient data is per 100g. For liquids we approximate 1ml ≈ 1g (water density).
    // Most liquids are close enough; oil is denser but users expect ml-based measures.
    const liquidMeasures = [
      { desc: '1 teaspoon (5ml)',   ml: 5   },
      { desc: '1 tablespoon (15ml)', ml: 15  },
      { desc: '1 fl oz (30ml)',      ml: 30  },
      { desc: '100ml',               ml: 100 },
      { desc: '1 cup (240ml)',       ml: 240 },
    ];
    const existingDescs = units.map(u => u.servingDescription.toLowerCase());
    for (const { desc, ml } of liquidMeasures) {
      if (!existingDescs.some(d => d.includes('teaspoon') || d.includes('tablespoon') || d.includes('fl oz') || d.includes('cup') || d.includes('100ml'))) {
        // Only add if no liquid measures already present
      }
      const alreadyHas = units.some(u => u.servingDescription.toLowerCase().includes(desc.split(' ')[1]?.replace(/[()]/g, '') || ''));
      if (!alreadyHas) {
        units.push({
          servingDescription: desc,
          unit: 'ml',
          amount: ml,
          metricUnit: 'ml',
          calories: Math.round((per100g.calories / 100) * ml * 10) / 10,
          protein: Math.round((per100g.protein / 100) * ml * 10) / 10,
          carbs: Math.round((per100g.carbs / 100) * ml * 10) / 10,
          fat: Math.round((per100g.fat / 100) * ml * 10) / 10,
          fiber: Math.round((per100g.fiber / 100) * ml * 10) / 10,
          isDefault: false,
        });
      }
    }
  }

  // Always add 1g/1ml precision option
  units.push({
    servingDescription: isLiquid ? '1ml' : '1g',
    unit: isLiquid ? 'ml' : 'g',
    amount: 1,
    metricUnit: isLiquid ? 'ml' : 'g',
    calories: Math.round(per100g.calories / 100 * 10) / 10,
    protein: Math.round(per100g.protein / 100 * 10) / 10,
    carbs: Math.round(per100g.carbs / 100 * 10) / 10,
    fat: Math.round(per100g.fat / 100 * 10) / 10,
    fiber: Math.round(per100g.fiber / 100 * 10) / 10,
    isDefault: false,
  });

  // Always add 100g/100ml option
  units.push({
    servingDescription: isLiquid ? '100ml' : '100g',
    unit: isLiquid ? 'ml' : 'g',
    amount: 100,
    metricUnit: isLiquid ? 'ml' : 'g',
    calories: Math.round(per100g.calories * 10) / 10,
    protein: Math.round(per100g.protein * 10) / 10,
    carbs: Math.round(per100g.carbs * 10) / 10,
    fat: Math.round(per100g.fat * 10) / 10,
    fiber: Math.round(per100g.fiber * 10) / 10,
    isDefault: units.length === 0,
  });

  // Mark first named portion as default if we have portions
  if (units.length > 1) {
    units[0].isDefault = true;
  }

  return units;
};

// Normalize to singular form so "eggs" and "egg" produce identical queries
const toSingular = (word) => {
  const w = word.toLowerCase();
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y'; // berries → berry
  if (w.endsWith('ves') && w.length > 4) return w.slice(0, -3) + 'f'; // halves → half
  if (w.endsWith('ss') || w.endsWith('us') || w.endsWith('is')) return w; // grass, status, basis
  if (w.endsWith('s') && w.length > 2) return w.slice(0, -1); // eggs → egg, apples → apple
  return w;
};

const normalizeQueryForSearch = (q) =>
  q.toLowerCase().trim().split(/\s+/).map(toSingular).join(' ');

const fetchUSDA = async (query) => {
  const url = `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=80&dataType=SR%20Legacy,Foundation,Survey%20(FNDDS)&api_key=${USDA_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return data.foods || [];
};

const searchUSDA = async (query) => {
  // Always normalize to singular so "eggs" and "egg" produce the same results
  const normalized = normalizeQueryForSearch(query);
  const queryWords = normalized.split(/\s+/);

  const allFoods = await fetchUSDA(normalized);

  const scoreFood = (desc) => {
    if (!desc) return 10;
    const name = desc.toLowerCase();
    const tokens = name.split(/[\s,]+/).filter(Boolean);
    if (!tokens.length) return 10;
    const firstToken = toSingular(tokens[0]);
    const firstQueryWord = queryWords[0];

    // Exact match (singular-normalized)
    if (toSingular(name) === normalized) return 0;

    if (firstToken === firstQueryWord) {
      // Exact single-word match: e.g. query="chicken", name="chicken" or "chicken, raw"
      if (tokens.length === 1 || (tokens.length === 2 && /^(raw|whole|fresh|cooked|boiled|roasted|grilled|baked|fried|dried|canned|frozen)$/.test(tokens[1]))) return 1;
      // Has raw/whole modifier — plain ingredient
      if (name.includes('raw') || name.includes('whole')) return 2;
      // Simple cut or form — breast, thigh, leg, fillet, ground, etc.
      if (/\b(breast|thigh|leg|wing|fillet|loin|tenderloin|ground|minced|steak|chop|cutlet|drumstick|rib|belly|shoulder|neck|back)\b/.test(name)) return 3;
      // Not a dish/recipe
      if (!/\b(dish|recipe|soup|salad|sandwich|casserole|stew|pie|cake|burger|pizza|pasta|noodle|fried rice|stir.fry|nugget|finger|strip|taco|wrap|roll|bowl|curry|tikka|masala|alfredo|pesto|risotto)\b/i.test(name)) return 4;
      return 5;
    }
    if (queryWords.every(w => tokens.map(toSingular).includes(w))) return 6;
    if (name.startsWith(normalized)) return 7;
    if (name.includes(normalized)) return 8;
    return 10;
  };

  const sorted = allFoods
    .filter(f => {
      if (queryWords.length === 1) {
        const name = (f.description || '').toLowerCase();
        const firstToken = toSingular(name.split(/[\s,]+/).filter(Boolean)[0] || '');
        const startsWithQuery = firstToken === queryWords[0];
        if (!startsWithQuery && /\b(with|and|sauce|soup|stew|casserole|pie|cake|dish|recipe|salad|sandwich|burger|pizza|pasta|noodle|fried rice|stir fry)\b/i.test(name)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      const sa = scoreFood(a.description);
      const sb = scoreFood(b.description);
      if (sa !== sb) return sa - sb;
      // Secondary sort: fewer tokens = simpler/more generic = better
      const ta = (a.description || '').split(/[\s,]+/).filter(Boolean).length;
      const tb = (b.description || '').split(/[\s,]+/).filter(Boolean).length;
      return ta - tb;
    });

  const foods = sorted.slice(0, 10);

  // Fetch details for each food to get portions
  const detailed = await Promise.all(
    foods.map(async (food) => {
      const detail = await getFoodDetails(food.fdcId);
      if (!detail) return null;
      const nutrients = detail.foodNutrients || [];
      const availableUnits = buildServingUnits(detail);
      const defaultUnit = availableUnits.find(u => u.isDefault) || availableUnits[0];

      // Clean up USDA description: "Egg, whole, raw, fresh" → "Egg, whole"
      const cleanName = (food.description || '')
        .replace(/,\s*(raw|fresh|cooked|boiled|fried|roasted|dried|frozen|canned|plain|unprepared|prepared|ns as to|NFS|NES|fluid|salted|unsalted|with skin|without skin|with bone|boneless|skinless|all types|commercial|home-prepared|restaurant|fast food|generic)\b.*/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        id: String(food.fdcId),
        name: cleanName || food.description,
        brand: food.brandOwner || '',
        calories: defaultUnit.calories,
        protein: defaultUnit.protein,
        carbs: defaultUnit.carbs,
        fat: defaultUnit.fat,
        fiber: defaultUnit.fiber,
        serving_size: defaultUnit.amount + defaultUnit.metricUnit,
        source: 'usda',
        availableUnits,
      };
    })
  );

  // Deduplicate by clean name — keep the entry with the most serving units
  const seen = new Map();
  for (const food of detailed.filter(Boolean)) {
    const key = food.name.toLowerCase();
    if (!seen.has(key) || food.availableUnits.length > seen.get(key).availableUnits.length) {
      seen.set(key, food);
    }
  }
  return Array.from(seen.values());
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();

    if (!query || query.length < 2) {
      return Response.json({ foods: [] });
    }

    const foods = await searchUSDA(query);
    return Response.json({ foods });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});