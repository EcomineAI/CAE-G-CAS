import { createClient } from '@supabase/supabase-js';
import { detectRoleFromEmail } from './api';
import { logError } from './ux';

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
  const detectedRole = detectRoleFromEmail(user.email);

  const { data: existing } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (existing) {
    if (existing.role) return existing;
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: detectedRole })
      .eq('id', user.id)
      .is('role', null)
      .select()
      .single();
    if (error) {
      logError('Failed to assign role to existing profile:', error);
      return existing;
    }
    return data;
  }

  const localPart = user.email.split('@')[0];
  const isStudent = detectedRole === 'student';

  const profile = {
    id: user.id,
    email: user.email,
    full_name: isStudent
      ? localPart
      : localPart.split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
    role: detectedRole,
    avatar_url: null,
    status: 'Available'
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert([profile], { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    logError('Failed to ensure profile:', error);
    return null;
  }
  return data;
};


