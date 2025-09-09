import Head from "next/head";
import * as React from "react";

export default function PremiumPinPage(): JSX.Element {
  // Create refs at top level (stable hook order). Then gather them in an array.
  const d1 = React.useRef<HTMLInputElement>(null);
  const d2 = React.useRef<HTMLInputElement>(null);
  const d3 = React.useRef<HTMLInputElement>(null);
  const d4 = React.useRef<HTMLInputElement>(null);
  const pinRefs = [d1, d2, d3, d4] as const;

  const [showDashboard, setShowDashboard] = React.useState(false);

  React.useEffect(() => {
    pinRefs[0].current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput =
    (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value.replace(/\D/g, "").slice(0, 1);
      e.currentTarget.value = v;
      if (v && idx < pinRefs.length - 1) {
        pinRefs[idx + 1].current?.focus();
      }
    };

  const handleKeyDown =
    (idx: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      const el = e.currentTarget;
      if (e.key === "Backspace" && el.value === "" && idx > 0) {
        pinRefs[idx - 1].current?.focus();
      }
    };

  const submitPIN = () => {
    const pin = pinRefs.map((r) => r.current?.value ?? "").join("");
    if (/^\d{4}$/.test(pin)) {
      setShowDashboard(true);
    } else {
      // eslint-disable-next-line no-alert
      alert("Please enter a valid 4-digit PIN");
      pinRefs.forEach((r) => {
        if (r.current) r.current.value = "";
      });
      pinRefs[0].current?.focus();
    }
  };

  const backToPin = () => {
    setShowDashboard(false);
    pinRefs.forEach((r) => {
      if (r.current) r.current.value = "";
    });
    pinRefs[0].current?.focus();
  };

  const applyTheme = (theme: string) => {
    if (typeof document === "undefined") return;
    const body = document.body;
    body.className = "";
    body.classList.add(`theme-${theme}`);
  };

  return (
    <>
      <Head>
        <title>IELTS Precision - Premium Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Keeping your Font Awesome link (CDN) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </Head>

      <div className="container">
        {/* Theme Switcher */}
        <div className="theme-switcher">
          <button
            className="theme-btn"
            onClick={() => applyTheme("serene-light")}
            aria-label="Light theme"
          >
            <i className="fas fa-sun" />
          </button>
          <button
            className="theme-btn"
            onClick={() => applyTheme("nocturnal")}
            aria-label="Dark theme"
          >
            <i className="fas fa-moon" />
          </button>
          <button
            className="theme-btn"
            onClick={() => applyTheme("royal-gold")}
            aria-label="Royal Gold theme"
          >
            <i className="fas fa-crown" />
          </button>
          <button
            className="theme-btn"
            onClick={() => applyTheme("forest-focus")}
            aria-label="Forest Focus theme"
          >
            <i className="fas fa-leaf" />
          </button>
        </div>

        {/* PIN Entry Section */}
        {!showDashboard && (
          <div className="card pin-modal" id="pin-section">
            <div className="logo">
              <i className="fas fa-gem" />
              IELTS Precision
            </div>
            <h1>Enter Your Access Code</h1>
            <p>
              Welcome to the exclusive IELTS preparation portal. Enter your PIN
              to access premium practice tests and materials.
            </p>

            <div className="pin-input-container">
              {pinRefs.map((ref, idx) => (
                <input
                  key={idx}
                  ref={ref}
                  type="text"
                  className="pin-input"
                  maxLength={1}
                  inputMode="numeric"
                  onInput={handleInput(idx)}
                  onKeyDown={handleKeyDown(idx)}
                  aria-label={`PIN digit ${idx + 1}`}
                />
              ))}
            </div>

            <button className="btn" id="submit-pin" onClick={submitPIN}>
              <i className="fas fa-lock-open" />
              Access Elite Materials
            </button>
          </div>
        )}

        {/* Dashboard Section */}
        {showDashboard && (
          <div className="dashboard" id="dashboard-section">
            <button className="btn back-btn" id="back-to-pin" onClick={backToPin}>
              <i className="fas fa-arrow-left" />
              Back
            </button>

            <div className="logo">
              <i className="fas fa-gem" />
              IELTS Precision
            </div>

            <h1>Welcome to Your Elite Prep Hub</h1>
            <p>
              Select a module to begin your practice. You have access to 8 full
              tests for each section.
            </p>

            <div className="module-grid">
              {[
                {
                  key: "reading",
                  icon: "fa-book-open",
                  title: "Reading",
                  desc:
                    "Practice with academic texts and improve your reading speed",
                },
                {
                  key: "listening",
                  icon: "fa-headphones",
                  title: "Listening",
                  desc:
                    "Enhance your ability to understand spoken English",
                },
                {
                  key: "writing",
                  icon: "fa-pen-fancy",
                  title: "Writing",
                  desc:
                    "Develop your writing skills with guided tasks",
                },
                {
                  key: "speaking",
                  icon: "fa-microphone",
                  title: "Speaking",
                  desc:
                    "Practice with sample questions and model answers",
                },
              ].map((m) => (
                <div
                  className="module-card"
                  key={m.key}
                  data-module={m.key}
                  onClick={() => alert(`Opening ${m.title} tests...`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      alert(`Opening ${m.title} tests...`);
                    }
                  }}
                >
                  <div className="module-icon">
                    <i className={`fas ${m.icon}`} />
                  </div>
                  <h3 className="module-title">{m.title}</h3>
                  <p className="module-desc">{m.desc}</p>
                  <div className="tests-count">8 Tests</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Styles cloned 1:1 from your HTML, with small fixes */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          transition: background-color 0.3s, color 0.3s, transform 0.2s;
        }
        :root {
          --primary-bg: #ffffff;
          --secondary-bg: #f8fafc;
          --primary-text: #1e293b;
          --accent: #3b82f6;
          --accent-hover: #2563eb;
          --success: #10b981;
          --card-bg: #ffffff;
          --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          --input-bg: #ffffff;
          --border-color: #e2e8f0;
        }
        body.theme-nocturnal {
          --primary-bg: #1e293b;
          --secondary-bg: #334155;
          --primary-text: #f1f5f9;
          --accent: #818cf8;
          --accent-hover: #6366f1;
          --success: #34d399;
          --card-bg: #334155;
          --card-shadow: 0 4px 12px rgba(129, 140, 248, 0.1);
          --input-bg: #475569;
          --border-color: #475569;
        }
        body.theme-royal-gold {
          --primary-bg: #2d3748;
          --secondary-bg: #4a5568;
          --primary-text: #e2e8f0;
          --accent: #d4af37;
          --accent-hover: #b7950b;
          --success: #d4af37;
          --card-bg: #4a5568;
          --card-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          --input-bg: #4a5568;
          --border-color: #6b7280;
        }
        body.theme-forest-focus {
          --primary-bg: #f1f5f9; /* Fixed: was F1F5S9 */
          --secondary-bg: #ffffff;
          --primary-text: #1e293b;
          --accent: #0f766e;
          --accent-hover: #0d9488;
          --success: #0f766e;
          --card-bg: #ffffff;
          --card-shadow: 0 2px 8px rgba(15, 118, 110, 0.1);
          --input-bg: #ffffff;
          --border-color: #e2e8f0;
        }
        body {
          background-color: var(--primary-bg);
          color: var(--primary-text);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        .card {
          background-color: var(--card-bg);
          border-radius: 16px;
          box-shadow: var(--card-shadow);
          padding: 32px;
          margin: 20px 0;
          border: 1px solid var(--border-color);
        }
        .pin-modal {
          width: 100%;
          max-width: 480px;
          text-align: center;
        }
        .logo {
          margin-bottom: 24px;
          font-size: 28px;
          font-weight: 700;
          color: var(--accent);
        }
        .logo i {
          margin-right: 8px;
        }
        h1 {
          font-size: 28px;
          margin-bottom: 16px;
          color: var(--primary-text);
        }
        p {
          color: var(--primary-text);
          opacity: 0.8;
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .pin-input-container {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin: 32px 0;
        }
        .pin-input {
          width: 60px;
          height: 70px;
          border: 2px solid var(--border-color);
          border-radius: 12px;
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          background-color: var(--input-bg);
          color: var(--primary-text);
          outline: none;
        }
        .pin-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        .btn {
          background-color: var(--accent);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn:hover {
          background-color: var(--accent-hover);
          transform: translateY(-2px);
        }
        .btn i {
          font-size: 18px;
        }
        .theme-switcher {
          position: absolute;
          top: 20px;
          right: 20px;
        }
        .theme-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: var(--card-bg);
          color: var(--primary-text);
          margin-left: 8px;
        }
        .theme-btn:hover {
          transform: scale(1.1);
        }
        .dashboard {
          width: 100%;
          text-align: center;
        }
        .module-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }
        .module-card {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 32px 24px;
          box-shadow: var(--card-shadow);
          border: 1px solid var(--border-color);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.3s;
        }
        .module-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          border-color: var(--accent);
        }
        .module-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-bottom: 16px;
          background-color: var(--accent);
          color: white;
        }
        .module-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .module-desc {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 16px;
        }
        .tests-count {
          background-color: var(--secondary-bg);
          color: var(--accent);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        .back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          background: var(--secondary-bg);
          color: var(--primary-text);
        }
        .hidden {
          display: none;
        }
        @media (max-width: 768px) {
          .pin-input {
            width: 50px;
            height: 60px;
            font-size: 24px;
          }
          .module-grid {
            grid-template-columns: 1fr;
          }
          .card {
            padding: 24px;
          }
        }
      `}</style>
    </>
  );
}
