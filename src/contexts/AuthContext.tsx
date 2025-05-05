
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

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
              // Convert the preferences to the proper type
              const preferences = profile.preferences ? {
                cuisines: Array.isArray(profile.preferences.cuisines) ? profile.preferences.cuisines : [],
                dietaryRestrictions: Array.isArray(profile.preferences.dietaryRestrictions) 
                  ? profile.preferences.dietaryRestrictions : [],
                skillLevel: (profile.preferences.skillLevel === 'beginner' || 
                              profile.preferences.skillLevel === 'intermediate' || 
                              profile.preferences.skillLevel === 'advanced') 
                            ? profile.preferences.skillLevel 
                            : 'beginner'
              } : {
                cuisines: [],
                dietaryRestrictions: [],
                skillLevel: "beginner"
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
              // Convert the preferences to the proper type
              const preferences = profile.preferences ? {
                cuisines: Array.isArray(profile.preferences.cuisines) ? profile.preferences.cuisines : [],
                dietaryRestrictions: Array.isArray(profile.preferences.dietaryRestrictions) 
                  ? profile.preferences.dietaryRestrictions : [],
                skillLevel: (profile.preferences.skillLevel === 'beginner' || 
                              profile.preferences.skillLevel === 'intermediate' || 
                              profile.preferences.skillLevel === 'advanced') 
                            ? profile.preferences.skillLevel 
                            : 'beginner'
              } : {
                cuisines: [],
                dietaryRestrictions: [],
                skillLevel: "beginner"
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
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
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
