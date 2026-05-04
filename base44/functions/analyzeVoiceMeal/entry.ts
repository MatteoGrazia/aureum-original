import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FOOD_ANALYSIS_PROMPT = `You are a professional nutritionist. The user has described their meal either by voice or by typing. Your job is to:

1. If audio is provided, transcribe exactly what was said
2. Identify every food item, ingredient, drink, and sauce mentioned
3. Estimate realistic portion sizes. If the user gives explicit quantities use them exactly. If vague, use standard serving sizes.
4. Calculate accurate macros for each item using verified nutritional data
5. Sum everything for the meal total

STANDARD PORTION SIZES:
- "a bowl of oats" = 80g dry oats
- "two eggs" = 2 large eggs = 120g total
- "a slice of bread" = 35g
- "a coffee with milk" = 240ml coffee plus 30ml whole milk
- "a handful of almonds" = 30g
- "a chicken breast" = 150g cooked
- "a glass of juice" = 200ml
- "large" = add 30 percent to standard size
- "small" = subtract 30 percent from standard size
- "extra" or "double" = multiply by 2
- "half" = divide by 2

ACCURACY RULES:
- Never return suspiciously round numbers
- Account for butter, oil, sauces even if only implied by cooking method
- If something is ambiguous, use the most common interpretation and flag it in warnings
- Include the full transcript so the user can verify you heard correctly

RETURN ONLY valid JSON, no markdown, exactly this structure:
{
  "transcript": "Exact transcription or echo of what the user typed",
  "meal_name": "Short descriptive meal name",
  "confidence": "high",
  "confidence_reason": "",
  "total": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0 },
  "items": [
    { "name": "", "quantity": 0, "unit": "g", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "notes": "" }
  ],
  "warnings": []
}`;

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const { audioBase64, mimeType = 'audio/webm', textInput = '' } = await req.json();

    if (!audioBase64 && !textInput) {
      return Response.json({ error: 'audioBase64 or textInput is required' }, { status: 400, headers: corsHeaders });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500, headers: corsHeaders });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const parts = [];

    if (audioBase64) {
      parts.push({ inline_data: { mime_type: mimeType, data: audioBase64 } });
    }

    const userText = textInput
      ? `The user typed this meal description: "${textInput}". Analyze it and return the nutrition breakdown.`
      : 'The user described their meal by voice in the audio above. Transcribe it and return the full nutrition breakdown.';

    parts.push({ text: FOOD_ANALYSIS_PROMPT + '\n\n' + userText });

    const body = {
      contents: [{ parts }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 2048, responseMimeType: 'application/json' },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let geminiResponse;
    try {
      geminiResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return Response.json({ error: 'Gemini API error', detail: errText }, { status: 502, headers: corsHeaders });
    }

    const data = await geminiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return Response.json({ error: 'No response from Gemini' }, { status: 502, headers: corsHeaders });
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
      else throw new Error('Failed to parse Gemini response');
    }

    const sanitiseItem = (item) => ({
      name: item.name || 'Unknown item',
      quantity: Number(item.quantity) || 100,
      unit: item.unit || 'g',
      calories: Math.max(0, Math.round(Number(item.calories) || 0)),
      protein: Math.max(0, Math.round((Number(item.protein) || 0) * 10) / 10),
      carbs: Math.max(0, Math.round((Number(item.carbs) || 0) * 10) / 10),
      fat: Math.max(0, Math.round((Number(item.fat) || 0) * 10) / 10),
      notes: item.notes || '',
    });

    const sanitised = {
      transcript: result.transcript || textInput || '',
      meal_name: result.meal_name || 'Voice Logged Meal',
      confidence: result.confidence || 'medium',
      confidence_reason: result.confidence_reason || '',
      total: {
        calories: Math.max(0, Math.round(Number(result.total?.calories) || 0)),
        protein: Math.max(0, Math.round((Number(result.total?.protein) || 0) * 10) / 10),
        carbs: Math.max(0, Math.round((Number(result.total?.carbs) || 0) * 10) / 10),
        fat: Math.max(0, Math.round((Number(result.total?.fat) || 0) * 10) / 10),
        fiber: Math.max(0, Math.round((Number(result.total?.fiber) || 0) * 10) / 10),
      },
      items: (result.items || []).map(sanitiseItem),
      warnings: result.warnings || [],
    };

    return Response.json(sanitised, { status: 200, headers: corsHeaders });
  } catch (err) {
    if (err.name === 'AbortError') {
      return Response.json({ error: 'timeout', message: 'Analysis timed out. Please try again.' }, { status: 504, headers: corsHeaders });
    }
    return Response.json({ error: 'internal_error', message: err.message }, { status: 500, headers: corsHeaders });
  }
});