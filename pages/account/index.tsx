// pages/settings/index.tsx
import * as React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Container } from "@/components/design-system/Container";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function SettingsHubPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    // load email (optional)
    (async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      setEmail(data.session?.user?.email ?? null);
    })();
  }, []);

  // IMPORTANT: never push to the same URL; this avoids the invariant error
  const safePush = (href: string) => {
    if (router.asPath !== href) void router.push(href);
  };

  return (
    <>
      <Head>
        <title>Settings · GramorX</title>
        <meta name="description" content="Manage language, notifications, accessibility and account settings." />
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
                <Link
                  href="/settings/language"
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
                  onClick={(e) => {
                    // guard against navigating to the same URL again
                    if (router.asPath === "/settings/language") {
                      e.preventDefault();
                    }
                  }}
                >
                  Open Language Settings
                </Link>
              </div>
            </div>

            {/* Notifications (placeholder for later) */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-medium text-foreground">Notifications</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Daily task reminders and challenge nudges.
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                Coming soon — wired to `/api/notifications/nudge`.
              </div>
            </div>

            {/* Accessibility */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-medium text-foreground">Accessibility</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keyboard checks, screen reader hints, and live region demo.
              </p>
              <div className="mt-3">
                <Link
                  href="/accessibility"
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
                >
                  Open Accessibility
                </Link>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-medium text-foreground">Security</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Reset your password. {email ? `Email on file: ${email}` : "No email on file."}
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
                  onClick={async () => {
                    if (!email) return;
                    const origin =
                      typeof window !== "undefined"
                        ? window.location.origin
                        : process.env.NEXT_PUBLIC_SITE_URL || "";
                    const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
                      redirectTo: `${origin}/login/reset`,
                    });
                    if (error) alert(error.message);
                    else alert("Password reset email sent");
                  }}
                >
                  Send reset email
                </button>
              </div>
            </div>
          </section>
        </Container>
      </div>
    </>
  );
}
