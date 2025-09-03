// emails/BuddyInviteEmail.tsx
import * as React from 'react';

export type BuddyInviteEmailProps = Readonly<{
  inviterName: string;
  acceptUrl: string;
  seatNote?: string; // e.g., "1 buddy seat available"
}>;

export default function BuddyInviteEmail({ inviterName, acceptUrl, seatNote }: BuddyInviteEmailProps) {
  return (
    <html>
      <body>
        <h1>{inviterName} invited you to join their IELTS team</h1>
        {seatNote ? <p><em>{seatNote}</em></p> : null}
        <p>
          Join their workspace to access shared prep, progress, and planning.
        </p>
        <p>
          <a href={acceptUrl}>Accept invite</a>
        </p>
        <p>This link grants you access to their team on GramorX.</p>
      </body>
    </html>
  );
}
