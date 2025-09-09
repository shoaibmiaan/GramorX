import * as React from "react";

export type ReauthEmailProps = Readonly<{
  name?: string;
  token: string;
}>;

export default function ReauthEmail({ name = "there", token }: ReauthEmailProps) {
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
            Confirm your identity
          </h1>

          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            Hi {name}, please enter the following code to confirm your identity
            on <b>Gramor-X</b>:
          </p>

          <div
            style={{
              textAlign: "center",
              margin: "32px 0",
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "4px",
              background: "#f8f9ff",
              border: "1px dashed #4361ee",
              padding: "14px",
              borderRadius: "12px",
            }}
          >
            {token}
          </div>

          <p style={{ fontSize: "14px", color: "#555" }}>
            This code expires shortly. If you didn’t request this, you can
            ignore this email.
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
