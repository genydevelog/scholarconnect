import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, Camera, GraduationCap, Bell, Target, FileText, 
  Award, Star, Trophy, Crown, Medal, Zap, CheckCircle, 
  ArrowRight, TrendingUp, Calendar, Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Link } from 'react-router-dom';

interface ProfileSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgColor: string;
  completion: number;
  description: string;
  isCompleted: boolean;
}

interface Badge {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  earned: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate?: string;
}

export default function ProfileOverviewPage() {
  const { user, profile, studentProfile, loading, isStudent } = useAuth();
  
  // Calcul des complétions de chaque section
  const getPersonalCompletion = () => {
    if (!profile) return 0;
    const fields = ['full_name', 'phone', 'bio', 'city', 'country'];
    const completed = fields.filter(field => profile[field as keyof typeof profile]);
    return Math.round((completed.length / fields.length) * 100);
  };
  
  const getPhotoCompletion = () => {
    return profile?.profile_image_url ? 100 : 0;
  };
  
  const getAcademicCompletion = () => {
    if (!isStudent || !studentProfile) return 0;
    const requiredFields = ['current_education_level', 'field_of_study', 'current_institution', 'career_goals'];
    const completed = requiredFields.filter(field => studentProfile[field as keyof typeof studentProfile]);
    return Math.round((completed.length / requiredFields.length) * 100);
  };
  
  const getGoalsCompletion = () => {
    if (!isStudent || !studentProfile) return 0;
    const hasCountries = studentProfile.preferred_study_countries?.length > 0;
    const hasFields = studentProfile.preferred_study_fields?.length > 0;
    const hasGoals = studentProfile.career_goals;
    const completed = [hasCountries, hasFields, hasGoals].filter(Boolean).length;
    return Math.round((completed / 3) * 100);
  };

  const sections: ProfileSection[] = [
    {
      id: 'personal',
      title: 'Informations personnelles',
      icon: <User className="w-5 h-5" />,
      path: '/profile/personal',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      completion: getPersonalCompletion(),
      description: 'Nom, contact, bio',
      isCompleted: getPersonalCompletion() >= 80
    },
    {
      id: 'photo',
      title: 'Photo de profil',
      icon: <Camera className="w-5 h-5" />,
      path: '/profile/photo',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
      completion: getPhotoCompletion(),
      description: 'Image de profil',
      isCompleted: getPhotoCompletion() === 100
    },
    {
      id: 'academic',
      title: 'Profil académique',
      icon: <GraduationCap className="w-5 h-5" />,
      path: '/profile/academic',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      completion: getAcademicCompletion(),
      description: 'Formation, établissement',
      isCompleted: getAcademicCompletion() >= 80
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      path: '/profile/notifications',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200',
      completion: 100,
      description: 'Alertes et paramètres',
      isCompleted: true
    },
    {
      id: 'goals',
      title: 'Objectifs et préférences',
      icon: <Target className="w-5 h-5" />,
      path: '/profile/goals',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      completion: getGoalsCompletion(),
      description: 'Aspirations, critères de recherche',
      isCompleted: getGoalsCompletion() >= 80
    },
    {
      id: 'documents',
      title: 'Documents',
      icon: <FileText className="w-5 h-5" />,
      path: '/profile/documents',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-200',
      completion: 50,
      description: 'CV, diplômes, lettres',
      isCompleted: false
    }
  ];
  
  // Calcul du pourcentage global
  const overallCompletion = Math.round(
    sections.reduce((sum, section) => sum + section.completion, 0) / sections.length
  );
  
  // Système de badges
  const badges: Badge[] = [
    {
      id: 'first-login',
      name: 'Premier pas',
      icon: <Star className="w-5 h-5" />,
      description: 'Première connexion à la plateforme',
      earned: true,
      rarity: 'common',
      earnedDate: '2024-08-20'
    },
    {
      id: 'profile-photo',
      name: 'Sourire éclatant',
      icon: <Camera className="w-5 h-5" />,
      description: 'Photo de profil ajoutée',
      earned: getPhotoCompletion() === 100,
      rarity: 'common'
    },
    {
      id: 'academic-excellence',
      name: 'Excellence académique',
      icon: <Award className="w-5 h-5" />,
      description: 'Profil académique complet à 100%',
      earned: getAcademicCompletion() === 100,
      rarity: 'rare'
    },
    {
      id: 'goal-setter',
      name: 'Visionnaire',
      icon: <Target className="w-5 h-5" />,
      description: 'Objectifs et préférences définis',
      earned: getGoalsCompletion() >= 80,
      rarity: 'rare'
    },
    {
      id: 'complete-profile',
      name: 'Profil parfait',
      icon: <Trophy className="w-5 h-5" />,
      description: 'Toutes les sections complétées à 80%+',
      earned: overallCompletion >= 80,
      rarity: 'epic'
    },
    {
      id: 'scholarship-master',
      name: 'Maître des bourses',
      icon: <Crown className="w-5 h-5" />,
      description: 'Première bourse obtenue',
      earned: false, // À implémenter selon la logique métier
      rarity: 'legendary'
    }
  ];
  
  const earnedBadges = badges.filter(badge => badge.earned);
  const nextBadge = badges.find(badge => !badge.earned);
  
  // Niveaux et expérience
  const getLevel = (completion: number) => {
    return Math.floor(completion / 20) + 1; // Niveau 1-6
  };
  
  const currentLevel = getLevel(overallCompletion);
  const nextLevelProgress = overallCompletion % 20;
  const pointsToNextLevel = 20 - nextLevelProgress;
  
  const getRarityColor = (rarity: Badge['rarity']) => {
    const colors = {
      common: 'text-gray-600 bg-gray-100 border-gray-300',
      rare: 'text-blue-600 bg-blue-100 border-blue-300',
      epic: 'text-purple-600 bg-purple-100 border-purple-300',
      legendary: 'text-yellow-600 bg-yellow-100 border-yellow-300'
    };
    return colors[rarity];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête avec progression globale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Bonjour, {profile?.full_name || 'Utilisateur'} !
                </h1>
                <p className="text-gray-600 text-lg">Voici un aperçu de votre progression sur la plateforme</p>
              </div>
              
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke={overallCompletion >= 80 ? '#10b981' : overallCompletion >= 50 ? '#f59e0b' : '#3b82f6'}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                      animate={{ 
                        strokeDashoffset: 2 * Math.PI * 36 * (1 - overallCompletion / 100)
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="drop-shadow-sm"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{overallCompletion}%</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">Profil global</div>
              </div>
            </div>
            
            {/* Niveau et expérience */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Niveau {currentLevel}</span>
                </div>
                <span className="text-sm text-gray-600">{pointsToNextLevel} points pour le niveau {currentLevel + 1}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${(nextLevelProgress / 20) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sections du profil */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sections du profil</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link to={section.path}>
                      <div className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                        section.isCompleted ? section.bgColor : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-lg ${section.color} ${
                            section.isCompleted ? 'bg-white' : 'bg-gray-100'
                          }`}>
                            {section.icon}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {section.isCompleted && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            <span className={`text-sm font-medium ${
                              section.isCompleted ? section.color : 'text-gray-600'
                            }`}>
                              {section.completion}%
                            </span>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        
                        <h3 className={`font-semibold mb-1 ${
                          section.isCompleted ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {section.title}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${
                              section.completion >= 80 ? 'bg-green-500' :
                              section.completion >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${section.completion}%` }}
                            transition={{ duration: 0.8, delay: 0.1 * index }}
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Système de badges et statistiques */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            
            {/* Badges gagnés */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl font-semibold text-gray-900">Badges</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {earnedBadges.length}/{badges.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {earnedBadges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-3 rounded-lg border-2 ${getRarityColor(badge.rarity)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded">
                        {badge.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{badge.name}</div>
                        <div className="text-xs opacity-75">{badge.description}</div>
                        {badge.earnedDate && (
                          <div className="text-xs opacity-60 mt-1">
                            🏆 Obtenu le {new Date(badge.earnedDate).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {nextBadge && (
                  <div className="p-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <div className="flex items-center gap-3 opacity-60">
                      <div className="p-1 rounded">
                        {nextBadge.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Prochain: {nextBadge.name}</div>
                        <div className="text-xs">{nextBadge.description}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Statistiques rapides */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Statistiques</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sections complétées</span>
                  <span className="font-semibold">{sections.filter(s => s.isCompleted).length}/{sections.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Niveau actuel</span>
                  <span className="font-semibold">Niveau {currentLevel}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Badges obtenus</span>
                  <span className="font-semibold">{earnedBadges.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Progression globale</span>
                  <span className="font-semibold text-blue-600">{overallCompletion}%</span>
                </div>
              </div>
            </Card>

            {/* Prochaines étapes */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Prochaines étapes</h3>
              </div>
              
              <div className="space-y-3">
                {sections
                  .filter(section => section.completion < 80)
                  .sort((a, b) => b.completion - a.completion)
                  .slice(0, 3)
                  .map((section) => (
                    <Link key={section.id} to={section.path}>
                      <div className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded ${section.color}`}>
                            {section.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{section.title}</div>
                            <div className="text-sm text-gray-600">{section.completion}% complété</div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
