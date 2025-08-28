import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, Trash2, Award, BookOpen, Star, Save, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Separator } from '@/components/ui/Separator';
import { toast } from 'react-hot-toast';

// Schémas de validation au niveau module
const educationSchema = z.object({
  degree: z.string().min(1, 'Le diplôme est requis'),
  field_of_study: z.string().min(1, 'Le domaine d\'étude est requis'),
  institution: z.string().min(1, 'L\'établissement est requis'),
  location: z.string().optional(),
  start_date: z.string().min(1, 'Date de début requise'),
  end_date: z.string().optional(),
  current: z.boolean(),
  gpa: z.string().optional(),
  description: z.string().optional(),
});

const certificationSchema = z.object({
  name: z.string().min(1, 'Le nom de la certification est requis'),
  issuer: z.string().min(1, 'L\'organisme émetteur est requis'),
  date_issued: z.string().min(1, 'Date d\'obtention requise'),
  date_expires: z.string().optional(),
  credential_id: z.string().optional(),
  url: z.string().optional(),
});

const skillSchema = z.object({
  name: z.string().min(1, 'Le nom de la compétence est requis'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  category: z.string().min(1, 'La catégorie est requise'),
});

const academicSchema = z.object({
  current_education_level: z.string().min(1, 'Niveau d\'éducation actuel requis'),
  education_history: z.array(educationSchema),
  certifications: z.array(certificationSchema),
  skills: z.array(skillSchema),
  languages: z.array(z.object({
    language: z.string().min(1, 'Nom de la langue requis'),
    proficiency: z.enum(['basic', 'conversational', 'fluent', 'native'])
  })),
  academic_achievements: z.string().optional(),
});

type AcademicForm = z.infer<typeof academicSchema>;

const AcademicPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'education' | 'certifications' | 'skills' | 'languages'>('education');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<AcademicForm>({
    resolver: zodResolver(academicSchema),
    defaultValues: {
      current_education_level: '',
      education_history: [],
      certifications: [],
      skills: [],
      languages: [],
      academic_achievements: ''
    }
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation
  } = useFieldArray({
    control,
    name: 'education_history'
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification
  } = useFieldArray({
    control,
    name: 'certifications'
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill
  } = useFieldArray({
    control,
    name: 'skills'
  });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage
  } = useFieldArray({
    control,
    name: 'languages'
  });

  const onSubmit = async (data: AcademicForm) => {
    try {
      console.log('Données académiques à sauvegarder:', data);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('🎓 Parcours académique sauvegardé avec succès!');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('⚠️ Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const tabs = [
    { id: 'education', label: 'Éducation', icon: GraduationCap },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'skills', label: 'Compétences', icon: Star },
    { id: 'languages', label: 'Langues', icon: BookOpen }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parcours Académique</h1>
            <p className="text-gray-600">Détaillez votre formation, compétences et certifications</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Niveau actuel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Niveau d\'Éducation Actuel</h2>
          
          <div className="space-y-2">
            <Label htmlFor="current_education_level">Votre niveau d\'éducation actuel *</Label>
            <Controller
              name="current_education_level"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger className={errors.current_education_level ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Sélectionnez votre niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">École secondaire / Lycée</SelectItem>
                    <SelectItem value="associate">DUT / BTS (Bac+2)</SelectItem>
                    <SelectItem value="bachelor">Licence (Bac+3)</SelectItem>
                    <SelectItem value="master">Master (Bac+5)</SelectItem>
                    <SelectItem value="doctorate">Doctorat (Bac+8)</SelectItem>
                    <SelectItem value="postdoc">Post-doctorat</SelectItem>
                    <SelectItem value="professional">Formation professionnelle</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.current_education_level && (
              <p className="text-sm text-red-600">{errors.current_education_level.message}</p>
            )}
          </div>
        </motion.div>

        {/* Contenu des tabs */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200"
        >
          {/* Tab Éducation */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Historique Éducatif</h2>
                <Button
                  type="button"
                  onClick={() => appendEducation({
                    degree: '',
                    field_of_study: '',
                    institution: '',
                    location: '',
                    start_date: '',
                    end_date: '',
                    current: false,
                    gpa: '',
                    description: ''
                  })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une formation
                </Button>
              </div>

              {educationFields.map((field, index) => (
                <div key={field.id} className="p-6 border border-gray-200 rounded-lg bg-white/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Formation #{index + 1}</h3>
                    <Button
                      type="button"
                      onClick={() => removeEducation(index)}
                      variant="danger"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Diplôme *</Label>
                      <Input
                        {...register(`education_history.${index}.degree`)}
                        placeholder="Master en Informatique"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Domaine d\'étude *</Label>
                      <Input
                        {...register(`education_history.${index}.field_of_study`)}
                        placeholder="Informatique, Intelligence Artificielle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Établissement *</Label>
                      <Input
                        {...register(`education_history.${index}.institution`)}
                        placeholder="Université de la Sorbonne"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lieu</Label>
                      <Input
                        {...register(`education_history.${index}.location`)}
                        placeholder="Paris, France"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date de début *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="date"
                          {...register(`education_history.${index}.start_date`)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Date de fin</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="date"
                          {...register(`education_history.${index}.end_date`)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Note moyenne (GPA)</Label>
                      <Input
                        {...register(`education_history.${index}.gpa`)}
                        placeholder="3.8 / 4.0 ou 16/20"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      {...register(`education_history.${index}.description`)}
                      placeholder="Cours principaux, projets, mentions..."
                      rows={3}
                    />
                  </div>
                </div>
              ))}

              {educationFields.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune formation ajoutée</p>
                  <p className="text-sm">Cliquez sur "Ajouter une formation" pour commencer</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Certifications */}
          {activeTab === 'certifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Certifications et Licences</h2>
                <Button
                  type="button"
                  onClick={() => appendCertification({
                    name: '',
                    issuer: '',
                    date_issued: '',
                    date_expires: '',
                    credential_id: '',
                    url: ''
                  })}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une certification
                </Button>
              </div>

              {certificationFields.map((field, index) => (
                <div key={field.id} className="p-6 border border-gray-200 rounded-lg bg-white/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Certification #{index + 1}</h3>
                    <Button
                      type="button"
                      onClick={() => removeCertification(index)}
                      variant="danger"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom de la certification *</Label>
                      <Input
                        {...register(`certifications.${index}.name`)}
                        placeholder="AWS Certified Solutions Architect"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Organisme émetteur *</Label>
                      <Input
                        {...register(`certifications.${index}.issuer`)}
                        placeholder="Amazon Web Services"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date d\'obtention *</Label>
                      <Input
                        type="date"
                        {...register(`certifications.${index}.date_issued`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date d\'expiration</Label>
                      <Input
                        type="date"
                        {...register(`certifications.${index}.date_expires`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ID de certification</Label>
                      <Input
                        {...register(`certifications.${index}.credential_id`)}
                        placeholder="AWS-SAA-123456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL de vérification</Label>
                      <Input
                        {...register(`certifications.${index}.url`)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {certificationFields.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune certification ajoutée</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Compétences */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Compétences Techniques et Soft Skills</h2>
                <Button
                  type="button"
                  onClick={() => appendSkill({
                    name: '',
                    level: 'intermediate',
                    category: ''
                  })}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une compétence
                </Button>
              </div>

              {skillFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-white/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Compétence #{index + 1}</h3>
                    <Button
                      type="button"
                      onClick={() => removeSkill(index)}
                      variant="danger"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Compétence *</Label>
                      <Input
                        {...register(`skills.${index}.name`)}
                        placeholder="JavaScript, Leadership, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Niveau *</Label>
                      <Controller
                        name={`skills.${index}.level`}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <Select value={value} onValueChange={onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Débutant</SelectItem>
                              <SelectItem value="intermediate">Intermédiaire</SelectItem>
                              <SelectItem value="advanced">Avancé</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Catégorie *</Label>
                      <Input
                        {...register(`skills.${index}.category`)}
                        placeholder="Programmation, Management, etc."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {skillFields.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune compétence ajoutée</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Langues */}
          {activeTab === 'languages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Compétences Linguistiques</h2>
                <Button
                  type="button"
                  onClick={() => appendLanguage({
                    language: '',
                    proficiency: 'conversational'
                  })}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une langue
                </Button>
              </div>

              {languageFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-white/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Langue #{index + 1}</h3>
                    <Button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      variant="danger"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Langue *</Label>
                      <Input
                        {...register(`languages.${index}.language`)}
                        placeholder="Français, Anglais, Espagnol..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Niveau de maîtrise *</Label>
                      <Controller
                        name={`languages.${index}.proficiency`}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <Select value={value} onValueChange={onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Notions de base</SelectItem>
                              <SelectItem value="conversational">Conversationnel</SelectItem>
                              <SelectItem value="fluent">Courant</SelectItem>
                              <SelectItem value="native">Langue maternelle</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {languageFields.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune langue ajoutée</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Réalisations académiques */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Réalisations Académiques</h2>
          
          <div className="space-y-2">
            <Label htmlFor="academic_achievements">Prix, distinctions, publications, projets remarquables...</Label>
            <Textarea
              id="academic_achievements"
              {...register('academic_achievements')}
              placeholder="Décrivez vos principales réalisations académiques, prix, publications, projets de recherche..."
              rows={4}
            />
          </div>
        </motion.div>

        {/* Bouton de sauvegarde */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end pt-6 border-t border-gray-200"
        >
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sauvegarde...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Sauvegarder le parcours</span>
              </div>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default AcademicPage;