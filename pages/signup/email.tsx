'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SignupEmailRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/signup/password');
  }, [router]);
  return null;
}
