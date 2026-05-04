import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { imageBase64, userNote } = await req.json();
    if (!imageBase64) return Response.json({ error: 'imageBase64 required' }, { status: 400 });

    // Strip data URI prefix if present, get raw base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Upload the image so InvokeLLM can use it via file_urls
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const file = new File([blob], 'meal.jpg', { type: 'image/jpeg' });

    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    const contextNote = userNote
      ? `\n\nUser context: "${userNote}". Use this to improve portion and ingredient accuracy.`
      : '';

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      prompt: `You are a precision nutrition expert. Analyse this meal photo and identify ALL visible food items including sauces, sides, garnishes, and drinks.
For each item provide realistic nutritional estimates per the visible portion.
Also assess overall confidence: "high" if the meal is clearly identifiable, "medium" if some items or portions are uncertain, "low" if the image is unclear or the meal is ambiguous.
If confidence is not high, provide a brief confidence_reason.
List any significant estimation caveats in warnings (e.g. "sauce quantity estimated").
Generate a short descriptive meal name.${contextNote}
Return ONLY valid JSON, no markdown.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          meal_name: { type: 'string' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          confidence_reason: { type: 'string' },
          total: {
            type: 'object',
            properties: {
              calories: { type: 'number' },
              protein: { type: 'number' },
              carbs: { type: 'number' },
              fat: { type: 'number' },
              fiber: { type: 'number' }
            }
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                quantity: { type: 'number' },
                unit: { type: 'string' },
                calories: { type: 'number' },
                protein: { type: 'number' },
                carbs: { type: 'number' },
                fat: { type: 'number' },
                notes: { type: 'string' }
              }
            }
          },
          warnings: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Compute total from items if missing
    if (!result.total && result.items?.length) {
      result.total = result.items.reduce((acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0),
        fiber: acc.fiber + (item.fiber || 0),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
    }

    return Response.json({
      meal_name: result.meal_name || 'Scanned Meal',
      confidence: result.confidence || 'medium',
      confidence_reason: result.confidence_reason || '',
      total: result.total || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      items: result.items || [],
      warnings: result.warnings || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});