// emails/ReferralRewardEmail.tsx
import * as React from 'react';

export type ReferralRewardEmailProps = Readonly<{
  userName?: string;
  rewardDays: number; // e.g., 14
  friendName?: string;
  manageUrl?: string;
}>;

export default function ReferralRewardEmail({
  userName = 'there',
  rewardDays,
  friendName,
  manageUrl,
}: ReferralRewardEmailProps) {
  return (
    <html>
      <body>
        <h1>Your referral reward is live 🎁</h1>
        <p>Hi {userName},</p>
        <p>
          {friendName ? <strong>{friendName}</strong> : 'Your friend'} just joined —
          you’ve received <strong>{rewardDays} days</strong> of Booster.
        </p>
        {manageUrl ? (
          <p>
            Track your rewards: <a href={manageUrl}>Open referrals</a>
          </p>
        ) : null}
        <p>Thanks for spreading the word!</p>
      </body>
    </html>
  );
}
