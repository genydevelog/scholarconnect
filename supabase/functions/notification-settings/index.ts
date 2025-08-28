// Edge Function: notification-settings
// Gestion des paramètres de notification utilisateur

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
        const { action, userId, settings } = await req.json();

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Variables d\'environnement Supabase manquantes');
        }

        const headers = {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        let result;

        switch (action) {
            case 'update':
                if (!userId || !settings) {
                    throw new Error('userId et settings requis');
                }

                // Vérifier si les paramètres existent déjà
                const checkResponse = await fetch(`${supabaseUrl}/rest/v1/notification_settings?user_id=eq.${userId}`, {
                    method: 'GET',
                    headers
                });

                const existingSettings = await checkResponse.json();

                const settingsData = {
                    user_id: userId,
                    email_notifications: settings.email_notifications || false,
                    push_notifications: settings.push_notifications || false,
                    scholarship_alerts: settings.scholarship_alerts || false,
                    deadline_reminders: settings.deadline_reminders || false,
                    application_updates: settings.application_updates || false,
                    marketing_emails: settings.marketing_emails || false,
                    updated_at: new Date().toISOString()
                };

                let updateResponse;
                if (existingSettings.length === 0) {
                    // Créer nouveaux paramètres
                    updateResponse = await fetch(`${supabaseUrl}/rest/v1/notification_settings`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            ...settingsData,
                            created_at: new Date().toISOString()
                        })
                    });
                } else {
                    // Mettre à jour paramètres existants
                    updateResponse = await fetch(`${supabaseUrl}/rest/v1/notification_settings?user_id=eq.${userId}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify(settingsData)
                    });
                }

                if (!updateResponse.ok) {
                    const errorText = await updateResponse.text();
                    throw new Error(`Erreur sauvegarde paramètres: ${errorText}`);
                }

                const updatedSettings = await updateResponse.json();

                result = {
                    success: true,
                    data: updatedSettings[0] || settingsData,
                    message: 'Paramètres de notification sauvegardés'
                };
                break;

            case 'get':
                if (!userId) {
                    throw new Error('userId requis');
                }

                const getResponse = await fetch(`${supabaseUrl}/rest/v1/notification_settings?user_id=eq.${userId}`, {
                    method: 'GET',
                    headers
                });

                if (!getResponse.ok) {
                    throw new Error('Erreur récupération paramètres');
                }

                const userSettings = await getResponse.json();
                
                result = {
                    success: true,
                    data: userSettings[0] || {
                        email_notifications: true,
                        push_notifications: true,
                        scholarship_alerts: true,
                        deadline_reminders: true,
                        application_updates: true,
                        marketing_emails: false
                    }
                };
                break;

            default:
                throw new Error(`Action non supportée: ${action}`);
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Erreur notification-settings:', error);
        const errorResponse = {
            error: {
                code: 'NOTIFICATION_SETTINGS_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
