import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Camera, GraduationCap, Bell, Target, FileText, 
  BarChart3, ChevronRight
} from 'lucide-react';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface ProfileNavigationProps {
  className?: string;
}

export function ProfileNavigation({ className = '' }: ProfileNavigationProps) {
  const location = useLocation();
  
  const navigationItems: NavigationItem[] = [
    {
      path: '/profile',
      label: 'Vue d\'ensemble',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Tableau de bord et progression',
      color: 'text-slate-600 bg-slate-50 border-slate-200'
    },
    {
      path: '/profile/personal',
      label: 'Informations personnelles',
      icon: <User className="w-5 h-5" />,
      description: 'Nom, contact, bio',
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      path: '/profile/photo',
      label: 'Photo de profil',
      icon: <Camera className="w-5 h-5" />,
      description: 'Image de profil',
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      path: '/profile/academic',
      label: 'Profil académique',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Études, compétences',
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      path: '/profile/notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Alertes et paramètres',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    },
    {
      path: '/profile/goals',
      label: 'Objectifs',
      icon: <Target className="w-5 h-5" />,
      description: 'Aspirations et préférences',
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    {
      path: '/profile/documents',
      label: 'Documents',
      icon: <FileText className="w-5 h-5" />,
      description: 'CV, diplômes, lettres',
      color: 'text-teal-600 bg-teal-50 border-teal-200'
    }
  ];

  return (
    <nav className={`bg-white border-r border-gray-200 ${className}`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mon Profil</h2>
        
        <div className="space-y-2">
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isExactMatch = location.pathname === item.path;
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive: navIsActive }) =>
                    `group flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                      navIsActive || isExactMatch
                        ? `${item.color} border-2 shadow-sm`
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent'
                    }`
                  }
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                    isActive || isExactMatch 
                      ? 'bg-white shadow-sm' 
                      : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
                  }`}>
                    {item.icon}
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className={`text-xs mt-1 ${
                      isActive || isExactMatch ? 'opacity-75' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                  
                  <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                    isActive || isExactMatch 
                      ? 'opacity-75 transform translate-x-1' 
                      : 'opacity-0 group-hover:opacity-50'
                  }`} />
                </NavLink>
              </motion.div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default ProfileNavigation;
