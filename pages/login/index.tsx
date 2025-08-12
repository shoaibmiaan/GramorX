import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { ThemeToggle } from '@/components/design-system/ThemeToggle';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    // TODO: Integrate your auth logic here
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      {/* Left side - form */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1
            onClick={() => router.push('/')}
            className="font-slab text-h2 md:text-display text-gradient-primary cursor-pointer"
          >
            GramorX
          </h1>
          <span className="text-small text-grayish dark:text-gray-400">
            You are signing into GramorX
          </span>
        </div>

        <Container className="max-w-md w-full">
          {error && <Alert variant="error" title="Error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="primary" className="w-full rounded-ds-xl">
              Continue
            </Button>
          </form>

          <div className="mt-6 text-center text-small text-grayish dark:text-gray-400">
            Don’t have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="text-primary hover:underline"
            >
              Sign up
            </button>
          </div>
        </Container>
      </div>

      {/* Right side - brand image */}
      <div className="hidden md:flex w-1/2 relative bg-primary dark:bg-dark items-center justify-center">
        <Image
          src="/brand/logo.png"
          alt="GramorX Logo"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
