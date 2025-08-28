import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, invokeEdgeFunction } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  bio?: string;
  website?: string;
  city?: string;
  country?: string;
  user_type: 'student' | 'institution';
  avatar_url?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface StudentProfile {
  id: string;
  user_id: string;
  field_of_study?: string;
  current_education_level?: string;
  current_institution?: string;
  gpa?: string;
  graduation_year?: number;
  languages?: string[];
  languages_spoken?: string[];
  preferred_study_countries?: string[];
  preferred_study_fields?: string[];
  career_goals?: string;
  academic_achievements?: string[];
  extracurricular_activities?: string[];
  date_of_birth?: string;
  nationality?: string;
  work_experience?: string;
  financial_need_level?: number;
  study_duration_preference?: string;
  budget_range_min?: string;
  budget_range_max?: string;
  scholarship_priorities?: string[];
  career_aspirations?: string;
  personal_statement?: string;
  created_at?: string;
  updated_at?: string;
}

interface InstitutionProfile {
  id: string;
  user_id: string;
  institution_name?: string;
  institution_type?: string;
  country?: string;
  city?: string;
  website?: string;
  website_url?: string;
  description?: string;
  focus_areas?: string[];
  accreditations?: string[];
  ranking?: string;
  student_population?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  studentProfile: StudentProfile | null;
  institutionProfile: InstitutionProfile | null;
  loading: boolean;
  isStudent: boolean;
  isInstitution: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateStudentProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  updateInstitutionProfile: (updates: Partial<InstitutionProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [institutionProfile, setInstitutionProfile] = useState<InstitutionProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Computed properties
  const isStudent = profile?.user_type === 'student';
  const isInstitution = profile?.user_type === 'institution';

  // Load user and profiles
  const loadUserData = async (userId: string) => {
    try {
      // Load main profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId) // CORRIGÉ: utiliser id au lieu de user_id
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      setProfile(profileData);

      // Load specific profile based on user type
      if (profileData.user_type === 'student') {
        const { data: studentData, error: studentError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('profile_id', userId) // CORRIGÉ: utiliser profile_id au lieu de user_id
          .single();

        if (!studentError) {
          setStudentProfile(studentData);
        }
      } else if (profileData.user_type === 'institution') {
        const { data: institutionData, error: institutionError } = await supabase
          .from('institution_profiles')
          .select('*')
          .eq('profile_id', userId) // CORRIGÉ: utiliser profile_id au lieu de user_id
          .single();

        if (!institutionError) {
          setInstitutionProfile(institutionData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          await loadUserData(user.id);
        }
      } finally {
        setLoading(false);
      }
    }
    
    loadUser();

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          await loadUserData(currentUser.id);
        } else {
          // Clear profiles when user logs out
          setProfile(null);
          setStudentProfile(null);
          setInstitutionProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Auth methods
  async function signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp(email: string, password: string) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
      }
    });
  }

  async function signOut() {
    return await supabase.auth.signOut();
  }

  // Profile update methods - CORRIGÉ pour utiliser l'Edge Function
  async function updateProfile(updates: Partial<Profile>) {
    if (!user || !profile) return;

    try {
      const { data } = await invokeEdgeFunction('profile-manager', {
        action: 'update_profile',
        userId: user.id,
        profileData: updates
      });

      if (data && data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async function updateStudentProfile(updates: Partial<StudentProfile>) {
    if (!user) return;

    try {
      const { data } = await invokeEdgeFunction('profile-manager', {
        action: 'update_student_profile',
        userId: user.id,
        profileData: updates
      });

      if (data && data.success) {
        setStudentProfile(data.data);
      }
    } catch (error) {
      console.error('Error updating student profile:', error);
      throw error;
    }
  }

  async function updateInstitutionProfile(updates: Partial<InstitutionProfile>) {
    if (!user) return;

    try {
      const { data } = await invokeEdgeFunction('profile-manager', {
        action: 'update_institution_profile',
        userId: user.id,
        profileData: updates
      });

      if (data && data.success) {
        setInstitutionProfile(data.data);
      }
    } catch (error) {
      console.error('Error updating institution profile:', error);
      throw error;
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    studentProfile,
    institutionProfile,
    loading,
    isStudent,
    isInstitution,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateStudentProfile,
    updateInstitutionProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { AuthContextType, Profile, StudentProfile, InstitutionProfile };
