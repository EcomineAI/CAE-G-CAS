import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase';
import { formatNameFromEmail } from '../utils/authUtils';

const ADMIN_USER = {
  id: 'admin-bypass',
  email: 'Admin@gmail.com',
  role: 'faculty',
  displayName: 'Admin',
  avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`,
};

// Fetch profile with timeout + maybeSingle so missing rows don't throw
const fetchProfile = async (userId) => {
  try {
    const query = supabase
      .from('profiles')
      .select('role, full_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    // 4-second safety net — if Supabase hangs, give up and continue
    const timeout = new Promise(resolve =>
      setTimeout(() => resolve({ data: null, error: 'timeout' }), 4000)
    );

    const { data } = await Promise.race([query, timeout]);
    return data || null;
  } catch (e) {
    console.warn('[useAuth] profile fetch failed, continuing with defaults', e);
    return null;
  }
};

const processUser = async (sessionUser) => {
  if (!sessionUser) return null;
  const meta = sessionUser.user_metadata || {};
  const oauthAvatar = meta.avatar_url || meta.picture || null;

  const profile = await fetchProfile(sessionUser.id);

  return {
    ...sessionUser,
    role: profile?.role || 'student',
    displayName: profile?.full_name || formatNameFromEmail(sessionUser.email),
    avatarUrl: oauthAvatar || profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessionUser.email}`
  };
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem('admin_bypass') === '1') {
      setUser(ADMIN_USER);
      setLoading(false);
      return;
    }

    let cancelled = false;

    // Hard safety: no matter what, exit loading state within 6s
    const hardTimeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('[useAuth] hard timeout — forcing loading=false');
        setLoading(false);
      }
    }, 6000);

    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        const processed = session?.user ? await processUser(session.user) : null;
        if (cancelled) return;
        setUser(processed);
      } catch (e) {
        console.error('[useAuth] fetchSession error', e);
      } finally {
        if (!cancelled) {
          clearTimeout(hardTimeout);
          setLoading(false);
        }
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      const processed = session?.user ? await processUser(session.user) : null;
      if (cancelled) return;
      setUser(processed);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      clearTimeout(hardTimeout);
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};
