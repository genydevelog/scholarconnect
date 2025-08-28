import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { invokeEdgeFunction } from '@/lib/supabase';
import { Camera, Upload, Trash2, Loader2, User, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function PhotoPage() {
  const { user, profile, updateProfile, loading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Calcul du pourcentage de complétion
  const completionPercentage = profile?.profile_image_url ? 100 : 0;

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Vérifications
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    try {
      setUploading(true);

      // Créer preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload réel avec Edge Function
      const { data } = await invokeEdgeFunction('profile-image-upload', {
        action: 'upload',
        userId: user?.id,
        fileData: await new Promise<string>((resolve) => {
          const fileReader = new FileReader();
          fileReader.onloadend = () => resolve(fileReader.result as string);
          fileReader.readAsDataURL(file);
        }),
        fileName: `${Date.now()}-${file.name}`,
        oldImageUrl: profile?.profile_image_url
      });

      if (data?.success) {
        // Le profil sera automatiquement mis à jour par l'Edge Function
        // Rechargeons les données utilisateur pour récupérer la nouvelle URL
        window.location.reload(); // Rechargement pour récupérer la mise à jour du profil
        toast.success(data.data.message);
      }
    } catch (error: any) {
      console.error('Erreur upload image:', error);
      toast.error(error.message || 'Erreur lors de l\'upload de l\'image');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [user?.id, profile?.profile_image_url]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemovePhoto = async () => {
    if (!user?.id) return;

    try {
      setUploading(true);
      
      const { data } = await invokeEdgeFunction('profile-image-upload', {
        action: 'delete',
        userId: user.id,
        oldImageUrl: profile?.profile_image_url
      });

      if (data?.success) {
        setPreview(null);
        window.location.reload(); // Rechargement pour récupérer la mise à jour
        toast.success(data.data.message);
      }
    } catch (error: any) {
      console.error('Erreur suppression image:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const currentImageUrl = preview || profile?.profile_image_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête avec indicateur de progression */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Photo de profil</h1>
                <p className="text-gray-600 mt-1">Ajoutez une photo pour personnaliser votre profil</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{completionPercentage}%</div>
                <div className="text-sm text-gray-500">Complété</div>
                <div className="flex items-center gap-1 mt-1">
                  {completionPercentage === 100 && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                </div>
              </div>
            </div>
            
            {/* Barre de progression animée */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Aucune photo</span>
              <span>{completionPercentage === 100 ? 'Photo ajoutée' : 'En attente'}</span>
            </div>
          </div>
        </motion.div>

        {/* Zone de photo principale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Prévisualisation */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo actuelle</h3>
                <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg">
                  {currentImageUrl ? (
                    <img
                      src={currentImageUrl}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                {currentImageUrl && (
                  <motion.button
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer la photo
                  </motion.button>
                )}
              </div>

              {/* Zone d'upload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Télécharger une nouvelle photo</h3>
                
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                      ) : (
                        <Camera className="w-8 h-8 text-purple-600" />
                      )}
                    </div>
                    
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {uploading ? 'Téléchargement en cours...' : 'Glissez votre photo ici'}
                      </p>
                      <p className="text-gray-500 mt-1">
                        ou cliquez pour sélectionner un fichier
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 justify-center">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">PNG, JPG jusqu'à 5MB</span>
                    </div>
                  </div>
                </div>
                
                {/* Conseils */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Conseils pour une bonne photo</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Utilisez un fond neutre et bien éclairé</li>
                    <li>• Regardez directement l'objectif</li>
                    <li>• Évitez les selfies trop proches</li>
                    <li>• Privilégiez une photo récente et professionnelle</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
