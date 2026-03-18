import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, image_url, voice_text } = body;

    if (action === 'scan_meal') {
      // Use AI vision to identify foods in the image
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a nutrition expert AI. Analyze this meal photo and identify ALL food items visible.
For each food item, provide realistic nutritional estimates based on typical portion sizes visible in the image.
Be thorough and include all visible components (sauces, garnishes, drinks, sides).
Return ONLY a JSON object with no markdown.`,
        file_urls: [image_url],
        response_json_schema: {
          type: 'object',
          properties: {
            foods: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  serving_description: { type: 'string' },
                  calories: { type: 'number' },
                  protein: { type: 'number' },
                  carbs: { type: 'number' },
                  fat: { type: 'number' },
                  fiber: { type: 'number' },
                  confidence: { type: 'string', enum: ['high', 'medium', 'low'] }
                }
              }
            }
          }
        }
      });
      return Response.json({ foods: result.foods || [] });
    }

    if (action === 'voice_log') {
      // Use AI to parse voice description into structured food log entries
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a nutrition expert AI. The user has described what they are eating via voice.
Parse this into individual food items with nutritional estimates.
Voice input: "${voice_text}"

Identify each food and quantity mentioned. Use standard nutritional databases for estimates.
Be realistic with portions. If quantities are unclear, use typical serving sizes.
Return ONLY a JSON object with no markdown.`,
        response_json_schema: {
          type: 'object',
          properties: {
            foods: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  serving_description: { type: 'string' },
                  calories: { type: 'number' },
                  protein: { type: 'number' },
                  carbs: { type: 'number' },
                  fat: { type: 'number' },
                  fiber: { type: 'number' }
                }
              }
            }
          }
        }
      });
      return Response.json({ foods: result.foods || [] });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});