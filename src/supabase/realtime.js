import { supabase } from './supabase';
import { showNotification } from '../utils/notifications';

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
      async (payload) => {
        // Handle Notifications
        if (role === 'faculty' && payload.eventType === 'INSERT') {
          showNotification('New Appointment Request', `You have a new request from a student.`);
        } else if (role === 'student' && payload.eventType === 'UPDATE') {
          const newStatus = payload.new.status;
          const oldStatus = payload.old.status;
          if (newStatus !== oldStatus) {
            showNotification('Appointment Update', `Your request has been ${newStatus.toLowerCase()}.`);
          }
        }

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
        filter: 'role=eq.faculty'
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    if (channel) supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to all schedule changes (not filtered by faculty).
 * Used by student side to see updated schedules when browsing.
 * @param {Function} callback - Called on any change
 * @returns {Function} unsubscribe function
 */
export const subscribeToAllSchedules = (callback) => {
  const channel = supabase
    .channel('all-schedules')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'schedules'
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    if (channel) supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to the current user's own profile changes.
 * Ensures local UI (status rings, names) updates instantly when changed.
 * @param {string} userId - User ID to monitor
 * @param {Function} callback - Called with the updated profile data
 * @returns {Function} unsubscribe function
 */
export const subscribeToMyProfile = (userId, callback) => {
  const channel = supabase
    .channel(`my-profile-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    if (channel) supabase.removeChannel(channel);
  };
};
