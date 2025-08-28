import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Bell, Mail, Smartphone, MessageSquare, Settings, Save, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Separator } from '@/components/ui/Separator';
import { toast } from 'react-hot-toast';

interface NotificationSettings {
  // Notifications générales
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  
  // Types de notifications
  scholarship_matches: boolean;
  application_deadlines: boolean;
  status_updates: boolean;
  new_scholarships: boolean;
  profile_completion: boolean;
  
  // Fréquence
  email_frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  summary_frequency: 'daily' | 'weekly' | 'monthly';
  
  // Heures de notification
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  
  // Préférences avancées
  marketing_emails: boolean;
  partner_offers: boolean;
  newsletter: boolean;
}

const NotificationsPage: React.FC = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isDirty }
  } = useForm<NotificationSettings>({
    defaultValues: {
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      scholarship_matches: true,
      application_deadlines: true,
      status_updates: true,
      new_scholarships: true,
      profile_completion: true,
      email_frequency: 'daily',
      summary_frequency: 'weekly',
      quiet_hours_enabled: true,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      marketing_emails: false,
      partner_offers: false,
      newsletter: true
    }
  });

  const emailNotifications = watch('email_notifications');
  const pushNotifications = watch('push_notifications');
  const quietHoursEnabled = watch('quiet_hours_enabled');

  const onSubmit = async (data: NotificationSettings) => {
    try {
      console.log('Paramètres de notifications à sauvegarder:', data);
      
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('🔔 Préférences de notifications sauvegardées!');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('⚠️ Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <Bell className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Configurez vos préférences de communication</p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Canaux de notification */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Canaux de Communication
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Notifications par email</h3>
                  <p className="text-sm text-gray-600">Recevez des mises à jour par email</p>
                </div>
              </div>
              <Controller
                name="email_notifications"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch checked={value} onCheckedChange={onChange} />
                )}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Notifications push</h3>
                  <p className="text-sm text-gray-600">Notifications instantanées sur votre appareil</p>
                </div>
              </div>
              <Controller
                name="push_notifications"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch checked={value} onCheckedChange={onChange} />
                )}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Notifications SMS</h3>
                  <p className="text-sm text-gray-600">Messages texte pour les alertes urgentes</p>
                </div>
              </div>
              <Controller
                name="sms_notifications"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch checked={value} onCheckedChange={onChange} />
                )}
              />
            </div>
          </div>
        </motion.div>

        {/* Types de notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Types de Notifications</h2>
          
          <div className="space-y-4">
            {[
              {
                name: 'scholarship_matches',
                title: 'Nouvelles bourses correspondantes',
                description: 'Quand des bourses correspondent à votre profil'
              },
              {
                name: 'application_deadlines',
                title: 'Dates limites d\'applications',
                description: 'Rappels avant l\'expiration des candidatures'
              },
              {
                name: 'status_updates',
                title: 'Mises à jour de statut',
                description: 'Changements sur vos candidatures en cours'
              },
              {
                name: 'new_scholarships',
                title: 'Nouvelles bourses ajoutées',
                description: 'Quand de nouvelles bourses sont disponibles'
              },
              {
                name: 'profile_completion',
                title: 'Complétion du profil',
                description: 'Rappels pour compléter votre profil'
              }
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/30 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <Controller
                  name={item.name as keyof NotificationSettings}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Switch checked={value as boolean} onCheckedChange={onChange} />
                  )}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Fréquence et timing */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Fréquence et Timing</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="email_frequency">Fréquence des emails</Label>
              <Controller
                name="email_frequency"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange} disabled={!emailNotifications}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immédiatement</SelectItem>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="summary_frequency">Résumés d'activité</Label>
              <Controller
                name="summary_frequency"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <Separator className="my-6" />

          {/* Heures silencieuses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  {quietHoursEnabled ? (
                    <VolumeX className="w-5 h-5 text-orange-600" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Heures silencieuses</h3>
                  <p className="text-sm text-gray-600">Pas de notifications pendant ces heures</p>
                </div>
              </div>
              <Controller
                name="quiet_hours_enabled"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch checked={value} onCheckedChange={onChange} />
                )}
              />
            </div>

            {quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 pl-11">
                <div className="space-y-2">
                  <Label htmlFor="quiet_hours_start">Début</Label>
                  <Controller
                    name="quiet_hours_start"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <input
                        type="time"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet_hours_end">Fin</Label>
                  <Controller
                    name="quiet_hours_end"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <input
                        type="time"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Préférences marketing */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/50 rounded-xl p-6 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Communications Optionnelles</h2>
          
          <div className="space-y-4">
            {[
              {
                name: 'newsletter',
                title: 'Newsletter hebdomadaire',
                description: 'Conseils, actualités et mises à jour du service'
              },
              {
                name: 'marketing_emails',
                title: 'Emails promotionnels',
                description: 'Offres spéciales et nouveautés du service'
              },
              {
                name: 'partner_offers',
                title: 'Offres partenaires',
                description: 'Promotions et services de nos partenaires'
              }
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/30 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <Controller
                  name={item.name as keyof NotificationSettings}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Switch checked={value as boolean} onCheckedChange={onChange} />
                  )}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bouton de sauvegarde */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end pt-6 border-t border-gray-200"
        >
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
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

export default NotificationsPage;