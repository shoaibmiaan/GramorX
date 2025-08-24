// pages/pricing.tsx
import * as React from 'react';
import PricingSection from '@/components/sections/Pricing';

export default function PricingPage() {
  return <PricingSection defaultCycle="monthly" showFree highlight="rocket" />;
}
