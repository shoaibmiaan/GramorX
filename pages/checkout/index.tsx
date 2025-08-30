import { useRouter } from 'next/router';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const plans = [
  {
    key: 'rocket',
    name: 'Rocket',
    price: '$14.99 / month',
    id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ROCKET || '',
  },
  {
    key: 'seedling',
    name: 'Seedling',
    price: '$9.99 / month',
    id: process.env.NEXT_PUBLIC_STRIPE_PRICE_SEEDLING || '',
  },
];

export default function Checkout() {
  const router = useRouter();
  const initial = typeof router.query.plan === 'string' ? router.query.plan : 'rocket';
  const [plan, setPlan] = useState(initial);
  const [loading, setLoading] = useState(false);

  const onCheckout = async () => {
    const priceId = plans.find((p) => p.key === plan)?.id;
    if (!priceId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      const stripe = await stripePromise;
      if (stripe && data.id) {
        await stripe.redirectToCheckout({ sessionId: data.id });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Checkout</h1>
      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        className="w-full border p-2 mb-4"
      >
        {plans.map((p) => (
          <option key={p.key} value={p.key}>
            {p.name} - {p.price}
          </option>
        ))}
      </select>
      <button
        onClick={onCheckout}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded w-full"
      >
        {loading ? 'Processing…' : 'Proceed to Payment'}
      </button>
    </div>
  );
}
