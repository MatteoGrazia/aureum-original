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

// Build all available serving units from USDA food portions
const buildServingUnits = (food) => {
  const nutrients = food.foodNutrients || [];
  // All values are per 100g in USDA
  const per100g = {
    calories: getNutrientValue(nutrients, 1008),
    protein: getNutrientValue(nutrients, 1003),
    carbs: getNutrientValue(nutrients, 1005),
    fat: getNutrientValue(nutrients, 1004),
    fiber: getNutrientValue(nutrients, 1079),
  };

  const units = [];

  // Add named portions (e.g. "1 large", "1 medium", "1 cup")
  const portions = food.foodPortions || [];

  // Useful portion keywords — skip tiny measurement units like tbsp, tsp, oz, fl oz
  const skipPattern = /\b(tbsp|tsp|tablespoon|teaspoon|fl oz|fluid ounce|pat|pats|sifted|cup sifted)\b/i;

  for (const portion of portions) {
    const grams = parseFloat(portion.gramWeight) || 0;
    if (grams <= 0) continue;

    // Build a human-readable description
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

    // Skip unhelpful tiny-measurement servings
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

  // Always add 1g option for precise measurement
  units.push({
    servingDescription: '1g',
    unit: 'g',
    amount: 1,
    metricUnit: 'g',
    calories: Math.round(per100g.calories / 100 * 10) / 10,
    protein: Math.round(per100g.protein / 100 * 10) / 10,
    carbs: Math.round(per100g.carbs / 100 * 10) / 10,
    fat: Math.round(per100g.fat / 100 * 10) / 10,
    fiber: Math.round(per100g.fiber / 100 * 10) / 10,
    isDefault: false,
  });

  // Always add 100g option
  units.push({
    servingDescription: '100g',
    unit: 'g',
    amount: 100,
    metricUnit: 'g',
    calories: Math.round(per100g.calories * 10) / 10,
    protein: Math.round(per100g.protein * 10) / 10,
    carbs: Math.round(per100g.carbs * 10) / 10,
    fat: Math.round(per100g.fat * 10) / 10,
    fiber: Math.round(per100g.fiber * 10) / 10,
    isDefault: units.length === 0, // default if no portions
  });

  // Mark first named portion as default if we have portions
  if (units.length > 1) {
    units[0].isDefault = true;
  }

  return units;
};

const searchUSDA = async (query) => {
  // Include Foundation + SR Legacy + Survey for best whole-food coverage
  const url = `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=80&dataType=SR%20Legacy,Foundation,Survey%20(FNDDS)&api_key=${USDA_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error('USDA API error:', response.status);
    return [];
  }

  const data = await response.json();
  const lowerQuery = query.toLowerCase().trim();
  const queryWords = lowerQuery.split(/\s+/);

  const scoreFood = (desc, dataType) => {
    const name = desc.toLowerCase();
    const tokens = name.split(/[\s,]+/);
    const firstQueryWord = queryWords[0];

    // Exact full match
    if (name === lowerQuery) return 0;
    // First token exact match
    if (tokens[0] === firstQueryWord) {
      // Prefer raw/whole simple entries
      if (name.includes('raw') || name.includes('whole')) return 1;
      if (!name.includes('dish') && !name.includes('recipe') && !name.includes('soup') && !name.includes('salad') && !name.includes('sandwich')) return 2;
      return 3;
    }
    // All query words present
    if (queryWords.every(w => name.includes(w))) return 4;
    // Starts with query
    if (name.startsWith(lowerQuery)) return 5;
    // Contains query as substring
    if (name.includes(lowerQuery)) return 6;
    return 10;
  };

  const sorted = (data.foods || [])
    .filter(f => {
      // Filter out multi-ingredient dishes when query is a single simple food
      if (queryWords.length === 1) {
        const name = (f.description || '').toLowerCase();
        // Allow if the food name starts with the query word
        const startsWithQuery = name.split(/[\s,]+/)[0] === lowerQuery;
        if (!startsWithQuery && /\b(with|and|sauce|soup|stew|casserole|pie|cake|dish|recipe|salad|sandwich|burger|pizza|pasta|noodle|fried rice|stir.fry)\b/i.test(name)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => scoreFood(a.description, a.dataType) - scoreFood(b.description, b.dataType));

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