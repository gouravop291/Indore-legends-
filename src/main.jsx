import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const SCHEDULE_ENABLED = true; // Set to false on final launch to keep app open 24/7
const BYPASS_CODE = "9999001430";

function getIstNow(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + 5.5 * 60 * 60 * 1000);
}

function isAppOpenNow(ist: Date): boolean {
  const hour = ist.getHours();
  // Live windows: 3:00 PM - 4:00 PM (15:00 - 15:59) and 7:00 PM - 8:00 PM (19:00 - 19:59) IST
  return (hour >= 15 && hour < 16) || (hour >= 19 && hour < 20);
}

function getNextWindowInfo(ist: Date): { label: string; countdown: string } {
  const hour = ist.getHours();
  const min = ist.getMinutes();
  const sec = ist.getSeconds();
  const currentSeconds = hour * 3600 + min * 60 + sec;

  let targetSeconds = 15 * 3600;
  let label = "Today at 3:00 PM IST";

  if (hour < 15) {
    targetSeconds = 15 * 3600;
    label = "Today at 3:00 PM IST";
  } else if (hour >= 16 && hour < 19) {
    targetSeconds = 19 * 3600;
    label = "Today at 7:00 PM IST";
  } else {
    targetSeconds = 24 * 3600 + 15 * 3600;
    label = "Tomorrow at 3:00 PM IST";
  }

  const diff = Math.max(0, targetSeconds - currentSeconds);
  const h = String(Math.floor(diff / 3600)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
  const s = String(diff % 60).padStart(2, "0");

  return { label, countdown: h + ":" + m + ":" + s };
}

function RootGate() {
  const [istNow, setIstNow] = useState<Date>(() => getIstNow());
  const [bypass, setBypass] = useState<boolean>(false);
  const [taps, setTaps] = useState<number>(0);
  const [showCodeBox, setShowCodeBox] = useState<boolean>(false);
  const [codeInput, setCodeInput] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIstNow(getIstNow());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const appIsOpen = !SCHEDULE_ENABLED || bypass || isAppOpenNow(istNow);

  if (appIsOpen) {
    return <App />;
  }

  const nextWindow = getNextWindowInfo(istNow);

  const handleSecretTap = () => {
    if (showCodeBox) return;
    const next = taps + 1;
    if (next >= 5) {
      setShowCodeBox(true);
      setTaps(0);
      setError("");
    } else {
      setTaps(next);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput.trim() === BYPASS_CODE) {
      setBypass(true);
      setCodeInput("");
      setError("");
    } else {
      setError("Access denied.");
      setCodeInput("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #101d42 0%, #040714 70%)",
        color: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          background: "rgba(13, 21, 42, 0.92)",
          border: "1px solid rgba(251, 191, 36, 0.45)",
          borderRadius: "20px",
          padding: "30px 22px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.65)",
        }}
      >
        <div
          onClick={handleSecretTap}
          style={{
            width: "68px",
            height: "68px",
            margin: "0 auto 16px auto",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #fde68a, #f59e0b, #d97706)",
            color: "#040714",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            fontWeight: 900,
            cursor: "pointer",
            userSelect: "none",
            boxShadow: "0 0 24px rgba(251, 191, 36, 0.45)",
          }}
        >
          IL
        </div>

        <div
          style={{
            display: "inline-block",
            padding: "5px 12px",
            borderRadius: "999px",
            background: "rgba(251, 191, 36, 0.16)",
            color: "#fbbf24",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.14em",
            marginBottom: "12px",
          }}
        >
          UNDER MAINTENANCE
        </div>

        <h1 style={{ margin: "0 0 10px 0", fontSize: "26px", fontWeight: 900 }}>
          INDORE LEGENDS
        </h1>

        <p style={{ margin: "0 0 18px 0", fontSize: "14px", color: "#94a3b8", lineHeight: 1.6 }}>
          We are running scheduled upgrades and live testing. Access opens automatically during our active windows.
        </p>

        <div
          style={{
            padding: "14px 12px",
            borderRadius: "14px",
            background: "rgba(2, 6, 23, 0.78)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            marginBottom: "12px",
          }}
        >
          <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, letterSpacing: "0.08em" }}>
            NEXT LIVE WINDOW: {nextWindow.label.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "#38bdf8",
              marginTop: "4px",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.06em",
            }}
          >
            {nextWindow.countdown}
          </div>
        </div>

        <div
          style={{
            padding: "10px 12px",
            borderRadius: "12px",
            background: "rgba(251, 191, 36, 0.08)",
            border: "1px solid rgba(251, 191, 36, 0.25)",
            fontSize: "12px",
            color: "#fde68a",
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          Open Windows (IST): 3:00 PM - 4:00 PM &amp; 7:00 PM - 8:00 PM
        </div>

        {showCodeBox && (
          <form
            onSubmit={handleUnlock}
            style={{
              marginTop: "18px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(148, 163, 184, 0.2)",
              display: "grid",
              gap: "10px",
            }}
          >
            <input
              type="password"
              inputMode="numeric"
              placeholder="Enter developer code"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value);
                setError("");
              }}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid rgba(251, 191, 36, 0.45)",
                background: "#020617",
                color: "#f8fafc",
                fontSize: "14px",
                textAlign: "center",
                letterSpacing: "0.15em",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {error && (
              <div style={{ fontSize: "12px", color: "#fb7185", fontWeight: 700 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #d97706, #f59e0b)",
                  color: "#040714",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Unlock
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCodeBox(false);
                  setCodeInput("");
                  setError("");
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  background: "#1e293b",
                  color: "#cbd5e1",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootGate />
  </React.StrictMode>
);
