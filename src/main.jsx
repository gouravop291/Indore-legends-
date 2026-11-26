import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// ==========================================
// APP SCHEDULE & LAUNCH CONFIGURATION
// ==========================================
const SCHEDULE_ENABLED = true; // Set to false anytime to unlock the app 24/7
const BYPASS_CODE = "Admin-07"; // Change this to your preferred admin unlock code
const SECRET_TAPS_REQUIRED = 5;

// Official Launch: December 28, 2026 at 5:00 PM IST
const LAUNCH_TIMESTAMP = new Date("2026-12-28T17:00:00+05:30").getTime();

// Daily Testing Window: 4:00 PM to 8:00 PM IST (16:00 - 19:59)
const TEST_START_HOUR = 16;
const TEST_END_HOUR = 20;

// ==========================================
// TIME & COUNTDOWN HELPERS
// ==========================================
function getIstNow() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + 5.5 * 3600000);
}

function isAppOpenNow(ist) {
  const hour = ist.getHours();
  return hour >= TEST_START_HOUR && hour < TEST_END_HOUR;
}

function getNextWindowInfo(ist) {
  const hour = ist.getHours();
  const min = ist.getMinutes();
  const sec = ist.getSeconds();
  const currentSeconds = hour * 3600 + min * 60 + sec;

  let targetSeconds = TEST_START_HOUR * 3600;
  let label = "Today at 4:00 PM IST";

  if (hour < TEST_START_HOUR) {
    targetSeconds = TEST_START_HOUR * 3600;
    label = "Today at 4:00 PM IST";
  } else {
    targetSeconds = 24 * 3600 + TEST_START_HOUR * 3600;
    label = "Tomorrow at 4:00 PM IST";
  }

  const diff = Math.max(0, targetSeconds - currentSeconds);
  const h = String(Math.floor(diff / 3600)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
  const s = String(diff % 60).padStart(2, "0");

  return { label, countdown: `${h}:${m}:${s}` };
}

function getLaunchCountdown() {
  const diffMs = Math.max(0, LAUNCH_TIMESTAMP - Date.now());
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = String(Math.floor(totalSeconds / 86400)).padStart(2, "0");
  const hours = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return {
    days,
    hours,
    minutes,
    seconds,
    isLaunched: diffMs === 0,
  };
}

// ==========================================
// ROOT GATE COMPONENT
// ==========================================
function RootGate() {
  const [istNow, setIstNow] = useState(() => getIstNow());
  const [bypass, setBypass] = useState(false);
  const [taps, setTaps] = useState(0);
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIstNow(getIstNow());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const launch = getLaunchCountdown();
  const appIsOpen =
    !SCHEDULE_ENABLED || bypass || launch.isLaunched || isAppOpenNow(istNow);

  if (appIsOpen) {
    return <App />;
  }

  const nextWindow = getNextWindowInfo(istNow);

  const handleSecretTap = () => {
    if (showCodeBox) return;
    const nextTaps = taps + 1;
    if (nextTaps >= SECRET_TAPS_REQUIRED) {
      setShowCodeBox(true);
      setTaps(0);
    } else {
      setTaps(nextTaps);
    }
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (codeInput.trim() === BYPASS_CODE) {
      setBypass(true);
      setError("");
    } else {
      setError("Invalid access code.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div
          onClick={handleSecretTap}
          style={styles.badge}
          role="button"
          tabIndex={0}
        >
          IL
        </div>

        <h1 style={styles.title}>INDORE LEGENDS</h1>
        <p style={styles.subtitle}>Official Launch • Dec 28, 2026 at 5:00 PM IST</p>

        {/* Official Launch Countdown */}
        <div style={styles.sectionLabel}>LAUNCH COUNTDOWN</div>
        <div style={styles.grid}>
          <div style={styles.timeBox}>
            <div style={styles.timeValue}>{launch.days}</div>
            <div style={styles.timeUnit}>DAYS</div>
          </div>
          <div style={styles.timeBox}>
            <div style={styles.timeValue}>{launch.hours}</div>
            <div style={styles.timeUnit}>HRS</div>
          </div>
          <div style={styles.timeBox}>
            <div style={styles.timeValue}>{launch.minutes}</div>
            <div style={styles.timeUnit}>MIN</div>
          </div>
          <div style={styles.timeBox}>
            <div style={styles.timeValue}>{launch.seconds}</div>
            <div style={styles.timeUnit}>SEC</div>
          </div>
        </div>

        {/* Next Testing Window */}
        <div style={styles.windowBox}>
          <div style={styles.windowTitle}>FINAL TEST WINDOW (4:00 PM – 8:00 PM IST)</div>
          <div style={styles.windowSub}>Opens {nextWindow.label}</div>
          <div style={styles.windowTimer}>{nextWindow.countdown}</div>
        </div>

        {/* Secret Admin Unlock */}
        {showCodeBox && (
          <form onSubmit={handleCodeSubmit} style={styles.form}>
            <input
              type="password"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Enter admin code"
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Unlock App
            </button>
            {error && <div style={styles.error}>{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MINIMALIST STYLES
// ==========================================
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0a0f1c",
    color: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "28px 22px",
    textAlign: "center",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
  },
  badge: {
    width: "56px",
    height: "56px",
    margin: "0 auto 14px",
    borderRadius: "14px",
    backgroundColor: "#1e293b",
    border: "1px solid #d4af37",
    color: "#d4af37",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "1px",
    cursor: "pointer",
    userSelect: "none",
  },
  title: {
    margin: "0 0 6px",
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "1.5px",
  },
  subtitle: {
    margin: "0 0 24px",
    fontSize: "13px",
    color: "#94a3b8",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.4px",
    color: "#d4af37",
    marginBottom: "10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    marginBottom: "22px",
  },
  timeBox: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "12px 6px",
  },
  timeValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#ffffff",
  },
  timeUnit: {
    fontSize: "10px",
    color: "#94a3b8",
    marginTop: "4px",
    letterSpacing: "1px",
  },
  windowBox: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "14px",
  },
  windowTitle: {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.8px",
    color: "#38bdf8",
    marginBottom: "4px",
  },
  windowSub: {
    fontSize: "13px",
    color: "#cbd5e1",
    marginBottom: "6px",
  },
  windowTimer: {
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    color: "#ffffff",
  },
  form: {
    marginTop: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#0a0f1c",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#d4af37",
    color: "#0a0f1c",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
  error: {
    fontSize: "12px",
    color: "#f87171",
  },
};

// ==========================================
// MOUNT APPLICATION
// ==========================================
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RootGate />
    </StrictMode>
  );
}
