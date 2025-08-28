// Edge Function: update-goals
// Update user goals and preferences

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { userId, goalsData } = await req.json();

        if (!userId || !goalsData) {
            throw new Error('User ID and goals data are required');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables');
        }

        const headers = {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        // Check if student profile exists
        const checkResponse = await fetch(`${supabaseUrl}/rest/v1/student_profiles?profile_id=eq.${userId}`, {
            method: 'GET',
            headers
        });

        const existingProfiles = await checkResponse.json();
        
        const goalsProfileData = {
            profile_id: userId,
            preferred_study_countries: goalsData.preferred_countries || goalsData.preferred_study_countries || null,
            preferred_study_fields: goalsData.preferred_study_fields || null,
            financial_need_level: goalsData.financial_need_level || null,
            updated_at: new Date().toISOString()
        };

        let response;
        if (existingProfiles.length === 0) {
            // Create new profile with goals and UUID
            response = await fetch(`${supabaseUrl}/rest/v1/student_profiles`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id: crypto.randomUUID(),
                    ...goalsProfileData,
                    created_at: new Date().toISOString()
                })
            });
        } else {
            // Update existing profile with goals
            response = await fetch(`${supabaseUrl}/rest/v1/student_profiles?profile_id=eq.${userId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(goalsProfileData)
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update goals: ${errorText}`);
        }

        const updatedProfile = await response.json();

        return new Response(JSON.stringify({
            success: true,
            data: updatedProfile[0] || goalsProfileData,
            message: 'Goals updated successfully'
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Goals update error:', error);
        const errorResponse = {
            error: {
                code: 'GOALS_UPDATE_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});