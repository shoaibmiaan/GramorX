import * as React from "react";

export type MagicLinkEmailProps = Readonly<{
  name?: string;
  magicLinkUrl: string;
}>;

export default function MagicLinkEmail({
  name = "there",
  magicLinkUrl,
}: MagicLinkEmailProps) {
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
              background: "linear-gradient(to right, #f72585, #4cc9f0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Sign in to Gramor-X
          </h1>

          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            Hi {name}, click the button below to access your account instantly.
          </p>

          <div style={{ textAlign: "center", margin: "32px 0" }}>
            <a
              href={magicLinkUrl}
              target="_blank"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                borderRadius: "50px",
                background: "linear-gradient(135deg,#f72585,#4cc9f0)",
                color: "white",
                fontSize: "16px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 10px 20px rgba(247,37,133,0.25)",
              }}
            >
              Sign in now
            </a>
          </div>

          <p style={{ fontSize: "14px", color: "#555" }}>
            This link will expire soon. If you didn’t request this, please
            ignore the email.
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
