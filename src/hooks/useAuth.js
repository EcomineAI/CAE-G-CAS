import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase';
import { getUserRole, formatNameFromEmail } from '../utils/authUtils';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const processUser = (sessionUser) => {
    if (!sessionUser) return null;
    return {
      ...sessionUser,
      role: getUserRole(sessionUser.email),
      displayName: formatNameFromEmail(sessionUser.email),
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessionUser.email}`
    };
  };

  useEffect(() => {
    // Get initial session
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(processUser(session?.user));
      setLoading(false);
    };

    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(processUser(session?.user));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};
