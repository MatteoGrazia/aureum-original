import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const OFF_HEADERS = { 'User-Agent': 'AureumApp/1.0 (contact@aureumapp.com)' };

async function fetchOFF(barcode, attempt = 1) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
  const res = await fetch(url, { headers: OFF_HEADERS });
  const data = await res.json();
  if (data.status !== 1 && attempt < 3) {
    // Retry with small delay
    await new Promise(r => setTimeout(r, 600 * attempt));
    return fetchOFF(barcode, attempt + 1);
  }
  return data;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { barcode } = await req.json();
    if (!barcode) return Response.json({ error: 'Barcode required' }, { status: 400 });

    const data = await fetchOFF(barcode);

    if (data.status !== 1 || !data.product) {
      return Response.json({ found: false });
    }

    const p = data.product;
    const n = p.nutriments || {};

    const kcal =
      n['energy-kcal_100g'] ||
      (n['energy-kj_100g'] ? Math.round(n['energy-kj_100g'] / 4.184) : 0) ||
      (n['energy_100g'] ? Math.round(n['energy_100g'] / 4.184) : 0) ||
      0;

    return Response.json({
      found: true,
      product: {
        name: p.product_name || p.product_name_en || 'Unknown Product',
        brand: p.brands || '',
        image: p.image_front_url || p.image_url || null,
        calories_100g: Math.round(kcal),
        // Monochromatic Apricot palette applied at source
        protein_100g: Math.round((n['proteins_100g'] || 0) * 10) / 10,   // #FFDAB9
        carbs_100g:   Math.round((n['carbohydrates_100g'] || 0) * 10) / 10, // #FFE5CC
        fat_100g:     Math.round((n['fat_100g'] || 0) * 10) / 10,          // #E1A95F
        fiber_100g:   Math.round((n['fiber_100g'] || 0) * 10) / 10,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});