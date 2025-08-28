// Edge Function: profile-manager - VERSION CORRIGÉE
// Gestion complète des profils utilisateur (création, modification, synchronisation)

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
        const requestData = await req.json();
        const { action, userId, profileData, userType } = requestData;

        // Obtenir les variables d'environnement
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Variables d\'environnement Supabase manquantes');
        }

        // Headers pour les requêtes Supabase
        const supabaseHeaders = {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        let result;

        switch (action) {
            case 'update_profile':
                result = await updateProfile(supabaseUrl, supabaseHeaders, userId, profileData);
                break;
            
            case 'update_student_profile':
                result = await updateStudentProfile(supabaseUrl, supabaseHeaders, userId, profileData);
                break;
            
            case 'update_institution_profile':
                result = await updateInstitutionProfile(supabaseUrl, supabaseHeaders, userId, profileData);
                break;
            
            case 'get_full_profile':
                result = await getFullProfile(supabaseUrl, supabaseHeaders, userId);
                break;
            
            case 'switch_user_type':
                result = await switchUserType(supabaseUrl, supabaseHeaders, userId, userType);
                break;
            
            default:
                throw new Error(`Action non supportée: ${action}`);
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Erreur profile-manager:', error);
        const errorResponse = {
            error: {
                code: 'PROFILE_MANAGER_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Met à jour le profil principal - CORRIGÉ pour utiliser 'id' au lieu de 'user_id'
async function updateProfile(supabaseUrl: string, headers: Record<string, string>, userId: string, profileData: any) {
    const updateData = {
        ...profileData,
        updated_at: new Date().toISOString()
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur mise à jour profil: ${response.status} - ${errorText}`);
    }

    const updatedProfile = await response.json();

    return {
        success: true,
        data: updatedProfile[0] || null
    };
}

// Met à jour le profil étudiant - CORRIGÉ pour utiliser 'profile_id' au lieu de 'user_id'
async function updateStudentProfile(supabaseUrl: string, headers: Record<string, string>, userId: string, profileData: any) {
    const updateData = {
        ...profileData,
        updated_at: new Date().toISOString()
    };

    // Vérifier si le profil étudiant existe
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/student_profiles?profile_id=eq.${userId}`, {
        method: 'GET',
        headers
    });

    if (!checkResponse.ok) {
        throw new Error(`Erreur vérification profil étudiant: ${checkResponse.status}`);
    }

    const existingProfiles = await checkResponse.json();

    if (existingProfiles.length === 0) {
        // Créer un nouveau profil étudiant
        const createResponse = await fetch(`${supabaseUrl}/rest/v1/student_profiles`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                id: crypto.randomUUID(),
                profile_id: userId, // CORRIGÉ: utiliser profile_id au lieu de user_id
                ...updateData,
                created_at: new Date().toISOString()
            })
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Erreur création profil étudiant: ${createResponse.status} - ${errorText}`);
        }

        const createdProfile = await createResponse.json();
        return {
            success: true,
            data: createdProfile[0] || null
        };
    } else {
        // Mettre à jour le profil existant
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/student_profiles?profile_id=eq.${userId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Erreur mise à jour profil étudiant: ${updateResponse.status} - ${errorText}`);
        }

        const updatedProfile = await updateResponse.json();
        return {
            success: true,
            data: updatedProfile[0] || null
        };
    }
}

// Met à jour le profil institution - CORRIGÉ pour utiliser 'profile_id' au lieu de 'user_id'
async function updateInstitutionProfile(supabaseUrl: string, headers: Record<string, string>, userId: string, profileData: any) {
    const updateData = {
        ...profileData,
        updated_at: new Date().toISOString()
    };

    // Vérifier si le profil institution existe
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/institution_profiles?profile_id=eq.${userId}`, {
        method: 'GET',
        headers
    });

    if (!checkResponse.ok) {
        throw new Error(`Erreur vérification profil institution: ${checkResponse.status}`);
    }

    const existingProfiles = await checkResponse.json();

    if (existingProfiles.length === 0) {
        // Créer un nouveau profil institution
        const createResponse = await fetch(`${supabaseUrl}/rest/v1/institution_profiles`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                id: crypto.randomUUID(),
                profile_id: userId, // CORRIGÉ: utiliser profile_id au lieu de user_id
                ...updateData,
                created_at: new Date().toISOString()
            })
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Erreur création profil institution: ${createResponse.status} - ${errorText}`);
        }

        const createdProfile = await createResponse.json();
        return {
            success: true,
            data: createdProfile[0] || null
        };
    } else {
        // Mettre à jour le profil existant
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/institution_profiles?profile_id=eq.${userId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Erreur mise à jour profil institution: ${updateResponse.status} - ${errorText}`);
        }

        const updatedProfile = await updateResponse.json();
        return {
            success: true,
            data: updatedProfile[0] || null
        };
    }
}

// Récupère le profil complet - CORRIGÉ pour utiliser les bons noms de colonnes
async function getFullProfile(supabaseUrl: string, headers: Record<string, string>, userId: string) {
    // Récupérer le profil principal
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'GET',
        headers
    });

    if (!profileResponse.ok) {
        throw new Error(`Erreur récupération profil: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    const profile = profileData[0] || null;

    if (!profile) {
        throw new Error('Profil non trouvé');
    }

    let specificProfile = null;

    if (profile.user_type === 'student') {
        const studentResponse = await fetch(`${supabaseUrl}/rest/v1/student_profiles?profile_id=eq.${userId}`, {
            method: 'GET',
            headers
        });
        if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            specificProfile = studentData[0] || null;
        }
    } else if (profile.user_type === 'institution') {
        const institutionResponse = await fetch(`${supabaseUrl}/rest/v1/institution_profiles?profile_id=eq.${userId}`, {
            method: 'GET',
            headers
        });
        if (institutionResponse.ok) {
            const institutionData = await institutionResponse.json();
            specificProfile = institutionData[0] || null;
        }
    }

    return {
        success: true,
        data: {
            profile,
            specificProfile
        }
    };
}

// Change le type d'utilisateur
async function switchUserType(supabaseUrl: string, headers: Record<string, string>, userId: string, newUserType: string) {
    if (!['student', 'institution'].includes(newUserType)) {
        throw new Error('Type d\'utilisateur invalide');
    }

    // Mettre à jour le profil principal
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            user_type: newUserType,
            updated_at: new Date().toISOString()
        })
    });

    if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Erreur changement type utilisateur: ${updateResponse.status} - ${errorText}`);
    }

    return {
        success: true,
        message: `Type d'utilisateur changé en ${newUserType}`
    };
}
