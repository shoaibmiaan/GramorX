// emails/ReferralInviteEmail.tsx
import * as React from 'react';

export type ReferralInviteEmailProps = Readonly<{
  inviterName: string;
  referralLink: string;
  code?: string;
  rewardDays?: number; // default 14
}>;

export default function ReferralInviteEmail({
  inviterName,
  referralLink,
  code,
  rewardDays = 14,
}: ReferralInviteEmailProps) {
  return (
    <html>
      <body>
        <h1>{inviterName} invited you to try GramorX</h1>
        <p>
          Use their link and you’ll both get <strong>{rewardDays}-day Booster</strong> access.
        </p>
        {code ? <p><strong>Your code:</strong> <code>{code}</code></p> : null}
        <p>
          Start here: <a href={referralLink}>{referralLink}</a>
        </p>
        <p>Unlock IELTS modules, AI feedback, and more.</p>
      </body>
    </html>
  );
}
