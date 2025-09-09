import * as React from "react";

export type ResetPasswordEmailProps = Readonly<{
  name?: string;
  resetUrl: string;
}>;

export default function ResetPasswordEmail({ name = "there", resetUrl }: ResetPasswordEmailProps) {
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
              background: "linear-gradient(to right, #ff6b6b, #f72585)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Reset your Gramor-X password
          </h1>

          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            Hi {name}, we received a request to reset your password.  
            Click the button below to choose a new one:
          </p>

          <div style={{ textAlign: "center", margin: "32px 0" }}>
            <a
              href={resetUrl}
              target="_blank"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                borderRadius: "50px",
                background: "linear-gradient(135deg,#f72585,#ff6b6b)",
                color: "white",
                fontSize: "16px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 10px 20px rgba(247,37,133,0.3)",
              }}
            >
              Reset Password
            </a>
          </div>

          <p style={{ fontSize: "14px", color: "#555" }}>
            If you didn’t request this, you can safely ignore this email.  
            For help, visit our <a href="https://gramorx.com/support" style="color:#4361ee;text-decoration:underline;">Support Center</a>.
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
