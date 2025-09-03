// emails/DailyTaskEmail.tsx
import * as React from "react";

export type DailyTaskEmailProps = {
  fullName: string;
  cohortName: string;
  day: number;
  taskTitle: string;
  dueDate: string; // ISO date
  ctaUrl: string;
};

export const subject = (p: DailyTaskEmailProps) =>
  `Day ${p.day}: ${p.taskTitle} · ${p.cohortName}`;

export default function Email({ fullName, cohortName, day, taskTitle, dueDate, ctaUrl }: DailyTaskEmailProps) {
  const niceDue = new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

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
                        <h1 style={{ margin: 0, fontSize: 20 }}>Hi {fullName},</h1>
                        <p style={{ margin: '6px 0 0 0', fontSize: 14 }}>
                          Today is <strong>Day {day}</strong> of <strong>{cohortName}</strong>.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ margin: 0, fontSize: 14 }}>
                          🔹 <strong>{taskTitle}</strong><br />
                          Due: {niceDue}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style={{ padding: '16px 20px' }}>
                        <a
                          href={ctaUrl}
                          style={{ display: 'inline-block', padding: '10px 16px', textDecoration: 'none', borderRadius: 8, border: '1px solid' }}
                        >
                          Do today’s task
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 20px', fontSize: 12 }}>
                        Finish now to keep your streak alive. Little steps → big band boost.
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 20px', fontSize: 12 }} align="center">© GramorX</td>
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
