// lib/auth/signOut.ts
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export async function signOutAndRedirect(router?: { replace: (p: string) => any }) {
  const supabase = supabaseBrowser();
  // Clear client session first (local)
  try { await supabase.auth.signOut({ scope: 'local' } as any); } catch {}
  // Clear server cookie (Next.js auth helpers) if present
  try { await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' }); } catch {}

  try {
    // Remove any app-local flags that can cause reroutes
    localStorage.removeItem('selectedRole');
    sessionStorage.removeItem('selectedRole');
  } catch {}

  // Hard redirect to login so no stale data remains
  if (typeof window !== 'undefined' && !router) {
    window.location.replace('/login?signedout=1');
  } else if (router) {
    await router.replace('/login?signedout=1');
  }
}
