import React, {
  Component,
  ErrorInfo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// Uncomment the line below ONLY if your src/ folder has an index.css file:
// import "./index.css";

/* ============================================================================
 * 1. CONFIGURATION & CONSTANTS
 * ========================================================================== */

const SCHEDULE_ENABLED = true;
const ADMIN_BYPASS_CODE = "Admin-07";
const SECRET_TAP_REQUIRED = 5;
const OPEN_START_HOUR_IST = 16; // 4:00 PM IST
const OPEN_END_HOUR_IST = 20;   // 8:00 PM IST
const OFFICIAL_LAUNCH_ISO = "2026-12-28T17:00:00+05:30";
const OFFICIAL_LAUNCH_TIMESTAMP = new Date(OFFICIAL_LAUNCH_ISO).getTime();
const LAUNCH_ANNOUNCEMENT_TIMESTAMP = new Date("2026-11-26T00:00:00+05:30").getTime();
const APP_VERSION = "v2.4.0-APK";
const PREFS_STORAGE_KEY = "il_apk_gate_prefs_v2";
const BYPASS_SESSION_KEY = "il_admin_bypass_active";
const SPLASH_DURATION_MS = 2100;

/* ============================================================================
 * 2. TYPESCRIPT INTERFACES
 * ========================================================================== */

type GraphicsQuality = "ultra" | "balanced" | "eco";
type GateTab = "countdown" | "squad" | "schedule";
type HapticPattern = "light" | "medium" | "heavy" | "success" | "error" | "stadium";
type SoundCue = "tap" | "tab" | "unlock" | "error" | "ping";

interface NextWindowInfo {
  label: string;
  countdown: string;
  hours: string;
  minutes: string;
  seconds: string;
  isToday: boolean;
}

interface LaunchCountdownInfo {
  label: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  formatted: string;
  isLaunched: boolean;
  progressPercent: number;
}

interface SquadMember {
  id: string;
  name: string;
  jersey: number;
  role: string;
  photo: string;
  initials: string;
  tag: string;
}

interface ScheduleMilestone {
  id: string;
  title: string;
  timeLabel: string;
  detail: string;
  status: "done" | "active" | "upcoming";
}

interface GatePreferences {
  graphics: GraphicsQuality;
  haptics: boolean;
  sound: boolean;
  wakeLock: boolean;
}

interface ApkEnvironmentInfo {
  isAndroid: boolean;
  isWebView: boolean;
  isStandalone: boolean;
  runtimeLabel: string;
  viewport: string;
  dpr: number;
  cores: number;
}

interface ToastState {
  id: number;
  message: string;
  tone: "gold" | "emerald" | "rose" | "cyan";
}

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  hue: "gold" | "cyan" | "white";
  pulseSpeed: number;
  phase: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/* ============================================================================
 * 3. OFFICIAL SQUAD & SCHEDULE DATA
 * ========================================================================== */

const SQUAD_MEMBERS: SquadMember[] = [
  { id: "p1", name: "Gaurav Lalwani", jersey: 45, role: "Captain / All-Rounder", photo: "/players/p1.jpg", initials: "GL", tag: "FOUNDER" },
  { id: "p2", name: "Granth Sharma", jersey: 7, role: "Top-Order Batter", photo: "/players/p2.jpg", initials: "GS", tag: "SQUAD" },
  { id: "p3", name: "Adhyan Upadhyay", jersey: 1, role: "Opening Striker", photo: "/players/p3.jpg", initials: "AU", tag: "SQUAD" },
  { id: "p4", name: "Virat Chaudary", jersey: 18, role: "Middle-Order Anchor", photo: "/players/p4.jpg", initials: "VC", tag: "SQUAD" },
  { id: "p5", name: "Agam Khandelwal", jersey: 3, role: "All-Rounder", photo: "/players/p5.jpg", initials: "AK", tag: "SQUAD" },
  { id: "p6", name: "Aditya Rathore", jersey: 4, role: "Strike Bowler", photo: "/players/p6.jpg", initials: "AR", tag: "SQUAD" },
  { id: "p7", name: "Anuj Mishra", jersey: 5, role: "Finisher", photo: "/players/p7.jpg", initials: "AM", tag: "SQUAD" },
  { id: "p8", name: "Aadarsh Mishra", jersey: 6, role: "Pace Attack", photo: "/players/p8.jpg", initials: "AM", tag: "SQUAD" },
  { id: "p9", name: "Atharv Solanki", jersey: 17, role: "Power Hitter", photo: "/players/p9.jpg", initials: "AS", tag: "SQUAD" },
  { id: "p10", name: "Ashwin Gagrani", jersey: 8, role: "Spin Specialist", photo: "/players/p10.jpg", initials: "AG", tag: "SQUAD" },
  { id: "p11", name: "Rudraksh Soni", jersey: 9, role: "Wicketkeeper / Bat", photo: "/players/p11.jpg", initials: "RS", tag: "SQUAD" },
  { id: "p12", name: "Naitik Arya", jersey: 10, role: "Utility All-Rounder", photo: "/players/p12.jpg", initials: "NA", tag: "SQUAD" },
  { id: "p13", name: "Harshit Nagpal", jersey: 11, role: "Death Bowler", photo: "/players/p13.jpg", initials: "HN", tag: "SQUAD" },
];

const SCHEDULE_MILESTONES: ScheduleMilestone[] = [
  {
    id: "m1",
    title: "Firebase Cloud & Live Locker Chat",
    timeLabel: "Completed",
    detail: "Realtime read/write rules verified with instant squad sync.",
    status: "done",
  },
  {
    id: "m2",
    title: "Squad Portrait Pipeline (/public/players)",
    timeLabel: "Completed",
    detail: "All 13 player slots mapped cleanly to p1.jpg through p13.jpg.",
    status: "done",
  },
  {
    id: "m3",
    title: "Final Open Beta Stress Test",
    timeLabel: "4:00 PM – 8:00 PM IST",
    detail: "Full 4-hour continuous open window for live scoring, ID cards, and LegendBot.",
    status: "active",
  },
  {
    id: "m4",
    title: "Official Indore Legends Launch",
    timeLabel: "Dec 28, 2026 • 5:00 PM IST",
    detail: "Permanent 24/7 APK unlock for the entire club and season matches.",
    status: "upcoming",
  },
];

/* ============================================================================
 * 4. IST CLOCK, SCHEDULE & LAUNCH COUNTDOWN ENGINE
 * ========================================================================== */

function getIstNow(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + 5.5 * 3600000);
}

