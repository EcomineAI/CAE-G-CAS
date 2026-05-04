import { supabase } from './supabase';

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
    console.error('Error fetching profile:', error);
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
    console.error('Error updating profile:', error);
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
    console.error('Error fetching schedules:', error);
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
    console.error('Error counting requests:', countError);
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
    console.error('Error creating schedule:', error);
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
    console.error('Error updating schedule:', error);
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
    console.error('Error deleting schedule:', error);
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
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      student:profiles!requests_student_id_fkey(full_name, avatar_url, email),
      schedule:schedules(day, start_time, end_time)
    `)
    .eq('faculty_id', facultyId)
    .eq('is_faculty_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching requests:', error);
    return [];
  }

  return (data || []).map(req => {
    let studentName = req.student?.full_name || 'Unknown Student';
    const studentId = req.student?.email ? req.student.email.split('@')[0] : req.student_id;
    
    // Only append ID if the name isn't already just the ID (only numbers)
    if (!(/^\d+$/.test(studentName)) && studentId) {
      studentName = `${studentName} (${studentId})`;
    }

    return {
      id: req.id,
      name: studentName,
      avatar: req.student?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.student_id}`,
      day: req.schedule?.day || 'TBD',
      time: req.schedule
        ? `${String(req.schedule.start_time).slice(0, 5)} - ${String(req.schedule.end_time).slice(0, 5)}`
        : 'TBD',
      date: req.request_date,
      status: req.status,
      subject: req.subject,
      details: req.details,
      cancel_reason: req.cancel_reason
    };
  });
};

/**
 * Update request status (Approved, Declined, Completed, Cancelled).
 */
export const updateRequestStatus = async (requestId, newStatus, cancelReason = null) => {
  const updates = { status: newStatus, updated_at: new Date().toISOString() };
  if (cancelReason !== null) {
    updates.cancel_reason = cancelReason;
  }
  
  const { error } = await supabase
    .from('requests')
    .update(updates)
    .eq('id', requestId);

  if (error) {
    console.error('Error updating request status:', error);
    return false;
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
    console.error('Error updating request details:', error);
    return false;
  }
  return true;
};

/**
 * Get all requests for a student, with faculty profile info.
 */
export const getStudentRequests = async (studentId) => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      faculty:profiles!requests_faculty_id_fkey(full_name, avatar_url),
      schedule:schedules(day, start_time, end_time)
    `)
    .eq('student_id', studentId)
    .eq('is_student_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching student requests:', error);
    return [];
  }

  return (data || []).map(req => ({
    id: req.id,
    name: req.faculty?.full_name || 'Faculty Member',
    avatar: req.faculty?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.faculty_id}`,
    day: req.schedule?.day || 'TBD',
    time: req.schedule
      ? `${String(req.schedule.start_time).slice(0, 5)} - ${String(req.schedule.end_time).slice(0, 5)}`
      : 'TBD',
    date: req.request_date,
    status: req.status,
    subject: req.subject,
    details: req.details
  }));
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
    console.error('Error checking active request:', error);
    return false;
  }
  return data && data.length > 0;
};

// ==========================================
// FACULTY DIRECTORY API (Student side)
// ==========================================

/**
 * Get all faculty members from the profiles table.
 * Returns real names, avatars, and live status.
 */
export const getAllFaculty = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, status, department')
    .eq('role', 'faculty')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching faculty:', error);
    return [];
  }

  return (data || []).map(f => ({
    id: f.id,
    name: f.full_name || 'Faculty Member',
    avatar: f.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.id}`,
    status: f.status || 'Available',
    dept: f.department || 'CCS'
  }));
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
 * Submit a new appointment request.
 */
export const submitRequest = async (requestData) => {
  const { data, error } = await supabase
    .from('requests')
    .insert([requestData])
    .select()
    .single();

  if (error) {
    console.error('Error submitting request:', error);
    return null;
  }
  return data;
};

/**
 * Soft delete a request (History cleaning).
 * Hides it from the specific user side.
 */
export const deleteRequest = async (id, role = 'student') => {
  const column = role === 'faculty' ? 'is_faculty_deleted' : 'is_student_deleted';
  const { data, error } = await supabase
    .from('requests')
    .update({ [column]: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error soft deleting request:', error);
    return false;
  }
  return data && data.length > 0;
};
