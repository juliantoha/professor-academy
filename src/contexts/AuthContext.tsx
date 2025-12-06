import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'professor' | 'apprentice';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, role?: 'professor' | 'apprentice') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Profile may not exist yet for this user
        setProfile(null);
        return;
      }

      if (data) setProfile(data);
    } catch (err) {
      console.error('Exception fetching profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    console.log('[Auth] Initial getSession starting...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] getSession complete:', session ? 'has session' : 'no session');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('[Auth] Fetching profile for:', session.user.id);
        fetchProfile(session.user.id);
      }
      setLoading(false);
      console.log('[Auth] Loading set to false');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] onAuthStateChange:', event, session ? 'has session' : 'no session');
        setLoading(true);
        setSession(session);
        setUser(session?.user ?? null);
        try {
          if (session?.user) {
            console.log('[Auth] Fetching profile for:', session.user.id);
            await fetchProfile(session.user.id);
            console.log('[Auth] Profile fetch complete');
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('[Auth] Error during auth state change:', err);
          setProfile(null);
        } finally {
          setLoading(false);
          console.log('[Auth] Loading set to false after auth change');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, name: string, role: 'professor' | 'apprentice' = 'apprentice') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${window.location.origin}/login`
      }
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      signIn, signUp, signOut, resetPassword, updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
