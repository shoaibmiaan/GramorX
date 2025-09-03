// emails/ChallengeWelcomeEmail.tsx
import * as React from "react";

export type ChallengeWelcomeEmailProps = {
  fullName: string;
  cohortName: string;
  startDate: string; // ISO date
  ctaUrl: string;
};

export const subject = (p: ChallengeWelcomeEmailProps) =>
  `Welcome to ${p.cohortName}! Your challenge starts ${new Date(p.startDate).toLocaleDateString()}`;

export default function Email({ fullName, cohortName, startDate, ctaUrl }: ChallengeWelcomeEmailProps) {
  const niceDate = new Date(startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <html>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' }}>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td align="center">
                <table role="presentation" width="600" style={{ margin: '24px auto', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '16px 20px' }}>
                        <h1 style={{ margin: 0, fontSize: 22 }}>Welcome, {fullName}!</h1>
                        <p style={{ margin: '8px 0 0 0', fontSize: 14 }}>
                          You’re enrolled in <strong>{cohortName}</strong>. We start on <strong>{niceDate}</strong>.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ margin: 0, fontSize: 14 }}>
                          Each day you’ll get a quick task for Listening, Reading, Writing, or Speaking. Finish daily to stay on the leaderboard.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 20px' }} align="center">
                        <a
                          href={ctaUrl}
                          style={{
                            display: 'inline-block',
                            padding: '10px 16px',
                            textDecoration: 'none',
                            borderRadius: 8,
                            border: '1px solid',
                          }}
                        >
                          Open my challenge
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 20px', fontSize: 12 }}>
                        Tip: Do the task at the same time every day for consistent momentum.
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 20px', fontSize: 12 }} align="center">
                        © GramorX
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
