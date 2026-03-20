import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users with Google Fit connected
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({});
    const connectedUsers = profiles.filter(p => p.google_fit_refresh_token && p.step_tracking_enabled);

    if (connectedUsers.length === 0) {
      return Response.json({ message: 'No users with Google Fit connected' });
    }

    const results = [];

    for (const profile of connectedUsers) {
      try {
        // Call googleFitSync for each user using their auth context
        // We need to pass the user's email to create a user-scoped client
        const syncResponse = await base44.asServiceRole.functions.invoke('googleFitSync', {
          action: 'sync',
          user_email: profile.created_by
        });

        results.push({
          user: profile.created_by,
          success: syncResponse.data?.success || false,
          syncedDays: syncResponse.data?.syncedDays || 0
        });
      } catch (error) {
        results.push({
          user: profile.created_by,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return Response.json({
      success: true,
      message: `Synced ${successCount} of ${connectedUsers.length} users`,
      results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});