import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  Target, 
  Lightbulb, 
  Rocket, 
  Calendar, 
  TrendingUp,
  Plus,
  X,
  Save,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Globe,
  Award,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { toast } from 'react-hot-toast';

const goalSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  category: z.enum(['academic', 'career', 'personal', 'research', 'impact']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  target_date: z.string().optional(),
  progress: z.number().min(0).max(100),
  milestones: z.array(z.object({
    title: z.string(),
    completed: z.boolean(),
    date: z.string().optional()
  })),
  resources_needed: z.array(z.string()),
  success_metrics: z.string().optional()
});

const goalsSchema = z.object({
  // Vision générale
  career_vision: z.string().optional(),
  life_mission: z.string().optional(),
  values: z.array(z.string()),
  
  // Objectifs spécifiques
  short_term_goals: z.array(goalSchema), // 0-2 ans
  medium_term_goals: z.array(goalSchema), // 2-5 ans
  long_term_goals: z.array(goalSchema), // 5+ ans
  
  // Préférences de carrière
  preferred_career_paths: z.array(z.string()),
  desired_work_environment: z.string().optional(),
  geographic_preferences: z.array(z.string()),
  
  // Impact souhaité
  desired_impact: z.string().optional(),
  target_industries: z.array(z.string()),
  
  // Développement personnel
  skills_to_develop: z.array(z.string()),
  learning_interests: z.array(z.string()),
  
  // Notes
  additional_notes: z.string().optional()
});

type GoalsForm = z.infer<typeof goalsSchema>;
type Goal = z.infer<typeof goalSchema>;

