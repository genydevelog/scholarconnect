import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { toast } from 'react-hot-toast'

export default function AuthPage() {
  const { user, signIn, signUp, loading } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    try {
      setIsSubmitting(true)
      
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
        toast.success('Connexion réussie !')
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        toast.success('Inscription réussie ! Vérifiez votre email.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
            </Button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700"
            >
              {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}