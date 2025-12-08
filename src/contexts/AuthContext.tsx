import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
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
  refreshProfile: () => Promise<void>;
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

  // Use refs to avoid stale closure issues
  const profileRef = useRef<UserProfile | null>(null);
  const lastProfileFetch = useRef<number>(0);
  const isFetchingProfile = useRef(false);
  const hasInitialized = useRef(false);

  // Only refetch profile if it's been more than 1 hour
  const PROFILE_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in ms

  const fetchProfile = useCallback(async (userId: string, userEmail: string, userMetadata: any, forceRefresh = false) => {
    const now = Date.now();

    // Skip if already fetching
    if (isFetchingProfile.current) {
      console.log('[Auth] Skipping profile fetch - already in progress');
      return;
    }

    // Skip if we recently fetched (use ref to avoid stale closure)
    if (!forceRefresh && profileRef.current && (now - lastProfileFetch.current) < PROFILE_REFRESH_INTERVAL) {
      console.log('[Auth] Skipping profile fetch - recently fetched');
      return;
    }

    isFetchingProfile.current = true;

    try {
      console.log('[Auth] fetchProfile starting for:', userId);

      // Add timeout to prevent hanging - increased to 10s
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        // Log the full error for debugging
        console.log('[Auth] Profile fetch error details:', { code: error.code, message: error.message, details: error.details, hint: error.hint });

        // Check if profile doesn't exist - handle multiple error formats
        // PGRST116 = no rows returned, or 406 status for .single() with no rows
        const isNoRowsError = error.code === 'PGRST116' ||
                              error.message?.includes('no rows') ||
                              error.details?.includes('0 rows');

        if (isNoRowsError) {
          console.log('[Auth] No profile found, creating one...');

          // Extract name parts from metadata
          const fullName = userMetadata?.name || '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || null;
          const lastName = nameParts.slice(1).join(' ') || null;

          // Create new profile
          const newProfile = {
            id: userId,
            email: userEmail,
            name: fullName || null,
            firstName,
            lastName,
            role: userMetadata?.role || 'apprentice',
            avatarUrl: null
          };

          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert(newProfile);

          if (insertError) {
            console.error('[Auth] Error creating profile:', insertError);
            return;
          }

          console.log('[Auth] Profile created successfully:', newProfile.role);
          profileRef.current = newProfile as UserProfile;
          setProfile(newProfile as UserProfile);
          lastProfileFetch.current = now;
          return;
        }

        console.error('[Auth] Error fetching profile:', error);
        return;
      }

      console.log('[Auth] Profile fetched successfully:', data?.role);
      if (data) {
        profileRef.current = data;
        setProfile(data);
        lastProfileFetch.current = now;
      }
    } catch (err) {
      console.error('[Auth] Exception fetching profile:', err);
      // Don't clear existing profile on timeout - keep using cached profile
    } finally {
      isFetchingProfile.current = false;
    }
  }, []);

  // Function to force refresh profile (called from settings page after updates)
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id, user.email || '', user.user_metadata, true);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    // Only run initialization once
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    console.log('[Auth] Initial getSession starting...');

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] getSession complete:', session ? 'has session' : 'no session');
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
      }

      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] onAuthStateChange:', event);

        // For tab focus events (TOKEN_REFRESHED, SIGNED_IN when we already have a session),
        // don't refetch profile if we already have one
        const isTabFocusEvent = (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && profileRef.current;

        if (isTabFocusEvent) {
          console.log('[Auth] Tab focus event - skipping profile refetch, using cached profile');
          // Just update session/user state without refetching profile
          setSession(session);
          setUser(session?.user ?? null);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_OUT') {
          profileRef.current = null;
          setProfile(null);
          lastProfileFetch.current = 0;
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Only fetch profile for actual sign-in events when we don't have a profile
          if (event === 'SIGNED_IN' && !profileRef.current) {
            setLoading(true);
            await fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
            setLoading(false);
          } else if (event === 'INITIAL_SESSION' && !profileRef.current) {
            // Initial session after page load
            await fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    // Reset profile state on new sign in
    profileRef.current = null;
    lastProfileFetch.current = 0;
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
    profileRef.current = null;
    lastProfileFetch.current = 0;
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
      signIn, signUp, signOut, resetPassword, updatePassword, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
