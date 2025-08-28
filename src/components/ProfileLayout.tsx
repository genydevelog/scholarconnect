import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Camera, 
  Bell, 
  GraduationCap, 
  Settings, 
  Target,
  CheckCircle2,
  Circle
} from 'lucide-react';

// Types pour les sections du profil
interface ProfileSection {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  description: string;
}

// Configuration des sections de profil
const profileSections: ProfileSection[] = [
  {
    id: 'personal',
    name: 'Informations Personnelles',
    path: 'personal',
    icon: User,
    completed: false,
    description: 'Nom, email, téléphone et adresse'
  },
  {
    id: 'photo',
    name: 'Photo de Profil',
    path: 'photo',
    icon: Camera,
    completed: false,
    description: 'Photo et avatar personnalisé'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    path: 'notifications',
    icon: Bell,
    completed: false,
    description: 'Préférences de communication'
  },
  {
    id: 'academic',
    name: 'Parcours Académique',
    path: 'academic',
    icon: GraduationCap,
    completed: false,
    description: 'Éducation, diplômes et compétences'
  },
  {
    id: 'preferences',
    name: 'Préférences',
    path: 'preferences',
    icon: Settings,
    completed: false,
    description: 'Critères et préférences de bourses'
  },
  {
    id: 'goals',
    name: 'Objectifs',
    path: 'goals',
    icon: Target,
    completed: false,
    description: 'Ambitions et projets futurs'
  }
];

const ProfileLayout: React.FC = () => {
  // Calcul du pourcentage de complétion (temporaire - sera remplacé par l'API)
  const completedSections = profileSections.filter(section => section.completed).length;
  const completionPercentage = Math.round((completedSections / profileSections.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec indicateur de progression */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Mon Profil Complet</h1>
            
            {/* Indicateur de progression gamifié */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16">
                  <svg className="transform -rotate-90 w-16 h-16">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
                      className="text-green-500 transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">{completionPercentage}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Profil complété à {completionPercentage}%
                  </p>
                  <p className="text-gray-600">
                    {completedSections} sur {profileSections.length} sections terminées
                  </p>
                </div>
              </div>
              
              {/* Badge de niveau */}
              <div className="text-right">
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  completionPercentage >= 100 ? 'bg-green-100 text-green-800' :
                  completionPercentage >= 75 ? 'bg-blue-100 text-blue-800' :
                  completionPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {completionPercentage >= 100 ? '🏆 Expert' :
                   completionPercentage >= 75 ? '⭐ Avancé' :
                   completionPercentage >= 50 ? '📈 Intermédiaire' :
                   '🌱 Débutant'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Sections du Profil</h2>
              <nav className="space-y-2">
                {profileSections.map((section, index) => {
                  const IconComponent = section.icon;
                  return (
                    <NavLink
                      key={section.id}
                      to={section.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <IconComponent className="w-5 h-5" />
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{section.name}</div>
                          <div className="text-xs opacity-75">{section.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {section.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 opacity-30" />
                        )}
                      </div>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Contenu principal */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 min-h-[600px]">
              <Outlet />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;