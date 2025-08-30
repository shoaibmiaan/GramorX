import React from 'react';

export type PaymentMethod = 'jazzcash' | 'easypaisa' | 'card' | 'stripe' | 'paypal';

interface Props {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export const PaymentOptions: React.FC<Props> = ({ selected, onChange }) => {
  const opts: { label: string; value: PaymentMethod }[] = [
    { label: 'JazzCash', value: 'jazzcash' },
    { label: 'Easypaisa', value: 'easypaisa' },
    { label: 'Card / International', value: 'card' },
    { label: 'Stripe', value: 'stripe' },
    { label: 'PayPal', value: 'paypal' },
  ];
  return (
    <div className="space-y-2">
      {opts.map((opt) => (
        <label key={opt.value} className="block">
          <input
            type="radio"
            name="payment"
            value={opt.value}
            checked={selected === opt.value}
            onChange={() => onChange(opt.value)}
            className="mr-2"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
};
