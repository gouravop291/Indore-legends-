import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  Trophy,
  Users,
  Wallet,
  MessageSquare,
  Bot,
  Flame,
  RotateCcw,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Send,
  Shield,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Sparkles,
  Activity,
  Lock,
  LogOut,
  MapPin,
  Mic,
  MicOff,
  Share2,
  Shuffle,
  Coins,
  Key,
  Bell,
  Crown,
  X,
  Settings,
  Eye,
  EyeOff,
  BarChart3,
} from "lucide-react";

type TabKey = "home" | "match" | "squad" | "leaderboard" | "treasury" | "chat" | "ai" | "settings";
type WorkspaceKey = "il" | "gm";
type ThemeKey = "blue" | "gold" | "emerald";
type PlayerRole = "Batsman" | "Bowler" | "All-Rounder" | "Wicket-Keeper";
type LedgerType = "CREDIT" | "FINE" | "EXPENSE" | "ADVANCE";
type PollChoice = "IN" | "OUT" | "MAYBE";

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  isAdmin: boolean;
  isGM: boolean;
  defaultPass: string;
  adminPass?: string;
  matches: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
  finesDue: number;
  advanceCredit: number;
  funAward: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

interface ScheduledMatch {
  id: string;
  title: string;
  dateTime: string;
  overs: number;
  selectedPlayerIds: string[];
  teamAName: string;
  teamBName: string;
  teamAIds: string[];
  teamBIds: string[];
  teamACaptain: string;
  teamAViceCaptain: string;
  teamBCaptain: string;
  teamBViceCaptain: string;
  tossWinner: string;
  tossDecision: "BAT" | "BOWL" | "";
  checklist: ChecklistItem[];
}

interface InningsBatterStat {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  out: boolean;
  dismissal: string;
  retiredHurt: boolean;
}

interface InningsBowlerStat {
  name: string;
  balls: number;
  runs: number;
  wickets: number;
}

interface BallEvent {
  id: string;
  innings: 1 | 2;
  over: number;
  ballInOver: number;
  runs: number;
  isWide: boolean;
  isNoBall: boolean;
  isWicket: boolean;
  isFreeHit: boolean;
  wicketType?: string;
  batsman: string;
  bowler: string;
  timestamp: string;
}

interface LiveMatch {
  id: string;
  title: string;
  totalOvers: number;
  innings: 1 | 2;
  isSuperOver: boolean;
  battingTeam: string;
  bowlingTeam: string;
  battingPlayers: string[];
  bowlingPlayers: string[];
  teamAName: string;
  teamBName: string;
  teamAPlayers: string[];
  teamBPlayers: string[];
  firstInningsScore: number | null;
  firstInningsWickets: number | null;
  runs: number;
  wickets: number;
  balls: number;
  target: number | null;
  striker: string;
  nonStriker: string;
  bowler: string;
  freeHitActive: boolean;
  isCompleted: boolean;
  isTied: boolean;
  resultText: string;
  batters: Record<string, InningsBatterStat>;
  bowlers: Record<string, InningsBowlerStat>;
  history: BallEvent[];
  tossInfo: string;
  captainsInfo: string;
}

interface CompletedMatch {
  id: string;
  title: string;
  date: string;
  summary: string;
  winner: string;
  mvp: string;
  scorecardText: string;
}

interface TreasuryEntry {
  id: string;
  title: string;
  type: LedgerType;
  amount: number;
  memberName: string;
  date: string;
}

interface PollVote {
  playerId: string;
  playerName: string;
  choice: PollChoice;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface BotMessage {
  id: string;
  role: "user" | "bot";
  layer?: string;
  text: string;
  timestamp: string;
}

interface WorkspaceData {
  clubName: string;
  players: Player[];
  announcement: string;
  groundName: string;
  groundMapUrl: string;
  scheduledMatch: ScheduledMatch | null;
  liveMatch: LiveMatch | null;
  matchHistory: CompletedMatch[];
  treasury: TreasuryEntry[];
  poll: PollVote[];
  messages: ChatMessage[];
}

interface AppState {
  theme: ThemeKey;
  customPasswords: Record<string, string>;
  workspaces: Record<WorkspaceKey, WorkspaceData>;
}

interface AuthSession {
  playerId: string;
  isAdminSession: boolean;
}

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

const STORAGE_KEY = "indore_legends_zero_v5";
const ADMIN_PIN = "450718";
const DEFAULT_LAUNCH_TIME = "2026-11-29T15:00:00+05:30";

function makeZeroRoster(): Player[] {
  return [
    {
      id: "p1",
      name: "Gaurav Lalwani",
      role: "All-Rounder",
      isAdmin: true,
      isGM: true,
      defaultPass: "Admin-045",
      adminPass: "OQLM45",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p2",
      name: "Granth Sharma",
      role: "All-Rounder",
      isAdmin: true,
      isGM: true,
      defaultPass: "Admin-07",
      adminPass: "OQLM07",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p3",
      name: "Adhyan Upadhyay",
      role: "Batsman",
      isAdmin: false,
      isGM: false,
      defaultPass: "Adhu001",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p4",
      name: "Virat Chaudary",
      role: "Batsman",
      isAdmin: false,
      isGM: true,
      defaultPass: "Viru002",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p5",
      name: "Agam Khandelwal",
      role: "Bowler",
      isAdmin: false,
      isGM: false,
      defaultPass: "Agm003",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p6",
      name: "Aditya Rathore",
      role: "All-Rounder",
      isAdmin: false,
      isGM: true,
      defaultPass: "Abhi004",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p7",
      name: "Anuj Mishra",
      role: "Bowler",
      isAdmin: false,
      isGM: false,
      defaultPass: "Anu005",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p8",
      name: "Aadarsh Mishra",
      role: "Batsman",
      isAdmin: false,
      isGM: false,
      defaultPass: "Ada006",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p9",
      name: "Atharv Solanki",
      role: "Wicket-Keeper",
      isAdmin: false,
      isGM: true,
      defaultPass: "Aathu007",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p10",
      name: "Ashwin Gagrani",
      role: "All-Rounder",
      isAdmin: false,
      isGM: true,
      defaultPass: "Shivu008",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p11",
      name: "Rudraksh Soni",
      role: "Bowler",
      isAdmin: false,
      isGM: false,
      defaultPass: "Rudu009",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p12",
      name: "Naitik Arya",
      role: "Batsman",
      isAdmin: false,
      isGM: true,
      defaultPass: "Nai010",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p13",
      name: "Harshit Nagpal",
      role: "All-Rounder",
      isAdmin: false,
      isGM: true,
      defaultPass: "Harsh011",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
  ];
}

function createFreshState(): AppState {
  const ilPlayers = makeZeroRoster();
  const gmPlayers = makeZeroRoster().filter((p) => p.isGM);
  return {
    theme: "blue",
    customPasswords: {},
    workspaces: {
      il: {
        clubName: "INDORE LEGENDS",
        players: ilPlayers,
        announcement: "INDORE LEGENDS SEASON LAUNCH: Nov 29, 2026 at 3:00 PM IST. Fresh season starts at zero!",
        groundName: "Indore Legends Home Ground, Indore",
        groundMapUrl: "https://www.google.com/maps/search/?api=1&query=Indore+Cricket+Ground+Madhya+Pradesh",
        scheduledMatch: null,
        liveMatch: null,
        matchHistory: [],
        treasury: [],
        poll: [],
        messages: [],
      },
      gm: {
        clubName: "GANESH MANDIR CRICKET",
        players: gmPlayers,
        announcement: "GANESH MANDIR CRICKET SQUAD: 8-player private club workspace. Fresh season starts at zero!",
        groundName: "Ganesh Mandir Ground, Indore",
        groundMapUrl: "https://www.google.com/maps/search/?api=1&query=Ganesh+Mandir+Indore+Madhya+Pradesh",
        scheduledMatch: null,
        liveMatch: null,
        matchHistory: [],
        treasury: [],
        poll: [],
        messages: [],
      },
    },
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createFreshState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const fresh = createFreshState();
    if (!parsed.workspaces || !parsed.workspaces.il || !parsed.workspaces.gm) {
      return fresh;
    }
    return {
      theme: parsed.theme || "blue",
      customPasswords: parsed.customPasswords || {},
      workspaces: {
        il: { ...fresh.workspaces.il, ...parsed.workspaces.il },
        gm: { ...fresh.workspaces.gm, ...parsed.workspaces.gm },
      },
    };
  } catch {
    return createFreshState();
  }
}

function uid(prefix: string): string {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatOvers(legalBalls: number): string {
  return Math.floor(legalBalls / 6) + "." + (legalBalls % 6);
}

function playerRankScore(p: Player): number {
  return p.runs + p.wickets * 22 + p.sixes * 4;
}

function playerPhotoPath(playerId: string): string {
  return "/players/" + playerId + ".jpg";
}

function playerInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function threeDaysFromNowIso(): string {
  const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return yyyy + "-" + mm + "-" + dd + "T06:30";
}

function verifyPlayerPassword(
  player: Player,
  inputRaw: string,
  customPasswords: Record<string, string>
): { ok: boolean; asAdmin: boolean } {
  const input = inputRaw.trim();
  if (!input) return { ok: false, asAdmin: false };

  if (player.isAdmin && player.adminPass) {
    const normalizedInput = input.replace(/^0/, "O").toUpperCase();
    const normalizedAdmin = player.adminPass.replace(/^0/, "O").toUpperCase();
    if (input === player.adminPass || normalizedInput === normalizedAdmin) {
      return { ok: true, asAdmin: true };
    }
  }

  const activeNormal = customPasswords[player.id] || player.defaultPass;
  if (input === activeNormal) {
    return { ok: true, asAdmin: false };
  }

  if (!customPasswords[player.id]) {
    if (player.id === "p11" && input === "Rudu09") {
      return { ok: true, asAdmin: false };
    }
    if (input.replace(/\s+/g, "") === player.defaultPass) {
      return { ok: true, asAdmin: false };
    }
  }

  return { ok: false, asAdmin: false };
}

function splitTeamsByRanking(selected: Player[]): { teamA: Player[]; teamB: Player[] } {
  const ranked = [...selected].sort((a, b) => playerRankScore(b) - playerRankScore(a));
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  ranked.forEach((pl, idx) => {
    const cycle = idx % 4;
    if (cycle === 0 || cycle === 3) {
      teamA.push(pl);
    } else {
      teamB.push(pl);
    }
  });
  return { teamA, teamB };
}

function autoPickCaptains(team: Player[]): { captain: string; viceCaptain: string } {
  if (team.length === 0) return { captain: "TBD", viceCaptain: "TBD" };
  if (team.length === 1) return { captain: team[0].name, viceCaptain: team[0].name };
  const shuffled = [...team].sort((a, b) => {
    const scoreA = playerRankScore(a) + Math.random() * 100;
    const scoreB = playerRankScore(b) + Math.random() * 100;
    return scoreB - scoreA;
  });
  return { captain: shuffled[0].name, viceCaptain: shuffled[1].name };
}

function buildThemeCss(theme: ThemeKey): string {
  const accent =
    theme === "gold" ? "#fbbf24" : theme === "emerald" ? "#34d399" : "#38bdf8";
  const glow =
    theme === "gold"
      ? "rgba(251, 191, 36, 0.28)"
      : theme === "emerald"
      ? "rgba(52, 211, 153, 0.26)"
      : "rgba(56, 189, 248, 0.26)";
  const bgTop =
    theme === "gold" ? "#271b07" : theme === "emerald" ? "#07261f" : "#0e1d44";

  return [
    ":root { --bg: #040816; --panel: rgba(11, 19, 40, 0.92); --border: rgba(148, 163, 184, 0.22); --accent: " + accent + "; --accent-glow: " + glow + "; --gold: #fbbf24; --cyan: #38bdf8; --emerald: #34d399; --rose: #fb7185; --purple: #a78bfa; --text: #f8fafc; --muted: #94a3b8; }",
    "* { box-sizing: border-box; }",
    "html, body, #root { margin: 0; padding: 0; min-height: 100vh; background: radial-gradient(circle at top, " + bgTop + " 0%, #040816 68%); color: var(--text); font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; }",
    "@keyframes freeHitFlash { 0%, 100% { background: rgba(245, 158, 11, 0.96); color: #090d1e; box-shadow: 0 0 26px rgba(251, 191, 36, 0.9); } 50% { background: rgba(225, 29, 72, 0.96); color: #ffffff; box-shadow: 0 0 26px rgba(244, 63, 94, 0.9); } }",
    "@keyframes coinSpin { 0% { transform: rotateY(0deg) scale(1); } 50% { transform: rotateY(360deg) scale(1.15); } 100% { transform: rotateY(720deg) scale(1); } }",
    ".il-freehit-banner { animation: freeHitFlash 0.75s infinite; padding: 10px 14px; border-radius: 12px; text-align: center; font-weight: 900; letter-spacing: 0.14em; font-size: 13px; margin-bottom: 12px; text-transform: uppercase; }",
    ".il-coin-spin { animation: coinSpin 0.75s ease-in-out; }",
    ".il-shell { max-width: 980px; margin: 0 auto; padding: 12px 12px 96px 12px; }",
    ".il-gold-bar { background: linear-gradient(90deg, #92400e, #d97706, #fbbf24, #d97706, #92400e); color: #090d1e; padding: 9px 14px; border-radius: 14px; font-weight: 800; font-size: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.28); }",
    ".il-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; background: var(--panel); border: 1px solid var(--accent-glow); border-radius: 18px; margin-bottom: 12px; backdrop-filter: blur(14px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35); }",
    ".il-crest { width: 46px; height: 46px; border-radius: 14px; background: linear-gradient(135deg, #fbbf24, #d97706, #b45309); display: flex; align-items: center; justify-content: center; color: #050a18; font-weight: 900; font-size: 18px; letter-spacing: 0.04em; cursor: pointer; user-select: none; box-shadow: 0 0 20px rgba(251, 191, 36, 0.45); flex-shrink: 0; border: 2px solid rgba(254, 243, 199, 0.65); }",
    ".il-card { background: var(--panel); border: 1px solid var(--border); border-radius: 18px; padding: 16px; margin-bottom: 12px; box-shadow: 0 14px 34px rgba(0, 0, 0, 0.38); }",
    ".il-hero-card { background: linear-gradient(135deg, rgba(29, 78, 216, 0.28), rgba(11, 19, 40, 0.96), rgba(217, 119, 6, 0.24)); border: 1px solid rgba(251, 191, 36, 0.45); }",
    ".il-fut-card { background: linear-gradient(160deg, rgba(15, 29, 68, 0.96) 0%, rgba(6, 12, 29, 0.98) 100%); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 18px; overflow: hidden; box-shadow: 0 14px 34px rgba(0, 0, 0, 0.45); display: flex; flex-direction: column; }",
    ".il-fut-photo-wrap { position: relative; width: 100%; height: 185px; background: radial-gradient(circle at top, #1d4ed8 0%, #09132c 70%); overflow: hidden; cursor: pointer; }",
    ".il-fut-fade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(6, 12, 29, 0.98) 6%, rgba(6, 12, 29, 0.3) 50%, rgba(6, 12, 29, 0.08) 100%); pointer-events: none; }",
    ".il-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }",
    ".il-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }",
    ".il-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }",
    "@media (max-width: 640px) { .il-resp-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } .il-resp-1 { grid-template-columns: 1fr; } }",
    ".il-btn { border: 1px solid var(--border); background: rgba(30, 41, 59, 0.85); color: #f8fafc; border-radius: 12px; padding: 10px 13px; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: transform 0.08s ease, opacity 0.15s ease; }",
    ".il-btn:active { transform: scale(0.97); }",
    ".il-btn:disabled { opacity: 0.42; cursor: not-allowed; }",
    ".il-btn-primary { background: linear-gradient(135deg, #0284c7, #2563eb); border-color: rgba(56, 189, 248, 0.55); }",
    ".il-btn-gold { background: linear-gradient(135deg, #d97706, #fbbf24); color: #080d1d; border-color: rgba(254, 243, 199, 0.6); }",
    ".il-btn-emerald { background: rgba(16, 185, 129, 0.22); border-color: rgba(52, 211, 153, 0.55); color: #6ee7b7; }",
    ".il-btn-danger { background: linear-gradient(135deg, #be123c, #e11d48); border-color: rgba(251, 113, 133, 0.6); color: #ffffff; }",
    ".il-btn-purple { background: rgba(139, 92, 246, 0.24); border-color: rgba(167, 139, 250, 0.55); color: #ddd6fe; }",
    ".il-input, .il-select { width: 100%; padding: 11px 13px; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.28); background: rgba(2, 6, 23, 0.86); color: #f8fafc; font-size: 14px; outline: none; }",
    ".il-input:focus, .il-select:focus { border-color: var(--accent); }",
    ".il-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }",
    ".il-ball { width: 34px; height: 34px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; border: 1px solid var(--border); flex-shrink: 0; }",
    ".il-nav { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; background: rgba(2, 6, 23, 0.96); border-top: 1px solid var(--accent-glow); backdrop-filter: blur(14px); display: flex; justify-content: center; padding: 7px 4px; }",
    ".il-nav-inner { width: 100%; max-width: 980px; display: flex; justify-content: space-around; gap: 2px; overflow-x: auto; }",
    ".il-nav-item { flex: 1; min-width: 48px; background: transparent; border: none; color: var(--muted); display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 2px; border-radius: 10px; font-size: 10px; font-weight: 700; cursor: pointer; }",
    ".il-nav-item.active { color: var(--gold); background: rgba(251, 191, 36, 0.14); }",
    ".il-modal-backdrop { position: fixed; inset: 0; z-index: 80; background: rgba(2, 6, 23, 0.86); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 16px; }",
    ".il-modal { width: 100%; max-width: 440px; background: #0a1228; border: 1px solid rgba(251, 191, 36, 0.45); border-radius: 20px; padding: 20px; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.72); overflow: hidden; }",
    ".il-scroll-box { max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 9px; padding-right: 4px; }",
    ".il-orb { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: transform 0.12s ease; }",
    ".il-orb.selected { border-color: #ffffff; transform: scale(1.12); }",
  ].join("\n");
}

function PlayerAvatar({
  playerId,
  name,
  size,
  rounded,
  borderColor,
}: {
  playerId: string;
  name: string;
  size: number;
  rounded?: boolean;
  borderColor?: string;
}) {
  const [failed, setFailed] = useState<boolean>(false);

  useEffect(() => {
    setFailed(false);
  }, [playerId]);

  const radius = rounded ? "50%" : "14px";
  const border = "2px solid " + (borderColor || "rgba(251, 191, 36, 0.65)");

  if (failed) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: "linear-gradient(135deg, #1d4ed8, #0f172a)",
          border,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: Math.max(12, Math.round(size * 0.34)),
          color: "#fde68a",
          flexShrink: 0,
        }}
      >
        {playerInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={playerPhotoPath(playerId)}
      alt={name}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        objectFit: "cover",
        objectPosition: "top center",
        border,
        background: "#0f172a",
        flexShrink: 0,
        display: "block",
      }}
    />
  );
}

