import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Navigate, Link } from 'react-router-dom'
import { 
  Brain, 
  TrendingUp, 
  Star, 
  Clock, 
  MapPin, 
  Award, 
  RefreshCw,
  Eye,
  Heart,
  ArrowRight,
  Filter,
  Sparkles
} from 'lucide-react'
import { invokeEdgeFunction } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Recommendation {
  scholarship: any
  compatibilityScore: number
  matchingReasons: string[]
  priority: 'high' | 'medium' | 'low'
}

export default function RecommendationsPage() {
  const { user, profile, studentProfile, loading } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [viewedRecommendations, setViewedRecommendations] = useState<Set<string>>(new Set())

  // Redirection si non connecté ou pas étudiant
  if (!loading && (!user || profile?.user_type !== 'student')) {
    return <Navigate to="/auth" replace />
  }

  // Charger les recommandations au montage
  useEffect(() => {
    if (profile && studentProfile) {
      generateRecommendations()
    }
  }, [profile, studentProfile])

  const generateRecommendations = async () => {
    if (!user || isGenerating) return
    
    setIsGenerating(true)
    try {
      const response = await invokeEdgeFunction('ml-recommendations', {
        userId: user.id,
        userProfile: profile,
        studentProfile: studentProfile,
        action: 'generate_recommendations'
      })

      if (response?.data?.recommendations) {
        setRecommendations(response.data.recommendations)
        setLastGenerated(new Date())
        toast.success(`${response.data.recommendations.length} recommandations générées!`)
      } else {
        throw new Error('Aucune recommandation générée')
      }
    } catch (error) {
      console.error('Erreur génération recommandations:', error)
      toast.error('Erreur lors de la génération des recommandations')
    } finally {
      setIsGenerating(false)
    }
  }

  const markAsViewed = (scholarshipId: string) => {
    setViewedRecommendations(prev => new Set([...prev, scholarshipId]))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Priorité élevée'
      case 'medium': return 'Priorité moyenne'
      case 'low': return 'Priorité faible'
      default: return 'Standard'
    }
  }

  const filteredRecommendations = filterPriority === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.priority === filterPriority)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos recommandations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center mb-2">
                <Brain className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Recommandations IA
                </h1>
                <Sparkles className="h-6 w-6 text-yellow-500 ml-2" />
              </div>
              <p className="text-gray-600">
                Bourses personnalisées basées sur votre profil et vos préférences
              </p>
              {lastGenerated && (
                <p className="text-sm text-gray-500 mt-1">
                  Dernière mise à jour: {lastGenerated.toLocaleString('fr-FR')}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/recommendations/history">
                <Button variant="outline" icon={Clock}>
                  Historique
                </Button>
              </Link>
              <Button 
                variant="primary" 
                icon={RefreshCw}
                onClick={generateRecommendations}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? 'Génération...' : 'Actualiser'}
              </Button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrer par priorité:</span>
            </div>
            
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Toutes' },
                { value: 'high', label: 'Priorité élevée' },
                { value: 'medium', label: 'Priorité moyenne' },
                { value: 'low', label: 'Priorité faible' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterPriority(option.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterPriority === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Résultats */}
        {filteredRecommendations.length === 0 ? (
          <Card className="p-8 text-center">
            {isGenerating ? (
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Génération de vos recommandations...
                </h3>
                <p className="text-gray-600">
                  L'IA analyse votre profil pour vous proposer les meilleures bourses
                </p>
              </div>
            ) : (
              <div>
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune recommandation disponible
                </h3>
                <p className="text-gray-600 mb-4">
                  Complétez votre profil pour recevoir des recommandations personnalisées
                </p>
                <div className="flex gap-3 justify-center">
                  <Link to="/profile/edit">
                    <Button variant="outline">
                      Compléter mon profil
                    </Button>
                  </Link>
                  <Button variant="primary" onClick={generateRecommendations}>
                    Générer des recommandations
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRecommendations.map((recommendation, index) => {
              const { scholarship, compatibilityScore, matchingReasons, priority } = recommendation
              const isViewed = viewedRecommendations.has(scholarship.id)
              
              return (
                <Card key={scholarship.id} className={`p-6 transition-all hover:shadow-lg ${
                  isViewed ? 'opacity-90' : 'ring-2 ring-blue-100'
                }`}>
                  {/* En-tête de la carte */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        getPriorityColor(priority)
                      }`}>
                        {getPriorityLabel(priority)}
                      </span>
                      {!isViewed && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          {compatibilityScore}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Compatibilité</p>
                    </div>
                  </div>
                  
                  {/* Titre et montant */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {scholarship.title}
                    </h3>
                    
                    {scholarship.amount && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span className="text-lg font-bold text-green-600">
                          {scholarship.amount.toLocaleString()} {scholarship.currency || 'EUR'}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-gray-600 text-sm">
                      {scholarship.description.substring(0, 120)}...
                    </p>
                  </div>
                  
                  {/* Raisons de compatibilité */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Pourquoi cette bourse vous correspond:
                    </h4>
                    <div className="space-y-1">
                      {matchingReasons.slice(0, 3).map((reason, reasonIndex) => (
                        <div key={reasonIndex} className="flex items-start space-x-2">
                          <Star className="h-3 w-3 text-yellow-500 mt-0.5" />
                          <span className="text-xs text-gray-600">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Informations complémentaires */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      {scholarship.country && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{scholarship.country}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Deadline: {new Date(scholarship.application_deadline).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link 
                      to={`/scholarship/${scholarship.id}`}
                      className="flex-1"
                      onClick={() => markAsViewed(scholarship.id)}
                    >
                      <Button 
                        variant="primary" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        icon={Eye}
                      >
                        Voir les détails
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      icon={Heart}
                      className="px-3"
                      onClick={() => toast.success('Ajouté aux favoris!')}
                    >
                      
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
        
        {/* Statistiques */}
        {recommendations.length > 0 && (
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistiques de vos recommandations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {recommendations.length}
                </div>
                <div className="text-sm text-gray-600">Recommandations totales</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(recommendations.reduce((acc, rec) => acc + rec.compatibilityScore, 0) / recommendations.length)}%
                </div>
                <div className="text-sm text-gray-600">Compatibilité moyenne</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {recommendations.filter(rec => rec.priority === 'high').length}
                </div>
                <div className="text-sm text-gray-600">Haute priorité</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
