import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, RotateCw, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

interface ProfilePhotoState {
  currentPhoto: string | null;
  previewPhoto: string | null;
  isUploading: boolean;
  uploadProgress: number;
}

const ProfilePhotoPage: React.FC = () => {
  const [photoState, setPhotoState] = useState<ProfilePhotoState>({
    currentPhoto: null,
    previewPhoto: null,
    isUploading: false,
    uploadProgress: 0
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Vérification du type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('⚠️ Veuillez sélectionner un fichier image valide');
      return;
    }

    // Vérification de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('⚠️ L\'image doit faire moins de 5MB');
      return;
    }

    // Création du preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoState(prev => ({
        ...prev,
        previewPhoto: e.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!photoState.previewPhoto) return;

    setPhotoState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));

    try {
      // Simulation d'upload avec progression
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setPhotoState(prev => ({ ...prev, uploadProgress: i }));
      }

      // Ici nous utiliserons l'API Supabase Storage
      setPhotoState(prev => ({
        ...prev,
        currentPhoto: prev.previewPhoto,
        previewPhoto: null,
        isUploading: false,
        uploadProgress: 0
      }));

      toast.success('🎉 Photo de profil mise à jour avec succès!');
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('⚠️ Erreur lors de l\'upload. Veuillez réessayer.');
      setPhotoState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));
    }
  };

  const handleCancel = () => {
    setPhotoState(prev => ({ ...prev, previewPhoto: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setPhotoState({
      currentPhoto: null,
      previewPhoto: null,
      isUploading: false,
      uploadProgress: 0
    });
    toast.success('🖼️ Photo de profil supprimée');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Camera className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Photo de Profil</h1>
            <p className="text-gray-600">Ajoutez une photo pour personnaliser votre profil</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        {/* Photo actuelle */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/50 rounded-xl p-8 border border-gray-200 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Photo Actuelle</h2>
          
          <div className="flex items-center justify-center">
            {photoState.currentPhoto ? (
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src={photoState.currentPhoto} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  onClick={handleRemovePhoto}
                  variant="danger"
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Zone d'upload */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/50 rounded-xl p-8 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Nouvelle Photo</h2>
          
          {photoState.previewPhoto ? (
            /* Preview de la nouvelle photo */
            <div className="text-center">
              <div className="inline-block relative mb-6">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <img 
                    src={photoState.previewPhoto} 
                    alt="Prévisualisation" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center">
                  <div className="text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded-full">
                    Prévisualisation
                  </div>
                </div>
              </div>
              
              {photoState.isUploading ? (
                /* Barre de progression */
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${photoState.uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Upload en cours... {photoState.uploadProgress}%
                  </p>
                </div>
              ) : (
                /* Boutons d'action */
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="px-6 py-2"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                  <Button
                    onClick={handleUpload}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmer
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Zone de drop */
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragging 
                  ? 'border-purple-400 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className={`p-4 rounded-full ${
                    isDragging ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <Upload className={`w-8 h-8 ${
                      isDragging ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isDragging ? 'Relâchez pour uploader' : 'Glissez votre photo ici'}
                  </h3>
                  <p className="text-gray-500">
                    ou 
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-purple-600 hover:text-purple-700 font-medium underline ml-1"
                    >
                      parcourez vos fichiers
                    </button>
                  </p>
                </div>
                
                <div className="text-sm text-gray-400 space-y-1">
                  <p>• Formats acceptés : JPG, PNG, GIF</p>
                  <p>• Taille maximum : 5MB</p>
                  <p>• Recommandé : 400x400 pixels minimum</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Conseils */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50/50 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Conseils pour une bonne photo</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Utilisez une photo récente et professionnelle</li>
                <li>• Assurez-vous que votre visage est clairement visible</li>
                <li>• Évitez les photos de groupe ou avec des filtres</li>
                <li>• Privilégiez un fond neutre et un bon éclairage</li>
                <li>• La photo sera redimensionnée automatiquement en format carré</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePhotoPage;