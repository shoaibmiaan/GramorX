import React, { useState } from 'react';
import { PaymentOptions, PaymentMethod } from '@/components/checkout/PaymentOptions';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function CheckoutPage() {
  const [method, setMethod] = useState<PaymentMethod>('jazzcash');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyCode = async () => {
    if (!code) return;
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code }),
      });
      if (res.ok) setDiscount(10);
      else setDiscount(0);
    } catch {
      setDiscount(0);
    }
  };

  const total = Math.max(0, 100 - discount);

  const initiate = async () => {
    const res = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'demo-order', amount: total, method }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Checkout</h1>
      <PaymentOptions selected={method} onChange={setMethod} />
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Referral / discount code"
          className="border px-2 py-1 rounded"
        />
        <button onClick={applyCode} className="px-3 py-1 bg-gray-200 rounded">
          Apply
        </button>
      </div>
      <p className="mt-4">Total: ${total}</p>
      <button
        onClick={initiate}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Pay Now
      </button>
    </div>
  );
}
