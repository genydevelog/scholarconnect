import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Navigate, Link } from 'react-router-dom'
import { 
  Clock, 
  ArrowLeft, 
  TrendingUp, 
  Star, 
  Calendar,
  BarChart3,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { invokeEdgeFunction } from '@/lib/supabase'
import toast from 'react-hot-toast'

// Interfaces TypeScript robustes
interface Scholarship {
  id: string
  title: string
  description: string
  amount?: number
  currency?: string
  country?: string
  application_deadline: string
  [key: string]: any // Pour les propriétés additionnelles
}

interface Recommendation {
  scholarship: Scholarship
  compatibilityScore: number
  matchingReasons: string[]
  priority: 'high' | 'medium' | 'low'
}

interface HistoryEntry {
  id: string
  generated_at: string
  recommendations: Recommendation[]
  total_recommendations: number
  avg_compatibility: number
}

export default function RecommendationsHistoryPage() {
  const { user, profile, loading } = useAuth()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)

  // Redirection si non connecté ou pas étudiant
  if (!loading && (!user || profile?.user_type !== 'student')) {
    return <Navigate to="/auth" replace />
  }

  // Charger l'historique au montage
  useEffect(() => {
    if (user) {
      loadHistory()
    }
  }, [user])

  const loadHistory = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Utiliser l'edge function pour récupérer l'historique
      const result = await invokeEdgeFunction('ml-recommendations', {
        userId: user.id,
        action: 'get_history'
      })
      
      if (result?.data && Array.isArray(result.data)) {
        // Parser les recommandations JSON string si nécessaire
        const processedHistory: HistoryEntry[] = result.data.map((entry: any) => ({
          ...entry,
          recommendations: typeof entry.recommendations === 'string' 
            ? JSON.parse(entry.recommendations) 
            : entry.recommendations || []
        }))
        
        setHistory(processedHistory)
      } else {
        setHistory([])
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error)
      toast.error('Erreur lors du chargement de l\'historique')
      setHistory([]) // Fallback vers un état vide
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = async () => {
    if (!user || !window.confirm('Voulez-vous vraiment supprimer tout l\'historique ?')) return
    
    try {
      await invokeEdgeFunction('ml-recommendations', {
        userId: user.id,
        action: 'clear_history'
      })
      
      setHistory([])
      setSelectedEntry(null)
      toast.success('Historique supprimé avec succès')
    } catch (error) {
      console.error('Erreur suppression historique:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'historique...</p>
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
                <Link to="/recommendations" className="mr-3">
                  <Button variant="outline" icon={ArrowLeft} className="px-3">
                    Retour
                  </Button>
                </Link>
                <Clock className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Historique des recommandations
                </h1>
              </div>
              <p className="text-gray-600">
                Consultez vos précédentes générations de recommandations
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                icon={RefreshCw}
                onClick={loadHistory}
              >
                Actualiser
              </Button>
              {history.length > 0 && (
                <Button 
                  variant="outline" 
                  icon={Trash2}
                  onClick={clearHistory}
                  className="text-red-600 hover:text-red-700"
                >
                  Vider l'historique
                </Button>
              )}
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun historique disponible
            </h3>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore généré de recommandations
            </p>
            <Link to="/recommendations">
              <Button variant="primary">
                Générer des recommandations
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des entrées d'historique */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Sessions ({history.length})
              </h2>
              
              {history.map((entry) => (
                <Card 
                  key={entry.id} 
                  className={`p-4 cursor-pointer transition-all ${
                    selectedEntry?.id === entry.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(entry.generated_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.generated_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>{entry.total_recommendations} bourses</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{Math.round(entry.avg_compatibility || 0)}% moy.</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Détails de l'entrée sélectionnée */}
            <div className="lg:col-span-2">
              {selectedEntry ? (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Session du {new Date(selectedEntry.generated_at).toLocaleDateString('fr-FR')}
                      </h2>
                      <p className="text-gray-600">
                        {selectedEntry.total_recommendations} recommandations générées
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(selectedEntry.avg_compatibility || 0)}%
                      </div>
                      <div className="text-xs text-gray-500">Compatibilité moy.</div>
                    </div>
                  </div>
                  
                  {/* Liste des recommandations de cette session */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {(selectedEntry.recommendations || []).map((rec, index) => (
                      <div key={`${selectedEntry.id}-${index}`} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {rec.scholarship?.title || 'Titre non disponible'}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-green-600">
                                {rec.compatibilityScore || 0}%
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rec.priority === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : rec.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {rec.priority === 'high' ? 'Haute' : 
                               rec.priority === 'medium' ? 'Moyenne' : 'Faible'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {rec.scholarship?.description?.substring(0, 100) || 'Description non disponible'}...
                        </p>
                        
                        {rec.matchingReasons && rec.matchingReasons.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              Raisons de compatibilité:
                            </div>
                            <div className="space-y-1">
                              {rec.matchingReasons.slice(0, 2).map((reason, reasonIndex) => (
                                <div key={reasonIndex} className="flex items-start space-x-2">
                                  <Star className="h-3 w-3 text-yellow-500 mt-0.5" />
                                  <span className="text-xs text-gray-600">{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {rec.scholarship?.amount && (
                              <span className="font-medium text-green-600">
                                {rec.scholarship.amount.toLocaleString()} {rec.scholarship.currency || 'EUR'}
                              </span>
                            )}
                            {rec.scholarship?.country && (
                              <span className="ml-2">• {rec.scholarship.country}</span>
                            )}
                          </div>
                          
                          {rec.scholarship?.id && (
                            <Link to={`/scholarship/${rec.scholarship.id}`}>
                              <Button size="sm" icon={Eye}>
                                Voir
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sélectionnez une session
                  </h3>
                  <p className="text-gray-600">
                    Cliquez sur une entrée à gauche pour voir les détails
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