function pad2(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, "0");
}

function formatIstClock(ist: Date): string {
  const rawHours = ist.getHours();
  const period = rawHours >= 12 ? "PM" : "AM";
  const hours12 = rawHours % 12 === 0 ? 12 : rawHours % 12;
  return `${pad2(hours12)}:${pad2(ist.getMinutes())}:${pad2(ist.getSeconds())}${period} IST`;
}

function formatIstDate(ist: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${days[ist.getDay()]},${ist.getDate()} ${months[ist.getMonth()]}${ist.getFullYear()}`;
}

function isAppOpenNow(ist: Date): boolean {
  if (Date.now() >= OFFICIAL_LAUNCH_TIMESTAMP) {
    return true;
  }
  const hour = ist.getHours();
  // Continuous open test window: 4:00 PM – 8:00 PM IST (16:00 – 19:59)
  return hour >= OPEN_START_HOUR_IST && hour < OPEN_END_HOUR_IST;
}

function getWindowProgressPercent(ist: Date): number {
  const currentSeconds =
    ist.getHours() * 3600 + ist.getMinutes() * 60 + ist.getSeconds();
  const startSeconds = OPEN_START_HOUR_IST * 3600;
  const endSeconds = OPEN_END_HOUR_IST * 3600;
  if (currentSeconds <= startSeconds) return 0;
  if (currentSeconds >= endSeconds) return 100;
  return Math.round(((currentSeconds - startSeconds) / (endSeconds - startSeconds)) * 100);
}

function getNextWindowInfo(ist: Date): NextWindowInfo {
  const hour = ist.getHours();
  const min = ist.getMinutes();
  const sec = ist.getSeconds();
  const currentSeconds = hour * 3600 + min * 60 + sec;

  let targetSeconds = OPEN_START_HOUR_IST * 3600;
  let label = "Today at 4:00 PM IST";
  let isToday = true;

  if (hour < OPEN_START_HOUR_IST) {
    targetSeconds = OPEN_START_HOUR_IST * 3600;
    label = "Today at 4:00 PM IST";
    isToday = true;
  } else {
    targetSeconds = 24 * 3600 + OPEN_START_HOUR_IST * 3600;
    label = "Tomorrow at 4:00 PM IST";
    isToday = false;
  }

  const diff = Math.max(0, targetSeconds - currentSeconds);
  const hours = pad2(Math.floor(diff / 3600));
  const minutes = pad2(Math.floor((diff % 3600) / 60));
  const seconds = pad2(diff % 60);

  return {
    label,
    countdown: `${hours}:${minutes}:${seconds}`, hours, minutes, seconds, isToday, }; }  function getLaunchCountdown(): LaunchCountdownInfo { const nowMs = Date.now(); const diffMs = Math.max(0, OFFICIAL_LAUNCH_TIMESTAMP - nowMs); const totalSeconds = Math.floor(diffMs / 1000);  const days = pad2(Math.floor(totalSeconds / 86400)); const hours = pad2(Math.floor((totalSeconds \% 86400) / 3600)); const minutes = pad2(Math.floor((totalSeconds \% 3600) / 60)); const seconds = pad2(totalSeconds \% 60);  const totalSpan = Math.max(1, OFFICIAL_LAUNCH_TIMESTAMP - LAUNCH_ANNOUNCEMENT_TIMESTAMP); const elapsed = Math.max(0, nowMs - LAUNCH_ANNOUNCEMENT_TIMESTAMP); const progressPercent = Math.min(100, Math.max(2, Math.round((elapsed / totalSpan) * 100)));  return { label: "Dec 28, 2026 • 5:00 PM IST", days, hours, minutes, seconds, formatted: `${days}d : ${hours}h :${minutes}m : ${seconds}s`, isLaunched: diffMs === 0, progressPercent, }; }  /* ============================================================================ * 5. NATIVE APK BRIDGE, HAPTICS, AUDIO & STORAGE UTILITIES * ========================================================================== */  function detectApkEnvironment(): ApkEnvironmentInfo { if (typeof window === "undefined" \vert{}\vert{} typeof navigator === "undefined") { return { isAndroid: false, isWebView: false, isStandalone: false, runtimeLabel: "Standard Runtime", viewport: "0x0", dpr: 1, cores: 4, }; }  const ua = navigator.userAgent \vert{}\vert{} ""; const isAndroid = /Android/i.test(ua); const isWebView = /\bwv\b/i.test(ua) \vert{}\vert{} /Version\/[\d.]+.*Chrome/i.test(ua) \vert{}\vert{} Boolean((window as unknown as Record<string, unknown>).Capacitor) \vert{}\vert{} Boolean((window as unknown as Record<string, unknown>).AndroidInterface); const isStandalone = window.matchMedia?.("(display-mode: standalone)").matches \vert{}\vert{} window.matchMedia?.("(display-mode: fullscreen)").matches \vert{}\vert{} Boolean((navigator as unknown as { standalone?: boolean }).standalone);  let runtimeLabel = "Mobile Web Engine"; if (isWebView) runtimeLabel = "Android APK Shell"; else if (isStandalone) runtimeLabel = "Installed App Mode"; else if (isAndroid) runtimeLabel = "Android Mobile Engine";  return { isAndroid, isWebView, isStandalone, runtimeLabel, viewport: `${window.innerWidth}×${window.innerHeight}`, dpr: Math.min(3, window.devicePixelRatio \vert{}\vert{} 1), cores: navigator.hardwareConcurrency \vert{}\vert{} 4, }; }  function triggerHaptic(pattern: HapticPattern, enabled: boolean): void { if (!enabled \vert{}\vert{} typeof navigator === "undefined" \vert{}\vert{} typeof navigator.vibrate !== "function") { return; } const map: Record<HapticPattern, number \vert{} number[]> = { light: 12, medium: 24, heavy: 42, success: [18, 45, 32], error: [45, 35, 45, 35, 65], stadium: [20, 40, 20, 40, 55], }; try { navigator.vibrate(map[pattern]); } catch { // Ignore vibration errors on restricted devices } }  class StadiumSoundEngine { private ctx: AudioContext \vert{} null = null;  private ensureContext(): AudioContext \vert{} null { if (typeof window === "undefined") return null; if (!this.ctx) { const AudioCtor = window.AudioContext \vert{}\vert{} (window as WindowWithWebkitAudio).webkitAudioContext; if (!AudioCtor) return null; this.ctx = new AudioCtor(); } if (this.ctx.state === "suspended") { this.ctx.resume().catch(() => {}); } return this.ctx; }  public play(cue: SoundCue, enabled: boolean): void { if (!enabled) return; const ctx = this.ensureContext(); if (!ctx) return;  const now = ctx.currentTime; const playTone = ( freq: number, duration: number, delay: number, type: OscillatorType, peakGain: number ) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = type; osc.frequency.setValueAtTime(freq, now + delay); gain.gain.setValueAtTime(0.0001, now + delay); gain.gain.exponentialRampToValueAtTime(peakGain, now + delay + 0.015); gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration); osc.connect(gain); gain.connect(ctx.destination); osc.start(now + delay); osc.stop(now + delay + duration + 0.02); };  if (cue === "tap") { playTone(540, 0.06, 0, "triangle", 0.05); } else if (cue === "tab") { playTone(420, 0.05, 0, "sine", 0.04); playTone(620, 0.07, 0.035, "sine", 0.045); } else if (cue === "ping") { playTone(760, 0.09, 0, "sine", 0.05); } else if (cue === "error") { playTone(190, 0.12, 0, "sawtooth", 0.06); playTone(145, 0.16, 0.11, "sawtooth", 0.06); } else if (cue === "unlock") { playTone(523.25, 0.12, 0, "triangle", 0.06); playTone(659.25, 0.12, 0.09, "triangle", 0.065); playTone(783.99, 0.16, 0.18, "triangle", 0.07); playTone(1046.5, 0.28, 0.27, "sine", 0.08); } } }  const soundEngine = new StadiumSoundEngine();  function loadPreferences(): GatePreferences { const defaults: GatePreferences = { graphics: "ultra", haptics: true, sound: true, wakeLock: false, }; if (typeof window === "undefined") return defaults; try { const raw = window.localStorage.getItem(PREFS_STORAGE_KEY); if (!raw) return defaults; const parsed = JSON.parse(raw) as Partial<GatePreferences>; return { graphics: parsed.graphics === "eco" \vert{}\vert{} parsed.graphics === "balanced" \vert{}\vert{} parsed.graphics === "ultra" ? parsed.graphics : defaults.graphics, haptics: typeof parsed.haptics === "boolean" ? parsed.haptics : defaults.haptics, sound: typeof parsed.sound === "boolean" ? parsed.sound : defaults.sound, wakeLock: typeof parsed.wakeLock === "boolean" ? parsed.wakeLock : defaults.wakeLock, }; } catch { return defaults; } }  function savePreferences(prefs: GatePreferences): void { if (typeof window === "undefined") return; try { window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs)); } catch { // Ignore storage quota errors } }  function configureNativeApkShell(): () => void { if (typeof document === "undefined" \vert{}\vert{} typeof window === "undefined") { return () => {}; }  // Ensure Android status bar matches dark stadium surface const upsertMeta = (name: string, content: string) => { let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = name;
      document.head.appendChild(tag);
    }
    tag.content = content;
  };

  upsertMeta("theme-color", "#030712");
  upsertMeta("mobile-web-app-capable", "yes");
  upsertMeta("apple-mobile-web-app-capable", "yes");
  upsertMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
  upsertMeta(
    "viewport",
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
  );

  // Prevent accidental right-click / long-press menu inside APK WebView except on text fields
  const handleContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const tag = target.tagName.toLowerCase();
    if (tag !== "input" && tag !== "textarea") {
      e.preventDefault();
    }
  };

  // Prevent accidental multi-touch pinch zoom inside APK WebView
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };

  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("touchmove", handleTouchMove, { passive: false });

  return () => {
    document.removeEventListener("contextmenu", handleContextMenu);
    document.removeEventListener("touchmove", handleTouchMove);
  };
}

/* ============================================================================
 * 6. HIGH-GRAPHICS STADIUM STYLESHEET (SELF-CONTAINED)
 * ========================================================================== */

const GATE_STYLES = `
  :root {
    --il-bg: #030712;
    --il-surface: rgba(11, 19, 38, 0.78);
    --il-surface-strong: rgba(13, 23, 46, 0.92);
    --il-border: rgba(245, 197, 66, 0.22);
    --il-border-soft: rgba(148, 163, 184, 0.16);
    --il-gold: #f5c542;
    --il-gold-bright: #ffe28a;
    --il-gold-deep: #b8860b;
    --il-cyan: #38bdf8;
    --il-emerald: #10b981;
    --il-rose: #fb7185;
    --il-text: #f8fafc;
    --il-muted: #94a3b8;
  }

  html, body {
    margin: 0;
    padding: 0;
    background-color: #030712;
    color: #f8fafc;
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    overscroll-behavior-y: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
    touch-action: manipulation;
  }

  .il-gate-root {
    position: relative;
    min-height: 100dvh;
    width: 100%;
    overflow-x: hidden;
    background:
      radial-gradient(circle at 18% 0%, rgba(245, 197, 66, 0.14), transparent 44%),
      radial-gradient(circle at 86% 4%, rgba(56, 189, 248, 0.15), transparent 42%),
      radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.10), transparent 50%),
      linear-gradient(180deg, #020611 0%, #061026 52%, #030712 100%);
    padding-top: env(safe-area-inset-top, 0px);
    padding-bottom: calc(28px + env(safe-area-inset-bottom, 0px));
    user-select: none;
    -webkit-user-select: none;
    box-sizing: border-box;
  }

  .il-gate-root * {
    box-sizing: border-box;
  }

  .il-canvas-layer {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .il-grid-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: radial-gradient(circle at 50% 25%, black 18%, transparent 82%);
    -webkit-mask-image: radial-gradient(circle at 50% 25%, black 18%, transparent 82%);
  }

  .il-container {
    position: relative;
    z-index: 2;
    max-width: 520px;
    margin: 0 auto;
    padding: 14px 16px 36px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* Top App Bar */
  .il-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 16px;
    background: rgba(7, 15, 34, 0.72);
    border: 
