import { supabase } from './supabase';
import { logError } from './ux';

// Auto-complete Approved and auto-expire Pending requests whose date has passed.
// Runs silently before any fetch.
const autoCompleteExpired = async (filterColumn, userId) => {
  const today = new Date().toISOString().slice(0, 10);
  const now   = new Date().toISOString();

  // 1. Approved → Completed (silent, no notification needed — faculty already confirmed)
  await supabase
    .from('requests')
    .update({ status: 'Completed', updated_at: now })
    .eq(filterColumn, userId)
    .eq('status', 'Approved')
    .lt('request_date', today);

  // 2. Pending → Expired: fetch affected rows first so we can notify the student
  const { data: expiring } = await supabase
    .from('requests')
    .select('id, student_id, faculty_id, faculty:profiles!requests_faculty_id_fkey(full_name, name_prefix)')
    .eq(filterColumn, userId)
    .eq('status', 'Pending')
    .lt('request_date', today);

  if (!expiring || expiring.length === 0) return;

  const ids = expiring.map(r => r.id);
  await supabase
    .from('requests')
    .update({ status: 'Expired', updated_at: now })
    .in('id', ids);

  // Notify each student once (only when we're running as the faculty fetch,
  // so filterColumn === 'faculty_id'; the student fetch would double-notify)
  if (filterColumn === 'faculty_id') {
    for (const req of expiring) {
      if (!req.student_id) continue;
      const prefix    = req.faculty?.name_prefix ? `${req.faculty.name_prefix} ` : '';
      const facName   = `${prefix}${req.faculty?.full_name || 'your faculty'}`;
      await insertNotification(
        req.student_id,
        'expired',
        `Your consultation request to ${facName} has expired because it was not responded to in time.`,
        req.id
      );
    }
  }
};

const insertNotification = async (userId, type, message, requestId = null) => {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    message,
    request_id: requestId,
    is_read: false,
  });
  if (error) logError('[notif] insert failed:', error);
};

// ==========================================
// PROFILE API
// ==========================================

/**
 * Get a user's profile from the profiles table.
 */
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    logError('Error fetching profile:', error);
    return null;
  }
  return data;
};

/**
 * Update a user's profile (e.g., name, avatar, status).
 */
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    logError('Error updating profile:', error);
    return null;
  }
  return data;
};

/**
 * Update faculty availability status.
 */
export const updateFacultyStatus = async (facultyId, status) => {
  return updateProfile(facultyId, { status });
};


// ==========================================
// SCHEDULING API
// ==========================================

/**
 * Get all schedules for a faculty member, with computed filled count.
 */
export const getFacultySchedules = async (facultyId) => {
  // Fetch schedules
  const { data: schedules, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: true });

  if (error) {
    logError('Error fetching schedules:', error);
    return [];
  }

  if (!schedules || schedules.length === 0) return [];

  // Count approved/pending requests per schedule to get filled count
  const scheduleIds = schedules.map(s => s.id);
  const { data: requestCounts, error: countError } = await supabase
    .from('requests')
    .select('schedule_id')
    .in('schedule_id', scheduleIds)
    .in('status', ['Approved', 'Pending']);

  if (countError) {
    logError('Error counting requests:', countError);
    // Return schedules without filled count
    return schedules.map(s => ({ ...s, filled: 0 }));
  }

  // Build count map
  const countMap = {};
  (requestCounts || []).forEach(r => {
    countMap[r.schedule_id] = (countMap[r.schedule_id] || 0) + 1;
  });

  return schedules.map(s => ({
    ...s,
    filled: countMap[s.id] || 0
  }));
};

export const createSchedule = async (scheduleData) => {
  const { data, error } = await supabase
    .from('schedules')
    .insert([scheduleData])
    .select()
    .single();

  if (error) {
    logError('Error creating schedule:', error);
    return null;
  }
  return data;
};

export const updateSchedule = async (scheduleId, updates) => {
  const { data, error } = await supabase
    .from('schedules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) {
    logError('Error updating schedule:', error);
    return null;
  }
  return data;
};

export const deleteSchedule = async (scheduleId) => {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) {
    logError('Error deleting schedule:', error);
    return false;
  }
  return true;
};


