/// FILE: components/Pricing.tsx
import React, { useMemo, useState } from "react";
import { Check, ArrowRight, Sparkles, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Pricing (prop‑driven)
 * -------------------------------------------------
 * A reusable pricing UI with no hardcoded plan/FAQ data.
 *
 * Pass plans & faqs via props.
 */

/* ------------------------------- Types ------------------------------- */
export type Plan = {
  name: string;
  tagline?: string;
  priceMonthly: number | null; // null => custom pricing
  priceAnnual: number | null;  // null => custom pricing
  cta: string;
  popular?: boolean;
  features: string[];
  icon?: React.ReactNode; // optional custom icon override
};

export type FAQ = { q: string; a: string };

export type PricingProps = {
  title?: string;
  subtitle?: string;
  bannerText?: string; // small pill above title
  annualDefault?: boolean;
  currency?: string; // display only
  plans: Plan[];
  faqs?: FAQ[];
  footerCtaTitle?: string;
  footerCtaSubtitle?: string;
  footerPrimary?: { href: string; label: string };
  footerSecondary?: { href: string; label: string };
};

export default function Pricing({
  title = "Simple pricing for every stage",
  subtitle = "Start free, grow when you’re ready. Switch plans or cancel anytime—no contracts.",
  bannerText = "Annual billing saves 2 months",
  annualDefault = true,
  currency = "USD",
  plans,
  faqs = [],
  footerCtaTitle = "Try Pro free for 14 days",
  footerCtaSubtitle = "Build faster with AI features, advanced analytics, and priority support. Cancel anytime.",
  footerPrimary = { href: "#", label: "Start my trial" },
  footerSecondary = { href: "#", label: "Talk to sales" },
}: PricingProps) {
  const [annual, setAnnual] = useState(annualDefault);
  const unit = annual ? "/year" : "/month";

  return (
    <div className="section-dark">
      {/* Hero */}
      <header className="container pt-20 md:pt-28 pb-10 text-center">
        {bannerText && (
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-primary/10 text-primary font-medium">
            <Sparkles className="h-4 w-4" /> {bannerText}
          </div>
        )}
        <h1 className="mt-6 text-displayLg leading-tight tracking-tight text-gradient-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl mx-auto text-lg text-lightText/80 dark:text-foreground/80">
            {subtitle}
          </p>
        )}

        {/* Billing Toggle */}
        <div className="mt-8 inline-flex items-center justify-center p-1 rounded-full border border-lightBorder dark:border-purpleVibe/20 bg-card">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`nav-pill px-5 py-2 rounded-full text-sm ${!annual ? "is-active" : ""}`}
            aria-pressed={!annual}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`nav-pill px-5 py-2 rounded-full text-sm ${annual ? "is-active" : ""}`}
            aria-pressed={annual}
          >
            Annual <span className="ml-2 label-neon">(save 2 months)</span>
          </button>
        </div>
      </header>

      {/* Plans */}
      <section className="container pb-20 grid md:grid-cols-3 gap-6 md:gap-8">
        {plans.map((p) => (
          <PlanCard key={p.name} plan={p} annual={annual} unit={unit} currency={currency} />
        ))}
      </section>

      {/* FAQ (optional) */}
      {faqs.length > 0 && (
        <section id="faq" className="container pb-28">
          <h2 className="text-h2 text-gradient-accent text-center">Frequently asked questions</h2>
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {faqs.map((item) => (
              <FaqCard key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="container pb-24">
        <div className="card-glass p-8 md:p-10 text-center">
          <h3 className="text-h2">{footerCtaTitle}</h3>
          {footerCtaSubtitle && (
            <p className="mt-3 text-lightText/80 dark:text-foreground/80 max-w-2xl mx-auto">{footerCtaSubtitle}</p>
          )}
          <div className="mt-6 flex items-center justify-center gap-3">
            {footerPrimary && (
              <a href={footerPrimary.href} className="btn btn-primary btn--fx">{footerPrimary.label}</a>
            )}
            {footerSecondary && (
              <a href={footerSecondary.href} className="btn btn-secondary btn--fx">{footerSecondary.label}</a>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-caption text-lightText/60 dark:text-foreground/60">
          Prices in {currency}. Taxes may apply.
        </p>
      </section>
    </div>
  );
}

/* ----------------------------- Components ---------------------------- */

function PlanCard({ plan, annual, unit, currency }: { plan: Plan; annual: boolean; unit: string; currency: string }) {
  const price = useMemo(() => (annual ? plan.priceAnnual : plan.priceMonthly), [annual, plan.priceAnnual, plan.priceMonthly]);
  const isCustom = price === null || price === undefined;

  return (
    <motion.article
      layout
      className={`relative p-6 md:p-8 ${plan.popular ? "card-glass" : "card-surface"}`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-6 right-6 mx-auto w-max rounded-full bg-gradient-to-r from-purpleVibe to-electricBlue px-3 py-1 text-foreground text-tiny font-semibold shadow-glow">
          Most popular
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-h3">{plan.name}</h3>
          {plan.tagline && (
            <p className="mt-1 text-sm text-lightText/70 dark:text-foreground/70">{plan.tagline}</p>
          )}
        </div>
        <div className="h-10 w-10 rounded-full grid place-items-center bg-primary/10 text-primary dark:bg-foreground/10">
          {plan.icon ?? (plan.name.toLowerCase().includes("enter") ? <Building2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />)}
        </div>
      </div>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-2">
        {isCustom ? (
          <span className="text-display font-semibold tracking-tight">Custom</span>
        ) : (
          <>
            <span className="text-display font-semibold tracking-tight">${price}</span>
            <span className="text-sm text-lightText/70 dark:text-foreground/70">{unit}</span>
          </>
        )}
      </div>
      <AnimatePresence initial={false} mode="wait">
        <motion.p
          key={annual ? "annual" : "monthly"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mt-2 text-sm text-neonGreen"
        >
          {annual ? "2 months free on annual" : "Billed monthly"}
        </motion.p>
      </AnimatePresence>

      {/* CTA */}
      <div className="mt-6">
        <a href="#" className={`btn ${plan.popular ? "btn-primary" : "btn-accent"} btn--fx w-full`}>
          {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </div>

      {/* Features */}
      <ul className="mt-6 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <span className="mt-1 h-5 w-5 rounded-full bg-primary/15 text-primary grid place-items-center dark:bg-foreground/10">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm leading-6">{f}</span>
          </li>
        ))}
      </ul>

      {/* Fine print */}
      <p className="mt-6 text-caption text-lightText/60 dark:text-foreground/60">
        {isCustom ? "Contact us for pricing." : `Prices displayed in ${currency}.`}
      </p>
    </motion.article>
  );
}

function FaqCard({ q, a }: FAQ) {
  return (
    <details className="group card-surface p-5 md:p-6">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between">
          <h4 className="text-h4">{q}</h4>
          <motion.div
            initial={false}
            animate={{ rotate: 0 }}
            className="ml-4 h-6 w-6 rounded-full grid place-items-center bg-primary/10 text-primary group-open:bg-accent group-open:text-foreground"
          >
            <ArrowRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
          </motion.div>
        </div>
      </summary>
      <p className="mt-3 text-sm text-lightText/80 dark:text-foreground/80">
        {a}
      </p>
    </details>
  );
}
