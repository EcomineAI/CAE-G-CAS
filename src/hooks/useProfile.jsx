import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getProfile, updateProfile } from '../supabase/api';
import { subscribeToOwnProfile } from '../supabase/realtime';
import { optimistic, toast } from '../supabase/ux';
import { useAuth } from './useAuth';

const ProfileContext = createContext(null);

const AVATAR_PALETTE = ['#2e4a87','#7c3aed','#0891b2','#0d9488','#d97706','#db2777','#059669','#dc2626'];

function resolveAvatarColor(color, name, userId) {
  if (color) return color;
  const stored = userId ? localStorage.getItem(`askademic_avatar_color_${userId}`) : null;
  if (stored) return stored;
  return AVATAR_PALETTE[(name?.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
}

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [avatarColor, setAvatarColor] = useState(null);
  const loadedForUser = useRef(null);

  // Derived display fields
  const displayName   = profileData?.full_name  || user?.displayName || '';
  const namePrefix    = profileData?.name_prefix || '';
  const nameSuffix    = profileData?.name_suffix || '';
  const avatarUrl     = profileData?.avatar_url  || user?.avatarUrl  || null;
  const resolvedColor = resolveAvatarColor(avatarColor, displayName, user?.id);

  // Load profile once per user
  useEffect(() => {
    if (!user?.id || loadedForUser.current === user.id) return;
    loadedForUser.current = user.id;

    getProfile(user.id).then(p => {
      if (!p) return;
      setProfileData(p);
      if (p.avatar_color) {
        setAvatarColor(p.avatar_color);
        localStorage.setItem(`askademic_avatar_color_${user.id}`, p.avatar_color);
      } else {
        const stored = localStorage.getItem(`askademic_avatar_color_${user.id}`);
        if (stored) setAvatarColor(stored);
      }
    });
  }, [user?.id]);

  // Realtime own-profile sync (another tab or device saved changes)
  useEffect(() => {
    if (!user?.id) return;
    return subscribeToOwnProfile(user.id, (updated) => {
      setProfileData(prev => ({ ...prev, ...updated }));
      if (updated.avatar_color) {
        setAvatarColor(updated.avatar_color);
        localStorage.setItem(`askademic_avatar_color_${user.id}`, updated.avatar_color);
      }
    });
  }, [user?.id]);

  // Optimistic profile update — updates local state immediately, rolls back on failure
  const updateProfileOptimistic = useCallback(async (payload) => {
    if (!user?.id) return false;
    const result = await optimistic(
      setProfileData,
      profileData,
      { ...profileData, ...payload },
      () => updateProfile(user.id, payload),
      { success: 'Profile updated!', error: 'Failed to save profile. Reverted.' }
    );
    if (result && payload.avatar_color) {
      setAvatarColor(payload.avatar_color);
      localStorage.setItem(`askademic_avatar_color_${user.id}`, payload.avatar_color);
    }
    return result;
  }, [user?.id, profileData]);

  // Instant avatar color update (no save button needed — fires on color pick)
  const updateAvatarColorInstant = useCallback(async (color) => {
    if (!user?.id) return;
    setAvatarColor(color);
    setProfileData(prev => prev ? { ...prev, avatar_color: color } : prev);
    localStorage.setItem(`askademic_avatar_color_${user.id}`, color);
    // Fire-and-forget; no optimistic rollback needed for a cosmetic preference
    await updateProfile(user.id, { avatar_color: color });
  }, [user?.id]);

  const value = {
    profileData,
    setProfileData,
    displayName,
    namePrefix,
    nameSuffix,
    avatarUrl,
    avatarColor: resolvedColor,
    updateProfileOptimistic,
    updateAvatarColorInstant,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
