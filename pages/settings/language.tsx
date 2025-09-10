// pages/settings/language.tsx
import * as React from "react";
import Head from "next/head";
import { Container } from "@/components/design-system/Container";
import { LocaleSwitcher } from "@/components/common/LocaleSwitcher";
import { detectLocale as detectLocale, setLocale as setLocale } from "@/lib/locale";
import { loadTranslations, t, getLocale } from "@/lib/i18n";
import type { SupportedLocale } from "@/lib/i18n/config";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function LanguageSettingsPage() {
  const [locale, setLocale] = React.useState<SupportedLocale>("en");
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState<null | "ok" | "err">(null);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      // Guard: some builds export detectLocale as object/default.
      const safeDetect =
        typeof detectLocale === "function"
          ? (detectLocale as () => SupportedLocale)
          : null;

      const initial = safeDetect ? safeDetect() : getLocale();
      await loadTranslations(initial);
      setLocale(getLocale());

      const { data } = await supabaseBrowser.auth.getSession();
      setUserId(data.session?.user?.id ?? null);
    })();
  }, []);

  const handleChange = async (next: SupportedLocale) => {
    setBusy(true);
    setSaved(null);
    try {
      await loadTranslations(next);
      setLocale(next);
      setLocale(next);

      // Persist to profile if logged in
      if (userId) {
        await supabaseBrowser.from("profiles").update({ locale: next }).eq("id", userId);
      }
      setSaved("ok");
    } catch {
      setSaved("err");
    } finally {
      setBusy(false);
      setTimeout(() => setSaved(null), 2000);
    }
  };

  return (
    <>
      <Head>
        <title>Language · Settings · GramorX</title>
        <meta name="description" content="Switch between English and Urdu for the interface." />
      </Head>

      <div className="py-6">
        <Container>
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("Language Settings")}</h1>
              <p className="text-sm text-mutedText">
                {t("Choose your preferred interface language.")}
              </p>
            </div>
          </header>

          <section className="rounded-ds-2xl border border-border bg-card p-4 text-card-foreground">
            <div className="flex items-center justify-between">
              <LocaleSwitcher
                label={t("Language")}
                // If your switcher supports a controlled value, pass it:
                // value={locale}
                onChanged={handleChange}
              />
              <span className="text-xs text-mutedText" role="status" aria-live="polite">
                {busy ? t("Saving…") : saved === "ok" ? t("Saved ✓") : saved === "err" ? t("Error") : null}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-3">
                <h3 className="mb-1 text-sm font-medium text-foreground">{t("Preview (English)")}</h3>
                <p className="text-sm text-mutedText">
                  Welcome to GramorX. Let’s raise your IELTS band with daily practice and AI feedback.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <h3 className="mb-1 text-sm font-medium text-foreground">{t("Preview (Urdu)")}</h3>
                <p className="text-sm text-mutedText">
                  GramorX میں خوش آمدید۔ روزانہ مشق اور AI فیڈبیک کے ساتھ اپنا IELTS بینڈ بہتر بنائیں۔
                </p>
              </div>
            </div>

            <div className="mt-4 text-xs text-mutedText">
              {t("Current locale")}: <span className="font-mono">{locale}</span>
            </div>
          </section>
        </Container>
      </div>
    </>
  );
}
