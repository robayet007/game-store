// utils/admin.js

// Admin users list - এখানে আপনার admin users এর email গুলো add করুন
export const ADMIN_USERS = [
  'admin@metagameshop.com',
  'admin@gmail.com',
  'your-admin-email@gmail.com'
];

// Check if user is admin
export const isAdminUser = (user) => {
  if (!user || !user.email) return false;
  return ADMIN_USERS.includes(user.email.toLowerCase());
};