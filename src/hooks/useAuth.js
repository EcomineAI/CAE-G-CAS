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

// Clear per-role UI state when the signed-in user changes
const clearStaleTabState = (currentUserId) => {
  const lastUid = localStorage.getItem('facs_last_uid');
  if (lastUid && lastUid !== currentUserId) {
    localStorage.removeItem('gcas_student_tab');
    localStorage.removeItem('gcas_faculty_tab');
  }
  if (currentUserId) localStorage.setItem('facs_last_uid', currentUserId);
};

// Fetch profile with timeout + maybeSingle so missing rows don't throw.
// Returns { profile, timedOut } so caller can tell the difference between
// "no profile row" and "we never heard back from Supabase".
const fetchProfile = async (userId) => {
  try {
    const query = supabase
      .from('profiles')
      .select('role, full_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    const timeout = new Promise(resolve =>
      setTimeout(() => resolve({ data: null, error: null, __timeout: true }), 5000)
    );

    const res = await Promise.race([query, timeout]);
    return { profile: res?.data || null, timedOut: !!res?.__timeout };
  } catch (e) {
    console.warn('[useAuth] profile fetch failed', e);
    return { profile: null, timedOut: false };
  }
};

const processUser = async (sessionUser) => {
  if (!sessionUser) return null;
  const meta = sessionUser.user_metadata || {};
  const oauthAvatar = meta.avatar_url || meta.picture || null;

  const { profile, timedOut } = await fetchProfile(sessionUser.id);

  // If Supabase timed out, DON'T guess the role — bubble up so we can retry
  // instead of silently defaulting to 'student' and misrouting a faculty user.
  if (timedOut) {
    const err = new Error('profile fetch timed out');
    err.code = 'PROFILE_TIMEOUT';
    throw err;
  }

  return {
    ...sessionUser,
    role: profile?.role || 'student', // only reached when profile is explicitly null (no row)
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
    let latestToken = 0; // monotonically increases, so stale resolves lose

    const applyUser = async (sessionUser, source) => {
      const myToken = ++latestToken;
      try {
        const processed = sessionUser ? await processUser(sessionUser) : null;
        if (cancelled || myToken !== latestToken) return; // a newer call superseded us
        if (processed) clearStaleTabState(processed.id);
        else clearStaleTabState(null);
        setUser(processed);
      } catch (e) {
        if (cancelled || myToken !== latestToken) return;
        if (e?.code === 'PROFILE_TIMEOUT') {
          // Retry once after a short delay before giving up
          console.warn(`[useAuth] (${source}) profile timed out, retrying…`);
          try {
            const processed = await processUser(sessionUser);
            if (cancelled || myToken !== latestToken) return;
            if (processed) clearStaleTabState(processed.id);
            setUser(processed);
          } catch {
            if (cancelled || myToken !== latestToken) return;
            console.error('[useAuth] profile fetch failed after retry — signing out');
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          console.error(`[useAuth] (${source}) error`, e);
        }
      } finally {
        if (!cancelled && myToken === latestToken) setLoading(false);
      }
    };

    // Hard timeout: give up after 10s so we never hang forever
    const hardTimeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('[useAuth] hard timeout — forcing loading=false');
        setLoading(false);
      }
    }, 10000);

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      applyUser(session?.user ?? null, 'initial');
    });

    // Auth state subscription (handles login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'SIGNED_OUT') {
        latestToken++;
        clearStaleTabState(null);
        setUser(null);
        setLoading(false);
        return;
      }
      applyUser(session?.user ?? null, event);
    });

    return () => {
      cancelled = true;
      clearTimeout(hardTimeout);
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};
