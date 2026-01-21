import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Clear any old localStorage auth data from previous sessions
// This ensures clean session management when switching to sessionStorage
const oldAuthKeys = Object.keys(localStorage).filter(key =>
  key.startsWith('sb-') || key.includes('supabase')
);
oldAuthKeys.forEach(key => localStorage.removeItem(key));

// Use sessionStorage instead of localStorage so sessions clear when browser closes
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
