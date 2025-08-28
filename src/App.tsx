import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Layout
import Layout from '@/components/layout/Layout'
import ProfileLayout from '@/components/ProfileLayout'

// Auth Components
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthGuard } from '@/components/auth/AuthGuard'

// Auth Pages
import AuthPage from '@/pages/AuthPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'

// Dashboard Pages (will create these)
import StudentDashboard from '@/pages/dashboards/StudentDashboard'
import InstitutionDashboard from '@/pages/dashboards/InstitutionDashboard'

// Main Pages
import HomePage from '@/pages/HomePage'
import SearchPage from '@/pages/SearchPage'
import ScholarshipsPage from '@/pages/ScholarshipsPage'
import ScholarshipDetailPage from '@/pages/ScholarshipDetailPage'
import InstitutionsPage from '@/pages/InstitutionsPage'
import InstitutionDetailPage from '@/pages/InstitutionDetailPage'
import CountriesPage from '@/pages/CountriesPage'
import CountryDetailPage from '@/pages/CountryDetailPage'
import ProgramsPage from '@/pages/ProgramsPage'
import ProgramDetailPage from '@/pages/ProgramDetailPage'
import ApplicationsPage from '@/pages/ApplicationsPage'
import FavoritesPage from '@/pages/FavoritesPage'
import UserFavoritesPage from '@/pages/UserFavoritesPage'
import MessagesPage from '@/pages/MessagesPage'
import DocumentsPage from '@/pages/DocumentsPage'
import ProfilePage from '@/pages/ProfilePage'
import UserProfilesPage from '@/pages/UserProfilesPage'
import StudentProfilesPage from '@/pages/StudentProfilesPage'
import InstitutionProfilesPage from '@/pages/InstitutionProfilesPage'
import ProfilesPage from '@/pages/ProfilesPage'
import UsersPage from '@/pages/UsersPage'
import DashboardPage from '@/pages/DashboardPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import MlRecommendationsPage from '@/pages/MlRecommendationsPage'
import AIScholarshipRecommendationsPage from '@/pages/AIScholarshipRecommendationsPage'
import RecommendationHistoryPage from '@/pages/RecommendationHistoryPage'
import ContinentsPage from '@/pages/ContinentsPage'
import RegionsPage from '@/pages/RegionsPage'
import ProgramCategoriesPage from '@/pages/ProgramCategoriesPage'
import InstitutionTypesPage from '@/pages/InstitutionTypesPage'
import EligibilityCriteriaPage from '@/pages/EligibilityCriteriaPage'
import ScholarshipProgramsPage from '@/pages/ScholarshipProgramsPage'

// Nouvelles pages - Recommandations et édition de profils
import RecommendationsPage from '@/pages/RecommendationsPage'
import StudentProfileEditPage from '@/pages/StudentProfileEditPage'
import InstitutionProfileEditPage from '@/pages/InstitutionProfileEditPage'
import RecommendationsHistoryPageNew from '@/pages/RecommendationsHistoryPage'

// Nouvelles pages de profil avancé
import ProfileOverviewPage from '@/pages/profile/ProfileOverviewPage'
import PersonalInfoPage from '@/pages/profile/PersonalInfoPage'
import ProfilePhotoPage from '@/pages/profile/PhotoPage'
import NotificationsSettingsPage from '@/pages/profile/NotificationsPage'
import AcademicPage from '@/pages/profile/AcademicPage'
import PreferencesPage from '@/pages/PreferencesPage'
import GoalsPage from '@/pages/profile/GoalsPage'

