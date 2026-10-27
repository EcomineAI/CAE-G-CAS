import { supabase } from './supabase';

// =============================================
// REALTIME SUBSCRIPTION HELPERS
// Provides live cross-side updates
// =============================================

/**
 * Subscribe to schedule changes for a specific faculty member.
 * Triggers callback on any INSERT, UPDATE, or DELETE.
 * @param {string} facultyId - Faculty user ID to filter by
 * @param {Function} callback - Called with the full updated schedule list
 * @param {Function} fetchFn - Function to re-fetch the full list
 * @returns {Function} unsubscribe function
 */
export const subscribeToSchedules = (facultyId, callback, fetchFn) => {
  const channel = supabase
    .channel(`schedules-${facultyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'schedules',
        filter: `faculty_id=eq.${facultyId}`
      },
      async () => {
        // Re-fetch the full list on any change
        const data = await fetchFn();
        callback(data);
      }
    )
    .subscribe();

  return () => {
    if (channel) supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to request changes.
 * For faculty: listens for requests targeting them.
 * For students: listens for their own requests being updated.
 * @param {string} userId - User ID
 * @param {'student'|'faculty'} role - User role
 * @param {Function} callback - Called with updated request list
 * @param {Function} fetchFn - Function to re-fetch the full list
 * @returns {Function} unsubscribe function
 */
export const subscribeToRequests = (userId, role, callback, fetchFn) => {
  const filterColumn = role === 'faculty' ? 'faculty_id' : 'student_id';

  const channel = supabase
    .channel(`requests-${role}-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'requests',
        filter: `${filterColumn}=eq.${userId}`
      },
      async () => {
        const data = await fetchFn();
        callback(data);
      }
    )
    .subscribe();

  return () => {
    if (channel) supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to faculty profile status changes AND schedule changes.
 * Used by student Faculty Directory / Dashboard to see live availability.
 * - Profile UPDATE → patches status on existing list entry via statusCallback
 * - Schedules INSERT/UPDATE/DELETE → triggers full refetch via refetchFn
 * @param {Function} statusCallback - Called with payload { new: {id, status, ...} }
 * @param {Function} [refetchFn] - Called when any schedule changes; should re-fetch faculty list
 * @returns {Function} unsubscribe function
 */
export const subscribeToFacultyStatus = (statusCallback, refetchFn) => {
  const channel = supabase
    .channel('faculty-status')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles' },
      (payload) => {
        if (payload.new?.role === 'faculty') statusCallback(payload);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'schedules' },
      async () => {
        if (refetchFn) await refetchFn();
      }
    )
    .subscribe();

  return () => {
    if (channel) supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to a specific user's own profile changes.
 * Keeps the dashboard UI in sync across multiple tabs/devices when the profile
 * is updated from another session.
 * @param {string} userId
 * @param {Function} callback - Called with the updated profile row
 * @returns {Function} unsubscribe function
 */
export const subscribeToOwnProfile = (userId, callback) => {
  const channel = supabase
    .channel(`own-profile-${userId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
      (payload) => { if (payload.new) callback(payload.new); }
    )
    .subscribe();
  return () => { if (channel) supabase.removeChannel(channel); };
};

/**
 * Subscribe to request count changes for a schedule slot.
 * Lets the booking UI update slot capacity in real-time across all clients.
 * @param {string[]} scheduleIds - Array of schedule IDs to watch
 * @param {Function} fetchFn - Re-fetches full schedule list and returns it
 * @param {Function} callback - Called with the refreshed schedule list
 * @returns {Function} unsubscribe function
 */
export const subscribeToSlotFills = (scheduleIds, fetchFn, callback) => {
  if (!scheduleIds || scheduleIds.length === 0) return () => {};
  const channel = supabase
    .channel(`slot-fills-${scheduleIds.join('-')}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'requests' },
      async (payload) => {
        const sid = payload.new?.schedule_id || payload.old?.schedule_id;
        if (!sid || !scheduleIds.includes(sid)) return;
        const data = await fetchFn();
        callback(data);
      }
    )
    .subscribe();
  return () => { if (channel) supabase.removeChannel(channel); };
};


