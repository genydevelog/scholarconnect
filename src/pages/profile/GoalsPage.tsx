import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { invokeEdgeFunction } from '@/lib/supabase';
import { Target, MapPin, DollarSign, Calendar, GraduationCap, Plus, X, Save, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Slider } from '@/components/ui/Slider';
import toast from 'react-hot-toast';

interface GoalsFormData {
  preferred_study_countries: string[];
  preferred_study_fields: string[];
  financial_need_level: number;
  study_duration_preference: string;
  budget_range_min: string;
  budget_range_max: string;
  scholarship_priorities: string[];
  career_aspirations: string;
  personal_statement: string;
}

export default function GoalsPage() {
  const { user, profile, studentProfile, updateStudentProfile, loading, isStudent } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<GoalsFormData>({
    preferred_study_countries: [],
    preferred_study_fields: [],
    financial_need_level: 3,
    study_duration_preference: '',
    budget_range_min: '',
    budget_range_max: '',
    scholarship_priorities: [],
    career_aspirations: '',
    personal_statement: ''
  });
  
  const [newCountry, setNewCountry] = useState('');
  const [newField, setNewField] = useState('');
  const [newPriority, setNewPriority] = useState('');

  // Calcul du pourcentage de complétion
  const completionPercentage = React.useMemo(() => {
    if (!formData) return 0;
    
    const requiredFields = ['career_aspirations', 'personal_statement'];
    const listFields = ['preferred_study_countries', 'preferred_study_fields', 'scholarship_priorities'];
    
    const completedRequired = requiredFields.filter(field => {
      const value = formData[field as keyof GoalsFormData];
      return value && String(value).trim();
    }).length;
    
    const completedLists = listFields.filter(field => {
      const value = formData[field as keyof GoalsFormData] as string[];
      return value && value.length > 0;
    }).length;
    
    const hasFinancialInfo = formData.budget_range_min || formData.budget_range_max;
    const hasDuration = formData.study_duration_preference;
    
    const totalSections = requiredFields.length + listFields.length + (hasFinancialInfo ? 1 : 0) + (hasDuration ? 1 : 0);
    const completedSections = completedRequired + completedLists + (hasFinancialInfo ? 1 : 0) + (hasDuration ? 1 : 0);
    
    return Math.round((completedSections / (requiredFields.length + listFields.length + 2)) * 100);
  }, [formData]);

  // Initialiser le formulaire
  useEffect(() => {
    if (studentProfile) {
      setFormData({
        preferred_study_countries: studentProfile.preferred_study_countries || [],
        preferred_study_fields: studentProfile.preferred_study_fields || [],
        financial_need_level: (studentProfile as any).financial_need_level || 3,
        study_duration_preference: (studentProfile as any).study_duration_preference || '',
        budget_range_min: (studentProfile as any).budget_range_min || '',
        budget_range_max: (studentProfile as any).budget_range_max || '',
        scholarship_priorities: (studentProfile as any).scholarship_priorities || [],
        career_aspirations: studentProfile.career_goals || '',
        personal_statement: (studentProfile as any).personal_statement || ''
      });
    }
  }, [studentProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, financial_need_level: value[0] }));
  };

  // Gestion des listes
  const addToList = (listName: keyof GoalsFormData, value: string, setValue: (value: string) => void) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [listName]: [...(prev[listName] as string[]), value.trim()]
    }));
    setValue('');
  };

  const removeFromList = (listName: keyof GoalsFormData, index: number) => {
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
        preferred_study_countries: formData.preferred_study_countries,
        preferred_study_fields: formData.preferred_study_fields,
        career_goals: formData.career_aspirations,
        financial_need_level: formData.financial_need_level,
        study_duration_preference: formData.study_duration_preference,
        budget_range_min: formData.budget_range_min,
        budget_range_max: formData.budget_range_max,
        scholarship_priorities: formData.scholarship_priorities,
        personal_statement: formData.personal_statement
      };
      
      // Appeler l'Edge Function spécialisée pour les objectifs
      const response = await invokeEdgeFunction('update-goals', updateData);
      
      if (response.success) {
        toast.success('Objectifs et préférences mis à jour avec succès !');
      } else {
        throw new Error(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Erreur mise à jour objectifs:', error);
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
          <p className="text-gray-600">Chargement de vos objectifs...</p>
        </div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Objectifs réservés aux étudiants</h2>
          <p className="text-gray-600">Cette section est disponible uniquement pour les comptes étudiants.</p>
        </div>
      </div>
    );
  }

  const studyDurations = [
    { value: '', label: 'Sélectionnez une durée' },
    { value: '1-semester', label: '1 semestre' },
    { value: '1-year', label: '1 an' },
    { value: '2-years', label: '2 ans' },
    { value: '3-years', label: '3 ans' },
    { value: '4-years', label: '4 ans et plus' }
  ];

  const getFinancialNeedLabel = (level: number) => {
    const labels = {
      1: 'Élevée - Ressources limitées',
      2: 'Modérée à élevée',
      3: 'Moyenne - Besoin d\'aide partielle',
      4: 'Faible à modérée',
      5: 'Faible - Principalement pour l\'excellence'
    };
    return labels[level as keyof typeof labels] || 'Non défini';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
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
                <h1 className="text-3xl font-bold text-gray-900">Objectifs et préférences</h1>
                <p className="text-gray-600 mt-1">Définissez vos aspirations et critères de recherche</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">{completionPercentage}%</div>
                <div className="text-sm text-gray-500">Complété</div>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="w-4 h-4 text-orange-600" />
                  {completionPercentage >= 80 && <span className="text-xs text-orange-600 font-medium">Objectifs clairs</span>}
                </div>
              </div>
            </div>
            
            {/* Barre de progression animée */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Début</span>
              <span>Objectifs définis à {completionPercentage}%</span>
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
            
            {/* Préférences d'études */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900">Préférences d'études</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pays préférés */}
                <div className="space-y-4">
                  <Label>Pays d'études préférés</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      placeholder="ex: France, Canada, Allemagne..."
                      className="flex-1"
                    />
                    <motion.button
                      type="button"
                      onClick={() => addToList('preferred_study_countries', newCountry, setNewCountry)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.preferred_study_countries.map((country, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                      >
                        {country}
                        <button
                          type="button"
                          onClick={() => removeFromList('preferred_study_countries', index)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Domaines d'études */}
                <div className="space-y-4">
                  <Label>Domaines d'études intéressants</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newField}
                      onChange={(e) => setNewField(e.target.value)}
                      placeholder="ex: Informatique, Médecine, Droit..."
                      className="flex-1"
                    />
                    <motion.button
                      type="button"
                      onClick={() => addToList('preferred_study_fields', newField, setNewField)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.preferred_study_fields.map((field, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {field}
                        <button
                          type="button"
                          onClick={() => removeFromList('preferred_study_fields', index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Durée d'études */}
                <div className="space-y-2">
                  <Label>Durée d'études préférée</Label>
                  <select
                    name="study_duration_preference"
                    value={formData.study_duration_preference}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {studyDurations.map(duration => (
                      <option key={duration.value} value={duration.value}>{duration.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Situation financière */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900">Situation financière</h2>
              </div>
              
              <div className="space-y-6">
                
                {/* Niveau de besoin financier */}
                <div className="space-y-4">
                  <Label>Niveau de besoin financier</Label>
                  <div className="px-4">
                    <Slider
                      value={[formData.financial_need_level]}
                      onValueChange={handleSliderChange}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>1 - Très élevé</span>
                      <span className="font-medium text-orange-600">
                        {formData.financial_need_level} - {getFinancialNeedLabel(formData.financial_need_level)}
                      </span>
                      <span>5 - Faible</span>
                    </div>
                  </div>
                </div>
                
                {/* Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Budget minimum (par an)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        name="budget_range_min"
                        value={formData.budget_range_min}
                        onChange={handleInputChange}
                        placeholder="5000"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Budget maximum (par an)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        name="budget_range_max"
                        value={formData.budget_range_max}
                        onChange={handleInputChange}
                        placeholder="20000"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Priorités et aspirations */}
            <Card className="p-6">
              <div className="space-y-6">
                
                {/* Priorités de bourses */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Priorités de bourses</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        placeholder="ex: Excellence académique, Besoin financier, Diversité..."
                        className="flex-1"
                      />
                      <motion.button
                        type="button"
                        onClick={() => addToList('scholarship_priorities', newPriority, setNewPriority)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.scholarship_priorities.map((priority, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                        >
                          <span className="text-orange-900">{priority}</span>
                          <button
                            type="button"
                            onClick={() => removeFromList('scholarship_priorities', index)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Aspirations de carrière */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-orange-600" />
                    Aspirations de carrière *
                  </Label>
                  <Textarea
                    name="career_aspirations"
                    value={formData.career_aspirations}
                    onChange={handleInputChange}
                    placeholder="Décrivez vos objectifs de carrière à long terme..."
                    rows={4}
                    required
                  />
                </div>
                
                {/* Déclaration personnelle */}
                <div className="space-y-2">
                  <Label>Déclaration personnelle *</Label>
                  <Textarea
                    name="personal_statement"
                    value={formData.personal_statement}
                    onChange={handleInputChange}
                    placeholder="Expliquez pourquoi vous méritez une bourse et comment elle vous aidera à atteindre vos objectifs..."
                    rows={6}
                    required
                  />
                  <p className="text-xs text-gray-500">{formData.personal_statement.length}/2000 caractères</p>
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
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-lg shadow-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Sauvegarde...' : 'Enregistrer mes objectifs'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
