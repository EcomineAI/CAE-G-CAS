export const getUserRole = (email) => {
  if (!email || !email.includes('@')) return null;
  const localPart = email.split('@')[0];
  return /^\d+$/.test(localPart) ? 'student' : 'faculty';
};

export const isValidRoleEmail = (email, expectedRole) => {
  return getUserRole(email) === expectedRole;
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
