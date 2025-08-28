// Edge Function: profile-image-upload
// Gère l'upload et la suppression des images de profil utilisateur

Deno.serve(async (req) => {
  // Headers CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  // Réponse aux requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Vérification de la méthode
    if (req.method !== 'POST') {
      throw new Error('Méthode non autorisée');
    }

    // Extraction des données de la requête
    const requestData = await req.json();
    const { action, userId, fileData, fileName, oldImageUrl } = requestData;

    // Vérification des paramètres requis
    if (!action || !userId) {
      throw new Error('Paramètres manquants (action, userId)');
    }

    // Récupération du token d'autorisation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token d\'autorisation manquant');
    }

    // Création du client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    let response;

    if (action === 'upload') {
      // Vérification des paramètres pour l'upload
      if (!fileData || !fileName) {
        throw new Error('Données de fichier manquantes pour l\'upload');
      }

      try {
        // Conversion du fileData (data URL) en bytes
        const base64Data = fileData.split(',')[1];
        const bytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Upload du fichier dans Supabase Storage
        const filePath = `profiles/${userId}/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, bytes, {
            contentType: 'image/*',
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Erreur upload: ${uploadError.message}`);
        }

        // Récupération de l'URL publique
        const { data: urlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath);

        if (!urlData.publicUrl) {
          throw new Error('Impossible de récupérer l\'URL publique');
        }

        // Suppression de l'ancienne image si elle existe
        if (oldImageUrl) {
          try {
            const oldPath = oldImageUrl.split('/').slice(-2).join('/');
            await supabase.storage
              .from('profile-images')
              .remove([oldPath]);
          } catch (deleteError) {
            console.warn('Erreur lors de la suppression de l\'ancienne image:', deleteError);
            // On continue même si la suppression échoue
          }
        }

        // Mise à jour du profil avec la nouvelle URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            profile_image_url: urlData.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          throw new Error(`Erreur mise à jour profil: ${updateError.message}`);
        }

        response = {
          success: true,
          data: {
            message: 'Image de profil uploadée avec succès',
            imageUrl: urlData.publicUrl
          }
        };

      } catch (uploadErr: any) {
        throw new Error(`Erreur durant l'upload: ${uploadErr.message}`);
      }

    } else if (action === 'delete') {
      // Suppression de l'image existante
      if (oldImageUrl) {
        try {
          const oldPath = oldImageUrl.split('/').slice(-2).join('/');
          const { error: deleteError } = await supabase.storage
            .from('profile-images')
            .remove([oldPath]);

          if (deleteError) {
            console.warn('Erreur suppression fichier:', deleteError.message);
          }
        } catch (deleteErr) {
          console.warn('Erreur lors de la suppression du fichier:', deleteErr);
        }
      }

      // Mise à jour du profil pour supprimer l'URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Erreur mise à jour profil: ${updateError.message}`);
      }

      response = {
        success: true,
        data: {
          message: 'Image de profil supprimée avec succès'
        }
      };

    } else {
      throw new Error('Action non supportée. Utilisez "upload" ou "delete"');
    }

    console.log(`Action ${action} réussie pour l'utilisateur:`, userId);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Erreur dans profile-image-upload:', error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'Erreur interne du serveur'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
