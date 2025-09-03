// components/sections/Pricing.tsx
import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Section } from '@/components/design-system/Section';
import { Card } from '@/components/design-system/Card';
import { Ribbon } from '@/components/design-system/Ribbon';
import { Button } from '@/components/design-system/Button';

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

export const Pricing: React.FC = () => {
  return (
    <Section id="pricing">
      <Container>
        <div className="text-center mb-16">
          <h2 className="font-slab text-4xl mb-3 text-gradient-primary">FLEXIBLE PRICING PLANS</h2>
          <p className="text-grayish text-lg">Choose the plan that fits your preparation needs</p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {tiers.map((t) => (
            <Card key={t.name} className={`p-8 rounded-2xl text-center relative ${t.featured ? 'scale-105 shadow-glow' : ''}`}>
              {t.featured && <Ribbon label="MOST POPULAR" variant="accent" position="top-right" />}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">{t.name}</h3>
                <div className="font-slab text-5xl text-gradient-primary mb-1">{t.price}</div>
                <div className="text-grayish">{t.period}</div>
              </div>

              <ul className="mb-6">
                {t.features.map((f) => (
                  <li key={f} className="py-2 border-b border-dashed border-purpleVibe/20 text-mutedText dark:text-mutedText">
                    {f}
                  </li>
                ))}
              </ul>

              {/* Publicly accessible (no auth) */}
              <div className="grid gap-3">
                <Button href={`/checkout?plan=${planSlug(t.name)}`} variant={t.featured ? 'primary' : 'secondary'} className="w-full justify-center">
                  Choose {t.name}
                </Button>
                <Link href="/waitlist" className="text-electricBlue hover:underline text-sm">
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
