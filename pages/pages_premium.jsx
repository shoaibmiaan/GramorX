import Head from "next/head";
import { useEffect, useRef, useState } from "react";

export default function PremiumPinPage() {
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    pinRefs[0].current?.focus();
  }, []);

  const handleInput = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 1);
    e.target.value = v;
    if (v && idx < pinRefs.length - 1) pinRefs[idx + 1].current?.focus();
  };

  const handleKeyDown = (idx: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget as HTMLInputElement;
    if (e.key === "Backspace" && el.value === "" && idx > 0) {
      pinRefs[idx - 1].current?.focus();
    }
  };

  const submitPIN = () => {
    const pin = pinRefs.map(r => r.current?.value || "").join("");
    if (/^\d{4}$/.test(pin)) {
      setShowDashboard(true);
    } else {
      alert("Please enter a valid 4-digit PIN");
      pinRefs.forEach(r => { if (r.current) r.current.value = ""; });
      pinRefs[0].current?.focus();
    }
  };

  const backToPin = () => {
    setShowDashboard(false);
    pinRefs.forEach(r => { if (r.current) r.current.value = ""; });
    pinRefs[0].current?.focus();
  };

  const applyTheme = (theme: string) => {
    const body = document.body;
    body.className = "";
    body.classList.add(`theme-${theme}`);
  };

  return (
    <>
      <Head>
        <title>IELTS Precision - Premium Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className="container">
        {/* Theme Switcher */}
        <div className="theme-switcher">
          <button className="theme-btn" onClick={() => applyTheme("serene-light")} aria-label="Light theme"><i className="fas fa-sun" /></button>
          <button className="theme-btn" onClick={() => applyTheme("nocturnal")} aria-label="Dark theme"><i className="fas fa-moon" /></button>
          <button className="theme-btn" onClick={() => applyTheme("royal-gold")} aria-label="Royal Gold theme"><i className="fas fa-crown" /></button>
          <button className="theme-btn" onClick={() => applyTheme("forest-focus")} aria-label="Forest Focus theme"><i className="fas fa-leaf" /></button>
        </div>

        {/* PIN Entry Section */}
        {!showDashboard && (
          <div className="card pin-modal" id="pin-section">
            <div className="logo">
              <i className="fas fa-gem" />IELTS Precision
            </div>
            <h1>Enter Your Access Code</h1>
            <p>Welcome to the exclusive IELTS preparation portal. Enter your PIN to access premium practice tests and materials.</p>

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
              <i className="fas fa-lock-open" />Access Elite Materials
            </button>
          </div>
        )}

        {/* Dashboard Section */}
        {showDashboard && (
          <div className="dashboard" id="dashboard-section">
            <button className="btn back-btn" id="back-to-pin" onClick={backToPin}>
              <i className="fas fa-arrow-left" />Back
            </button>

            <div className="logo">
              <i className="fas fa-gem" />IELTS Precision
            </div>

            <h1>Welcome to Your Elite Prep Hub</h1>
            <p>Select a module to begin your practice. You have access to 8 full tests for each section.</p>

            <div className="module-grid">
              {[
                { key: "reading", icon: "fa-book-open", title: "Reading", desc: "Practice with academic texts and improve your reading speed" },
                { key: "listening", icon: "fa-headphones", title: "Listening", desc: "Enhance your ability to understand spoken English" },
                { key: "writing", icon: "fa-pen-fancy", title: "Writing", desc: "Develop your writing skills with guided tasks" },
                { key: "speaking", icon: "fa-microphone", title: "Speaking", desc: "Practice with sample questions and model answers" },
              ].map((m) => (
                <div className="module-card" key={m.key} data-module={m.key} onClick={() => alert(`Opening ${m.title} tests...`)}>
                  <div className="module-icon"><i className={`fas ${m.icon}`} /></div>
                  <h3 className="module-title">{m.title}</h3>
                  <p className="module-desc">{m.desc}</p>
                  <div className="tests-count">8 Tests</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Styles cloned 1:1 from provided HTML */}
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; transition: background-color 0.3s, color 0.3s, transform 0.2s; }
        :root {
          --primary-bg: #FFFFFF; --secondary-bg: #F8FAFC; --primary-text: #1E293B; --accent: #3B82F6; --accent-hover: #2563EB; --success: #10B981; --card-bg: #FFFFFF; --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); --input-bg: #FFFFFF; --border-color: #E2E8F0;
        }
        body.theme-nocturnal { --primary-bg: #1E293B; --secondary-bg: #334155; --primary-text: #F1F5F9; --accent: #818CF8; --accent-hover: #6366F1; --success: #34D399; --card-bg: #334155; --card-shadow: 0 4px 12px rgba(129, 140, 248, 0.1); --input-bg: #475569; --border-color: #475569; }
        body.theme-royal-gold { --primary-bg: #2D3748; --secondary-bg: #4A5568; --primary-text: #E2E8F0; --accent: #D4AF37; --accent-hover: #B7950B; --success: #D4AF37; --card-bg: #4A5568; --card-shadow: 0 4px 16px rgba(0, 0, 0, 0.3); --input-bg: #4A5568; --border-color: #6B7280; }
        body.theme-forest-focus { --primary-bg: #F1F5S9; --secondary-bg: #FFFFFF; --primary-text: #1E293B; --accent: #0F766E; --accent-hover: #0D9488; --success: #0F766E; --card-bg: #FFFFFF; --card-shadow: 0 2px 8px rgba(15, 118, 110, 0.1); --input-bg: #FFFFFF; --border-color: #E2E8F0; }
        /* Fix typo in provided HEX: F1F5S9 -> F1F5F9 */
        body.theme-forest-focus { --primary-bg: #F1F5F9; }
        body { background-color: var(--primary-bg); color: var(--primary-text); min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; }
        .container { width: 100%; max-width: 1200px; margin: 0 auto; }
        .card { background-color: var(--card-bg); border-radius: 16px; box-shadow: var(--card-shadow); padding: 32px; margin: 20px 0; border: 1px solid var(--border-color); }
        .pin-modal { width: 100%; max-width: 480px; text-align: center; }
        .logo { margin-bottom: 24px; font-size: 28px; font-weight: 700; color: var(--accent); }
        .logo i { margin-right: 8px; }
        h1 { font-size: 28px; margin-bottom: 16px; color: var(--primary-text); }
        p { color: var(--primary-text); opacity: 0.8; margin-bottom: 24px; line-height: 1.6; }
        .pin-input-container { display: flex; justify-content: center; gap: 12px; margin: 32px 0; }
        .pin-input { width: 60px; height: 70px; border: 2px solid var(--border-color); border-radius: 12px; text-align: center; font-size: 28px; font-weight: 700; background-color: var(--input-bg); color: var(--primary-text); outline: none; }
        .pin-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3); }
        .btn { background-color: var(--accent); color: white; border: none; border-radius: 50px; padding: 16px 32px; font-size: 16px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
        .btn:hover { background-color: var(--accent-hover); transform: translateY(-2px); }
        .btn i { font-size: 18px; }
        .theme-switcher { position: absolute; top: 20px; right: 20px; }
        .theme-btn { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--border-color); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; background-color: var(--card-bg); color: var(--primary-text); margin-left: 8px; }
        .theme-btn:hover { transform: scale(1.1); }
        .dashboard { width: 100%; text-align: center; }
        .module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 40px; }
        .module-card { background: var(--card-bg); border-radius: 16px; padding: 32px 24px; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); cursor: pointer; display: flex; flex-direction: column; align-items: center; transition: all 0.3s; }
        .module-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1); border-color: var(--accent); }
        .module-icon { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 16px; background-color: var(--accent); color: white; }
        .module-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .module-desc { font-size: 14px; opacity: 0.8; margin-bottom: 16px; }
        .tests-count { background-color: var(--secondary-bg); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .back-btn { position: absolute; top: 20px; left: 20px; background: var(--secondary-bg); color: var(--primary-text); }
        .hidden { display: none; }
        @media (max-width: 768px) { .pin-input { width: 50px; height: 60px; font-size: 24px; } .module-grid { grid-template-columns: 1fr; } .card { padding: 24px; } }
      `}</style>
    </>
  );
}
