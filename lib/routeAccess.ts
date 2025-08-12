// lib/routeAccess.ts
export const isPublicRoute = (path: string) => {
  // Allow-list public pages. Adjust as needed.
  if (path === '/') return true;
  if (path === '/pricing') return true;
  if (path === '/community') return true;
  if (path === '/about') return true;
  if (path === '/contact') return true;

  // Auth pages should stay public:
  if (path === '/login' || path.startsWith('/login/')) return true;
  if (path === '/signup') return true;

  return false; // everything else is protected
};

export const isGuestOnlyRoute = (path: string) =>
  path === '/login' || path.startsWith('/login/') || path === '/signup';