// ==========================================
// REQUESTS API
// ==========================================

/**
 * Get all requests for a faculty member, with student profile info.
 */
export const getFacultyRequests = async (facultyId) => {
  await autoCompleteExpired('faculty_id', facultyId);
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      student:profiles!requests_student_id_fkey(full_name, avatar_url, avatar_color, email, name_prefix, name_suffix),
      schedule:schedules(day, start_time, end_time, max_slots, room)
    `)
    .eq('faculty_id', facultyId)
    .eq('is_faculty_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    logError('Error fetching requests:', error);
    return [];
  }

  return (data || []).map(req => {
    let studentName = req.student?.full_name || 'Unknown Student';
    const studentId = req.student?.email ? req.student.email.split('@')[0] : req.student_id;

    if (!(/^\d+$/.test(studentName)) && studentId) {
      studentName = `${studentName} (${studentId})`;
    }

    return {
      id: req.id,
      name: studentName,
      namePrefix: req.student?.name_prefix || '',
      nameSuffix: req.student?.name_suffix || '',
      avatar: req.student?.avatar_url || null,
      avatarColor: req.student?.avatar_color || null,
      avatarSeed: req.student_id,
      day: req.schedule?.day || 'TBD',
      startTime: req.schedule?.start_time || null,
      endTime: req.schedule?.end_time || null,
      time: req.schedule
        ? `${String(req.schedule.start_time).slice(0, 5)} - ${String(req.schedule.end_time).slice(0, 5)}`
        : 'TBD',
      date: req.request_date,
      created_at: req.created_at,
      schedule_id: req.schedule_id,
      status: req.status,
      subject: req.subject,
      details: req.details,
      consultationType: req.consultation_type || 'General',
      cancel_reason: req.cancel_reason,
      declineReason: req.decline_reason || null,
      facultySeen: req.faculty_seen_at || null,
      statusLog: req.status_log || [],
      messages: req.messages || [],
      facultyNote: req.faculty_note || null,
      max_slots: req.schedule?.max_slots || 1,
      room: req.room || req.schedule?.room || null
    };
  });
};

/**
 * Update request status. Accepts optional cancelReason, declineReason, or facultyNote.
 */
export const updateRequestStatus = async (requestId, newStatus, cancelReason = null, declineReason = null, facultyNote = null, notifContext = null, room = null) => {
  const updates = { status: newStatus, updated_at: new Date().toISOString() };
  if (cancelReason !== null) updates.cancel_reason = cancelReason;
  if (declineReason !== null) updates.decline_reason = declineReason;
  if (facultyNote !== null) updates.faculty_note = facultyNote;
  if (room !== null) updates.room = room;

  const { error } = await supabase
    .from('requests')
    .update(updates)
    .eq('id', requestId);

  if (error) {
    logError('Error updating request status:', error);
    return false;
  }

  // Fire notifications based on new status (4th arg = request_id for deep-link)
  if (notifContext) {
    const { studentId, facultyId, studentName, facultyName, day, time } = notifContext;
    if (newStatus === 'Approved' && studentId) {
      await insertNotification(studentId, 'approved', `Your consultation request with ${facultyName} has been approved!`, requestId);
    } else if (newStatus === 'Declined' && studentId) {
      const reason = declineReason ? ` Reason: ${declineReason}` : '';
      await insertNotification(studentId, 'declined', `Your request with ${facultyName} was declined.${reason}`, requestId);
    } else if (newStatus === 'Completed' && studentId) {
      await insertNotification(studentId, 'completed', `Your consultation with ${facultyName} has been marked complete.`, requestId);
    } else if (newStatus === 'Cancelled') {
      // Faculty-initiated cancel → notify student
      if (studentId && facultyName) {
        await insertNotification(studentId, 'cancelled', `${facultyName} cancelled your appointment${cancelReason ? ` (${cancelReason})` : ''}.`, requestId);
      }
      // Student-initiated cancel → notify faculty
      if (facultyId && studentName) {
        await insertNotification(facultyId, 'cancelled', `${studentName} cancelled their appointment on ${day} at ${time}.`, requestId);
      }
    }
  }

  return true;
};

/**
 * Update request subject and details (Student side).
 */
export const updateRequestDetails = async (requestId, subject, details) => {
  const { error } = await supabase
    .from('requests')
    .update({ 
      subject: subject, 
      details: details, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', requestId);

  if (error) {
    logError('Error updating request details:', error);
    return false;
  }
  return true;
};

/**
 * Get all requests for a student, with faculty profile info.
 */
export const getStudentRequests = async (studentId) => {
  await autoCompleteExpired('student_id', studentId);
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      faculty:profiles!requests_faculty_id_fkey(full_name, avatar_url, name_prefix, name_suffix),
      schedule:schedules(day, start_time, end_time, max_slots, room)
    `)
    .eq('student_id', studentId)
    .eq('is_student_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    logError('Error fetching student requests:', error);
    return [];
  }

  return (data || []).map(req => {
    const fPrefix = req.faculty?.name_prefix || '';
    const fSuffix = req.faculty?.name_suffix || '';
    const fBase   = req.faculty?.full_name   || 'Faculty Member';
    const facultyDisplay = [fPrefix, fBase, fSuffix].filter(Boolean).join(' ');
    return {
    id: req.id,
    name: facultyDisplay,
    fullName: fBase,
    namePrefix: fPrefix,
    nameSuffix: fSuffix,
    avatar: req.faculty?.avatar_url || null,
    avatarSeed: req.faculty_id,
    day: req.schedule?.day || 'TBD',
    startTime: req.schedule?.start_time || null,
    endTime: req.schedule?.end_time || null,
    time: req.schedule
      ? `${String(req.schedule.start_time).slice(0, 5)} - ${String(req.schedule.end_time).slice(0, 5)}`
      : 'TBD',
    date: req.request_date,
    created_at: req.created_at,
    status: req.status,
    subject: req.subject,
    details: req.details,
    consultationType: req.consultation_type || 'General',
    declineReason: req.decline_reason || null,
    cancelReason: req.cancel_reason || null,
    facultySeen: req.faculty_seen_at || null,
    statusLog: req.status_log || [],
    messages: req.messages || [],
    facultyNote: req.faculty_note || null,
    facultyDeleted: req.is_faculty_deleted ?? false,
    schedule_id: req.schedule_id,
    max_slots: req.schedule?.max_slots || 1,
    room: req.room || req.schedule?.room || null
    };
  });
};


