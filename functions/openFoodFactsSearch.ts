import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { barcode } = await req.json();
    if (!barcode) return Response.json({ error: 'Barcode required' }, { status: 400 });

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      { headers: { 'User-Agent': 'AureumApp/1.0 (contact@aureumapp.com)' } }
    );

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return Response.json({ found: false });
    }

    const p = data.product;
    const n = p.nutriments || {};

    const kcal = n['energy-kcal_100g'] ||
      (n['energy-kj_100g'] ? Math.round(n['energy-kj_100g'] / 4.184) : 0) ||
      (n['energy_100g'] ? Math.round(n['energy_100g'] / 4.184) : 0) || 0;

    return Response.json({
      found: true,
      product: {
        name: p.product_name || p.product_name_en || 'Unknown Product',
        brand: p.brands || '',
        image: p.image_front_url || p.image_url || null,
        calories_100g: Math.round(kcal),
        protein_100g: Math.round((n['proteins_100g'] || 0) * 10) / 10,
        carbs_100g: Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
        fat_100g: Math.round((n['fat_100g'] || 0) * 10) / 10,
        fiber_100g: Math.round((n['fiber_100g'] || 0) * 10) / 10,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});