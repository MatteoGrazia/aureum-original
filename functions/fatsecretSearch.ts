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
    const response = await fetch('https://oauth.fatsecret.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
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
  const response = await fetch('https://platform.fatsecret.com/rest/server.api', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      method: 'foods.search',
      search_expression: query,
      page_size: '20',
      format: 'json'
    }).toString()
  });

  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    console.error('Search response:', responseText.substring(0, 200));
    return [];
  }
  
  return data.foods?.food || [];
};

const getFoodDetails = async (foodId, token) => {
  const response = await fetch('https://platform.fatsecret.com/rest/server.api', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      method: 'food.get',
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

    const { action, query, foodId } = await req.json();

    const token = await getAccessToken();

    if (action === 'search') {
      const results = await searchFoods(query, token);
      
      const foods = results.map(food => ({
        id: food.food_id,
        name: food.food_name,
        brand: food.brand_name || '',
        servingSize: food.serving_size || '100g',
        calories: parseFloat(food.calories) || 0,
        protein: parseFloat(food.protein) || 0,
        carbs: parseFloat(food.carbohydrates) || 0,
        fat: parseFloat(food.fat) || 0,
        fiber: parseFloat(food.fiber) || 0
      }));

      return Response.json({ foods });
    }

    if (action === 'get') {
      const food = await getFoodDetails(foodId, token);
      
      if (!food) {
        return Response.json({ error: 'Food not found' }, { status: 404 });
      }

      const servings = food.servings?.serving || [];
      const defaultServing = Array.isArray(servings) ? servings[0] : servings;

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
        servings: servings
      };

      return Response.json({ food: foodData });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});