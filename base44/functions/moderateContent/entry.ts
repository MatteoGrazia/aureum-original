import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { post_id, image_url } = await req.json();
    if (!post_id || !image_url) return Response.json({ error: 'Missing post_id or image_url' }, { status: 400 });

    // Use LLM vision to check content appropriateness
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a content moderation system for a premium fitness performance app called Aureum. 
      Analyze this image and determine if it meets "Gold Standard" professional fitness content guidelines.
      
      REJECT if the image contains: explicit nudity, suggestive/sexual content, graphic violence, or non-fitness related inappropriate content.
      APPROVE if the image shows: workout photos, gym equipment, healthy food, athletic performance, progress physique photos that are tasteful and fitness-focused.
      
      Respond ONLY with valid JSON: {"approved": true/false, "reason": "brief reason", "confidence": 0.0-1.0}`,
      file_urls: [image_url],
      response_json_schema: {
        type: "object",
        properties: {
          approved: { type: "boolean" },
          reason: { type: "string" },
          confidence: { type: "number" }
        }
      }
    });

    const approved = result?.approved !== false;
    const confidence = result?.confidence || 0;

    // If rejected with high confidence, hide the post
    if (!approved && confidence >= 0.8) {
      await base44.asServiceRole.entities.PerformanceFeed.update(post_id, { is_hidden: true });
      return Response.json({ approved: false, reason: result?.reason || 'Content flagged', action: 'hidden' });
    }

    return Response.json({ approved: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});