const GoalsPage: React.FC = () => {
  const [activeTimeframe, setActiveTimeframe] = useState<'short' | 'medium' | 'long'>('short');
  const [newGoal, setNewGoal] = useState<Partial<Goal> | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<GoalsForm>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      career_vision: '',
      life_mission: '',
      values: ['innovation', 'excellence', 'collaboration'],
      short_term_goals: [
        {
          id: '1',
          title: 'Obtenir mon Master en Intelligence Artificielle',
          description: 'Compléter mon programme de Master avec mention',
          category: 'academic',
          priority: 'high',
          target_date: '2025-06-30',
          progress: 65,
          milestones: [
            { title: 'Finaliser le mémoire', completed: false, date: '2025-03-15' },
            { title: 'Soutenance', completed: false, date: '2025-06-15' }
          ],
          resources_needed: ['Temps d\'étude', 'Accès à la recherche'],
          success_metrics: 'Obtention du diplôme avec mention Bien ou Très Bien'
        }
      ],
      medium_term_goals: [
        {
          id: '2',
          title: 'Devenir Data Scientist Senior',
          description: 'Évoluer vers un poste de Data Scientist senior dans une entreprise tech',
          category: 'career',
          priority: 'high',
          target_date: '2027-12-31',
          progress: 20,
          milestones: [
            { title: 'Obtenir une première expérience', completed: false, date: '2025-09-01' },
            { title: 'Certification avancée', completed: false, date: '2026-06-01' }
          ],
          resources_needed: ['Expérience pratique', 'Formation continue', 'Réseau professionnel'],
          success_metrics: 'Poste de Data Scientist Senior avec équipe à manager'
        }
      ],
      long_term_goals: [
        {
          id: '3',
          title: 'Créer une startup dans l\'IA responsable',
          description: 'Développer des solutions d\'IA éthiques pour résoudre des problèmes sociaux',
          category: 'impact',
          priority: 'medium',
          target_date: '2030-01-01',
          progress: 5,
          milestones: [
            { title: 'Identification du problème', completed: false, date: '2028-01-01' },
            { title: 'MVP développé', completed: false, date: '2029-06-01' }
          ],
          resources_needed: ['Capital', 'Équipe technique', 'Mentors entrepreneurs'],
          success_metrics: 'Startup lancée avec premiers clients'
        }
      ],
      preferred_career_paths: ['Data Science', 'Machine Learning Engineer', 'AI Researcher'],
      desired_work_environment: '',
      geographic_preferences: ['France', 'Canada', 'Pays-Bas'],
      desired_impact: '',
      target_industries: ['Tech', 'Santé', 'Environnement'],
      skills_to_develop: ['Leadership', 'Communication', 'Deep Learning'],
      learning_interests: ['Neurosciences', 'Philosophie de l\'IA', 'Entrepreneuriat'],
      additional_notes: ''
    }
  });

  // États locaux pour les tableaux simples de chaînes
  const [values, setValues] = useState<string[]>(['innovation', 'excellence', 'collaboration']);
  const [skillsToDevelop, setSkillsToDevelop] = useState<string[]>(['Leadership', 'Communication', 'Deep Learning']);

  // Fonctions helper pour gérer les tableaux simples
  const addValue = () => setValues([...values, '']);
  const removeValue = (index: number) => setValues(values.filter((_, i) => i !== index));
  const updateValue = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const addSkill = () => setSkillsToDevelop([...skillsToDevelop, '']);
  const removeSkill = (index: number) => setSkillsToDevelop(skillsToDevelop.filter((_, i) => i !== index));
  const updateSkill = (index: number, skill: string) => {
    const newSkills = [...skillsToDevelop];
    newSkills[index] = skill;
    setSkillsToDevelop(newSkills);
  };

  const {
    fields: shortTermFields,
    append: appendShortTerm,
    remove: removeShortTerm,
    update: updateShortTerm
  } = useFieldArray({ control, name: 'short_term_goals' });

  const {
    fields: mediumTermFields,
    append: appendMediumTerm,
    remove: removeMediumTerm,
    update: updateMediumTerm
  } = useFieldArray({ control, name: 'medium_term_goals' });

  const {
    fields: longTermFields,
    append: appendLongTerm,
    remove: removeLongTerm,
    update: updateLongTerm
  } = useFieldArray({ control, name: 'long_term_goals' });

  const getCurrentGoals = () => {
    switch (activeTimeframe) {
      case 'short': return shortTermFields;
      case 'medium': return mediumTermFields;
      case 'long': return longTermFields;
    }
  };

  const getAppendFunction = () => {
    switch (activeTimeframe) {
      case 'short': return appendShortTerm;
      case 'medium': return appendMediumTerm;
      case 'long': return appendLongTerm;
    }
  };

  const getRemoveFunction = () => {
    switch (activeTimeframe) {
      case 'short': return removeShortTerm;
      case 'medium': return removeMediumTerm;
      case 'long': return removeLongTerm;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <GraduationCap className="w-4 h-4" />;
      case 'career': return <Briefcase className="w-4 h-4" />;
      case 'personal': return <Heart className="w-4 h-4" />;
      case 'research': return <Lightbulb className="w-4 h-4" />;
      case 'impact': return <Globe className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const onSubmit = async (data: GoalsForm) => {
    try {
      console.log('Objectifs à sauvegarder:', data);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('🎯 Objectifs sauvegardés avec succès!');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('⚠️ Erreur lors de la sauvegarde.');
    }
  };

  const timeframes = [
    { id: 'short', label: 'Court terme (0-2 ans)', icon: Target, color: 'bg-green-600' },
    { id: 'medium', label: 'Moyen terme (2-5 ans)', icon: TrendingUp, color: 'bg-blue-600' },
    { id: 'long', label: 'Long terme (5+ ans)', icon: Rocket, color: 'bg-purple-600' }
  ];

  const categories = [
    { value: 'academic', label: 'Académique', icon: GraduationCap },
    { value: 'career', label: 'Carrière', icon: Briefcase },
    { value: 'personal', label: 'Personnel', icon: Heart },
    { value: 'research', label: 'Recherche', icon: Lightbulb },
    { value: 'impact', label: 'Impact social', icon: Globe }
  ];

  const priorities = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyen' },
    { value: 'high', label: 'Haut' },
    { value: 'critical', label: 'Critique' }
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
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Target className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Objectifs</h1>
            <p className="text-gray-600">Définissez votre vision et planifiez votre parcours</p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Vision et mission */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200 space-y-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Lightbulb className="w-6 h-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Vision et Mission</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="career_vision">Vision de carrière</Label>
              <Textarea
                id="career_vision"
                {...register('career_vision')}
                placeholder="Décrivez où vous vous voyez dans 10 ans..."
                rows={4}
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="life_mission">Mission de vie</Label>
              <Textarea
                id="life_mission"
                {...register('life_mission')}
                placeholder="Quel impact voulez-vous avoir sur le monde ?"
                rows={4}
              />
            </div>
          </div>

          {/* Valeurs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Mes valeurs fondamentales</Label>
              <Button
                type="button"
                onClick={() => addValue()}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {values.map((value, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={value}
                    onChange={(e) => updateValue(index, e.target.value)}
                    placeholder="Ex: Innovation, Respect, Excellence"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => removeValue(index)}
                    variant="danger"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Objectifs par période */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200"
        >
          {/* Navigation temporelle */}
          <div className="flex flex-wrap gap-2 mb-6">
            {timeframes.map((timeframe) => {
              const IconComponent = timeframe.icon;
              return (
                <button
                  key={timeframe.id}
                  type="button"
                  onClick={() => setActiveTimeframe(timeframe.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTimeframe === timeframe.id
                      ? `${timeframe.color} text-white shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{timeframe.label}</span>
                </button>
              );
            })}
          </div>

          {/* Liste des objectifs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Objectifs {timeframes.find(t => t.id === activeTimeframe)?.label.toLowerCase()}
              </h3>
              <Button
                type="button"
                onClick={() => {
                  const newGoalId = Date.now().toString();
                  const appendFunc = getAppendFunction();
                  appendFunc({
                    id: newGoalId,
                    title: '',
                    description: '',
                    category: 'personal',
                    priority: 'medium',
                    target_date: '',
                    progress: 0,
                    milestones: [],
                    resources_needed: [],
                    success_metrics: ''
                  });
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvel objectif
              </Button>
            </div>

            {getCurrentGoals().map((goal, index) => {
              const goalData = goal as Goal;
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 border border-gray-200 rounded-lg bg-white/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        {getCategoryIcon(goalData.category)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{goalData.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goalData.priority)}`}>
                            Priorité {goalData.priority}
                          </span>
                          {goalData.target_date && (
                            <span className="text-xs text-gray-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(goalData.target_date).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      onClick={() => getRemoveFunction()(index)}
                      variant="danger"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {goalData.description && (
                    <p className="text-gray-600 mb-4">{goalData.description}</p>
                  )}

                  {/* Barre de progression */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progrès</span>
                      <span className="text-sm text-gray-600">{goalData.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goalData.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Étapes clés */}
                  {goalData.milestones && goalData.milestones.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-800 mb-2">Étapes clés</h5>
                      <div className="space-y-1">
                        {goalData.milestones.map((milestone, mIndex) => (
                          <div key={mIndex} className="flex items-center space-x-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${
                              milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className={milestone.completed ? 'text-gray-500 line-through' : 'text-gray-700'}>
                              {milestone.title}
                            </span>
                            {milestone.date && (
                              <span className="text-xs text-gray-400">
                                ({new Date(milestone.date).toLocaleDateString('fr-FR')})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ressources nécessaires */}
                  {goalData.resources_needed && goalData.resources_needed.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-800 mb-2">Ressources nécessaires</h5>
                      <div className="flex flex-wrap gap-2">
                        {goalData.resources_needed.map((resource, rIndex) => (
                          <span key={rIndex} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {goalData.success_metrics && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-1">Métriques de succès</h5>
                      <p className="text-sm text-gray-600">{goalData.success_metrics}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {getCurrentGoals().length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun objectif défini pour cette période</p>
                <p className="text-sm">Cliquez sur "Nouvel objectif" pour commencer</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Préférences de carrière */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200 space-y-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Préférences Professionnelles</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Types de postes recherchés</Label>
              <Textarea
                {...register('preferred_career_paths.0')}
                placeholder="Data Scientist, Researcher, Consultant..."
                rows={3}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Environnement de travail idéal</Label>
              <Textarea
                {...register('desired_work_environment')}
                placeholder="Startup, grande entreprise, remote, international..."
                rows={3}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Secteurs d'intérêt</Label>
              <Textarea
                {...register('target_industries.0')}
                placeholder="Tech, Santé, Finance, Environnement..."
                rows={3}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Préférences géographiques</Label>
              <Textarea
                {...register('geographic_preferences.0')}
                placeholder="Pays ou régions où vous souhaitez travailler"
                rows={3}
              />
            </div>
          </div>
        </motion.div>

        {/* Développement personnel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200 space-y-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Développement Personnel</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Compétences à développer */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Compétences à développer</Label>
                <Button
                  type="button"
                  onClick={() => addSkill()}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-2">
                {skillsToDevelop.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      placeholder="Leadership, Python, Communication..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeSkill(index)}
                      variant="danger"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Centres d'intérêt d'apprentissage</Label>
              <Textarea
                {...register('learning_interests.0')}
                placeholder="Domaines que vous aimeriez explorer..."
                rows={4}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Impact souhaité</Label>
            <Textarea
              {...register('desired_impact')}
              placeholder="Comment voulez-vous contribuer positivement au monde ?"
              rows={3}
            />
          </div>
        </motion.div>

        {/* Notes additionnelles */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes Additionnelles</h2>
          <div className="space-y-2">
            <Label htmlFor="additional_notes">Réflexions, idées ou précisions supplémentaires</Label>
            <Textarea
              id="additional_notes"
              {...register('additional_notes')}
              placeholder="Autres réflexions sur vos objectifs et ambitions..."
              rows={4}
            />
          </div>
        </motion.div>

        {/* Bouton de sauvegarde */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-end pt-6 border-t border-gray-200"
        >
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sauvegarde...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Sauvegarder mes objectifs</span>
              </div>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default GoalsPage;