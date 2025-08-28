import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { invokeEdgeFunction } from '@/lib/supabase';
import { Bell, BellOff, Check, Trash2, Settings, Mail, MessageSquare, Award, Calendar, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import toast from 'react-hot-toast';

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  scholarship_alerts: boolean;
  deadline_reminders: boolean;
  application_updates: boolean;
  marketing_emails: boolean;
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    scholarship_alerts: true,
    deadline_reminders: true,
    application_updates: true,
    marketing_emails: false
  });
  const [saving, setSaving] = useState(false);

  // Calcul du pourcentage de complétion
  const completionPercentage = Object.values(settings).filter(Boolean).length > 0 ? 100 : 0;

  const handleSettingChange = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Appeler l'Edge Function spécialisée pour les paramètres de notification
      const response = await invokeEdgeFunction('update-notification-settings', settings);
      
      if (response.success) {
        toast.success('Paramètres de notification sauvegardés !');
      } else {
        throw new Error(response.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde paramètres:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_scholarship': return <Award className="w-5 h-5 text-blue-600" />;
      case 'deadline': return <Calendar className="w-5 h-5 text-orange-600" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'system': return <Settings className="w-5 h-5 text-purple-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const baseColors = {
      new_scholarship: 'border-blue-200 bg-blue-50',
      deadline: 'border-orange-200 bg-orange-50',
      message: 'border-green-200 bg-green-50',
      system: 'border-purple-200 bg-purple-50'
    };
    
    return isRead 
      ? 'border-gray-200 bg-gray-50' 
      : baseColors[type as keyof typeof baseColors] || 'border-gray-200 bg-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête avec indicateur de progression */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">Gérez vos alertes et paramètres de notification</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-6 h-6 text-indigo-600" />
                  <span className="text-2xl font-bold text-indigo-600">{unreadCount}</span>
                </div>
                <div className="text-sm text-gray-500">Non lues</div>
              </div>
            </div>
            
            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{notifications.filter(n => n.type === 'new_scholarship').length}</div>
                <div className="text-xs text-blue-800">Bourses</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-600">{notifications.filter(n => n.type === 'deadline_reminder').length}</div>
                <div className="text-xs text-orange-800">Rappels</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{notifications.filter(n => n.type === 'message').length}</div>
                <div className="text-xs text-green-800">Messages</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-600">{notifications.filter(n => n.type === 'system').length}</div>
                <div className="text-xs text-purple-800">Système</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Liste des notifications */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Notifications récentes</h2>
                <div className="flex gap-2">
                  <motion.button
                    onClick={markAllAsRead}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Tout marquer comme lu
                  </motion.button>
                </div>
              </div>
              
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
                    <p className="text-gray-600">Vous êtes à jour ! Aucune nouvelle notification.</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                        getNotificationColor(notification.type, notification.is_read)
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              notification.is_read ? 'text-gray-600' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            notification.is_read ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          {/* Paramètres de notification */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">Paramètres</h2>
              </div>
              
              <div className="space-y-6">
                
                {/* Notifications générales */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Général</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-900">Notifications par email</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">Recevoir les notifications importantes par email</p>
                      </div>
                      <Switch
                        checked={settings.email_notifications}
                        onCheckedChange={() => handleSettingChange('email_notifications')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-900">Notifications push</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">Alertes instantanées dans le navigateur</p>
                      </div>
                      <Switch
                        checked={settings.push_notifications}
                        onCheckedChange={() => handleSettingChange('push_notifications')}
                      />
                    </div>
                  </div>
                </div>

                {/* Alertes spécifiques */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Alertes spécifiques</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-900">Nouvelles bourses</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">Alertes pour les nouvelles opportunités</p>
                      </div>
                      <Switch
                        checked={settings.scholarship_alerts}
                        onCheckedChange={() => handleSettingChange('scholarship_alerts')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-900">Rappels d'échéances</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">Ne manquez aucune date limite</p>
                      </div>
                      <Switch
                        checked={settings.deadline_reminders}
                        onCheckedChange={() => handleSettingChange('deadline_reminders')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-900">Mises à jour des candidatures</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">Statut de vos candidatures</p>
                      </div>
                      <Switch
                        checked={settings.application_updates}
                        onCheckedChange={() => handleSettingChange('application_updates')}
                      />
                    </div>
                  </div>
                </div>

                {/* Marketing */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Marketing</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-900">Emails marketing</span>
                      <p className="text-xs text-gray-500">Conseils et actualités des bourses</p>
                    </div>
                    <Switch
                      checked={settings.marketing_emails}
                      onCheckedChange={() => handleSettingChange('marketing_emails')}
                    />
                  </div>
                </div>
                
                <motion.button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Settings className="w-4 h-4" />
                  )}
                  {saving ? 'Sauvegarde...' : 'Enregistrer les paramètres'}
                </motion.button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
