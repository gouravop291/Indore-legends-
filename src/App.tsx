import React, { useState, useEffect, useRef } from "react";
import {
  subscribeLockerChat,
  sendCloudLockerMessage,
  fetchLockerMessages,
  type CloudChatMessage,
} from "./firebaseChat";
import { loadBinState, saveBinState } from "./jsonbinSync";
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
  UserPlus,
  Edit3,
  Star,
  CreditCard,
  Copy,
  Check,
  Download,
  Upload,
} from "lucide-react";

type TabKey = "home" | "match" | "squad" | "leaderboard" | "treasury" | "chat" | "ai" | "settings";
type WorkspaceKey = "il" | "gm";
type ThemeKey = "blue" | "gold" | "emerald";
type PlayerRole = "Batsman" | "Bowler" | "All-Rounder" | "Wicket-Keeper";
type LedgerType = "CREDIT" | "FINE" | "EXPENSE" | "ADVANCE";
type PollChoice = "IN" | "OUT" | "MAYBE";
type BadgeRarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

interface MatchPlayerDelta {
  matches: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
  mvpPoints: number;
}

interface CelebrationEvent {
  id: string;
  kind: "fifty" | "century" | "wicket" | "hattrick" | "haul" | "six" | "four";
  title: string;
  subtitle: string;
  badgeText: string;
}

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
  jerseyNo: number;
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
  mvpPoints: number;
  finesDue: number;
  advanceCredit: number;
  funAward: string;
  badgeRarity?: BadgeRarity;
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
  wonFlag: "W" | "L" | "T";
  mvp: string;
  scorecardText: string;
  playerStats?: Record<string, MatchPlayerDelta>;
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
  chatClearedAtMs?: number;
}

interface AppState {
  theme: ThemeKey;
  customPasswords: Record<string, string>;
  workspaces: Record<WorkspaceKey, WorkspaceData>;
  testMode?: boolean;
  maintenanceMode?: boolean;
  monthlyAdminId?: string | null;
  monthlyAdminCycle?: string;
}

type CloudSyncPayload = Pick<
  AppState,
  "customPasswords" | "workspaces" | "testMode" | "maintenanceMode" | "monthlyAdminId" | "monthlyAdminCycle"
>;

interface AuthSession {
  playerId: string;
}

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

const STORAGE_KEY = "indore_legends_pro_v6";
const PENDING_SYNC_KEY = "indore_legends_pending_bin_sync_v1";
const ADMIN_PIN = "450718";
const DEFAULT_LAUNCH_TIME = "2026-11-28T17:00:00+05:30";
const PERMANENT_ADMIN_IDS = ["p1", "p2"];
const SPIN_OWNER_ID = "p1";

const CODE39_MAP: Record<string, string> = {
  "0": "nnnwwnwnn",
  "1": "wnnwnnnnw",
  "2": "nnwwnnnnw",
  "3": "wnwwnnnnn",
  "4": "nnnwwnnnw",
  "5": "wnnwwnnnn",
  "6": "nnwwwnnnn",
  "7": "nnnwnnwnw",
  "8": "wnnwnnwnn",
  "9": "nnwwnnwnn",
  A: "wnnnnwnnw",
  B: "nnwnnwnnw",
  C: "wnwnnwnnn",
  D: "nnnnwwnnw",
  E: "wnnnwwnnn",
  F: "nnwnwwnnn",
  G: "nnnnnwwnw",
  H: "wnnnnwwnn",
  I: "nnwnnwwnn",
  J: "nnnnwwwnn",
  K: "wnnnnnnww",
  L: "nnwnnnnww",
  M: "wnwnnnnwn",
  N: "nnnnwnnww",
  O: "wnnnwnnwn",
  P: "nnwnwnnwn",
  Q: "nnnnnnwww",
  R: "wnnnnnwwn",
  S: "nnwnnnwwn",
  T: "nnnnwnwwn",
  U: "wwnnnnnnw",
  V: "nwwnnnnnw",
  W: "wwwnnnnnn",
  X: "nwnnwnnnw",
  Y: "wwnnwnnnn",
  Z: "nwwnwnnnn",
  "-": "nwnnnnwnw",
  "*": "nwnnwnwnn",
};

function makeZeroRoster(): Player[] {
  return [
    {
      id: "p1",
      name: "Gaurav Lalwani",
      jerseyNo: 45,
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
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p2",
      name: "Granth Sharma",
      jerseyNo: 7,
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
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p3",
      name: "Adhyan Upadhyay",
      jerseyNo: 1,
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
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p4",
      name: "Virat Chaudary",
      jerseyNo: 18,
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
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p5",
      name: "Agam Khandelwal",
      jerseyNo: 3,
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
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p6",
      name: "Aditya Rathore",
      jerseyNo: 4,
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
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p7",
      name: "Anuj Mishra",
      jerseyNo: 5,
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
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p8",
      name: "Aadarsh Mishra",
      jerseyNo: 6,
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
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p9",
      name: "Atharv Solanki",
      jerseyNo: 17,
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
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p10",
      name: "Ashwin Gagrani",
      jerseyNo: 8,
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
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p11",
      name: "Rudraksh Soni",
      jerseyNo: 9,
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
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p12",
      name: "Naitik Arya",
      jerseyNo: 10,
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
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    },
    {
      id: "p13",
      name: "Harshit Nagpal",
      jerseyNo: 11,
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
      mvpPoints: 0,
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
    testMode: false,
    maintenanceMode: false,
    monthlyAdminId: null,
    monthlyAdminCycle: "",
    workspaces: {
      il: {
        clubName: "INDORE LEGENDS",
        players: ilPlayers,
        announcement: "INDORE LEGENDS SEASON LAUNCH: Nov 29, 2026 at 3:00 PM IST. Together We Rise!",
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
        announcement: "GANESH MANDIR CRICKET SQUAD: 8-player private club workspace. Play Bold!",
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
      testMode: Boolean(parsed.testMode),
      maintenanceMode: Boolean(parsed.maintenanceMode),
      monthlyAdminId: parsed.monthlyAdminId ?? null,
      monthlyAdminCycle: parsed.monthlyAdminCycle || "",
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

function playerMvpScore(p: Player): number {
  return p.mvpPoints;
}

function playerEconomyRate(p: Player): number | null {
  if (!p.oversBowled || p.oversBowled <= 0) return null;
  return p.runsConceded / p.oversBowled;
}

function badgeRarityStyle(rarity?: BadgeRarity): {
  bg: string;
  color: string;
  border: string;
} {
  switch (rarity) {
    case "Mythic":
      return {
        bg: "linear-gradient(135deg, rgba(225,29,72,0.34), rgba(251,191,36,0.34))",
        color: "#fde68a",
        border: "rgba(251,191,36,0.85)",
      };
    case "Legendary":
      return {
        bg: "rgba(251,191,36,0.22)",
        color: "#fbbf24",
        border: "rgba(251,191,36,0.65)",
      };
    case "Epic":
      return {
        bg: "rgba(167,139,250,0.22)",
        color: "#ddd6fe",
        border: "rgba(167,139,250,0.6)",
      };
    case "Rare":
      return {
        bg: "rgba(56,189,248,0.2)",
        color: "#7dd3fc",
        border: "rgba(56,189,248,0.55)",
      };
    default:
      return {
        bg: "rgba(148,163,184,0.16)",
        color: "#cbd5e1",
        border: "rgba(148,163,184,0.35)",
      };
  }
}

function computeAutoBadge(
  p: Player,
  allPlayers: Player[]
): { title: string; rarity: BadgeRarity } {
  const topMvp = Math.max(0, ...allPlayers.map((x) => x.mvpPoints));
  const topRuns = Math.max(0, ...allPlayers.map((x) => x.runs));
  const topWkts = Math.max(0, ...allPlayers.map((x) => x.wickets));
  const econ = playerEconomyRate(p);

  if (p.mvpPoints >= 150 && p.mvpPoints === topMvp) {
    return { title: "Indore Legend", rarity: "Mythic" };
  }
  if (p.runs >= 100 && p.wickets >= 5) {
    return { title: "All-Round GOAT", rarity: "Mythic" };
  }
  if (p.runs >= 100 && p.mvpPoints >= 120) {
    return { title: "Centurion King", rarity: "Mythic" };
  }
  if (p.mvpPoints >= 100) {
    return { title: "MVP Dominator", rarity: "Legendary" };
  }
  if (p.runs >= 50 && p.runs === topRuns) {
    return { title: "Orange Cap Machine", rarity: "Legendary" };
  }
  if (p.wickets >= 4 && p.wickets === topWkts) {
    return { title: "Purple Cap Reaper", rarity: "Legendary" };
  }
  if (p.sixes >= 5) {
    return { title: "Six Machine", rarity: "Epic" };
  }
  if (p.oversBowled >= 2 && econ !== null && econ <= 6.0) {
    return { title: "Economy Sniper", rarity: "Epic" };
  }
  if (p.mvpPoints >= 60) {
    return { title: "Match Winner", rarity: "Epic" };
  }
  if (p.runs >= 30 || p.fours >= 4) {
    return { title: "Power Hitter", rarity: "Rare" };
  }
  if (p.wickets >= 2) {
    return { title: "Strike Bowler", rarity: "Rare" };
  }
  if (p.mvpPoints >= 25) {
    return { title: "Rising Star", rarity: "Rare" };
  }
  if (p.matches >= 1) {
    return { title: "Active Contender", rarity: "Common" };
  }
  return { title: "Squad Member", rarity: "Common" };
}

function applyAutoBadges(players: Player[]): Player[] {
  return players.map((p) => {
    const auto = computeAutoBadge(p, players);
    return {
      ...p,
      funAward: auto.title,
      badgeRarity: auto.rarity,
    };
  });
}

function playerPhotoPath(playerId: string): string {
  return "/players/" + playerId + ".jpg";
}

function playerClubIdCode(wsKey: WorkspaceKey, p: Player): string {
  const prefix = wsKey === "gm" ? "GM" : "IL";
  const shortId = p.id.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  const jersey = String(p.jerseyNo).padStart(2, "0");
  return prefix + "-" + shortId + "-" + jersey;
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
): boolean {
  const input = inputRaw.trim();
  if (!input) return false;

  if (player.isAdmin && player.adminPass) {
    const normalizedInput = input.replace(/^0/, "O").toUpperCase();
    const normalizedAdmin = player.adminPass.replace(/^0/, "O").toUpperCase();
    if (input === player.adminPass || normalizedInput === normalizedAdmin) {
      return true;
    }
  }

  const activeNormal = customPasswords[player.id] || player.defaultPass;
  if (input === activeNormal) {
    return true;
  }

  if (!customPasswords[player.id]) {
    if (player.id === "p11" && input === "Rudu09") {
      return true;
    }
    if (input.replace(/\s+/g, "") === player.defaultPass) {
      return true;
    }
  }

  return false;
}

function splitTeamsFairly(selected: Player[], randomize: boolean): { teamA: Player[]; teamB: Player[] } {
  const list = [...selected];
  if (randomize) {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
  } else {
    list.sort((a, b) => {
      const diff = playerMvpScore(b) - playerMvpScore(a);
      if (diff !== 0) return diff;
      return Math.random() - 0.5;
    });
  }
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  list.forEach((pl, idx) => {
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
    const scoreA = playerMvpScore(a) + Math.random() * 60;
    const scoreB = playerMvpScore(b) + Math.random() * 60;
    return scoreB - scoreA;
  });
  return { captain: shuffled[0].name, viceCaptain: shuffled[1].name };
}

function buildThemeCss(theme: ThemeKey): string {
  const accent =
    theme === "gold" ? "#fbbf24" : theme === "emerald" ? "#34d399" : "#38bdf8";
  const glow =
    theme === "gold"
      ? "rgba(251, 191, 36, 0.34)"
      : theme === "emerald"
      ? "rgba(52, 211, 153, 0.32)"
      : "rgba(56, 189, 248, 0.32)";
  const bgTop =
    theme === "gold" ? "#261a06" : theme === "emerald" ? "#06251d" : "#0b1a42";

  return [
    ":root { --bg: #030714; --panel: rgba(10, 18, 40, 0.9); --border: rgba(148, 163, 184, 0.22); --accent: " + accent + "; --accent-glow: " + glow + "; --gold: #fbbf24; --cyan: #38bdf8; --emerald: #34d399; --rose: #fb7185; --purple: #a78bfa; --text: #f8fafc; --muted: #94a3b8; }",
    "* { box-sizing: border-box; }",
    "html, body, #root { margin: 0; padding: 0; min-height: 100vh; background: radial-gradient(ellipse at top, " + bgTop + " 0%, #030714 70%); color: var(--text); font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; }",
    "@keyframes freeHitFlash { 0%, 100% { background: rgba(245, 158, 11, 0.96); color: #090d1e; box-shadow: 0 0 26px rgba(251, 191, 36, 0.9); } 50% { background: rgba(225, 29, 72, 0.96); color: #ffffff; box-shadow: 0 0 26px rgba(244, 63, 94, 0.9); } }",
    "@keyframes coinSpin { 0% { transform: rotateY(0deg) scale(1); } 50% { transform: rotateY(360deg) scale(1.16); } 100% { transform: rotateY(720deg) scale(1); } }",
    "@keyframes celebPop { 0% { transform: scale(0.35) rotate(-6deg); opacity: 0; } 55% { transform: scale(1.08) rotate(2deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }",
    "@keyframes celebRing { 0% { transform: scale(0.4); opacity: 0.9; } 100% { transform: scale(2.1); opacity: 0; } }",
    "@keyframes celebShake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px) rotate(-2deg); } 40% { transform: translateX(8px) rotate(2deg); } 60% { transform: translateX(-6px); } 80% { transform: translateX(6px); } }",
    "@keyframes celebFloat { 0% { transform: translateY(18px) scale(0.6); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-75px) scale(1.15); opacity: 0; } }",
    ".il-celeb-overlay { position: fixed; inset: 0; z-index: 120; background: radial-gradient(circle at center, rgba(15, 23, 42, 0.88), rgba(2, 6, 23, 0.94)); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; cursor: pointer; }",
    ".il-celeb-card { position: relative; width: 100%; max-width: 390px; border-radius: 26px; padding: 28px 22px; text-align: center; animation: celebPop 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards; overflow: hidden; }",
    ".il-celeb-card.shake { animation: celebPop 0.35s ease-out forwards, celebShake 0.45s ease-in-out 0.25s; }",
    ".il-celeb-ring { position: absolute; left: 50%; top: 50%; width: 170px; height: 170px; margin-left: -85px; margin-top: -85px; border-radius: 50%; border: 4px solid currentColor; pointer-events: none; animation: celebRing 1.25s ease-out infinite; }",
    ".il-freehit-banner { animation: freeHitFlash 0.75s infinite; padding: 10px 14px; border-radius: 12px; text-align: center; font-weight: 900; letter-spacing: 0.14em; font-size: 13px; margin-bottom: 12px; text-transform: uppercase; }",
    ".il-coin-spin { animation: coinSpin 0.75s ease-in-out; }",
    ".il-app-layout { display: flex; min-height: 100vh; max-width: 1240px; margin: 0 auto; }",
    ".il-sidebar { width: 220px; flex-shrink: 0; background: rgba(6, 12, 29, 0.94); border-right: 1px solid var(--accent-glow); padding: 16px 12px; display: flex; flex-direction: column; justify-content: space-between; position: sticky; top: 0; height: 100vh; }",
    ".il-main { flex: 1; min-width: 0; padding: 12px 14px 96px 14px; }",
    "@media (max-width: 860px) { .il-sidebar { display: none; } .il-main { padding: 10px 10px 92px 10px; } }",
    "@media (min-width: 861px) { .il-mobile-nav { display: none !important; } .il-main { padding-bottom: 24px; } }",
    ".il-side-btn { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; border: 1px solid transparent; background: transparent; color: var(--muted); font-weight: 700; font-size: 13px; cursor: pointer; text-align: left; }",
    ".il-side-btn.active { background: linear-gradient(90deg, rgba(245, 158, 11, 0.92), rgba(217, 119, 6, 0.2)); color: #050a18; border-color: rgba(251, 191, 36, 0.65); font-weight: 900; }",
    ".il-gold-bar { background: linear-gradient(90deg, #92400e, #d97706, #fbbf24, #d97706, #92400e); color: #090d1e; padding: 8px 14px; border-radius: 14px; font-weight: 800; font-size: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.28); }",
    ".il-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; background: var(--panel); border: 1px solid var(--accent-glow); border-radius: 18px; margin-bottom: 12px; backdrop-filter: blur(14px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35); }",
    ".il-crest { width: 46px; height: 46px; border-radius: 14px; background: linear-gradient(135deg, #fde68a, #f59e0b, #b45309); display: flex; align-items: center; justify-content: center; color: #050a18; font-weight: 900; font-size: 18px; letter-spacing: 0.04em; cursor: pointer; user-select: none; box-shadow: 0 0 22px rgba(251, 191, 36, 0.5); flex-shrink: 0; border: 2px solid rgba(254, 243, 199, 0.75); }",
    ".il-card { background: var(--panel); border: 1px solid var(--border); border-radius: 18px; padding: 15px; margin-bottom: 12px; box-shadow: 0 14px 34px rgba(0, 0, 0, 0.38); }",
    ".il-hero-banner { background: linear-gradient(135deg, rgba(29, 78, 216, 0.36), rgba(9, 17, 38, 0.96) 55%, rgba(217, 119, 6, 0.3)); border: 1px solid rgba(251, 191, 36, 0.5); position: relative; overflow: hidden; }",
    ".il-kpi { background: linear-gradient(145deg, rgba(15, 29, 66, 0.95), rgba(6, 12, 29, 0.96)); border: 1px solid var(--accent-glow); border-radius: 16px; padding: 13px; box-shadow: 0 8px 22px rgba(0,0,0,0.35); }",
    ".il-fut-card { background: linear-gradient(160deg, rgba(15, 31, 74, 0.98) 0%, rgba(5, 11, 27, 0.98) 100%); border: 1px solid rgba(251, 191, 36, 0.45); border-radius: 18px; overflow: hidden; box-shadow: 0 14px 34px rgba(0, 0, 0, 0.48); display: flex; flex-direction: column; }",
    ".il-fut-photo-wrap { position: relative; width: 100%; height: 190px; background: radial-gradient(circle at top, #1d4ed8 0%, #09132c 72%); overflow: hidden; cursor: pointer; }",
    ".il-fut-fade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5, 11, 27, 0.98) 8%, rgba(5, 11, 27, 0.35) 52%, rgba(5, 11, 27, 0.08) 100%); pointer-events: none; }",
    ".il-id-pass { background: linear-gradient(165deg, #102454 0%, #071026 55%, #1c1506 100%); border: 2px solid rgba(251, 191, 36, 0.72); border-radius: 22px; padding: 16px; box-shadow: 0 18px 46px rgba(0, 0, 0, 0.65), 0 0 28px rgba(251, 191, 36, 0.16); position: relative; overflow: hidden; }",
    ".il-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }",
    ".il-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }",
    ".il-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; }",
    "@media (max-width: 640px) { .il-resp-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } .il-resp-1 { grid-template-columns: 1fr; } }",
    ".il-btn { border: 1px solid var(--border); background: rgba(24, 36, 66, 0.9); color: #f8fafc; border-radius: 12px; padding: 10px 13px; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: transform 0.08s ease, opacity 0.15s ease; }",
    ".il-btn:active { transform: scale(0.97); }",
    ".il-btn:disabled { opacity: 0.42; cursor: not-allowed; }",
    ".il-btn-primary { background: linear-gradient(135deg, #0284c7, #2563eb); border-color: rgba(56, 189, 248, 0.6); }",
    ".il-btn-gold { background: linear-gradient(135deg, #d97706, #fbbf24); color: #060b19; border-color: rgba(254, 243, 199, 0.65); font-weight: 800; }",
    ".il-btn-emerald { background: rgba(16, 185, 129, 0.22); border-color: rgba(52, 211, 153, 0.55); color: #6ee7b7; }",
    ".il-btn-danger { background: linear-gradient(135deg, #be123c, #e11d48); border-color: rgba(251, 113, 133, 0.6); color: #ffffff; }",
    ".il-btn-purple { background: rgba(139, 92, 246, 0.24); border-color: rgba(167, 139, 250, 0.55); color: #ddd6fe; }",
    ".il-input, .il-select { width: 100%; padding: 10px 12px; border-radius: 11px; border: 1px solid rgba(148, 163, 184, 0.3); background: rgba(2, 6, 23, 0.88); color: #f8fafc; font-size: 14px; outline: none; }",
    ".il-input:focus, .il-select:focus { border-color: var(--accent); }",
    ".il-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }",
    ".il-ball { width: 34px; height: 34px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; border: 1px solid var(--border); flex-shrink: 0; }",
    ".il-mobile-nav { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; background: rgba(2, 6, 23, 0.96); border-top: 1px solid var(--accent-glow); backdrop-filter: blur(14px); display: flex; justify-content: center; padding: 7px 4px; }",
    ".il-nav-inner { width: 100%; max-width: 980px; display: flex; justify-content: space-around; gap: 2px; overflow-x: auto; }",
    ".il-nav-item { flex: 1; min-width: 46px; background: transparent; border: none; color: var(--muted); display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 2px; border-radius: 10px; font-size: 10px; font-weight: 700; cursor: pointer; }",
    ".il-nav-item.active { color: var(--gold); background: rgba(251, 191, 36, 0.14); }",
    ".il-modal-backdrop { position: fixed; inset: 0; z-index: 80; background: rgba(2, 6, 23, 0.86); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 14px; overflow-y: auto; }",
    ".il-modal { width: 100%; max-width: 460px; max-height: 92vh; overflow-y: auto; background: #091228; border: 1px solid rgba(251, 191, 36, 0.5); border-radius: 20px; padding: 18px; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75); }",
    ".il-scroll-box { max-height: 310px; overflow-y: auto; display: flex; flex-direction: column; gap: 9px; padding-right: 4px; }",
    ".il-orb { width: 26px; height: 26px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: transform 0.12s ease; }",
    ".il-orb.selected { border-color: #ffffff; transform: scale(1.14); }",
  ].join("\n");
}

function Code39Barcode({ value }: { value: string }) {
  const clean = value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const encoded = "*" + clean + "*";
  const narrow = 2;
  const wide = 5;
  const gap = 2;
  const rects: { x: number; w: number }[] = [];
  let cursor = 12;

  for (let i = 0; i < encoded.length; i += 1) {
    const ch = encoded[i];
    const pattern = CODE39_MAP[ch] || CODE39_MAP["-"];
    for (let j = 0; j < pattern.length; j += 1) {
      const width = pattern[j] === "w" ? wide : narrow;
      if (j % 2 === 0) {
        rects.push({ x: cursor, w: width });
      }
      cursor += width;
    }
    cursor += gap;
  }

  const totalWidth = cursor + 12;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 12,
        padding: "10px 10px 8px 10px",
        textAlign: "center",
        boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.12)",
      }}
    >
      <svg
        viewBox={"0 0 " + totalWidth + " 58"}
        style={{ width: "100%", height: 56, display: "block" }}
        aria-label={"Player Barcode " + clean}
      >
        <rect x="0" y="0" width={totalWidth} height="58" fill="#ffffff" />
        {rects.map((r, idx) => (
          <rect key={idx} x={r.x} y="3" width={r.w} height="52" fill="#050a18" />
        ))}
      </svg>
      <div
        style={{
          marginTop: 6,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: "0.24em",
          color: "#050a18",
        }}
      >
        {clean}
      </div>
    </div>
  );
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

function DigitalIdCardView({
  player,
  clubName,
  wsKey,
}: {
  player: Player;
  clubName: string;
  wsKey: WorkspaceKey;
}) {
  const [copied, setCopied] = useState<boolean>(false);
  const code = playerClubIdCode(wsKey, player);

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const shareText =
    clubName +
    " OFFICIAL PLAYER ID\n" +
    "Name: " +
    player.name +
    "\nJersey: #" +
    player.jerseyNo +
    "\nRole: " +
    player.role +
    "\nPlayer ID Code: " +
    code +
    "\nMVP Points: " +
    player.mvpPoints;

  return (
    <div>
      <div className="il-id-pass">
        {/* Lanyard Notch */}
        <div
          style={{
            width: 56,
            height: 7,
            borderRadius: 99,
            background: "rgba(2, 6, 23, 0.85)",
            border: "1px solid rgba(251, 191, 36, 0.45)",
            margin: "0 auto 12px auto",
          }}
        />

        {/* Pass Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg, #fde68a, #f59e0b)",
                color: "#050a18",
                fontWeight: 900,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {wsKey === "gm" ? "GM" : "IL"}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 13, color: "#fde68a", letterSpacing: "0.05em" }}>
                {clubName}
              </div>
              <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 800, letterSpacing: "0.12em" }}>
                OFFICIAL PLAYER ID PASS
              </div>
            </div>
          </div>

          <span
            className="il-pill"
            style={{ background: "rgba(52, 211, 153, 0.2)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.45)" }}
          >
            2026-27
          </span>
        </div>

        {/* Player Identity Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "rgba(2, 6, 23, 0.65)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            borderRadius: 16,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <PlayerAvatar
            playerId={player.id}
            name={player.name}
            size={76}
            borderColor="#fbbf24"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
              <div style={{ fontWeight: 900, fontSize: 17, lineHeight: 1.15 }}>{player.name}</div>
              <div style={{ fontWeight: 900, fontSize: 22, color: "#fbbf24", lineHeight: 1 }}>
                #{player.jerseyNo}
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#7dd3fc", fontWeight: 700, marginTop: 4 }}>
              {player.role}
            </div>

            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 7 }}>
              <span
                className="il-pill"
                style={{
                  background: player.isAdmin ? "rgba(251,191,36,0.22)" : "rgba(56,189,248,0.18)",
                  color: player.isAdmin ? "#fbbf24" : "#7dd3fc",
                  fontSize: 9,
                }}
              >
                {player.isAdmin ? "VERIFIED ADMIN" : "VERIFIED PLAYER"}
              </span>
              <span className="il-pill" style={{ background: "rgba(167,139,250,0.2)", color: "#ddd6fe", fontSize: 9 }}>
                {player.mvpPoints} MVP PTS
              </span>
            </div>
          </div>
        </div>

        {/* Quick Metadata Strip */}
        <div className="il-grid-3" style={{ textAlign: "center", marginBottom: 12, gap: 6 }}>
          <div style={{ background: "rgba(2, 6, 23, 0.65)", padding: "6px 4px", borderRadius: 10 }}>
            <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700 }}>SQUAD</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#f8fafc" }}>
              {wsKey === "gm" ? "G.M XI" : "INDORE"}
            </div>
          </div>
          <div style={{ background: "rgba(2, 6, 23, 0.65)", padding: "6px 4px", borderRadius: 10 }}>
            <div style={{ fontSize: 9, color: badgeRarityStyle(player.badgeRarity).color, fontWeight: 800 }}>
              {(player.badgeRarity || "Common").toUpperCase()}
            </div>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#fde68a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {player.funAward}
            </div>
          </div>
          <div style={{ background: "rgba(2, 6, 23, 0.65)", padding: "6px 4px", borderRadius: 10 }}>
            <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700 }}>STATUS</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#34d399" }}>ACTIVE</div>
          </div>
        </div>

        {/* Scannable Code 39 Barcode */}
        <Code39Barcode value={code} />
      </div>

      {/* Share & Copy Actions */}
      <div className="il-grid-2" style={{ marginTop: 10 }}>
        <button type="button" className="il-btn" onClick={handleCopyCode}>
          {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy ID Code"}
        </button>
        <a
          href={"https://wa.me/?text=" + encodeURIComponent(shareText)}
          target="_blank"
          rel="noreferrer"
          className="il-btn il-btn-emerald"
          style={{ textDecoration: "none" }}
        >
          <Share2 size={14} /> Share Pass
        </a>
      </div>
    </div>
  );
}

