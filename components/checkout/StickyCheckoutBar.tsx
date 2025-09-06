// components/checkout/StickyCheckoutBar.tsx
import React from 'react';

type Props = {
  label: string;
  price: string;
  onBuy?: () => void;
};

export const StickyCheckoutBar: React.FC<Props> = ({ label, price, onBuy }) => {
  const handleClick = () => {
    if (onBuy) {
      onBuy();
      return;
    }
    // default behaviour: scroll to checkout form
    const el = document.querySelector('#checkout-form') as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // try to focus the first input inside the form
      const firstInput = el.querySelector('input, button, select, textarea') as HTMLElement | null;
      if (firstInput) firstInput.focus();
    }
  };

  return (
    // mobile-only sticky bar: hidden on sm+
    <div className="fixed inset-x-0 bottom-0 z-50 sm:hidden">
      <div className="mx-auto max-w-6xl px-4">
        <div className="bg-card/95 border-t border-border p-3 rounded-t-md backdrop-blur flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground truncate">{label}</div>
            <div className="font-slab text-lg text-gradient-primary">{price}</div>
          </div>

          <button
            onClick={handleClick}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white font-medium shadow-sm"
            aria-label="Continue to payment"
          >
            Pay now
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyCheckoutBar;
