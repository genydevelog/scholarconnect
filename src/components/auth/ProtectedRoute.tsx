import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'student' | 'institution'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // For now, we allow all authenticated users
  // TODO: Implement role-based access control if needed
  
  return <>{children}</>
}