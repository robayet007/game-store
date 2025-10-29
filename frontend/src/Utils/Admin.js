// utils/admin.js
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator', 
  USER: 'user'
};

// // ✅ আপনার email admin user হিসেবে add করুন
// export const ADMIN_USERS = [
//   'admin@metagameshop.com',
//   'evolveera25@gmail.com'  // ✅ আপনার email
// ];

// export const isAdminUser = (user) => {
//   if (!user || !user.email) return false;
//   return ADMIN_USERS.includes(user.email.toLowerCase());
// };

export const getUserRole = (user) => {
  if (!user) return USER_ROLES.USER;
  if (isAdminUser(user)) return USER_ROLES.ADMIN;
  return USER_ROLES.USER;
};