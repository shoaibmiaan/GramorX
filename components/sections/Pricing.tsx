// components/sections/Pricing.tsx
import { Icon } from "@/components/design-system/Icon";
import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Section } from '@/components/design-system/Section';
import { Card } from '@/components/design-system/Card';
import { Ribbon } from '@/components/design-system/Ribbon';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';

type Tier = {
  name: 'Compass' | 'Seedling' | 'Rocket';
  price: string;
  period: string;
  featured: boolean;
  features: string[];
};

const tiers: readonly Tier[] = [
  {
    name: 'Compass',
    price: 'Free',
    period: 'no credit card required',
    featured: false,
    features: [
      'IELTS basics — all 4 modules',
      'Daily vocab + streak',
      '1 grammar drill / week',
      '2 AI writing evals / month',
      'Community access (read-only)',
    ],
  },
  {
    name: 'Rocket',
    price: '$14.99',
    period: 'per month',
    featured: true,
    features: [
      'Unlimited mock tests',
      'Unlimited AI writing evals',
      'Unlimited speaking practice',
      'Advanced analytics dashboard',
      'Adaptive learning paths',
      'Priority support',
      'Teacher review (2/month)',
    ],
  },
  {
    name: 'Seedling',
    price: '$9.99',
    period: 'per month',
    featured: false,
    features: [
      'All learning materials (4 modules)',
      '2 full mock tests / month',
      '5 AI writing evals / month',
      '3 speaking practice sessions',
      'Basic analytics',
      'Email support',
    ],
  },
];

const planSlug = (name: Tier['name']) => name.toLowerCase();

const tierIcon = (name: Tier['name']) => {
  switch (name) {
    case 'Compass':
      return 'fa-compass';
    case 'Seedling':
      return 'fa-seedling';
    case 'Rocket':
      return 'fa-rocket';
  }
};

export const Pricing: React.FC = () => {
  return (
    <Section id="pricing">
      <Container>
        <div className="text-center mb-16">
          <h2 className="font-slab text-4xl mb-3 text-gradient-primary">FLEXIBLE PRICING PLANS</h2>
          <p className="text-muted-foreground text-lg">Choose the plan that fits your preparation needs</p>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((t) => (
            <Card
              key={t.name}
              className={`p-7 rounded-2xl relative hover:-translate-y-2 transition hover:shadow-glow ${t.featured ? 'ring-1 ring-accent/40' : ''}`}
            >
              <Badge
                variant={t.featured ? 'accent' : 'info'}
                size="sm"
                className="absolute top-4 right-4"
              >
                {t.featured ? 'FEATURED' : 'STANDARD'}
              </Badge>

              {t.featured && <Ribbon label="MOST POPULAR" variant="accent" position="top-right" />}

              <div className="w-17.5 h-17.5 rounded-full flex items-center justify-center mb-6 text-white text-2xl bg-gradient-to-br from-purpleVibe to-electricBlue">
                <i className={`fas ${tierIcon(t.name)}`} aria-hidden="true" />
              </div>

              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Icon name="circle-check" />
                {t.name}
              </h3>
              <div className="mb-4">
                <div className="font-slab text-5xl text-gradient-primary leading-none">{t.price}</div>
                <div className="text-muted-foreground mt-1">{t.period}</div>
              </div>

              <ul className="mt-2">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="py-2 pl-6 border-b border-dashed border-purpleVibe/20 relative text-mutedText dark:text-mutedText"
                  >
                    <span className="absolute left-0 top-2 text-neonGreen font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid gap-3">
                <Button
                  href={`/checkout?plan=${planSlug(t.name)}`}
                  variant={t.featured ? 'primary' : 'secondary'}
                  className="w-full justify-center"
                >
                  Choose {t.name}
                </Button>
                <Link href="/waitlist" className="text-electricBlue hover:underline text-sm text-center">
                  Not ready? Join the pre-launch list
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Pricing;
