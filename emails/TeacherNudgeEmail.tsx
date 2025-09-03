// emails/TeacherNudgeEmail.tsx
import * as React from "react";

export type TeacherNudgeEmailProps = {
  studentName: string;
  cohortName: string;
  message?: string;
  ctaUrl: string;
};

export const subject = (p: TeacherNudgeEmailProps) =>
  `Reminder from your teacher · ${p.cohortName}`;

export default function Email({ studentName, cohortName, message, ctaUrl }: TeacherNudgeEmailProps) {
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
                        <h1 style={{ margin: 0, fontSize: 20 }}>Hi {studentName},</h1>
                        <p style={{ margin: '6px 0 0 0', fontSize: 14 }}>
                          Your teacher sent a reminder for <strong>{cohortName}</strong>.
                        </p>
                      </td>
                    </tr>
                    {message ? (
                      <tr>
                        <td style={{ padding: '16px 20px', fontSize: 14 }}>
                          “{message}”
                        </td>
                      </tr>
                    ) : null}
                    <tr>
                      <td align="center" style={{ padding: '16px 20px' }}>
                        <a
                          href={ctaUrl}
                          style={{ display: 'inline-block', padding: '10px 16px', textDecoration: 'none', borderRadius: 8, border: '1px solid' }}
                        >
                          Open my tasks
                        </a>
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
