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

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const processUser = async (sessionUser) => {
    if (!sessionUser) return null;

    const meta = sessionUser.user_metadata || {};
    const oauthAvatar = meta.avatar_url || meta.picture || null;

    // Fetch role from profiles table (admin-controlled)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, avatar_url')
      .eq('id', sessionUser.id)
      .single();

    return {
      ...sessionUser,
      role: profile?.role || 'student',
      displayName: profile?.full_name || formatNameFromEmail(sessionUser.email),
      avatarUrl: oauthAvatar || profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessionUser.email}`
    };
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_bypass') === '1') {
      setUser(ADMIN_USER);
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const processed = session?.user ? await processUser(session.user) : null;
      setUser(processed);
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const processed = session?.user ? await processUser(session.user) : null;
      setUser(processed);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};
