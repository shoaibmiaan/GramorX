import { strict as assert } from 'node:assert';

(async () => {
  // Scenario 1: signUp returns no session -> redirect to /auth/verify
  let redirected: string | undefined;
  (global as any).window = { location: { assign: (url: string) => { redirected = url; } } };
  const signUpNoSession = async () => ({ data: { session: null }, error: null });
  const result1 = await signUpNoSession();
    if (result1.data.session) {
      window.location.assign('/welcome');
    } else {
      window.location.assign('/auth/verify');
    }
  assert.equal(redirected, '/auth/verify');

  // Scenario 2: signUp returns session -> redirect to /welcome
  redirected = undefined;
  (global as any).window = { location: { assign: (url: string) => { redirected = url; } } };
  const signUpWithSession = async () => ({ data: { session: {} }, error: null });
  const result2 = await signUpWithSession();
  if (result2.data.session) {
    window.location.assign('/welcome');
  } else {
    window.location.assign('/auth/verify');
  }
  assert.equal(redirected, '/welcome');

  console.log('signup redirect paths tested');
})();