/**
 * Check if a student already has an active request for a specific faculty.
 */
export const checkActiveRequest = async (studentId, facultyId) => {
  const { data, error } = await supabase
    .from('requests')
    .select('id')
    .eq('student_id', studentId)
    .eq('faculty_id', facultyId)
    .in('status', ['Pending', 'Approved']);

  if (error) {
    logError('Error checking active request:', error);
    return false;
  }
  return data && data.length > 0;
};

/**
 * Check if student already has an active request for a SPECIFIC schedule slot. (#39)
 */
export const checkActiveRequestForSlot = async (studentId, scheduleId) => {
  const { data, error } = await supabase
    .from('requests')
    .select('id')
    .eq('student_id', studentId)
    .eq('schedule_id', scheduleId)
    .in('status', ['Pending', 'Approved']);

  if (error) {
    logError('Error checking slot request:', error);
    return false;
  }
  return data && data.length > 0;
};

/**
 * Get count of active (Pending + Approved) requests for a student. (#40)
 */
export const getActiveRequestCount = async (studentId) => {
  const { count, error } = await supabase
    .from('requests')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .in('status', ['Pending', 'Approved']);

  if (error) return 0;
  return count || 0;
};

/**
 * Mark a request as seen by faculty. (#33)
 * Called once when faculty first renders the request card.
 */
export const markRequestSeen = async (requestId) => {
  const { error } = await supabase
    .from('requests')
    .update({ faculty_seen_at: new Date().toISOString() })
    .eq('id', requestId)
    .is('faculty_seen_at', null); // only set once

  if (error) logError('Error marking request seen:', error);
};

// ==========================================
// FACULTY DIRECTORY API (Student side)
// ==========================================

export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, department, status, avatar_url, avatar_color, created_at')
    .neq('full_name', 'Admin')
    .order('role', { ascending: true })
    .order('full_name', { ascending: true });

  if (error) {
    logError('Error fetching all profiles:', error);
    return [];
  }
  return data || [];
};

