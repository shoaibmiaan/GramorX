import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Alert } from '@/components/design-system/Alert';
import { Button } from '@/components/design-system/Button';

export const Waitlist: React.FC = () => {
  return (
    <section
      id="waitlist"
      className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90"
    >
      <Container>
        <div className="text-center mb-12">
          <h2 className="font-slab text-4xl mb-3 text-gradient-primary">
            JOIN OUR EXCLUSIVE PRE-LAUNCH
          </h2>
          <p className="text-grayish text-lg">
            Be among the first to access our platform with special early-bird
            benefits
          </p>
        </div>

        <Card className="max-w-3xl mx-auto p-8 rounded-2xl">
          <Alert
            variant="info"
            title="Early-bird bonus"
            className="mb-6"
          >
            First 500 signups get <strong>30% off</strong> for the first 3
            months.
          </Alert>

          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <Input label="Full Name" placeholder="Enter your full name" />
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <Input label="Target IELTS Band" placeholder="e.g. 7.5" />
            <Input label="Planned Test Date" placeholder="Month/Year" />
          </div>

          <Input
            label="Current IELTS Experience"
            placeholder="First-time taker, Retaker, etc."
            className="mb-5"
          />

          <Button as="a" href="#" variant="accent" className="w-full text-lg py-4 justify-center">
            <i className="fas fa-lock mr-2" />
            Secure Your Early Access
          </Button>
        </Card>
      </Container>
    </section>
  );
};
