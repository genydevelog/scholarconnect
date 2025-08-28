import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Navigate } from 'react-router-dom'
import { 
  Save, 
  Upload, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Globe,
  Link as LinkIcon,
  Users,
  Award,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function InstitutionProfileEditPage() {
  const { user, profile, institutionProfile, updateProfile, updateInstitutionProfile, loading } = useAuth()
  const [formData, setFormData] = useState({
    // Profil général
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    country: '',
    website: '',
    profile_image_url: '',
    
    // Profil institution spécifique
    institution_name: '',
    institution_type: '',
    website_url: '',
    description: '',
    contact_person: '',
    contact_email: ''
  })
  
  const [saving, setSaving] = useState(false)

  // Redirection si non connecté ou pas institution
  if (!loading && (!user || profile?.user_type !== 'institution')) {
    return <Navigate to="/auth" replace />
  }

  // Chargement initial des données
  useEffect(() => {
    if (profile && institutionProfile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        city: profile.city || '',
        country: profile.country || '',
        website: profile.website || '',
        profile_image_url: profile.profile_image_url || '',
        
        institution_name: institutionProfile.institution_name || '',
        institution_type: institutionProfile.institution_type || '',
        website_url: institutionProfile.website_url || '',
        description: institutionProfile.description || '',
        contact_person: institutionProfile.contact_person || '',
        contact_email: institutionProfile.contact_email || ''
      })
    }
  }, [profile, institutionProfile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (saving) return
    
    setSaving(true)
    try {
      // Mise à jour du profil général
      const generalData = {
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
        city: formData.city,
        country: formData.country,
        website: formData.website,
        profile_image_url: formData.profile_image_url
      }
      
      await updateProfile(generalData)
      
      // Mise à jour du profil institution
      const institutionData = {
        institution_name: formData.institution_name,
        institution_type: formData.institution_type,
        website_url: formData.website_url,
        description: formData.description,
        contact_person: formData.contact_person,
        contact_email: formData.contact_email
      }
      
      await updateInstitutionProfile(institutionData)
      
      toast.success('Profil institution mis à jour avec succès!')
    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Modifier le profil de votre institution
          </h1>
          <p className="text-gray-600">
            Complétez les informations de votre institution pour mieux présenter vos programmes de bourses
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations générales */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Building2 className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Informations générales</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'affichage *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email principal
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Ville
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Pays
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <LinkIcon className="inline h-4 w-4 mr-1" />
                  Site web
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://"
                />
              </div>
            </div>
          </Card>

          {/* Informations institutionnelles */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Award className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Détails de l'institution</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom officiel de l'institution *
                </label>
                <input
                  type="text"
                  name="institution_name"
                  value={formData.institution_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'institution
                </label>
                <select
                  name="institution_type"
                  value={formData.institution_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="university">Université</option>
                  <option value="college">Collège</option>
                  <option value="school">École spécialisée</option>
                  <option value="research_institute">Institut de recherche</option>
                  <option value="foundation">Fondation</option>
                  <option value="government">Organisation gouvernementale</option>
                  <option value="ngo">Organisation non gouvernementale</option>
                  <option value="company">Entreprise</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site web institutionnel
                </label>
                <input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="inline h-4 w-4 mr-1" />
                  Personne de contact
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom du responsable"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de contact
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email spécifique pour les bourses"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Description détaillée */}
        <Card className="p-6 mt-6">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Description de l'institution</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Présentation générale
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Présentation courte de votre institution..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description détaillée
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Présentez votre institution, vos programmes, votre mission, vos valeurs..."
              />
            </div>
          </div>
        </Card>

        {/* Boutons d'action */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </Button>
        </div>
      </div>
    </div>
  )
}
