import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper
export const auth = supabase.auth;

/**
 * Ensures the current authenticated user has a profile row.
 * Handles users who signed up before the DB trigger was created.
 */
export const ensureProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check if profile exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existing) return existing;

  // Auto-create profile from auth metadata
  const localPart = user.email.split('@')[0];
  const isStudent = /^\d+$/.test(localPart);

  const profile = {
    id: user.id,
    email: user.email,
    full_name: isStudent
      ? localPart
      : localPart.split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
    role: isStudent ? 'student' : 'faculty',
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
    status: 'Available'
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert([profile], { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Failed to ensure profile:', error);
    return null;
  }
  return data;
};
