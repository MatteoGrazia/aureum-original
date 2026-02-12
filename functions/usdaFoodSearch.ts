import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const USDA_API_KEY = Deno.env.get('USDA_FOODDATA_API_KEY');
const USDA_BASE_URL = 'https://fdc.nal.usda.gov/api/foods/search';

const searchUSDA = async (query) => {
  try {
    const response = await fetch(
      `${USDA_BASE_URL}?query=${encodeURIComponent(query)}&pageSize=20&api_key=${USDA_API_KEY}`
    );

    if (!response.ok) {
      console.error('USDA API error:', response.status);
      return [];
    }

    const data = await response.json();
    const foods = data.foods || [];

    // Filter and process results - prioritize raw ingredients
    return foods
      .filter(food => {
        const description = food.description?.toLowerCase() || '';
        // Exclude heavily processed items
        const isProcessed = description.includes('cooked') || 
                           description.includes('prepared') || 
                           description.includes('frozen') ||
                           description.includes('canned');
        return !isProcessed && food.foodNutrients;
      })
      .slice(0, 12)
      .map(food => {
        const nutrients = food.foodNutrients || [];
        
        const getKcal = () => {
          const kcal = nutrients.find(n => n.nutrient?.id === 1008);
          return kcal ? Math.round(kcal.value) : 0;
        };

        const getProtein = () => {
          const protein = nutrients.find(n => n.nutrient?.id === 1003);
          return protein ? Math.round(protein.value) : 0;
        };

        const getCarbs = () => {
          const carbs = nutrients.find(n => n.nutrient?.id === 1005);
          return carbs ? Math.round(carbs.value) : 0;
        };

        const getFat = () => {
          const fat = nutrients.find(n => n.nutrient?.id === 1004);
          return fat ? Math.round(fat.value) : 0;
        };

        const getFiber = () => {
          const fiber = nutrients.find(n => n.nutrient?.id === 1079);
          return fiber ? Math.round(fiber.value) : 0;
        };

        return {
          id: food.fdcId,
          name: food.description,
          brand: '',
          calories: getKcal(),
          protein: getProtein(),
          carbs: getCarbs(),
          fat: getFat(),
          fiber: getFiber(),
          serving_size: '100g',
          source: 'usda'
        };
      });
  } catch (error) {
    console.error('USDA search error:', error);
    return [];
  }
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