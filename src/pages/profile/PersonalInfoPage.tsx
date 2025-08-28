import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { invokeEdgeFunction } from '@/lib/supabase';
import { User, Mail, Phone, MapPin, Globe, Camera, Save, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import toast from 'react-hot-toast';

interface PersonalFormData {
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  city: string;
  country: string;
  website: string;
}

export default function PersonalInfoPage() {
  const { user, profile, updateProfile, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PersonalFormData>({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    country: '',
    website: ''
  });

  // Calcul du pourcentage de complétion
  const completionPercentage = React.useMemo(() => {
    if (!formData) return 0;
    const fields = ['full_name', 'phone', 'bio', 'city', 'country'];
    const completedFields = fields.filter(field => formData[field as keyof PersonalFormData]?.trim());
    return Math.round((completedFields.length / fields.length) * 100);
  }, [formData]);

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        city: profile.city || '',
        country: profile.country || '',
        website: profile.website || ''
      });
    }
  }, [profile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      
      const updateData = {
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
        city: formData.city,
        country: formData.country,
        website: formData.website
      };
      
      // Appeler l'Edge Function spécialisée pour le profil personnel
      const response = await invokeEdgeFunction('update-personal-info', updateData);
      
      if (response.success) {
        toast.success('Informations personnelles mises à jour avec succès !');
      } else {
        throw new Error(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Erreur mise à jour profil:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
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
                <h1 className="text-3xl font-bold text-gray-900">Informations personnelles</h1>
                <p className="text-gray-600 mt-1">Gérez vos informations de contact et votre bio</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
                <div className="text-sm text-gray-500">Complété</div>
              </div>
            </div>
            
            {/* Barre de progression animée */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Début</span>
              <span>Complété à {completionPercentage}%</span>
            </div>
          </div>
        </motion.div>

        {/* Formulaire principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Nom complet *
                  </Label>
                  <Input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Votre nom complet"
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">L'email ne peut pas être modifié</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Téléphone
                  </Label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+33 1 23 45 67 89"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Site web
                  </Label>
                  <Input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://votre-site.com"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Localisation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Ville
                  </Label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Paris"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Pays
                  </Label>
                  <Input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="France"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  À propos de vous
                </Label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Parlez-nous de vous, vos passions, vos objectifs..."
                  rows={4}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500">{formData.bio.length}/1000 caractères</p>
              </div>

              {/* Bouton de sauvegarde */}
              <div className="flex justify-end pt-6">
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                </motion.button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
