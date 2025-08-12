import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Ribbon } from '@/components/design-system/Ribbon';
import { Button } from '@/components/design-system/Button';

const tiers = [
  {
    name: 'Basic',
    price: '$19.99',
    period: 'per month',
    featured: false,
    features: [
      'Access to all learning materials',
      '2 full mock tests per month',
      '5 AI writing evaluations',
      '3 speaking practice sessions',
      'Basic performance analytics',
      'Email support',
    ],
  },
  {
    name: 'Premium',
    price: '$34.99',
    period: 'per month',
    featured: true,
    features: [
      'Unlimited mock tests',
      'Unlimited AI writing evaluations',
      'Unlimited speaking practice',
      'Advanced analytics dashboard',
      'Adaptive learning paths',
      'Priority support',
      'Teacher review option (2/month)',
    ],
  },
  {
    name: 'Institutional',
    price: 'Custom',
    period: 'for schools & organizations',
    featured: false,
    features: [
      'Bulk student accounts',
      'Teacher/admin dashboard',
      'Custom content upload',
      'Usage analytics & reports',
      'Dedicated account manager',
      'API access',
      'Custom branding',
    ],
  },
];

export const Pricing: React.FC = () => {
  return (
    <section
      id="pricing"
      className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90"
    >
      <Container>
        <div className="text-center mb-16">
          <h2 className="font-slab text-4xl mb-3 text-gradient-primary">FLEXIBLE PRICING PLANS</h2>
          <p className="text-grayish text-lg">Choose the plan that fits your preparation needs</p>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {tiers.map((t) => (
            <Card
              key={t.name}
              className={`p-8 rounded-2xl text-center relative ${t.featured ? 'scale-105 shadow-glow' : ''}`}
            >
              {t.featured && <Ribbon label="MOST POPULAR" variant="accent" position="top-right" />}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">{t.name}</h3>
                <div className="font-slab text-5xl text-gradient-primary mb-1">{t.price}</div>
                <div className="text-grayish">{t.period}</div>
              </div>

              <ul className="mb-6">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="py-2 border-b border-dashed border-purpleVibe/20 text-[#d0d0e0] dark:text-[#d0d0e0]"
                  >
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                as="a"
                href="#waitlist"
                variant={t.featured ? 'primary' : 'secondary'}
                className="w-full justify-center"
              >
                {t.name === 'Institutional' ? 'Contact Sales' : 'Join Waitlist'}
              </Button>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};
