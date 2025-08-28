// Edge Function: update-academic-profile
// Update academic profile information for students

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
        const { userId, academicData } = await req.json();

        if (!userId || !academicData) {
            throw new Error('User ID and academic data are required');
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
        
        const academicProfileData = {
            profile_id: userId,
            current_education_level: academicData.current_education_level || academicData.academic_level || null,
            field_of_study: academicData.field_of_study || null,
            gpa: academicData.gpa || null,
            nationality: academicData.nationality || null,
            date_of_birth: academicData.date_of_birth || null,
            languages_spoken: academicData.languages || academicData.languages_spoken || null,
            academic_achievements: academicData.academic_achievements || null,
            work_experience: academicData.work_experience || null,
            financial_need_level: academicData.financial_need_level || null,
            preferred_study_countries: academicData.preferred_countries || academicData.preferred_study_countries || null,
            preferred_study_fields: academicData.preferred_study_fields || null,
            updated_at: new Date().toISOString()
        };

        let response;
        if (existingProfiles.length === 0) {
            // Create new academic profile with UUID
            response = await fetch(`${supabaseUrl}/rest/v1/student_profiles`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id: crypto.randomUUID(),
                    ...academicProfileData,
                    created_at: new Date().toISOString()
                })
            });
        } else {
            // Update existing academic profile
            response = await fetch(`${supabaseUrl}/rest/v1/student_profiles?profile_id=eq.${userId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(academicProfileData)
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update academic profile: ${errorText}`);
        }

        const updatedProfile = await response.json();

        return new Response(JSON.stringify({
            success: true,
            data: updatedProfile[0] || academicProfileData,
            message: 'Academic profile updated successfully'
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Academic profile update error:', error);
        const errorResponse = {
            error: {
                code: 'ACADEMIC_PROFILE_UPDATE_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});