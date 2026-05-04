/**
 * Detects the user role based on the email pattern.
 * - (numbers)@gordoncollege.edu.ph = student
 * - (name)@gordoncollege.edu.ph = faculty
 */
export const getUserRole = (email) => {
  if (!email || !email.endsWith('@gordoncollege.edu.ph')) return null;
  
  const localPart = email.split('@')[0];
  
  // If it's all numbers, it's a student ID
  if (/^\d+$/.test(localPart)) {
    return 'student';
  }
  
  // Otherwise, it's considered faculty
  return 'faculty';
};

/**
 * Validates if the email matches the expected role pattern.
 */
export const isValidRoleEmail = (email, expectedRole) => {
  const role = getUserRole(email);
  return role === expectedRole;
};

/**
 * Clean display name from email
 */
export const formatNameFromEmail = (email) => {
  if (!email) return 'User';
  const namePart = email.split('@')[0];
  
  // If student ID, return just the ID
  if (/^\d+$/.test(namePart)) {
    return namePart;
  }
  
  // If name, capitalize nicely
  return namePart
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