// Créer le client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
                <Routes>
                  {/* Auth Routes - Public, redirect authenticated users */}
                  <Route 
                    path="/auth" 
                    element={
                      <AuthGuard>
                        <AuthPage />
                      </AuthGuard>
                    } 
                  />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                  
                  {/* Main Application with Layout */}
                  <Route path="/" element={<Layout />}>
                    {/* Public Home Page */}
                    <Route index element={<HomePage />} />
                    
                    {/* Dashboard Routes - Protected */}
                    <Route 
                      path="dashboard" 
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="dashboard/student" 
                      element={
                        <ProtectedRoute requiredRole="student">
                          <StudentDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="dashboard/institution" 
                      element={
                        <ProtectedRoute requiredRole="institution">
                          <InstitutionDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* User-specific Protected Routes */}
                    <Route 
                      path="applications" 
                      element={
                        <ProtectedRoute>
                          <ApplicationsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="favorites" 
                      element={
                        <ProtectedRoute>
                          <FavoritesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="user-favorites" 
                      element={
                        <ProtectedRoute>
                          <UserFavoritesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="notifications" 
                      element={
                        <ProtectedRoute>
                          <NotificationsSettingsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="messages" 
                      element={
                        <ProtectedRoute>
                          <MessagesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="documents" 
                      element={
                        <ProtectedRoute>
                          <DocumentsPage />
                        </ProtectedRoute>
                      } 
                    />
                    {/* Recommandations IA - Routes principales */}
                    <Route 
                      path="recommendations" 
                      element={
                        <ProtectedRoute requiredRole="student">
                          <RecommendationsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="recommendations/history" 
                      element={
                        <ProtectedRoute requiredRole="student">
                          <RecommendationsHistoryPageNew />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Profils utilisateur - Advanced Profile System */}
                    <Route 
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <ProfileLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<ProfileOverviewPage />} />
                      <Route path="personal" element={<PersonalInfoPage />} />
                      <Route path="photo" element={<ProfilePhotoPage />} />
                      <Route path="notifications" element={<NotificationsSettingsPage />} />
                      <Route path="academic" element={<AcademicPage />} />
                      <Route path="preferences" element={<PreferencesPage />} />
                      <Route path="goals" element={<GoalsPage />} />
                    </Route>
                    <Route 
                      path="profile/edit" 
                      element={
                        <ProtectedRoute requiredRole="student">
                          <StudentProfileEditPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="institution/profile/edit" 
                      element={
                        <ProtectedRoute requiredRole="institution">
                          <InstitutionProfileEditPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Legacy profile edit routes */}
                    <Route 
                      path="profile/legacy" 
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="ml-recommendations" 
                      element={
                        <ProtectedRoute>
                          <MlRecommendationsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="ai-recommendations/scholarships" 
                      element={
                        <ProtectedRoute requiredRole="student">
                          <AIScholarshipRecommendationsPage />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="recommendation-history" 
                      element={
                        <ProtectedRoute>
                          <RecommendationHistoryPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Semi-public Routes (enhanced for authenticated users) */}
                    <Route path="search" element={<SearchPage />} />
                    <Route path="scholarships" element={<ScholarshipsPage />} />
                    <Route path="scholarship/:id" element={<ScholarshipDetailPage />} />
                    <Route path="institutions" element={<InstitutionsPage />} />
                    <Route path="institution/:id" element={<InstitutionDetailPage />} />
                    <Route path="countries" element={<CountriesPage />} />
                    <Route path="country/:id" element={<CountryDetailPage />} />
                    <Route path="programs" element={<ProgramsPage />} />
                    <Route path="program/:id" element={<ProgramDetailPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    
                    {/* Admin/Management Routes - Can be protected based on requirements */}
                    <Route path="profiles" element={<ProfilesPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="user-profiles" element={<UserProfilesPage />} />
                    <Route path="student-profiles" element={<StudentProfilesPage />} />
                    <Route path="institution-profiles" element={<InstitutionProfilesPage />} />
                    <Route path="continents" element={<ContinentsPage />} />
                    <Route path="regions" element={<RegionsPage />} />
                    <Route path="program-categories" element={<ProgramCategoriesPage />} />
                    <Route path="institution-types" element={<InstitutionTypesPage />} />
                    <Route path="eligibility-criteria" element={<EligibilityCriteriaPage />} />
                    <Route path="scholarship-programs" element={<ScholarshipProgramsPage />} />
                  </Route>
                  
                  {/* Catch all route - redirect to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                
                {/* Global Toast Notifications */}
                <Toaster 
                  position="top-right" 
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      fontSize: '14px',
                      maxWidth: '500px'
                    },
                    success: {
                      style: {
                        background: '#10B981',
                      },
                      iconTheme: {
                        primary: '#fff',
                        secondary: '#10B981'
                      }
                    },
                    error: {
                      style: {
                        background: '#EF4444',
                      },
                      iconTheme: {
                        primary: '#fff',
                        secondary: '#EF4444'
                      }
                    },
                    loading: {
                      style: {
                        background: '#3B82F6',
                      }
                    }
                  }}
                />
              </div>
            </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
