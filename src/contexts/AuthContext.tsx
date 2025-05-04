
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session and setup subscription
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast({ 
        title: 'Welcome back!', 
        description: 'You have successfully signed in.' 
      });
      navigate('/');
    } catch (error: any) {
      toast({ 
        title: 'Error signing in', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      if (error) throw error;
      toast({ 
        title: 'Account created!', 
        description: 'Please check your email to confirm your account.' 
      });
      navigate('/');
    } catch (error: any) {
      toast({ 
        title: 'Error creating account', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({ title: 'Signed out', description: 'You have been signed out.' });
      navigate('/');
    } catch (error: any) {
      toast({ 
        title: 'Error signing out', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id);

      if (error) throw error;

      // Refresh profile
      if (user) await fetchProfile(user.id);
      
      toast({ 
        title: 'Profile updated', 
        description: 'Your profile has been updated successfully.' 
      });
    } catch (error: any) {
      toast({ 
        title: 'Error updating profile', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
