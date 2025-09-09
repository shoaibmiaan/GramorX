import * as React from "react";

export type ChangeEmailAddressEmailProps = Readonly<{
  name?: string;
  oldEmail: string;
  newEmail: string;
  confirmUrl: string;
}>;

export default function ChangeEmailAddressEmail({
  name = "there",
  oldEmail,
  newEmail,
  confirmUrl,
}: ChangeEmailAddressEmailProps) {
  return (
    <html>
      <body
        style={{
          fontFamily: "'Poppins', Arial, sans-serif",
          backgroundColor: "#f0f2f5",
          color: "#1a1a2e",
          padding: "32px",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
          }}
        >
          <h1
            style={{
              fontFamily: "'Roboto Slab', serif",
              fontSize: "26px",
              fontWeight: 700,
              marginBottom: "16px",
              background: "linear-gradient(to right, #4361ee, #4cc9f0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Confirm email change
          </h1>

          <p style={{ fontSize: "16px", marginBottom: "12px" }}>
            Hi {name}, you requested to change your Gramor-X sign-in email.
          </p>
          <p style={{ fontSize: "15px", color: "#555", marginBottom: "20px" }}>
            <b>From:</b> {oldEmail} <br />
            <b>To:</b> {newEmail}
          </p>

          <div style={{ textAlign: "center", margin: "28px 0" }}>
            <a
              href={confirmUrl}
              target="_blank"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                borderRadius: "50px",
                background: "linear-gradient(135deg,#4361ee,#4cc9f0)",
                color: "white",
                fontSize: "16px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 10px 20px rgba(67,97,238,0.25)",
              }}
            >
              Confirm email change
            </a>
          </div>

          <p style={{ fontSize: "14px", color: "#555" }}>
            If you didn’t request this, please ignore this email and your address
            will remain unchanged.
          </p>

          <p
            style={{
              fontSize: "12px",
              color: "#8a8a9c",
              textAlign: "center",
              marginTop: "32px",
            }}
          >
            © {new Date().getFullYear()} Gramor-X — All rights reserved.
          </p>
        </div>
      </body>
    </html>
  );
}
