
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Json } from '@/integrations/supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setSupabaseUser(session?.user || null);
      
      // Load the user profile if we have a session
      if (session?.user) {
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              // Safely access preferences object with type checking
              const preferencesObj = profile.preferences as { 
                cuisines?: string[]; 
                dietaryRestrictions?: string[]; 
                skillLevel?: string 
              } | null;

              // Create a properly typed preferences object with proper type casting
              const preferences = {
                cuisines: Array.isArray(preferencesObj?.cuisines) ? preferencesObj.cuisines : [],
                dietaryRestrictions: Array.isArray(preferencesObj?.dietaryRestrictions) 
                  ? preferencesObj.dietaryRestrictions : [],
                skillLevel: (preferencesObj?.skillLevel === 'beginner' || 
                              preferencesObj?.skillLevel === 'intermediate' || 
                              preferencesObj?.skillLevel === 'advanced') 
                            ? preferencesObj.skillLevel as "beginner" | "intermediate" | "advanced"
                            : "beginner" as const
              };
              
              setUser({
                id: profile.id,
                name: profile.full_name || '',
                email: session.user.email || '',
                preferences: preferences,
                savedRecipes: []
              });
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        }, 0);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user || null);
      
      if (session?.user) {
        // Fetch user profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              // Safely access preferences object with type checking
              const preferencesObj = profile.preferences as { 
                cuisines?: string[]; 
                dietaryRestrictions?: string[]; 
                skillLevel?: string 
              } | null;

              // Create a properly typed preferences object with proper type casting
              const preferences = {
                cuisines: Array.isArray(preferencesObj?.cuisines) ? preferencesObj.cuisines : [],
                dietaryRestrictions: Array.isArray(preferencesObj?.dietaryRestrictions) 
                  ? preferencesObj.dietaryRestrictions : [],
                skillLevel: (preferencesObj?.skillLevel === 'beginner' || 
                              preferencesObj?.skillLevel === 'intermediate' || 
                              preferencesObj?.skillLevel === 'advanced') 
                            ? preferencesObj.skillLevel as "beginner" | "intermediate" | "advanced"
                            : "beginner" as const
              };
              
              setUser({
                id: profile.id,
                name: profile.full_name || '',
                email: session.user.email || '',
                preferences: preferences,
                savedRecipes: []
              });
            }
          })
          .catch((error) => {
            console.error('Error fetching user profile:', error);
          });
      }
      
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      supabaseUser,
      isLoading, 
      signIn, 
      signUp, 
      signOut 
    }}>
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
