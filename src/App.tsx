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
} from "lucide-react";

type TabKey = "home" | "match" | "squad" | "treasury" | "chat" | "ai";
type MatchFormat = "T10" | "T20" | "CUSTOM";
type PlayerRole = "Batsman" | "Bowler" | "All-Rounder" | "Wicket-Keeper";
type LedgerType = "CREDIT" | "FINE" | "EXPENSE";

interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  matches: number;
  runs: number;
  ballsFaced: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
  finesDue: number;
}

interface BallEvent {
  id: string;
  over: number;
  ballInOver: number;
  runs: number;
  isWide: boolean;
  isNoBall: boolean;
  isWicket: boolean;
  wicketType?: string;
  batsman: string;
  bowler: string;
  timestamp: string;
}

interface MatchState {
  title: string;
  format: MatchFormat;
  totalOvers: number;
  battingTeam: string;
  bowlingTeam: string;
  runs: number;
  wickets: number;
  balls: number;
  target: number | null;
  striker: string;
  bowler: string;
  isCompleted: boolean;
  history: BallEvent[];
}

interface TreasuryEntry {
  id: string;
  title: string;
  type: LedgerType;
  amount: number;
  memberName: string;
  date: string;
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

interface ClubState {
  players: Player[];
  match: MatchState;
  treasury: TreasuryEntry[];
  messages: ChatMessage[];
}

const STORAGE_KEY = "indore_legends_v2_state";
const LAUNCH_TIMESTAMP = new Date("2026-11-29T15:00:00+05:30").getTime();

const DEFAULT_STATE: ClubState = {
  players: [
    {
      id: "p1",
      name: "Gaurav (C)",
      role: "All-Rounder",
      matches: 18,
      runs: 462,
      ballsFaced: 310,
      wickets: 19,
      oversBowled: 42,
      runsConceded: 265,
      finesDue: 0,
    },
    {
      id: "p2",
      name: "Aarav Sharma",
      role: "Batsman",
      matches: 16,
      runs: 398,
      ballsFaced: 285,
      wickets: 2,
      oversBowled: 6,
      runsConceded: 48,
      finesDue: 50,
    },
    {
      id: "p3",
      name: "Rohan Verma",
      role: "Bowler",
      matches: 17,
      runs: 112,
      ballsFaced: 98,
      wickets: 24,
      oversBowled: 51,
      runsConceded: 312,
      finesDue: 0,
    },
    {
      id: "p4",
      name: "Kabir Jain",
      role: "Wicket-Keeper",
      matches: 15,
      runs: 285,
      ballsFaced: 215,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 100,
    },
  ],
  match: {
    title: "Sunday Morning Wind-Ball Clash",
    format: "T10",
    totalOvers: 10,
    battingTeam: "Indore Legends",
    bowlingTeam: "Malwa Strikers",
    runs: 0,
    wickets: 0,
    balls: 0,
    target: null,
    striker: "Gaurav (C)",
    bowler: "Rohan Verma",
    isCompleted: false,
    history: [],
  },
  treasury: [
    {
      id: "t1",
      title: "Monthly Club Pool Contribution",
      type: "CREDIT",
      amount: 2400,
      memberName: "All Squad",
      date: "2026-11-20",
    },
    {
      id: "t2",
      title: "Wind Balls & Bat Grip Tape",
      type: "EXPENSE",
      amount: 650,
      memberName: "Gaurav (C)",
      date: "2026-11-21",
    },
    {
      id: "t3",
      title: "Late Arrival Fine (6:15 AM)",
      type: "FINE",
      amount: 50,
      memberName: "Aarav Sharma",
      date: "2026-11-22",
    },
  ],
  messages: [
    {
      id: "m1",
      sender: "Gaurav (C)",
      text: "Indore Legends Hub is live! Report at the ground by 6:00 AM sharp tomorrow.",
      timestamp: "07:00 PM",
    },
  ],
};

function loadInitialState(): ClubState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<ClubState>;
    return {
      players: Array.isArray(parsed.players) ? parsed.players : DEFAULT_STATE.players,
      match: parsed.match ? { ...DEFAULT_STATE.match, ...parsed.match } : DEFAULT_STATE.match,
      treasury: Array.isArray(parsed.treasury) ? parsed.treasury : DEFAULT_STATE.treasury,
      messages: Array.isArray(parsed.messages) ? parsed.messages : DEFAULT_STATE.messages,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function formatOvers(legalBalls: number): string {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const APP_CSS = `
  :root {
    --bg: #050816;
    --panel: rgba(15, 23, 42, 0.88);
    --panel-strong: #0f172a;
    --border: rgba(148, 163, 184, 0.18);
    --text: #f8fafc;
    --muted: #94a3b8;
    --sky: #38bdf8;
    --amber: #fbbf24;
    --emerald: #34d399;
    --rose: #fb7185;
    --violet: #a78bfa;
  }
  * { box-sizing: border-box; }
  html, body, #root {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background: radial-gradient(circle at top, #0f172a 0%, #050816 65%);
    color: var(--text);
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .il-shell {
    max-width: 920px;
    margin: 0 auto;
    padding: 14px 14px 92px 14px;
  }
  .il-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 14px 16px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 16px;
    margin-bottom: 14px;
    backdrop-filter: blur(10px);
  }
  .il-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .il-logo {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 900;
    flex-shrink: 0;
  }
  .il-card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 14px;
  }
  .il-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .il-grid-4 {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }
  @media (max-width: 600px) {
    .il-grid-4-resp {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  .il-btn {
    border: 1px solid var(--border);
    background: #1e293b;
    color: #f8fafc;
    border-radius: 12px;
    padding: 11px 14px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: transform 0.08s ease, opacity 0.15s ease;
  }
  .il-btn:active { transform: scale(0.97); }
  .il-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .il-btn-primary {
    background: linear-gradient(135deg, #0284c7, #2563eb);
    border-color: rgba(56, 189, 248, 0.5);
  }
  .il-btn-amber {
    background: rgba(245, 158, 11, 0.16);
    border-color: rgba(251, 191, 36, 0.45);
    color: #fde68a;
  }
  .il-btn-danger {
    background: rgba(225, 29, 72, 0.85);
    border-color: rgba(251, 113, 133, 0.5);
    color: #fff;
  }
  .il-btn-emerald {
    background: rgba(16, 185, 129, 0.18);
    border-color: rgba(52, 211, 153, 0.45);
    color: #6ee7b7;
  }
  .il-input, .il-select {
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background: #020617;
    color: #f8fafc;
    font-size: 14px;
    outline: none;
  }
  .il-input:focus, .il-select:focus {
    border-color: var(--sky);
  }
  .il-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .il-ball {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 12px;
    border: 1px solid var(--border);
    flex-shrink: 0;
  }
  .il-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    background: rgba(2, 6, 23, 0.94);
    border-top: 1px solid var(--border);
    backdrop-filter: blur(12px);
    display: flex;
    justify-content: center;
    padding: 8px 6px;
  }
  .il-nav-inner {
    width: 100%;
    max-width: 920px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
  }
  .il-nav-item {
    background: transparent;
    border: none;
    color: var(--muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 6px 2px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }
  .il-nav-item.active {
    color: var(--sky);
    background: rgba(56, 189, 248, 0.12);
  }
  .il-scroll-box {
    max-height: 340px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-right: 4px;
  }
`;

export default function App() {
  const [state, setState] = useState<ClubState>(() => loadInitialState());
  const [tab, setTab] = useState<TabKey>("home");

  // Launch countdown timer
  const [countdownMs, setCountdownMs] = useState<number>(() =>
    Math.max(0, LAUNCH_TIMESTAMP - Date.now())
  );

  // Match setup & umpire controls
  const [showMatchSetup, setShowMatchSetup] = useState<boolean>(false);
  const [setupTitle, setSetupTitle] = useState<string>(state.match.title);
  const [setupBatting, setSetupBatting] = useState<string>(state.match.battingTeam);
  const [setupBowling, setSetupBowling] = useState<string>(state.match.bowlingTeam);
  const [setupFormat, setSetupFormat] = useState<MatchFormat>(state.match.format);
  const [setupOvers, setSetupOvers] = useState<string>(String(state.match.totalOvers));
  const [setupTarget, setSetupTarget] = useState<string>(
    state.match.target !== null ? String(state.match.target) : ""
  );
  const [wicketType, setWicketType] = useState<string>("Bowled");
  const [umpireBanner, setUmpireBanner] = useState<string>("");

  // Squad form
  const [newPlayerName, setNewPlayerName] = useState<string>("");
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>("All-Rounder");

  // Treasury form
  const [entryTitle, setEntryTitle] = useState<string>("");
  const [entryType, setEntryType] = useState<LedgerType>("CREDIT");
  const [entryAmount, setEntryAmount] = useState<string>("");
  const [entryMember, setEntryMember] = useState<string>("Gaurav (C)");

  // Chat form
  const [chatSender, setChatSender] = useState<string>("Gaurav (C)");
  const [chatText, setChatText] = useState<string>("");

  // LegendBot AI
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [aiInput, setAiInput] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<BotMessage[]>([
    {
      id: "bot_welcome",
      role: "bot",
      layer: "Layer 1 • Club Engine",
      text: "Namaste Legends! I am LegendBot. Ask me about the live match score, required run rate, top squad performers, club balance, or cricket rules.",
      timestamp: nowTime(),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const aiEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors in restricted browsers
    }
  }, [state]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownMs(Math.max(0, LAUNCH_TIMESTAMP - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (tab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    if (tab === "ai") {
      aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.messages.length, aiMessages.length, tab]);

  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-IN";
        utter.rate = 1.05;
        window.speechSynthesis.speak(utter);
      } catch {
        // Ignore TTS failures on unsupported devices
      }
    }
  };

  // Derived Club Metrics
  const totalClubRuns = state.players.reduce((sum, p) => sum + p.runs, 0);
  const totalClubWickets = state.players.reduce((sum, p) => sum + p.wickets, 0);
  const totalCredits = state.treasury
    .filter((t) => t.type === "CREDIT" || t.type === "FINE")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = state.treasury
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const clubBalance = totalCredits - totalExpenses;
  const totalPendingFines = state.players.reduce((sum, p) => sum + p.finesDue, 0);

  const topScorer = [...state.players].sort((a, b) => b.runs - a.runs)[0];
  const topBowler = [...state.players].sort((a, b) => b.wickets - a.wickets)[0];

  // Derived Live Match Metrics
  const { match } = state;
  const maxBalls = match.totalOvers * 6;
  const ballsLeft = Math.max(0, maxBalls - match.balls);
  const currentRunRate = match.balls > 0 ? (match.runs / (match.balls / 6)).toFixed(2) : "0.00";
  const runsNeeded = match.target !== null ? Math.max(0, match.target - match.runs) : null;
  const requiredRunRate =
    runsNeeded !== null && ballsLeft > 0
      ? (runsNeeded / (ballsLeft / 6)).toFixed(2)
      : "0.00";

  // Countdown breakdown
  const cdTotalSec = Math.floor(countdownMs / 1000);
  const cdDays = String(Math.floor(cdTotalSec / 86400)).padStart(2, "0");
  const cdHours = String(Math.floor((cdTotalSec % 86400) / 3600)).padStart(2, "0");
  const cdMins = String(Math.floor((cdTotalSec % 3600) / 60)).padStart(2, "0");
  const cdSecs = String(cdTotalSec % 60).padStart(2, "0");

  // Live Match Handlers
  const triggerUmpireCall = (callLabel: string) => {
    setUmpireBanner(callLabel);
    speakText(callLabel);
  };

  const recordBall = (
    runsScored: number,
    options?: { isWide?: boolean; isNoBall?: boolean; isWicket?: boolean }
  ) => {
    if (match.isCompleted) return;

    const isWide = Boolean(options?.isWide);
    const isNoBall = Boolean(options?.isNoBall);
    const isWicket = Boolean(options?.isWicket);
    const isLegal = !isWide && !isNoBall;
    const extra = isWide || isNoBall ? 1 : 0;

    const nextRuns = match.runs + runsScored + extra;
    const nextWickets = isWicket ? match.wickets + 1 : match.wickets;
    const nextBalls = isLegal ? match.balls + 1 : match.balls;

    const event: BallEvent = {
      id: uid("ball"),
      over: Math.floor(match.balls / 6),
      ballInOver: (match.balls % 6) + 1,
      runs: runsScored + extra,
      isWide,
      isNoBall,
      isWicket,
      wicketType: isWicket ? wicketType : undefined,
      batsman: match.striker,
      bowler: match.bowler,
      timestamp: nowTime(),
    };

    const targetReached = match.target !== null && nextRuns >= match.target;
    const isCompleted = nextBalls >= maxBalls || nextWickets >= 10 || targetReached;

    if (isWicket) {
      triggerUmpireCall(`OUT! ${wicketType}!`);
    } else if (runsScored === 6) {
      triggerUmpireCall("MAXIMUM SIX!");
    } else if (runsScored === 4) {
      triggerUmpireCall("CRACKING FOUR!");
    } else if (isWide) {
      triggerUmpireCall("WIDE BALL!");
    } else if (isNoBall) {
      triggerUmpireCall("NO BALL! FREE HIT!");
    }

    setState((prev) => ({
      ...prev,
      match: {
        ...prev.match,
        runs: nextRuns,
        wickets: nextWickets,
        balls: nextBalls,
        isCompleted,
        history: [event, ...prev.match.history],
      },
    }));
  };

  const undoLastBall = () => {
    if (match.history.length === 0) return;
    const [last, ...rest] = match.history;
    const wasLegal = !last.isWide && !last.isNoBall;

    setState((prev) => ({
      ...prev,
      match: {
        ...prev.match,
        runs: Math.max(0, prev.match.runs - last.runs),
        wickets: last.isWicket ? Math.max(0, prev.match.wickets - 1) : prev.match.wickets,
        balls: wasLegal ? Math.max(0, prev.match.balls - 1) : prev.match.balls,
        isCompleted: false,
        history: rest,
      },
    }));
    setUmpireBanner("Last delivery undone.");
  };

  const handleStartNewMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedOvers = Math.max(1, Math.min(50, Number(setupOvers) || 10));
    const parsedTarget = setupTarget.trim() === "" ? null : Math.max(1, Number(setupTarget) || 1);

    setState((prev) => ({
      ...prev,
      match: {
        ...prev.match,
        title: setupTitle.trim() || "Indore Legends Match",
        battingTeam: setupBatting.trim() || "Indore Legends",
        bowlingTeam: setupBowling.trim() || "Opponents",
        format: setupFormat,
        totalOvers: parsedOvers,
        target: parsedTarget,
        runs: 0,
        wickets: 0,
        balls: 0,
        isCompleted: false,
        history: [],
      },
    }));
    setShowMatchSetup(false);
    triggerUmpireCall("Play! New match started.");
  };

  // Squad Handlers
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const player: Player = {
      id: uid("pl"),
      name: newPlayerName.trim(),
      role: newPlayerRole,
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      finesDue: 0,
    };
    setState((prev) => ({ ...prev, players: [...prev.players, player] }));
    setNewPlayerName("");
  };

  const bumpPlayerStat = (
    playerId: string,
    field: "matches" | "runs" | "wickets" | "finesDue",
    delta: number
  ) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) => {
        if (p.id !== playerId) return p;
        const nextVal = Math.max(0, p[field] + delta);
        const nextBalls = field === "runs" && delta > 0 ? p.ballsFaced + Math.ceil(delta * 0.7) : p.ballsFaced;
        const nextOvers = field === "wickets" && delta > 0 ? p.oversBowled + 1 : p.oversBowled;
        return {
          ...p,
          [field]: nextVal,
          ballsFaced: nextBalls,
          oversBowled: nextOvers,
        };
      }),
    }));
  };

  const deletePlayer = (playerId: string) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== playerId),
    }));
  };

  // Treasury Handlers
  const handleAddTreasury = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(entryAmount);
    if (!entryTitle.trim() || !amount || amount <= 0) return;

    const entry: TreasuryEntry = {
      id: uid("tr"),
      title: entryTitle.trim(),
      type: entryType,
      amount,
      memberName: entryMember.trim() || "Club Member",
      date: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({ ...prev, treasury: [entry, ...prev.treasury] }));
    setEntryTitle("");
    setEntryAmount("");
  };

  const deleteTreasury = (entryId: string) => {
    setState((prev) => ({
      ...prev,
      treasury: prev.treasury.filter((t) => t.id !== entryId),
    }));
  };

  // Locker-Room Chat Handler
  const sendChatMessage = (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean) return;
    const msg: ChatMessage = {
      id: uid("msg"),
      sender: chatSender.trim() || "Legend",
      text: clean,
      timestamp: nowTime(),
    };
    setState((prev) => ({ ...prev, messages: [...prev.messages, msg] }));
    setChatText("");
  };

  // 4-Layer LegendBot Engine
  const askLegendBot = async (questionRaw: string) => {
    const question = questionRaw.trim();
    if (!question || aiLoading) return;

    const userMsg: BotMessage = {
      id: uid("u"),
      role: "user",
      text: question,
      timestamp: nowTime(),
    };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput("");

    const q = question.toLowerCase();

    // Layer 1: Live Match Intelligence
    if (q.includes("score") || q.includes("match") || q.includes("run rate") || q.includes("over") || q.includes("target")) {
      const targetLine =
        match.target !== null
          ? ` Need ${runsNeeded} runs off ${ballsLeft} balls (RRR ${requiredRunRate}).`
          : "";
      const reply = `${match.battingTeam} are ${match.runs}/${match.wickets} in ${formatOvers(match.balls)}/${match.totalOvers} overs (CRR ${currentRunRate}).${targetLine} Striker: ${match.striker}, Bowler: ${match.bowler}.`;
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Layer 1 • Live Match Engine", text: reply, timestamp: nowTime() },
      ]);
      speakText(reply);
      return;
    }

    // Layer 2: Squad & Treasury Intelligence
    if (q.includes("balance") || q.includes("treasury") || q.includes("money") || q.includes("fine")) {
      const reply = `Indore Legends club balance is Rs. ${clubBalance} (Collected: Rs. ${totalCredits}, Expenses: Rs. ${totalExpenses}). Pending player fines: Rs. ${totalPendingFines}.`;
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Layer 2 • Treasury Ledger", text: reply, timestamp: nowTime() },
      ]);
      speakText(reply);
      return;
    }

    if (q.includes("top") || q.includes("best") || q.includes("squad") || q.includes("player") || q.includes("mvp")) {
      const reply = `We have ${state.players.length} squad players. Top Run Scorer: ${topScorer ? `${topScorer.name} (${topScorer.runs} runs)` : "None"}. Top Wicket Taker: ${topBowler ? `${topBowler.name} (${topBowler.wickets} wickets)` : "None"}.`;
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Layer 2 • Squad Intel", text: reply, timestamp: nowTime() },
      ]);
      speakText(reply);
      return;
    }

    // Layer 3: Local Cricket Rules & Strategy
    if (q.includes("rule") || q.includes("no ball") || q.includes("wide") || q.includes("free hit") || q.includes("tip")) {
      const reply =
        "Cricket Rule Quick Guide: A Wide or No-Ball adds +1 extra run and does NOT count as a legal ball in the over. After a foot No-Ball, the next legal ball is a Free Hit (only Run Out, Obstructing the Field, or Hit Twice can dismiss the batter).";
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Layer 3 • Cricket Rulebook", text: reply, timestamp: nowTime() },
      ]);
      speakText(reply);
      return;
    }

    // Layer 4: Cloud AI (/api/chat -> Groq) with graceful offline fallback
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: question,
          context: {
            score: `${match.runs}/${match.wickets} (${formatOvers(match.balls)} ov)`,
            clubBalance,
            playersCount: state.players.length,
            topScorer: topScorer?.name || "N/A",
          },
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (res.ok && data.reply) {
        setAiMessages((prev) => [
          ...prev,
          { id: uid("b"), role: "bot", layer: "Layer 4 • Groq Cloud AI", text: data.reply || "", timestamp: nowTime() },
        ]);
        speakText(data.reply);
      } else {
        throw new Error(data.error || "API unavailable");
      }
    } catch {
      const fallback = `LegendBot Offline Mode: Current match is ${match.runs}/${match.wickets} (${formatOvers(match.balls)} ov), club balance is Rs. ${clubBalance}. Try asking about "live score", "top scorer", "club balance", or "cricket rules" — or add GROQ_API_KEY in Vercel for full AI chat.`;
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Layer 4 • Safe Fallback", text: fallback, timestamp: nowTime() },
      ]);
      speakText(fallback);
    } finally {
      setAiLoading(false);
    }
  };

  const renderBallStyle = (b: BallEvent): React.CSSProperties => {
    if (b.isWicket) return { background: "#e11d48", color: "#fff", borderColor: "#fb7185" };
    if (b.isWide || b.isNoBall) return { background: "rgba(245,158,11,0.22)", color: "#fde68a", borderColor: "#fbbf24" };
    if (b.runs === 6) return { background: "linear-gradient(135deg,#f59e0b,#ea580c)", color: "#fff", borderColor: "#fcd34d" };
    if (b.runs === 4) return { background: "#0284c7", color: "#fff", borderColor: "#38bdf8" };
    return { background: "#1e293b", color: "#cbd5e1", borderColor: "#334155" };
  };

  const renderBallLabel = (b: BallEvent): string => {
    if (b.isWicket) return "W";
    if (b.isWide) return "WD";
    if (b.isNoBall) return "NB";
    return String(b.runs);
  };

  return (
    <div className="il-shell">
      <style>{APP_CSS}</style>

      {/* Top App Bar */}
      <header className="il-header">
        <div className="il-brand">
          <div className="il-logo">IL</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: "0.02em" }}>
              INDORE LEGENDS
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              Club Hub • Scorer • Umpire • LegendBot
            </div>
          </div>
        </div>
        <button
          type="button"
          className="il-btn"
          style={{ padding: "8px 10px", fontSize: 12 }}
          onClick={() => setVoiceEnabled((v) => !v)}
          title="Toggle Voice TTS"
        >
          {voiceEnabled ? <Volume2 size={16} color="#34d399" /> : <VolumeX size={16} color="#94a3b8" />}
          <span>{voiceEnabled ? "Voice On" : "Muted"}</span>
        </button>
      </header>

      {/* ==================== HOME TAB ==================== */}
      {tab === "home" && (
        <div>
          {/* GTA-style Launch Countdown Strip */}
          <div
            className="il-card"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,94,151,0.18), rgba(76,29,149,0.35), rgba(15,23,42,0.92))",
              borderColor: "rgba(255, 138, 61, 0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span className="il-pill" style={{ background: "rgba(251,191,36,0.18)", color: "#fcd34d" }}>
                <Flame size={13} /> Season Launch Countdown
              </span>
              <span style={{ fontSize: 11, color: "#cbd5e1", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Clock size={13} /> Nov 29, 2026 • 3:00 PM IST
              </span>
            </div>

            <div className="il-grid-4" style={{ marginTop: 14 }}>
              {[
                { label: "DAYS", val: cdDays, color: "#ff4ecd" },
                { label: "HOURS", val: cdHours, color: "#ff8a3d" },
                { label: "MINS", val: cdMins, color: "#38e8ff" },
                { label: "SECS", val: cdSecs, color: "#ffd166" },
              ].map((u) => (
                <div
                  key={u.label}
                  style={{
                    background: "rgba(2, 6, 23, 0.72)",
                    borderRadius: 12,
                    padding: "12px 6px",
                    textAlign: "center",
                    borderBottom: `3px solid ${u.color}`,
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
                    {u.val}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: u.color }}>
                    {u.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Match Spotlight */}
          <div className="il-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="il-pill" style={{ background: "rgba(52,211,153,0.16)", color: "#6ee7b7" }}>
                <Activity size={13} /> {match.isCompleted ? "Match Finished" : "Live Match"}
              </span>
              <button
                type="button"
                className="il-btn il-btn-primary"
                style={{ padding: "7px 12px", fontSize: 12 }}
                onClick={() => setTab("match")}
              >
                Open Scorer
              </button>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{match.title}</div>
            <div style={{ fontSize: 19, fontWeight: 800, marginTop: 2 }}>
              {match.battingTeam} vs {match.bowlingTeam}
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 34, fontWeight: 900 }}>
                {match.runs}/{match.wickets}
              </span>
              <span style={{ color: "var(--sky)", fontWeight: 700 }}>
                ({formatOvers(match.balls)} / {match.totalOvers} ov)
              </span>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>CRR {currentRunRate}</span>
            </div>
          </div>

          {/* 4 KPI Cards */}
          <div className="il-grid-4 il-grid-4-resp" style={{ marginBottom: 14 }}>
            <div className="il-card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>SQUAD SIZE</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{state.players.length}</div>
            </div>
            <div className="il-card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>CLUB BALANCE</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4, color: "var(--emerald)" }}>
                ₹{clubBalance}
              </div>
            </div>
            <div className="il-card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>CLUB RUNS</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4, color: "var(--sky)" }}>
                {totalClubRuns}
              </div>
            </div>
            <div className="il-card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>CLUB WICKETS</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4, color: "var(--amber)" }}>
                {totalClubWickets}
              </div>
            </div>
          </div>

          {/* MVP Leaders */}
          <div className="il-grid-2">
            <div className="il-card" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--amber)", fontSize: 12, fontWeight: 700 }}>
                <Trophy size={15} /> TOP RUN SCORER
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6 }}>
                {topScorer ? topScorer.name : "No Players"}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                {topScorer ? `${topScorer.runs} runs in ${topScorer.matches} matches` : "-"}
              </div>
            </div>

            <div className="il-card" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--sky)", fontSize: 12, fontWeight: 700 }}>
                <Award size={15} /> TOP WICKET TAKER
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6 }}>
                {topBowler ? topBowler.name : "No Players"}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                {topBowler ? `${topBowler.wickets} wickets in ${topBowler.matches} matches` : "-"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== LIVE MATCH TAB ==================== */}
      {tab === "match" && (
        <div>
          {/* Scoreboard Card */}
          <div className="il-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--amber)", fontWeight: 700, textTransform: "uppercase" }}>
                  {match.format} • {match.title}
                </div>
                <h2 style={{ margin: "4px 0 0 0", fontSize: 20 }}>
                  {match.battingTeam} vs {match.bowlingTeam}
                </h2>
              </div>
              <button
                type="button"
                className="il-btn"
                style={{ padding: "8px 12px", fontSize: 12 }}
                onClick={() => setShowMatchSetup((s) => !s)}
              >
                <Play size={14} /> {showMatchSetup ? "Close Setup" : "New Match"}
              </button>
            </div>

            {showMatchSetup && (
              <form
                onSubmit={handleStartNewMatch}
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(2,6,23,0.75)",
                  border: "1px solid var(--border)",
                  display: "grid",
                  gap: 10,
                }}
              >
                <input
                  className="il-input"
                  value={setupTitle}
                  onChange={(e) => setSetupTitle(e.target.value)}
                  placeholder="Match Title"
                />
                <div className="il-grid-2">
                  <input
                    className="il-input"
                    value={setupBatting}
                    onChange={(e) => setSetupBatting(e.target.value)}
                    placeholder="Batting Team"
                  />
                  <input
                    className="il-input"
                    value={setupBowling}
                    onChange={(e) => setSetupBowling(e.target.value)}
                    placeholder="Bowling Team"
                  />
                </div>
                <div className="il-grid-4">
                  <select
                    className="il-select"
                    value={setupFormat}
                    onChange={(e) => {
                      const val = e.target.value as MatchFormat;
                      setSetupFormat(val);
                      if (val === "T10") setSetupOvers("10");
                      if (val === "T20") setSetupOvers("20");
                    }}
                  >
                    <option value="T10">T10</option>
                    <option value="T20">T20</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                  <input
                    className="il-input"
                    type="number"
                    min={1}
                    max={50}
                    value={setupOvers}
                    onChange={(e) => setSetupOvers(e.target.value)}
                    placeholder="Overs"
                  />
                  <input
                    className="il-input"
                    type="number"
                    min={1}
                    value={setupTarget}
                    onChange={(e) => setSetupTarget(e.target.value)}
                    placeholder="Target (opt)"
                  />
                  <button type="submit" className="il-btn il-btn-primary">
                    Start
                  </button>
                </div>
              </form>
            )}

            {/* Main Score Display */}
            <div
              style={{
                marginTop: 14,
                padding: 16,
                borderRadius: 14,
                background: "rgba(2, 6, 23, 0.8)",
                border: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, lineHeight: 1 }}>
                    {match.runs}/{match.wickets}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "var(--sky)" }}>
                    ({formatOvers(match.balls)} / {match.totalOvers} ov)
                  </span>
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
                  CRR: <strong style={{ color: "#fff" }}>{currentRunRate}</strong>
                  {match.target !== null && (
                    <>
                      {" "}• Target: <strong style={{ color: "var(--amber)" }}>{match.target}</strong> • Need{" "}
                      <strong style={{ color: "var(--emerald)" }}>{runsNeeded}</strong> in {ballsLeft}b (RRR{" "}
                      {requiredRunRate})
                    </>
                  )}
                </div>
              </div>
              <span
                className="il-pill"
                style={{
                  background: match.isCompleted ? "rgba(52,211,153,0.18)" : "rgba(244,63,94,0.18)",
                  color: match.isCompleted ? "#6ee7b7" : "#fda4af",
                }}
              >
                {match.isCompleted ? <CheckCircle size={13} /> : <Activity size={13} />}
                {match.isCompleted ? "Innings Over" : "Live"}
              </span>
            </div>

            {/* Striker & Bowler Selector */}
            <div className="il-grid-2" style={{ marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>STRIKER</div>
                <select
                  className="il-select"
                  value={match.striker}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, match: { ...prev.match, striker: e.target.value } }))
                  }
                >
                  {state.players.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                  {!state.players.some((p) => p.name === match.striker) && (
                    <option value={match.striker}>{match.striker}</option>
                  )}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>BOWLER</div>
                <select
                  className="il-select"
                  value={match.bowler}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, match: { ...prev.match, bowler: e.target.value } }))
                  }
                >
                  {state.players.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                  {!state.players.some((p) => p.name === match.bowler) && (
                    <option value={match.bowler}>{match.bowler}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Scoring Keypad */}
            <div className="il-grid-4" style={{ marginTop: 14 }}>
              {[0, 1, 2, 3, 4, 6].map((run) => (
                <button
                  key={run}
                  type="button"
                  disabled={match.isCompleted}
                  className={`il-btn ${run === 4 ? "il-btn-primary" : run === 6 ? "il-btn-amber" : ""}`}
                  onClick={() => recordBall(run)}
                >
                  +{run}
                </button>
              ))}
              <button
                type="button"
                disabled={match.isCompleted}
                className="il-btn il-btn-amber"
                onClick={() => recordBall(0, { isWide: true })}
              >
                WD
              </button>
              <button
                type="button"
                disabled={match.isCompleted}
                className="il-btn il-btn-amber"
                onClick={() => recordBall(0, { isNoBall: true })}
              >
                NB
              </button>
            </div>

            {/* Wicket + Undo */}
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
                  disabled={match.isCompleted}
                  className="il-btn il-btn-danger"
                  style={{ flex: 1 }}
                  onClick={() => recordBall(0, { isWicket: true })}
                >
                  <AlertTriangle size={15} /> OUT
                </button>
              </div>

              <button
                type="button"
                disabled={match.history.length === 0}
                className="il-btn"
                onClick={undoLastBall}
              >
                <RotateCcw size={15} /> Undo Last Ball
              </button>
            </div>
          </div>

          {/* Umpire Terminal Card */}
          <div className="il-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800 }}>
                <Shield size={16} color="#fbbf24" /> Umpire Terminal
              </div>
              {umpireBanner && (
                <span className="il-pill" style={{ background: "rgba(56,189,248,0.18)", color: "#7dd3fc" }}>
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
                  onClick={() => triggerUmpireCall(`Umpire Signal: ${sig}`)}
                >
                  {sig}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Deliveries */}
          <div className="il-card">
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Ball-by-Ball Timeline</div>
            {match.history.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                No deliveries bowled yet. Tap a run button above to start scoring!
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8 }}>
                  {match.history.slice(0, 12).map((b) => (
                    <span key={b.id} className="il-ball" style={renderBallStyle(b)}>
                      {renderBallLabel(b)}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  {match.history.slice(0, 6).map((b) => (
                    <div
                      key={b.id}
                      style={{
                        fontSize: 12,
                        color: "#cbd5e1",
                        background: "rgba(2,6,23,0.65)",
                        padding: "8px 10px",
                        borderRadius: 10,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        <strong>Ov {b.over}.{b.ballInOver}</strong> — {b.bowler} to {b.batsman}:{" "}
                        {b.isWicket
                          ? `WICKET (${b.wicketType || "Out"})`
                          : b.isWide
                          ? "Wide (+1)"
                          : b.isNoBall
                          ? "No Ball (+1)"
                          : `${b.runs} run(s)`}
                      </span>
                      <span style={{ color: "var(--muted)" }}>{b.timestamp}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== SQUAD TAB ==================== */}
      {tab === "squad" && (
        <div>
          <form onSubmit={handleAddPlayer} className="il-card">
            <div style={{ fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Users size={16} color="#38bdf8" /> Add Squad Player
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px auto", gap: 8 }}>
              <input
                className="il-input"
                placeholder="Player Name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
              />
              <select
                className="il-select"
                value={newPlayerRole}
                onChange={(e) => setNewPlayerRole(e.target.value as PlayerRole)}
              >
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-Rounder">All-Rounder</option>
                <option value="Wicket-Keeper">Wicket-Keeper</option>
              </select>
              <button type="submit" className="il-btn il-btn-primary">
                <Plus size={16} /> Add
              </button>
            </div>
          </form>

          {state.players.map((p) => {
            const sr = p.ballsFaced > 0 ? ((p.runs / p.ballsFaced) * 100).toFixed(1) : "0.0";
            const econ = p.oversBowled > 0 ? (p.runsConceded / p.oversBowled).toFixed(2) : "0.00";
            return (
              <div key={p.id} className="il-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--sky)" }}>{p.role}</div>
                  </div>
                  <button
                    type="button"
                    className="il-btn"
                    style={{ padding: "6px 8px", color: "#fb7185" }}
                    onClick={() => deletePlayer(p.id)}
                    title="Remove player"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="il-grid-4" style={{ marginTop: 10, textAlign: "center" }}>
                  <div style={{ background: "rgba(2,6,23,0.65)", padding: 8, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>RUNS</div>
                    <div style={{ fontWeight: 800 }}>{p.runs}</div>
                  </div>
                  <div style={{ background: "rgba(2,6,23,0.65)", padding: 8, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>SR</div>
                    <div style={{ fontWeight: 800 }}>{sr}</div>
                  </div>
                  <div style={{ background: "rgba(2,6,23,0.65)", padding: 8, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>WKTS</div>
                    <div style={{ fontWeight: 800 }}>{p.wickets}</div>
                  </div>
                  <div style={{ background: "rgba(2,6,23,0.65)", padding: 8, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>ECON</div>
                    <div style={{ fontWeight: 800 }}>{econ}</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  <button
                    type="button"
                    className="il-btn"
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    onClick={() => bumpPlayerStat(p.id, "matches", 1)}
                  >
                    +1 Mat ({p.matches})
                  </button>
                  <button
                    type="button"
                    className="il-btn il-btn-emerald"
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    onClick={() => bumpPlayerStat(p.id, "runs", 10)}
                  >
                    +10 Runs
                  </button>
                  <button
                    type="button"
                    className="il-btn il-btn-primary"
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    onClick={() => bumpPlayerStat(p.id, "wickets", 1)}
                  >
                    +1 Wkt
                  </button>
                  <button
                    type="button"
                    className="il-btn il-btn-amber"
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    onClick={() => bumpPlayerStat(p.id, "finesDue", p.finesDue > 0 ? -p.finesDue : 50)}
                  >
                    {p.finesDue > 0 ? `Clear Fine (₹${p.finesDue})` : "+₹50 Fine"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== TREASURY TAB ==================== */}
      {tab === "treasury" && (
        <div>
          <div className="il-grid-2" style={{ marginBottom: 14 }}>
            <div className="il-card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>NET TREASURY BALANCE</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--emerald)", marginTop: 4 }}>
                ₹{clubBalance}
              </div>
            </div>
            <div className="il-card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>TOTAL EXPENSES</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--rose)", marginTop: 4 }}>
                ₹{totalExpenses}
              </div>
            </div>
          </div>

          <form onSubmit={handleAddTreasury} className="il-card">
            <div style={{ fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Wallet size={16} color="#34d399" /> Record Transaction / Fine
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <input
                className="il-input"
                placeholder="Description (e.g., Turf Rent, Late Fine, Match Ball)"
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
              />
              <div className="il-grid-4">
                <select
                  className="il-select"
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value as LedgerType)}
                >
                  <option value="CREDIT">Credit (+)</option>
                  <option value="FINE">Fine (+)</option>
                  <option value="EXPENSE">Expense (-)</option>
                </select>
                <input
                  className="il-input"
                  type="number"
                  min={1}
                  placeholder="Amount ₹"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                />
                <input
                  className="il-input"
                  placeholder="Member"
                  value={entryMember}
                  onChange={(e) => setEntryMember(e.target.value)}
                />
                <button type="submit" className="il-btn il-btn-primary">
                  <Plus size={15} /> Save
                </button>
              </div>
            </div>
          </form>

          <div className="il-card">
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Club Ledger</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {state.treasury.map((item) => {
                const isExpense = item.type === "EXPENSE";
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(2,6,23,0.65)",
                      padding: "10px 12px",
                      borderRadius: 12,
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        {item.memberName} • {item.date} • {item.type}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          fontWeight: 800,
                          color: isExpense ? "var(--rose)" : "var(--emerald)",
                        }}
                      >
                        {isExpense ? "-" : "+"}₹{item.amount}
                      </span>
                      <button
                        type="button"
                        className="il-btn"
                        style={{ padding: "5px 7px", color: "#94a3b8" }}
                        onClick={() => deleteTreasury(item.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== LOCKER-ROOM CHAT TAB ==================== */}
      {tab === "chat" && (
        <div className="il-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8 }}>
            <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
              <MessageSquare size={16} color="#38bdf8" /> Locker-Room Chat
            </div>
            <select
              className="il-select"
              style={{ width: 150, padding: "6px 8px", fontSize: 12 }}
              value={chatSender}
              onChange={(e) => setChatSender(e.target.value)}
            >
              {state.players.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="il-scroll-box">
            {state.messages.map((m) => (
              <div
                key={m.id}
                style={{
                  background: "rgba(2,6,23,0.72)",
                  border: "1px solid var(--border)",
                  padding: "10px 12px",
                  borderRadius: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <strong style={{ color: "var(--sky)" }}>{m.sender}</strong>
                  <span style={{ color: "var(--muted)" }}>{m.timestamp}</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.4 }}>{m.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {["Match at 6 AM sharp!", "GG boys!", "Bring extra wind ball"].map((quick) => (
              <button
                key={quick}
                type="button"
                className="il-btn"
                style={{ padding: "5px 10px", fontSize: 11 }}
                onClick={() => sendChatMessage(quick)}
              >
                {quick}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendChatMessage(chatText);
            }}
            style={{ display: "flex", gap: 8, marginTop: 10 }}
          >
            <input
              className="il-input"
              placeholder="Message the squad..."
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
            />
            <button type="submit" className="il-btn il-btn-primary">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* ==================== LEGENDBOT AI TAB ==================== */}
      {tab === "ai" && (
        <div className="il-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
              <Bot size={18} color="#a78bfa" /> LegendBot AI
            </div>
            <span className="il-pill" style={{ background: "rgba(167,139,250,0.16)", color: "#c4b5fd" }}>
              <Sparkles size={12} /> 4-Layer Engine
            </span>
          </div>

          <div className="il-scroll-box">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                  background:
                    msg.role === "user" ? "rgba(37,99,235,0.32)" : "rgba(2,6,23,0.78)",
                  border: "1px solid var(--border)",
                  padding: "10px 12px",
                  borderRadius: 12,
                }}
              >
                {msg.layer && (
                  <div style={{ fontSize: 10, color: "var(--violet)", fontWeight: 700, marginBottom: 4 }}>
                    {msg.layer}
                  </div>
                )}
                <div style={{ fontSize: 14, lineHeight: 1.45 }}>{msg.text}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, textAlign: "right" }}>
                  {msg.timestamp}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div style={{ fontSize: 12, color: "var(--sky)" }}>LegendBot is thinking...</div>
            )}
            <div ref={aiEndRef} />
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {["Live score update", "Top scorer?", "Club balance?", "No ball rule"].map((chip) => (
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
            <input
              className="il-input"
              placeholder="Ask LegendBot anything..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
            />
            <button type="submit" disabled={aiLoading} className="il-btn il-btn-primary">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* Bottom Mobile Navigation */}
      <nav className="il-nav">
        <div className="il-nav-inner">
          {(
            [
              { id: "home", label: "Home", icon: <Home size={18} /> },
              { id: "match", label: "Live", icon: <Trophy size={18} /> },
              { id: "squad", label: "Squad", icon: <Users size={18} /> },
              { id: "treasury", label: "Ledger", icon: <Wallet size={18} /> },
              { id: "chat", label: "Chat", icon: <MessageSquare size={18} /> },
              { id: "ai", label: "AI Bot", icon: <Bot size={18} /> },
            ] as { id: TabKey; label: string; icon: React.ReactNode }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`il-nav-item ${tab === item.id ? "active" : ""}`}
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