export const updateUserRole = async (userId, role) => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);
  if (error) { logError('Error updating user role:', error); return false; }
  return true;
};


// ==========================================
// BLOCKED DATES API
// ==========================================

/** Get all blocked date ranges for a faculty member. */
export const getBlockedDates = async (facultyId) => {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('*')
    .eq('faculty_id', facultyId)
    .order('from_date', { ascending: true });
  if (error) { logError('Error fetching blocked dates:', error); return []; }
  return data || [];
};

/** Create a new blocked date range for a faculty member. */
export const createBlockedDate = async ({ faculty_id, from_date, to_date, reason = '' }) => {
  const { data, error } = await supabase
    .from('blocked_dates')
    .insert([{ faculty_id, from_date, to_date, reason }])
    .select()
    .single();
  if (error) { logError('Error creating blocked date:', error); return null; }
  return data;
};

/**
 * Set out-of-office for a date range:
 * creates a blocked_date, cancels all Pending+Approved requests in range, notifies students.
 */
export const setOutOfOffice = async (facultyId, fromDate, toDate, facultyName) => {
  // 1. Block the date range
  const block = await createBlockedDate({ faculty_id: facultyId, from_date: fromDate, to_date: toDate, reason: 'Out of office' });

  // 2. Fetch affected requests
  const { data: reqs } = await supabase
    .from('requests')
    .select('id, student_id, request_date')
    .eq('faculty_id', facultyId)
    .in('status', ['Pending', 'Approved'])
    .gte('request_date', fromDate)
    .lte('request_date', toDate);

  // 3. Cancel each and notify student
  for (const req of (reqs || [])) {
    await supabase.from('requests').update({
      status: 'Cancelled',
      cancel_reason: 'Faculty is out of office',
      updated_at: new Date().toISOString(),
    }).eq('id', req.id);
    if (req.student_id) {
      await insertNotification(
        req.student_id, 'cancelled',
        `${facultyName} is out of office from ${fromDate} to ${toDate}. Your appointment has been cancelled.`,
        req.id
      );
    }
  }

  // 4. Update faculty status
  await updateProfile(facultyId, { status: 'Out of office' });

  return { block, cancelledCount: (reqs || []).length };
};

/** Delete a blocked date range by id. */
export const deleteBlockedDate = async (id) => {
  const { error } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('id', id);
  if (error) { logError('Error deleting blocked date:', error); return false; }
  return true;
};

/** Check if a specific date (YYYY-MM-DD) is blocked for a faculty member. */
export const isDateBlocked = async (facultyId, dateStr) => {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('id, reason')
    .eq('faculty_id', facultyId)
    .lte('from_date', dateStr)
    .gte('to_date', dateStr)
    .limit(1);
  if (error) { logError('Error checking blocked date:', error); return null; }
  return (data && data.length > 0) ? data[0] : null;
};

export const getAllRequests = async () => {
  const { data, error } = await supabase
    .from('requests')
    .select('id, status, request_date, created_at, student_id, faculty_id, subject, student:profiles!requests_student_id_fkey(full_name), faculty:profiles!requests_faculty_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    logError('Error fetching all requests:', error);
    return [];
  }
  return (data || []).map(r => ({
    id: r.id,
    status: r.status,
    date: r.request_date || r.created_at,
    studentId: r.student_id,
    facultyId: r.faculty_id,
    studentName: r.student?.full_name || '—',
    facultyName: r.faculty?.full_name || '—',
    subject: r.subject || null,
  }));
};

// Admin-only: bypasses RLS via SECURITY DEFINER RPC function.
// Requires running this SQL in Supabase dashboard first:
//   create or replace function admin_get_all_requests()
//   returns setof requests security definer set search_path = public language sql
//   as $$ select * from requests order by created_at desc limit 200; $$;
export const getAllRequestsAdmin = async () => {
  const { data, error } = await supabase.rpc('admin_get_all_requests');
  if (error) {
    logError('Error fetching all requests (admin RPC):', error);
    return [];
  }
  return (data || []).map(r => ({
    id: r.id,
    status: r.status,
    date: r.request_date || r.created_at,
    studentId: r.student_id,
    facultyId: r.faculty_id,
    subject: r.subject || null,
  }));
};