function DonutPieChart({ slices, centerLabel, subLabel }: { slices: PieSlice[]; centerLabel: string; subLabel?: string }) {
  const total = slices.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
      <svg width="132" height="132" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={radius} fill="none" stroke="rgba(148,163,184,0.16)" strokeWidth="16" />
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
                cx="66"
                cy="66"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="16"
                strokeDasharray={dash + " " + circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 66 66)"
              />
            );
          })}
        <text x="66" y="62" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700">
          {subLabel || "BALANCE"}
        </text>
        <text x="66" y="79" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900">
          {centerLabel}
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 150 }}>
        {slices.map((s) => {
          const pct = total > 0 ? Math.round((Math.max(0, s.value) / total) * 100) : 0;
          return (
            <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, display: "inline-block" }} />
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
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string>(() =>
    typeof window !== "undefined" && localStorage.getItem(PENDING_SYNC_KEY) === "1"
      ? "Offline - Queued"
      : "Syncing..."
  );
  const [hasPendingOfflineSync, setHasPendingOfflineSync] = useState<boolean>(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem(PENDING_SYNC_KEY) === "1";
    } catch {
      return false;
    }
  });
  const hasPendingOfflineSyncRef = useRef<boolean>(hasPendingOfflineSync);
  hasPendingOfflineSyncRef.current = hasPendingOfflineSync;

  const hasInitialPullDoneRef = useRef<boolean>(false);
  const lastSyncedJsonRef = useRef<string>("");
  const lastLocalEditAtRef = useRef<number>(0);
  const isApplyingCloudRef = useRef<boolean>(false);
  const saveTimerRef = useRef<number | null>(null);
  const latestStateRef = useRef<AppState>(state);
  latestStateRef.current = state;

  // Celebration Animation Overlay
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(null);
  const celebTimerRef = useRef<number | null>(null);

  // Copy Scorecard feedback
  const [copiedCardId, setCopiedCardId] = useState<string>("");

  // Turf Cost Splitter & Auto-Fine Engine
  const [turfBillAmount, setTurfBillAmount] = useState<string>("1200");
  const [turfBillNote, setTurfBillNote] = useState<string>("Turf Booking Split");
  const [turfSelectedIds, setTurfSelectedIds] = useState<string[]>([]);
  const [turfSplitNotice, setTurfSplitNotice] = useState<string>("");
  const [fineTargetId, setFineTargetId] = useState<string>("p3");
  const [customFineReason, setCustomFineReason] = useState<string>("");
  const [customFineAmount, setCustomFineAmount] = useState<string>("");

  // Monthly 29th Spin-the-Wheel (Permanent Admin Gaurav ONLY)
  const [showSpinWheelModal, setShowSpinWheelModal] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [isWheelSpinning, setIsWheelSpinning] = useState<boolean>(false);
  const [wheelWinner, setWheelWinner] = useState<Player | null>(null);
  const [excludeCurrentMonthly, setExcludeCurrentMonthly] = useState<boolean>(true);
  const [backupNotice, setBackupNotice] = useState<string>("");
  const backupFileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Match Creation & Auto Team Selector
  const [showCreateWizard, setShowCreateWizard] = useState<boolean>(false);
  const [wizTitle, setWizTitle] = useState<string>("Squad Clash");
  const [wizDateTime, setWizDateTime] = useState<string>(() => threeDaysFromNowIso());
  const [wizOvers, setWizOvers] = useState<number>(10);
  const [wizTeamAName, setWizTeamAName] = useState<string>("Legends XI");
  const [wizTeamBName, setWizTeamBName] = useState<string>("Strikers XI");
  const [wizSelectedIds, setWizSelectedIds] = useState<string[]>([]);
  const [newChecklistLabel, setNewChecklistLabel] = useState<string>("");

  const [coinFlipping, setCoinFlipping] = useState<boolean>(false);
  const [coinResult, setCoinResult] = useState<string>("");

  // Live Scoring & End-of-Over Bowler Popup
  const [wicketType, setWicketType] = useState<string>("Bowled");
  const [umpireBanner, setUmpireBanner] = useState<string>("");
  const [milestonePopup, setMilestonePopup] = useState<string>("");
  const [showNextBowlerModal, setShowNextBowlerModal] = useState<boolean>(false);
  const [lastOverBowler, setLastOverBowler] = useState<string>("");

  // Profile, Digital ID Card, Player Editor & Add Player Modals
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [profileTab, setProfileTab] = useState<"stats" | "career" | "awards" | "idcard">("stats");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState<boolean>(false);
  const [addName, setAddName] = useState<string>("");
  const [addJersey, setAddJersey] = useState<string>("99");
  const [addRole, setAddRole] = useState<PlayerRole>("All-Rounder");
  const [addPass, setAddPass] = useState<string>("");
  const [addIsAdmin, setAddIsAdmin] = useState<boolean>(false);
  const [addIsGM, setAddIsGM] = useState<boolean>(false);

  const [leaderTab, setLeaderTab] = useState<"mvp" | "batting" | "bowling" | "economy">("mvp");

  // Finance
  const [trTitle, setTrTitle] = useState<string>("");
  const [trType, setTrType] = useState<LedgerType>("CREDIT");
  const [trAmount, setTrAmount] = useState<string>("");
  const [trMember, setTrMember] = useState<string>("All Squad");

  // Chat (Live Firestore Sync)
  const [chatText, setChatText] = useState<string>("");
  const [cloudMessages, setCloudMessages] = useState<CloudChatMessage[] | null>(null);
  const [chatStatus, setChatStatus] = useState<string>("Connecting...");
  const [chatSending, setChatSending] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // LegendBot
  const [voiceOutput, setVoiceOutput] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [aiInput, setAiInput] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<BotMessage[]>([
    {
      id: "bot_init",
      role: "bot",
      layer: "LegendBot Cricket AI",
      text: "Namaste! Ask me about the active club workspace (live score, MVP leader, Orange/Purple Cap, funds, poll) or any IPL and International cricket question.",
      timestamp: nowTime(),
    },
  ]);
  const aiEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const markPendingOfflineSync = (pending: boolean) => {
    hasPendingOfflineSyncRef.current = pending;
    setHasPendingOfflineSync(pending);
    try {
      if (pending) {
        localStorage.setItem(PENDING_SYNC_KEY, "1");
      } else {
        localStorage.removeItem(PENDING_SYNC_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const stripForBin = (s: AppState): CloudSyncPayload => ({
    customPasswords: s?.customPasswords || {},
    testMode: Boolean(s?.testMode),
    maintenanceMode: Boolean(s?.maintenanceMode),
    monthlyAdminId: s?.monthlyAdminId ?? null,
    monthlyAdminCycle: s?.monthlyAdminCycle || "",
    workspaces: {
      il: { ...s.workspaces.il, messages: [] },
      gm: { ...s.workspaces.gm, messages: [] },
    },
  });

  const mergeWorkspaceFromBin = (
    freshWs: WorkspaceData,
    prevWs: WorkspaceData,
    cloudWs?: Partial<WorkspaceData> | null
  ): WorkspaceData => {
    if (!cloudWs || typeof cloudWs !== "object") return prevWs;
    const hasCloudPlayers =
      Array.isArray(cloudWs.players) && cloudWs.players.length > 0;
    return {
      ...freshWs,
      ...prevWs,
      clubName: cloudWs.clubName ?? prevWs.clubName ?? freshWs.clubName,
      announcement:
        cloudWs.announcement ?? prevWs.announcement ?? freshWs.announcement,
      groundName: cloudWs.groundName ?? prevWs.groundName ?? freshWs.groundName,
      groundMapUrl:
        cloudWs.groundMapUrl ?? prevWs.groundMapUrl ?? freshWs.groundMapUrl,
      players: hasCloudPlayers ? cloudWs.players! : prevWs.players,
      scheduledMatch:
        "scheduledMatch" in cloudWs
          ? (cloudWs.scheduledMatch ?? null)
          : prevWs.scheduledMatch,
      liveMatch:
        "liveMatch" in cloudWs
          ? (cloudWs.liveMatch ?? null)
          : prevWs.liveMatch,
      matchHistory: Array.isArray(cloudWs.matchHistory)
        ? cloudWs.matchHistory
        : prevWs.matchHistory,
      treasury: Array.isArray(cloudWs.treasury)
        ? cloudWs.treasury
        : prevWs.treasury,
      poll: Array.isArray(cloudWs.poll) ? cloudWs.poll : prevWs.poll,
      chatClearedAtMs:
        typeof cloudWs.chatClearedAtMs === "number"
          ? Math.max(cloudWs.chatClearedAtMs, prevWs.chatClearedAtMs || 0)
          : prevWs.chatClearedAtMs || 0,
      messages: prevWs.messages,
    };
  };

  const mergeAppStateFromBin = (
    prev: AppState,
    cloudData?: Partial<CloudSyncPayload> | null
  ): AppState => {
    if (!cloudData || typeof cloudData !== "object") return prev;
    const fresh = createFreshState();
    return {
      ...prev,
      customPasswords:
        cloudData.customPasswords && typeof cloudData.customPasswords === "object"
          ? cloudData.customPasswords
          : prev.customPasswords,
      testMode:
        typeof cloudData.testMode === "boolean"
          ? cloudData.testMode
          : Boolean(prev.testMode),
      maintenanceMode:
        typeof cloudData.maintenanceMode === "boolean"
          ? cloudData.maintenanceMode
          : Boolean(prev.maintenanceMode),
      monthlyAdminId:
        "monthlyAdminId" in cloudData
          ? (cloudData.monthlyAdminId ?? null)
          : (prev.monthlyAdminId ?? null),
      monthlyAdminCycle:
        typeof cloudData.monthlyAdminCycle === "string"
          ? cloudData.monthlyAdminCycle
          : (prev.monthlyAdminCycle || ""),
      workspaces: {
        il: mergeWorkspaceFromBin(
          fresh.workspaces.il,
          prev.workspaces.il,
          cloudData.workspaces?.il
        ),
        gm: mergeWorkspaceFromBin(
          fresh.workspaces.gm,
          prev.workspaces.gm,
          cloudData.workspaces?.gm
        ),
      },
    };
  };

  const flushPendingSyncToBin = async (): Promise<boolean> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      markPendingOfflineSync(true);
      setCloudSyncStatus("Offline - Queued");
      return false;
    }
    const payload = stripForBin(latestStateRef.current);
    const json = JSON.stringify(payload);
    setCloudSyncStatus("Syncing Queue...");
    lastLocalEditAtRef.current = Date.now();
    try {
      const ok = await saveBinState(payload);
      if (ok) {
        lastSyncedJsonRef.current = json;
        lastLocalEditAtRef.current = Date.now();
        markPendingOfflineSync(false);
        setCloudSyncStatus("Live Sync");
        return true;
      }
      markPendingOfflineSync(true);
      setCloudSyncStatus("Offline - Queued");
      return false;
    } catch {
      markPendingOfflineSync(true);
      setCloudSyncStatus("Offline - Queued");
      return false;
    }
  };

  const pullFromBin = async (isInitial = false, force = false) => {
    if (hasPendingOfflineSyncRef.current) {
      hasInitialPullDoneRef.current = true;
      await flushPendingSyncToBin();
      return;
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      if (isInitial) {
        lastSyncedJsonRef.current = JSON.stringify(
          stripForBin(latestStateRef.current)
        );
        hasInitialPullDoneRef.current = true;
      }
      setCloudSyncStatus("Offline (Turf Mode)");
      return;
    }
    if (!isInitial && !force && Date.now() - lastLocalEditAtRef.current < 5000) return;
    try {
      const binData = await loadBinState<Partial<CloudSyncPayload>>();
      if (!binData) {
        if (isInitial) {
          lastSyncedJsonRef.current = JSON.stringify(
            stripForBin(latestStateRef.current)
          );
          hasInitialPullDoneRef.current = true;
        }
        setCloudSyncStatus("Offline (Turf Mode)");
        return;
      }

      const binHasPlayers =
        Array.isArray(binData.workspaces?.il?.players) &&
        binData.workspaces.il.players.length > 0;

      if (!binHasPlayers) {
        if (isInitial) {
          hasInitialPullDoneRef.current = true;
          await flushPendingSyncToBin();
        }
        return;
      }

      const merged = mergeAppStateFromBin(latestStateRef.current, binData);
      const mergedJson = JSON.stringify(stripForBin(merged));
      if (isInitial) {
        hasInitialPullDoneRef.current = true;
      }

      if (mergedJson !== lastSyncedJsonRef.current) {
        lastSyncedJsonRef.current = mergedJson;
        isApplyingCloudRef.current = true;
        setState((prev) => mergeAppStateFromBin(prev, binData));
      }
      setCloudSyncStatus("Live Sync");
    } catch {
      if (isInitial) {
        lastSyncedJsonRef.current = JSON.stringify(
          stripForBin(latestStateRef.current)
        );
        hasInitialPullDoneRef.current = true;
      }
      setCloudSyncStatus("Offline (Turf Mode)");
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }

    if (isApplyingCloudRef.current) {
      isApplyingCloudRef.current = false;
      return;
    }

    if (!hasInitialPullDoneRef.current) return;

    const payload = stripForBin(state);
    const json = JSON.stringify(payload);
    if (json === lastSyncedJsonRef.current && !hasPendingOfflineSyncRef.current) return;

    lastLocalEditAtRef.current = Date.now();

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      markPendingOfflineSync(true);
      setCloudSyncStatus("Offline - Queued");
      return;
    }

    setCloudSyncStatus("Saving...");

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      lastLocalEditAtRef.current = Date.now();
      void saveBinState(payload)
        .then((ok) => {
          if (ok) {
            lastSyncedJsonRef.current = json;
            lastLocalEditAtRef.current = Date.now();
            markPendingOfflineSync(false);
            setCloudSyncStatus("Live Sync");
          } else {
            markPendingOfflineSync(true);
            setCloudSyncStatus("Offline - Queued");
          }
        })
        .catch(() => {
          markPendingOfflineSync(true);
          setCloudSyncStatus("Offline - Queued");
        });
    }, 800);
  }, [state]);

  useEffect(() => {
    void pullFromBin(true);

    const interval = window.setInterval(() => {
      if (hasPendingOfflineSyncRef.current) {
        void flushPendingSyncToBin();
      } else {
        void pullFromBin(false);
      }
    }, 4000);

    const handleOnline = () => {
      if (hasPendingOfflineSyncRef.current) {
        void flushPendingSyncToBin();
      } else {
        void pullFromBin(false, true);
      }
    };

    const handleOffline = () => {
      setCloudSyncStatus(
        hasPendingOfflineSyncRef.current ? "Offline - Queued" : "Offline (Turf Mode)"
      );
    };

    const handleFocus = () => {
      if (hasPendingOfflineSyncRef.current) {
        void flushPendingSyncToBin();
      } else {
        void pullFromBin(false);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (hasPendingOfflineSyncRef.current) {
          void flushPendingSyncToBin();
        } else {
          void pullFromBin(false);
        }
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
      if (celebTimerRef.current !== null) {
        window.clearTimeout(celebTimerRef.current);
      }
    };
  }, []);

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
    setTurfSelectedIds(ws.players.map((p) => p.id));
  }, [workspace, ws.announcement, ws.groundName, ws.groundMapUrl]);

  useEffect(() => {
    setCloudMessages(null);
    setChatStatus("Syncing...");
    const unsubscribe = subscribeLockerChat(
      workspace,
      (liveList) => {
        setCloudMessages(liveList);
        setChatStatus("Live Sync");
      },
      () => {
        setChatStatus("Local Fallback");
      }
    );
    return () => unsubscribe();
  }, [workspace]);

  const liveChatCount = cloudMessages !== null ? cloudMessages.length : ws.messages.length;

  useEffect(() => {
    if (tab === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (tab === "ai") aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tab, liveChatCount, aiMessages.length]);

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
  const isAdmin = Boolean(authPlayer?.isAdmin);
  const isSpinOwner = authPlayer?.id === SPIN_OWNER_ID;
  const is29thOfMonth = new Date(nowMs).getDate() === 29;
  const canOpenSpinWheel = isSpinOwner && (is29thOfMonth || Boolean(state.testMode) || Boolean(state.maintenanceMode));

  const triggerCelebration = (ev: Omit<CelebrationEvent, "id">) => {
    setCelebration({ ...ev, id: uid("cel") });
    if (celebTimerRef.current !== null) {
      window.clearTimeout(celebTimerRef.current);
    }
    celebTimerRef.current = window.setTimeout(() => {
      setCelebration(null);
    }, 2800);
  };

  const handleCopyScorecard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedCardId(id);
    window.setTimeout(() => {
      setCopiedCardId((prev) => (prev === id ? "" : prev));
    }, 1800);
  };

  const handleClearChat = () => {
    const clearTime = Date.now();
    updateWorkspace((prevWs) => ({
      ...prevWs,
      messages: [],
      chatClearedAtMs: clearTime,
    }));
    setCloudMessages([]);
  };

  const deleteSingleMatch = (matchId: string) => {
    updateWorkspace((prevWs) => {
      const target = prevWs.matchHistory.find((m) => m.id === matchId);
      if (!target) return prevWs;
      const statsMap = target.playerStats || {};
      const rolledBackPlayers = prevWs.players.map((pl) => {
        const delta = statsMap[pl.name];
        if (!delta) return pl;
        return {
          ...pl,
          matches: Math.max(0, pl.matches - delta.matches),
          runs: Math.max(0, pl.runs - delta.runs),
          ballsFaced: Math.max(0, pl.ballsFaced - delta.ballsFaced),
          fours: Math.max(0, pl.fours - delta.fours),
          sixes: Math.max(0, pl.sixes - delta.sixes),
          wickets: Math.max(0, pl.wickets - delta.wickets),
          oversBowled: Math.max(0, Number((pl.oversBowled - delta.oversBowled).toFixed(2))),
          runsConceded: Math.max(0, pl.runsConceded - delta.runsConceded),
          mvpPoints: Math.max(0, pl.mvpPoints - delta.mvpPoints),
        };
      });
      return {
        ...prevWs,
        players: applyAutoBadges(rolledBackPlayers),
        matchHistory: prevWs.matchHistory.filter((m) => m.id !== matchId),
      };
    });
  };

  const deleteAllMatches = () => {
    updateWorkspace((prevWs) => {
      const resetPlayers = prevWs.players.map((pl) => ({
        ...pl,
        matches: 0,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        wickets: 0,
        oversBowled: 0,
        runsConceded: 0,
        mvpPoints: 0,
      }));
      return {
        ...prevWs,
        players: applyAutoBadges(resetPlayers),
        matchHistory: [],
      };
    });
  };

  const seedSampleMatch = () => {
    const squad = ws.players;
    if (squad.length < 4) return;
    const pA = squad[0];
    const pB = squad[1];
    const pC = squad[2];
    const pD = squad[3];
    const playerStats: Record<string, MatchPlayerDelta> = {
      [pA.name]: {
        matches: 1,
        runs: 54,
        ballsFaced: 28,
        fours: 5,
        sixes: 3,
        wickets: 1,
        oversBowled: 2,
        runsConceded: 11,
        mvpPoints: 54 + 5 * 2 + 3 * 4 + 25,
      },
      [pB.name]: {
        matches: 1,
        runs: 31,
        ballsFaced: 19,
        fours: 3,
        sixes: 1,
        wickets: 2,
        oversBowled: 2,
        runsConceded: 14,
        mvpPoints: 31 + 3 * 2 + 1 * 4 + 50,
      },
      [pC.name]: {
        matches: 1,
        runs: 22,
        ballsFaced: 16,
        fours: 2,
        sixes: 1,
        wickets: 0,
        oversBowled: 2,
        runsConceded: 24,
        mvpPoints: 22 + 2 * 2 + 1 * 4,
      },
      [pD.name]: {
        matches: 1,
        runs: 14,
        ballsFaced: 12,
        fours: 1,
        sixes: 0,
        wickets: 3,
        oversBowled: 2,
        runsConceded: 9,
        mvpPoints: 14 + 1 * 2 + 75,
      },
    };
    const scorecardText =
      ws.clubName +
      " SAMPLE TEST SCORECARD\nTurf Test Clash (8 Overs)\nLegends XI: 109/4 (8.0 ov) vs Strikers XI: 96/6 (8.0 ov)\nResult: Legends XI won by 13 runs!\nMVP: " +
      pA.name +
      " (101 MVP pts)\n\nTop Batters:\n- " +
      pA.name +
      ": 54(28) [4s:5, 6s:3]\n- " +
      pB.name +
      ": 31(19) [4s:3, 6s:1]\n\nTop Bowlers:\n- " +
      pD.name +
      ": 3/9 (2.0 ov)\n- " +
      pB.name +
      ": 2/14 (2.0 ov)";
    const sample: CompletedMatch = {
      id: uid("testmatch"),
      title: "Turf Test Clash (Sample)",
      date: new Date().toISOString().slice(0, 10),
      summary: "Legends XI 109/4 (8.0 ov) vs Strikers XI 96/6 (8.0 ov)",
      winner: "Legends XI won by 13 run(s)!",
      wonFlag: "W",
      mvp: pA.name + " (101 MVP pts)",
      scorecardText,
      playerStats,
    };
    updateWorkspace((prevWs) => {
      const updatedPlayers = prevWs.players.map((pl) => {
        const d = playerStats[pl.name];
        if (!d) return pl;
        return {
          ...pl,
          matches: pl.matches + d.matches,
          runs: pl.runs + d.runs,
          ballsFaced: pl.ballsFaced + d.ballsFaced,
          fours: pl.fours + d.fours,
          sixes: pl.sixes + d.sixes,
          wickets: pl.wickets + d.wickets,
          oversBowled: Number((pl.oversBowled + d.oversBowled).toFixed(2)),
          runsConceded: pl.runsConceded + d.runsConceded,
          mvpPoints: pl.mvpPoints + d.mvpPoints,
        };
      });
      return {
        ...prevWs,
        players: applyAutoBadges(updatedPlayers),
        matchHistory: [sample, ...prevWs.matchHistory],
      };
    });
    triggerCelebration({
      kind: "fifty",
      badgeText: "TEST",
      title: "SAMPLE MATCH SEEDED!",
      subtitle: "Stats, Economy & Auto Badges updated — test Delete Rollback anytime!",
    });
  };

  const applyTurfSplit = () => {
    const total = Number(turfBillAmount);
    const chosen = ws.players.filter((p) => turfSelectedIds.includes(p.id));
    if (!total || total <= 0 || chosen.length === 0) return;
    const perPlayer = Math.ceil(total / chosen.length);
    const note = turfBillNote.trim() || "Turf Booking Split";
    const entry: TreasuryEntry = {
      id: uid("tr"),
      title: note + " (" + chosen.length + " players @ Rs." + perPlayer + ")",
      type: "EXPENSE",
      amount: total,
      memberName: "All Squad",
      date: new Date().toISOString().slice(0, 10),
    };
    updateWorkspace((prevWs) => ({
      ...prevWs,
      treasury: [entry, ...prevWs.treasury],
      players: prevWs.players.map((pl) =>
        turfSelectedIds.includes(pl.id)
          ? { ...pl, finesDue: pl.finesDue + perPlayer }
          : pl
      ),
    }));
    setTurfSplitNotice(
      "Added Rs." + perPlayer + " due to " + chosen.length + " players (Total Rs." + total + ")."
    );
  };

  const applyQuickFine = (playerId: string, reason: string, amount: number) => {
    const target = ws.players.find((p) => p.id === playerId);
    if (!target || !amount || amount <= 0) return;
    const entry: TreasuryEntry = {
      id: uid("tr"),
      title: "Fine: " + reason,
      type: "FINE",
      amount,
      memberName: target.name,
      date: new Date().toISOString().slice(0, 10),
    };
    updateWorkspace((prevWs) => ({
      ...prevWs,
      treasury: [entry, ...prevWs.treasury],
      players: prevWs.players.map((pl) =>
        pl.id === playerId ? { ...pl, finesDue: pl.finesDue + amount } : pl
      ),
    }));
  };

  const markPlayerDuePaid = (player: Player) => {
    if (player.finesDue <= 0) return;
    const paidAmount = player.finesDue;
    const entry: TreasuryEntry = {
      id: uid("tr"),
      title: "Due Cleared (" + player.name + ")",
      type: "CREDIT",
      amount: paidAmount,
      memberName: player.name,
      date: new Date().toISOString().slice(0, 10),
    };
    updateWorkspace((prevWs) => ({
      ...prevWs,
      treasury: [entry, ...prevWs.treasury],
      players: prevWs.players.map((pl) =>
        pl.id === player.id ? { ...pl, finesDue: 0 } : pl
      ),
    }));
  };

  const handleResetPlayerPassword = (playerId: string) => {
    setState((prev) => {
      const nextPasswords = { ...prev.customPasswords };
      delete nextPasswords[playerId];
      return {
        ...prev,
        customPasswords: nextPasswords,
      };
    });
    setSettingsSavedMsg("Player password reset to default.");
  };

  const handleExportJsonBackup = () => {
    try {
      const jsonStr = JSON.stringify(state, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "indore-legends-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupNotice("Backup JSON downloaded.");
    } catch {
      setBackupNotice("Could not export backup.");
    }
  };

  const handleImportJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "")) as Partial<AppState>;
        if (!parsed.workspaces || !parsed.workspaces.il || !parsed.workspaces.gm) {
          setBackupNotice("Invalid backup file format.");
          return;
        }
        requireAdminPin("Restore Club Data from JSON Backup", () => {
          const fresh = createFreshState();
          setState({
            theme: parsed.theme || "blue",
            customPasswords: parsed.customPasswords || {},
            testMode: Boolean(parsed.testMode),
            maintenanceMode: Boolean(parsed.maintenanceMode),
            monthlyAdminId: parsed.monthlyAdminId ?? null,
            monthlyAdminCycle: parsed.monthlyAdminCycle || "",
            workspaces: {
              il: { ...fresh.workspaces.il, ...parsed.workspaces!.il },
              gm: { ...fresh.workspaces.gm, ...parsed.workspaces!.gm },
            },
          });
          setBackupNotice("Backup restored and synced!");
        });
      } catch {
        setBackupNotice("Could not read JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const eligibleWheelPlayers = allIlPlayers.filter(
    (p) =>
      !PERMANENT_ADMIN_IDS.includes(p.id) &&
      (!excludeCurrentMonthly || p.id !== state.monthlyAdminId)
  );

  const handleSpinMonthlyWheel = () => {
    if (isWheelSpinning || eligibleWheelPlayers.length === 0) return;
    setIsWheelSpinning(true);
    setWheelWinner(null);
    const winnerIndex = Math.floor(Math.random() * eligibleWheelPlayers.length);
    const chosen = eligibleWheelPlayers[winnerIndex];
    const sliceAngle = 360 / eligibleWheelPlayers.length;
    const targetSliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));
    const currentMod = ((wheelRotation % 360) + 360) % 360;
    const desiredMod = (360 - targetSliceCenter + 360) % 360;
    const delta = (desiredMod - currentMod + 360) % 360;
    const nextAngle = wheelRotation + extraSpins + delta;
    setWheelRotation(nextAngle);

    window.setTimeout(() => {
      setIsWheelSpinning(false);
      setWheelWinner(chosen);
      speak("New monthly admin selected: " + chosen.name);
    }, 4300);
  };

  const appointMonthlyAdmin = (winner: Player) => {
    const cycleLabel = new Date().toISOString().slice(0, 7);
    setState((prev) => {
      const oldMonthlyId = prev.monthlyAdminId;
      const updateAdminList = (list: Player[]) =>
        list.map((p) => {
          if (PERMANENT_ADMIN_IDS.includes(p.id)) return { ...p, isAdmin: true };
          if (p.id === winner.id) return { ...p, isAdmin: true };
          if (oldMonthlyId && p.id === oldMonthlyId) return { ...p, isAdmin: false };
          return p;
        });
      return {
        ...prev,
        monthlyAdminId: winner.id,
        monthlyAdminCycle: cycleLabel,
        maintenanceMode: false,
        workspaces: {
          il: { ...prev.workspaces.il, players: updateAdminList(prev.workspaces.il.players) },
          gm: { ...prev.workspaces.gm, players: updateAdminList(prev.workspaces.gm.players) },
        },
      };
    });
    setShowSpinWheelModal(false);
    setWheelWinner(null);
    triggerCelebration({
      kind: "century",
      badgeText: "ADMIN",
      title: "NEW MONTHLY ADMIN!",
      subtitle: winner.name + " (#" + winner.jerseyNo + ") appointed for " + cycleLabel,
    });
  };

  const orangeCapHolder = [...ws.players].sort((a, b) => b.runs - a.runs)[0];
  const purpleCapHolder = [...ws.players].sort((a, b) => b.wickets - a.wickets)[0];
  const mvpLeader = [...ws.players].sort((a, b) => b.mvpPoints - a.mvpPoints)[0];

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

  const winsCount = ws.matchHistory.filter((m) => m.wonFlag === "W").length;
  const winRate =
    ws.matchHistory.length > 0
      ? Math.round((winsCount / ws.matchHistory.length) * 100)
      : 0;

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
    const ok = verifyPlayerPassword(player, loginPassword, state.customPasswords);
    if (!ok) {
      setLoginError("Incorrect password. Please try again.");
      return;
    }
    setSession({ playerId: player.id });
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
    const ok = verifyPlayerPassword(player, gmLoginPass, state.customPasswords);
    if (!ok) {
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

  const handleSaveEditedPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    const edited = {
      ...editingPlayer,
      name: editingPlayer.name.trim() || "Player",
      jerseyNo: Math.max(0, Math.min(999, Number(editingPlayer.jerseyNo) || 0)),
      mvpPoints: Math.max(0, Number(editingPlayer.mvpPoints) || 0),
      runs: Math.max(0, Number(editingPlayer.runs) || 0),
      wickets: Math.max(0, Number(editingPlayer.wickets) || 0),
      matches: Math.max(0, Number(editingPlayer.matches) || 0),
      finesDue: Math.max(0, Number(editingPlayer.finesDue) || 0),
      advanceCredit: Math.max(0, Number(editingPlayer.advanceCredit) || 0),
      funAward: editingPlayer.funAward.trim() || "Squad Member",
    };

    setState((prev) => {
      const ilAdminsCount = prev.workspaces.il.players.filter((p) => p.isAdmin).length;
      const prevPlayer = prev.workspaces.il.players.find((p) => p.id === edited.id);
      const finalIsAdmin =
        prevPlayer?.isAdmin && !edited.isAdmin && ilAdminsCount <= 1
          ? true
          : edited.isAdmin;

      const updateList = (list: Player[], isCurrentWs: boolean): Player[] =>
        list.map((p) => {
          if (p.id !== edited.id) return p;
          if (isCurrentWs) {
            return { ...edited, isAdmin: finalIsAdmin };
          }
          return {
            ...p,
            name: edited.name,
            jerseyNo: edited.jerseyNo,
            role: edited.role,
            isAdmin: finalIsAdmin,
            isGM: edited.isGM,
          };
        });

      const nextIlPlayers = updateList(prev.workspaces.il.players, workspace === "il");
      let nextGmPlayers = updateList(prev.workspaces.gm.players, workspace === "gm");

      const existsInGm = nextGmPlayers.some((p) => p.id === edited.id);
      if (edited.isGM && !existsInGm) {
        nextGmPlayers = [
          ...nextGmPlayers,
          {
            ...edited,
            isAdmin: finalIsAdmin,
            matches: 0,
            runs: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            wickets: 0,
            oversBowled: 0,
            runsConceded: 0,
            mvpPoints: 0,
            finesDue: 0,
            advanceCredit: 0,
          },
        ];
      } else if (!edited.isGM && existsInGm) {
        nextGmPlayers = nextGmPlayers.filter((p) => p.id !== edited.id);
      }

      return {
        ...prev,
        workspaces: {
          il: { ...prev.workspaces.il, players: nextIlPlayers },
          gm: { ...prev.workspaces.gm, players: nextGmPlayers },
        },
      };
    });
    setEditingPlayer(null);
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    const newId = "p" + (allIlPlayers.length + 1);
    const newPlayer: Player = {
      id: newId,
      name: addName.trim(),
      jerseyNo: Math.max(0, Math.min(999, Number(addJersey) || 99)),
      role: addRole,
      isAdmin: addIsAdmin,
      isGM: addIsGM || workspace === "gm",
      defaultPass: addPass.trim() || "Player123",
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      mvpPoints: 0,
      finesDue: 0,
      advanceCredit: 0,
      funAward: "Squad Member",
    };

    setState((prev) => ({
      ...prev,
      workspaces: {
        il: {
          ...prev.workspaces.il,
          players: [...prev.workspaces.il.players, newPlayer],
        },
        gm: {
          ...prev.workspaces.gm,
          players: newPlayer.isGM
            ? [...prev.workspaces.gm.players, { ...newPlayer }]
            : prev.workspaces.gm.players,
        },
      },
    }));

    setAddName("");
    setAddJersey("99");
    setAddPass("");
    setAddIsAdmin(false);
    setAddIsGM(false);
    setShowAddPlayerModal(false);
  };

  const handleToggleAdminQuick = (playerId: string) => {
    setState((prev) => {
      const target = prev.workspaces.il.players.find((p) => p.id === playerId);
      if (!target) return prev;
      const adminsCount = prev.workspaces.il.players.filter((p) => p.isAdmin).length;
      if (target.isAdmin && adminsCount <= 1) return prev;
      const nextFlag = !target.isAdmin;
      return {
        ...prev,
        workspaces: {
          il: {
            ...prev.workspaces.il,
            players: prev.workspaces.il.players.map((p) =>
              p.id === playerId ? { ...p, isAdmin: nextFlag } : p
            ),
          },
          gm: {
            ...prev.workspaces.gm,
            players: prev.workspaces.gm.players.map((p) =>
              p.id === playerId ? { ...p, isAdmin: nextFlag } : p
            ),
          },
        },
      };
    });
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

  const createScheduledMatch = (randomize: boolean) => {
    const selected = ws.players.filter((p) => wizSelectedIds.includes(p.id));
    if (selected.length < 4) return;
    const { teamA, teamB } = splitTeamsFairly(selected, randomize);
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

  const autoSelectScheduledTeams = (randomize: boolean) => {
    updateWorkspace((prevWs) => {
      const sch = prevWs.scheduledMatch;
      if (!sch) return prevWs;
      const selected = prevWs.players.filter((p) => sch.selectedPlayerIds.includes(p.id));
      const { teamA, teamB } = splitTeamsFairly(selected, randomize);
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
    setLastOverBowler("");
    setShowNextBowlerModal(false);
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
    return bestPts > 0 ? bestName + " (" + bestPts + " MVP pts)" : "TBD";
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
    if (!m || m.isCompleted || showNextBowlerModal) return;

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
      triggerCelebration({
        kind: "century",
        badgeText: "100",
        title: "MAGNIFICENT CENTURY!",
        subtitle: m.striker + " reaches " + newBatterRuns + " (" + updatedBatters[m.striker].balls + " balls)",
      });
      speak("Century for " + m.striker);
    } else if (prevStriker.runs < 50 && newBatterRuns >= 50) {
      triggerCelebration({
        kind: "fifty",
        badgeText: "50",
        title: "HALF-CENTURY!",
        subtitle: m.striker + " smashes " + newBatterRuns + " (" + updatedBatters[m.striker].balls + " balls)",
      });
      speak("Fifty for " + m.striker);
    } else if (isWicket) {
      const last3 = nextHistory
        .filter((e) => e.innings === m.innings && e.bowler === m.bowler && !e.isWide && !e.isNoBall)
        .slice(0, 3);
      if (wicketType !== "Run Out" && last3.length === 3 && last3.every((e) => e.isWicket)) {
        triggerCelebration({
          kind: "hattrick",
          badgeText: "3 IN 3",
          title: "HAT-TRICK!",
          subtitle: m.bowler + " takes 3 wickets in 3 balls!",
        });
      } else if (wicketType !== "Run Out" && newBowlerWickets === 5) {
        triggerCelebration({
          kind: "haul",
          badgeText: "5W",
          title: "5-WICKET HAUL!",
          subtitle: m.bowler + " tears through the lineup!",
        });
      } else if (wicketType !== "Run Out" && newBowlerWickets === 3) {
        triggerCelebration({
          kind: "haul",
          badgeText: "3W",
          title: "3-WICKET HAUL!",
          subtitle: m.bowler + " is on fire!",
        });
      } else {
        triggerCelebration({
          kind: "wicket",
          badgeText: "OUT!",
          title: "WICKET!",
          subtitle: m.striker + " — " + wicketType + " (b " + m.bowler + ")",
        });
      }
    } else if (!isWide && runsScored === 6) {
      triggerCelebration({
        kind: "six",
        badgeText: "6",
        title: "MAXIMUM SIX!",
        subtitle: m.striker + " sends it out of the turf!",
      });
    } else if (!isWide && runsScored === 4) {
      triggerCelebration({
        kind: "four",
        badgeText: "4",
        title: "CRACKING FOUR!",
        subtitle: m.striker + " finds the boundary!",
      });
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

    const overJustCompleted = isLegal && nextBalls > 0 && nextBalls % 6 === 0;
    if (overJustCompleted) {
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
    } else if (overJustCompleted && !inningsEnded) {
      setUmpireBanner("END OF OVER " + Math.floor(nextBalls / 6) + "! Select next bowler.");
      speak("Over complete! Choose the next bowler.");
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

    if (overJustCompleted && !inningsEnded && !isCompleted) {
      setLastOverBowler(m.bowler);
      setShowNextBowlerModal(true);
    }
  };

  const selectNewBowler = (bowlerName: string) => {
    updateWorkspace((prevWs) =>
      prevWs.liveMatch
        ? { ...prevWs, liveMatch: { ...prevWs.liveMatch, bowler: bowlerName } }
        : prevWs
    );
    setShowNextBowlerModal(false);
    setUmpireBanner("New Bowler: " + bowlerName + " takes the ball!");
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
    setLastOverBowler("");
    setShowNextBowlerModal(true);
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
    setLastOverBowler("");
    setShowNextBowlerModal(false);
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
        bowler: last.bowler,
        freeHitActive: last.isFreeHit,
        isCompleted: false,
        isTied: false,
        batters: updatedBatters,
        bowlers: updatedBowlers,
        history: rest,
      },
    }));
    setShowNextBowlerModal(false);
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
    const wonFlag: "W" | "L" | "T" = m.isTied ? "T" : m.resultText.includes("won") ? "W" : "L";

    const matchPlayerStats: Record<string, MatchPlayerDelta> = {};
    ws.players.forEach((pl) => {
      const bat = m.batters[pl.name];
      const bowl = m.bowlers[pl.name];
      const participated = m.teamAPlayers.includes(pl.name) || m.teamBPlayers.includes(pl.name);
      if (!participated) return;
      const earnedMvp =
        (bat ? bat.runs + bat.fours * 2 + bat.sixes * 4 : 0) +
        (bowl ? bowl.wickets * 25 : 0);
      matchPlayerStats[pl.name] = {
        matches: 1,
        runs: bat ? bat.runs : 0,
        ballsFaced: bat ? bat.balls : 0,
        fours: bat ? bat.fours : 0,
        sixes: bat ? bat.sixes : 0,
        wickets: bowl ? bowl.wickets : 0,
        oversBowled: bowl ? Number((bowl.balls / 6).toFixed(2)) : 0,
        runsConceded: bowl ? bowl.runs : 0,
        mvpPoints: earnedMvp,
      };
    });

    const completed: CompletedMatch = {
      id: uid("hist"),
      title: m.title,
      date: new Date().toISOString().slice(0, 10),
      summary: m.battingTeam + " " + m.runs + "/" + m.wickets + " (" + formatOvers(m.balls) + " ov)" + firstInnSummary,
      winner: m.resultText || "Completed",
      wonFlag,
      mvp,
      scorecardText,
      playerStats: matchPlayerStats,
    };

    updateWorkspace((prevWs) => {
      const updatedPlayers = prevWs.players.map((pl) => {
        const delta = matchPlayerStats[pl.name];
        if (!delta) return pl;
        return {
          ...pl,
          matches: pl.matches + delta.matches,
          runs: pl.runs + delta.runs,
          ballsFaced: pl.ballsFaced + delta.ballsFaced,
          fours: pl.fours + delta.fours,
          sixes: pl.sixes + delta.sixes,
          wickets: pl.wickets + delta.wickets,
          oversBowled: Number((pl.oversBowled + delta.oversBowled).toFixed(2)),
          runsConceded: pl.runsConceded + delta.runsConceded,
          mvpPoints: pl.mvpPoints + delta.mvpPoints,
        };
      });

      return {
        ...prevWs,
        players: applyAutoBadges(updatedPlayers),
        liveMatch: null,
        scheduledMatch: null,
        matchHistory: [completed, ...prevWs.matchHistory],
      };
    });
    setShowNextBowlerModal(false);
    setUmpireBanner("Match archived and MVP points updated!");
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

    if (q.includes("mvp") || q.includes("orange") || q.includes("purple") || q.includes("cap") || q.includes("top")) {
      const reply =
        ws.clubName +
        " Leaders: MVP Leader is " +
        mvpLeader.name +
        " (" +
        mvpLeader.mvpPoints +
        " pts). Orange Cap: " +
        orangeCapHolder.name +
        " (" +
        orangeCapHolder.runs +
        " runs). Purple Cap: " +
        purpleCapHolder.name +
        " (" +
        purpleCapHolder.wickets +
        " wickets).";
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Club Caps and MVP", text: reply, timestamp: nowTime() },
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
        : "No active match in " + ws.clubName + " yet. Admins can create one in Matches.";
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
            mvpLeader: mvpLeader.name + " (" + mvpLeader.mvpPoints + " pts)",
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
        ", MVP Leader: " +
        mvpLeader.name +
        " (" +
        mvpLeader.mvpPoints +
        " pts).";
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
            "radial-gradient(circle at top, rgba(251,191,36,0.18), rgba(11,19,40,0.96) 55%, #030714 100%)",
        }}
      >
        <style>{themeCss}</style>
        <div className="il-card il-hero-banner" style={{ width: "100%", maxWidth: 430, padding: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              className="il-crest"
              style={{ width: 66, height: 66, fontSize: 25, margin: "0 auto 12px auto" }}
            >
              IL
            </div>
            <div
              className="il-pill"
              style={{ background: "rgba(251,191,36,0.18)", color: "#fde68a", marginBottom: 8 }}
            >
              <Flame size={13} /> PLAY - MANAGE - WIN
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "0.03em" }}>
              INDORE LEGENDS
            </h1>
            <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "var(--muted)" }}>
              Together We Rise - Official Squad Portal
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, borderRadius: 14, background: "rgba(2,6,23,0.68)", border: "1px solid var(--border)" }}>
              <PlayerAvatar
                playerId={selectedLoginPlayer.id}
                name={selectedLoginPlayer.name}
                size={54}
                rounded
              />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: "var(--gold)", fontWeight: 800, display: "block", marginBottom: 4, letterSpacing: "0.08em" }}>
                  SQUAD MEMBER (#{selectedLoginPlayer.jerseyNo})
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
                      #{p.jerseyNo} {p.name}
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
    if (leaderTab === "economy") {
      const ea = playerEconomyRate(a);
      const eb = playerEconomyRate(b);
      if (ea === null && eb === null) return b.wickets - a.wickets;
      if (ea === null) return 1;
      if (eb === null) return -1;
      return ea - eb;
    }
    return b.mvpPoints - a.mvpPoints;
  });

  const selectedProfile = selectedProfileId
    ? ws.players.find((p) => p.id === selectedProfileId) || null
    : null;

  const navItems: { id: TabKey; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Dashboard", icon: <Home size={17} /> },
    { id: "squad", label: "Squad", icon: <Users size={17} /> },
    { id: "match", label: "Matches", icon: <Trophy size={17} /> },
    { id: "leaderboard", label: "Leaderboard", icon: <BarChart3 size={17} /> },
    { id: "treasury", label: "Finance", icon: <Wallet size={17} /> },
    { id: "chat", label: "Chat", icon: <MessageSquare size={17} /> },
    { id: "ai", label: "LegendBot", icon: <Bot size={17} /> },
    { id: "settings", label: "Settings", icon: <Settings size={17} /> },
  ];

  const winDonutRadius = 36;
  const winDonutCirc = 2 * Math.PI * winDonutRadius;
  const winDonutDash = (winRate / 100) * winDonutCirc;

  if (state.maintenanceMode && !isSpinOwner) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          background:
            "radial-gradient(circle at top, rgba(251,191,36,0.2), rgba(11,19,40,0.96) 55%, #030714 100%)",
        }}
      >
        <style>{themeCss}</style>
        <div className="il-card il-hero-banner" style={{ width: "100%", maxWidth: 440, textAlign: "center", padding: 28 }}>
          <div className="il-crest" style={{ width: 64, height: 64, fontSize: 24, margin: "0 auto 14px auto" }}>
            IL
          </div>
          <span className="il-pill" style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24", marginBottom: 10 }}>
            <Clock size={12} /> MONTHLY MAINTENANCE
          </span>
          <h2 style={{ margin: "8px 0 8px 0", fontSize: 24, fontWeight: 900 }}>
            App Under Maintenance
          </h2>
          <p style={{ margin: "0 0 18px 0", fontSize: 14, color: "#cbd5e1", lineHeight: 1.55 }}>
            Month-end rotation is in progress! The new Monthly Admin is being selected via Spin the Wheel. Please check back in a few minutes.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              type="button"
              className="il-btn il-btn-primary"
              onClick={() => void pullFromBin(false, true)}
            >
              <RotateCcw size={14} /> Check Again
            </button>
            <button type="button" className="il-btn" style={{ color: "#fda4af" }} onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="il-app-layout">
      <style>{themeCss}</style>

      {/* Desktop Stadium Sidebar */}
      <aside className="il-sidebar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div className="il-crest" onClick={handleCrestTap} title="Triple-tap for Ganesh Mandir">
              {workspace === "gm" ? "GM" : "IL"}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: "#fbbf24" }}>{ws.clubName}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em" }}>
                PLAY • MANAGE • WIN
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 5 }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={"il-side-btn " + (tab === item.id ? "active" : "")}
                onClick={() => setTab(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            {canOpenSpinWheel && (
              <button
                type="button"
                className="il-side-btn"
                style={{
                  marginTop: 6,
                  background: "rgba(251,191,36,0.16)",
                  borderColor: "rgba(251,191,36,0.5)",
                  color: "#fbbf24",
                }}
                onClick={() => setShowSpinWheelModal(true)}
              >
                <Sparkles size={17} />
                <span>29th Spin Wheel</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <PlayerAvatar playerId={authPlayer.id} name={authPlayer.name} size={38} rounded />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {authPlayer.name.split(" ")[0]}
              </div>
              <div style={{ fontSize: 10, color: isAdmin ? "#fbbf24" : "#38bdf8", fontWeight: 800 }}>
                {isAdmin ? "ADMIN • #" + authPlayer.jerseyNo : "PLAYER • #" + authPlayer.jerseyNo}
              </div>
            </div>
          </div>
          <button type="button" className="il-btn" style={{ width: "100%", padding: "8px 10px", fontSize: 12, color: "#fda4af" }} onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="il-main">
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

        {/* Maintenance Active Bar for Permanent Admin (Gaurav Only) */}
        {state.maintenanceMode && isSpinOwner && (
          <div
            style={{
              background: "linear-gradient(90deg, rgba(190,18,60,0.9), rgba(225,29,72,0.85))",
              border: "1px solid rgba(251,113,133,0.7)",
              color: "#ffffff",
              padding: "9px 12px",
              borderRadius: 14,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            <span>MAINTENANCE LOCK ON — App closed for other players</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                type="button"
                className="il-btn il-btn-gold"
                style={{ padding: "5px 10px", fontSize: 11 }}
                onClick={() => setShowSpinWheelModal(true)}
              >
                <Sparkles size={13} /> Open Spin Wheel
              </button>
              <button
                type="button"
                className="il-btn"
                style={{ padding: "5px 10px", fontSize: 11 }}
                onClick={() =>
                  setState((prev) => ({ ...prev, maintenanceMode: false }))
                }
              >
                Reopen App
              </button>
            </div>
          </div>
        )}

        {/* Quick Test Mode Banner */}
        {state.testMode && (
          <div
            style={{
              background: "rgba(245,158,11,0.16)",
              border: "1px solid rgba(251,191,36,0.55)",
              borderRadius: 14,
              padding: "10px 12px",
              marginBottom: 10,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontWeight: 900, fontSize: 12, color: "#fbbf24", display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={14} /> TEST MODE ACTIVE — Quick Tools & Animation Preview
              </span>
              {isAdmin && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="il-btn il-btn-gold"
                    style={{ padding: "5px 9px", fontSize: 11 }}
                    onClick={seedSampleMatch}
                  >
                    <Plus size={12} /> Seed Sample Match
                  </button>
                  {isSpinOwner && (
                    <button
                      type="button"
                      className="il-btn il-btn-purple"
                      style={{ padding: "5px 9px", fontSize: 11 }}
                      onClick={() => setShowSpinWheelModal(true)}
                    >
                      <Shuffle size={12} /> Test Spin Wheel
                    </button>
                  )}
                  <button
                    type="button"
                    className="il-btn"
                    style={{ padding: "5px 9px", fontSize: 11 }}
                    onClick={() => setState((prev) => ({ ...prev, testMode: false }))}
                  >
                    Exit Test Mode
                  </button>
                </div>
              )}
            </div>
            {isAdmin && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "#cbd5e1", fontWeight: 800 }}>PREVIEW FX:</span>
                {(
                  [
                    { label: "50", kind: "fifty", badgeText: "50", title: "HALF-CENTURY!", subtitle: authPlayer.name + " smashes 50* (24 balls)" },
                    { label: "100", kind: "century", badgeText: "100", title: "MAGNIFICENT CENTURY!", subtitle: authPlayer.name + " reaches 100* (48 balls)" },
                    { label: "Wicket", kind: "wicket", badgeText: "OUT!", title: "WICKET!", subtitle: "Clean Bowled — Stumps Flying!" },
                    { label: "Six", kind: "six", badgeText: "6", title: "MAXIMUM SIX!", subtitle: "Out of the turf!" },
                    { label: "Four", kind: "four", badgeText: "4", title: "CRACKING FOUR!", subtitle: "Bullet to the fence!" },
                  ] as const
                ).map((fx) => (
                  <button
                    key={fx.label}
                    type="button"
                    className="il-btn"
                    style={{ padding: "3px 8px", fontSize: 10 }}
                    onClick={() =>
                      triggerCelebration({
                        kind: fx.kind,
                        badgeText: fx.badgeText,
                        title: fx.title,
                        subtitle: fx.subtitle,
                      })
                    }
                  >
                    {fx.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Top Bar */}
        <header className="il-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="il-crest" onClick={handleCrestTap} title="Club Crest">
              {workspace === "gm" ? "GM" : "IL"}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: "0.03em", color: "#fde68a" }}>
                {ws.clubName}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{authPlayer.name}</span>
                {isAdmin && (
                  <span className="il-pill" style={{ background: "rgba(251,191,36,0.22)", color: "#fbbf24", padding: "2px 7px" }}>
                    ADMIN
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (hasPendingOfflineSync) {
                      void flushPendingSyncToBin();
                    } else {
                      setCloudSyncStatus("Syncing...");
                      void pullFromBin(false, true);
                    }
                  }}
                  title={hasPendingOfflineSync ? "Tap to push queued turf changes now" : "Tap to refresh cloud sync"}
                  className="il-pill"
                  style={{
                    border: "none",
                    cursor: "pointer",
                    padding: "2px 7px",
                    background:
                      cloudSyncStatus === "Live Sync"
                        ? "rgba(52,211,153,0.18)"
                        : hasPendingOfflineSync
                        ? "rgba(245,158,11,0.28)"
                        : cloudSyncStatus.includes("Error") || cloudSyncStatus.includes("Offline")
                        ? "rgba(244,63,94,0.2)"
                        : "rgba(56,189,248,0.18)",
                    color:
                      cloudSyncStatus === "Live Sync"
                        ? "#6ee7b7"
                        : hasPendingOfflineSync
                        ? "#fde68a"
                        : cloudSyncStatus.includes("Error") || cloudSyncStatus.includes("Offline")
                        ? "#fda4af"
                        : "#7dd3fc",
                  }}
                >
                  {hasPendingOfflineSync ? "Sync Now (Queued)" : cloudSyncStatus}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              className="il-btn il-btn-gold"
              style={{ padding: "7px 10px", fontSize: 11 }}
              onClick={() => {
                setSelectedProfileId(activeUserInWs.id);
                setProfileTab("idcard");
              }}
              title="Open My Digital ID Card"
            >
              <CreditCard size={14} /> My ID
            </button>
            {canOpenSpinWheel && (
              <button
                type="button"
                className="il-btn il-btn-purple"
                style={{ padding: "7px 9px", fontSize: 11 }}
                onClick={() => setShowSpinWheelModal(true)}
                title="29th Monthly Admin Spin Wheel"
              >
                <Sparkles size={13} /> Spin
              </button>
            )}
            {authPlayer.isGM && !gmUnlocked && (
              <button
                type="button"
                className="il-btn"
                style={{ padding: "7px 9px", fontSize: 11, color: "#fbbf24" }}
                onClick={openGmUnlockPrompt}
              >
                <Lock size={13} /> GM
              </button>
            )}
            <button
              type="button"
              className="il-btn"
              style={{ padding: "8px 9px" }}
              onClick={() => setVoiceOutput((v) => !v)}
              title="Toggle Voice"
            >
              {voiceOutput ? <Volume2 size={16} color="#34d399" /> : <VolumeX size={16} color="#94a3b8" />}
            </button>
            <button
              type="button"
              className="il-btn"
              style={{ padding: "8px 9px", color: "#fb7185" }}
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
              Indore Legends ({state.workspaces.il.players.length})
            </button>
            <button
              type="button"
              className={"il-btn " + (workspace === "gm" ? "il-btn-gold" : "")}
              style={{ flex: 1, padding: "8px 10px", fontSize: 12 }}
              onClick={() => setWorkspace("gm")}
            >
              Ganesh Mandir ({state.workspaces.gm.players.length})
            </button>
          </div>
        )}

        {/* DASHBOARD / HOME TAB */}
        {tab === "home" && (
          <div>
            {/* Stadium Hero Banner */}
            <div className="il-card il-hero-banner">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <PlayerAvatar
                    playerId={activeUserInWs.id}
                    name={activeUserInWs.name}
                    size={58}
                    rounded
                    borderColor="#fbbf24"
                  />
                  <div>
                    <div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 900, letterSpacing: "0.12em" }}>
                      PLAY • MANAGE • WIN
                    </div>
                    <h2 style={{ margin: "3px 0 2px 0", fontSize: 22, fontWeight: 900 }}>
                      Welcome back, {authPlayer.name.split(" ")[0]}!
                    </h2>
                    <div style={{ fontSize: 12, color: "#cbd5e1" }}>
                      ID: <strong>{playerClubIdCode(workspace, activeUserInWs)}</strong> • Jersey #{activeUserInWs.jerseyNo}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="il-btn il-btn-gold"
                    style={{ padding: "8px 12px", fontSize: 12 }}
                    onClick={() => {
                      setSelectedProfileId(activeUserInWs.id);
                      setProfileTab("idcard");
                    }}
                  >
                    <CreditCard size={15} /> My Digital ID Card
                  </button>

                  {/* 3-Orb Theme Switcher */}
                  <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(2,6,23,0.65)", padding: "6px 10px", borderRadius: 999, border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>THEME</span>
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
              </div>

              {/* 4 KPI Strip */}
              <div className="il-grid-4 il-resp-2" style={{ marginTop: 14 }}>
                <div className="il-kpi">
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>TOTAL PLAYERS</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#38bdf8", marginTop: 3 }}>
                    {ws.players.length}
                  </div>
                </div>
                <div className="il-kpi">
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>MATCHES</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#fbbf24", marginTop: 3 }}>
                    {ws.matchHistory.length}
                  </div>
                </div>
                <div className="il-kpi">
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>WIN RATE</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#34d399", marginTop: 3 }}>
                    {winRate}%
                  </div>
                </div>
                <div className="il-kpi">
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>CLUB FUND</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#a78bfa", marginTop: 3 }}>
                    Rs.{clubNetBalance}
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Match + Quick Actions + Team Performance */}
            <div className="il-grid-2 il-resp-1" style={{ marginBottom: 12 }}>
              <div className="il-card" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={16} color="#fbbf24" /> Upcoming Match
                  </span>
                  <button
                    type="button"
                    className="il-btn"
                    style={{ padding: "4px 9px", fontSize: 11 }}
                    onClick={() => setTab("match")}
                  >
                    View All
                  </button>
                </div>

                <div style={{ fontWeight: 900, fontSize: 17, color: "#fde68a" }}>
                  {ws.scheduledMatch ? ws.scheduledMatch.title : "Season Launch Countdown"}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                  {ws.scheduledMatch
                    ? ws.scheduledMatch.teamAName + " vs " + ws.scheduledMatch.teamBName + " • " + ws.scheduledMatch.overs + " Overs"
                    : "Nov 29, 2026 • 3:00 PM IST • " + ws.groundName}
                </div>

                <div className="il-grid-4" style={{ marginTop: 12 }}>
                  {[
                    { label: "DAYS", val: cdDays },
                    { label: "HRS", val: cdHours },
                    { label: "MIN", val: cdMins },
                    { label: "SEC", val: cdSecs },
                  ].map((u) => (
                    <div
                      key={u.label}
                      style={{
                        background: "rgba(2,6,23,0.82)",
                        border: "1px solid rgba(251,191,36,0.3)",
                        borderRadius: 12,
                        padding: "9px 4px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 20, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{u.val}</div>
                      <div style={{ fontSize: 9, color: "var(--gold)", fontWeight: 800 }}>{u.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="il-btn il-btn-gold"
                  style={{ width: "100%", marginTop: 12 }}
                  onClick={() => setTab("match")}
                >
                  {ws.liveMatch ? "Open Live Match" : "Open Match Center"}
                </button>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div className="il-card" style={{ marginBottom: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={15} color="#fbbf24" /> Quick Actions
                  </div>
                  <div className="il-grid-2">
                    <button
                      type="button"
                      className="il-btn"
                      onClick={() => {
                        if (isAdmin) {
                          setShowAddPlayerModal(true);
                        } else {
                          setTab("squad");
                        }
                      }}
                    >
                      <UserPlus size={15} color="#38bdf8" /> {isAdmin ? "Add Player" : "View Squad"}
                    </button>
                    <button
                      type="button"
                      className="il-btn"
                      onClick={() => {
                        setTab("match");
                        if (isAdmin && !ws.liveMatch) {
                          setShowCreateWizard(true);
                        }
                      }}
                    >
                      <Trophy size={15} color="#fbbf24" /> Create Match
                    </button>
                    <button
                      type="button"
                      className="il-btn"
                      onClick={() => {
                        setSelectedProfileId(activeUserInWs.id);
                        setProfileTab("idcard");
                      }}
                    >
                      <CreditCard size={15} color="#34d399" /> Digital ID
                    </button>
                    <button
                      type="button"
                      className="il-btn"
                      onClick={() => setTab("treasury")}
                    >
                      <Wallet size={15} color="#a78bfa" /> Finance
                    </button>
                  </div>
                </div>

                <div className="il-card" style={{ marginBottom: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: 14 }}>Team Performance</span>
                    <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700 }}>
                      MVP: {mvpLeader.name.split(" ")[0]} ({mvpLeader.mvpPoints} pts)
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <svg width="90" height="90" viewBox="0 0 90 90">
                      <circle cx="45" cy="45" r={winDonutRadius} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="10" />
                      <circle
                        cx="45"
                        cy="45"
                        r={winDonutRadius}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="10"
                        strokeDasharray={winDonutDash + " " + winDonutCirc}
                        transform="rotate(-90 45 45)"
                      />
                      <text x="45" y="49" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
                        {winRate}%
                      </text>
                    </svg>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>Last 5 Matches</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {ws.matchHistory.length === 0 ? (
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>No matches played yet.</span>
                        ) : (
                          ws.matchHistory.slice(0, 5).map((h) => (
                            <span
                              key={h.id}
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: "50%",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 900,
                                background:
                                  h.wonFlag === "W"
                                    ? "rgba(52,211,153,0.25)"
                                    : h.wonFlag === "L"
                                    ? "rgba(244,63,94,0.25)"
                                    : "rgba(251,191,36,0.25)",
                                color:
                                  h.wonFlag === "W"
                                    ? "#34d399"
                                    : h.wonFlag === "L"
                                    ? "#fb7185"
                                    : "#fbbf24",
                              }}
                            >
                              {h.wonFlag}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Poll */}
            <div className="il-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle size={16} color="#34d399" /> Next Match Attendance Poll
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

            {/* Ground Location */}
            <div className="il-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={16} color="#38bdf8" /> Ground Direction
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

        {/* MATCHES & LIVE SCORER TAB */}
        {tab === "match" && (
          <div>
            {!lm && (
              <div>
                <div className="il-card il-hero-banner">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 800 }}>{ws.clubName} MATCH CENTER</div>
                      <h2 style={{ margin: "4px 0 0 0", fontSize: 20 }}>
                        {ws.scheduledMatch ? ws.scheduledMatch.title : "No Scheduled Match Yet"}
                      </h2>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                        Use the Auto Team Selector to split teams fairly, flip the coin, and score live.
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        className="il-btn il-btn-gold"
                        onClick={() => setShowCreateWizard((v) => !v)}
                      >
                        <Plus size={16} /> Create Match
                      </button>
                    )}
                  </div>

                  {showCreateWizard && isAdmin && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: 14,
                        borderRadius: 14,
                        background: "rgba(2,6,23,0.9)",
                        border: "1px solid var(--border)",
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "var(--gold)" }}>Create Match + Auto Team Selector</div>
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
                          {[2, 4, 5, 6, 8, 10, 12, 15, 20].map((ov) => (
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>
                            Playing Squad ({wizSelectedIds.length} selected - min 4)
                          </span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              className="il-btn"
                              style={{ padding: "4px 8px", fontSize: 11 }}
                              onClick={() => setWizSelectedIds(ws.players.map((p) => p.id))}
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              className="il-btn il-btn-emerald"
                              style={{ padding: "4px 8px", fontSize: 11 }}
                              onClick={() => {
                                const inIds = ws.poll.filter((v) => v.choice === "IN").map((v) => v.playerId);
                                if (inIds.length >= 4) setWizSelectedIds(inIds);
                              }}
                            >
                              Auto-Pick Poll IN
                            </button>
                          </div>
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
                                #{p.jerseyNo} {p.name.split(" ")[0]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          disabled={wizSelectedIds.length < 4}
                          className="il-btn il-btn-gold"
                          onClick={() => createScheduledMatch(false)}
                        >
                          <Shuffle size={15} /> Auto-Select Fair Teams (MVP)
                        </button>
                        <button
                          type="button"
                          disabled={wizSelectedIds.length < 4}
                          className="il-btn il-btn-primary"
                          onClick={() => createScheduledMatch(true)}
                        >
                          <Shuffle size={15} /> Random Auto-Select
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
                        <h3 style={{ margin: "6px 0 0 0" }}>Auto Team Selector & Captains</h3>
                      </div>
                      {isAdmin && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="il-btn il-btn-gold"
                            style={{ fontSize: 11, padding: "6px 10px" }}
                            onClick={() => autoSelectScheduledTeams(false)}
                          >
                            <Shuffle size={13} /> Fair Split
                          </button>
                          <button
                            type="button"
                            className="il-btn il-btn-primary"
                            style={{ fontSize: 11, padding: "6px 10px" }}
                            onClick={() => autoSelectScheduledTeams(true)}
                          >
                            <Shuffle size={13} /> Random Split
                          </button>
                        </div>
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
                                style={{ padding: "5px 9px", fontSize: 11 }}
                                onClick={() => swapPlayerTeam(p.id)}
                                title="Tap to swap team"
                              >
                                #{p.jerseyNo} {p.name.split(" ")[0]}
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
                                style={{ padding: "5px 9px", fontSize: 11 }}
                                onClick={() => swapPlayerTeam(p.id)}
                                title="Tap to swap team"
                              >
                                #{p.jerseyNo} {p.name.split(" ")[0]}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                        Tap any player chip above to manually move them to the opposite team.
                      </div>
                    )}

                    {/* Coin Toss */}
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

                    {/* Checklist */}
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
                          onClick={startLiveMatchFromScheduled}
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                      <Trophy size={16} color="#fbbf24" /> Completed Matches ({ws.matchHistory.length})
                    </div>
                    {isAdmin && ws.matchHistory.length > 0 && (
                      <button
                        type="button"
                        className="il-btn il-btn-danger"
                        style={{ padding: "5px 10px", fontSize: 11 }}
                        onClick={() =>
                          requireAdminPin(
                            "Delete ALL Matches & Reset All Match Stats/MVP to Zero",
                            deleteAllMatches
                          )
                        }
                      >
                        <Trash2 size={13} /> Delete All Matches
                      </button>
                    )}
                  </div>
                  {ws.matchHistory.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>
                      No matches played yet. Finished matches will appear here with Copy Scorecard, WhatsApp links, and rollback controls.
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
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="il-btn"
                              style={{ padding: "7px 10px", fontSize: 12 }}
                              onClick={() => handleCopyScorecard(h.scorecardText, h.id)}
                            >
                              {copiedCardId === h.id ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                              {copiedCardId === h.id ? "Copied" : "Copy"}
                            </button>
                            <a
                              href={"https://wa.me/?text=" + encodeURIComponent(h.scorecardText)}
                              target="_blank"
                              rel="noreferrer"
                              className="il-btn il-btn-emerald"
                              style={{ textDecoration: "none", padding: "7px 10px", fontSize: 12 }}
                            >
                              <Share2 size={14} /> WhatsApp
                            </a>
                            {isAdmin && (
                              <button
                                type="button"
                                className="il-btn il-btn-danger"
                                style={{ padding: "7px 9px", fontSize: 12 }}
                                title="Delete match and roll back MVP/stats"
                                onClick={() =>
                                  requireAdminPin(
                                    "Delete Match '" + h.title + "' & Roll Back Player Stats/MVP",
                                    () => deleteSingleMatch(h.id)
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

            {/* LIVE MATCH SCORING HUD */}
            {lm && (
              <div>
                {lm.freeHitActive && (
                  <div className="il-freehit-banner">
                    FREE HIT ACTIVE - ONLY RUN OUT ALLOWED
                  </div>
                )}

                <div className="il-card il-hero-banner">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <span className="il-pill" style={{ background: "rgba(244,63,94,0.22)", color: "#fda4af" }}>
                        <Activity size={12} /> {lm.isSuperOver ? "SUPER OVER" : "INNINGS " + lm.innings} - {lm.title}
                      </span>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{lm.tossInfo}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="il-btn"
                        style={{ padding: "7px 10px", fontSize: 12 }}
                        onClick={() => handleCopyScorecard(buildWhatsappScorecard(lm), "live_card")}
                      >
                        {copiedCardId === "live_card" ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                        {copiedCardId === "live_card" ? "Copied!" : "Copy Scorecard"}
                      </button>
                      <a
                        href={"https://wa.me/?text=" + encodeURIComponent(buildWhatsappScorecard(lm))}
                        target="_blank"
                        rel="noreferrer"
                        className="il-btn il-btn-emerald"
                        style={{ textDecoration: "none", padding: "7px 11px", fontSize: 12 }}
                      >
                        <Share2 size={14} /> WhatsApp
                      </a>
                    </div>
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
                        Live MVP: <strong>{computeLiveMvp(lm)}</strong>
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
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "var(--cyan)", fontWeight: 800 }}>BOWLER</span>
                        {isAdmin && !lm.isCompleted && (
                          <button
                            type="button"
                            className="il-btn"
                            style={{ padding: "2px 7px", fontSize: 10 }}
                            onClick={() => {
                              setLastOverBowler("");
                              setShowNextBowlerModal(true);
                            }}
                          >
                            Change
                          </button>
                        )}
                      </div>
                      <div style={{ fontWeight: 800, marginTop: 6, fontSize: 14 }}>{lm.bowler}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        {lm.bowlers[lm.bowler]?.wickets ?? 0}/{lm.bowlers[lm.bowler]?.runs ?? 0} ({formatOvers(lm.bowlers[lm.bowler]?.balls ?? 0)} ov) • Econ{" "}
                        {(lm.bowlers[lm.bowler]?.balls ?? 0) > 0
                          ? ((lm.bowlers[lm.bowler].runs / (lm.bowlers[lm.bowler].balls / 6))).toFixed(2)
                          : "0.00"}
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
                              disabled={lm.isCompleted || showNextBowlerModal}
                              className={"il-btn " + runCls}
                              onClick={() => recordLiveBall(run)}
                            >
                              +{run}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          disabled={lm.isCompleted || showNextBowlerModal}
                          className="il-btn il-btn-purple"
                          onClick={() => recordLiveBall(0, { isWide: true })}
                        >
                          WD
                        </button>
                        <button
                          type="button"
                          disabled={lm.isCompleted || showNextBowlerModal}
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
                            disabled={lm.isCompleted || showNextBowlerModal}
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
                            setLastOverBowler("");
                            setShowNextBowlerModal(true);
                          }}
                        >
                          Choose New Bowler
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
                          onClick={() => requireAdminPin("Finish Match and Award MVP Points", archiveLiveMatch)}
                        >
                          Finish and Save
                        </button>
                      </div>
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

        {/* SQUAD TAB (STADIUM TRADING CARDS + DIGITAL ID BUTTON) */}
        {tab === "squad" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{ws.clubName} Squad ({ws.players.length})</h2>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Tap any card for stats or tap ID for their scannable barcode pass</div>
              </div>
              {isAdmin && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="il-btn il-btn-purple"
                    style={{ fontSize: 12 }}
                    onClick={() =>
                      updateWorkspace((prevWs) => ({
                        ...prevWs,
                        players: applyAutoBadges(prevWs.players),
                      }))
                    }
                  >
                    <Award size={14} /> Auto-Update Badges
                  </button>
                  <button type="button" className="il-btn il-btn-gold" onClick={() => setShowAddPlayerModal(true)}>
                    <UserPlus size={15} /> Add Player
                  </button>
                </div>
              )}
            </div>

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

            <div className="il-grid-3 il-resp-2">
              {ws.players.map((p) => (
                <div key={p.id} className="il-fut-card">
                  <div
                    className="il-fut-photo-wrap"
                    onClick={() => {
                      setSelectedProfileId(p.id);
                      setProfileTab("stats");
                    }}
                  >
                    <PlayerPortraitBanner playerId={p.id} name={p.name} height={190} />
                    <div className="il-fut-fade" />

                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 10,
                        fontSize: 22,
                        fontWeight: 900,
                        color: "#fbbf24",
                        textShadow: "0 2px 10px rgba(0,0,0,0.95)",
                        lineHeight: 1,
                      }}
                    >
                      {p.jerseyNo}
                    </div>

                    <div style={{ position: "absolute", top: 8, right: 8, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      {p.isAdmin && (
                        <span className="il-pill" style={{ background: "rgba(251,191,36,0.92)", color: "#050a18", fontSize: 9 }}>
                          ADMIN
                        </span>
                      )}
                      <span className="il-pill" style={{ background: "rgba(2,6,23,0.84)", color: "#7dd3fc", fontSize: 9 }}>
                        {p.role}
                      </span>
                    </div>

                    <div style={{ position: "absolute", left: 10, right: 10, bottom: 8 }}>
                      <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1.15, textShadow: "0 2px 8px rgba(0,0,0,0.95)" }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#fde68a", fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={11} /> {p.mvpPoints} MVP Pts
                      </div>
                      <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                        <span
                          className="il-pill"
                          style={{
                            fontSize: 8,
                            padding: "2px 6px",
                            background: badgeRarityStyle(p.badgeRarity).bg,
                            color: badgeRarityStyle(p.badgeRarity).color,
                            border: "1px solid " + badgeRarityStyle(p.badgeRarity).border,
                          }}
                        >
                          {p.badgeRarity || "Common"} • {p.funAward}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: 10 }}>
                    <div className="il-grid-3" style={{ textAlign: "center", gap: 5 }}>
                      <div style={{ background: "rgba(2,6,23,0.78)", padding: "5px 3px", borderRadius: 9 }}>
                        <div style={{ fontSize: 9, color: "var(--muted)" }}>RUNS</div>
                        <div style={{ fontWeight: 900, fontSize: 13, color: "var(--cyan)" }}>{p.runs}</div>
                      </div>
                      <div style={{ background: "rgba(2,6,23,0.78)", padding: "5px 3px", borderRadius: 9 }}>
                        <div style={{ fontSize: 9, color: "var(--muted)" }}>WKTS</div>
                        <div style={{ fontWeight: 900, fontSize: 13, color: "var(--purple)" }}>{p.wickets}</div>
                      </div>
                      <div style={{ background: "rgba(2,6,23,0.78)", padding: "5px 3px", borderRadius: 9 }}>
                        <div style={{ fontSize: 9, color: "var(--muted)" }}>MAT</div>
                        <div style={{ fontWeight: 900, fontSize: 13 }}>{p.matches}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
                      <button
                        type="button"
                        className="il-btn"
                        style={{ flex: 1, padding: "6px 6px", fontSize: 11 }}
                        onClick={() => {
                          setSelectedProfileId(p.id);
                          setProfileTab("idcard");
                        }}
                      >
                        <CreditCard size={12} color="#34d399" /> ID
                      </button>
                      <button
                        type="button"
                        className="il-btn"
                        style={{ flex: 1, padding: "6px 6px", fontSize: 11 }}
                        onClick={() => {
                          setSelectedProfileId(p.id);
                          setProfileTab("stats");
                        }}
                      >
                        Stats
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          className="il-btn il-btn-gold"
                          style={{ padding: "6px 8px", fontSize: 11 }}
                          onClick={() => setEditingPlayer({ ...p })}
                          title="Edit Player"
                        >
                          <Edit3 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {tab === "leaderboard" && (
          <div>
            <div className="il-card il-hero-banner">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                <div style={{ fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", gap: 6 }}>
                  <Trophy size={18} color="#fbbf24" /> {ws.clubName} Leaderboard
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["mvp", "batting", "bowling", "economy"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={"il-btn " + (leaderTab === mode ? "il-btn-gold" : "")}
                      style={{ padding: "6px 10px", fontSize: 11, textTransform: "uppercase" }}
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
                  const plEcon = playerEconomyRate(pl);
                  const val =
                    leaderTab === "batting"
                      ? pl.runs + " Runs"
                      : leaderTab === "bowling"
                      ? pl.wickets + " Wkts"
                      : leaderTab === "economy"
                      ? plEcon !== null
                        ? plEcon.toFixed(2) + " Econ"
                        : "No Overs"
                      : pl.mvpPoints + " MVP Pts";
                  return (
                    <div
                      key={pl.id}
                      onClick={() => {
                        setSelectedProfileId(pl.id);
                        setProfileTab("stats");
                      }}
                      style={{
                        cursor: "pointer",
                        background: rank === 1 ? "rgba(251,191,36,0.2)" : "rgba(2,6,23,0.78)",
                        border: "1px solid " + (rank === 1 ? "rgba(251,191,36,0.7)" : "var(--border)"),
                        borderRadius: 16,
                        padding: rank === 1 ? "16px 8px" : "11px 8px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      {rank === 1 && <Crown size={18} color="#fbbf24" style={{ marginBottom: 4 }} />}
                      <PlayerAvatar
                        playerId={pl.id}
                        name={pl.name}
                        size={rank === 1 ? 66 : 50}
                        rounded
                        borderColor={rank === 1 ? "#fbbf24" : "#38bdf8"}
                      />
                      <div style={{ fontWeight: 900, fontSize: rank === 1 ? 18 : 14, color: rank === 1 ? "var(--gold)" : "var(--cyan)", marginTop: 6 }}>
                        #{rank}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 12, marginTop: 2 }}>{pl.name.split(" ")[0]}</div>
                      <div style={{ fontSize: 11, color: "#fde68a", fontWeight: 700, marginTop: 2 }}>{val}</div>
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
                    onClick={() => {
                      setSelectedProfileId(pl.id);
                      setProfileTab("stats");
                    }}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 12px",
                      borderRadius: 12,
                      background: "rgba(2,6,23,0.74)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="il-pill" style={{ background: "rgba(56,189,248,0.18)", color: "#7dd3fc" }}>
                        #{index + 1}
                      </span>
                      <PlayerAvatar playerId={pl.id} name={pl.name} size={38} rounded />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>
                          {pl.name} <span style={{ color: "var(--gold)", fontSize: 12 }}>#{pl.jerseyNo}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{pl.role}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, color: "var(--gold)", fontSize: 14 }}>
                        {leaderTab === "batting"
                          ? pl.runs + " Runs"
                          : leaderTab === "bowling"
                          ? pl.wickets + " Wkts"
                          : leaderTab === "economy"
                          ? playerEconomyRate(pl) !== null
                            ? playerEconomyRate(pl)!.toFixed(2) + " Econ"
                            : "—"
                          : pl.mvpPoints + " Pts"}
                      </div>
                      <div style={{ fontSize: 10, color: badgeRarityStyle(pl.badgeRarity).color, fontWeight: 700 }}>
                        {leaderTab === "economy"
                          ? pl.oversBowled + " ov • " + pl.runsConceded + " runs"
                          : (pl.badgeRarity || "Common") + " • " + pl.funAward}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FINANCE / TREASURY TAB */}
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
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {isAdmin && (
                              <button
                                type="button"
                                className="il-btn il-btn-gold"
                                style={{ padding: "6px 10px", fontSize: 12 }}
                                onClick={() =>
                                  requireAdminPin("Mark Rs." + p.finesDue + " Paid for " + p.name, () =>
                                    markPlayerDuePaid(p)
                                  )
                                }
                              >
                                <Check size={13} /> Mark Paid
                              </button>
                            )}
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
                              <Share2 size={13} /> Remind
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {isAdmin && (
              <>
                {/* TURF COST SPLITTER */}
                <div className="il-card">
                  <div style={{ fontWeight: 900, marginBottom: 10, display: "flex", alignItems: "center", gap: 6, color: "#fbbf24" }}>
                    <Coins size={16} /> Turf Cost Splitter
                  </div>
                  <div className="il-grid-2" style={{ marginBottom: 8 }}>
                    <input
                      className="il-input"
                      type="number"
                      min={1}
                      placeholder="Total Turf Bill (Rs.)"
                      value={turfBillAmount}
                      onChange={(e) => {
                        setTurfBillAmount(e.target.value);
                        setTurfSplitNotice("");
                      }}
                    />
                    <input
                      className="il-input"
                      placeholder="Turf Note"
                      value={turfBillNote}
                      onChange={(e) => setTurfBillNote(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      Split across <strong>{turfSelectedIds.length}</strong> players:{" "}
                      <strong style={{ color: "#34d399" }}>
                        Rs.{turfSelectedIds.length > 0 && Number(turfBillAmount) > 0 ? Math.ceil(Number(turfBillAmount) / turfSelectedIds.length) : 0} / player
                      </strong>
                    </span>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button
                        type="button"
                        className="il-btn il-btn-emerald"
                        style={{ padding: "4px 8px", fontSize: 11 }}
                        onClick={() => {
                          const inIds = ws.poll.filter((v) => v.choice === "IN").map((v) => v.playerId);
                          if (inIds.length > 0) setTurfSelectedIds(inIds);
                        }}
                      >
                        Pick Poll IN
                      </button>
                      <button
                        type="button"
                        className="il-btn"
                        style={{ padding: "4px 8px", fontSize: 11 }}
                        onClick={() => setTurfSelectedIds(ws.players.map((p) => p.id))}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className="il-btn"
                        style={{ padding: "4px 8px", fontSize: 11 }}
                        onClick={() => setTurfSelectedIds([])}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {ws.players.map((p) => {
                      const active = turfSelectedIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          className={"il-btn " + (active ? "il-btn-primary" : "")}
                          style={{ padding: "5px 9px", fontSize: 11 }}
                          onClick={() =>
                            setTurfSelectedIds((prev) =>
                              prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                            )
                          }
                        >
                          #{p.jerseyNo} {p.name.split(" ")[0]}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      disabled={turfSelectedIds.length === 0 || Number(turfBillAmount) <= 0}
                      className="il-btn il-btn-gold"
                      onClick={() =>
                        requireAdminPin("Apply Turf Split to Selected Players' Dues", applyTurfSplit)
                      }
                    >
                      <Plus size={14} /> Apply Split to Dues
                    </button>
                    <a
                      href={
                        "https://wa.me/?text=" +
                        encodeURIComponent(
                          ws.clubName +
                            " TURF SPLIT\n" +
                            (turfBillNote || "Turf Booking") +
                            "\nTotal: Rs." +
                            (turfBillAmount || 0) +
                            " | Players: " +
                            turfSelectedIds.length +
                            " | Per Player: Rs." +
                            (turfSelectedIds.length > 0 && Number(turfBillAmount) > 0
                              ? Math.ceil(Number(turfBillAmount) / turfSelectedIds.length)
                              : 0) +
                            "\nPlayers: " +
                            ws.players
                              .filter((p) => turfSelectedIds.includes(p.id))
                              .map((p) => p.name.split(" ")[0])
                              .join(", ")
                        )
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="il-btn il-btn-emerald"
                      style={{ textDecoration: "none", fontSize: 12 }}
                    >
                      <Share2 size={14} /> Share Split
                    </a>
                  </div>
                  {turfSplitNotice && (
                    <div style={{ fontSize: 12, color: "var(--emerald)", marginTop: 8, fontWeight: 700 }}>
                      {turfSplitNotice}
                    </div>
                  )}
                </div>

                {/* AUTO-FINE ENGINE */}
                <div className="il-card">
                  <div style={{ fontWeight: 900, marginBottom: 10, display: "flex", alignItems: "center", gap: 6, color: "#fb7185" }}>
                    <AlertTriangle size={16} /> Auto-Fine Engine
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <select
                      className="il-select"
                      value={fineTargetId}
                      onChange={(e) => setFineTargetId(e.target.value)}
                    >
                      {ws.players.map((p) => (
                        <option key={p.id} value={p.id}>
                          #{p.jerseyNo} {p.name} (Due: Rs.{p.finesDue})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {[
                      { label: "Late Arrival", amt: 20 },
                      { label: "Dropped Catch", amt: 10 },
                      { label: "Golden Duck", amt: 15 },
                      { label: "No-Show (Voted IN)", amt: 30 },
                      { label: "Lost Wind Ball", amt: 50 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="il-btn il-btn-danger"
                        style={{ padding: "6px 10px", fontSize: 11 }}
                        onClick={() =>
                          requireAdminPin(
                            "Apply Fine: " + preset.label + " (Rs." + preset.amt + ")",
                            () => applyQuickFine(fineTargetId, preset.label, preset.amt)
                          )
                        }
                      >
                        {preset.label} (Rs.{preset.amt})
                      </button>
                    ))}
                  </div>
                  <div className="il-grid-3 il-resp-1">
                    <input
                      className="il-input"
                      placeholder="Custom fine reason..."
                      value={customFineReason}
                      onChange={(e) => setCustomFineReason(e.target.value)}
                    />
                    <input
                      className="il-input"
                      type="number"
                      min={1}
                      placeholder="Fine Rs."
                      value={customFineAmount}
                      onChange={(e) => setCustomFineAmount(e.target.value)}
                    />
                    <button
                      type="button"
                      className="il-btn il-btn-gold"
                      onClick={() => {
                        const amt = Number(customFineAmount);
                        if (!customFineReason.trim() || !amt || amt <= 0) return;
                        requireAdminPin(
                          "Apply Custom Fine Rs." + amt,
                          () => {
                            applyQuickFine(fineTargetId, customFineReason.trim(), amt);
                            setCustomFineReason("");
                            setCustomFineAmount("");
                          }
                        );
                      }}
                    >
                      <Plus size={14} /> Log Fine
                    </button>
                  </div>
                </div>

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
              </>
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
        {tab === "chat" && (() => {
          const clearedAfter = ws.chatClearedAtMs || 0;
          const visibleMessages: ChatMessage[] =
            cloudMessages !== null
              ? cloudMessages.filter((m) => (m.createdAtMs || 0) > clearedAfter)
              : ws.messages;
          const isOnlineSync = chatStatus === "Live Sync";

          return (
            <div className="il-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                  <MessageSquare size={16} color="#38bdf8" /> {ws.clubName} Locker-Room Chat
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    className="il-pill"
                    style={{
                      background: isOnlineSync
                        ? "rgba(52,211,153,0.18)"
                        : "rgba(251,191,36,0.18)",
                      color: isOnlineSync ? "#6ee7b7" : "#fde68a",
                    }}
                  >
                    {chatStatus}
                  </span>
                  <button
                    type="button"
                    className="il-btn"
                    style={{ padding: "4px 8px", fontSize: 11 }}
                    onClick={() => {
                      setChatStatus("Syncing...");
                      void fetchLockerMessages(workspace)
                        .then((list) => {
                          setCloudMessages(list);
                          setChatStatus("Live Sync");
                        })
                        .catch(() => {
                          setChatStatus("Local Fallback");
                        });
                    }}
                    title="Refresh Chat"
                  >
                    <RotateCcw size={12} />
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      className="il-btn il-btn-danger"
                      style={{ padding: "4px 8px", fontSize: 11 }}
                      onClick={() =>
                        requireAdminPin(
                          "Delete All Chat Messages in " + ws.clubName,
                          handleClearChat
                        )
                      }
                      title="Delete Chat"
                    >
                      <Trash2 size={12} /> Clear Chat
                    </button>
                  )}
                </div>
              </div>

              <div className="il-scroll-box">
                {visibleMessages.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>
                    No messages yet. Start the squad chat!
                  </div>
                ) : (
                  visibleMessages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.sender === authPlayer.name ? "flex-end" : "flex-start",
                        maxWidth: "86%",
                        background:
                          m.sender === authPlayer.name
                            ? "rgba(37,99,235,0.28)"
                            : "rgba(2,6,23,0.75)",
                        border: "1px solid var(--border)",
                        padding: "10px 12px",
                        borderRadius: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          fontSize: 11,
                          marginBottom: 3,
                        }}
                      >
                        <strong style={{ color: "var(--gold)" }}>{m.sender}</strong>
                        <span style={{ color: "var(--muted)" }}>{m.timestamp}</span>
                      </div>
                      <div style={{ fontSize: 14, wordBreak: "break-word" }}>{m.text}</div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const clean = chatText.trim();
                  if (!clean || chatSending) return;

                  const ts = nowTime();
                  const tempId = uid("m");
                  const optimisticMsg: CloudChatMessage = {
                    id: tempId,
                    sender: authPlayer.name,
                    text: clean,
                    timestamp: ts,
                    workspace,
                    createdAtMs: Date.now(),
                  };

                  setChatText("");
                  setChatSending(true);

                  // Instant optimistic update in UI + local backup
                  setCloudMessages((prev) =>
                    prev !== null ? [...prev, optimisticMsg] : [optimisticMsg]
                  );
                  updateWorkspace((prevWs) => ({
                    ...prevWs,
                    messages: [
                      ...prevWs.messages,
                      { id: tempId, sender: authPlayer.name, text: clean, timestamp: ts },
                    ],
                  }));

                  void sendCloudLockerMessage({
                    workspace,
                    sender: authPlayer.name,
                    text: clean,
                    timestamp: ts,
                  })
                    .then(() => fetchLockerMessages(workspace))
                    .then((freshList) => {
                      setCloudMessages(freshList);
                      setChatStatus("Live Sync");
                    })
                    .catch(() => {
                      setChatStatus("Saved Locally (Check Firestore Rules)");
                    })
                    .finally(() => {
                      setChatSending(false);
                    });
                }}
                style={{ display: "flex", gap: 8, marginTop: 12 }}
              >
                <input
                  className="il-input"
                  placeholder={"Message as " + authPlayer.name + "..."}
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={chatSending || !chatText.trim()}
                  className="il-btn il-btn-primary"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          );
        })()}

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
              {["MVP leader and caps", "Club balance and dues", "Who is IN poll?", "Live score"].map((chip) => (
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

        {/* SETTINGS & ADMIN MANAGEMENT TAB */}
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
              <>
                {/* PERMANENT ADMIN ONLY (GAURAV): 29TH SPIN THE WHEEL & MONTH-END MAINTENANCE */}
                {isSpinOwner && (
                  <div className="il-card il-hero-banner">
                    <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6, display: "flex", alignItems: "center", gap: 6, color: "#fbbf24" }}>
                      <Crown size={17} /> 29th Monthly Admin Spin & Maintenance
                    </div>
                    <div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 10, lineHeight: 1.45 }}>
                      Permanent Admins (Gaurav & Granth) stay fixed. Every 29th of the month, spin the wheel to pick 1 rotating Monthly Admin. Only visible to you.
                    </div>
                    <div style={{ fontSize: 12, color: "#fde68a", marginBottom: 10 }}>
                      Current Monthly Admin:{" "}
                      <strong>
                        {state.monthlyAdminId
                          ? allIlPlayers.find((p) => p.id === state.monthlyAdminId)?.name || "None"
                          : "Not selected yet"}
                      </strong>
                      {state.monthlyAdminCycle ? " (" + state.monthlyAdminCycle + ")" : ""}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="il-btn il-btn-gold"
                        disabled={!canOpenSpinWheel}
                        onClick={() => setShowSpinWheelModal(true)}
                      >
                        <Sparkles size={15} />{" "}
                        {canOpenSpinWheel
                          ? "Open Spin the Wheel"
                          : "Unlocks on 29th (or enable Test Mode)"}
                      </button>
                      <button
                        type="button"
                        className={"il-btn " + (state.maintenanceMode ? "il-btn-emerald" : "il-btn-danger")}
                        onClick={() =>
                          requireAdminPin(
                            state.maintenanceMode
                              ? "Turn OFF Month-End Maintenance Lock"
                              : "Close App for Month-End Maintenance",
                            () =>
                              setState((prev) => ({
                                ...prev,
                                maintenanceMode: !prev.maintenanceMode,
                              }))
                          )
                        }
                      >
                        <Lock size={14} />{" "}
                        {state.maintenanceMode ? "Reopen App (Maintenance OFF)" : "Close App (Maintenance ON)"}
                      </button>
                    </div>
                  </div>
                )}

                {/* TEST MODE & JSON BACKUP */}
                <div className="il-card">
                  <div style={{ fontWeight: 900, marginBottom: 10, display: "flex", alignItems: "center", gap: 6, color: "#38bdf8" }}>
                    <Sparkles size={16} /> Testing Tools & JSON Backup
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    <button
                      type="button"
                      className={"il-btn " + (state.testMode ? "il-btn-gold" : "il-btn-primary")}
                      onClick={() =>
                        setState((prev) => ({ ...prev, testMode: !prev.testMode }))
                      }
                    >
                      <Sparkles size={14} /> Test Mode: {state.testMode ? "ON" : "OFF"}
                    </button>
                    <button
                      type="button"
                      className="il-btn"
                      onClick={seedSampleMatch}
                    >
                      <Plus size={14} /> Seed Sample Match
                    </button>
                    <button
                      type="button"
                      className="il-btn il-btn-emerald"
                      onClick={handleExportJsonBackup}
                    >
                      <Download size={14} /> Export JSON Backup
                    </button>
                    <button
                      type="button"
                      className="il-btn il-btn-purple"
                      onClick={() => backupFileInputRef.current?.click()}
                    >
                      <Upload size={14} /> Import JSON Backup
                    </button>
                    <input
                      ref={backupFileInputRef}
                      type="file"
                      accept="application/json,.json"
                      style={{ display: "none" }}
                      onChange={handleImportJsonBackup}
                    />
                  </div>
                  {backupNotice && (
                    <div style={{ fontSize: 12, color: "var(--emerald)", fontWeight: 700 }}>{backupNotice}</div>
                  )}
                </div>

                {/* PLAYER PASSWORD RESET BY ADMIN */}
                <div className="il-card">
                  <div style={{ fontWeight: 900, marginBottom: 10, display: "flex", alignItems: "center", gap: 6, color: "#7dd3fc" }}>
                    <Key size={16} /> Player Password Reset
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                    Reset any squad member's custom password back to their default password.
                  </div>
                  <div style={{ display: "grid", gap: 7 }}>
                    {allIlPlayers.map((p) => {
                      const hasCustom = Boolean(state.customPasswords[p.id]);
                      return (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "7px 10px",
                            borderRadius: 12,
                            background: "rgba(2,6,23,0.74)",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>
                              {p.name} <span style={{ color: "var(--gold)" }}>#{p.jerseyNo}</span>
                            </div>
                            <div style={{ fontSize: 11, color: hasCustom ? "#fde68a" : "var(--muted)" }}>
                              {hasCustom ? "Custom Password Active" : "Default (" + p.defaultPass + ")"}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={!hasCustom}
                            className="il-btn"
                            style={{ padding: "5px 10px", fontSize: 11 }}
                            onClick={() =>
                              requireAdminPin("Reset Password to Default for " + p.name, () =>
                                handleResetPlayerPassword(p.id)
                              )
                            }
                          >
                            <RotateCcw size={12} /> Reset
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="il-card">
                  <div style={{ fontWeight: 900, marginBottom: 10, display: "flex", alignItems: "center", gap: 6, color: "#fbbf24" }}>
                    <Shield size={16} /> Manage Club Admins
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                    Promote any squad member to Admin or revoke Admin privileges (Admin PIN required).
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {allIlPlayers.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 10px",
                          borderRadius: 12,
                          background: "rgba(2,6,23,0.74)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <PlayerAvatar playerId={p.id} name={p.name} size={34} rounded />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>
                              {p.name} <span style={{ color: "var(--gold)" }}>#{p.jerseyNo}</span>
                            </div>
                            <div style={{ fontSize: 11, color: p.isAdmin ? "#fbbf24" : "var(--muted)" }}>
                              {p.isAdmin ? "Admin" : "Player"}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={"il-btn " + (p.isAdmin ? "il-btn-danger" : "il-btn-emerald")}
                          style={{ padding: "6px 10px", fontSize: 11 }}
                          onClick={() =>
                            requireAdminPin(
                              (p.isAdmin ? "Remove Admin from " : "Make Admin: ") + p.name,
                              () => handleToggleAdminQuick(p.id)
                            )
                          }
                        >
                          {p.isAdmin ? "Remove Admin" : "Make Admin"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="il-card">
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>Club Settings ({ws.clubName})</div>
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
                            setState(createFreshState());
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
              </>
            )}
          </div>
        )}
      </main>

      {/* END-OF-OVER CHOOSE NEW BOWLER POPUP */}
      {showNextBowlerModal && lm && (
        <div className="il-modal-backdrop">
          <div className="il-modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 900, letterSpacing: "0.08em" }}>
                  OVER {Math.floor(lm.balls / 6)} COMPLETE
                </div>
                <div style={{ fontSize: 19, fontWeight: 900 }}>Choose New Bowler</div>
              </div>
              {!lastOverBowler && (
                <button type="button" className="il-btn" style={{ padding: 6 }} onClick={() => setShowNextBowlerModal(false)}>
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
              Select who will bowl Over {Math.floor(lm.balls / 6) + 1} for {lm.bowlingTeam}:
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {lm.bowlingPlayers.map((name) => {
                const bw = lm.bowlers[name] || { name, balls: 0, runs: 0, wickets: 0 };
                const justBowled = Boolean(lastOverBowler && name === lastOverBowler);
                const matchedPlayer = ws.players.find((p) => p.name === name);
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={justBowled && lm.bowlingPlayers.length > 1}
                    className={"il-btn " + (name === lm.bowler ? "il-btn-primary" : "")}
                    style={{
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      opacity: justBowled && lm.bowlingPlayers.length > 1 ? 0.45 : 1,
                    }}
                    onClick={() => selectNewBowler(name)}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      {matchedPlayer && (
                        <PlayerAvatar playerId={matchedPlayer.id} name={matchedPlayer.name} size={32} rounded />
                      )}
                      <span style={{ textAlign: "left" }}>
                        <strong style={{ display: "block", fontSize: 13 }}>{name}</strong>
                        {justBowled && (
                          <span style={{ fontSize: 10, color: "#fda4af" }}>Bowled previous over</span>
                        )}
                      </span>
                    </span>
                    <span style={{ fontSize: 12, color: "#fde68a", fontWeight: 800 }}>
                      {bw.wickets}/{bw.runs} ({formatOvers(bw.balls)} ov)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN EDIT PLAYER MODAL */}
      {editingPlayer && (
        <div className="il-modal-backdrop" onClick={() => setEditingPlayer(null)}>
          <div className="il-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 900, fontSize: 17, color: "#fbbf24" }}>Edit Player Details</span>
              <button type="button" className="il-btn" style={{ padding: 6 }} onClick={() => setEditingPlayer(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPlayer} style={{ display: "grid", gap: 10 }}>
              <div className="il-grid-2">
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>PLAYER NAME</label>
                  <input
                    className="il-input"
                    value={editingPlayer.name}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>JERSEY NO (#)</label>
                  <input
                    className="il-input"
                    type="number"
                    min={0}
                    max={999}
                    value={editingPlayer.jerseyNo}
                    onChange={(e) =>
                      setEditingPlayer({ ...editingPlayer, jerseyNo: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="il-grid-2">
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>ROLE</label>
                  <select
                    className="il-select"
                    value={editingPlayer.role}
                    onChange={(e) =>
                      setEditingPlayer({ ...editingPlayer, role: e.target.value as PlayerRole })
                    }
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicket-Keeper">Wicket-Keeper</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>BADGE TITLE</label>
                  <input
                    className="il-input"
                    value={editingPlayer.funAward}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, funAward: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>BADGE RARITY</label>
                <select
                  className="il-select"
                  value={editingPlayer.badgeRarity || "Common"}
                  onChange={(e) =>
                    setEditingPlayer({
                      ...editingPlayer,
                      badgeRarity: e.target.value as BadgeRarity,
                    })
                  }
                >
                  <option value="Common">Common</option>
                  <option value="Rare">Rare</option>
                  <option value="Epic">Epic</option>
                  <option value="Legendary">Legendary</option>
                  <option value="Mythic">Mythic</option>
                </select>
              </div>

              <div className="il-grid-3">
                <div>
                  <label style={{ fontSize: 10, color: "#fbbf24", fontWeight: 800 }}>MVP POINTS</label>
                  <input
                    className="il-input"
                    type="number"
                    min={0}
                    value={editingPlayer.mvpPoints}
                    onChange={(e) =>
                      setEditingPlayer({ ...editingPlayer, mvpPoints: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>RUNS</label>
                  <input
                    className="il-input"
                    type="number"
                    min={0}
                    value={editingPlayer.runs}
                    onChange={(e) =>
                      setEditingPlayer({ ...editingPlayer, runs: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>WICKETS</label>
                  <input
                    className="il-input"
                    type="number"
                    min={0}
                    value={editingPlayer.wickets}
                    onChange={(e) =>
                      setEditingPlayer({ ...editingPlayer, wickets: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="il-grid-3">
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>MATCHES</label>
                  <input
                    className="il-input"
                    type="number"
                    min={0}
                    value={editingPlayer.matches}
                    onChange={(e) =>
                      setEditingPlayer({ ...editingPlayer, matches: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>DUES (Rs.)</label>
                  <input
                    className="il-input"
                    type="number"
                    min={0}
                    value={editingPlayer.finesDue}
                    onChange={(e) =>
                      setEditingPlayer({ ...editingPlayer, finesDue: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>ADVANCE (Rs.)</label>
                  <input
                    className="il-input"
                    type="number"
                    min={0}
                    value={editingPlayer.advanceCredit}
                    onChange={(e) =>
                      setEditingPlayer({ ...editingPlayer, advanceCredit: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 14, padding: "6px 2px", flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editingPlayer.isAdmin}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, isAdmin: e.target.checked })}
                  />
                  Admin Access
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editingPlayer.isGM}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, isGM: e.target.checked })}
                  />
                  Ganesh Mandir Member
                </label>
              </div>

              <button type="submit" className="il-btn il-btn-gold" style={{ padding: 12 }}>
                Save Player Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PLAYER MODAL */}
      {showAddPlayerModal && (
        <div className="il-modal-backdrop" onClick={() => setShowAddPlayerModal(false)}>
          <div className="il-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 900, fontSize: 17, color: "#fbbf24" }}>Add New Squad Player</span>
              <button type="button" className="il-btn" style={{ padding: 6 }} onClick={() => setShowAddPlayerModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddPlayer} style={{ display: "grid", gap: 10 }}>
              <input
                className="il-input"
                placeholder="Player Full Name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                required
              />
              <div className="il-grid-2">
                <input
                  className="il-input"
                  type="number"
                  min={0}
                  max={999}
                  placeholder="Jersey No"
                  value={addJersey}
                  onChange={(e) => setAddJersey(e.target.value)}
                />
                <select
                  className="il-select"
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as PlayerRole)}
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicket-Keeper">Wicket-Keeper</option>
                </select>
              </div>
              <input
                className="il-input"
                placeholder="Login Password (default: Player123)"
                value={addPass}
                onChange={(e) => setAddPass(e.target.value)}
              />
              <div style={{ display: "flex", gap: 14, padding: "4px 2px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={addIsAdmin} onChange={(e) => setAddIsAdmin(e.target.checked)} />
                  Make Admin
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={addIsGM} onChange={(e) => setAddIsGM(e.target.checked)} />
                  Ganesh Mandir Member
                </label>
              </div>
              <button type="submit" className="il-btn il-btn-gold" style={{ padding: 12 }}>
                <UserPlus size={15} /> Add to Squad
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HERO PLAYER PROFILE & DIGITAL ID CARD MODAL */}
      {selectedProfile && (
        <div className="il-modal-backdrop" onClick={() => setSelectedProfileId("")}>
          <div className="il-modal" style={{ padding: 0 }} onClick={(e) => e.stopPropagation()}>
            {profileTab !== "idcard" ? (
              <div style={{ position: "relative" }}>
                <PlayerPortraitBanner playerId={selectedProfile.id} name={selectedProfile.name} height={225} />
                <div className="il-fut-fade" />
                <div style={{ position: "absolute", top: 14, left: 16, fontSize: 34, fontWeight: 900, color: "#fbbf24", textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>
                  {selectedProfile.jerseyNo}
                </div>
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
                    {selectedProfile.role} {selectedProfile.isAdmin ? "• ADMIN" : ""}
                  </div>
                  <div style={{ fontSize: 23, fontWeight: 900, lineHeight: 1.15 }}>{selectedProfile.name}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 0 16px" }}>
                <span style={{ fontWeight: 900, fontSize: 15, color: "#fbbf24", display: "flex", alignItems: "center", gap: 6 }}>
                  <CreditCard size={16} /> Digital Player ID
                </span>
                <button type="button" className="il-btn" style={{ padding: 6 }} onClick={() => setSelectedProfileId("")}>
                  <X size={16} />
                </button>
              </div>
            )}

            <div style={{ padding: 16 }}>
              <div className="il-grid-4" style={{ marginBottom: 14, gap: 6 }}>
                {(
                  [
                    { id: "idcard", label: "ID Card" },
                    { id: "stats", label: "Stats" },
                    { id: "career", label: "Career" },
                    { id: "awards", label: "Awards" },
                  ] as const
                ).map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    className={"il-btn " + (profileTab === pt.id ? "il-btn-gold" : "")}
                    style={{ padding: "7px 4px", fontSize: 10, textTransform: "uppercase" }}
                    onClick={() => setProfileTab(pt.id)}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>

              {profileTab === "idcard" && (
                <DigitalIdCardView
                  player={selectedProfile}
                  clubName={ws.clubName}
                  wsKey={workspace}
                />
              )}

              {profileTab === "stats" && (
                <div className="il-grid-3" style={{ textAlign: "center" }}>
                  <div style={{ background: "rgba(2,6,23,0.78)", padding: 10, borderRadius: 12 }}>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>MVP PTS</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#fbbf24" }}>{selectedProfile.mvpPoints}</div>
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
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>MATCHES</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{selectedProfile.matches}</div>
                  </div>
                  <div style={{ background: "rgba(2,6,23,0.78)", padding: 10, borderRadius: 12 }}>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>STRIKE RATE</div>
                    <div style={{ fontSize: 16, fontWeight: 900 }}>
                      {selectedProfile.ballsFaced > 0
                        ? ((selectedProfile.runs / selectedProfile.ballsFaced) * 100).toFixed(1)
                        : "0.0"}
                    </div>
                  </div>
                  <div style={{ background: "rgba(2,6,23,0.78)", padding: 10, borderRadius: 12 }}>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>ECONOMY</div>
                    <div style={{ fontSize: 16, fontWeight: 900 }}>
                      {selectedProfile.oversBowled > 0
                        ? (selectedProfile.runsConceded / selectedProfile.oversBowled).toFixed(2)
                        : "0.00"}
                    </div>
                  </div>
                </div>
              )}

              {profileTab === "career" && (
                <div className="il-grid-2" style={{ textAlign: "center" }}>
                  <div style={{ background: "rgba(2,6,23,0.78)", padding: 12, borderRadius: 12 }}>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>BOUNDARIES</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>
                      {selectedProfile.fours} Fours • {selectedProfile.sixes} Sixes
                    </div>
                  </div>
                  <div style={{ background: "rgba(2,6,23,0.78)", padding: 12, borderRadius: 12 }}>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>CLUB WALLET</div>
                    <div style={{ fontSize: 14, fontWeight: 900 }}>
                      Due Rs.{selectedProfile.finesDue} / Adv Rs.{selectedProfile.advanceCredit}
                    </div>
                  </div>
                </div>
              )}

              {profileTab === "awards" && (
                <div
                  style={{
                    background: "rgba(2,6,23,0.78)",
                    border: "1px solid " + badgeRarityStyle(selectedProfile.badgeRarity).border,
                    padding: 16,
                    borderRadius: 14,
                    textAlign: "center",
                  }}
                >
                  <Award size={30} color={badgeRarityStyle(selectedProfile.badgeRarity).color} />
                  <div style={{ marginTop: 8 }}>
                    <span
                      className="il-pill"
                      style={{
                        background: badgeRarityStyle(selectedProfile.badgeRarity).bg,
                        color: badgeRarityStyle(selectedProfile.badgeRarity).color,
                        border: "1px solid " + badgeRarityStyle(selectedProfile.badgeRarity).border,
                      }}
                    >
                      {(selectedProfile.badgeRarity || "Common").toUpperCase()} RARITY
                    </span>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 20, marginTop: 8 }}>{selectedProfile.funAward}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                    Jersey #{selectedProfile.jerseyNo} • {selectedProfile.mvpPoints} Career MVP Points
                  </div>
                </div>
              )}

              {isAdmin && (
                <button
                  type="button"
                  className="il-btn il-btn-gold"
                  style={{ width: "100%", marginTop: 12 }}
                  onClick={() => {
                    const target = { ...selectedProfile };
                    setSelectedProfileId("");
                    setEditingPlayer(target);
                  }}
                >
                  <Edit3 size={14} /> Edit Name, Jersey No, Admin & MVP
                </button>
              )}
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
                      #{p.jerseyNo} {p.name}
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

      {/* FULL-SCREEN MATCH CELEBRATION ANIMATION OVERLAY */}
      {celebration && (() => {
        const isWicketStyle =
          celebration.kind === "wicket" ||
          celebration.kind === "hattrick" ||
          celebration.kind === "haul";
        const isGoldStyle =
          celebration.kind === "fifty" ||
          celebration.kind === "century" ||
          celebration.kind === "six";
        const mainColor = isWicketStyle ? "#fb7185" : isGoldStyle ? "#fbbf24" : "#38bdf8";
        const cardBg = isWicketStyle
          ? "linear-gradient(145deg, rgba(136,19,55,0.96), rgba(9,13,30,0.98))"
          : isGoldStyle
          ? "linear-gradient(145deg, rgba(146,64,14,0.96), rgba(9,13,30,0.98))"
          : "linear-gradient(145deg, rgba(3,105,161,0.96), rgba(9,13,30,0.98))";
        return (
          <div className="il-celeb-overlay" onClick={() => setCelebration(null)}>
            <div
              className={"il-celeb-card " + (isWicketStyle ? "shake" : "")}
              style={{
                background: cardBg,
                border: "2px solid " + mainColor,
                boxShadow: "0 0 50px " + mainColor + "55",
                color: mainColor,
              }}
            >
              <div className="il-celeb-ring" />
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <span
                  key={idx}
                  style={{
                    position: "absolute",
                    left: 14 + idx * 14 + "%",
                    bottom: 18,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: idx % 2 === 0 ? mainColor : "#ffffff",
                    animation: "celebFloat " + (1.2 + idx * 0.18) + "s ease-out infinite",
                    pointerEvents: "none",
                  }}
                />
              ))}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 92,
                  height: 92,
                  padding: "0 16px",
                  borderRadius: "50%",
                  background: "rgba(2,6,23,0.82)",
                  border: "3px solid " + mainColor,
                  fontSize: celebration.badgeText.length > 3 ? 22 : 34,
                  fontWeight: 900,
                  color: "#ffffff",
                  marginBottom: 14,
                  boxShadow: "0 0 28px " + mainColor + "80",
                }}
              >
                {celebration.badgeText}
              </div>
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  fontSize: 26,
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  color: "#ffffff",
                  textShadow: "0 4px 18px rgba(0,0,0,0.7)",
                }}
              >
                {celebration.title}
              </div>
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  marginTop: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#f8fafc",
                }}
              >
                {celebration.subtitle}
              </div>
              <div style={{ position: "relative", zIndex: 2, marginTop: 14, fontSize: 11, color: "#cbd5e1" }}>
                Tap anywhere to continue
              </div>
            </div>
          </div>
        );
      })()}

      {/* 29TH MONTHLY ADMIN SPIN THE WHEEL MODAL (PERMANENT ADMIN GAURAV ONLY) */}
      {showSpinWheelModal && isSpinOwner && (() => {
        const wheelColors = [
          "#0284c7",
          "#d97706",
          "#059669",
          "#7c3aed",
          "#e11d48",
          "#0891b2",
          "#ca8a04",
          "#4f46e5",
          "#be185d",
          "#16a34a",
          "#2563eb",
        ];
        const count = eligibleWheelPlayers.length;
        const sliceDeg = count > 0 ? 360 / count : 360;
        const r = 120;
        const cx = 135;
        const cy = 135;

        return (
          <div className="il-modal-backdrop" onClick={() => !isWheelSpinning && setShowSpinWheelModal(false)}>
            <div className="il-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#fbbf24", fontWeight: 900, letterSpacing: "0.1em" }}>
                    29TH MONTHLY ROTATION • GAURAV ONLY
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>Spin the Wheel — Monthly Admin</div>
                </div>
                {!isWheelSpinning && (
                  <button type="button" className="il-btn" style={{ padding: 6 }} onClick={() => setShowSpinWheelModal(false)}>
                    <X size={16} />
                  </button>
                )}
              </div>

              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                Gaurav & Granth stay permanent admins. Spin picks 1 rotating monthly admin from the remaining squad.
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, marginBottom: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={excludeCurrentMonthly}
                  disabled={isWheelSpinning}
                  onChange={(e) => setExcludeCurrentMonthly(e.target.checked)}
                />
                Exclude current monthly admin for a fresh pick
              </label>

              {count === 0 ? (
                <div style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  No eligible players available to spin.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Pointer Arrow */}
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "11px solid transparent",
                      borderRight: "11px solid transparent",
                      borderTop: "20px solid #fbbf24",
                      marginBottom: -8,
                      zIndex: 5,
                      filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.8))",
                    }}
                  />

                  <div style={{ width: 270, height: 270, position: "relative" }}>
                    <svg
                      width="270"
                      height="270"
                      viewBox="0 0 270 270"
                      style={{
                        transform: "rotate(" + wheelRotation + "deg)",
                        transition: isWheelSpinning
                          ? "transform 4.2s cubic-bezier(0.12, 0.85, 0.18, 1)"
                          : "none",
                      }}
                    >
                      {eligibleWheelPlayers.map((pl, idx) => {
                        const startAngle = ((idx * sliceDeg - 90) * Math.PI) / 180;
                        const endAngle = (((idx + 1) * sliceDeg - 90) * Math.PI) / 180;
                        const x1 = cx + r * Math.cos(startAngle);
                        const y1 = cy + r * Math.sin(startAngle);
                        const x2 = cx + r * Math.cos(endAngle);
                        const y2 = cy + r * Math.sin(endAngle);
                        const largeArc = sliceDeg > 180 ? 1 : 0;
                        const pathData =
                          "M " + cx + " " + cy +
                          " L " + x1.toFixed(2) + " " + y1.toFixed(2) +
                          " A " + r + " " + r + " 0 " + largeArc + " 1 " + x2.toFixed(2) + " " + y2.toFixed(2) + " Z";
                        const midDeg = idx * sliceDeg + sliceDeg / 2;
                        const midRad = ((midDeg - 90) * Math.PI) / 180;
                        const tx = cx + r * 0.64 * Math.cos(midRad);
                        const ty = cy + r * 0.64 * Math.sin(midRad);
                        return (
                          <g key={pl.id}>
                            <path
                              d={pathData}
                              fill={wheelColors[idx % wheelColors.length]}
                              stroke="#050a18"
                              strokeWidth="2"
                            />
                            <text
                              x={tx}
                              y={ty}
                              fill="#ffffff"
                              fontSize="10"
                              fontWeight="900"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              transform={"rotate(" + midDeg + " " + tx + " " + ty + ")"}
                            >
                              {pl.name.split(" ")[0]}
                            </text>
                          </g>
                        );
                      })}
                      <circle cx={cx} cy={cy} r="22" fill="#050a18" stroke="#fbbf24" strokeWidth="3" />
                      <text x={cx} y={cy + 3} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="900">
                        IL
                      </text>
                    </svg>
                  </div>

                  <button
                    type="button"
                    disabled={isWheelSpinning}
                    className="il-btn il-btn-gold"
                    style={{ width: "100%", marginTop: 14, padding: 12, fontSize: 15 }}
                    onClick={handleSpinMonthlyWheel}
                  >
                    <Sparkles size={16} /> {isWheelSpinning ? "Spinning..." : "SPIN THE WHEEL"}
                  </button>

                  {wheelWinner && !isWheelSpinning && (
                    <div
                      style={{
                        width: "100%",
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 14,
                        background: "rgba(52,211,153,0.16)",
                        border: "1px solid rgba(52,211,153,0.6)",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 900 }}>WHEEL SELECTED</div>
                      <div style={{ fontSize: 20, fontWeight: 900, marginTop: 3 }}>
                        {wheelWinner.name} (#{wheelWinner.jerseyNo})
                      </div>
                      <button
                        type="button"
                        className="il-btn il-btn-emerald"
                        style={{ width: "100%", marginTop: 10 }}
                        onClick={() =>
                          requireAdminPin(
                            "Appoint " + wheelWinner.name + " as Monthly Admin",
                            () => appointMonthlyAdmin(wheelWinner)
                          )
                        }
                      >
                        <Check size={15} /> Confirm & Make Monthly Admin
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Mobile Bottom Navigation */}
      <nav className="il-mobile-nav">
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
