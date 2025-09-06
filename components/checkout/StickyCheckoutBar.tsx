// components/checkout/StickyCheckoutBar.tsx
import * as React from 'react';
import { Button } from '@/components/design-system/Button';

type Props = {
  label: string;
  price: string;
  onBuy?: () => void;
};

export const StickyCheckoutBar: React.FC<Props> = ({ label, price, onBuy }) => {
  const handleClick = () => {
    if (onBuy) return onBuy();
    const el = document.querySelector('#checkout-form') as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const firstInput = el.querySelector<HTMLElement>('input, button, select, textarea');
    firstInput?.focus();
  };

  // mobile-only
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 sm:hidden">
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="rounded-2xl border border-border bg-card/95 backdrop-blur shadow-glow p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground truncate">{label}</div>
              <div className="font-slab text-lg text-gradient-primary">{price}</div>
            </div>

            <Button size="sm" className="rounded-full px-4" onClick={handleClick}>
              Pay now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyCheckoutBar;