function PlayerPortraitBanner({
  playerId,
  name,
  height,
}: {
  playerId: string;
  name: string;
  height: number;
}) {
  const [failed, setFailed] = useState<boolean>(false);

  useEffect(() => {
    setFailed(false);
  }, [playerId]);

  if (failed) {
    return (
      <div
        style={{
          width: "100%",
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at top, #1d4ed8 0%, #09132c 75%)",
          fontSize: 44,
          fontWeight: 900,
          color: "rgba(253, 230, 138, 0.85)",
          letterSpacing: "0.06em",
        }}
      >
        {playerInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={playerPhotoPath(playerId)}
      alt={name}
      onError={() => setFailed(true)}
      style={{
        width: "100%",
        height,
        objectFit: "cover",
        objectPosition: "top center",
        display: "block",
      }}
    />
  );
}

function DonutPieChart({ slices, centerLabel }: { slices: PieSlice[]; centerLabel: string }) {
  const total = slices.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
      <svg width="148" height="148" viewBox="0 0 148 148">
        <circle cx="74" cy="74" r={radius} fill="none" stroke="rgba(148,163,184,0.16)" strokeWidth="20" />
        {total > 0 &&
          slices.map((slice) => {
            const val = Math.max(0, slice.value);
            if (val === 0) return null;
            const fraction = val / total;
            const dash = fraction * circumference;
            const offset = -cumulative * circumference;
            cumulative += fraction;
            return (
              <circle
                key={slice.label}
                cx="74"
                cy="74"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="20"
                strokeDasharray={dash + " " + circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 74 74)"
              />
            );
          })}
        <text x="74" y="70" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
          BALANCE
        </text>
        <text x="74" y="88" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900">
          {centerLabel}
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 165 }}>
        {slices.map((s) => {
          const pct = total > 0 ? Math.round((Math.max(0, s.value) / total) * 100) : 0;
          return (
            <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                {s.label}
              </span>
              <strong>
                Rs.{s.value} ({pct}%)
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [session, setSession] = useState<AuthSession | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceKey>("il");
  const [gmUnlocked, setGmUnlocked] = useState<boolean>(false);
  const [tab, setTab] = useState<TabKey>("home");

  const [loginPlayerId, setLoginPlayerId] = useState<string>("p1");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [showLoginPass, setShowLoginPass] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  const [showDuePopup, setShowDuePopup] = useState<boolean>(false);
  const [newNormalPass, setNewNormalPass] = useState<string>("");
  const [passNotice, setPassNotice] = useState<string>("");

  const [pinModalTitle, setPinModalTitle] = useState<string>("");
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const pendingAdminActionRef = useRef<(() => void) | null>(null);

  const [showGmLoginModal, setShowGmLoginModal] = useState<boolean>(false);
  const [gmLoginId, setGmLoginId] = useState<string>("p1");
  const [gmLoginPass, setGmLoginPass] = useState<string>("");
  const [gmLoginErr, setGmLoginErr] = useState<string>("");
  const crestTapCountRef = useRef<number>(0);
  const crestTapTimerRef = useRef<number | null>(null);

  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const [announcementDraft, setAnnouncementDraft] = useState<string>("");
  const [groundNameDraft, setGroundNameDraft] = useState<string>("");
  const [groundUrlDraft, setGroundUrlDraft] = useState<string>("");
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string>("");

  const [showCreateWizard, setShowCreateWizard] = useState<boolean>(false);
  const [wizTitle, setWizTitle] = useState<string>("Squad Practice Clash");
  const [wizDateTime, setWizDateTime] = useState<string>(() => threeDaysFromNowIso());
  const [wizOvers, setWizOvers] = useState<number>(10);
  const [wizTeamAName, setWizTeamAName] = useState<string>("Legends XI");
  const [wizTeamBName, setWizTeamBName] = useState<string>("Strikers XI");
  const [wizSelectedIds, setWizSelectedIds] = useState<string[]>([]);
  const [newChecklistLabel, setNewChecklistLabel] = useState<string>("");

  const [coinFlipping, setCoinFlipping] = useState<boolean>(false);
  const [coinResult, setCoinResult] = useState<string>("");

  const [wicketType, setWicketType] = useState<string>("Bowled");
  const [umpireBanner, setUmpireBanner] = useState<string>("");
  const [milestonePopup, setMilestonePopup] = useState<string>("");
  const [showSwapBowler, setShowSwapBowler] = useState<boolean>(false);
  const [swapBowlerName, setSwapBowlerName] = useState<string>("");

  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [editPlayerId, setEditPlayerId] = useState<string>("");
  const [editAwardText, setEditAwardText] = useState<string>("");
  const [leaderTab, setLeaderTab] = useState<"team" | "batting" | "bowling">("team");

  const [trTitle, setTrTitle] = useState<string>("");
  const [trType, setTrType] = useState<LedgerType>("CREDIT");
  const [trAmount, setTrAmount] = useState<string>("");
  const [trMember, setTrMember] = useState<string>("All Squad");

  const [chatText, setChatText] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [voiceOutput, setVoiceOutput] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [aiInput, setAiInput] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<BotMessage[]>([
    {
      id: "bot_init",
      role: "bot",
      layer: "LegendBot Cricket AI",
      text: "Namaste! Ask me about the active club workspace (live score, Orange/Purple Cap, funds, poll) or any IPL and International cricket question.",
      timestamp: nowTime(),
    },
  ]);
  const aiEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const ws = state.workspaces[workspace];
  const allIlPlayers = state.workspaces.il.players;

  useEffect(() => {
    setAnnouncementDraft(ws.announcement);
    setGroundNameDraft(ws.groundName);
    setGroundUrlDraft(ws.groundMapUrl);
    setWizSelectedIds(ws.players.slice(0, Math.min(8, ws.players.length)).map((p) => p.id));
  }, [workspace, ws.announcement, ws.groundName, ws.groundMapUrl]);

  useEffect(() => {
    if (tab === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (tab === "ai") aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tab, ws.messages.length, aiMessages.length]);

  const updateWorkspace = (updater: (prevWs: WorkspaceData) => WorkspaceData) => {
    setState((prev) => ({
      ...prev,
      workspaces: {
        ...prev.workspaces,
        [workspace]: updater(prev.workspaces[workspace]),
      },
    }));
  };

  const authPlayer = session
    ? allIlPlayers.find((p) => p.id === session.playerId) || null
    : null;
  const activeUserInWs = session
    ? ws.players.find((p) => p.id === session.playerId) || authPlayer
    : null;
  const isAdmin = Boolean(session?.isAdminSession && authPlayer?.isAdmin);

  const orangeCapHolder = [...ws.players].sort((a, b) => b.runs - a.runs)[0];
  const purpleCapHolder = [...ws.players].sort((a, b) => b.wickets - a.wickets)[0];

  const totalCredits = ws.treasury
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalFines = ws.treasury
    .filter((t) => t.type === "FINE")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = ws.treasury
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalAdvances = ws.treasury
    .filter((t) => t.type === "ADVANCE")
    .reduce((sum, t) => sum + t.amount, 0);
  const clubNetBalance = totalCredits + totalFines + totalAdvances - totalExpenses;

  const countdownTargetMs = (() => {
    if (ws.scheduledMatch && ws.scheduledMatch.dateTime) {
      const parsed = new Date(ws.scheduledMatch.dateTime).getTime();
      if (!Number.isNaN(parsed) && parsed > nowMs) return parsed;
    }
    return new Date(DEFAULT_LAUNCH_TIME).getTime();
  })();
  const countdownDiff = Math.max(0, countdownTargetMs - nowMs);
  const cdSec = Math.floor(countdownDiff / 1000);
  const cdDays = String(Math.floor(cdSec / 86400)).padStart(2, "0");
  const cdHours = String(Math.floor((cdSec % 86400) / 3600)).padStart(2, "0");
  const cdMins = String(Math.floor((cdSec % 3600) / 60)).padStart(2, "0");
  const cdSecs = String(cdSec % 60).padStart(2, "0");

  const speak = (text: string) => {
    if (!voiceOutput) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "en-IN";
        u.rate = 1.05;
        window.speechSynthesis.speak(u);
      } catch {
        // Ignore TTS failure
      }
    }
  };

  const requireAdminPin = (title: string, action: () => void) => {
    if (!isAdmin) return;
    pendingAdminActionRef.current = action;
    setPinModalTitle(title);
    setPinInput("");
    setPinError("");
  };

  const submitAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() !== ADMIN_PIN) {
      setPinError("Incorrect Admin PIN.");
      return;
    }
    const fn = pendingAdminActionRef.current;
    pendingAdminActionRef.current = null;
    setPinModalTitle("");
    setPinInput("");
    setPinError("");
    if (fn) fn();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const player = allIlPlayers.find((p) => p.id === loginPlayerId);
    if (!player) {
      setLoginError("Incorrect password. Please try again.");
      return;
    }
    const check = verifyPlayerPassword(player, loginPassword, state.customPasswords);
    if (!check.ok) {
      setLoginError("Incorrect password. Please try again.");
      return;
    }
    setSession({ playerId: player.id, isAdminSession: check.asAdmin });
    setWorkspace("il");
    setLoginPassword("");
    setLoginError("");
    setTab("home");
    if (player.finesDue > 0) {
      setShowDuePopup(true);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setGmUnlocked(false);
    setWorkspace("il");
    setShowDuePopup(false);
    setTab("home");
  };

  const handleChangeNormalPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPlayer) return;
    const trimmed = newNormalPass.trim();
    if (trimmed.length < 4) {
      setPassNotice("Password must be at least 4 characters.");
      return;
    }
    setState((prev) => ({
      ...prev,
      customPasswords: {
        ...prev.customPasswords,
        [authPlayer.id]: trimmed,
      },
    }));
    setNewNormalPass("");
    setPassNotice("Normal password updated.");
  };

  const openGmUnlockPrompt = () => {
    if (gmUnlocked) {
      setWorkspace((prev) => (prev === "il" ? "gm" : "il"));
      return;
    }
    const gmPlayers = allIlPlayers.filter((p) => p.isGM);
    if (authPlayer?.isGM) {
      setGmLoginId(authPlayer.id);
    } else if (gmPlayers[0]) {
      setGmLoginId(gmPlayers[0].id);
    }
    setGmLoginPass("");
    setGmLoginErr("");
    setShowGmLoginModal(true);
  };

  const handleCrestTap = () => {
    crestTapCountRef.current += 1;
    if (crestTapTimerRef.current !== null) {
      window.clearTimeout(crestTapTimerRef.current);
    }
    if (crestTapCountRef.current >= 3) {
      crestTapCountRef.current = 0;
      openGmUnlockPrompt();
      return;
    }
    crestTapTimerRef.current = window.setTimeout(() => {
      crestTapCountRef.current = 0;
    }, 800);
  };

  const handleGmUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const player = allIlPlayers.find((p) => p.id === gmLoginId && p.isGM);
    if (!player) {
      setGmLoginErr("Incorrect password. Please try again.");
      return;
    }
    const check = verifyPlayerPassword(player, gmLoginPass, state.customPasswords);
    if (!check.ok) {
      setGmLoginErr("Incorrect password. Please try again.");
      return;
    }
    setGmUnlocked(true);
    setWorkspace("gm");
    setShowGmLoginModal(false);
    setGmLoginPass("");
    setGmLoginErr("");
    setTab("home");
  };

  const handleVotePoll = (choice: PollChoice) => {
    if (!activeUserInWs) return;
    updateWorkspace((prevWs) => {
      const others = prevWs.poll.filter((v) => v.playerId !== activeUserInWs.id);
      return {
        ...prevWs,
        poll: [...others, { playerId: activeUserInWs.id, playerName: activeUserInWs.name, choice }],
      };
    });
  };

  const flipCoin = () => {
    setCoinFlipping(true);
    window.setTimeout(() => {
      const side = Math.random() < 0.5 ? "HEADS" : "TAILS";
      setCoinResult(side);
      if (ws.scheduledMatch) {
        const winner =
          Math.random() < 0.5
            ? ws.scheduledMatch.teamAName
            : ws.scheduledMatch.teamBName;
        updateWorkspace((prevWs) =>
          prevWs.scheduledMatch
            ? { ...prevWs, scheduledMatch: { ...prevWs.scheduledMatch, tossWinner: winner } }
            : prevWs
        );
      }
      setCoinFlipping(false);
    }, 750);
  };

  const createScheduledMatch = () => {
    const selected = ws.players.filter((p) => wizSelectedIds.includes(p.id));
    if (selected.length < 4) return;
    const { teamA, teamB } = splitTeamsByRanking(selected);
    const capA = autoPickCaptains(teamA);
    const capB = autoPickCaptains(teamB);

    const scheduled: ScheduledMatch = {
      id: uid("sch"),
      title: wizTitle.trim() || ws.clubName + " Match",
      dateTime: wizDateTime || threeDaysFromNowIso(),
      overs: Math.max(1, Math.min(50, wizOvers || 10)),
      selectedPlayerIds: selected.map((p) => p.id),
      teamAName: wizTeamAName.trim() || "Team A",
      teamBName: wizTeamBName.trim() || "Team B",
      teamAIds: teamA.map((p) => p.id),
      teamBIds: teamB.map((p) => p.id),
      teamACaptain: capA.captain,
      teamAViceCaptain: capA.viceCaptain,
      teamBCaptain: capB.captain,
      teamBViceCaptain: capB.viceCaptain,
      tossWinner: "",
      tossDecision: "",
      checklist: [
        { id: "c1", label: "Wind Balls Ready", done: false },
        { id: "c2", label: "Bats and Grips Checked", done: false },
        { id: "c3", label: "Stumps and Bails Packed", done: false },
        { id: "c4", label: "Water Bottles Ready", done: false },
      ],
    };

    updateWorkspace((prevWs) => ({ ...prevWs, scheduledMatch: scheduled }));
    setShowCreateWizard(false);
    setCoinResult("");
  };

  const swapPlayerTeam = (playerId: string) => {
    updateWorkspace((prevWs) => {
      const sch = prevWs.scheduledMatch;
      if (!sch) return prevWs;
      const inA = sch.teamAIds.includes(playerId);
      const nextA = inA
        ? sch.teamAIds.filter((id) => id !== playerId)
        : [...sch.teamAIds, playerId];
      const nextB = inA
        ? [...sch.teamBIds, playerId]
        : sch.teamBIds.filter((id) => id !== playerId);
      if (nextA.length === 0 || nextB.length === 0) return prevWs;
      const capA = autoPickCaptains(prevWs.players.filter((p) => nextA.includes(p.id)));
      const capB = autoPickCaptains(prevWs.players.filter((p) => nextB.includes(p.id)));
      return {
        ...prevWs,
        scheduledMatch: {
          ...sch,
          teamAIds: nextA,
          teamBIds: nextB,
          teamACaptain: capA.captain,
          teamAViceCaptain: capA.viceCaptain,
          teamBCaptain: capB.captain,
          teamBViceCaptain: capB.viceCaptain,
        },
      };
    });
  };

  const reRollScheduledTeams = () => {
    updateWorkspace((prevWs) => {
      const sch = prevWs.scheduledMatch;
      if (!sch) return prevWs;
      const selected = prevWs.players.filter((p) => sch.selectedPlayerIds.includes(p.id));
      const { teamA, teamB } = splitTeamsByRanking(selected);
      const capA = autoPickCaptains(teamA);
      const capB = autoPickCaptains(teamB);
      return {
        ...prevWs,
        scheduledMatch: {
          ...sch,
          teamAIds: teamA.map((p) => p.id),
          teamBIds: teamB.map((p) => p.id),
          teamACaptain: capA.captain,
          teamAViceCaptain: capA.viceCaptain,
          teamBCaptain: capB.captain,
          teamBViceCaptain: capB.viceCaptain,
        },
      };
    });
  };

  const startLiveMatchFromScheduled = () => {
    const sch = ws.scheduledMatch;
    if (!sch) return;
    const teamAPlayers = ws.players.filter((p) => sch.teamAIds.includes(p.id)).map((p) => p.name);
    const teamBPlayers = ws.players.filter((p) => sch.teamBIds.includes(p.id)).map((p) => p.name);

    const aBatsFirst =
      !sch.tossWinner ||
      (sch.tossWinner === sch.teamAName && sch.tossDecision !== "BOWL") ||
      (sch.tossWinner === sch.teamBName && sch.tossDecision === "BOWL");

    const battingTeam = aBatsFirst ? sch.teamAName : sch.teamBName;
    const bowlingTeam = aBatsFirst ? sch.teamBName : sch.teamAName;
    const battingPlayers = aBatsFirst ? teamAPlayers : teamBPlayers;
    const bowlingPlayers = aBatsFirst ? teamBPlayers : teamAPlayers;

    const initBatters: Record<string, InningsBatterStat> = {};
    battingPlayers.forEach((name) => {
      initBatters[name] = {
        name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        out: false,
        dismissal: "",
        retiredHurt: false,
      };
    });

    const initBowlers: Record<string, InningsBowlerStat> = {};
    bowlingPlayers.forEach((name) => {
      initBowlers[name] = { name, balls: 0, runs: 0, wickets: 0 };
    });

    const live: LiveMatch = {
      id: uid("live"),
      title: sch.title,
      totalOvers: sch.overs,
      innings: 1,
      isSuperOver: false,
      battingTeam,
      bowlingTeam,
      battingPlayers,
      bowlingPlayers,
      teamAName: sch.teamAName,
      teamBName: sch.teamBName,
      teamAPlayers,
      teamBPlayers,
      firstInningsScore: null,
      firstInningsWickets: null,
      runs: 0,
      wickets: 0,
      balls: 0,
      target: null,
      striker: battingPlayers[0] || "Batter 1",
      nonStriker: battingPlayers[1] || "Batter 2",
      bowler: bowlingPlayers[0] || "Bowler 1",
      freeHitActive: false,
      isCompleted: false,
      isTied: false,
      resultText: "",
      batters: initBatters,
      bowlers: initBowlers,
      history: [],
      tossInfo: sch.tossWinner
        ? sch.tossWinner + " won toss and chose to " + (sch.tossDecision || "BAT")
        : "Toss skipped",
      captainsInfo:
        sch.teamAName +
        " (C: " +
        sch.teamACaptain +
        ", VC: " +
        sch.teamAViceCaptain +
        ") vs " +
        sch.teamBName +
        " (C: " +
        sch.teamBCaptain +
        ", VC: " +
        sch.teamBViceCaptain +
        ")",
    };

    updateWorkspace((prevWs) => ({ ...prevWs, liveMatch: live }));
    setUmpireBanner("PLAY! Innings 1 underway.");
    speak("Match started!");
  };

  const computeLiveMvp = (m: LiveMatch): string => {
    const points: Record<string, number> = {};
    Object.values(m.batters).forEach((b) => {
      points[b.name] = (points[b.name] || 0) + b.runs + b.fours * 2 + b.sixes * 4;
    });
    Object.values(m.bowlers).forEach((bw) => {
      points[bw.name] = (points[bw.name] || 0) + bw.wickets * 25;
    });
    let bestName = "TBD";
    let bestPts = -1;
    Object.entries(points).forEach(([name, pts]) => {
      if (pts > bestPts) {
        bestPts = pts;
        bestName = name;
      }
    });
    return bestPts > 0 ? bestName + " (" + bestPts + " pts)" : "TBD";
  };

  const buildWhatsappScorecard = (m: LiveMatch): string => {
    const topBat = Object.values(m.batters)
      .filter((b) => b.balls > 0 || b.out)
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 4)
      .map(
        (b) =>
          "- " + b.name + ": " + b.runs + "(" + b.balls + ") [4s:" + b.fours + ", 6s:" + b.sixes + "]"
      )
      .join("\n");

    const topBowl = Object.values(m.bowlers)
      .filter((b) => b.balls > 0)
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 3)
      .map((b) => "- " + b.name + ": " + b.wickets + "/" + b.runs + " (" + formatOvers(b.balls) + " ov)")
      .join("\n");

    const firstInn =
      m.firstInningsScore !== null
        ? "1st Innings: " + m.bowlingTeam + " " + m.firstInningsScore + "/" + (m.firstInningsWickets ?? 0) + "\n"
        : "";

    return (
      ws.clubName +
      " SCORECARD\n" +
      m.title +
      " (" +
      (m.isSuperOver ? "SUPER OVER" : m.totalOvers + " Overs") +
      ")\n" +
      m.tossInfo +
      "\n" +
      firstInn +
      m.battingTeam +
      ": " +
      m.runs +
      "/" +
      m.wickets +
      " (" +
      formatOvers(m.balls) +
      "/" +
      m.totalOvers +
      " ov)\n" +
      (m.resultText ? "Result: " + m.resultText + "\n" : "") +
      "MVP: " +
      computeLiveMvp(m) +
      "\n\nTop Batters:\n" +
      (topBat || "None yet") +
      "\n\nTop Bowlers:\n" +
      (topBowl || "None yet")
    );
  };

  const recordLiveBall = (
    runsScored: number,
    options?: { isWide?: boolean; isNoBall?: boolean; isWicket?: boolean }
  ) => {
    const m = ws.liveMatch;
    if (!m || m.isCompleted) return;

    const isWide = Boolean(options?.isWide);
    const isNoBall = Boolean(options?.isNoBall);
    const isWicket = Boolean(options?.isWicket);

    if (isWicket && m.freeHitActive && wicketType !== "Run Out") {
      setUmpireBanner("FREE HIT! Only Run Out allowed!");
      speak("Not out! Free Hit!");
      return;
    }

    const isLegal = !isWide && !isNoBall;
    const extraRun = isWide || isNoBall ? 1 : 0;
    const totalBallRuns = runsScored + extraRun;
    const maxBalls = m.totalOvers * 6;
    const maxWickets = Math.max(1, m.battingPlayers.length - 1);

    const nextRuns = m.runs + totalBallRuns;
    const nextWickets = isWicket ? m.wickets + 1 : m.wickets;
    const nextBalls = isLegal ? m.balls + 1 : m.balls;
    const nextFreeHit = isNoBall ? true : isLegal ? false : m.freeHitActive;

    const updatedBatters = { ...m.batters };
    const prevStriker = updatedBatters[m.striker] || {
      name: m.striker,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      out: false,
      dismissal: "",
      retiredHurt: false,
    };
    const batterRunsAdded = isWide ? 0 : runsScored;
    const newBatterRuns = prevStriker.runs + batterRunsAdded;

    updatedBatters[m.striker] = {
      ...prevStriker,
      runs: newBatterRuns,
      balls: isLegal ? prevStriker.balls + 1 : prevStriker.balls,
      fours: !isWide && runsScored === 4 ? prevStriker.fours + 1 : prevStriker.fours,
      sixes: !isWide && runsScored === 6 ? prevStriker.sixes + 1 : prevStriker.sixes,
      out: isWicket ? true : prevStriker.out,
      dismissal: isWicket ? wicketType + " b " + m.bowler : prevStriker.dismissal,
    };

    const updatedBowlers = { ...m.bowlers };
    const prevBowler = updatedBowlers[m.bowler] || {
      name: m.bowler,
      balls: 0,
      runs: 0,
      wickets: 0,
    };
    const newBowlerWickets =
      isWicket && wicketType !== "Run Out" ? prevBowler.wickets + 1 : prevBowler.wickets;

    updatedBowlers[m.bowler] = {
      ...prevBowler,
      balls: isLegal ? prevBowler.balls + 1 : prevBowler.balls,
      runs: prevBowler.runs + totalBallRuns,
      wickets: newBowlerWickets,
    };

    const event: BallEvent = {
      id: uid("ball"),
      innings: m.innings,
      over: Math.floor(m.balls / 6),
      ballInOver: (m.balls % 6) + 1,
      runs: totalBallRuns,
      isWide,
      isNoBall,
      isWicket,
      isFreeHit: m.freeHitActive,
      wicketType: isWicket ? wicketType : undefined,
      batsman: m.striker,
      bowler: m.bowler,
      timestamp: nowTime(),
    };
    const nextHistory = [event, ...m.history];

    if (prevStriker.runs < 100 && newBatterRuns >= 100) {
      setMilestonePopup("CENTURY! " + m.striker + " reaches 100 runs!");
      speak("Century for " + m.striker);
    } else if (prevStriker.runs < 50 && newBatterRuns >= 50) {
      setMilestonePopup("HALF-CENTURY! " + m.striker + " reaches 50 runs!");
      speak("Fifty for " + m.striker);
    } else if (isWicket && wicketType !== "Run Out") {
      const last3 = nextHistory
        .filter((e) => e.innings === m.innings && e.bowler === m.bowler && !e.isWide && !e.isNoBall)
        .slice(0, 3);
      if (last3.length === 3 && last3.every((e) => e.isWicket)) {
        setMilestonePopup("HAT-TRICK! " + m.bowler + " takes 3 in 3!");
      } else if (newBowlerWickets === 5) {
        setMilestonePopup("5-WICKET HAUL! " + m.bowler + " takes 5 wickets!");
      } else if (newBowlerWickets === 3) {
        setMilestonePopup("3-WICKET HAUL! " + m.bowler + " is on fire!");
      }
    }

    let nextStriker = m.striker;
    let nextNonStriker = m.nonStriker;
    if (isWicket) {
      const nextAvailable = m.battingPlayers.find(
        (name) =>
          name !== nextNonStriker &&
          name !== m.striker &&
          !updatedBatters[name]?.out &&
          !updatedBatters[name]?.retiredHurt
      );
      if (nextAvailable) nextStriker = nextAvailable;
    } else if (runsScored % 2 === 1) {
      const temp = nextStriker;
      nextStriker = nextNonStriker;
      nextNonStriker = temp;
    }

    if (isLegal && nextBalls % 6 === 0) {
      const temp = nextStriker;
      nextStriker = nextNonStriker;
      nextNonStriker = temp;
    }

    const targetReached = m.innings === 2 && m.target !== null && nextRuns >= m.target;
    const inningsEnded = nextBalls >= maxBalls || nextWickets >= maxWickets || targetReached;

    let isCompleted = false;
    let isTied = false;
    let resultText = m.resultText;

    if (inningsEnded && m.innings === 2 && m.target !== null) {
      isCompleted = true;
      if (nextRuns >= m.target) {
        const wktsLeft = Math.max(1, maxWickets - nextWickets);
        resultText = m.battingTeam + " won by " + wktsLeft + " wicket(s)!";
      } else if (nextRuns === m.target - 1) {
        isTied = true;
        resultText = "MATCH TIED! Ready for Super Over!";
      } else {
        const margin = m.target - 1 - nextRuns;
        resultText = m.bowlingTeam + " won by " + margin + " run(s)!";
      }
    }

    if (isNoBall) {
      setUmpireBanner("NO BALL! FREE HIT NEXT!");
      speak("No ball! Free hit!");
    } else if (isWide) {
      setUmpireBanner("WIDE BALL (+1)");
      speak("Wide ball!");
    } else if (isWicket) {
      setUmpireBanner("OUT! " + wicketType + "!");
      speak("Out! " + wicketType);
    } else if (runsScored === 6) {
      setUmpireBanner("MAXIMUM SIX!");
      speak("Six runs!");
    } else if (runsScored === 4) {
      setUmpireBanner("CRACKING FOUR!");
      speak("Four runs!");
    }

    updateWorkspace((prevWs) => ({
      ...prevWs,
      liveMatch: {
        ...m,
        runs: nextRuns,
        wickets: nextWickets,
        balls: nextBalls,
        striker: nextStriker,
        nonStriker: nextNonStriker,
        freeHitActive: nextFreeHit,
        isCompleted,
        isTied,
        resultText,
        batters: updatedBatters,
        bowlers: updatedBowlers,
        history: nextHistory,
      },
    }));
  };

  const startSecondInnings = () => {
    const m = ws.liveMatch;
    if (!m || m.innings !== 1) return;
    const newBattingTeam = m.bowlingTeam;
    const newBowlingTeam = m.battingTeam;
    const newBattingPlayers = m.bowlingPlayers;
    const newBowlingPlayers = m.battingPlayers;

    const initBatters: Record<string, InningsBatterStat> = {};
    newBattingPlayers.forEach((name) => {
      initBatters[name] = {
        name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        out: false,
        dismissal: "",
        retiredHurt: false,
      };
    });

    const initBowlers: Record<string, InningsBowlerStat> = {};
    newBowlingPlayers.forEach((name) => {
      initBowlers[name] = { name, balls: 0, runs: 0, wickets: 0 };
    });

    updateWorkspace((prevWs) => ({
      ...prevWs,
      liveMatch: {
        ...m,
        innings: 2,
        battingTeam: newBattingTeam,
        bowlingTeam: newBowlingTeam,
        battingPlayers: newBattingPlayers,
        bowlingPlayers: newBowlingPlayers,
        firstInningsScore: m.runs,
        firstInningsWickets: m.wickets,
        target: m.runs + 1,
        runs: 0,
        wickets: 0,
        balls: 0,
        striker: newBattingPlayers[0] || "Batter 1",
        nonStriker: newBattingPlayers[1] || "Batter 2",
        bowler: newBowlingPlayers[0] || "Bowler 1",
        freeHitActive: false,
        isCompleted: false,
        isTied: false,
        batters: initBatters,
        bowlers: initBowlers,
      },
    }));
    setUmpireBanner("2nd Innings! Target is " + (m.runs + 1));
  };

  const launchSuperOver = () => {
    const m = ws.liveMatch;
    if (!m) return;
    const initBatters: Record<string, InningsBatterStat> = {};
    m.teamAPlayers.forEach((name) => {
      initBatters[name] = {
        name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        out: false,
        dismissal: "",
        retiredHurt: false,
      };
    });
    const initBowlers: Record<string, InningsBowlerStat> = {};
    m.teamBPlayers.forEach((name) => {
      initBowlers[name] = { name, balls: 0, runs: 0, wickets: 0 };
    });

    updateWorkspace((prevWs) => ({
      ...prevWs,
      liveMatch: {
        ...m,
        title: m.title + " - SUPER OVER",
        totalOvers: 1,
        innings: 1,
        isSuperOver: true,
        battingTeam: m.teamAName,
        bowlingTeam: m.teamBName,
        battingPlayers: m.teamAPlayers,
        bowlingPlayers: m.teamBPlayers,
        firstInningsScore: null,
        firstInningsWickets: null,
        runs: 0,
        wickets: 0,
        balls: 0,
        target: null,
        striker: m.teamAPlayers[0] || "Batter 1",
        nonStriker: m.teamAPlayers[1] || "Batter 2",
        bowler: m.teamBPlayers[0] || "Bowler 1",
        freeHitActive: false,
        isCompleted: false,
        isTied: false,
        resultText: "",
        batters: initBatters,
        bowlers: initBowlers,
        history: [],
      },
    }));
    setMilestonePopup("SUPER OVER LIVE! 6 Balls - 2 Wickets Max!");
  };

  const handleRetiredHurt = () => {
    const m = ws.liveMatch;
    if (!m || m.isCompleted) return;
    const nextBatter = m.battingPlayers.find(
      (name) =>
        name !== m.striker &&
        name !== m.nonStriker &&
        !m.batters[name]?.out &&
        !m.batters[name]?.retiredHurt
    );
    if (!nextBatter) {
      setUmpireBanner("No replacement batter available.");
      return;
    }
    updateWorkspace((prevWs) => {
      if (!prevWs.liveMatch) return prevWs;
      const batters = { ...prevWs.liveMatch.batters };
      if (batters[m.striker]) {
        batters[m.striker] = { ...batters[m.striker], retiredHurt: true };
      }
      return {
        ...prevWs,
        liveMatch: { ...prevWs.liveMatch, striker: nextBatter, batters },
      };
    });
    setUmpireBanner(m.striker + " Retired Hurt. " + nextBatter + " walks in.");
  };

  const handleMidOverSwap = () => {
    const m = ws.liveMatch;
    if (!m || !swapBowlerName) return;
    updateWorkspace((prevWs) =>
      prevWs.liveMatch
        ? { ...prevWs, liveMatch: { ...prevWs.liveMatch, bowler: swapBowlerName } }
        : prevWs
    );
    setShowSwapBowler(false);
    setUmpireBanner("Mid-Over Swap: " + swapBowlerName + " bowls now.");
  };

  const undoLiveBall = () => {
    const m = ws.liveMatch;
    if (!m || m.history.length === 0) return;
    const [last, ...rest] = m.history;
    if (last.innings !== m.innings) return;
    const wasLegal = !last.isWide && !last.isNoBall;

    const updatedBatters = { ...m.batters };
    if (updatedBatters[last.batsman]) {
      const b = updatedBatters[last.batsman];
      const batterRunDeduct = last.isWide ? 0 : last.isNoBall ? Math.max(0, last.runs - 1) : last.runs;
      updatedBatters[last.batsman] = {
        ...b,
        runs: Math.max(0, b.runs - batterRunDeduct),
        balls: wasLegal ? Math.max(0, b.balls - 1) : b.balls,
        out: last.isWicket ? false : b.out,
        dismissal: last.isWicket ? "" : b.dismissal,
      };
    }

    const updatedBowlers = { ...m.bowlers };
    if (updatedBowlers[last.bowler]) {
      const bw = updatedBowlers[last.bowler];
      updatedBowlers[last.bowler] = {
        ...bw,
        balls: wasLegal ? Math.max(0, bw.balls - 1) : bw.balls,
        runs: Math.max(0, bw.runs - last.runs),
        wickets:
          last.isWicket && last.wicketType !== "Run Out"
            ? Math.max(0, bw.wickets - 1)
            : bw.wickets,
      };
    }

    updateWorkspace((prevWs) => ({
      ...prevWs,
      liveMatch: {
        ...m,
        runs: Math.max(0, m.runs - last.runs),
        wickets: last.isWicket ? Math.max(0, m.wickets - 1) : m.wickets,
        balls: wasLegal ? Math.max(0, m.balls - 1) : m.balls,
        striker: last.batsman,
        freeHitActive: last.isFreeHit,
        isCompleted: false,
        isTied: false,
        batters: updatedBatters,
        bowlers: updatedBowlers,
        history: rest,
      },
    }));
    setUmpireBanner("Last ball undone.");
  };

  const archiveLiveMatch = () => {
    const m = ws.liveMatch;
    if (!m) return;
    const mvp = computeLiveMvp(m);
    const scorecardText = buildWhatsappScorecard(m);
    const firstInnSummary =
      m.firstInningsScore !== null
        ? " vs " + m.bowlingTeam + " " + m.firstInningsScore + "/" + (m.firstInningsWickets ?? 0)
        : "";
    const completed: CompletedMatch = {
      id: uid("hist"),
      title: m.title,
      date: new Date().toISOString().slice(0, 10),
      summary: m.battingTeam + " " + m.runs + "/" + m.wickets + " (" + formatOvers(m.balls) + " ov)" + firstInnSummary,
      winner: m.resultText || "Completed",
      mvp,
      scorecardText,
    };

    updateWorkspace((prevWs) => {
      const updatedPlayers = prevWs.players.map((pl) => {
        const bat = m.batters[pl.name];
        const bowl = m.bowlers[pl.name];
        const participated = m.teamAPlayers.includes(pl.name) || m.teamBPlayers.includes(pl.name);
        if (!participated) return pl;
        return {
          ...pl,
          matches: pl.matches + 1,
          runs: pl.runs + (bat ? bat.runs : 0),
          ballsFaced: pl.ballsFaced + (bat ? bat.balls : 0),
          fours: pl.fours + (bat ? bat.fours : 0),
          sixes: pl.sixes + (bat ? bat.sixes : 0),
          wickets: pl.wickets + (bowl ? bowl.wickets : 0),
          oversBowled: pl.oversBowled + (bowl ? Math.ceil(bowl.balls / 6) : 0),
          runsConceded: pl.runsConceded + (bowl ? bowl.runs : 0),
        };
      });

      return {
        ...prevWs,
        players: updatedPlayers,
        liveMatch: null,
        scheduledMatch: null,
        matchHistory: [completed, ...prevWs.matchHistory],
      };
    });
    setUmpireBanner("Match saved to Match History and stats updated.");
  };

  const toggleVoiceInput = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Rec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Rec) {
      setAiMessages((prev) => [
        ...prev,
        {
          id: uid("bot"),
          role: "bot",
          layer: "Voice Input",
          text: "Voice recognition is not supported on this browser. Type your cricket question below.",
          timestamp: nowTime(),
        },
      ]);
      return;
    }
    try {
      const rec = new Rec();
      rec.lang = "en-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (ev) => {
        const spoken = ev.results[0]?.[0]?.transcript || "";
        if (spoken) {
          setAiInput(spoken);
          void askLegendBot(spoken);
        }
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
      setIsListening(true);
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  const askLegendBot = async (rawPrompt: string) => {
    const prompt = rawPrompt.trim();
    if (!prompt || aiLoading) return;

    setAiMessages((prev) => [
      ...prev,
      { id: uid("u"), role: "user", text: prompt, timestamp: nowTime() },
    ]);
    setAiInput("");

    const q = prompt.toLowerCase();

    if (q.includes("orange") || q.includes("purple") || q.includes("cap") || q.includes("top")) {
      const reply =
        ws.clubName +
        " Leaders: Orange Cap is " +
        orangeCapHolder.name +
        " (" +
        orangeCapHolder.runs +
        " runs). Purple Cap is " +
        purpleCapHolder.name +
        " (" +
        purpleCapHolder.wickets +
        " wickets).";
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Club Caps", text: reply, timestamp: nowTime() },
      ]);
      speak(reply);
      return;
    }

    if (q.includes("due") || q.includes("balance") || q.includes("money") || q.includes("fund")) {
      const dueList = ws.players
        .filter((p) => p.finesDue > 0)
        .map((p) => p.name + " (Rs." + p.finesDue + ")")
        .join(", ");
      const reply =
        ws.clubName +
        " Net Balance is Rs." +
        clubNetBalance +
        ". Pending dues: " +
        (dueList || "All clear!") +
        ".";
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Club Treasury", text: reply, timestamp: nowTime() },
      ]);
      speak(reply);
      return;
    }

    if (q.includes("poll") || q.includes("playing")) {
      const inVotes = ws.poll.filter((v) => v.choice === "IN");
      const reply =
        ws.clubName +
        " Poll: " +
        inVotes.length +
        " players IN (" +
        (inVotes.map((v) => v.playerName).join(", ") || "None yet") +
        ").";
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Club Poll", text: reply, timestamp: nowTime() },
      ]);
      speak(reply);
      return;
    }

    if (q.includes("live") || q.includes("score") || q.includes("match")) {
      const activeMatch = ws.liveMatch;
      const reply = activeMatch
        ? ws.clubName +
          " Live Match: " +
          activeMatch.battingTeam +
          " " +
          activeMatch.runs +
          "/" +
          activeMatch.wickets +
          " (" +
          formatOvers(activeMatch.balls) +
          "/" +
          activeMatch.totalOvers +
          " ov). Striker: " +
          activeMatch.striker +
          ", Bowler: " +
          activeMatch.bowler +
          "."
        : ws.scheduledMatch
        ? "Upcoming match: " + ws.scheduledMatch.title + " (" + ws.scheduledMatch.overs + " overs)."
        : "No active match in " + ws.clubName + " yet. Admins can create one in the Matches tab.";
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Match Engine", text: reply, timestamp: nowTime() },
      ]);
      speak(reply);
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Cricket assistant for " + ws.clubName + ". Question: " + prompt,
          context: {
            club: ws.clubName,
            balance: clubNetBalance,
            orangeCap: orangeCapHolder.name + " (" + orangeCapHolder.runs + ")",
            purpleCap: purpleCapHolder.name + " (" + purpleCapHolder.wickets + ")",
          },
        }),
      });
      const data = (await res.json()) as { reply?: string };
      if (res.ok && data.reply) {
        setAiMessages((prev) => [
          ...prev,
          { id: uid("b"), role: "bot", layer: "LegendBot AI", text: data.reply || "", timestamp: nowTime() },
        ]);
        speak(data.reply);
      } else {
        throw new Error("Fallback");
      }
    } catch {
      const fallback =
        ws.clubName +
        " Status: Net Balance Rs." +
        clubNetBalance +
        ", Matches Played: " +
        ws.matchHistory.length +
        ", Squad Size: " +
        ws.players.length +
        ". Ask about caps, dues, poll, or live score!";
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "LegendBot Club Intel", text: fallback, timestamp: nowTime() },
      ]);
      speak(fallback);
    } finally {
      setAiLoading(false);
    }
  };

  const themeCss = buildThemeCss(state.theme);
  const selectedLoginPlayer =
    allIlPlayers.find((p) => p.id === loginPlayerId) || allIlPlayers[0];

  if (!session || !authPlayer || !activeUserInWs) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
          background:
            "radial-gradient(circle at top, rgba(251,191,36,0.16), rgba(11,19,40,0.96) 55%, #040816 100%)",
        }}
      >
        <style>{themeCss}</style>
        <div className="il-card il-hero-card" style={{ width: "100%", maxWidth: 430, padding: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              className="il-crest"
              style={{ width: 64, height: 64, fontSize: 24, margin: "0 auto 12px auto" }}
            >
              IL
            </div>
            <div
              className="il-pill"
              style={{ background: "rgba(251,191,36,0.18)", color: "#fde68a", marginBottom: 8 }}
            >
              <Flame size={13} /> PLAY - MANAGE - WIN
            </div>
            <h1 style={{ margin: 0, fontSize: 27, fontWeight: 900, letterSpacing: "0.03em" }}>
              INDORE LEGENDS
            </h1>
            <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "var(--muted)" }}>
              Together We Rise - Official Squad Portal
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, borderRadius: 14, background: "rgba(2,6,23,0.65)", border: "1px solid var(--border)" }}>
              <PlayerAvatar
                playerId={selectedLoginPlayer.id}
                name={selectedLoginPlayer.name}
                size={52}
                rounded
              />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: "var(--gold)", fontWeight: 800, display: "block", marginBottom: 4, letterSpacing: "0.08em" }}>
                  SELECT PLAYER
                </label>
                <select
                  className="il-select"
                  style={{ padding: "8px 10px" }}
                  value={loginPlayerId}
                  onChange={(e) => {
                    setLoginPlayerId(e.target.value);
                    setLoginError("");
                  }}
                >
                  {allIlPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800, display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showLoginPass ? "text" : "password"}
                  className="il-input"
                  style={{ paddingRight: 42 }}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div
                style={{
                  background: "rgba(225,29,72,0.18)",
                  border: "1px solid rgba(251,113,133,0.45)",
                  color: "#fda4af",
                  padding: "9px 12px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {loginError}
              </div>
            )}

            <button type="submit" className="il-btn il-btn-gold" style={{ padding: 13, fontSize: 15 }}>
              <Lock size={16} /> Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const userSR =
    activeUserInWs.ballsFaced > 0
      ? ((activeUserInWs.runs / activeUserInWs.ballsFaced) * 100).toFixed(1)
      : "0.0";
  const userEcon =
    activeUserInWs.oversBowled > 0
      ? (activeUserInWs.runsConceded / activeUserInWs.oversBowled).toFixed(2)
      : "0.00";
  const myPollVote = ws.poll.find((v) => v.playerId === activeUserInWs.id)?.choice || "";

  const lm = ws.liveMatch;
  const lmMaxBalls = lm ? lm.totalOvers * 6 : 60;
  const lmBallsLeft = lm ? Math.max(0, lmMaxBalls - lm.balls) : 0;
  const lmCrr = lm && lm.balls > 0 ? (lm.runs / (lm.balls / 6)).toFixed(2) : "0.00";
  const lmRunsNeeded = lm && lm.target !== null ? Math.max(0, lm.target - lm.runs) : null;
  const lmRrr =
    lmRunsNeeded !== null && lmBallsLeft > 0
      ? (lmRunsNeeded / (lmBallsLeft / 6)).toFixed(2)
      : "0.00";

  const oversGrouped: { overNum: number; balls: BallEvent[]; runs: number; wickets: number }[] = [];
  if (lm) {
    const currentInnBalls = [...lm.history].filter((b) => b.innings === lm.innings).reverse();
    const map = new Map<number, BallEvent[]>();
    currentInnBalls.forEach((b) => {
      const list = map.get(b.over) || [];
      list.push(b);
      map.set(b.over, list);
    });
    Array.from(map.entries())
      .sort((a, b) => b[0] - a[0])
      .forEach(([overNum, balls]) => {
        oversGrouped.push({
          overNum: overNum + 1,
          balls,
          runs: balls.reduce((s, b) => s + b.runs, 0),
          wickets: balls.filter((b) => b.isWicket).length,
        });
      });
  }

  const renderBallStyle = (b: BallEvent): React.CSSProperties => {
    if (b.isWicket) return { background: "#e11d48", color: "#fff", borderColor: "#fb7185" };
    if (b.isWide || b.isNoBall)
      return { background: "rgba(245,158,11,0.25)", color: "#fde68a", borderColor: "#fbbf24" };
    if (b.runs === 6)
      return { background: "linear-gradient(135deg,#f59e0b,#ea580c)", color: "#fff", borderColor: "#fcd34d" };
    if (b.runs === 4) return { background: "#0284c7", color: "#fff", borderColor: "#38bdf8" };
    return { background: "#1e293b", color: "#cbd5e1", borderColor: "#334155" };
  };

  const renderBallText = (b: BallEvent): string => {
    if (b.isWicket) return "W";
    if (b.isWide) return "WD";
    if (b.isNoBall) return "NB";
    return String(b.runs);
  };

  const rankedPlayers = [...ws.players].sort((a, b) => {
    if (leaderTab === "batting") return b.runs - a.runs;
    if (leaderTab === "bowling") return b.wickets - a.wickets;
    return playerRankScore(b) - playerRankScore(a);
  });

  const selectedProfile = selectedProfileId
    ? ws.players.find((p) => p.id === selectedProfileId) || null
    : null;

  const navItems: { id: TabKey; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home size={17} /> },
    { id: "match", label: "Matches", icon: <Trophy size={17} /> },
    { id: "squad", label: "Squad", icon: <Users size={17} /> },
    { id: "leaderboard", label: "Ranks", icon: <BarChart3 size={17} /> },
    { id: "treasury", label: "Finance", icon: <Wallet size={17} /> },
    { id: "chat", label: "Chat", icon: <MessageSquare size={17} /> },
    { id: "ai", label: "Bot", icon: <Bot size={17} /> },
    { id: "settings", label: "Settings", icon: <Settings size={17} /> },
  ];

  return (
    <div className="il-shell">
      <style>{themeCss}</style>

      {/* Pinned Announcement Bar */}
      <div className="il-gold-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={15} />
          <span>{ws.announcement}</span>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="il-btn"
            style={{ padding: "4px 9px", fontSize: 11, background: "#090d1e", color: "#fbbf24" }}
            onClick={() => setTab("settings")}
          >
            Edit
          </button>
        )}
      </div>

      {/* Header */}
      <header className="il-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="il-crest" onClick={handleCrestTap} title="Club Crest">
            {workspace === "gm" ? "GM" : "IL"}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: "0.03em" }}>
              {ws.clubName}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              {authPlayer.name} {isAdmin ? "- ADMIN" : "- PLAYER"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {authPlayer.isGM && !gmUnlocked && (
            <button
              type="button"
              className="il-btn"
              style={{ padding: "8px 10px", fontSize: 11, color: "#fbbf24" }}
              onClick={openGmUnlockPrompt}
              title="Unlock Ganesh Mandir Cricket Club"
            >
              <Lock size={14} /> GM
            </button>
          )}
          <button
            type="button"
            className="il-btn"
            style={{ padding: "8px 10px" }}
            onClick={() => setVoiceOutput((v) => !v)}
            title="Toggle Voice"
          >
            {voiceOutput ? <Volume2 size={16} color="#34d399" /> : <VolumeX size={16} color="#94a3b8" />}
          </button>
          <button
            type="button"
            className="il-btn"
            style={{ padding: "8px 10px", color: "#fb7185" }}
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Workspace Switcher Pill */}
      {gmUnlocked && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 12,
            background: "rgba(2, 6, 23, 0.72)",
            padding: 6,
            borderRadius: 14,
            border: "1px solid var(--border)",
          }}
        >
          <button
            type="button"
            className={"il-btn " + (workspace === "il" ? "il-btn-primary" : "")}
            style={{ flex: 1, padding: "8px 10px", fontSize: 12 }}
            onClick={() => setWorkspace("il")}
          >
            Indore Legends (13)
          </button>
          <button
            type="button"
            className={"il-btn " + (workspace === "gm" ? "il-btn-gold" : "")}
            style={{ flex: 1, padding: "8px 10px", fontSize: 12 }}
            onClick={() => setWorkspace("gm")}
          >
            Ganesh Mandir (8)
          </button>
        </div>
      )}

      {/* HOME TAB */}
      {tab === "home" && (
        <div>
          <div className="il-card il-hero-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <PlayerAvatar
                  playerId={activeUserInWs.id}
                  name={activeUserInWs.name}
                  size={56}
                  rounded
                  borderColor="#fbbf24"
                />
                <div>
                  <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 800, letterSpacing: "0.08em" }}>
                    TOGETHER WE RISE
                  </div>
                  <h2 style={{ margin: "3px 0 2px 0", fontSize: 21, fontWeight: 900 }}>
                    Welcome back, {authPlayer.name.split(" ")[0]}
                  </h2>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {ws.clubName} Dashboard
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button
                  type="button"
                  aria-label="Royal Blue Theme"
                  className={"il-orb " + (state.theme === "blue" ? "selected" : "")}
                  style={{ background: "linear-gradient(135deg, #0284c7, #1d4ed8)" }}
                  onClick={() => setState((prev) => ({ ...prev, theme: "blue" }))}
                />
                <button
                  type="button"
                  aria-label="Championship Gold Theme"
                  className={"il-orb " + (state.theme === "gold" ? "selected" : "")}
                  style={{ background: "linear-gradient(135deg, #d97706, #fbbf24)" }}
                  onClick={() => setState((prev) => ({ ...prev, theme: "gold" }))}
                />
                <button
                  type="button"
                  aria-label="Pitch Emerald Theme"
                  className={"il-orb " + (state.theme === "emerald" ? "selected" : "")}
                  style={{ background: "linear-gradient(135deg, #059669, #34d399)" }}
                  onClick={() => setState((prev) => ({ ...prev, theme: "emerald" }))}
                />
              </div>
            </div>

            <div className="il-grid-4 il-resp-2" style={{ marginTop: 14 }}>
              <div style={{ background: "rgba(2,6,23,0.72)", padding: 12, borderRadius: 14, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>SQUAD SIZE</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--cyan)", marginTop: 3 }}>
                  {ws.players.length}
                </div>
              </div>
              <div style={{ background: "rgba(2,6,23,0.72)", padding: 12, borderRadius: 14, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>MATCHES</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--gold)", marginTop: 3 }}>
                  {ws.matchHistory.length}
                </div>
              </div>
              <div style={{ background: "rgba(2,6,23,0.72)", padding: 12, borderRadius: 14, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>CLUB FUND</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--emerald)", marginTop: 3 }}>
                  Rs.{clubNetBalance}
                </div>
              </div>
              <div style={{ background: "rgba(2,6,23,0.72)", padding: 12, borderRadius: 14, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>MY RUNS / WKTS</div>
                <div style={{ fontSize: 22, fontWeight: 900, marginTop: 3 }}>
                  {activeUserInWs.runs} / {activeUserInWs.wickets}
                </div>
              </div>
            </div>
          </div>

          <div className="il-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span className="il-pill" style={{ background: "rgba(251,191,36,0.2)", color: "#fde68a" }}>
                <Flame size={13} /> {ws.scheduledMatch ? ws.scheduledMatch.title : "Official Launch Countdown"}
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Clock size={13} />{" "}
                {ws.scheduledMatch ? ws.scheduledMatch.dateTime.replace("T", " ") : "Nov 29, 2026 - 3:00 PM IST"}
              </span>
            </div>

            <div className="il-grid-4" style={{ marginTop: 12 }}>
              {[
                { label: "DAYS", val: cdDays, color: "#38bdf8" },
                { label: "HOURS", val: cdHours, color: "#fbbf24" },
                { label: "MINS", val: cdMins, color: "#34d399" },
                { label: "SECS", val: cdSecs, color: "#a78bfa" },
              ].map((u) => (
                <div
                  key={u.label}
                  style={{
                    background: "rgba(2,6,23,0.78)",
                    borderRadius: 12,
                    padding: "11px 6px",
                    textAlign: "center",
                    borderBottom: "3px solid " + u.color,
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
                    {u.val}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: u.color }}>
                    {u.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="il-grid-2" style={{ marginTop: 12 }}>
              <button
                type="button"
                className="il-btn il-btn-gold"
                onClick={() => {
                  setTab("match");
                  if (isAdmin && !ws.liveMatch) {
                    requireAdminPin("Create New Match", () => setShowCreateWizard(true));
                  }
                }}
              >
                <Trophy size={15} /> {ws.liveMatch ? "Open Live Match" : isAdmin ? "Create Match" : "Match Center"}
              </button>
              <button
                type="button"
                className="il-btn il-btn-primary"
                onClick={() => setTab("treasury")}
              >
                <Wallet size={15} /> Finance and Dues
              </button>
            </div>
          </div>

          <div
            className="il-card"
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedProfileId(activeUserInWs.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <PlayerAvatar playerId={activeUserInWs.id} name={activeUserInWs.name} size={50} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{activeUserInWs.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {activeUserInWs.role} - {activeUserInWs.funAward}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 12 }}>
                <div>
                  SR: <strong>{userSR}</strong> - Econ: <strong>{userEcon}</strong>
                </div>
                <div style={{ color: activeUserInWs.finesDue > 0 ? "var(--rose)" : "var(--emerald)", fontWeight: 700 }}>
                  {activeUserInWs.finesDue > 0 ? "Due: Rs." + activeUserInWs.finesDue : "No Dues"} (Adv: Rs.{activeUserInWs.advanceCredit})
                </div>
              </div>
            </div>
          </div>

          <div className="il-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={16} color="#34d399" /> Attendance Poll
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                {ws.poll.filter((v) => v.choice === "IN").length} IN /{" "}
                {ws.poll.filter((v) => v.choice === "MAYBE").length} MAYBE /{" "}
                {ws.poll.filter((v) => v.choice === "OUT").length} OUT
              </span>
            </div>

            <div className="il-grid-3">
              {(["IN", "MAYBE", "OUT"] as PollChoice[]).map((choice) => {
                const activeCls =
                  myPollVote === choice
                    ? choice === "IN"
                      ? "il-btn-emerald"
                      : choice === "OUT"
                      ? "il-btn-danger"
                      : "il-btn-gold"
                    : "";
                return (
                  <button
                    key={choice}
                    type="button"
                    className={"il-btn " + activeCls}
                    onClick={() => handleVotePoll(choice)}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            {ws.poll.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {ws.poll.map((v) => (
                  <span
                    key={v.playerId}
                    className="il-pill"
                    style={{
                      background:
                        v.choice === "IN"
                          ? "rgba(52,211,153,0.16)"
                          : v.choice === "OUT"
                          ? "rgba(244,63,94,0.16)"
                          : "rgba(251,191,36,0.16)",
                      color: v.choice === "IN" ? "#6ee7b7" : v.choice === "OUT" ? "#fda4af" : "#fde68a",
                    }}
                  >
                    {v.playerName.split(" ")[0]}: {v.choice}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="il-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={16} color="#38bdf8" /> Ground Location
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{ws.groundName}</div>
              </div>
              <a
                href={ws.groundMapUrl}
                target="_blank"
                rel="noreferrer"
                className="il-btn il-btn-primary"
                style={{ textDecoration: "none" }}
              >
                <MapPin size={15} /> Open Maps
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MATCH TAB */}
      {tab === "match" && (
        <div>
          {!lm && (
            <div>
              <div className="il-card il-hero-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 800 }}>{ws.clubName} MATCH CENTER</div>
                    <h2 style={{ margin: "4px 0 0 0", fontSize: 20 }}>
                      {ws.scheduledMatch ? ws.scheduledMatch.title : "No Scheduled Match Yet"}
                    </h2>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                      Create a match, split teams, flip the coin, and start live ball-by-ball scoring.
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      className="il-btn il-btn-gold"
                      onClick={() =>
                        requireAdminPin("Create New Match", () => setShowCreateWizard(true))
                      }
                    >
                      <Plus size={16} /> Create Match
                    </button>
                  )}
                </div>

                {showCreateWizard && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 14,
                      borderRadius: 14,
                      background: "rgba(2,6,23,0.88)",
                      border: "1px solid var(--border)",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div style={{ fontWeight: 800, color: "var(--gold)" }}>Create Match Wizard</div>
                    <input
                      className="il-input"
                      value={wizTitle}
                      onChange={(e) => setWizTitle(e.target.value)}
                      placeholder="Match Title"
                    />
                    <div className="il-grid-2">
                      <input
                        className="il-input"
                        type="datetime-local"
                        value={wizDateTime}
                        onChange={(e) => setWizDateTime(e.target.value)}
                      />
                      <select
                        className="il-select"
                        value={wizOvers}
                        onChange={(e) => setWizOvers(Number(e.target.value))}
                      >
                        {[4, 5, 6, 8, 10, 12, 15, 20].map((ov) => (
                          <option key={ov} value={ov}>
                            {ov} Overs
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="il-grid-2">
                      <input
                        className="il-input"
                        value={wizTeamAName}
                        onChange={(e) => setWizTeamAName(e.target.value)}
                        placeholder="Team A Name"
                      />
                      <input
                        className="il-input"
                        value={wizTeamBName}
                        onChange={(e) => setWizTeamBName(e.target.value)}
                        placeholder="Team B Name"
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                        Select Playing Squad ({wizSelectedIds.length} selected - min 4):
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {ws.players.map((p) => {
                          const picked = wizSelectedIds.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              className={"il-btn " + (picked ? "il-btn-primary" : "")}
                              style={{ padding: "6px 10px", fontSize: 12 }}
                              onClick={() =>
                                setWizSelectedIds((prev) =>
                                  prev.includes(p.id)
                                    ? prev.filter((id) => id !== p.id)
                                    : [...prev, p.id]
                                )
                              }
                            >
                              {p.name.split(" ")[0]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        disabled={wizSelectedIds.length < 4}
                        className="il-btn il-btn-gold"
                        onClick={createScheduledMatch}
                      >
                        <Shuffle size={15} /> Create and Split Teams
                      </button>
                      <button type="button" className="il-btn" onClick={() => setShowCreateWizard(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {ws.scheduledMatch && (
                <div className="il-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <span className="il-pill" style={{ background: "rgba(56,189,248,0.2)", color: "#7dd3fc" }}>
                        {ws.scheduledMatch.overs} Overs - {ws.scheduledMatch.dateTime.replace("T", " ")}
                      </span>
                      <h3 style={{ margin: "6px 0 0 0" }}>Teams and Captains</h3>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        className="il-btn"
                        style={{ fontSize: 12 }}
                        onClick={reRollScheduledTeams}
                      >
                        <Shuffle size={14} /> Auto-Shuffle C / VC
                      </button>
                    )}
                  </div>

                  <div className="il-grid-2 il-resp-1" style={{ marginTop: 12 }}>
                    <div style={{ background: "rgba(2,6,23,0.75)", padding: 12, borderRadius: 12, border: "1px solid rgba(56,189,248,0.35)" }}>
                      <div style={{ fontWeight: 900, color: "var(--cyan)" }}>{ws.scheduledMatch.teamAName}</div>
                      <div style={{ fontSize: 12, color: "var(--gold)", marginTop: 4 }}>
                        C: {ws.scheduledMatch.teamACaptain} / VC: {ws.scheduledMatch.teamAViceCaptain}
                      </div>
                      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {ws.players
                          .filter((p) => ws.scheduledMatch?.teamAIds.includes(p.id))
                          .map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              disabled={!isAdmin}
                              className="il-btn"
                              style={{ padding: "4px 9px", fontSize: 11 }}
                              onClick={() => swapPlayerTeam(p.id)}
                              title="Tap to swap team"
                            >
                              {p.name.split(" ")[0]}
                            </button>
                          ))}
                      </div>
                    </div>

                    <div style={{ background: "rgba(2,6,23,0.75)", padding: 12, borderRadius: 12, border: "1px solid rgba(251,191,36,0.35)" }}>
                      <div style={{ fontWeight: 900, color: "var(--gold)" }}>{ws.scheduledMatch.teamBName}</div>
                      <div style={{ fontSize: 12, color: "var(--cyan)", marginTop: 4 }}>
                        C: {ws.scheduledMatch.teamBCaptain} / VC: {ws.scheduledMatch.teamBViceCaptain}
                      </div>
                      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {ws.players
                          .filter((p) => ws.scheduledMatch?.teamBIds.includes(p.id))
                          .map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              disabled={!isAdmin}
                              className="il-btn"
                              style={{ padding: "4px 9px", fontSize: 11 }}
                              onClick={() => swapPlayerTeam(p.id)}
                              title="Tap to swap team"
                            >
                              {p.name.split(" ")[0]}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                      Tip: Tap any player chip above to move them to the other team.
                    </div>
                  )}

                  <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.72)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                        <Coins size={16} color="#fbbf24" className={coinFlipping ? "il-coin-spin" : ""} /> Digital Coin Toss
                      </div>
                      <button
                        type="button"
                        className="il-btn il-btn-gold"
                        disabled={coinFlipping}
                        onClick={flipCoin}
                      >
                        {coinFlipping ? "Flipping..." : "Flip Coin"}
                      </button>
                    </div>
                    {(coinResult || ws.scheduledMatch.tossWinner) && (
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ fontSize: 13 }}>
                          Coin: <strong style={{ color: "var(--gold)" }}>{coinResult || "DONE"}</strong> - Winner:{" "}
                          <strong style={{ color: "var(--cyan)" }}>{ws.scheduledMatch.tossWinner}</strong>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {(["BAT", "BOWL"] as const).map((dec) => (
                            <button
                              key={dec}
                              type="button"
                              className={"il-btn " + (ws.scheduledMatch?.tossDecision === dec ? "il-btn-emerald" : "")}
                              style={{ padding: "6px 12px", fontSize: 12 }}
                              onClick={() =>
                                updateWorkspace((prevWs) =>
                                  prevWs.scheduledMatch
                                    ? { ...prevWs, scheduledMatch: { ...prevWs.scheduledMatch, tossDecision: dec } }
                                    : prevWs
                                )
                              }
                            >
                              Choose {dec}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.72)", border: "1px solid var(--border)" }}>
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Match Day Checklist</div>
                    <div style={{ display: "grid", gap: 6 }}>
                      {ws.scheduledMatch.checklist.map((item) => (
                        <label
                          key={item.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 13,
                            cursor: "pointer",
                            textDecoration: item.done ? "line-through" : "none",
                            color: item.done ? "var(--emerald)" : "var(--text)",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() =>
                              updateWorkspace((prevWs) =>
                                prevWs.scheduledMatch
                                  ? {
                                      ...prevWs,
                                      scheduledMatch: {
                                        ...prevWs.scheduledMatch,
                                        checklist: prevWs.scheduledMatch.checklist.map((c) =>
                                          c.id === item.id ? { ...c, done: !c.done } : c
                                        ),
                                      },
                                    }
                                  : prevWs
                              )
                            }
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <input
                        className="il-input"
                        placeholder="Add checklist item..."
                        value={newChecklistLabel}
                        onChange={(e) => setNewChecklistLabel(e.target.value)}
                      />
                      <button
                        type="button"
                        className="il-btn"
                        onClick={() => {
                          if (!newChecklistLabel.trim()) return;
                          updateWorkspace((prevWs) =>
                            prevWs.scheduledMatch
                              ? {
                                  ...prevWs,
                                  scheduledMatch: {
                                    ...prevWs.scheduledMatch,
                                    checklist: [
                                      ...prevWs.scheduledMatch.checklist,
                                      { id: uid("chk"), label: newChecklistLabel.trim(), done: false },
                                    ],
                                  },
                                }
                              : prevWs
                          );
                          setNewChecklistLabel("");
                        }}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  {isAdmin && (
                    <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="il-btn il-btn-emerald"
                        style={{ flex: 1, padding: 13 }}
                        onClick={() =>
                          requireAdminPin("Start Live Match Scoring", startLiveMatchFromScheduled)
                        }
                      >
                        <Play size={16} /> Start Live Match
                      </button>
                      <button
                        type="button"
                        className="il-btn il-btn-danger"
                        onClick={() =>
                          requireAdminPin("Cancel Scheduled Match", () =>
                            updateWorkspace((prevWs) => ({ ...prevWs, scheduledMatch: null }))
                          )
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="il-card">
                <div style={{ fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Trophy size={16} color="#fbbf24" /> Completed Matches ({ws.matchHistory.length})
                </div>
                {ws.matchHistory.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>
                    No matches played yet. Finished matches will be archived here.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {ws.matchHistory.map((h) => (
                      <div
                        key={h.id}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          background: "rgba(2,6,23,0.72)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800 }}>{h.title}</div>
                          <div style={{ fontSize: 12, color: "var(--cyan)" }}>{h.summary}</div>
                          <div style={{ fontSize: 12, color: "var(--gold)" }}>
                            {h.winner} - MVP: {h.mvp} ({h.date})
                          </div>
                        </div>
                        <a
                          href={"https://wa.me/?text=" + encodeURIComponent(h.scorecardText)}
                          target="_blank"
                          rel="noreferrer"
                          className="il-btn il-btn-emerald"
                          style={{ textDecoration: "none", padding: "7px 10px", fontSize: 12 }}
                        >
                          <Share2 size={14} /> WhatsApp
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {lm && (
            <div>
              {lm.freeHitActive && (
                <div className="il-freehit-banner">
                  FREE HIT ACTIVE - ONLY RUN OUT ALLOWED
                </div>
              )}

              <div className="il-card il-hero-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <span className="il-pill" style={{ background: "rgba(244,63,94,0.22)", color: "#fda4af" }}>
                      <Activity size={12} /> {lm.isSuperOver ? "SUPER OVER" : "INNINGS " + lm.innings} - {lm.title}
                    </span>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{lm.tossInfo}</div>
                  </div>
                  <a
                    href={"https://wa.me/?text=" + encodeURIComponent(buildWhatsappScorecard(lm))}
                    target="_blank"
                    rel="noreferrer"
                    className="il-btn il-btn-emerald"
                    style={{ textDecoration: "none", padding: "7px 11px", fontSize: 12 }}
                  >
                    <Share2 size={14} /> Share Scorecard
                  </a>
                </div>

                <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, color: "var(--gold)", fontWeight: 800 }}>
                      {lm.battingTeam} vs {lm.bowlingTeam}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
                      <span style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>
                        {lm.runs}/{lm.wickets}
                      </span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "var(--cyan)" }}>
                        ({formatOvers(lm.balls)} / {lm.totalOvers} ov)
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13 }}>
                      CRR: <strong>{lmCrr}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gold)", marginTop: 2 }}>
                      Auto MVP: <strong>{computeLiveMvp(lm)}</strong>
                    </div>
                  </div>
                </div>

                {lm.innings === 2 && lm.target !== null && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.8)", border: "1px solid rgba(56,189,248,0.35)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, flexWrap: "wrap", gap: 6 }}>
                      <span style={{ color: "var(--gold)" }}>TARGET {lm.target}</span>
                      <span style={{ color: "var(--emerald)" }}>
                        Need {lmRunsNeeded} runs in {lmBallsLeft} balls (RRR {lmRrr})
                      </span>
                    </div>
                    <div style={{ height: 8, background: "#1e293b", borderRadius: 99, overflow: "hidden", marginTop: 8 }}>
                      <div
                        style={{
                          height: "100%",
                          width: Math.min(100, Math.round((lm.runs / Math.max(1, lm.target)) * 100)) + "%",
                          background: "linear-gradient(90deg, #38bdf8, #34d399, #fbbf24)",
                        }}
                      />
                    </div>
                  </div>
                )}

                {lm.resultText && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "rgba(52,211,153,0.18)", border: "1px solid rgba(52,211,153,0.5)", fontWeight: 900, color: "#6ee7b7", textAlign: "center" }}>
                    {lm.resultText}
                  </div>
                )}
              </div>

              <div className="il-card">
                <div className="il-grid-3 il-resp-1">
                  <div style={{ background: "rgba(2,6,23,0.75)", padding: 10, borderRadius: 12, border: "1px solid rgba(251,191,36,0.4)" }}>
                    <div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 800 }}>STRIKER *</div>
                    <select
                      className="il-select"
                      style={{ marginTop: 4, padding: "6px 8px", fontSize: 13 }}
                      value={lm.striker}
                      disabled={!isAdmin}
                      onChange={(e) =>
                        updateWorkspace((prevWs) =>
                          prevWs.liveMatch ? { ...prevWs, liveMatch: { ...prevWs.liveMatch, striker: e.target.value } } : prevWs
                        )
                      }
                    >
                      {lm.battingPlayers.map((name) => (
                        <option key={name} value={name}>
                          {name} ({lm.batters[name]?.runs ?? 0}*)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ background: "rgba(2,6,23,0.75)", padding: 10, borderRadius: 12 }}>
                    <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>NON-STRIKER</div>
                    <select
                      className="il-select"
                      style={{ marginTop: 4, padding: "6px 8px", fontSize: 13 }}
                      value={lm.nonStriker}
                      disabled={!isAdmin}
                      onChange={(e) =>
                        updateWorkspace((prevWs) =>
                          prevWs.liveMatch ? { ...prevWs, liveMatch: { ...prevWs.liveMatch, nonStriker: e.target.value } } : prevWs
                        )
                      }
                    >
                      {lm.battingPlayers.map((name) => (
                        <option key={name} value={name}>
                          {name} ({lm.batters[name]?.runs ?? 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ background: "rgba(2,6,23,0.75)", padding: 10, borderRadius: 12, border: "1px solid rgba(56,189,248,0.35)" }}>
                    <div style={{ fontSize: 10, color: "var(--cyan)", fontWeight: 800 }}>BOWLER</div>
                    <div style={{ fontWeight: 800, marginTop: 6, fontSize: 14 }}>{lm.bowler}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {lm.bowlers[lm.bowler]?.wickets ?? 0}/{lm.bowlers[lm.bowler]?.runs ?? 0} ({formatOvers(lm.bowlers[lm.bowler]?.balls ?? 0)} ov)
                    </div>
                  </div>
                </div>

                {isAdmin ? (
                  <>
                    <div className="il-grid-4" style={{ marginTop: 12 }}>
                      {[0, 1, 2, 3, 4, 6].map((run) => {
                        const runCls = run === 4 ? "il-btn-primary" : run === 6 ? "il-btn-gold" : "";
                        return (
                          <button
                            key={run}
                            type="button"
                            disabled={lm.isCompleted}
                            className={"il-btn " + runCls}
                            onClick={() => recordLiveBall(run)}
                          >
                            +{run}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        disabled={lm.isCompleted}
                        className="il-btn il-btn-purple"
                        onClick={() => recordLiveBall(0, { isWide: true })}
                      >
                        WD
                      </button>
                      <button
                        type="button"
                        disabled={lm.isCompleted}
                        className="il-btn il-btn-purple"
                        onClick={() => recordLiveBall(0, { isNoBall: true })}
                      >
                        NB
                      </button>
                    </div>

                    <div className="il-grid-2" style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <select
                          className="il-select"
                          style={{ width: "48%" }}
                          value={wicketType}
                          onChange={(e) => setWicketType(e.target.value)}
                        >
                          <option value="Bowled">Bowled</option>
                          <option value="Caught">Caught</option>
                          <option value="Run Out">Run Out</option>
                          <option value="LBW">LBW</option>
                          <option value="Stumped">Stumped</option>
                        </select>
                        <button
                          type="button"
                          disabled={lm.isCompleted}
                          className="il-btn il-btn-danger"
                          style={{ flex: 1 }}
                          onClick={() => recordLiveBall(0, { isWicket: true })}
                        >
                          <AlertTriangle size={15} /> OUT
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={lm.history.length === 0}
                        className="il-btn"
                        onClick={undoLiveBall}
                      >
                        <RotateCcw size={15} /> Undo Ball
                      </button>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                      <button
                        type="button"
                        disabled={lm.isCompleted}
                        className="il-btn"
                        style={{ fontSize: 12 }}
                        onClick={handleRetiredHurt}
                      >
                        Retired Hurt
                      </button>
                      <button
                        type="button"
                        disabled={lm.isCompleted}
                        className="il-btn"
                        style={{ fontSize: 12 }}
                        onClick={() => {
                          setSwapBowlerName(lm.bowlingPlayers[0] || "");
                          setShowSwapBowler((s) => !s);
                        }}
                      >
                        Swap Bowler
                      </button>
                      {lm.innings === 1 && (
                        <button type="button" className="il-btn il-btn-primary" style={{ fontSize: 12 }} onClick={startSecondInnings}>
                          Start 2nd Innings
                        </button>
                      )}
                      {lm.isTied && (
                        <button type="button" className="il-btn il-btn-gold" style={{ fontSize: 12 }} onClick={launchSuperOver}>
                          Start Super Over
                        </button>
                      )}
                      <button
                        type="button"
                        className="il-btn il-btn-emerald"
                        style={{ fontSize: 12 }}
                        onClick={() => requireAdminPin("Finish and Save Match", archiveLiveMatch)}
                      >
                        Finish and Save
                      </button>
                    </div>

                    {showSwapBowler && (
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <select
                          className="il-select"
                          value={swapBowlerName}
                          onChange={(e) => setSwapBowlerName(e.target.value)}
                        >
                          {lm.bowlingPlayers.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                        <button type="button" className="il-btn il-btn-gold" onClick={handleMidOverSwap}>
                          Swap Now
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
                    Live viewer mode - Admins control scoring.
                  </div>
                )}
              </div>

              <div className="il-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Shield size={16} color="#fbbf24" /> Umpire Signals
                  </span>
                  {umpireBanner && (
                    <span className="il-pill" style={{ background: "rgba(56,189,248,0.2)", color: "#7dd3fc" }}>
                      {umpireBanner}
                    </span>
                  )}
                </div>
                <div className="il-grid-4">
                  {["FOUR!", "SIX!", "OUT!", "NOT OUT", "WIDE", "NO BALL", "FREE HIT", "DRINKS"].map((sig) => (
                    <button
                      key={sig}
                      type="button"
                      className="il-btn"
                      style={{ padding: "8px 6px", fontSize: 12 }}
                      onClick={() => {
                        setUmpireBanner("Umpire: " + sig);
                        speak(sig);
                      }}
                    >
                      {sig}
                    </button>
                  ))}
                </div>
              </div>

              <div className="il-card">
                <div style={{ fontWeight: 800, marginBottom: 10 }}>Over-by-Over Summary</div>
                {oversGrouped.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>No balls bowled yet.</div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {oversGrouped.map((ov) => (
                      <div key={ov.overNum} style={{ background: "rgba(2,6,23,0.72)", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                          <strong style={{ color: "var(--gold)" }}>Over {ov.overNum}</strong>
                          <span>
                            {ov.runs} runs - {ov.wickets} wkt(s)
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {ov.balls.map((b) => (
                            <span key={b.id} className="il-ball" style={renderBallStyle(b)}>
                              {renderBallText(b)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SQUAD TAB (FUT / IPL PHOTO CARDS) */}
      {tab === "squad" && (
        <div>
          <div className="il-grid-2" style={{ marginBottom: 12 }}>
            <div className="il-card" style={{ marginBottom: 0, background: "linear-gradient(135deg, rgba(234,88,12,0.34), rgba(11,19,40,0.95))", borderColor: "rgba(251,146,60,0.55)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <PlayerAvatar playerId={orangeCapHolder.id} name={orangeCapHolder.name} size={46} rounded borderColor="#fb923c" />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#fdba74", display: "flex", alignItems: "center", gap: 4 }}>
                    <Crown size={13} /> ORANGE CAP
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, marginTop: 2 }}>{orangeCapHolder.name.split(" ")[0]}</div>
                  <div style={{ fontSize: 12, color: "#ffedd5" }}>{orangeCapHolder.runs} Runs</div>
                </div>
              </div>
            </div>

            <div className="il-card" style={{ marginBottom: 0, background: "linear-gradient(135deg, rgba(126,34,206,0.34), rgba(11,19,40,0.95))", borderColor: "rgba(192,132,252,0.55)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <PlayerAvatar playerId={purpleCapHolder.id} name={purpleCapHolder.name} size={46} rounded borderColor="#c084fc" />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#e9d5ff", display: "flex", alignItems: "center", gap: 4 }}>
                    <Crown size={13} /> PURPLE CAP
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, marginTop: 2 }}>{purpleCapHolder.name.split(" ")[0]}</div>
                  <div style={{ fontSize: 12, color: "#f3e8ff" }}>{purpleCapHolder.wickets} Wickets</div>
                </div>
              </div>
            </div>
          </div>

          <div className="il-grid-2">
            {ws.players.map((p, idx) => (
              <div key={p.id} className="il-fut-card">
                <div className="il-fut-photo-wrap" onClick={() => setSelectedProfileId(p.id)}>
                  <PlayerPortraitBanner playerId={p.id} name={p.name} height={185} />
                  <div className="il-fut-fade" />

                  <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4 }}>
                    <span className="il-pill" style={{ background: "rgba(2,6,23,0.8)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.45)" }}>
                      #{idx + 1}
                    </span>
                  </div>

                  <div style={{ position: "absolute", top: 8, right: 8 }}>
                    <span className="il-pill" style={{ background: "rgba(2,6,23,0.82)", color: "#7dd3fc", fontSize: 9 }}>
                      {p.role}
                    </span>
                  </div>

                  <div style={{ position: "absolute", left: 10, right: 10, bottom: 8 }}>
                    <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1.15, textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#fde68a", fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      <Award size={11} /> {p.funAward}
                    </div>
                  </div>
                </div>

                <div style={{ padding: 10 }}>
                  <div className="il-grid-3" style={{ textAlign: "center", gap: 6 }}>
                    <div style={{ background: "rgba(2,6,23,0.75)", padding: "6px 4px", borderRadius: 10 }}>
                      <div style={{ fontSize: 9, color: "var(--muted)" }}>RUNS</div>
                      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--cyan)" }}>{p.runs}</div>
                    </div>
                    <div style={{ background: "rgba(2,6,23,0.75)", padding: "6px 4px", borderRadius: 10 }}>
                      <div style={{ fontSize: 9, color: "var(--muted)" }}>WKTS</div>
                      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--purple)" }}>{p.wickets}</div>
                    </div>
                    <div style={{ background: "rgba(2,6,23,0.75)", padding: "6px 4px", borderRadius: 10 }}>
                      <div style={{ fontSize: 9, color: "var(--muted)" }}>MAT</div>
                      <div style={{ fontWeight: 900, fontSize: 14 }}>{p.matches}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button
                      type="button"
                      className="il-btn"
                      style={{ flex: 1, padding: "6px 8px", fontSize: 11 }}
                      onClick={() => setSelectedProfileId(p.id)}
                    >
                      Stats
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        className="il-btn il-btn-gold"
                        style={{ padding: "6px 10px", fontSize: 11 }}
                        onClick={() =>
                          requireAdminPin("Edit " + p.name, () => {
                            setEditPlayerId(p.id);
                            setEditAwardText(p.funAward);
                          })
                        }
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {editPlayerId === p.id && (
                    <div style={{ marginTop: 10, padding: 8, borderRadius: 10, background: "rgba(2,6,23,0.9)", display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="il-btn il-btn-emerald"
                          style={{ padding: "5px 7px", fontSize: 10 }}
                          onClick={() =>
                            updateWorkspace((prevWs) => ({
                              ...prevWs,
                              players: prevWs.players.map((pl) =>
                                pl.id === p.id ? { ...pl, runs: pl.runs + 10, ballsFaced: pl.ballsFaced + 8 } : pl
                              ),
                            }))
                          }
                        >
                          +10R
                        </button>
                        <button
                          type="button"
                          className="il-btn il-btn-primary"
                          style={{ padding: "5px 7px", fontSize: 10 }}
                          onClick={() =>
                            updateWorkspace((prevWs) => ({
                              ...prevWs,
                              players: prevWs.players.map((pl) =>
                                pl.id === p.id ? { ...pl, wickets: pl.wickets + 1, oversBowled: pl.oversBowled + 1 } : pl
                              ),
                            }))
                          }
                        >
                          +1W
                        </button>
                        <button
                          type="button"
                          className="il-btn il-btn-danger"
                          style={{ padding: "5px 7px", fontSize: 10 }}
                          onClick={() =>
                            updateWorkspace((prevWs) => ({
                              ...prevWs,
                              players: prevWs.players.map((pl) =>
                                pl.id === p.id ? { ...pl, finesDue: pl.finesDue + 50 } : pl
                              ),
                            }))
                          }
                        >
                          +50D
                        </button>
                        <button
                          type="button"
                          className="il-btn il-btn-gold"
                          style={{ padding: "5px 7px", fontSize: 10 }}
                          onClick={() =>
                            updateWorkspace((prevWs) => ({
                              ...prevWs,
                              players: prevWs.players.map((pl) =>
                                pl.id === p.id ? { ...pl, finesDue: 0 } : pl
                              ),
                            }))
                          }
                        >
                          Clear
                        </button>
                      </div>
                      <input
                        className="il-input"
                        style={{ padding: "7px 8px", fontSize: 12 }}
                        value={editAwardText}
                        onChange={(e) => setEditAwardText(e.target.value)}
                        placeholder="Award title"
                      />
                      <button
                        type="button"
                        className="il-btn il-btn-gold"
                        style={{ padding: "6px 8px", fontSize: 11 }}
                        onClick={() => {
                          updateWorkspace((prevWs) => ({
                            ...prevWs,
                            players: prevWs.players.map((pl) =>
                              pl.id === p.id ? { ...pl, funAward: editAwardText.trim() || pl.funAward } : pl
                            ),
                          }));
                          setEditPlayerId("");
                        }}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {tab === "leaderboard" && (
        <div>
          <div className="il-card il-hero-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              <div style={{ fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", gap: 6 }}>
                <Trophy size={18} color="#fbbf24" /> {ws.clubName} Leaderboard
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["team", "batting", "bowling"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={"il-btn " + (leaderTab === mode ? "il-btn-gold" : "")}
                    style={{ padding: "6px 11px", fontSize: 12, textTransform: "capitalize" }}
                    onClick={() => setLeaderTab(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="il-grid-3" style={{ alignItems: "end", textAlign: "center" }}>
              {[rankedPlayers[1], rankedPlayers[0], rankedPlayers[2]].map((pl, idx) => {
                if (!pl) return <div key={idx} />;
                const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                const val =
                  leaderTab === "batting"
                    ? pl.runs + " Runs"
                    : leaderTab === "bowling"
                    ? pl.wickets + " Wkts"
                    : playerRankScore(pl) + " Pts";
                return (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedProfileId(pl.id)}
                    style={{
                      cursor: "pointer",
                      background: rank === 1 ? "rgba(251,191,36,0.2)" : "rgba(2,6,23,0.75)",
                      border: "1px solid " + (rank === 1 ? "rgba(251,191,36,0.65)" : "var(--border)"),
                      borderRadius: 16,
                      padding: rank === 1 ? "14px 8px" : "10px 8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <PlayerAvatar
                      playerId={pl.id}
                      name={pl.name}
                      size={rank === 1 ? 62 : 48}
                      rounded
                      borderColor={rank === 1 ? "#fbbf24" : "#38bdf8"}
                    />
                    <div style={{ fontWeight: 900, fontSize: rank === 1 ? 18 : 14, color: rank === 1 ? "var(--gold)" : "var(--cyan)", marginTop: 6 }}>
                      #{rank}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 12, marginTop: 2 }}>{pl.name.split(" ")[0]}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{val}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="il-card">
            <div style={{ display: "grid", gap: 8 }}>
              {rankedPlayers.map((pl, index) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedProfileId(pl.id)}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "9px 12px",
                    borderRadius: 12,
                    background: "rgba(2,6,23,0.72)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="il-pill" style={{ background: "rgba(56,189,248,0.18)", color: "#7dd3fc" }}>
                      #{index + 1}
                    </span>
                    <PlayerAvatar playerId={pl.id} name={pl.name} size={36} rounded />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{pl.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{pl.role}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 900, color: "var(--gold)", fontSize: 14 }}>
                    {leaderTab === "batting"
                      ? pl.runs + " Runs"
                      : leaderTab === "bowling"
                      ? pl.wickets + " Wkts"
                      : playerRankScore(pl) + " Pts"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TREASURY TAB */}
      {tab === "treasury" && (
        <div>
          <div className="il-card">
            <div style={{ fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <Wallet size={16} color="#34d399" /> {ws.clubName} Treasury
            </div>
            <DonutPieChart
              centerLabel={"Rs." + clubNetBalance}
              slices={[
                { label: "Credits", value: totalCredits, color: "#34d399" },
                { label: "Advance Credits", value: totalAdvances, color: "#fbbf24" },
                { label: "Fines", value: totalFines, color: "#38bdf8" },
                { label: "Expenses", value: totalExpenses, color: "#fb7185" },
              ]}
            />
          </div>

          <div className="il-card">
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Pending Dues and Advances</div>
            {ws.players.filter((p) => p.finesDue > 0 || p.advanceCredit > 0).length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--muted)" }}>All squad members are currently at Rs.0 dues and Rs.0 advance.</div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {ws.players
                  .filter((p) => p.finesDue > 0 || p.advanceCredit > 0)
                  .map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 8,
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "rgba(2,6,23,0.72)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <PlayerAvatar playerId={p.id} name={p.name} size={36} rounded />
                        <div>
                          <strong>{p.name}</strong>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>
                            Due: Rs.{p.finesDue} - Advance: Rs.{p.advanceCredit}
                          </div>
                        </div>
                      </div>
                      {p.finesDue > 0 && (
                        <a
                          href={
                            "https://wa.me/?text=" +
                            encodeURIComponent(
                              ws.clubName + " Reminder: Hi " + p.name + ", your pending club due is Rs." + p.finesDue + "."
                            )
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="il-btn il-btn-emerald"
                          style={{ textDecoration: "none", padding: "6px 10px", fontSize: 12 }}
                        >
                          <Share2 size={13} /> WhatsApp Reminder
                        </a>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="il-card">
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Add Treasury Entry (Admin PIN)</div>
              <div style={{ display: "grid", gap: 8 }}>
                <input
                  className="il-input"
                  placeholder="Description (e.g., Wind Balls, Turf Fee, Fine)"
                  value={trTitle}
                  onChange={(e) => setTrTitle(e.target.value)}
                />
                <div className="il-grid-4 il-resp-2">
                  <select className="il-select" value={trType} onChange={(e) => setTrType(e.target.value as LedgerType)}>
                    <option value="CREDIT">Credit (+)</option>
                    <option value="ADVANCE">Advance (+)</option>
                    <option value="FINE">Fine (+)</option>
                    <option value="EXPENSE">Expense (-)</option>
                  </select>
                  <input
                    className="il-input"
                    type="number"
                    min={1}
                    placeholder="Amount Rs."
                    value={trAmount}
                    onChange={(e) => setTrAmount(e.target.value)}
                  />
                  <select className="il-select" value={trMember} onChange={(e) => setTrMember(e.target.value)}>
                    <option value="All Squad">All Squad</option>
                    {ws.players.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="il-btn il-btn-gold"
                    onClick={() => {
                      const amt = Number(trAmount);
                      if (!trTitle.trim() || !amt || amt <= 0) return;
                      requireAdminPin("Add Treasury Entry", () => {
                        const entry: TreasuryEntry = {
                          id: uid("tr"),
                          title: trTitle.trim(),
                          type: trType,
                          amount: amt,
                          memberName: trMember,
                          date: new Date().toISOString().slice(0, 10),
                        };
                        updateWorkspace((prevWs) => ({
                          ...prevWs,
                          treasury: [entry, ...prevWs.treasury],
                          players:
                            trType === "ADVANCE"
                              ? prevWs.players.map((pl) =>
                                  pl.name === trMember ? { ...pl, advanceCredit: pl.advanceCredit + amt } : pl
                                )
                              : prevWs.players,
                        }));
                        setTrTitle("");
                        setTrAmount("");
                      });
                    }}
                  >
                    <Plus size={15} /> Save
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="il-card">
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Ledger History ({ws.treasury.length})</div>
            {ws.treasury.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--muted)" }}>No transactions recorded yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {ws.treasury.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "rgba(2,6,23,0.7)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        {t.memberName} - {t.date} - {t.type}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ color: t.type === "EXPENSE" ? "var(--rose)" : "var(--emerald)" }}>
                        {t.type === "EXPENSE" ? "-Rs." : "+Rs."}
                        {t.amount}
                      </strong>
                      {isAdmin && (
                        <button
                          type="button"
                          className="il-btn"
                          style={{ padding: "5px 7px" }}
                          onClick={() =>
                            requireAdminPin("Delete Ledger Entry", () =>
                              updateWorkspace((prevWs) => ({
                                ...prevWs,
                                treasury: prevWs.treasury.filter((x) => x.id !== t.id),
                              }))
                            )
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHAT TAB */}
      {tab === "chat" && (
        <div className="il-card">
          <div style={{ fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <MessageSquare size={16} color="#38bdf8" /> {ws.clubName} Locker-Room Chat
          </div>
          <div className="il-scroll-box">
            {ws.messages.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--muted)" }}>No messages yet. Start the squad chat!</div>
            ) : (
              ws.messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.sender === authPlayer.name ? "flex-end" : "flex-start",
                    maxWidth: "86%",
                    background: m.sender === authPlayer.name ? "rgba(37,99,235,0.28)" : "rgba(2,6,23,0.75)",
                    border: "1px solid var(--border)",
                    padding: "10px 12px",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11, marginBottom: 3 }}>
                    <strong style={{ color: "var(--gold)" }}>{m.sender}</strong>
                    <span style={{ color: "var(--muted)" }}>{m.timestamp}</span>
                  </div>
                  <div style={{ fontSize: 14 }}>{m.text}</div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!chatText.trim()) return;
              updateWorkspace((prevWs) => ({
                ...prevWs,
                messages: [
                  ...prevWs.messages,
                  { id: uid("m"), sender: authPlayer.name, text: chatText.trim(), timestamp: nowTime() },
                ],
              }));
              setChatText("");
            }}
            style={{ display: "flex", gap: 8, marginTop: 12 }}
          >
            <input
              className="il-input"
              placeholder={"Message as " + authPlayer.name + "..."}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
            />
            <button type="submit" className="il-btn il-btn-primary">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* LEGENDBOT AI TAB */}
      {tab === "ai" && (
        <div className="il-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
              <Bot size={18} color="#a78bfa" /> LegendBot Cricket AI
            </div>
            <span className="il-pill" style={{ background: "rgba(167,139,250,0.2)", color: "#ddd6fe" }}>
              <Sparkles size={12} /> Voice + Intel
            </span>
          </div>

          <div className="il-scroll-box">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                  background: msg.role === "user" ? "rgba(37,99,235,0.3)" : "rgba(2,6,23,0.8)",
                  border: "1px solid var(--border)",
                  padding: "10px 12px",
                  borderRadius: 12,
                }}
              >
                {msg.layer && (
                  <div style={{ fontSize: 10, color: "var(--purple)", fontWeight: 800, marginBottom: 3 }}>
                    {msg.layer}
                  </div>
                )}
                <div style={{ fontSize: 14, lineHeight: 1.45 }}>{msg.text}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, textAlign: "right" }}>
                  {msg.timestamp}
                </div>
              </div>
            ))}
            {aiLoading && <div style={{ fontSize: 12, color: "var(--cyan)" }}>LegendBot is thinking...</div>}
            <div ref={aiEndRef} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {["Orange and Purple Cap", "Club balance and dues", "Who is IN poll?", "Live score"].map((chip) => (
              <button
                key={chip}
                type="button"
                className="il-btn"
                style={{ padding: "5px 10px", fontSize: 11 }}
                onClick={() => void askLegendBot(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void askLegendBot(aiInput);
            }}
            style={{ display: "flex", gap: 8, marginTop: 10 }}
          >
            <button
              type="button"
              className={"il-btn " + (isListening ? "il-btn-danger" : "il-btn-purple")}
              onClick={toggleVoiceInput}
              title="Voice Input"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <input
              className="il-input"
              placeholder={isListening ? "Listening..." : "Ask LegendBot anything about cricket..."}
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
            />
            <button type="submit" disabled={aiLoading} className="il-btn il-btn-primary">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* SETTINGS TAB */}
      {tab === "settings" && (
        <div>
          <div className="il-card">
            <div style={{ fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Key size={16} color="#fbbf24" /> Change Your Normal Password
            </div>
            <form onSubmit={handleChangeNormalPass} style={{ display: "flex", gap: 8 }}>
              <input
                className="il-input"
                type="text"
                placeholder="Enter new normal password"
                value={newNormalPass}
                onChange={(e) => setNewNormalPass(e.target.value)}
              />
              <button type="submit" className="il-btn il-btn-primary">
                Save
              </button>
            </form>
            {passNotice && <div style={{ fontSize: 12, color: "var(--emerald)", marginTop: 6 }}>{passNotice}</div>}
          </div>

          {isAdmin && (
            <div className="il-card">
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Admin Controls ({ws.clubName})</div>
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: 4 }}>
                    PINNED ANNOUNCEMENT
                  </label>
                  <input
                    className="il-input"
                    value={announcementDraft}
                    onChange={(e) => setAnnouncementDraft(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: 4 }}>
                    GROUND NAME
                  </label>
                  <input
                    className="il-input"
                    value={groundNameDraft}
                    onChange={(e) => setGroundNameDraft(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: 4 }}>
                    GOOGLE MAPS LINK
                  </label>
                  <input
                    className="il-input"
                    value={groundUrlDraft}
                    onChange={(e) => setGroundUrlDraft(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="il-btn il-btn-gold"
                    onClick={() =>
                      requireAdminPin("Save Club Settings", () => {
                        updateWorkspace((prevWs) => ({
                          ...prevWs,
                          announcement: announcementDraft.trim() || prevWs.announcement,
                          groundName: groundNameDraft.trim() || prevWs.groundName,
                          groundMapUrl: groundUrlDraft.trim() || prevWs.groundMapUrl,
                        }));
                        setSettingsSavedMsg("Settings saved.");
                      })
                    }
                  >
                    Save Club Settings
                  </button>

                  <button
                    type="button"
                    className="il-btn il-btn-danger"
                    onClick={() =>
                      requireAdminPin("Reset ALL Data to Zero", () => {
                        const fresh = createFreshState();
                        setState(fresh);
                        setSettingsSavedMsg("All stats, matches, polls, and funds reset to zero.");
                      })
                    }
                  >
                    <RotateCcw size={15} /> Reset All Data to Zero
                  </button>
                </div>

                {settingsSavedMsg && (
                  <div style={{ fontSize: 12, color: "var(--emerald)", fontWeight: 700 }}>{settingsSavedMsg}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* HERO PLAYER PROFILE MODAL */}
      {selectedProfile && (
        <div className="il-modal-backdrop" onClick={() => setSelectedProfileId("")}>
          <div className="il-modal" style={{ padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: "relative" }}>
              <PlayerPortraitBanner playerId={selectedProfile.id} name={selectedProfile.name} height={240} />
              <div className="il-fut-fade" />
              <button
                type="button"
                className="il-btn"
                style={{ position: "absolute", top: 12, right: 12, padding: 7, background: "rgba(2,6,23,0.78)" }}
                onClick={() => setSelectedProfileId("")}
              >
                <X size={16} />
              </button>
              <div style={{ position: "absolute", left: 16, right: 16, bottom: 12 }}>
                <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 800, textTransform: "uppercase" }}>
                  {selectedProfile.role} - {selectedProfile.funAward}
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.15 }}>{selectedProfile.name}</div>
              </div>
            </div>

            <div style={{ padding: 16 }}>
              <div className="il-grid-3" style={{ textAlign: "center" }}>
                <div style={{ background: "rgba(2,6,23,0.78)", padding: 10, borderRadius: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>MATCHES</div>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>{selectedProfile.matches}</div>
                </div>
                <div style={{ background: "rgba(2,6,23,0.78)", padding: 10, borderRadius: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>RUNS</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "var(--cyan)" }}>{selectedProfile.runs}</div>
                </div>
                <div style={{ background: "rgba(2,6,23,0.78)", padding: 10, borderRadius: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>WICKETS</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "var(--purple)" }}>{selectedProfile.wickets}</div>
                </div>
                <div style={{ background: "rgba(2,6,23,0.78)", padding: 10, borderRadius: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>4s / 6s</div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{selectedProfile.fours} / {selectedProfile.sixes}</div>
                </div>
                <div style={{ background: "rgba(2,6,23,0.78)", padding: 10, borderRadius: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>DUES</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "var(--rose)" }}>Rs.{selectedProfile.finesDue}</div>
                </div>
                <div style={{ background: "rgba(2,6,23,0.78)", padding: 10, borderRadius: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>ADVANCE</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "var(--gold)" }}>Rs.{selectedProfile.advanceCredit}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDuePopup && activeUserInWs.finesDue > 0 && (
        <div className="il-modal-backdrop">
          <div className="il-modal">
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--rose)", fontWeight: 900, fontSize: 17 }}>
              <AlertTriangle size={20} /> Pending Club Due
            </div>
            <p style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.5 }}>
              Hi <strong>{activeUserInWs.name}</strong>, you have a pending club due of{" "}
              <strong style={{ color: "var(--gold)" }}>Rs.{activeUserInWs.finesDue}</strong>.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="il-btn il-btn-gold" onClick={() => setShowDuePopup(false)}>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {milestonePopup && (
        <div className="il-modal-backdrop">
          <div className="il-modal" style={{ textAlign: "center" }}>
            <h2 style={{ margin: 0, color: "var(--gold)" }}>MILESTONE!</h2>
            <p style={{ fontSize: 16, fontWeight: 700, margin: "12px 0 18px 0" }}>{milestonePopup}</p>
            <button type="button" className="il-btn il-btn-gold" onClick={() => setMilestonePopup("")}>
              Awesome!
            </button>
          </div>
        </div>
      )}

      {pinModalTitle && (
        <div className="il-modal-backdrop">
          <div className="il-modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 900, color: "var(--gold)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Lock size={16} /> Admin PIN Required
              </span>
              <button
                type="button"
                className="il-btn"
                style={{ padding: 6 }}
                onClick={() => {
                  setPinModalTitle("");
                  pendingAdminActionRef.current = null;
                }}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>{pinModalTitle}</div>
            <form onSubmit={submitAdminPin} style={{ display: "grid", gap: 10 }}>
              <input
                type="password"
                inputMode="numeric"
                className="il-input"
                placeholder="Enter Admin PIN"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError("");
                }}
                autoFocus
              />
              {pinError && <div style={{ fontSize: 12, color: "var(--rose)", fontWeight: 700 }}>{pinError}</div>}
              <button type="submit" className="il-btn il-btn-gold">
                Verify PIN
              </button>
            </form>
          </div>
        </div>
      )}

      {showGmLoginModal && (
        <div className="il-modal-backdrop">
          <div className="il-modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 900, color: "var(--gold)" }}>Ganesh Mandir Cricket Login</span>
              <button type="button" className="il-btn" style={{ padding: 6 }} onClick={() => setShowGmLoginModal(false)}>
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleGmUnlock} style={{ display: "grid", gap: 10 }}>
              <select className="il-select" value={gmLoginId} onChange={(e) => setGmLoginId(e.target.value)}>
                {allIlPlayers
                  .filter((p) => p.isGM)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              <input
                type="password"
                className="il-input"
                placeholder="Enter your password"
                value={gmLoginPass}
                onChange={(e) => {
                  setGmLoginPass(e.target.value);
                  setGmLoginErr("");
                }}
              />
              {gmLoginErr && <div style={{ fontSize: 12, color: "var(--rose)", fontWeight: 700 }}>{gmLoginErr}</div>}
              <button type="submit" className="il-btn il-btn-gold">
                Unlock Ganesh Mandir Squad
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="il-nav">
        <div className="il-nav-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={"il-nav-item " + (tab === item.id ? "active" : "")}
              onClick={() => setTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
