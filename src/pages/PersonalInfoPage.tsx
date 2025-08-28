import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Save, MapPin, Phone, Mail, User, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

const personalInfoSchema = z.object({
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  bio: z.string().max(500, 'La bio ne peut pas dépasser 500 caractères').optional()
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

const PersonalInfoPage: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading, getProfile, updateProfile, validateProfileData } = useProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: user?.email || '',
      phone: '',
      date_of_birth: '',
      nationality: '',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      bio: ''
    }
  });

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user, getProfile]);

  useEffect(() => {
    if (profile) {
      setValue('first_name', profile.first_name || '');
      setValue('last_name', profile.last_name || '');
      setValue('email', profile.email || user?.email || '');
      setValue('phone', profile.phone || '');
      setValue('date_of_birth', profile.date_of_birth || '');
      setValue('nationality', profile.nationality || '');
      setValue('address', profile.address || '');
      setValue('city', profile.city || '');
      setValue('country', profile.country || '');
      setValue('postal_code', profile.postal_code || '');
      setValue('bio', profile.bio || '');
    }
  }, [profile, setValue, user?.email]);

  const onSubmit = async (data: PersonalInfoForm) => {
    try {
      await validateProfileData(data);
      await updateProfile(data);
      toast.success('Informations personnelles mises à jour avec succès !');
    } catch (error: any) {
      console.error('Error updating personal info:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Veuillez vous connecter pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <User className="w-7 h-7 mr-3" />
            Informations Personnelles
          </h1>
          <p className="text-blue-100 mt-2">
            Gérez vos informations personnelles et votre profil public
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Chargement du profil...</span>
          </div>
        )}

        {!loading && (
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informations de base
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input
                    id="first_name"
                    {...register('first_name')}
                    placeholder="Votre prénom"
                    className={errors.first_name ? 'border-red-500' : ''}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input
                    id="last_name"
                    {...register('last_name')}
                    placeholder="Votre nom"
                    className={errors.last_name ? 'border-red-500' : ''}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Contact
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="votre@email.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Informations personnelles
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date_of_birth">Date de naissance</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...register('date_of_birth')}
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationalité</Label>
                  <Input
                    id="nationality"
                    {...register('nationality')}
                    placeholder="Française"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Adresse
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="123 Rue de la Paix"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="Paris"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Code postal</Label>
                    <Input
                      id="postal_code"
                      {...register('postal_code')}
                      placeholder="75001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      {...register('country')}
                      placeholder="France"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                À propos de vous
              </h2>
              <div>
                <Label htmlFor="bio">Biographie (optionnel)</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Parlez-nous de vous, vos intérêts, vos objectifs..."
                  className="min-h-[100px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {watch('bio')?.length || 0}/500 caractères
                </p>
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default PersonalInfoPage;