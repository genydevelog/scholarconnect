import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Navigate } from 'react-router-dom'
import { 
  Save, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  Globe
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentProfileEditPage() {
  const { user, profile, studentProfile, updateProfile, updateStudentProfile, loading } = useAuth()
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
    
    // Profil étudiant spécifique
    date_of_birth: '',
    nationality: '',
    current_education_level: '',
    field_of_study: '',
    gpa: '',
    languages_spoken: [],
    academic_achievements: '',
    work_experience: ''
  })
  
  const [saving, setSaving] = useState(false)

  // Redirection si non connecté ou pas étudiant
  if (!loading && (!user || profile?.user_type !== 'student')) {
    return <Navigate to="/auth" replace />
  }

  // Chargement initial des données
  useEffect(() => {
    if (profile && studentProfile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        city: profile.city || '',
        country: profile.country || '',
        website: profile.website || '',
        profile_image_url: profile.profile_image_url || '',
        
        date_of_birth: studentProfile.date_of_birth || '',
        nationality: studentProfile.nationality || '',
        current_education_level: studentProfile.current_education_level || '',
        field_of_study: studentProfile.field_of_study || '',
        gpa: studentProfile.gpa?.toString() || '',
        languages_spoken: studentProfile.languages_spoken || [],
        academic_achievements: Array.isArray(studentProfile.academic_achievements) 
          ? studentProfile.academic_achievements.join(', ')
          : '',
        work_experience: studentProfile.work_experience || ''
      })
    }
  }, [profile, studentProfile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const languages = e.target.value.split(',').map(lang => lang.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, languages_spoken: languages }))
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
      
      // Mise à jour du profil étudiant
      const studentData = {
        date_of_birth: formData.date_of_birth || null,
        nationality: formData.nationality,
        current_education_level: formData.current_education_level,
        field_of_study: formData.field_of_study,
        gpa: formData.gpa,
        languages_spoken: formData.languages_spoken,
        academic_achievements: typeof formData.academic_achievements === 'string' 
          ? formData.academic_achievements.split(',').map(s => s.trim()).filter(Boolean)
          : formData.academic_achievements,
        work_experience: formData.work_experience
      }
      
      await updateStudentProfile(studentData)
      
      toast.success('Profil mis à jour avec succès!')
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
            Modifier mon profil étudiant
          </h1>
          <p className="text-gray-600">
            Complétez vos informations pour recevoir des recommandations personnalisées de bourses
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations générales */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Informations générales</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
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
                  Email
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
                  Bio / Présentation
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Présentez-vous brièvement..."
                />
              </div>
            </div>
          </Card>

          {/* Informations académiques */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Informations académiques</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationalité
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau d'études actuel
                </label>
                <select
                  name="current_education_level"
                  value={formData.current_education_level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="high_school">Lycée</option>
                  <option value="bachelor">Licence/Bachelor</option>
                  <option value="master">Master</option>
                  <option value="phd">Doctorat/PhD</option>
                  <option value="postdoc">Post-doctorat</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <BookOpen className="inline h-4 w-4 mr-1" />
                  Domaine d'études
                </label>
                <input
                  type="text"
                  name="field_of_study"
                  value={formData.field_of_study}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Informatique, Médecine, Ingénierie..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Award className="inline h-4 w-4 mr-1" />
                  Moyenne générale (GPA)
                </label>
                <input
                  type="number"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 15.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Langues parlées
                </label>
                <input
                  type="text"
                  value={formData.languages_spoken.join(', ')}
                  onChange={handleLanguageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Français, Anglais, Espagnol (séparées par des virgules)"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Réalisations et expérience */}
        <Card className="p-6 mt-6">
          <div className="flex items-center mb-4">
            <Briefcase className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Réalisations et expérience</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Réalisations académiques
              </label>
              <textarea
                name="academic_achievements"
                value={formData.academic_achievements}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez vos principales réalisations académiques..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expérience professionnelle
              </label>
              <textarea
                name="work_experience"
                value={formData.work_experience}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez votre expérience professionnelle..."
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
