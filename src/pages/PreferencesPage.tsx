import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar, 
  GraduationCap,
  Star,
  Plus,
  X,
  Save,
  Filter,
  Globe,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import { Checkbox } from '@/components/ui/Checkbox';
import { toast } from 'react-hot-toast';

const preferencesSchema = z.object({
  // Critères de recherche principaux
  preferred_countries: z.array(z.string()),
  preferred_cities: z.array(z.string()),
  study_levels: z.array(z.string()),
  fields_of_study: z.array(z.string()),
  
  // Critères financiers
  min_scholarship_amount: z.number().min(0),
  max_scholarship_amount: z.number().min(0),
  currency_preference: z.string(),
  
  // Critères temporels
  earliest_start_date: z.string().optional(),
  latest_start_date: z.string().optional(),
  preferred_duration_min: z.number().min(1).max(60), // en mois
  preferred_duration_max: z.number().min(1).max(60),
  
  // Préférences de recherche
  auto_apply_enabled: z.boolean(),
  notification_threshold: z.number().min(50).max(100), // pourcentage de match
  search_frequency: z.enum(['daily', 'weekly', 'monthly']),
  
  // Types de bourses préférés
  scholarship_types: z.array(z.string()),
  
  // Préférences linguistiques
  preferred_languages: z.array(z.string()),
  
  // Critères d'exclusion
  excluded_keywords: z.array(z.string()),
  excluded_institutions: z.array(z.string()),
  
  // Autres préférences
  notes: z.string().optional()
});

type PreferencesForm = z.infer<typeof preferencesSchema>;

const PreferencesPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'location' | 'financial' | 'academic' | 'search' | 'exclusions'>('location');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<PreferencesForm>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferred_countries: ['FR', 'CA', 'DE'],
      preferred_cities: ['Paris', 'Montréal', 'Berlin'],
      study_levels: ['master', 'doctorate'],
      fields_of_study: ['Computer Science', 'Data Science'],
      min_scholarship_amount: 5000,
      max_scholarship_amount: 50000,
      currency_preference: 'EUR',
      earliest_start_date: '',
      latest_start_date: '',
      preferred_duration_min: 6,
      preferred_duration_max: 24,
      auto_apply_enabled: false,
      notification_threshold: 80,
      search_frequency: 'weekly',
      scholarship_types: ['full_funding', 'tuition_waiver', 'research_assistantship'],
      preferred_languages: ['French', 'English', 'German'],
      excluded_keywords: [],
      excluded_institutions: [],
      notes: ''
    }
  });

  // États locaux pour les tableaux simples de chaînes
  const [preferredCountries, setPreferredCountries] = useState<string[]>(['FR', 'CA', 'NL']);
  const [preferredCities, setPreferredCities] = useState<string[]>(['Paris', 'Montréal', 'Amsterdam']);
  const [fieldsOfStudy, setFieldsOfStudy] = useState<string[]>(['Intelligence Artificielle', 'Data Science', 'Machine Learning']);
  const [excludedKeywords, setExcludedKeywords] = useState<string[]>([]);

  // Fonctions helper pour gérer les tableaux simples
  const addCountry = () => setPreferredCountries([...preferredCountries, '']);
  const removeCountry = (index: number) => setPreferredCountries(preferredCountries.filter((_, i) => i !== index));
  const updateCountry = (index: number, value: string) => {
    const newCountries = [...preferredCountries];
    newCountries[index] = value;
    setPreferredCountries(newCountries);
  };

  const addCity = () => setPreferredCities([...preferredCities, '']);
  const removeCity = (index: number) => setPreferredCities(preferredCities.filter((_, i) => i !== index));
  const updateCity = (index: number, value: string) => {
    const newCities = [...preferredCities];
    newCities[index] = value;
    setPreferredCities(newCities);
  };

  const addField = () => setFieldsOfStudy([...fieldsOfStudy, '']);
  const removeField = (index: number) => setFieldsOfStudy(fieldsOfStudy.filter((_, i) => i !== index));
  const updateField = (index: number, value: string) => {
    const newFields = [...fieldsOfStudy];
    newFields[index] = value;
    setFieldsOfStudy(newFields);
  };

  const addExcludedKeyword = () => setExcludedKeywords([...excludedKeywords, '']);
  const removeExcludedKeyword = (index: number) => setExcludedKeywords(excludedKeywords.filter((_, i) => i !== index));
  const updateExcludedKeyword = (index: number, value: string) => {
    const newKeywords = [...excludedKeywords];
    newKeywords[index] = value;
    setExcludedKeywords(newKeywords);
  };

  const minAmount = watch('min_scholarship_amount');
  const maxAmount = watch('max_scholarship_amount');
  const notificationThreshold = watch('notification_threshold');
  const autoApplyEnabled = watch('auto_apply_enabled');

  const onSubmit = async (data: PreferencesForm) => {
    try {
      console.log('Préférences à sauvegarder:', data);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('⚙️ Préférences sauvegardées avec succès!');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('⚠️ Erreur lors de la sauvegarde.');
    }
  };

  const sections = [
    { id: 'location', label: 'Localisation', icon: MapPin },
    { id: 'financial', label: 'Financier', icon: DollarSign },
    { id: 'academic', label: 'Académique', icon: GraduationCap },
    { id: 'search', label: 'Recherche', icon: Search },
    { id: 'exclusions', label: 'Exclusions', icon: Filter }
  ];

  const countries = [
    { code: 'FR', name: 'France' },
    { code: 'CA', name: 'Canada' },
    { code: 'US', name: 'États-Unis' },
    { code: 'GB', name: 'Royaume-Uni' },
    { code: 'DE', name: 'Allemagne' },
    { code: 'CH', name: 'Suisse' },
    { code: 'BE', name: 'Belgique' },
    { code: 'AU', name: 'Australie' },
    { code: 'JP', name: 'Japon' },
    { code: 'SG', name: 'Singapour' }
  ];

  const studyLevels = [
    { value: 'undergraduate', label: 'Licence (Undergraduate)' },
    { value: 'master', label: 'Master' },
    { value: 'doctorate', label: 'Doctorat (PhD)' },
    { value: 'postdoc', label: 'Post-doctorat' },
    { value: 'professional', label: 'Formation professionnelle' }
  ];

  const scholarshipTypes = [
    { value: 'full_funding', label: 'Financement complet' },
    { value: 'tuition_waiver', label: 'Dispense de frais de scolarité' },
    { value: 'research_assistantship', label: 'Assistanat de recherche' },
    { value: 'teaching_assistantship', label: 'Assistanat d\'enseignement' },
    { value: 'merit_based', label: 'Bourse au mérite' },
    { value: 'need_based', label: 'Bourse sur critères sociaux' },
    { value: 'travel_grant', label: 'Bourse de mobilité' },
    { value: 'conference_grant', label: 'Bourse de conférence' }
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
          <div className="p-3 bg-purple-100 rounded-xl">
            <Settings className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Préférences de Recherche</h1>
            <p className="text-gray-600">Configurez vos critères pour trouver les bourses idéales</p>
          </div>
        </div>

        {/* Sections navigation */}
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section Localisation */}
        {activeSection === 'location' && (
          <motion.div 
            key="location"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/50 rounded-xl p-6 border border-gray-200 space-y-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Préférences Géographiques</h2>
            </div>

            {/* Pays préférés */}
            <div className="space-y-4">
              <Label>Pays préférés</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {countries.map((country) => {
                  const isSelected = watch('preferred_countries').includes(country.code);
                  return (
                    <div key={country.code} className="flex items-center space-x-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const currentCountries = watch('preferred_countries');
                          if (checked) {
                            setValue('preferred_countries', [...currentCountries, country.code]);
                          } else {
                            setValue('preferred_countries', currentCountries.filter(c => c !== country.code));
                          }
                        }}
                      />
                      <span className="text-sm">{country.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Villes préférées */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Villes préférées</Label>
                <Button
                  type="button"
                  onClick={() => addCity()}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-2">
                {preferredCities.map((city, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={city}
                      onChange={(e) => updateCity(index, e.target.value)}
                      placeholder="Nom de la ville"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeCity(index)}
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
        )}

        {/* Section Financier */}
        {activeSection === 'financial' && (
          <motion.div 
            key="financial"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/50 rounded-xl p-6 border border-gray-200 space-y-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Critères Financiers</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Montant minimum</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    {...register('min_scholarship_amount', { valueAsNumber: true })}
                    min={0}
                    step={500}
                  />
                  <Controller
                    name="currency_preference"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Select value={value} onValueChange={onChange}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Montant maximum</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    {...register('max_scholarship_amount', { valueAsNumber: true })}
                    min={minAmount}
                    step={500}
                  />
                  <span className="text-sm text-gray-500 w-12">
                    {watch('currency_preference')}
                  </span>
                </div>
              </div>
            </div>

            {/* Durée préférée */}
            <div className="space-y-4">
              <Label>Durée préférée (en mois)</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Minimum</Label>
                  <Controller
                    name="preferred_duration_min"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Slider
                        value={[value]}
                        onValueChange={(values) => onChange(values[0])}
                        min={1}
                        max={60}
                        step={1}
                        className="w-full"
                      />
                    )}
                  />
                  <div className="text-center text-sm text-gray-600">{watch('preferred_duration_min')} mois</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Maximum</Label>
                  <Controller
                    name="preferred_duration_max"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Slider
                        value={[value]}
                        onValueChange={(values) => onChange(values[0])}
                        min={watch('preferred_duration_min')}
                        max={60}
                        step={1}
                        className="w-full"
                      />
                    )}
                  />
                  <div className="text-center text-sm text-gray-600">{watch('preferred_duration_max')} mois</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section Académique */}
        {activeSection === 'academic' && (
          <motion.div 
            key="academic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/50 rounded-xl p-6 border border-gray-200 space-y-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <GraduationCap className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Critères Académiques</h2>
            </div>

            {/* Niveaux d'étude */}
            <div className="space-y-4">
              <Label>Niveaux d'étude recherchés</Label>
              <div className="space-y-2">
                {studyLevels.map((level) => {
                  const isSelected = watch('study_levels').includes(level.value);
                  return (
                    <div key={level.value} className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const currentLevels = watch('study_levels');
                          if (checked) {
                            setValue('study_levels', [...currentLevels, level.value]);
                          } else {
                            setValue('study_levels', currentLevels.filter(l => l !== level.value));
                          }
                        }}
                      />
                      <span>{level.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Domaines d'étude */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Domaines d'étude préférés</Label>
                <Button
                  type="button"
                  onClick={() => addField()}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-2">
                {fieldsOfStudy.map((field, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={field}
                      onChange={(e) => updateField(index, e.target.value)}
                      placeholder="Informatique, Médecine, etc."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeField(index)}
                      variant="danger"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Types de bourses */}
            <div className="space-y-4">
              <Label>Types de bourses préférés</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {scholarshipTypes.map((type) => {
                  const isSelected = watch('scholarship_types').includes(type.value);
                  return (
                    <div key={type.value} className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const currentTypes = watch('scholarship_types');
                          if (checked) {
                            setValue('scholarship_types', [...currentTypes, type.value]);
                          } else {
                            setValue('scholarship_types', currentTypes.filter(t => t !== type.value));
                          }
                        }}
                      />
                      <span className="text-sm">{type.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Section Recherche */}
        {activeSection === 'search' && (
          <motion.div 
            key="search"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/50 rounded-xl p-6 border border-gray-200 space-y-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Search className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Paramètres de Recherche</h2>
            </div>

            {/* Fréquence de recherche */}
            <div className="space-y-3">
              <Label>Fréquence de recherche automatique</Label>
              <Controller
                name="search_frequency"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Seuil de notification */}
            <div className="space-y-4">
              <Label>Seuil de notification (pourcentage de correspondance)</Label>
              <Controller
                name="notification_threshold"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Slider
                    value={[value]}
                    onValueChange={(values) => onChange(values[0])}
                    min={50}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                )}
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>50%</span>
                <span className="font-semibold">{notificationThreshold}%</span>
                <span>100%</span>
              </div>
              <p className="text-sm text-gray-600">
                Vous serez notifié pour les bourses avec au moins {notificationThreshold}% de correspondance
              </p>
            </div>

            {/* Candidature automatique */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Candidature automatique (expérimental)</h3>
                  <p className="text-sm text-gray-600">Postuler automatiquement aux bourses à 100% de correspondance</p>
                </div>
                <Controller
                  name="auto_apply_enabled"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Switch checked={value} onCheckedChange={onChange} />
                  )}
                />
              </div>
              {autoApplyEnabled && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Attention</h4>
                      <p className="text-sm text-yellow-700">
                        La candidature automatique est une fonctionnalité expérimentale. 
                        Nous vous recommandons de vérifier chaque candidature avant soumission.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Section Exclusions */}
        {activeSection === 'exclusions' && (
          <motion.div 
            key="exclusions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/50 rounded-xl p-6 border border-gray-200 space-y-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Filter className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Critères d'Exclusion</h2>
            </div>

            {/* Mots-clés à exclure */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Mots-clés à exclure</Label>
                <Button
                  type="button"
                  onClick={() => addExcludedKeyword()}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-2">
                {excludedKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={keyword}
                      onChange={(e) => updateExcludedKeyword(index, e.target.value)}
                      placeholder="Mot-clé à éviter"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeExcludedKeyword(index)}
                      variant="danger"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Les bourses contenant ces mots-clés seront automatiquement exclues des résultats.
              </p>
            </div>
          </motion.div>
        )}

        {/* Notes personnelles */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes Personnelles</h2>
          <div className="space-y-2">
            <Label htmlFor="notes">Remarques ou précisions supplémentaires</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Ajoutez ici toute information complémentaire qui pourrait aider à affiner vos recherches..."
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
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sauvegarde...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Sauvegarder les préférences</span>
              </div>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default PreferencesPage;