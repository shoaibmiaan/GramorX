import React, { useState } from 'react';
import { PaymentOptions, PaymentMethod } from '@/components/checkout/PaymentOptions';

export default function CheckoutPage() {
  const [method, setMethod] = useState<PaymentMethod>('jazzcash');

  const initiate = async () => {
    const res = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'demo-order', amount: 100, method }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Checkout</h1>
      <PaymentOptions selected={method} onChange={setMethod} />
      <button
        onClick={initiate}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Pay Now
      </button>
    </div>
  );
}
