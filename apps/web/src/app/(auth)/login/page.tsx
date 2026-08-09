'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';

/** Google's four-colour mark. Inline so it themes correctly and costs no request. */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.29 9.14 4.75 12 4.75Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueAsGuest() {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/guest');
      router.push('/tasks');
      router.refresh();
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'Could not start a session. Check your connection and try again.',
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4 py-10">
      {/* Wordmark */}
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
            <path d="M12 3 22 20H2L12 3Z" />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight">Pyramid</span>
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6 space-y-1.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
              Let&apos;s get back on track
            </h1>
            {/*
              DEVIATION: the Figma subtitle reads "Enter your email below to
              login to your account", but the card has no email field — leftover
              copy from the shadcn login-01 block. Corrected to describe what
              the screen actually does. Documented in the README.
            */}
            <p className="text-sm text-muted-foreground">
              Continue as a guest to start managing your tasks.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={continueAsGuest}
              disabled={loading}
            >
              {loading ? 'Starting session…' : 'Continue as Guest'}
            </Button>

            {/*
              DEVIATION: Google sign-in is present in the design but the brief
              specifies guest login only. Rendered for fidelity, disabled rather
              than half-implemented.
            */}
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              disabled
              title="Google sign-in is out of scope for this assessment — guest login only."
            >
              <GoogleIcon />
              Login with Google
            </Button>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-center text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <p className="mt-4 px-6 text-center text-xs leading-relaxed text-muted-foreground">
          By clicking continue, you agree to our{' '}
          <a href="#" className="underline underline-offset-4 hover:text-foreground">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline underline-offset-4 hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
