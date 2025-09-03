// emails/ReceiptEmail.tsx
import * as React from 'react';

export type ReceiptEmailProps = Readonly<{
  userName?: string;
  plan: 'starter' | 'booster' | 'master';
  amount: number;           // minor units
  currency: string;         // e.g. 'PKR' | 'USD'
  invoiceUrl?: string;
  createdAtISO?: string;
}>;

export default function ReceiptEmail({
  userName = 'there',
  plan,
  amount,
  currency,
  invoiceUrl,
  createdAtISO,
}: ReceiptEmailProps) {
  const created = createdAtISO ? new Date(createdAtISO) : new Date();
  const humanAmount = (amount / 100).toLocaleString(undefined, { style: 'currency', currency });
  return (
    <html>
      <body>
        <h1>Thanks for your purchase 🎉</h1>
        <p>Hi {userName},</p>
        <p>
          Your subscription to <strong>{plan.toUpperCase()}</strong> is now active.
        </p>
        <ul>
          <li><strong>Amount:</strong> {humanAmount}</li>
          <li><strong>Date:</strong> {created.toLocaleString()}</li>
          <li><strong>Status:</strong> Paid</li>
        </ul>
        {invoiceUrl ? (
          <p>
            View your invoice: <a href={invoiceUrl}>Open invoice</a>
          </p>
        ) : null}
        <p>Welcome aboard — you now have access to all IELTS modules, AI feedback, and analytics.</p>
      </body>
    </html>
  );
}
