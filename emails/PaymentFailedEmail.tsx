// emails/PaymentFailedEmail.tsx
import * as React from 'react';

export type PaymentFailedEmailProps = Readonly<{
  userName?: string;
  plan: 'starter' | 'booster' | 'master';
  reason?: string;
  retryUrl?: string;
  supportUrl?: string;
  attemptAtISO?: string;
}>;

export default function PaymentFailedEmail({
  userName = 'there',
  plan,
  reason,
  retryUrl,
  supportUrl,
  attemptAtISO,
}: PaymentFailedEmailProps) {
  return (
    <html>
      <body>
        <h1>We couldn’t complete your payment</h1>
        <p>Hi {userName},</p>
        <p>
          Your attempt to purchase <strong>{plan.toUpperCase()}</strong>{' '}
          {attemptAtISO ? `on ${new Date(attemptAtISO).toLocaleString()}` : ''} didn’t go through.
        </p>
        {reason ? <p><strong>Reason:</strong> {reason}</p> : null}
        {retryUrl ? (
          <p>
            You can retry here: <a href={retryUrl}>Retry checkout</a>
          </p>
        ) : null}
        <p>
          Need help? {supportUrl ? <a href={supportUrl}>Contact support</a> : 'Reply to this email'} and we’ll fix it.
        </p>
      </body>
    </html>
  );
}
