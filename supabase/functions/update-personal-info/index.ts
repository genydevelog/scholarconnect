// Edge Function: update-personal-info
// Update user personal information

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
        const { userId, personalData } = await req.json();

        if (!userId || !personalData) {
            throw new Error('User ID and personal data are required');
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

        const profileData = {
            full_name: personalData.full_name || null,
            phone: personalData.phone || null,
            bio: personalData.bio || null,
            city: personalData.city || null,
            country: personalData.country || null,
            website: personalData.website || null,
            updated_at: new Date().toISOString()
        };

        const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update personal information: ${errorText}`);
        }

        const updatedProfile = await response.json();

        return new Response(JSON.stringify({
            success: true,
            data: updatedProfile[0] || profileData,
            message: 'Personal information updated successfully'
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Personal info update error:', error);
        const errorResponse = {
            error: {
                code: 'PERSONAL_INFO_UPDATE_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
