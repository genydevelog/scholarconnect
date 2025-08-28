import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { invokeEdgeFunction } from '@/lib/supabase';
import { GraduationCap, BookOpen, Award, TrendingUp, Users, Calendar, Loader2, Plus, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

interface AcademicFormData {
  current_education_level: string;
  field_of_study: string;
  current_institution: string;
  gpa: string;
  graduation_year: string;
  languages: string[];
  academic_achievements: string[];
  career_goals: string;
  extracurricular_activities: string[];
}

export default function AcademicPage() {
  const { user, profile, studentProfile, updateStudentProfile, loading, isStudent } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AcademicFormData>({
    current_education_level: '',
    field_of_study: '',
    current_institution: '',
    gpa: '',
    graduation_year: '',
    languages: [],
    academic_achievements: [],
    career_goals: '',
    extracurricular_activities: []
  });
  
  const [newLanguage, setNewLanguage] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [newActivity, setNewActivity] = useState('');

  // Calcul du pourcentage de complétion
  const completionPercentage = React.useMemo(() => {
    if (!formData) return 0;
    const requiredFields = ['current_education_level', 'field_of_study', 'current_institution', 'career_goals'];
    const optionalFields = ['gpa', 'graduation_year', 'languages', 'academic_achievements', 'extracurricular_activities'];
    
    const completedRequired = requiredFields.filter(field => {
      const value = formData[field as keyof AcademicFormData];
      return Array.isArray(value) ? value.length > 0 : value && value.trim();
    }).length;
    
    const completedOptional = optionalFields.filter(field => {
      const value = formData[field as keyof AcademicFormData];
      return Array.isArray(value) ? value.length > 0 : value && value.trim();
    }).length;
    
    const requiredScore = (completedRequired / requiredFields.length) * 70;
    const optionalScore = (completedOptional / optionalFields.length) * 30;
    
    return Math.round(requiredScore + optionalScore);
  }, [formData]);

  // Initialiser le formulaire
  useEffect(() => {
    if (studentProfile) {
      setFormData({
        current_education_level: studentProfile.current_education_level || '',
        field_of_study: studentProfile.field_of_study || '',
        current_institution: studentProfile.current_institution || '',
        gpa: studentProfile.gpa || '',
        graduation_year: studentProfile.graduation_year?.toString() || '',
        languages: studentProfile.languages || [],
        academic_achievements: Array.isArray(studentProfile.academic_achievements) 
          ? studentProfile.academic_achievements 
          : studentProfile.academic_achievements ? [studentProfile.academic_achievements] : [],
        career_goals: studentProfile.career_goals || '',
        extracurricular_activities: studentProfile.extracurricular_activities || []
      });
    }
  }, [studentProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gestion des listes
  const addToList = (listName: keyof AcademicFormData, value: string, setValue: (value: string) => void) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [listName]: [...(prev[listName] as string[]), value.trim()]
    }));
    setValue('');
  };

  const removeFromList = (listName: keyof AcademicFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [listName]: (prev[listName] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      
      const updateData = {
        ...formData,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : undefined
      };
      
      // Appeler l'Edge Function spécialisée pour le profil académique
      const response = await invokeEdgeFunction('update-academic-profile', updateData);
      
      if (response.success) {
        toast.success('Profil académique mis à jour avec succès !');
        // Optionnellement, recharger les données du profil
        // window.location.reload();
      } else {
        throw new Error(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Erreur mise à jour profil académique:', error);
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
          <p className="text-gray-600">Chargement de votre profil académique...</p>
        </div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profil académique réservé aux étudiants</h2>
          <p className="text-gray-600">Cette section est disponible uniquement pour les comptes étudiants.</p>
        </div>
      </div>
    );
  }

  const educationLevels = [
    { value: '', label: 'Sélectionnez votre niveau' },
    { value: 'lycee', label: 'Lycée' },
    { value: 'bac', label: 'Baccalauréat' },
    { value: 'bac+1', label: 'Bac+1' },
    { value: 'bac+2', label: 'Bac+2' },
    { value: 'bac+3', label: 'Licence (Bac+3)' },
    { value: 'bac+4', label: 'Bac+4' },
    { value: 'bac+5', label: 'Master (Bac+5)' },
    { value: 'bac+8', label: 'Doctorat (Bac+8)' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8">
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
                <h1 className="text-3xl font-bold text-gray-900">Profil académique</h1>
                <p className="text-gray-600 mt-1">Renseignez vos informations d'études et compétences</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{completionPercentage}%</div>
                <div className="text-sm text-gray-500">Complété</div>
                <div className="flex items-center gap-1 mt-1">
                  {completionPercentage >= 90 && <Award className="w-4 h-4 text-yellow-500 fill-current" />}
                </div>
              </div>
            </div>
            
            {/* Barre de progression animée */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Début</span>
              <span>Profil académique à {completionPercentage}%</span>
            </div>
          </div>
        </motion.div>

        {/* Formulaire principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Éducation actuelle */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Éducation actuelle</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Niveau d'études actuel *</Label>
                  <select
                    name="current_education_level"
                    value={formData.current_education_level}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {educationLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Domaine d'études *</Label>
                  <Input
                    type="text"
                    name="field_of_study"
                    value={formData.field_of_study}
                    onChange={handleInputChange}
                    placeholder="ex: Informatique, Médecine, Droit..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Établissement actuel *</Label>
                  <Input
                    type="text"
                    name="current_institution"
                    value={formData.current_institution}
                    onChange={handleInputChange}
                    placeholder="Nom de votre établissement"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Moyenne générale (GPA)</Label>
                  <Input
                    type="text"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleInputChange}
                    placeholder="ex: 3.5, 15/20, Mention TB..."
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Année de diplômation prévue</Label>
                  <Input
                    type="number"
                    name="graduation_year"
                    value={formData.graduation_year}
                    onChange={handleInputChange}
                    placeholder="2025"
                    min="2024"
                    max="2030"
                  />
                </div>
              </div>
            </Card>

            {/* Compétences et langues */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Compétences linguistiques</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Ajouter une langue (ex: Anglais - Courant)"
                    className="flex-1"
                  />
                  <motion.button
                    type="button"
                    onClick={() => addToList('languages', newLanguage, setNewLanguage)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((language, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => removeFromList('languages', index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Réalisations académiques */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Réalisations académiques</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="Ajouter une réalisation (diplôme, prix, mention...)"
                    className="flex-1"
                  />
                  <motion.button
                    type="button"
                    onClick={() => addToList('academic_achievements', newAchievement, setNewAchievement)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <div className="space-y-2">
                  {formData.academic_achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                    >
                      <span className="text-green-900">{achievement}</span>
                      <button
                        type="button"
                        onClick={() => removeFromList('academic_achievements', index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Activités et objectifs */}
            <Card className="p-6">
              <div className="space-y-6">
                
                {/* Objectifs de carrière */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Objectifs de carrière *</h3>
                  </div>
                  <Textarea
                    name="career_goals"
                    value={formData.career_goals}
                    onChange={handleInputChange}
                    placeholder="Décrivez vos objectifs professionnels et vos aspirations..."
                    rows={4}
                    required
                  />
                </div>
                
                {/* Activités extrascolaires */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Activités extrascolaires</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        placeholder="Ajouter une activité (sport, association, bénévolat...)"
                        className="flex-1"
                      />
                      <motion.button
                        type="button"
                        onClick={() => addToList('extracurricular_activities', newActivity, setNewActivity)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.extracurricular_activities.map((activity, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {activity}
                          <button
                            type="button"
                            onClick={() => removeFromList('extracurricular_activities', index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bouton de sauvegarde */}
            <div className="flex justify-end">
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <GraduationCap className="w-5 h-5" />
                )}
                {saving ? 'Sauvegarde...' : 'Enregistrer le profil académique'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
