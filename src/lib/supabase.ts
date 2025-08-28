import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yvuiksswghrqmpwcthkz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dWlrc3N3Z2hycW1wd2N0aGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjUyNzAsImV4cCI6MjA3MTEwMTI3MH0.X6MQZDWqa-6he75a4A9RBKx73tG8P5FGKeVbpZA-rVA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get current user with error handling
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

// Helper function to ensure user is authenticated
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Utilisateur non authentifié. Veuillez vous connecter.');
  }
  return user;
}

// Helper function to invoke Supabase Edge Functions
export async function invokeEdgeFunction(functionName: string, payload?: any) {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error invoking edge function '${functionName}':`, error);
    throw error;
  }
}