const DAY_ORDER = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Compute the next bookable slot label + whether one exists, given a faculty's schedules.
// Skips slots that are time-expired today AND slots where filled >= max_slots (fully booked).
export const computeNextSlot = (schedules) => {
  const now = new Date();
  const todayIdx = now.getDay();
  // Only recurring slots with capacity remaining
  const recurring = (schedules || []).filter(s => {
    if (s.schedule_type === 'one-time' || !s.day) return false;
    const filled = s.filled ?? 0;
    const max    = s.max_slots ?? 1;
    return filled < max; // skip fully-booked slots
  });
  let best = null, bestDiff = Infinity;

  for (const s of recurring) {
    const idx = DAY_ORDER.indexOf(s.day);
    if (idx < 0) continue;
    let diff = (idx - todayIdx + 7) % 7;

    // If it's today, check if the end time has already passed — if so, push to next week
    if (diff === 0) {
      const [eh, em] = String(s.end_time || '').split(':').map(Number);
      if (!isNaN(eh)) {
        const slotEnd = new Date(now);
        slotEnd.setHours(eh, em || 0, 0, 0);
        if (now > slotEnd) diff = 7;
      }
    }

    if (diff < bestDiff) { bestDiff = diff; best = s; }
  }

  if (!best) return { nextSlot: null, hasBookableSlot: false };

  const date = new Date(now);
  date.setDate(now.getDate() + bestDiff);
  const dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const [h, m] = String(best.start_time || '').split(':').map(Number);
  let nextSlot = dateLabel;
  if (!isNaN(h)) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    const minStr = m > 0 ? `:${String(m).padStart(2, '0')}` : '';
    nextSlot = `${dateLabel} · ${hour}${minStr} ${ampm}`;
  }
  return { nextSlot, hasBookableSlot: true };
};

/**
 * Get all faculty members with their next bookable slot pre-computed.
 * Fetches active request counts per schedule so computeNextSlot can
 * correctly skip fully-booked slots when evaluating availability.
 */
export const getAllFaculty = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, avatar_color, status, department, name_prefix, name_suffix, schedules(id, day, start_time, end_time, schedule_type, max_slots)')
    .eq('role', 'faculty')
    .neq('full_name', 'Admin')
    .order('full_name', { ascending: true });

  if (error) {
    logError('Error fetching faculty:', error);
    return [];
  }

  // Collect all schedule ids across all faculty so we can batch-count in one query
  const allScheduleIds = (data || []).flatMap(f => (f.schedules || []).map(s => s.id));

  let fillMap = {};
  if (allScheduleIds.length > 0) {
    const { data: activeCounts, error: countError } = await supabase
      .from('requests')
      .select('schedule_id')
      .in('schedule_id', allScheduleIds)
      .in('status', ['Pending', 'Approved']);

    if (!countError) {
      (activeCounts || []).forEach(r => {
        fillMap[r.schedule_id] = (fillMap[r.schedule_id] || 0) + 1;
      });
    }
  }

  return (data || []).map(f => {
    const prefix = f.name_prefix || '';
    const suffix = f.name_suffix || '';
    const base   = f.full_name   || 'Faculty Member';
    const displayName = [prefix, base, suffix].filter(Boolean).join(' ');

    // Attach filled counts so computeNextSlot can skip full slots
    const schedulesWithFill = (f.schedules || []).map(s => ({
      ...s,
      filled: fillMap[s.id] || 0,
    }));

    const { nextSlot, hasBookableSlot } = computeNextSlot(schedulesWithFill);
    return {
      id: f.id,
      name: displayName,
      fullName: base,
      namePrefix: prefix,
      nameSuffix: suffix,
      avatar: f.avatar_url || null,
      avatarColor: f.avatar_color || null,
      status: f.status || 'Available',
      dept: f.department || 'Faculty',
      nextSlot,
      hasBookableSlot,
      schedules: schedulesWithFill,
    };
  });
};

/**
 * Get schedules for a specific faculty member (student booking view).
 * Includes filled count to show available slots.
 */
