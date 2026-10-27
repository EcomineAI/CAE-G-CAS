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
 * Subscribe to faculty profile status changes.
 * Used by student Faculty Directory to see live status updates.
 * @param {Function} callback - Called with the update payload { new: {id, status, ...} }
 * @returns {Function} unsubscribe function
 */
export const subscribeToFacultyStatus = (callback) => {
  const channel = supabase
    .channel('faculty-status')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
      },
      (payload) => {
        if (payload.new?.role === 'faculty') callback(payload);
      }
    )
    .subscribe();

  return () => {
    if (channel) supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to a specific user's own profile row.
 * Syncs profile changes made from another tab/device back into the current session.
 * @param {string} userId
 * @param {Function} callback - Called with the full updated profile row
 * @returns {Function} unsubscribe function
 */
export const subscribeToOwnProfile = (userId, callback) => {
  const channel = supabase
    .channel(`own-profile-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    if (channel) supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to request changes that affect slot fill counts for a faculty member's schedules.
 * Any request INSERT/UPDATE/DELETE for this faculty re-fetches schedules so slot counts stay live.
 * @param {string} facultyId
 * @param {Function} fetchFn - Async function that returns the updated schedule list
 * @param {Function} callback - Called with the updated schedule list
 * @returns {Function} unsubscribe function
 */
export const subscribeToSlotFills = (facultyId, fetchFn, callback) => {
  const channel = supabase
    .channel(`slot-fills-${facultyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'requests',
        filter: `faculty_id=eq.${facultyId}`,
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


