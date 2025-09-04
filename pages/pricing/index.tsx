/// FILE: pages/pricing.tsx
import Head from "next/head";
import Pricing, { Plan, FAQ } from "@/components/Pricing";

export default function PricingPage() {
  const plans: Plan[] = [
    {
      name: "Starter",
      tagline: "Kick off quickly",
      priceMonthly: 12,
      priceAnnual: 120, // 2 months free
      cta: "Get Started",
      popular: false,
      features: [
        "Up to 3 projects",
        "Basic analytics",
        "Email support",
        "Community access",
      ],
    },
    {
      name: "Pro",
      tagline: "Best for teams",
      priceMonthly: 29,
      priceAnnual: 290,
      cta: "Start Pro",
      popular: true,
      features: [
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "AI-powered suggestions",
        "SSO & access controls",
      ],
    },
    {
      name: "Enterprise",
      tagline: "Scale with confidence",
      priceMonthly: null,
      priceAnnual: null,
      cta: "Talk to Sales",
      popular: false,
      features: [
        "All Pro features",
        "Custom SLAs & onboarding",
        "Dedicated CSM",
        "On‑prem & VPC options",
        "Security reviews & SOC 2",
      ],
    },
  ];

  const faqs: FAQ[] = [
    { q: "Can I change plans later?", a: "Absolutely. Upgrade, downgrade, or cancel anytime from your workspace settings." },
    { q: "Do you offer discounts?", a: "Yes—annual plans include 2 months free. We also offer startup and education discounts; contact sales for details." },
    { q: "What’s your refund policy?", a: "We offer a 14‑day, no‑questions‑asked refund on paid plans for new subscriptions." },
    { q: "How does the free Starter plan work?", a: "Starter includes core features for up to 3 projects. Upgrade to unlock unlimited projects and advanced features." },
  ];

  return (
    <>
      <Head>
        <title>Pricing — YourApp</title>
        <meta name="description" content="Simple, predictable pricing. Start free and scale when you're ready." />
      </Head>
      <Pricing
        title="Simple pricing for every stage"
        subtitle="Start free, grow when you’re ready. Switch plans or cancel anytime—no contracts."
        bannerText="Annual billing saves 2 months"
        annualDefault={true}
        currency="USD"
        plans={plans}
        faqs={faqs}
        footerCtaTitle="Try Pro free for 14 days"
        footerCtaSubtitle="Build faster with AI features, advanced analytics, and priority support. Cancel anytime."
        footerPrimary={{ href: "#", label: "Start my trial" }}
        footerSecondary={{ href: "#", label: "Talk to sales" }}
      />
    </>
  );
}
