// pages/settings/index.tsx
'use client';

import * as React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Container } from "@/components/design-system/Container";
import { Button } from "@/components/design-system/Button";
import { supabaseBrowser as supabase } from "@/lib/supabaseBrowser";

export default function SettingsHubPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setEmail(data.session?.user?.email ?? null);
    })();
    return () => { mounted = false; };
  }, []);

  const safePush = (href: string) => {
    if (router.asPath !== href) void router.push(href);
  };

  const handleReset = async () => {
    if (!email || sending) return;
    setSending(true);
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/login/reset`,
      });
      if (error) {
        alert(error.message);
      } else {
        alert("Password reset email sent.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>Settings · GramorX</title>
        <meta
          name="description"
          content="Manage language, notifications, accessibility and account settings."
        />
      </Head>

      <div className="py-6">
        <Container>
          <header className="mb-4">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Tweak your experience and account preferences.
            </p>
          </header>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Language */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-medium text-foreground">Language</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Switch between English and Urdu. We remember your choice.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="soft"
                  onClick={(e) => {
                    e.preventDefault();
                    if (router.asPath !== "/settings/language") {
                      safePush("/settings/language");
                    }
                  }}
                >
                  Open Language Settings
                </Button>
                <Link href="/settings/language" prefetch={false} className="sr-only">
                  Language (link for SEO)
                </Link>
              </div>
            </div>

            {/* Notifications (placeholder) */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-medium text-foreground">Notifications</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Daily task reminders and challenge nudges.
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                Coming soon — wired to <code className="font-mono">/api/notifications/nudge</code>.
              </div>
            </div>

            {/* Accessibility */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-medium text-foreground">Accessibility</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keyboard checks, screen reader hints, and live region demo.
              </p>
              <div className="mt-3">
                <Button
                  variant="soft"
                  onClick={(e) => {
                    e.preventDefault();
                    safePush("/accessibility");
                  }}
                >
                  Open Accessibility
                </Button>
                <Link href="/accessibility" prefetch={false} className="sr-only">
                  Accessibility (link for SEO)
                </Link>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-medium text-foreground">Security</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Reset your password.{" "}
                {email ? `Email on file: ${email}` : "No email on file."}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="solid"
                  tone="accent"
                  onClick={handleReset}
                  disabled={!email || sending}
                  loading={sending}
                >
                  Send reset email
                </Button>
                {!email && (
                  <span className="text-xs text-muted-foreground">
                    Add an email to your account first.
                  </span>
                )}
              </div>
            </div>
          </section>
        </Container>
      </div>
    </>
  );
}
