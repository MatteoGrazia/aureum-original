import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

let cachedToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = Deno.env.get('FATSECRET_CLIENT_ID');
  const clientSecret = Deno.env.get('FATSECRET_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Missing FatSecret credentials');
  }

  try {
    const authString = btoa(`${clientId}:${clientSecret}`);
    const response = await fetch('https://oauth.fatsecret.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      }).toString()
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Token response text:', responseText);
      throw new Error(`Invalid token response: ${responseText.substring(0, 100)}`);
    }
    
    if (!data.access_token) {
      console.error('FatSecret token response:', data);
      throw new Error(`Failed to get FatSecret access token: ${data.error || 'unknown error'}`);
    }

    // Cache token for 55 minutes (FatSecret tokens expire in 1 hour)
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + ((data.expires_in || 3600) * 1000 * 0.9);

    return cachedToken;
  } catch (error) {
    console.error('Token fetch error:', error);
    throw error;
  }
};

const searchFoods = async (query, token) => {
  // Use Standard API foods.search method (more compatible)
  const response = await fetch('https://platform.fatsecret.com/rest/server.api', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      method: 'foods.search',
      search_expression: query,
      max_results: '50',
      format: 'json'
    }).toString()
  });

  const responseText = await response.text();
  
  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    console.error('Search parse error:', responseText.substring(0, 200));
    return [];
  }
  
  let foods = data.foods?.food || [];
  
  if (!Array.isArray(foods) && foods) {
    foods = [foods];
  }
  
  // Sort by relevance: branded items first, then generic
  foods = foods.sort((a, b) => {
    const aBranded = a.brand_name ? 1 : 0;
    const bBranded = b.brand_name ? 1 : 0;
    return bBranded - aBranded;
  });

  return foods.slice(0, 20);
};

const searchBarcode = async (barcode, token) => {
  // Premier API barcode lookup with full US dataset
  const response = await fetch('https://platform.fatsecret.com/rest/server.api', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      method: 'food.find_id_for_barcode',
      barcode: barcode,
      format: 'json',
      region: 'US'
    }).toString()
  });

  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    console.error('Barcode response:', responseText.substring(0, 200));
    return null;
  }

  return data.food_id?.value || null;
};

const getFoodDetails = async (foodId, token) => {
  // Use food.get.v2 for Premier detailed serving data
  const response = await fetch('https://platform.fatsecret.com/rest/server.api', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      method: 'food.get.v2',
      food_id: foodId,
      format: 'json'
    }).toString()
  });

  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    console.error('Food details response:', responseText.substring(0, 200));
    return null;
  }
  
  return data.food || null;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, query, foodId, barcode } = await req.json();
    console.log('Action:', action, 'Query:', query, 'FoodID:', foodId);

    const token = await getAccessToken();
    console.log('Token obtained:', token ? 'YES' : 'NO');

    if (action === 'search') {
      console.log('Search query:', query);
      const results = await searchFoods(query, token);
      console.log('Search results count:', results.length);
      
      const foods = results.map(food => ({
        id: String(food.food_id),
        name: food.food_name,
        brand: food.brand_name || '',
        servingSize: food.serving_size || '100g',
        calories: parseFloat(food.calories) || 0,
        protein: parseFloat(food.protein) || 0,
        carbs: parseFloat(food.carbohydrates) || 0,
        fat: parseFloat(food.fat) || 0,
        fiber: parseFloat(food.fiber) || 0,
        source: 'fatsecret'
      }));

      console.log('Formatted foods:', JSON.stringify(foods.slice(0, 2)));
      return Response.json({ foods });
    }

    if (action === 'barcode') {
      const foodId = await searchBarcode(barcode, token);
      
      if (!foodId) {
        return Response.json({ error: 'Product not found' }, { status: 404 });
      }

      // Fetch full food details
      const food = await getFoodDetails(foodId, token);
      
      if (!food) {
        return Response.json({ error: 'Food details not found' }, { status: 404 });
      }

      const servings = food.servings?.serving || [];
      const servingArray = Array.isArray(servings) ? servings : [servings];
      const defaultServing = servingArray.find(s => s.is_default === "1") || servingArray[0];

      const availableUnits = servingArray.map(serving => {
        const servingDesc = serving.serving_description || serving.measurement_description || 'serving';
        const isDefault = serving.is_default === "1";
        
        return {
          servingDescription: servingDesc,
          unit: serving.measurement_description || 'serving',
          amount: parseFloat(serving.metric_serving_amount) || 100,
          metricUnit: serving.metric_serving_unit || 'g',
          calories: parseFloat(serving.calories) || 0,
          protein: parseFloat(serving.protein) || 0,
          carbs: parseFloat(serving.carbohydrates) || 0,
          fat: parseFloat(serving.fat) || 0,
          fiber: parseFloat(serving.fiber) || 0,
          isDefault: isDefault
        };
      });

      const foodData = {
        id: food.food_id,
        name: food.food_name,
        brand: food.brand_name || '',
        servingSize: defaultServing?.serving_size || '100g',
        servingDescription: defaultServing?.measurement_description || 'serving',
        calories: parseFloat(defaultServing?.calories) || 0,
        protein: parseFloat(defaultServing?.protein) || 0,
        carbs: parseFloat(defaultServing?.carbohydrates) || 0,
        fat: parseFloat(defaultServing?.fat) || 0,
        fiber: parseFloat(defaultServing?.fiber) || 0,
        barcode: barcode,
        availableUnits: availableUnits
      };

      return Response.json({ food: foodData });
    }

    if (action === 'get') {
      const food = await getFoodDetails(foodId, token);
      
      if (!food) {
        return Response.json({ error: 'Food not found' }, { status: 404 });
      }

      const servings = food.servings?.serving || [];
      const servingArray = Array.isArray(servings) ? servings : [servings];
      
      // Find default serving (is_default: "1") or use first
      const defaultServing = servingArray.find(s => s.is_default === "1") || servingArray[0];

      // Extract all available units with their nutritional data
      const availableUnits = servingArray.map(serving => {
        const servingDesc = serving.serving_description || serving.measurement_description || 'serving';
        const isDefault = serving.is_default === "1";
        
        return {
          servingDescription: servingDesc,
          unit: serving.measurement_description || 'serving',
          amount: parseFloat(serving.metric_serving_amount) || 100,
          metricUnit: serving.metric_serving_unit || 'g',
          calories: parseFloat(serving.calories) || 0,
          protein: parseFloat(serving.protein) || 0,
          carbs: parseFloat(serving.carbohydrates) || 0,
          fat: parseFloat(serving.fat) || 0,
          fiber: parseFloat(serving.fiber) || 0,
          isDefault: isDefault
        };
      });

      const foodData = {
        id: food.food_id,
        name: food.food_name,
        brand: food.brand_name || '',
        defaultUnit: defaultServing?.measurement_description || 'g',
        defaultAmount: parseFloat(defaultServing?.metric_serving_amount) || 100,
        defaultMetricUnit: defaultServing?.metric_serving_unit || 'g',
        calories: parseFloat(defaultServing?.calories) || 0,
        protein: parseFloat(defaultServing?.protein) || 0,
        carbs: parseFloat(defaultServing?.carbohydrates) || 0,
        fat: parseFloat(defaultServing?.fat) || 0,
        fiber: parseFloat(defaultServing?.fiber) || 0,
        availableUnits: availableUnits
      };

      return Response.json({ food: foodData });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});