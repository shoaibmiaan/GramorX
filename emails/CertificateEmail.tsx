// emails/CertificateEmail.tsx
import * as React from "react";

export type CertificateEmailProps = {
  fullName: string;
  band: number;        // e.g., 7.5
  cohortName?: string; // optional
  certUrl: string;
};

export const subject = (p: CertificateEmailProps) =>
  `Your GramorX Certificate — Band ${p.band.toFixed(1)}${p.cohortName ? ` · ${p.cohortName}` : ""}`;

export default function Email({ fullName, band, cohortName, certUrl }: CertificateEmailProps) {
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
                        <h1 style={{ margin: 0, fontSize: 22 }}>Congratulations, {fullName}! 🎉</h1>
                        <p style={{ margin: '6px 0 0 0', fontSize: 14 }}>
                          You completed your challenge{cohortName ? ` — ${cohortName}` : ""} with a predicted band of <strong>{band.toFixed(1)}</strong>.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ margin: 0, fontSize: 14 }}>
                          Your certificate is ready. Share it with friends and keep improving with focused practice.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style={{ padding: '16px 20px' }}>
                        <a
                          href={certUrl}
                          style={{ display: 'inline-block', padding: '10px 16px', textDecoration: 'none', borderRadius: 8, border: '1px solid' }}
                        >
                          View certificate
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
