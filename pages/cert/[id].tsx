// pages/cert/[id].tsx
import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { Container } from "@/components/design-system/Container";
import { CertificateCanvas } from "@/components/certificates/CertificateCanvas";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type CertRow = {
  id: string;
  user_id: string;
  enrollment_id?: string | null;
  image_url?: string | null;
  meta_json?: { band?: number; cohort?: string; issuedBy?: string; issuedAt?: string } | null;
  created_at: string;
};

type ProfileRow = { full_name?: string | null };

export default function CertificatePage() {
  const router = useRouter();
  const certId = (router.query.id as string) || "";

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [cert, setCert] = React.useState<CertRow | null>(null);
  const [fullName, setFullName] = React.useState<string>("Student");
  const band = cert?.meta_json?.band ?? 0;
  const cohort = cert?.meta_json?.cohort ?? undefined;
  const issuedAt = cert?.meta_json?.issuedAt ?? cert?.created_at;

  React.useEffect(() => {
    if (!certId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Must be owner due to RLS; otherwise this will 401/return null.
        const { data: row, error: e1 } = await supabaseBrowser
          .from("certificates")
          .select("*")
          .eq("id", certId)
          .single();

        if (e1 || !row) throw new Error(e1?.message || "Certificate not found");
        setCert(row as CertRow);

        // Try profile name
        const { data: prof } = await supabaseBrowser
          .from("profiles")
          .select("full_name")
          .eq("id", (row as CertRow).user_id)
          .single();

        if (prof?.full_name) setFullName((prof as ProfileRow).full_name ?? "Student");
        else {
          // fallback to session name if any
          const { data } = await supabaseBrowser.auth.getSession();
          const name =
            (data.session?.user?.user_metadata as any)?.full_name ||
            (data.session?.user?.user_metadata as any)?.name ||
            "Student";
          setFullName(name);
        }
      } catch (e: any) {
        setError(e.message ?? "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, [certId]);

  const copyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    } catch {
      // noop
    }
  };

  return (
    <>
      <Head>
        <title>Certificate · GramorX</title>
        <meta
          name="description"
          content="Share your GramorX challenge certificate and celebrate your progress."
        />
        {/* OG tags (image should be your stored PNG if public) */}
        <meta property="og:title" content="GramorX Certificate" />
        <meta
          property="og:description"
          content={`Certified: ${fullName} — Predicted Band ${band.toFixed(1)}`}
        />
      </Head>

      <div className="py-6">
        <Container>
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Certificate</h1>
              <p className="text-sm text-muted-foreground">
                Share your achievement and keep pushing towards Band&nbsp;9.
              </p>
            </div>
            <nav className="flex items-center gap-3">
              <Link
                href="/challenge"
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
              >
                Challenges
              </Link>
              <Link
                href="/progress"
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
              >
                Progress
              </Link>
            </nav>
          </header>

          {loading ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Loading certificate…
            </div>
          ) : error ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-red-400">
              {error} — You may need to{" "}
              <Link
                className="text-primary underline-offset-2 hover:underline"
                href={`/login?next=${encodeURIComponent(router.asPath)}`}
              >
                log in
              </Link>{" "}
              to view this certificate.
            </div>
          ) : !cert ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Certificate not found.
            </div>
          ) : (
            <div className="space-y-4">
              <CertificateCanvas
                fullName={fullName}
                band={band}
                cohort={cohort}
                issuedAt={issuedAt}
                certificateId={cert.id}
                onReady={() => {}}
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
                >
                  Copy share link
                </button>
                {/* Optional: request a signed CDN URL if image exists */}
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch("/api/certificates/sign", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ certId }),
                    });
                    if (res.ok) {
                      const j = await res.json();
                      if (j?.signedUrl) window.open(j.signedUrl, "_blank");
                    }
                  }}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-border/30"
                >
                  Open image
                </button>
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
