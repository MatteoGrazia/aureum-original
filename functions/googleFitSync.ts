import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const GOOGLE_FIT_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_FIT_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_FIT_API_URL = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';

const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User data:', JSON.stringify(user, null, 2));

    const url = new URL(req.url);
    let action = url.searchParams.get('action');
    let code = url.searchParams.get('code');
    
    // If action/code not in query params, try to parse from body
    if (!action && req.method === 'POST') {
      try {
        const body = await req.json();
        action = body.action;
        code = body.code;
      } catch (e) {
        // Body is not JSON, continue with query params
      }
    }

    // Step 1: Initiate OAuth flow
    if (action === 'init') {
      const redirectUri = 'https://aureumfitness.base44.app/Activity';
      const authUrl = new URL(GOOGLE_FIT_AUTH_URL);
      authUrl.searchParams.set('client_id', Deno.env.get('GOOGLE_FIT_CLIENT_ID'));
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', SCOPES.join(' '));
      authUrl.searchParams.set('access_type', 'offline');

      return Response.json({ 
        authUrl: authUrl.toString(),
        redirectUri: redirectUri
      });
    }

    // Step 2: Handle OAuth callback - exchange code for token
    if (action === 'exchange' && code) {
      const redirectUri = 'https://aureumfitness.base44.app/Activity';
      
      const tokenResponse = await fetch(GOOGLE_FIT_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: Deno.env.get('GOOGLE_FIT_CLIENT_ID'),
          client_secret: Deno.env.get('GOOGLE_FIT_CLIENT_SECRET'),
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        return Response.json({ error: 'Failed to get access token from Google' }, { status: 400 });
      }

      // Store the refresh token in UserProfile for future syncs
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, {
          google_fit_refresh_token: tokenData.refresh_token,
        });
      } else {
        await base44.entities.UserProfile.create({
          google_fit_refresh_token: tokenData.refresh_token,
        });
      }

      return Response.json({
        success: true,
        message: 'Google Fit connected successfully'
      });
    }

    // Step 3: Sync step data from Google Fit to DailyActivity
    if (action === 'sync') {
      // Fetch the user's profile to get the refresh token (stored in UserProfile entity)
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      const refreshToken = profiles[0]?.google_fit_refresh_token;
      
      if (!refreshToken) {
        return Response.json({ error: 'Google Fit not connected. Please authorize first.' }, { status: 400 });
      }

      // Refresh the access token using refresh token
      const refreshResponse = await fetch(GOOGLE_FIT_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: Deno.env.get('GOOGLE_FIT_CLIENT_ID'),
          client_secret: Deno.env.get('GOOGLE_FIT_CLIENT_SECRET'),
          grant_type: 'refresh_token',
        }).toString(),
      });

      const refreshData = await refreshResponse.json();
      
      if (!refreshData.access_token) {
        return Response.json({ error: 'Failed to refresh access token', details: refreshData }, { status: 400 });
      }

      const accessToken = refreshData.access_token;

      // Fetch step data from Google Fit (last 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stepDataResponse = await fetch(GOOGLE_FIT_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregateBy: [
            {
              dataTypeName: 'com.google.step_count.delta',
              dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
            },
          ],
          bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
          startTimeMillis: Math.floor(thirtyDaysAgo.getTime()),
          endTimeMillis: Math.floor(now.getTime()),
        }),
      });

      const stepData = await stepDataResponse.json();
      
      if (stepData.error) {
        return Response.json({ error: 'Google Fit API error', details: stepData.error }, { status: 400 });
      }

      // Fetch all existing DailyActivity records at once
      const allActivity = await base44.entities.DailyActivity.list();
      const activityMap = new Map(allActivity.map(a => [a.date, a]));

      // Prepare batch updates
      const toCreate = [];
      const toUpdate = [];
      
      if (stepData.bucket && Array.isArray(stepData.bucket)) {
        for (const bucket of stepData.bucket) {
          const bucketDate = new Date(parseInt(bucket.startTimeMillis));
          const dateStr = bucketDate.toISOString().split('T')[0];
          
          const steps = bucket.dataset[0]?.point[0]?.value[0]?.intVal || 0;
          
          const existing = activityMap.get(dateStr);
          
          if (existing) {
            toUpdate.push({ id: existing.id, data: { steps } });
          } else {
            toCreate.push({
              date: dateStr,
              steps,
              active_minutes: 0,
              sedentary_minutes: 0,
              calories_burned: 0,
              water_liters: 0,
            });
          }
        }
      }

      // Execute batch operations
      const results = await Promise.allSettled([
        ...toCreate.map(data => base44.entities.DailyActivity.create(data)),
        ...toUpdate.map(({ id, data }) => base44.entities.DailyActivity.update(id, data))
      ]);

      const successCount = results.filter(r => r.status === 'fulfilled').length;

      return Response.json({
        success: true,
        message: `Synced ${successCount} days of step data from Google Fit`,
        syncedDays: successCount,
        created: toCreate.length,
        updated: toUpdate.length,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});