export const getSchedulesForFaculty = async (facultyId) => {
  // Reuse the same logic as getFacultySchedules
  return getFacultySchedules(facultyId);
};

/**
 * Submit a new appointment request via atomic RPC.
 *
 * Uses submit_request_atomic() which holds a pg_advisory_xact_lock
 * on the schedule row so concurrent submissions are serialized at the
 * DB layer — first commit wins, second gets SLOT_FULL.
 *
 * Returns:
 *   { data }           — success, data is the inserted request row
 *   { error: 'SLOT_FULL' }  — slot was taken by a concurrent booking
 *   { error: 'OTHER' }      — any other DB error
 */
export const submitRequest = async (requestData, notifContext = null) => {
  const { data: rpcData, error } = await supabase.rpc('submit_request_atomic', {
    p_student_id:        requestData.student_id,
    p_faculty_id:        requestData.faculty_id,
    p_schedule_id:       requestData.schedule_id,
    p_subject:           requestData.subject      ?? '',
    p_details:           requestData.details       ?? '',
    p_request_date:      requestData.request_date,
    p_consultation_type: requestData.consultation_type ?? 'General',
  });

  if (error) {
    const isSlotFull = error.message?.includes('SLOT_FULL') ||
                       error.details?.includes('SLOT_FULL') ||
                       error.hint?.includes('SLOT_FULL');
    if (isSlotFull) return { error: 'SLOT_FULL' };
    logError('Error submitting request:', error);
    return { error: 'OTHER' };
  }

  // rpc() with a RETURNS json function gives us the row as a plain object
  const inserted = typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData;

  if (notifContext?.facultyId && notifContext?.studentName && inserted?.id) {
    const { facultyId, studentName, day, time } = notifContext;
    await insertNotification(
      facultyId,
      'new_request',
      `${studentName} requested a consultation on ${day} at ${time}.`,
      inserted.id
    );
  }

  return { data: inserted };
};

/**
 * Soft delete a request (History cleaning).
 * Hides it from the specific user side.
 */
export const deleteRequest = async (id, role = 'student') => {
  const column = role === 'faculty' ? 'is_faculty_deleted' : 'is_student_deleted';
  const { error } = await supabase
    .from('requests')
    .update({ [column]: true, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) {
    logError('Error soft deleting request:', error);
    return false;
  }
  return true;
};

/**
 * Restore a soft-deleted request (un-archive).
 */
export const restoreRequest = async (id, role = 'student') => {
  const column = role === 'faculty' ? 'is_faculty_deleted' : 'is_student_deleted';
  const { error } = await supabase
    .from('requests')
    .update({ [column]: false, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) { logError('Error restoring request:', error); return false; }
  return true;
};

/**
 * Get archived (soft-deleted) requests for a student or faculty member.
 */
export const getArchivedRequests = async (userId, role = 'student') => {
  const isStudent = role === 'student';
  const col = isStudent ? 'student_id' : 'faculty_id';
  const deletedCol = isStudent ? 'is_student_deleted' : 'is_faculty_deleted';
  const joinCol = isStudent
    ? 'faculty:profiles!requests_faculty_id_fkey(full_name, name_prefix, name_suffix)'
    : 'student:profiles!requests_student_id_fkey(full_name)';

  const { data, error } = await supabase
    .from('requests')
    .select(`id, status, subject, request_date, updated_at, ${joinCol}`)
    .eq(col, userId)
    .eq(deletedCol, true)
    .order('updated_at', { ascending: false });

  if (error) { logError('Error fetching archived requests:', error); return []; }

  return (data || []).map(r => ({
    id: r.id,
    status: r.status,
    subject: r.subject || '—',
    date: r.request_date,
    updatedAt: r.updated_at,
    otherParty: isStudent
      ? [r.faculty?.name_prefix, r.faculty?.full_name, r.faculty?.name_suffix].filter(Boolean).join(' ')
      : (r.student?.full_name || '—'),
  }));
};

/**
 * Upload profile avatar to Supabase Storage.
 */
export const uploadAvatar = async (userId, file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('profiles')
    .upload(filePath, file);

  if (uploadError) {
    logError('Error uploading avatar:', uploadError);
    return null;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profiles')
    .getPublicUrl(filePath);

  return publicUrl;
};
