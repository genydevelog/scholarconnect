import { useState, useCallback } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export interface ProfileData {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  bio?: string;
  profile_picture_url?: string;
  academic_info?: any;
  goals?: any;
  preferences?: any;
  documents?: any;
  notifications_settings?: any;
  completion_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Get user profile data
  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const user = await requireAuth();
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      setProfile(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error(error.message || 'Erreur lors de la récupération du profil');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile data
  const updateProfile = useCallback(async (updates: Partial<ProfileData>) => {
    try {
      setLoading(true);
      const user = await requireAuth();
      
      const updateData = {
        ...updates,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(updateData)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();
        
      if (error) throw error;
      
      setProfile(data);
      toast.success('Profil mis à jour avec succès !');
      
      // Calculate completion percentage
      await calculateProfileCompletion();
      
      return data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate profile completion using Edge Function
  const calculateProfileCompletion = useCallback(async () => {
    try {
      const user = await requireAuth();
      
      const { data, error } = await supabase.functions.invoke('profile-completion-calculator', {
        body: { user_id: user.id }
      });
      
      if (error) {
        console.error('Error calculating profile completion:', error);
        return;
      }
      
      // Update profile with new completion percentage
      if (data?.completion_percentage !== undefined) {
        await supabase
          .from('user_profiles')
          .update({ completion_percentage: data.completion_percentage })
          .eq('user_id', user.id);
        
        setProfile(prev => prev ? { ...prev, completion_percentage: data.completion_percentage } : null);
      }
    } catch (error) {
      console.error('Error in profile completion calculation:', error);
    }
  }, []);

  // Validate profile data using Edge Function
  const validateProfileData = useCallback(async (profileData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('profile-data-validator', {
        body: { profile_data: profileData }
      });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error validating profile data:', error);
      throw error;
    }
  }, []);

  return {
    profile,
    loading,
    getProfile,
    updateProfile,
    calculateProfileCompletion,
    validateProfileData
  };
}