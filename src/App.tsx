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

type TabKey = "home" | "match" | "auction" | "squad" | "leaderboard" | "treasury" | "chat" | "ai" | "settings";
type SfxKind = "bid" | "tick" | "gavel" | "sold" | "unsold" | "trumpet" | "airhorn" | "stump" | "roar" | "duck" | "fireworks";

interface TurfRules {
  lastManStanding: boolean;
  maxOversPerBowler: number;
  bonusPowerplayOver: boolean;
  wideNbRunsOnly: boolean;
}

interface FowEntry {
  wicketNo: number;
  runs: number;
  overs: string;
  batter: string;
  dismissal: string;
}

interface PartnershipEntry {
  wicketNo: number;
  runs: number;
  balls: number;
  batters: string;
}

interface RivalryStat {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  outs: number;
}

interface MatchPrediction {
  playerId: string;
  playerName: string;
  matchId: string;
  winnerTeam: string;
  topScorer: string;
  topBowler: string;
}

interface ClubRecords {
  highestScore?: { player: string; value: number; detail: string };
  bestBowling?: { player: string; wickets: number; runs: number; detail: string };
  mostSixesInnings?: { player: string; value: number; detail: string };
  highestTeamTotal?: { team: string; runs: number; wickets: number; detail: string };
  biggestWin?: { team: string; detail: string };
}

interface SeriesTeamStanding {
  played: number;
  won: number;
  lost: number;
  tied: number;
  runsFor: number;
  oversFor: number;
  runsAgainst: number;
  oversAgainst: number;
  points: number;
}

interface SeriesCup {
  id: string;
  name: string;
  mode: "series" | "cup";
  targetMatches: number;
  teams: string[];
  standings: Record<string, SeriesTeamStanding>;
}

type PosterTemplateKey = "royal" | "gold" | "emerald" | "crimson" | "purple" | "sunset";
type ScorecardTemplateKey = "broadcast" | "mini" | "reel" | "table";
type IdCardTemplateKey = "gold" | "cyber" | "turf" | "mythic" | "royal";

interface PosterConfig {
  mode: "matchday" | "motm" | "milestone" | "champion" | "standings";
  template?: PosterTemplateKey;
  title: string;
  subtitle: string;
  teamA?: string;
  teamB?: string;
  captains?: string;
  venue?: string;
  player?: Player | null;
  highlightLine?: string;
  statsLine?: string;
  standingsRows?: { rank: number; name: string; value: string }[];
}
type WorkspaceKey = "il" | "gm";
type ThemeKey = "blue" | "gold" | "emerald" | "crimson" | "purple" | "sunset";
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
  kind: "fifty" | "century" | "wicket" | "duck" | "hattrick" | "haul" | "six" | "four" | "win";
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
  walkoutUrl?: string;
  recentForm?: { runs: number; wickets: number; date: string }[];
  highestScore?: number;
  bestBowlWkts?: number;
  bestBowlRuns?: number;
  fifties?: number;
  hundreds?: number;
  duckWicketsTotal?: number;
  auctionMvpPoints?: number;
  battingStyle?: "RHB" | "LHB";
  bowlingStyle?: "Pace" | "Spin" | "Medium" | "None";
  nickname?: string;
  catchesTotal?: number;
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
  turfRules?: TurfRules;
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
  dotBalls?: number;
  duckWickets?: number;
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
  caughtBy?: string;
  isDuckWicket?: boolean;
  batsman: string;
  bowler: string;
  timestamp: string;
  shotZone?: "Off-Side" | "Leg-Side" | "Straight" | "Loft 360";
  bowlerSide?: "Over" | "Around";
  noBallReason?: "Overstep" | "Height" | "Fielding";
  commentary?: string;
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
  firstInningsBatters?: Record<string, InningsBatterStat>;
  firstInningsBowlers?: Record<string, InningsBowlerStat>;
  catches?: Record<string, number>;
  partnershipRuns?: number;
  partnershipBalls?: number;
  history: BallEvent[];
  tossInfo: string;
  captainsInfo: string;
  turfRules?: TurfRules;
  bonusOverActive?: boolean;
  fow?: FowEntry[];
  firstInningsFow?: FowEntry[];
  partnerships?: PartnershipEntry[];
  firstInningsPartnerships?: PartnershipEntry[];
  bowlerSide?: "Over" | "Around";
  powerplayOvers?: number;
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
  djPlaylistUrl?: string;
  rivalries?: Record<string, RivalryStat>;
  predictions?: MatchPrediction[];
  predictionPoints?: Record<string, number>;
  records?: ClubRecords;
  seriesCup?: SeriesCup | null;
  auction?: AuctionCloudState | null;
  chatPinnedMessage?: string;
  pitchCondition?: string;
  clubMotto?: string;
  matchNotes?: string[];
  chatReactions?: Record<string, Record<string, number>>;
}

interface AppState {
  theme: ThemeKey;
  customPasswords: Record<string, string>;
  workspaces: Record<WorkspaceKey, WorkspaceData>;
  testMode?: boolean;
  maintenanceMode?: boolean;
  monthlyAdminId?: string | null;
  monthlyAdminCycle?: string;
  maintenanceMessage?: string;
  maintenanceTargetTime?: string;
  daylightMode?: boolean;
  compactMode?: boolean;
}

type CloudSyncPayload = Pick<
  AppState,
  | "customPasswords"
  | "workspaces"
  | "testMode"
  | "maintenanceMode"
  | "monthlyAdminId"
  | "monthlyAdminCycle"
  | "maintenanceMessage"
  | "maintenanceTargetTime"
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
const DEFAULT_LAUNCH_TIME = "2026-11-28T16:00:00+05:30";
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
  const themeMap: Record<ThemeKey, { accent: string; glow: string; bgTop: string }> = {
    blue: { accent: "#38bdf8", glow: "rgba(56, 189, 248, 0.32)", bgTop: "#0b1a42" },
    gold: { accent: "#fbbf24", glow: "rgba(251, 191, 36, 0.34)", bgTop: "#261a06" },
    emerald: { accent: "#34d399", glow: "rgba(52, 211, 153, 0.32)", bgTop: "#06251d" },
    crimson: { accent: "#fb7185", glow: "rgba(244, 63, 94, 0.36)", bgTop: "#330816" },
    purple: { accent: "#c084fc", glow: "rgba(168, 85, 247, 0.36)", bgTop: "#1f0c3a" },
    sunset: { accent: "#fb923c", glow: "rgba(251, 146, 60, 0.36)", bgTop: "#331407" },
  };
  const { accent, glow, bgTop } = themeMap[theme] || themeMap.blue;

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
    "@keyframes confettiFall { 0% { transform: translateY(-12vh) rotate(0deg); opacity: 1; } 85% { opacity: 1; } 100% { transform: translateY(105vh) rotate(540deg); opacity: 0; } }",
    "@keyframes beamSweep { 0%, 100% { transform: rotate(-16deg) scaleY(1); opacity: 0.35; } 50% { transform: rotate(16deg) scaleY(1.12); opacity: 0.72; } }",
    "@keyframes megaZoom { 0% { transform: scale(0.25); opacity: 0; letter-spacing: 0.3em; } 65% { transform: scale(1.08); opacity: 1; letter-spacing: 0.06em; } 100% { transform: scale(1); opacity: 1; letter-spacing: 0.04em; } }",
    ".il-celeb-overlay { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 140; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; cursor: pointer; overflow: hidden; }",
    ".il-celeb-card { position: relative; width: 100%; max-width: 520px; text-align: center; animation: celebPop 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards; z-index: 5; }",
    ".il-celeb-card.shake { animation: celebPop 0.35s ease-out forwards, celebShake 0.45s ease-in-out 0.25s; }",
    ".il-celeb-ring { position: absolute; left: 50%; top: 50%; width: 170px; height: 170px; margin-left: -85px; margin-top: -85px; border-radius: 50%; border: 4px solid currentColor; pointer-events: none; animation: celebRing 1.25s ease-out infinite; }",
    "@keyframes tickerSlide { 0% { transform: translateY(-10px) scale(0.92); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }",
    "@keyframes ballSoar { 0% { transform: translate(-24px, 18px) scale(0.7) rotate(0deg); opacity: 0.2; } 55% { transform: translate(0px, -10px) scale(1.12) rotate(220deg); opacity: 1; } 100% { transform: translate(22px, -22px) scale(0.95) rotate(360deg); opacity: 1; } }",
    "@keyframes stumpFly { 0% { transform: rotate(0deg) translateY(0); } 45% { transform: rotate(22deg) translate(6px, -8px); } 100% { transform: rotate(14deg) translate(4px, -4px); } }",
    "@keyframes floodlightPulse { 0%, 100% { opacity: 0.45; } 50% { opacity: 0.85; } }",
    ".il-google-ticker { animation: tickerSlide 0.35s cubic-bezier(0.22, 1, 0.36, 1); border-radius: 14px; padding: 10px 14px; margin-top: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; position: relative; overflow: hidden; }",
    ".il-stadium-lights { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 12% 0%, rgba(56, 189, 248, 0.26) 0%, transparent 42%), radial-gradient(circle at 88% 0%, rgba(251, 191, 36, 0.26) 0%, transparent 42%); animation: floodlightPulse 4s ease-in-out infinite; }",
    ".il-pitch-strip { background-image: repeating-linear-gradient(90deg, rgba(52, 211, 153, 0.05) 0px, rgba(52, 211, 153, 0.05) 18px, transparent 18px, transparent 36px); }",
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
    "@keyframes stampSlam { 0% { transform: scale(3.2) rotate(-24deg); opacity: 0; } 65% { transform: scale(0.92) rotate(-10deg); opacity: 1; } 100% { transform: scale(1) rotate(-12deg); opacity: 1; } }",
    "@keyframes firePulse { 0%, 100% { box-shadow: 0 0 8px rgba(249,115,22,0.55); } 50% { box-shadow: 0 0 18px rgba(251,191,36,0.95); } }",
    ".il-stamp { animation: stampSlam 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards; }",
    ".il-onfire { animation: firePulse 1.6s ease-in-out infinite; background: linear-gradient(90deg, #ea580c, #f59e0b); color: #050a18; }",
    "@keyframes flipPulse { 0% { transform: rotateX(18deg) scale(0.97); } 50% { transform: rotateX(0deg) scale(1.02); } 100% { transform: rotateX(0deg) scale(1); } }",
    ".il-flip-card { position: relative; background: linear-gradient(180deg, #1e293b 0%, #090d1e 49%, #020617 50%, #172554 100%); border: 2px solid #fbbf24; border-radius: 14px; padding: 11px 6px; text-align: center; box-shadow: 0 10px 26px rgba(251,191,36,0.28); animation: flipPulse 0.9s ease-out; }",
    ".il-flip-card::after { content: ''; position: absolute; left: 4px; right: 4px; top: 50%; height: 1px; background: rgba(251,191,36,0.35); }",
    ".il-daylight { filter: contrast(1.12) brightness(1.08); }",
    ".il-compact .il-card { padding: 11px; margin-bottom: 9px; }",
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
  const [passTpl, setPassTpl] = useState<IdCardTemplateKey>("gold");
  const code = playerClubIdCode(wsKey, player);

  const idPassThemes: Record<IdCardTemplateKey, { label: string; bg: string; border: string; accent: string }> = {
    gold: { label: "Gold VIP", bg: "linear-gradient(165deg, #102454 0%, #071026 55%, #1c1506 100%)", border: "rgba(251, 191, 36, 0.78)", accent: "#fbbf24" },
    cyber: { label: "Cyber Blue", bg: "linear-gradient(165deg, #082f49 0%, #020617 55%, #172554 100%)", border: "rgba(56, 189, 248, 0.8)", accent: "#38bdf8" },
    turf: { label: "Turf Pro", bg: "linear-gradient(165deg, #064e3b 0%, #022c22 55%, #050a18 100%)", border: "rgba(52, 211, 153, 0.78)", accent: "#34d399" },
    mythic: { label: "Mythic Red", bg: "linear-gradient(165deg, #4c0519 0%, #090d1e 55%, #2e1065 100%)", border: "rgba(251, 113, 133, 0.85)", accent: "#fb7185" },
    royal: { label: "Royal Purple", bg: "linear-gradient(165deg, #3b0764 0%, #0f172a 55%, #1e1b4b 100%)", border: "rgba(192, 132, 252, 0.82)", accent: "#c084fc" },
  };
  const activePass = idPassThemes[passTpl];

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
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        {(Object.keys(idPassThemes) as IdCardTemplateKey[]).map((k) => (
          <button
            key={k}
            type="button"
            className={"il-btn " + (passTpl === k ? "il-btn-gold" : "")}
            style={{ padding: "4px 8px", fontSize: 10 }}
            onClick={() => setPassTpl(k)}
          >
            {idPassThemes[k].label}
          </button>
        ))}
      </div>
      <div
        className="il-id-pass"
        style={{
          background: activePass.bg,
          borderColor: activePass.border,
          boxShadow: "0 18px 46px rgba(0,0,0,0.65), 0 0 26px " + activePass.border,
        }}
      >
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

function CricketCelebrationGraphic({
  kind,
  color,
}: {
  kind: CelebrationEvent["kind"];
  color: string;
}) {
  if (kind === "six" || kind === "four") {
    return (
      <svg width="110" height="72" viewBox="0 0 110 72" style={{ display: "block", margin: "0 auto 8px auto" }}>
        <path
          d="M 10 56 Q 54 6 98 16"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray="6 5"
          strokeLinecap="round"
        />
        <g style={{ transformOrigin: "78px 20px", animation: "ballSoar 1.1s ease-out infinite" }}>
          <circle cx="78" cy="20" r="13" fill={kind === "six" ? "#f59e0b" : "#0284c7"} stroke="#ffffff" strokeWidth="2.5" />
          <path d="M 70 14 Q 78 20 86 26" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeDasharray="3 2" />
        </g>
        <rect x="14" y="42" width="10" height="26" rx="3" fill="#fde68a" transform="rotate(-32 19 55)" />
        <rect x="8" y="34" width="4" height="14" rx="2" fill="#94a3b8" transform="rotate(-32 10 41)" />
      </svg>
    );
  }
  if (kind === "wicket" || kind === "duck" || kind === "hattrick" || kind === "haul") {
    return (
      <svg width="110" height="76" viewBox="0 0 110 76" style={{ display: "block", margin: "0 auto 8px auto" }}>
        <rect x="34" y="22" width="6" height="46" rx="3" fill="#fde68a" />
        <rect x="52" y="22" width="6" height="46" rx="3" fill="#fb7185" style={{ transformOrigin: "55px 68px", animation: "stumpFly 0.8s ease-out infinite alternate" }} />
        <rect x="70" y="22" width="6" height="46" rx="3" fill="#fde68a" />
        <rect x="30" y="14" width="18" height="4" rx="2" fill="#ffffff" transform="rotate(-24 39 16)" />
        <rect x="64" y="10" width="18" height="4" rx="2" fill="#ffffff" transform="rotate(28 73 12)" />
        <circle cx="88" cy="40" r="9" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width="110" height="72" viewBox="0 0 110 72" style={{ display: "block", margin: "0 auto 8px auto" }}>
      <path d="M 36 16 H 74 V 34 C 74 47 64 54 55 54 C 46 54 36 47 36 34 Z" fill="#fbbf24" stroke="#fef3c7" strokeWidth="2.5" />
      <path d="M 36 22 H 24 C 24 34 30 40 36 40" fill="none" stroke="#fbbf24" strokeWidth="3.5" />
      <path d="M 74 22 H 86 C 86 34 80 40 74 40" fill="none" stroke="#fbbf24" strokeWidth="3.5" />
      <rect x="50" y="54" width="10" height="8" fill="#d97706" />
      <rect x="38" y="61" width="34" height="6" rx="3" fill="#fde68a" />
      <polygon points="55,22 58,30 66,30 60,35 62,43 55,38 48,43 50,35 44,30 52,30" fill="#090d1e" />
    </svg>
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


const DEFAULT_TURF_RULES: TurfRules = {
  lastManStanding: false,
  maxOversPerBowler: 0,
  bonusPowerplayOver: true,
  wideNbRunsOnly: false,
};

let sharedAudioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === "suspended") {
      void sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

function playStadiumSfx(kind: SfxKind): void {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  const tone = (
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType = "sine",
    gainVal = 0.22,
    endFreq?: number
  ) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + dur);
    }
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(gainVal, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.03);
  };

  const noiseBurst = (start: number, dur: number, filterFreq: number, gainVal: number) => {
    const bufSize = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const srcNode = ctx.createBufferSource();
    srcNode.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(filterFreq, start);
    filter.Q.setValueAtTime(1.2, start);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, start);
    g.gain.linearRampToValueAtTime(gainVal, start + Math.min(0.08, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    srcNode.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    srcNode.start(start);
    srcNode.stop(start + dur + 0.03);
  };

  if (kind === "bid") {
    tone(740, now, 0.08, "triangle", 0.22, 980);
    tone(1120, now + 0.06, 0.09, "sine", 0.16);
  } else if (kind === "tick") {
    tone(880, now, 0.07, "square", 0.14);
  } else if (kind === "gavel") {
    tone(190, now, 0.14, "triangle", 0.42, 65);
    noiseBurst(now, 0.06, 1200, 0.28);
    tone(210, now + 0.17, 0.18, "triangle", 0.48, 55);
    noiseBurst(now + 0.17, 0.08, 1050, 0.32);
  } else if (kind === "sold") {
    tone(185, now, 0.14, "triangle", 0.45, 58);
    noiseBurst(now, 0.07, 1100, 0.3);
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      tone(n, now + 0.14 + idx * 0.08, 0.45, "sawtooth", 0.13);
    });
    tone(523.25, now + 0.46, 0.65, "sawtooth", 0.14);
    tone(783.99, now + 0.46, 0.65, "sawtooth", 0.13);
    tone(1046.5, now + 0.46, 0.65, "triangle", 0.16);
    noiseBurst(now + 0.18, 1.1, 900, 0.2);
  } else if (kind === "unsold") {
    tone(320, now, 0.24, "sawtooth", 0.2, 220);
    tone(220, now + 0.22, 0.35, "sawtooth", 0.22, 130);
  } else if (kind === "trumpet") {
    const seq: [number, number, number][] = [
      [392, 0, 0.13],
      [523.25, 0.14, 0.13],
      [659.25, 0.28, 0.13],
      [783.99, 0.42, 0.24],
      [659.25, 0.68, 0.12],
      [783.99, 0.82, 0.52],
    ];
    seq.forEach(([f, t, d]) => {
      tone(f, now + t, d, "sawtooth", 0.18);
      tone(f * 0.5, now + t, d, "triangle", 0.1);
    });
  } else if (kind === "airhorn") {
    [0, 0.2, 0.42].forEach((offset, idx) => {
      const dur = idx === 2 ? 0.55 : 0.16;
      tone(440, now + offset, dur, "sawtooth", 0.16);
      tone(554.37, now + offset, dur, "sawtooth", 0.14);
      tone(659.25, now + offset, dur, "sawtooth", 0.13);
    });
  } else if (kind === "stump") {
    noiseBurst(now, 0.12, 1800, 0.4);
    tone(240, now, 0.12, "square", 0.25, 70);
    noiseBurst(now + 0.11, 0.2, 1400, 0.24);
  } else if (kind === "roar") {
    noiseBurst(now, 1.45, 750, 0.26);
    noiseBurst(now + 0.15, 1.2, 1300, 0.15);
  } else if (kind === "duck") {
    tone(420, now, 0.14, "sawtooth", 0.24, 290);
    tone(440, now + 0.19, 0.16, "sawtooth", 0.24, 260);
  } else if (kind === "fireworks") {
    // Rocket whistle launches + low-pass boom explosions + high spark crackle
    const bursts = [0, 0.35, 0.72, 1.15, 1.55];
    bursts.forEach((bTime, idx) => {
      tone(340 + idx * 85, now + bTime, 0.26, "sine", 0.12, 1450 + idx * 180);
      tone(130 - idx * 10, now + bTime + 0.24, 0.42, "triangle", 0.36, 36);
      noiseBurst(now + bTime + 0.24, 0.36, 520, 0.34);
      noiseBurst(now + bTime + 0.32, 0.48, 2800, 0.16);
    });
    const fanfare = [523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((f, i) => {
      tone(f, now + 1.65 + i * 0.11, 0.55, "sawtooth", 0.14);
    });
  }
}

function speakAuctionVoice(text: string, enabled: boolean): void {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const indianVoice =
      voices.find((v) => v.lang.toLowerCase().includes("en-in")) ||
      voices.find((v) => v.lang.toLowerCase().includes("en-gb")) ||
      voices[0];
    if (indianVoice) u.voice = indianVoice;
    u.lang = "en-IN";
    u.rate = 1.08;
    u.pitch = 1.04;
    window.speechSynthesis.speak(u);
  } catch {
    // Ignore speech errors
  }
}

function parseMediaEmbed(rawUrl: string): {
  kind: "spotify" | "youtube" | "none";
  embedUrl: string;
  height: number;
  label: string;
} {
  const url = (rawUrl || "").trim();
  if (!url) return { kind: "none", embedUrl: "", height: 152, label: "" };

  const spotMatch = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|playlist|album|artist|episode)\/([a-zA-Z0-9]+)/i);
  if (spotMatch) {
    const type = spotMatch[1].toLowerCase();
    const id = spotMatch[2];
    const height = type === "track" || type === "episode" ? 152 : 352;
    return {
      kind: "spotify",
      embedUrl: "https://open.spotify.com/embed/" + type + "/" + id + "?utm_source=generator&theme=0",
      height,
      label: "Spotify " + type.toUpperCase(),
    };
  }

  const ytListMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  const ytVidMatch =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytVidMatch) {
    const vid = ytVidMatch[1];
    const listPart = ytListMatch ? "&list=" + ytListMatch[1] : "";
    return {
      kind: "youtube",
      embedUrl: "https://www.youtube.com/embed/" + vid + "?rel=0" + listPart,
      height: 205,
      label: "YouTube Player",
    };
  }
  if (ytListMatch && url.includes("youtube.com")) {
    return {
      kind: "youtube",
      embedUrl: "https://www.youtube.com/embed/videoseries?list=" + ytListMatch[1],
      height: 220,
      label: "YouTube Playlist",
    };
  }

  return { kind: "none", embedUrl: "", height: 152, label: "" };
}

function isPlayerOnFire(p: Player): boolean {
  const form = p.recentForm || [];
  if (form.length > 0) {
    const recentRuns = form.slice(0, 3).reduce((s, f) => s + f.runs, 0);
    const recentWkts = form.slice(0, 3).reduce((s, f) => s + f.wickets, 0);
    if (recentRuns >= 45 || recentWkts >= 3 || form[0].runs >= 30 || form[0].wickets >= 2) {
      return true;
    }
  }
  return p.mvpPoints >= 80 && p.matches > 0;
}

function getPlayerAchievements(p: Player): {
  id: string;
  title: string;
  desc: string;
  progress: number;
  target: number;
  unlocked: boolean;
}[] {
  const high = Math.max(p.highestScore || 0, p.runs >= 50 && p.matches === 1 ? p.runs : 0);
  const bestW = p.bestBowlWkts || (p.matches === 1 ? p.wickets : 0);
  return [
    {
      id: "first_fifty",
      title: "Half-Centurion",
      desc: "Score 50+ runs in an innings",
      progress: Math.min(50, high),
      target: 50,
      unlocked: (p.fifties || 0) >= 1 || high >= 50,
    },
    {
      id: "century_club",
      title: "Century Royalty",
      desc: "Score 100+ runs in an innings",
      progress: Math.min(100, high),
      target: 100,
      unlocked: (p.hundreds || 0) >= 1 || high >= 100,
    },
    {
      id: "three_fer",
      title: "3-Wicket Spell",
      desc: "Take 3+ wickets in a single match",
      progress: Math.min(3, bestW),
      target: 3,
      unlocked: bestW >= 3,
    },
    {
      id: "six_machine",
      title: "Six Machine",
      desc: "Smash 10 career sixes",
      progress: Math.min(10, p.sixes),
      target: 10,
      unlocked: p.sixes >= 10,
    },
    {
      id: "duck_hunter",
      title: "Duck Hunter",
      desc: "Dismiss 3 batters for a duck (+40 MVP)",
      progress: Math.min(3, p.duckWicketsTotal || 0),
      target: 3,
      unlocked: (p.duckWicketsTotal || 0) >= 3,
    },
    {
      id: "mvp_centurion",
      title: "MVP Centurion",
      desc: "Earn 100+ Career MVP Points",
      progress: Math.min(100, p.mvpPoints),
      target: 100,
      unlocked: p.mvpPoints >= 100,
    },
    {
      id: "turf_veteran",
      title: "Turf Veteran",
      desc: "Play 5+ club matches",
      progress: Math.min(5, p.matches),
      target: 5,
      unlocked: p.matches >= 5,
    },
  ];
}

function GavelSvg({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
      <path d="m16 16 6-6" />
      <path d="m8 8 6-6" />
      <path d="m9 7 8 8" />
      <path d="m21 11-8-8" />
    </svg>
  );
}

function MusicSvg({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function BroadcastChartsView({ lm }: { lm: LiveMatch }) {
  const [chartTab, setChartTab] = useState<"manhattan" | "worm">("manhattan");
  const [manInn, setManInn] = useState<1 | 2>(lm.innings);

  const buildOverSeries = (inningsNo: 1 | 2) => {
    const balls = [...lm.history].filter((b) => b.innings === inningsNo).reverse();
    const map = new Map<number, { runs: number; wickets: number }>();
    balls.forEach((b) => {
      const cur = map.get(b.over) || { runs: 0, wickets: 0 };
      cur.runs += b.runs;
      if (b.isWicket) cur.wickets += 1;
      map.set(b.over, cur);
    });
    const maxOv = Math.max(0, ...Array.from(map.keys()));
    if (balls.length === 0) return [];
    const arr: { over: number; runs: number; wickets: number; cumRuns: number }[] = [];
    let cum = 0;
    for (let o = 0; o <= maxOv; o += 1) {
      const item = map.get(o) || { runs: 0, wickets: 0 };
      cum += item.runs;
      arr.push({ over: o + 1, runs: item.runs, wickets: item.wickets, cumRuns: cum });
    }
    return arr;
  };

  const inn1Series = buildOverSeries(1);
  const inn2Series = buildOverSeries(2);
  const activeSeries = manInn === 1 ? inn1Series : inn2Series;
  const maxBarRun = Math.max(12, ...activeSeries.map((x) => x.runs));

  const maxWormRuns = Math.max(
    20,
    lm.target || 0,
    ...inn1Series.map((x) => x.cumRuns),
    ...inn2Series.map((x) => x.cumRuns)
  );
  const wormTotalOvers = Math.max(1, lm.totalOvers, inn1Series.length, inn2Series.length);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <button
          type="button"
          className={"il-btn " + (chartTab === "manhattan" ? "il-btn-gold" : "")}
          style={{ flex: 1, padding: "6px 8px", fontSize: 11 }}
          onClick={() => setChartTab("manhattan")}
        >
          Manhattan (Runs/Over)
        </button>
        <button
          type="button"
          className={"il-btn " + (chartTab === "worm" ? "il-btn-gold" : "")}
          style={{ flex: 1, padding: "6px 8px", fontSize: 11 }}
          onClick={() => setChartTab("worm")}
        >
          Worm Graph (Run Chase)
        </button>
      </div>

      {chartTab === "manhattan" && (
        <div>
          {lm.innings === 2 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <button
                type="button"
                className={"il-btn " + (manInn === 1 ? "il-btn-primary" : "")}
                style={{ flex: 1, padding: "4px 6px", fontSize: 10 }}
                onClick={() => setManInn(1)}
              >
                1st Inn ({lm.bowlingTeam})
              </button>
              <button
                type="button"
                className={"il-btn " + (manInn === 2 ? "il-btn-primary" : "")}
                style={{ flex: 1, padding: "4px 6px", fontSize: 10 }}
                onClick={() => setManInn(2)}
              >
                2nd Inn ({lm.battingTeam})
              </button>
            </div>
          )}

          {activeSeries.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: 14 }}>
              Bowl at least 1 ball to generate the Manhattan chart.
            </div>
          ) : (
            <div style={{ background: "rgba(2,6,23,0.82)", borderRadius: 12, padding: 10, border: "1px solid var(--border)", overflowX: "auto" }}>
              <svg viewBox="0 0 340 145" style={{ width: "100%", height: 150, display: "block" }}>
                <line x1="24" y1="120" x2="332" y2="120" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
                {activeSeries.map((ov, idx) => {
                  const slotW = Math.min(34, 300 / Math.max(1, activeSeries.length));
                  const barW = Math.max(10, slotW - 6);
                  const x = 28 + idx * slotW;
                  const h = Math.max(4, (ov.runs / maxBarRun) * 84);
                  const y = 120 - h;
                  const fill = ov.runs >= 12 ? "#fbbf24" : "#38bdf8";
                  return (
                    <g key={ov.over}>
                      <rect x={x} y={y} width={barW} height={h} rx="3" fill={fill} />
                      <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="800">
                        {ov.runs}
                      </text>
                      {Array.from({ length: ov.wickets }).map((_, wi) => (
                        <circle
                          key={wi}
                          cx={x + barW / 2}
                          cy={Math.max(8, y - 15 - wi * 9)}
                          r="4"
                          fill="#e11d48"
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      ))}
                      <text x={x + barW / 2} y="135" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700">
                        {ov.over}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                <span><strong style={{ color: "#38bdf8" }}>■</strong> Runs/Over</span>
                <span><strong style={{ color: "#fbbf24" }}>■</strong> Big Over (12+)</span>
                <span><strong style={{ color: "#e11d48" }}>●</strong> Wicket</span>
              </div>
            </div>
          )}
        </div>
      )}

      {chartTab === "worm" && (
        <div style={{ background: "rgba(2,6,23,0.82)", borderRadius: 12, padding: 10, border: "1px solid var(--border)" }}>
          {inn1Series.length === 0 && inn2Series.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: 14 }}>
              Start scoring to view the Worm run-rate comparison graph.
            </div>
          ) : (
            <>
              <svg viewBox="0 0 340 155" style={{ width: "100%", height: 155, display: "block" }}>
                <line x1="30" y1="128" x2="330" y2="128" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
                <line x1="30" y1="15" x2="30" y2="128" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
                {[0.25, 0.5, 0.75, 1].map((frac) => {
                  const y = 128 - frac * 108;
                  return (
                    <g key={frac}>
                      <line x1="30" y1={y} x2="330" y2={y} stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
                      <text x="26" y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="8">
                        {Math.round(maxWormRuns * frac)}
                      </text>
                    </g>
                  );
                })}
                {(() => {
                  const toPts = (ser: { over: number; cumRuns: number }[]) =>
                    ["30,128"]
                      .concat(
                        ser.map((pt) => {
                          const x = 30 + (pt.over / wormTotalOvers) * 295;
                          const y = 128 - (pt.cumRuns / maxWormRuns) * 108;
                          return x.toFixed(1) + "," + y.toFixed(1);
                        })
                      )
                      .join(" ");
                  return (
                    <>
                      {inn1Series.length > 0 && (
                        <>
                          <polyline fill="none" stroke="#fbbf24" strokeWidth="2.6" points={toPts(inn1Series)} />
                          {inn1Series.map((pt) => {
                            if (pt.wickets === 0) return null;
                            const x = 30 + (pt.over / wormTotalOvers) * 295;
                            const y = 128 - (pt.cumRuns / maxWormRuns) * 108;
                            return <circle key={"w1_" + pt.over} cx={x} cy={y} r="3.6" fill="#e11d48" stroke="#fbbf24" strokeWidth="1.2" />;
                          })}
                        </>
                      )}
                      {inn2Series.length > 0 && (
                        <>
                          <polyline fill="none" stroke="#38bdf8" strokeWidth="2.8" points={toPts(inn2Series)} />
                          {inn2Series.map((pt) => {
                            if (pt.wickets === 0) return null;
                            const x = 30 + (pt.over / wormTotalOvers) * 295;
                            const y = 128 - (pt.cumRuns / maxWormRuns) * 108;
                            return <circle key={"w2_" + pt.over} cx={x} cy={y} r="3.6" fill="#e11d48" stroke="#ffffff" strokeWidth="1.2" />;
                          })}
                        </>
                      )}
                    </>
                  );
                })()}
                <text x="180" y="146" textAnchor="middle" fill="#94a3b8" fontSize="9">
                  Overs (0 to {wormTotalOvers})
                </text>
              </svg>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                <span><strong style={{ color: "#fbbf24" }}>━━</strong> 1st Innings</span>
                <span><strong style={{ color: "#38bdf8" }}>━━</strong> 2nd Innings</span>
                <span><strong style={{ color: "#e11d48" }}>●</strong> Wicket</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function UniversalDjModal({
  clubName,
  clubPlaylistUrl,
  activeTrackUrl,
  activeTrackLabel,
  isAdmin,
  onSaveClubUrl,
  onSetActiveTrack,
  onClose,
}: {
  clubName: string;
  clubPlaylistUrl: string;
  activeTrackUrl: string;
  activeTrackLabel: string;
  isAdmin: boolean;
  onSaveClubUrl: (url: string) => void;
  onSetActiveTrack: (url: string, label: string) => void;
  onClose: () => void;
}) {
  const [urlDraft, setUrlDraft] = useState<string>(activeTrackUrl || clubPlaylistUrl || "");
  const [localAudioUrl, setLocalAudioUrl] = useState<string>("");
  const [localAudioName, setLocalAudioName] = useState<string>("");
  const effectiveUrl = activeTrackUrl || clubPlaylistUrl;
  const parsed = parseMediaEmbed(effectiveUrl);

  const handleLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    setLocalAudioUrl(URL.createObjectURL(file));
    setLocalAudioName(file.name);
  };

  return (
    <div className="il-modal-backdrop" onClick={onClose}>
      <div className="il-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#34d399" }}><MusicSvg size={18} /></span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: "#fde68a" }}>{clubName} Club DJ</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>Spotify • YouTube Full Songs • Local Phone MP3 • Live SFX</div>
            </div>
          </div>
          <button type="button" className="il-btn" style={{ padding: 6 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {activeTrackLabel && (
          <div style={{ marginBottom: 8, padding: "6px 10px", borderRadius: 10, background: "rgba(52,211,153,0.16)", border: "1px solid rgba(52,211,153,0.4)", fontSize: 11, color: "#6ee7b7", fontWeight: 800 }}>
            Now Queued: {activeTrackLabel}
          </div>
        )}

        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          <input
            className="il-input"
            placeholder="Paste Spotify or YouTube link (track/playlist)..."
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              className="il-btn il-btn-primary"
              style={{ flex: 1, fontSize: 12 }}
              onClick={() => onSetActiveTrack(urlDraft.trim(), "Custom DJ Link")}
            >
              Load Track / Playlist
            </button>
            {isAdmin && (
              <button
                type="button"
                className="il-btn il-btn-gold"
                style={{ fontSize: 12 }}
                onClick={() => {
                  onSaveClubUrl(urlDraft.trim());
                  onSetActiveTrack(urlDraft.trim(), "Club Synced Playlist");
                }}
              >
                Sync Club Default
              </button>
            )}
          </div>
        </div>

        {parsed.kind !== "none" ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span className="il-pill" style={{ background: parsed.kind === "spotify" ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)", color: parsed.kind === "spotify" ? "#86efac" : "#fca5a5" }}>
                {parsed.label}
              </span>
              <a
                href={effectiveUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 11, color: "#38bdf8", fontWeight: 800, textDecoration: "none" }}
              >
                Open Full App ↗
              </a>
            </div>
            <iframe
              title="Club DJ Player"
              src={parsed.embedUrl}
              width="100%"
              height={parsed.height}
              style={{ border: 0, borderRadius: 12, background: "#050a18" }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        ) : (
          <div style={{ padding: 14, borderRadius: 12, background: "rgba(2,6,23,0.75)", border: "1px dashed var(--border)", textAlign: "center", fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
            Paste any <strong>Spotify</strong> playlist/song link or <strong>YouTube</strong> music link above to stream inside the app.
          </div>
        )}

        <div style={{ padding: 10, borderRadius: 12, background: "rgba(2,6,23,0.75)", border: "1px solid var(--border)", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#fde68a" }}>Offline Phone MP3 (Bluetooth Speaker)</span>
            <label className="il-btn" style={{ padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>
              <Upload size={12} /> Pick MP3
              <input type="file" accept="audio/*" style={{ display: "none" }} onChange={handleLocalFile} />
            </label>
          </div>
          {localAudioUrl && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "#6ee7b7", marginBottom: 4 }}>{localAudioName}</div>
              <audio controls src={localAudioUrl} style={{ width: "100%", height: 34 }} />
            </div>
          )}
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#7dd3fc", marginBottom: 6 }}>VIBE COMBO TEMPLATES (MULTI-SFX)</div>
          <div className="il-grid-2" style={{ gap: 6 }}>
            <button
              type="button"
              className="il-btn il-btn-gold"
              style={{ padding: "6px 8px", fontSize: 11 }}
              onClick={() => {
                playStadiumSfx("trumpet");
                window.setTimeout(() => playStadiumSfx("roar"), 450);
              }}
            >
              💥 Six Blast Combo
            </button>
            <button
              type="button"
              className="il-btn il-btn-danger"
              style={{ padding: "6px 8px", fontSize: 11 }}
              onClick={() => {
                playStadiumSfx("stump");
                window.setTimeout(() => playStadiumSfx("airhorn"), 260);
              }}
            >
              ☝️ Wicket Drama Combo
            </button>
            <button
              type="button"
              className="il-btn il-btn-purple"
              style={{ padding: "6px 8px", fontSize: 11 }}
              onClick={() => {
                playStadiumSfx("gavel");
                window.setTimeout(() => playStadiumSfx("sold"), 380);
              }}
            >
              🔨 Auction Sold Hype
            </button>
            <button
              type="button"
              className="il-btn il-btn-emerald"
              style={{ padding: "6px 8px", fontSize: 11 }}
              onClick={() => {
                playStadiumSfx("fireworks");
              }}
            >
              🎆 Launch Fireworks Show
            </button>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "var(--gold)", marginBottom: 6 }}>INSTANT STADIUM SFX (OFFLINE)</div>
          <div className="il-grid-3" style={{ gap: 6 }}>
            {(
              [
                { k: "trumpet", label: "🎺 IPL Trumpet" },
                { k: "airhorn", label: "📢 Airhorn" },
                { k: "gavel", label: "🔨 Gavel Slam" },
                { k: "sold", label: "🏆 SOLD Horn" },
                { k: "stump", label: "💥 Stump Smash" },
                { k: "roar", label: "🏟️ Crowd Roar" },
                { k: "duck", label: "🦆 Duck Quack" },
                { k: "bid", label: "🔔 Bid Tick" },
                { k: "unsold", label: "❌ Unsold" },
              ] as { k: SfxKind; label: string }[]
            ).map((btn) => (
              <button
                key={btn.k}
                type="button"
                className="il-btn"
                style={{ padding: "7px 6px", fontSize: 11 }}
                onClick={() => playStadiumSfx(btn.k)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PosterStudioModal({
  config,
  clubName,
  onClose,
}: {
  config: PosterConfig;
  clubName: string;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [tpl, setTpl] = useState<PosterTemplateKey>(config.template || "royal");
  const [layoutMode, setLayoutMode] = useState<PosterConfig["mode"]>(config.mode);

  const posterThemes: Record<
    PosterTemplateKey,
    { label: string; bg0: string; bg1: string; bg2: string; beam1: string; beam2: string; border: string; primary: string; secondary: string; footerBg: string; footerTxt: string }
  > = {
    royal: { label: "Royal IPL", bg0: "#153273", bg1: "#071026", bg2: "#020510", beam1: "#38bdf8", beam2: "#fbbf24", border: "#fbbf24", primary: "#fbbf24", secondary: "#7dd3fc", footerBg: "#fbbf24", footerTxt: "#050a18" },
    gold: { label: "Gold Trophy", bg0: "#451a03", bg1: "#1c1205", bg2: "#050402", beam1: "#fbbf24", beam2: "#fde68a", border: "#fde68a", primary: "#fde68a", secondary: "#fbbf24", footerBg: "#fde68a", footerTxt: "#1c1205" },
    emerald: { label: "Cyber Turf", bg0: "#064e3b", bg1: "#022c22", bg2: "#020b09", beam1: "#34d399", beam2: "#38bdf8", border: "#34d399", primary: "#6ee7b7", secondary: "#38bdf8", footerBg: "#34d399", footerTxt: "#022c22" },
    crimson: { label: "Crimson Fire", bg0: "#7f1d1d", bg1: "#2a0610", bg2: "#090205", beam1: "#fb7185", beam2: "#fbbf24", border: "#fb7185", primary: "#fda4af", secondary: "#fde68a", footerBg: "#fb7185", footerTxt: "#1f040b" },
    purple: { label: "Knight Royal", bg0: "#4c1d95", bg1: "#170b3b", bg2: "#050311", beam1: "#c084fc", beam2: "#38bdf8", border: "#c084fc", primary: "#e9d5ff", secondary: "#fbbf24", footerBg: "#c084fc", footerTxt: "#14072b" },
    sunset: { label: "Indore Sunset", bg0: "#7c2d12", bg1: "#2b0d14", bg2: "#080308", beam1: "#fb923c", beam2: "#f43f5e", border: "#fb923c", primary: "#fed7aa", secondary: "#fbbf24", footerBg: "#fb923c", footerTxt: "#1f0903" },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pal = posterThemes[tpl] || posterThemes.royal;

    const drawPoster = (img?: HTMLImageElement | null) => {
      const W = 1080;
      const H = 1080;
      canvas.width = W;
      canvas.height = H;

      const bg = ctx.createRadialGradient(W / 2, 180, 60, W / 2, H / 2, 780);
      bg.addColorStop(0, pal.bg0);
      bg.addColorStop(0.55, pal.bg1);
      bg.addColorStop(1, pal.bg2);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Diagonal Stadium Floodlight Beams
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = pal.beam1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(420, 0);
      ctx.lineTo(700, H);
      ctx.lineTo(120, H);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = pal.beam2;
      ctx.beginPath();
      ctx.moveTo(W, 0);
      ctx.lineTo(W - 420, 0);
      ctx.lineTo(W - 700, H);
      ctx.lineTo(W - 120, H);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Double Broadcast Frame
      ctx.strokeStyle = pal.border;
      ctx.lineWidth = 10;
      ctx.strokeRect(36, 36, W - 72, H - 72);
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 3;
      ctx.strokeRect(54, 54, W - 108, H - 108);

      ctx.fillStyle = pal.primary;
      ctx.font = "900 34px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(clubName.toUpperCase(), W / 2, 118);

      const headerTag =
        layoutMode === "motm"
          ? "★ MAN OF THE MATCH ★"
          : layoutMode === "milestone"
          ? "★ CLUB MILESTONE & STAR ★"
          : layoutMode === "champion"
          ? "🏆 TOURNAMENT CHAMPIONS 🏆"
          : layoutMode === "standings"
          ? "📊 OFFICIAL TOP RANKINGS 📊"
          : "★ OFFICIAL MATCH DAY ★";

      ctx.fillStyle = pal.secondary;
      ctx.font = "800 24px Inter, system-ui, sans-serif";
      ctx.fillText(headerTag, W / 2, 164);

      if (layoutMode === "motm" || layoutMode === "milestone") {
        const cx = W / 2;
        const cy = 415;
        const rad = 180;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        if (img) {
          ctx.drawImage(img, cx - rad, cy - rad, rad * 2, rad * 2);
        } else {
          ctx.fillStyle = pal.bg0;
          ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
          ctx.fillStyle = pal.primary;
          ctx.font = "900 110px Inter, system-ui, sans-serif";
          ctx.fillText(
            config.player ? playerInitials(config.player.name) : "IL",
            cx,
            cy + 36
          );
        }
        ctx.restore();

        ctx.strokeStyle = pal.border;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, rad + 5, 0, Math.PI * 2);
        ctx.stroke();

        if (config.player) {
          ctx.fillStyle = pal.footerBg;
          ctx.fillRect(W / 2 - 75, 575, 150, 44);
          ctx.fillStyle = pal.footerTxt;
          ctx.font = "900 26px Inter, system-ui, sans-serif";
          ctx.fillText("#" + config.player.jerseyNo + " • OVR " + computePlayerOvrRating(config.player), W / 2, 606);
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 58px Inter, system-ui, sans-serif";
        ctx.fillText((config.player ? config.player.name : config.title).toUpperCase(), W / 2, 695);

        ctx.fillStyle = pal.primary;
        ctx.font = "900 36px Inter, system-ui, sans-serif";
        ctx.fillText(config.highlightLine || config.subtitle, W / 2, 755);

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "700 27px Inter, system-ui, sans-serif";
        ctx.fillText(config.statsLine || "", W / 2, 825);
      } else if (layoutMode === "champion") {
        ctx.fillStyle = pal.primary;
        ctx.font = "900 130px Inter, system-ui, sans-serif";
        ctx.fillText("🏆", W / 2, 365);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 66px Inter, system-ui, sans-serif";
        ctx.fillText((config.teamA || config.title).toUpperCase(), W / 2, 480);

        ctx.fillStyle = pal.secondary;
        ctx.font = "900 34px Inter, system-ui, sans-serif";
        ctx.fillText((config.highlightLine || config.subtitle).toUpperCase(), W / 2, 560);

        ctx.fillStyle = "rgba(2, 6, 23, 0.65)";
        ctx.fillRect(120, 620, W - 240, 210);
        ctx.strokeStyle = pal.border;
        ctx.lineWidth = 4;
        ctx.strokeRect(120, 620, W - 240, 210);

        ctx.fillStyle = "#fde68a";
        ctx.font = "800 30px Inter, system-ui, sans-serif";
        ctx.fillText(config.statsLine || "UNSTOPPABLE SQUAD DOMINANCE", W / 2, 705);

        ctx.fillStyle = "#cbd5e1";
        ctx.font = "700 26px Inter, system-ui, sans-serif";
        ctx.fillText(config.venue || "Indore Home Turf • Season 2026-27", W / 2, 775);
      } else if (layoutMode === "standings") {
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 50px Inter, system-ui, sans-serif";
        ctx.fillText(config.title.toUpperCase(), W / 2, 250);

        ctx.fillStyle = pal.secondary;
        ctx.font = "700 26px Inter, system-ui, sans-serif";
        ctx.fillText(config.subtitle, W / 2, 300);

        const rows = config.standingsRows || [
          { rank: 1, name: config.teamA || "Top Contender #1", value: config.highlightLine || "Leader" },
          { rank: 2, name: config.teamB || "Contender #2", value: "Rank #2" },
          { rank: 3, name: "Contender #3", value: "Rank #3" },
        ];

        rows.slice(0, 5).forEach((row, idx) => {
          const y = 360 + idx * 105;
          ctx.fillStyle = idx === 0 ? "rgba(251,191,36,0.22)" : "rgba(2,6,23,0.72)";
          ctx.fillRect(100, y, W - 200, 84);
          ctx.strokeStyle = idx === 0 ? pal.border : "rgba(255,255,255,0.18)";
          ctx.lineWidth = idx === 0 ? 4 : 2;
          ctx.strokeRect(100, y, W - 200, 84);

          ctx.textAlign = "left";
          ctx.fillStyle = idx === 0 ? pal.primary : "#7dd3fc";
          ctx.font = "900 36px Inter, system-ui, sans-serif";
          ctx.fillText("#" + row.rank, 132, y + 54);

          ctx.fillStyle = "#ffffff";
          ctx.font = "800 34px Inter, system-ui, sans-serif";
          ctx.fillText(row.name.slice(0, 22), 215, y + 54);

          ctx.textAlign = "right";
          ctx.fillStyle = pal.primary;
          ctx.font = "900 32px Inter, system-ui, sans-serif";
          ctx.fillText(row.value, W - 130, y + 54);
        });
        ctx.textAlign = "center";
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 54px Inter, system-ui, sans-serif";
        ctx.fillText(config.title.toUpperCase(), W / 2, 260);

        ctx.fillStyle = "rgba(15, 29, 66, 0.85)";
        ctx.fillRect(100, 330, W - 200, 310);
        ctx.strokeStyle = pal.border;
        ctx.lineWidth = 4;
        ctx.strokeRect(100, 330, W - 200, 310);

        ctx.fillStyle = pal.secondary;
        ctx.font = "900 58px Inter, system-ui, sans-serif";
        ctx.fillText((config.teamA || "LEGENDS XI").toUpperCase(), W / 2, 425);

        ctx.fillStyle = pal.primary;
        ctx.font = "900 44px Inter, system-ui, sans-serif";
        ctx.fillText("VS", W / 2, 495);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 58px Inter, system-ui, sans-serif";
        ctx.fillText((config.teamB || "STRIKERS XI").toUpperCase(), W / 2, 575);

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "700 27px Inter, system-ui, sans-serif";
        ctx.fillText(config.captains || "", W / 2, 715);

        ctx.fillStyle = "#34d399";
        ctx.font = "800 32px Inter, system-ui, sans-serif";
        ctx.fillText(config.subtitle, W / 2, 785);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "700 26px Inter, system-ui, sans-serif";
        ctx.fillText(config.venue || "Indore Home Turf", W / 2, 845);
      }

      ctx.fillStyle = pal.footerBg;
      ctx.fillRect(240, 920, W - 480, 62);
      ctx.fillStyle = pal.footerTxt;
      ctx.font = "900 28px Inter, system-ui, sans-serif";
      ctx.fillText("PLAY • MANAGE • WIN  |  #INDORELEGENDS", W / 2, 961);

      setReady(true);
    };

    if ((layoutMode === "motm" || layoutMode === "milestone") && config.player) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => drawPoster(img);
      img.onerror = () => drawPoster(null);
      img.src = playerPhotoPath(config.player.id);
    } else {
      drawPoster(null);
    }
  }, [config, clubName, tpl, layoutMode]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "indore-legends-" + layoutMode + "-" + tpl + "-" + Date.now() + ".png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="il-modal-backdrop" onClick={onClose}>
      <div className="il-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 16, color: "#fbbf24", display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={16} /> Poster Studio • 6 Themes × 5 Layouts
          </span>
          <button type="button" className="il-btn" style={{ padding: 6 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* VISUAL STYLE TEMPLATES */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          {(Object.keys(posterThemes) as PosterTemplateKey[]).map((key) => (
            <button
              key={key}
              type="button"
              className={"il-btn " + (tpl === key ? "il-btn-gold" : "")}
              style={{ padding: "4px 8px", fontSize: 10 }}
              onClick={() => setTpl(key)}
            >
              {posterThemes[key].label}
            </button>
          ))}
        </div>

        {/* LAYOUT MODE TEMPLATES */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
          {(
            [
              { id: "matchday", l: "Match Day" },
              { id: "motm", l: "MOTM" },
              { id: "milestone", l: "Milestone" },
              { id: "champion", l: "Champion 🏆" },
              { id: "standings", l: "Top Table" },
            ] as const
          ).map((lmOpt) => (
            <button
              key={lmOpt.id}
              type="button"
              className={"il-btn " + (layoutMode === lmOpt.id ? "il-btn-primary" : "")}
              style={{ padding: "4px 8px", fontSize: 10 }}
              onClick={() => setLayoutMode(lmOpt.id)}
            >
              {lmOpt.l}
            </button>
          ))}
        </div>

        <canvas
          ref={canvasRef}
          style={{ width: "100%", borderRadius: 14, border: "1px solid rgba(251,191,36,0.5)", display: "block" }}
        />

        <div className="il-grid-2" style={{ marginTop: 12 }}>
          <button type="button" disabled={!ready} className="il-btn il-btn-gold" onClick={handleDownload}>
            <Download size={15} /> Download PNG
          </button>
          <button type="button" className="il-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerFaceOffModal({
  players,
  rivalries,
  onClose,
}: {
  players: Player[];
  rivalries: Record<string, RivalryStat>;
  onClose: () => void;
}) {
  const [p1Id, setP1Id] = useState<string>(players[0]?.id || "");
  const [p2Id, setP2Id] = useState<string>(players[1]?.id || players[0]?.id || "");
  const p1 = players.find((p) => p.id === p1Id) || players[0];
  const p2 = players.find((p) => p.id === p2Id) || players[1] || players[0];
  if (!p1 || !p2) return null;

  const p1Sr = p1.ballsFaced > 0 ? ((p1.runs / p1.ballsFaced) * 100).toFixed(1) : "0.0";
  const p2Sr = p2.ballsFaced > 0 ? ((p2.runs / p2.ballsFaced) * 100).toFixed(1) : "0.0";
  const p1Ec = p1.oversBowled > 0 ? (p1.runsConceded / p1.oversBowled).toFixed(2) : "—";
  const p2Ec = p2.oversBowled > 0 ? (p2.runsConceded / p2.oversBowled).toFixed(2) : "—";

  const h2hA = rivalries[p1.name + "__vs__" + p2.name];
  const h2hB = rivalries[p2.name + "__vs__" + p1.name];

  const rows: { label: string; v1: string | number; v2: string | number; n1: number; n2: number; lowerWins?: boolean }[] = [
    { label: "MVP Points", v1: p1.mvpPoints, v2: p2.mvpPoints, n1: p1.mvpPoints, n2: p2.mvpPoints },
    { label: "Runs", v1: p1.runs, v2: p2.runs, n1: p1.runs, n2: p2.runs },
    { label: "Strike Rate", v1: p1Sr, v2: p2Sr, n1: Number(p1Sr), n2: Number(p2Sr) },
    { label: "Wickets", v1: p1.wickets, v2: p2.wickets, n1: p1.wickets, n2: p2.wickets },
    { label: "Economy", v1: p1Ec, v2: p2Ec, n1: p1.oversBowled > 0 ? p1.runsConceded / p1.oversBowled : 99, n2: p2.oversBowled > 0 ? p2.runsConceded / p2.oversBowled : 99, lowerWins: true },
    { label: "Sixes / Fours", v1: p1.sixes + " / " + p1.fours, v2: p2.sixes + " / " + p2.fours, n1: p1.sixes * 2 + p1.fours, n2: p2.sixes * 2 + p2.fours },
  ];

  return (
    <div className="il-modal-backdrop" onClick={onClose}>
      <div className="il-modal" style={{ maxWidth: 490 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 900, fontSize: 17, color: "#fbbf24" }}>⚔️ Player Face-Off Comparison</span>
          <button type="button" className="il-btn" style={{ padding: 6 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="il-grid-2" style={{ marginBottom: 12 }}>
          <select className="il-select" value={p1Id} onChange={(e) => setP1Id(e.target.value)}>
            {players.map((p) => (
              <option key={p.id} value={p.id}>#{p.jerseyNo} {p.name}</option>
            ))}
          </select>
          <select className="il-select" value={p2Id} onChange={(e) => setP2Id(e.target.value)}>
            {players.map((p) => (
              <option key={p.id} value={p.id}>#{p.jerseyNo} {p.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10, marginBottom: 14, textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <PlayerAvatar playerId={p1.id} name={p1.name} size={64} rounded borderColor="#38bdf8" />
            <div style={{ fontWeight: 900, fontSize: 13, marginTop: 6 }}>{p1.name.split(" ")[0]}</div>
            <div style={{ fontSize: 10, color: "#7dd3fc" }}>#{p1.jerseyNo} • {p1.role}</div>
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, color: "#fbbf24" }}>VS</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <PlayerAvatar playerId={p2.id} name={p2.name} size={64} rounded borderColor="#fbbf24" />
            <div style={{ fontWeight: 900, fontSize: 13, marginTop: 6 }}>{p2.name.split(" ")[0]}</div>
            <div style={{ fontSize: 10, color: "#fde68a" }}>#{p2.jerseyNo} • {p2.role}</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
          {rows.map((r) => {
            const p1Wins = r.lowerWins ? r.n1 < r.n2 : r.n1 > r.n2;
            const p2Wins = r.lowerWins ? r.n2 < r.n1 : r.n2 > r.n1;
            return (
              <div
                key={r.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  padding: "7px 10px",
                  borderRadius: 10,
                  background: "rgba(2,6,23,0.78)",
                  fontSize: 12,
                }}
              >
                <strong style={{ color: p1Wins ? "#34d399" : "#f8fafc" }}>{r.v1}</strong>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase" }}>{r.label}</span>
                <strong style={{ textAlign: "right", color: p2Wins ? "#34d399" : "#f8fafc" }}>{r.v2}</strong>
              </div>
            );
          })}
        </div>

        <div style={{ padding: 10, borderRadius: 12, background: "rgba(15,29,66,0.75)", border: "1px solid rgba(251,191,36,0.35)", fontSize: 12 }}>
          <div style={{ fontWeight: 900, color: "#fbbf24", fontSize: 11, marginBottom: 5 }}>DIRECT HEAD-TO-HEAD RIVALRY</div>
          {!h2hA && !h2hB ? (
            <div style={{ color: "var(--muted)" }}>No direct balls bowled between these two yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 4 }}>
              {h2hA && (
                <div>
                  <strong>{p1.name.split(" ")[0]}</strong> vs {p2.name.split(" ")[0]}: <strong>{h2hA.runs}({h2hA.balls})</strong> • {h2hA.outs} out(s)
                </div>
              )}
              {h2hB && (
                <div>
                  <strong>{p2.name.split(" ")[0]}</strong> vs {p1.name.split(" ")[0]}: <strong>{h2hB.runs}({h2hB.balls})</strong> • {h2hB.outs} out(s)
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const AUCTION_BIN_ID = "6b09c2631b390e1b559c332a";
const AUCTION_MASTER_KEY = "$2a$10$2HbLekkuq.xC/mHHrqUwXukDXjJHvY8E5rkP4aJE5mKIZfJKV.3ji";
const AUCTION_BIN_URL = "https://api.jsonbin.io/v3/b/" + AUCTION_BIN_ID;
const AUCTION_PURSE_DEFAULT = 30000;

function computeAuctionMvpPoints(finalBid: number): number {
  if (finalBid < 100) return 0;
  if (finalBid <= 400) return 100;
  if (finalBid <= 800) return 200;
  if (finalBid <= 1200) return 300;
  return 400; // 1200 to 10,000+ capped at 400 MVP points
}

function computePlayerOvrRating(p: Player): number {
  const bat = Math.min(45, Math.round(p.runs * 0.25 + p.sixes * 1.5 + p.fours * 0.8));
  const bowl = Math.min(35, Math.round(p.wickets * 5.5));
  const mvp = Math.min(20, Math.round(p.mvpPoints * 0.08));
  return Math.max(58, Math.min(99, 55 + bat + bowl + mvp));
}

interface AuctionBoughtPlayer {
  playerId: string;
  name: string;
  jerseyNo: number;
  role: PlayerRole;
  price: number;
  mvpAwarded: number;
  viaRtm?: boolean;
  isCaptainRetained?: boolean;
}

interface AuctionTeamState {
  id: string;
  name: string;
  captainId: string;
  captainName: string;
  color: string;
  purse: number;
  rtmLeft: number;
  bought: AuctionBoughtPlayer[];
}

interface AuctionQueueItem {
  player: Player;
  setLabel: string;
  basePrice: number;
}

interface AuctionSoldRecord {
  id: string;
  playerId: string;
  playerName: string;
  jerseyNo: number;
  role: PlayerRole;
  teamId: string;
  teamName: string;
  teamColor: string;
  price: number;
  mvpAwarded: number;
  viaRtm?: boolean;
  timestamp: string;
}

interface AuctionStampOverlay {
  status: "SOLD" | "UNSOLD";
  player: Player;
  price: number;
  mvpAwarded: number;
  teamName: string;
  teamColor: string;
  viaRtm?: boolean;
}

interface AuctionCloudState {
  phase: "setup" | "live" | "done";
  teamCount: 2 | 3;
  teamNames: [string, string, string];
  captainIds: [string, string, string];
  captainRetentionCost?: number;
  includeCaptainsInPool?: boolean;
  middlemanAdminId: string;
  startingPurse: number;
  timerMax: number;
  voiceAuctioneer: boolean;
  sfxEnabled: boolean;
  rtmPerTeam: number;
  selectedIds: string[];
  teams: AuctionTeamState[];
  queue: AuctionQueueItem[];
  unsoldPool: AuctionQueueItem[];
  soldHistory: AuctionSoldRecord[];
  currentIdx: number;
  currentBid: number;
  highestTeamId: string;
  passedTeamIds?: string[];
  bidCountOnCurrent?: number;
  bidLog: string[];
  isAccelerated: boolean;
  updatedAtMs: number;
}

async function pullAuctionBinState(): Promise<AuctionCloudState | null> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return null;
  try {
    const res = await fetch(AUCTION_BIN_URL + "/latest", {
      method: "GET",
      headers: {
        "X-Master-Key": AUCTION_MASTER_KEY,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { record?: Partial<AuctionCloudState> | null };
    const rec = json?.record;
    if (!rec || typeof rec !== "object" || !("phase" in rec)) return null;
    return rec as AuctionCloudState;
  } catch {
    return null;
  }
}

async function pushAuctionBinState(payload: AuctionCloudState): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
  try {
    const res = await fetch(AUCTION_BIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": AUCTION_MASTER_KEY,
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function AuctionRoomView({
  players,
  clubName,
  poll,
  currentUser,
  isPermanentAdmin,
  onAwardAuctionMvp,
  onLoadTeamsToMatch,
  onOpenDj,
  onPlayWalkout,
  onOpenPoster,
  onActiveChange,
}: {
  players: Player[];
  clubName: string;
  poll: PollVote[];
  currentUser: Player;
  isPermanentAdmin: boolean;
  onAwardAuctionMvp: (playerId: string, mvpPts: number) => void;
  onLoadTeamsToMatch: (teamAName: string, teamAIds: string[], teamBName: string, teamBIds: string[]) => void;
  onOpenDj: () => void;
  onPlayWalkout: (url: string, label: string) => void;
  onOpenPoster: (cfg: PosterConfig) => void;
  onActiveChange: (active: boolean) => void;
}) {
  const mainPlayers = players.filter((p) => !p.isGM || PERMANENT_ADMIN_IDS.includes(p.id) || p.id.startsWith("p"));

  const [phase, setPhase] = useState<"setup" | "live" | "done">("setup");
  const [teamCount, setTeamCount] = useState<2 | 3>(2);
  const [teamNames, setTeamNames] = useState<[string, string, string]>([
    "Legends XI",
    "Strikers XI",
    "Indore Royals",
  ]);
  const [captainIds, setCaptainIds] = useState<[string, string, string]>(() => [
    mainPlayers[2]?.id || mainPlayers[0]?.id || "p3",
    mainPlayers[3]?.id || mainPlayers[1]?.id || "p4",
    mainPlayers[4]?.id || mainPlayers[0]?.id || "p5",
  ]);
  const [captainRetentionCost, setCaptainRetentionCost] = useState<number>(0);
  const [includeCaptainsInPool, setIncludeCaptainsInPool] = useState<boolean>(false);
  const [middlemanAdminId, setMiddlemanAdminId] = useState<string>(() =>
    PERMANENT_ADMIN_IDS.includes(currentUser.id) ? currentUser.id : "p1"
  );
  const [timerMax, setTimerMax] = useState<number>(15);
  const [voiceAuctioneer, setVoiceAuctioneer] = useState<boolean>(true);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [rtmPerTeam, setRtmPerTeam] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => mainPlayers.map((p) => p.id));

  const [teams, setTeams] = useState<AuctionTeamState[]>([]);
  const [queue, setQueue] = useState<AuctionQueueItem[]>([]);
  const [unsoldPool, setUnsoldPool] = useState<AuctionQueueItem[]>([]);
  const [soldHistory, setSoldHistory] = useState<AuctionSoldRecord[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [highestTeamId, setHighestTeamId] = useState<string>("");
  const [passedTeamIds, setPassedTeamIds] = useState<string[]>([]);
  const [bidCountOnCurrent, setBidCountOnCurrent] = useState<number>(0);
  const [bidLog, setBidLog] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number>(15);
  const [timerPaused, setTimerPaused] = useState<boolean>(false);
  const [autoHammerOnZero, setAutoHammerOnZero] = useState<boolean>(true);
  const [proxyBidMode, setProxyBidMode] = useState<boolean>(false);
  const [stampOverlay, setStampOverlay] = useState<AuctionStampOverlay | null>(null);
  const [rtmPending, setRtmPending] = useState<{
    player: Player;
    winnerTeamId: string;
    price: number;
  } | null>(null);
  const [isAccelerated, setIsAccelerated] = useState<boolean>(false);
  const [binSyncLabel, setBinSyncLabel] = useState<string>("Auction Bin Ready");
  const [customBidInput, setCustomBidInput] = useState<string>("");
  const [bidUndoStack, setBidUndoStack] = useState<{ bid: number; teamId: string }[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [captainStrategyNote, setCaptainStrategyNote] = useState<string>("");
  const [showQueueDrawer, setShowQueueDrawer] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [customBaseDraft, setCustomBaseDraft] = useState<string>("");

  const lastBinUpdatedAtRef = useRef<number>(0);
  const lastLocalPushAtRef = useRef<number>(0);

  const isMiddleman = isPermanentAdmin && currentUser.id === middlemanAdminId;
  const activeCaptainTeam = teams.find((t) => t.captainId === currentUser.id) || null;
  const canPlaceBidAsCaptain = Boolean(activeCaptainTeam);

  useEffect(() => {
    onActiveChange(phase === "live");
    return () => onActiveChange(false);
  }, [phase, onActiveChange]);

  const buildSnapshot = (override?: Partial<AuctionCloudState>): AuctionCloudState => ({
    phase,
    teamCount,
    teamNames,
    captainIds,
    captainRetentionCost,
    includeCaptainsInPool,
    middlemanAdminId,
    startingPurse: AUCTION_PURSE_DEFAULT,
    timerMax,
    voiceAuctioneer,
    sfxEnabled,
    rtmPerTeam,
    selectedIds,
    teams,
    queue,
    unsoldPool,
    soldHistory,
    currentIdx,
    currentBid,
    highestTeamId,
    passedTeamIds,
    bidCountOnCurrent,
    bidLog,
    isAccelerated,
    updatedAtMs: Date.now(),
    ...override,
  });

  const syncToAuctionBin = async (snap: AuctionCloudState) => {
    lastLocalPushAtRef.current = Date.now();
    lastBinUpdatedAtRef.current = snap.updatedAtMs;
    setBinSyncLabel("Syncing Bid...");
    const ok = await pushAuctionBinState(snap);
    if (ok) {
      setBinSyncLabel("Auction Bin Live");
    } else {
      setBinSyncLabel("Offline / Queued");
    }
  };

  const applyRemoteSnapshot = (rec: AuctionCloudState) => {
    if (!rec.updatedAtMs || rec.updatedAtMs <= lastBinUpdatedAtRef.current) return;
    if (Date.now() - lastLocalPushAtRef.current < 1200) return;
    lastBinUpdatedAtRef.current = rec.updatedAtMs;

    setPhase(rec.phase || "setup");
    setTeamCount(rec.teamCount === 3 ? 3 : 2);
    if (Array.isArray(rec.teamNames) && rec.teamNames.length === 3) {
      setTeamNames([
        rec.teamNames[0] || "Legends XI",
        rec.teamNames[1] || "Strikers XI",
        rec.teamNames[2] || "Indore Royals",
      ]);
    }
    if (Array.isArray(rec.captainIds) && rec.captainIds.length === 3) {
      setCaptainIds([rec.captainIds[0], rec.captainIds[1], rec.captainIds[2]]);
    }
    if (typeof rec.captainRetentionCost === "number") setCaptainRetentionCost(rec.captainRetentionCost);
    if (typeof rec.includeCaptainsInPool === "boolean") setIncludeCaptainsInPool(rec.includeCaptainsInPool);
    if (rec.middlemanAdminId) setMiddlemanAdminId(rec.middlemanAdminId);
    if (rec.timerMax) setTimerMax(rec.timerMax);
    if (typeof rec.voiceAuctioneer === "boolean") setVoiceAuctioneer(rec.voiceAuctioneer);
    if (typeof rec.sfxEnabled === "boolean") setSfxEnabled(rec.sfxEnabled);
    if (typeof rec.rtmPerTeam === "number") setRtmPerTeam(rec.rtmPerTeam);
    if (Array.isArray(rec.selectedIds)) setSelectedIds(rec.selectedIds);
    if (Array.isArray(rec.teams)) setTeams(rec.teams);
    if (Array.isArray(rec.queue)) setQueue(rec.queue);
    if (Array.isArray(rec.unsoldPool)) setUnsoldPool(rec.unsoldPool);
    if (Array.isArray(rec.soldHistory)) setSoldHistory(rec.soldHistory);
    if (typeof rec.currentIdx === "number") setCurrentIdx(rec.currentIdx);
    if (typeof rec.currentBid === "number") setCurrentBid(rec.currentBid);
    setHighestTeamId(rec.highestTeamId || "");
    if (Array.isArray(rec.passedTeamIds)) setPassedTeamIds(rec.passedTeamIds);
    if (typeof rec.bidCountOnCurrent === "number") setBidCountOnCurrent(rec.bidCountOnCurrent);
    if (Array.isArray(rec.bidLog)) setBidLog(rec.bidLog);
    setIsAccelerated(Boolean(rec.isAccelerated));
    setSecondsLeft(rec.timerMax || 15);
    setBinSyncLabel("Auction Bin Live");
  };

  useEffect(() => {
    let active = true;
    const pollBin = async () => {
      const rec = await pullAuctionBinState();
      if (active && rec) {
        applyRemoteSnapshot(rec);
      }
    };
    void pollBin();
    const timer = window.setInterval(() => {
      void pollBin();
    }, 2500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const currentItem = queue[currentIdx] || null;
  const highestTeam = teams.find((t) => t.id === highestTeamId) || null;

  const calcBasePrice = (p: Player): number => {
    const val = 100 + Math.min(900, Math.floor(p.mvpPoints / 15) * 100);
    return Math.max(50, val);
  };

  const buildSetsQueue = (pool: Player[]): AuctionQueueItem[] => {
    const sorted = [...pool].sort((a, b) => b.mvpPoints - a.mvpPoints);
    const marqueeCount = Math.min(4, Math.max(2, Math.floor(sorted.length / 3)));
    const marquee = sorted.slice(0, marqueeCount);
    const marqueeIds = new Set(marquee.map((p) => p.id));
    const rest = sorted.filter((p) => !marqueeIds.has(p.id));
    const roleOrder: PlayerRole[] = ["All-Rounder", "Batsman", "Bowler", "Wicket-Keeper"];
    const out: AuctionQueueItem[] = marquee.map((p) => ({
      player: p,
      setLabel: "SET 1 • MARQUEE",
      basePrice: Math.max(200, calcBasePrice(p)),
    }));
    roleOrder.forEach((role, rIdx) => {
      rest
        .filter((p) => p.role === role)
        .forEach((p) => {
          out.push({
            player: p,
            setLabel: "SET " + (rIdx + 2) + " • " + role.toUpperCase() + "S",
            basePrice: calcBasePrice(p),
          });
        });
    });
    return out;
  };

  const announcePlayer = (item: AuctionQueueItem, voiceOn = voiceAuctioneer) => {
    speakAuctionVoice(
      "Middleman calling: Next up in " +
        item.setLabel.replace("•", "") +
        ": " +
        item.player.name +
        ", jersey " +
        item.player.jerseyNo +
        ", " +
        item.player.role +
        ". Base price " +
        item.basePrice +
        " Legend Coins.",
      voiceOn
    );
  };

  const startAuction = () => {
    if (!isPermanentAdmin) return;
    const activeCapIds = captainIds.slice(0, teamCount);
    const activeCapSet = new Set(activeCapIds);
    const pool = mainPlayers.filter(
      (p) => selectedIds.includes(p.id) && (includeCaptainsInPool || !activeCapSet.has(p.id))
    );
    if (pool.length < 1) return;

    const palette = ["#38bdf8", "#fbbf24", "#34d399"];
    const initTeams: AuctionTeamState[] = Array.from({ length: teamCount }).map((_, idx) => {
      const capPl = mainPlayers.find((p) => p.id === captainIds[idx]) || mainPlayers[idx];
      const retainCost = includeCaptainsInPool ? 0 : Math.min(AUCTION_PURSE_DEFAULT, Math.max(0, captainRetentionCost));
      const preAssigned: AuctionBoughtPlayer[] =
        !includeCaptainsInPool && capPl
          ? [
              {
                playerId: capPl.id,
                name: capPl.name,
                jerseyNo: capPl.jerseyNo,
                role: capPl.role,
                price: retainCost,
                mvpAwarded: 0,
                isCaptainRetained: true,
              },
            ]
          : [];
      return {
        id: "t" + (idx + 1),
        name: teamNames[idx].trim() || "Team " + (idx + 1),
        captainId: capPl ? capPl.id : "",
        captainName: capPl ? capPl.name : "Captain",
        color: palette[idx],
        purse: AUCTION_PURSE_DEFAULT - retainCost,
        rtmLeft: rtmPerTeam,
        bought: preAssigned,
      };
    });

    const sets = buildSetsQueue(pool);
    const startLog = [
      "🔨 Mega Auction Started! Purse: 30,000 LC. " +
        (includeCaptainsInPool ? "Captains in pool. " : "Captains pre-assigned to their franchises! ") +
        sets.length +
        " players up for bidding.",
    ];

    setTeams(initTeams);
    setQueue(sets);
    setUnsoldPool([]);
    setSoldHistory([]);
    setCurrentIdx(0);
    setCurrentBid(sets[0].basePrice);
    setHighestTeamId("");
    setPassedTeamIds([]);
    setBidCountOnCurrent(0);
    setBidUndoStack([]);
    setBidLog(startLog);
    setSecondsLeft(timerMax);
    setTimerPaused(false);
    setRtmPending(null);
    setIsAccelerated(false);
    setPhase("live");

    const snap = buildSnapshot({
      phase: "live",
      teams: initTeams,
      queue: sets,
      unsoldPool: [],
      soldHistory: [],
      currentIdx: 0,
      currentBid: sets[0].basePrice,
      highestTeamId: "",
      passedTeamIds: [],
      bidCountOnCurrent: 0,
      bidLog: startLog,
      isAccelerated: false,
    });
    void syncToAuctionBin(snap);

    if (sfxEnabled) playStadiumSfx("trumpet");
    announcePlayer(sets[0]);
  };

  const advanceToNextPlayer = (
    nextIndex: number,
    activeQueue: AuctionQueueItem[],
    nextTeams: AuctionTeamState[],
    nextUnsold: AuctionQueueItem[],
    nextSoldHistory: AuctionSoldRecord[],
    nextLog: string[]
  ) => {
    setBidUndoStack([]);
    setPassedTeamIds([]);
    setBidCountOnCurrent(0);
    if (nextIndex >= activeQueue.length) {
      setPhase("done");
      const doneSnap = buildSnapshot({
        phase: "done",
        teams: nextTeams,
        queue: activeQueue,
        unsoldPool: nextUnsold,
        soldHistory: nextSoldHistory,
        currentIdx: nextIndex,
        passedTeamIds: [],
        bidCountOnCurrent: 0,
        bidLog: nextLog,
      });
      void syncToAuctionBin(doneSnap);
      speakAuctionVoice("Mega Auction round complete!", voiceAuctioneer);
      return;
    }
    const nextItem = activeQueue[nextIndex];
    setCurrentIdx(nextIndex);
    setCurrentBid(nextItem.basePrice);
    setHighestTeamId("");
    setBidLog(nextLog);
    setSecondsLeft(timerMax);
    setTimerPaused(false);
    setRtmPending(null);

    const nextSnap = buildSnapshot({
      phase: "live",
      teams: nextTeams,
      queue: activeQueue,
      unsoldPool: nextUnsold,
      soldHistory: nextSoldHistory,
      currentIdx: nextIndex,
      currentBid: nextItem.basePrice,
      highestTeamId: "",
      passedTeamIds: [],
      bidCountOnCurrent: 0,
      bidLog: nextLog,
    });
    void syncToAuctionBin(nextSnap);
    announcePlayer(nextItem);
  };

  const finalizeSale = (winnerId: string, finalPrice: number, viaRtm = false) => {
    if (!currentItem || !isMiddleman) return;
    const winner = teams.find((t) => t.id === winnerId);
    if (!winner) return;

    const mvpAwarded = computeAuctionMvpPoints(finalPrice);
    const boughtEntry: AuctionBoughtPlayer = {
      playerId: currentItem.player.id,
      name: currentItem.player.name,
      jerseyNo: currentItem.player.jerseyNo,
      role: currentItem.player.role,
      price: finalPrice,
      mvpAwarded,
      viaRtm,
    };

    const updatedTeams = teams.map((t) =>
      t.id === winnerId
        ? {
            ...t,
            purse: Math.max(0, t.purse - finalPrice),
            rtmLeft: viaRtm ? Math.max(0, t.rtmLeft - 1) : t.rtmLeft,
            bought: [...t.bought, boughtEntry],
          }
        : t
    );

    const soldRec: AuctionSoldRecord = {
      id: uid("sold"),
      playerId: currentItem.player.id,
      playerName: currentItem.player.name,
      jerseyNo: currentItem.player.jerseyNo,
      role: currentItem.player.role,
      teamId: winner.id,
      teamName: winner.name,
      teamColor: winner.color,
      price: finalPrice,
      mvpAwarded,
      viaRtm,
      timestamp: nowTime(),
    };
    const nextSoldHistory = [soldRec, ...soldHistory];
    const nextLog = [
      (viaRtm ? "⚡ RTM SOLD! " : "🔨 SOLD! ") +
        currentItem.player.name +
        " → " +
        winner.name +
        " for " +
        finalPrice +
        " LC (+" +
        mvpAwarded +
        " MVP)",
      ...bidLog.slice(0, 24),
    ];

    setTeams(updatedTeams);
    setSoldHistory(nextSoldHistory);
    setBidLog(nextLog);
    setRtmPending(null);
    onAwardAuctionMvp(currentItem.player.id, mvpAwarded);

    if (sfxEnabled) playStadiumSfx("sold");
    speakAuctionVoice(
      (viaRtm ? "Right to Match! " : "Going once, going twice, SOLD! ") +
        currentItem.player.name +
        " sold to " +
        winner.name +
        " for " +
        finalPrice +
        " Legend Coins. " +
        mvpAwarded +
        " MVP points awarded.",
      voiceAuctioneer
    );

    setStampOverlay({
      status: "SOLD",
      player: currentItem.player,
      price: finalPrice,
      mvpAwarded,
      teamName: winner.name,
      teamColor: winner.color,
      viaRtm,
    });

    const nextIdx = currentIdx + 1;
    window.setTimeout(() => {
      setStampOverlay(null);
      advanceToNextPlayer(nextIdx, queue, updatedTeams, unsoldPool, nextSoldHistory, nextLog);
    }, 2400);
  };

  const markUnsold = () => {
    if (!currentItem || !isMiddleman) return;
    const nextUnsold = [
      ...unsoldPool.filter((u) => u.player.id !== currentItem.player.id),
      {
        player: currentItem.player,
        setLabel: "UNSOLD • RE-BID POOL",
        basePrice: Math.max(50, Math.floor(currentItem.basePrice / 2)),
      },
    ];
    const nextLog = ["❌ UNSOLD: " + currentItem.player.name + " (Added to Unsold Re-Bid Pool)", ...bidLog.slice(0, 24)];
    setUnsoldPool(nextUnsold);
    setBidLog(nextLog);
    setRtmPending(null);

    if (sfxEnabled) playStadiumSfx("unsold");
    speakAuctionVoice(currentItem.player.name + " goes unsold.", voiceAuctioneer);

    setStampOverlay({
      status: "UNSOLD",
      player: currentItem.player,
      price: currentItem.basePrice,
      mvpAwarded: 0,
      teamName: "UNSOLD POOL",
      teamColor: "#fb7185",
    });

    const nextIdx = currentIdx + 1;
    window.setTimeout(() => {
      setStampOverlay(null);
      advanceToNextPlayer(nextIdx, queue, teams, nextUnsold, soldHistory, nextLog);
    }, 1700);
  };

  const resetCurrentPlayerBid = () => {
    if (!currentItem || !isMiddleman) return;
    const nextLog = [
      "🔄 RESET BID: " + currentItem.player.name + " reset to base price " + currentItem.basePrice + " LC",
      ...bidLog.slice(0, 24),
    ];
    setCurrentBid(currentItem.basePrice);
    setHighestTeamId("");
    setPassedTeamIds([]);
    setBidCountOnCurrent(0);
    setBidUndoStack([]);
    setSecondsLeft(timerMax);
    setTimerPaused(false);
    setRtmPending(null);
    setBidLog(nextLog);
    void syncToAuctionBin(
      buildSnapshot({
        currentBid: currentItem.basePrice,
        highestTeamId: "",
        passedTeamIds: [],
        bidCountOnCurrent: 0,
        bidLog: nextLog,
      })
    );
    if (sfxEnabled) playStadiumSfx("tick");
    speakAuctionVoice("Bid reset! Opening again at " + currentItem.basePrice + " Legend Coins.", voiceAuctioneer);
  };

  const updateCurrentBasePrice = (newBase: number) => {
    if (!currentItem || !isMiddleman || highestTeamId !== "") return;
    const clamped = Math.max(25, Math.min(10000, newBase));
    const nextQueue = queue.map((item, idx) =>
      idx === currentIdx ? { ...item, basePrice: clamped } : item
    );
    const nextLog = ["💰 Base price for " + currentItem.player.name.split(" ")[0] + " set to " + clamped + " LC", ...bidLog.slice(0, 24)];
    setQueue(nextQueue);
    setCurrentBid(clamped);
    setBidLog(nextLog);
    void syncToAuctionBin(
      buildSnapshot({
        queue: nextQueue,
        currentBid: clamped,
        bidLog: nextLog,
      })
    );
  };

  const bringUnsoldBackNow = (playerId: string, priceMode: "half" | "full" | "50") => {
    if (!isMiddleman) return;
    const found = unsoldPool.find((u) => u.player.id === playerId);
    if (!found) return;
    const reBase =
      priceMode === "50"
        ? 50
        : priceMode === "full"
        ? calcBasePrice(found.player)
        : Math.max(50, Math.floor(calcBasePrice(found.player) / 2));
    const revived: AuctionQueueItem = {
      player: found.player,
      setLabel: "⚡ UNSOLD RE-BID",
      basePrice: reBase,
    };
    const nextUnsold = unsoldPool.filter((u) => u.player.id !== playerId);
    const nextQueue =
      phase === "done"
        ? [revived]
        : [...queue.slice(0, currentIdx), revived, ...queue.slice(currentIdx)];
    const nextIdx = phase === "done" ? 0 : currentIdx;
    const nextLog = [
      "🔁 RE-AUCTION: " + found.player.name + " brought back from Unsold Pool @ " + reBase + " LC!",
      ...bidLog.slice(0, 24),
    ];

    setUnsoldPool(nextUnsold);
    setQueue(nextQueue);
    setCurrentIdx(nextIdx);
    setCurrentBid(reBase);
    setHighestTeamId("");
    setPassedTeamIds([]);
    setBidCountOnCurrent(0);
    setBidUndoStack([]);
    setSecondsLeft(timerMax);
    setTimerPaused(false);
    setRtmPending(null);
    setPhase("live");
    setBidLog(nextLog);

    void syncToAuctionBin(
      buildSnapshot({
        phase: "live",
        queue: nextQueue,
        unsoldPool: nextUnsold,
        currentIdx: nextIdx,
        currentBid: reBase,
        highestTeamId: "",
        passedTeamIds: [],
        bidCountOnCurrent: 0,
        bidLog: nextLog,
      })
    );
    if (sfxEnabled) playStadiumSfx("airhorn");
    announcePlayer(revived);
  };

  const reverseSoldPlayer = (soldId: string) => {
    if (!isMiddleman) return;
    const rec = soldHistory.find((s) => s.id === soldId);
    if (!rec) return;
    const plObj = mainPlayers.find((p) => p.id === rec.playerId);
    if (!plObj) return;

    const updatedTeams = teams.map((t) =>
      t.id === rec.teamId
        ? {
            ...t,
            purse: t.purse + rec.price,
            rtmLeft: rec.viaRtm ? t.rtmLeft + 1 : t.rtmLeft,
            bought: t.bought.filter((b) => b.playerId !== rec.playerId),
          }
        : t
    );
    const nextSoldHistory = soldHistory.filter((s) => s.id !== soldId);
    const nextUnsold = [
      {
        player: plObj,
        setLabel: "REVERSED SALE • RE-BID",
        basePrice: calcBasePrice(plObj),
      },
      ...unsoldPool.filter((u) => u.player.id !== rec.playerId),
    ];
    const nextLog = [
      "↩️ SALE REVERSED: " + rec.playerName + " refunded " + rec.price + " LC to " + rec.teamName + " & moved to Unsold Re-Bid Pool",
      ...bidLog.slice(0, 24),
    ];

    setTeams(updatedTeams);
    setSoldHistory(nextSoldHistory);
    setUnsoldPool(nextUnsold);
    setBidLog(nextLog);
    if (rec.mvpAwarded > 0) {
      onAwardAuctionMvp(rec.playerId, -rec.mvpAwarded);
    }
    void syncToAuctionBin(
      buildSnapshot({
        teams: updatedTeams,
        soldHistory: nextSoldHistory,
        unsoldPool: nextUnsold,
        bidLog: nextLog,
      })
    );
  };

  const jumpToQueuedPlayer = (targetQueueIndex: number) => {
    if (!isMiddleman || targetQueueIndex <= currentIdx || targetQueueIndex >= queue.length) return;
    const picked = queue[targetQueueIndex];
    const remaining = queue.filter((_, i) => i !== targetQueueIndex);
    const nextQueue = [...remaining.slice(0, currentIdx), picked, ...remaining.slice(currentIdx)];
    const nextLog = ["⏭️ Middleman jumped straight to " + picked.player.name + "!", ...bidLog.slice(0, 24)];
    setQueue(nextQueue);
    setCurrentBid(picked.basePrice);
    setHighestTeamId("");
    setPassedTeamIds([]);
    setBidCountOnCurrent(0);
    setBidUndoStack([]);
    setSecondsLeft(timerMax);
    setTimerPaused(false);
    setBidLog(nextLog);
    void syncToAuctionBin(
      buildSnapshot({
        queue: nextQueue,
        currentBid: picked.basePrice,
        highestTeamId: "",
        passedTeamIds: [],
        bidCountOnCurrent: 0,
        bidLog: nextLog,
      })
    );
    announcePlayer(picked);
  };

  const shuffleUpcomingQueue = () => {
    if (!isMiddleman || currentIdx + 1 >= queue.length) return;
    const head = queue.slice(0, currentIdx + 1);
    const tail = [...queue.slice(currentIdx + 1)];
    for (let i = tail.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = tail[i];
      tail[i] = tail[j];
      tail[j] = tmp;
    }
    const nextQueue = [...head, ...tail];
    const nextLog = ["🔀 Upcoming auction order shuffled!", ...bidLog.slice(0, 24)];
    setQueue(nextQueue);
    setBidLog(nextLog);
    void syncToAuctionBin(buildSnapshot({ queue: nextQueue, bidLog: nextLog }));
  };

  const adjustTeamPurseOrRtm = (teamId: string, purseDelta: number, rtmDelta: number) => {
    if (!isMiddleman) return;
    const nextTeams = teams.map((t) =>
      t.id === teamId
        ? { ...t, purse: Math.max(0, t.purse + purseDelta), rtmLeft: Math.max(0, t.rtmLeft + rtmDelta) }
        : t
    );
    setTeams(nextTeams);
    void syncToAuctionBin(buildSnapshot({ teams: nextTeams }));
  };

  const toggleCaptainPass = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    if (team.captainId !== currentUser.id && !(isMiddleman && proxyBidMode)) return;
    const nextPassed = passedTeamIds.includes(teamId)
      ? passedTeamIds.filter((id) => id !== teamId)
      : [...passedTeamIds, teamId];
    const nextLog = [
      (passedTeamIds.includes(teamId) ? "🙋 " : "✋ ") +
        team.name +
        (passedTeamIds.includes(teamId) ? " re-entered bidding!" : " PASSED on " + (currentItem?.player.name.split(" ")[0] || "player")),
      ...bidLog.slice(0, 24),
    ];
    setPassedTeamIds(nextPassed);
    setBidLog(nextLog);
    void syncToAuctionBin(buildSnapshot({ passedTeamIds: nextPassed, bidLog: nextLog }));
  };

  const handleMiddlemanSoldClick = () => {
    if (!currentItem || stampOverlay || !isMiddleman) return;
    if (!highestTeamId) {
      markUnsold();
      return;
    }
    const eligibleRtmTeams = teams.filter(
      (t) => t.id !== highestTeamId && t.rtmLeft > 0 && t.purse >= currentBid
    );
    if (eligibleRtmTeams.length > 0 && !rtmPending) {
      setTimerPaused(true);
      if (sfxEnabled) playStadiumSfx("gavel");
      setRtmPending({
        player: currentItem.player,
        winnerTeamId: highestTeamId,
        price: currentBid,
      });
      speakAuctionVoice(
        "Middleman final call! " +
          (highestTeam?.name || "Team") +
          " leads at " +
          currentBid +
          ". Any Right to Match?",
        voiceAuctioneer
      );
      return;
    }
    finalizeSale(highestTeamId, currentBid, false);
  };

  const placeBid = (teamId: string, increment: number, allIn = false) => {
    if (!currentItem || stampOverlay || rtmPending) return;
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    if (team.captainId !== currentUser.id && !(isMiddleman && proxyBidMode)) return;

    const nextAmount = allIn
      ? team.purse
      : highestTeamId === ""
      ? Math.max(currentItem.basePrice, increment > 0 ? currentItem.basePrice + increment : currentItem.basePrice)
      : currentBid + increment;

    if (nextAmount > team.purse || (highestTeamId !== "" && nextAmount <= currentBid)) return;

    const nextCount = bidCountOnCurrent + 1;
    const nextPassed = passedTeamIds.filter((id) => id !== teamId);
    const nextLog = [
      (nextCount >= 5 ? "🔥 BIDDING WAR! " : "🏏 ") +
        team.name +
        " (Cap: " +
        team.captainName.split(" ")[0] +
        ") bids " +
        nextAmount +
        " LC for " +
        currentItem.player.name.split(" ")[0],
      ...bidLog.slice(0, 24),
    ];

    setBidUndoStack((prev) => [{ bid: currentBid, teamId: highestTeamId }, ...prev.slice(0, 9)]);
    setCurrentBid(nextAmount);
    setHighestTeamId(teamId);
    setPassedTeamIds(nextPassed);
    setBidCountOnCurrent(nextCount);
    setBidLog(nextLog);
    setSecondsLeft(timerMax);
    setTimerPaused(false);

    const snap = buildSnapshot({
      currentBid: nextAmount,
      highestTeamId: teamId,
      passedTeamIds: nextPassed,
      bidCountOnCurrent: nextCount,
      bidLog: nextLog,
    });
    void syncToAuctionBin(snap);

    if (sfxEnabled) playStadiumSfx(nextCount >= 5 ? "airhorn" : "bid");
    speakAuctionVoice(
      team.name + " bids " + nextAmount + " Legend Coins for " + currentItem.player.name,
      voiceAuctioneer
    );
  };

  useEffect(() => {
    if (phase !== "live" || timerPaused || stampOverlay || rtmPending || !currentItem) return;
    if (secondsLeft <= 0) {
      if (isMiddleman && autoHammerOnZero) {
        handleMiddlemanSoldClick();
      } else {
        setTimerPaused(true);
      }
      return;
    }
    const t = window.setTimeout(() => {
      const next = secondsLeft - 1;
      setSecondsLeft(next);
      if (next <= 3 && next > 0) {
        if (sfxEnabled) playStadiumSfx("tick");
        if (next === 3 && highestTeamId && isMiddleman) {
          speakAuctionVoice("Going once!", voiceAuctioneer);
        } else if (next === 1 && highestTeamId && isMiddleman) {
          speakAuctionVoice("Going twice!", voiceAuctioneer);
        }
      }
    }, 1000);
    return () => window.clearTimeout(t);
  }, [phase, timerPaused, stampOverlay, rtmPending, secondsLeft, currentItem, highestTeamId, isMiddleman, autoHammerOnZero]);

  const startAcceleratedRound = () => {
    if (unsoldPool.length === 0 || !isMiddleman) return;
    const nextQ = [...unsoldPool];
    const nextLog = ["⚡ Accelerated Round Started (" + nextQ.length + " unsold players at 50% base)!", ...bidLog.slice(0, 24)];
    setUnsoldPool([]);
    setQueue(nextQ);
    setCurrentIdx(0);
    setCurrentBid(nextQ[0].basePrice);
    setHighestTeamId("");
    setPassedTeamIds([]);
    setBidCountOnCurrent(0);
    setBidUndoStack([]);
    setBidLog(nextLog);
    setSecondsLeft(Math.min(12, timerMax));
    setTimerPaused(false);
    setIsAccelerated(true);
    setPhase("live");

    const snap = buildSnapshot({
      phase: "live",
      queue: nextQ,
      unsoldPool: [],
      currentIdx: 0,
      currentBid: nextQ[0].basePrice,
      highestTeamId: "",
      passedTeamIds: [],
      bidCountOnCurrent: 0,
      bidLog: nextLog,
      isAccelerated: true,
    });
    void syncToAuctionBin(snap);

    if (sfxEnabled) playStadiumSfx("airhorn");
    announcePlayer(nextQ[0]);
  };

  const resetAuctionBinAndState = () => {
    if (!isPermanentAdmin) return;
    setPhase("setup");
    setStampOverlay(null);
    setRtmPending(null);
    setTeams([]);
    setQueue([]);
    setUnsoldPool([]);
    setSoldHistory([]);
    setCurrentIdx(0);
    setCurrentBid(0);
    setHighestTeamId("");
    setPassedTeamIds([]);
    setBidCountOnCurrent(0);
    setBidUndoStack([]);
    setBidLog([]);
    setShowConfirmReset(false);
    const resetSnap = buildSnapshot({
      phase: "setup",
      teams: [],
      queue: [],
      unsoldPool: [],
      soldHistory: [],
      currentIdx: 0,
      currentBid: 0,
      highestTeamId: "",
      passedTeamIds: [],
      bidCountOnCurrent: 0,
      bidLog: [],
      isAccelerated: false,
    });
    void syncToAuctionBin(resetSnap);
  };

  const exportAuctionCsv = () => {
    const header = "Player,Jersey,Role,Franchise,Price_LC,MVP_Awarded,Method,Time\n";
    const rows = soldHistory
      .map((s) =>
        [
          '"' + s.playerName + '"',
          s.jerseyNo,
          s.role,
          '"' + s.teamName + '"',
          s.price,
          s.mvpAwarded,
          s.viaRtm ? "RTM" : "BID",
          s.timestamp,
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "indore-legends-auction-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const remainingPlayersCount = Math.max(0, queue.length - currentIdx - 1);
  const middlemanPlayer = mainPlayers.find((p) => p.id === middlemanAdminId) || mainPlayers[0];

  return (
    <div>
      {/* AUCTION BROADCAST BANNER */}
      <div
        className="il-card il-hero-banner"
        style={{
          borderColor: "rgba(251,191,36,0.75)",
          background:
            "linear-gradient(135deg, rgba(180,83,9,0.36), rgba(7,16,38,0.96) 52%, rgba(29,78,216,0.34))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span className="il-pill" style={{ background: "rgba(251,191,36,0.24)", color: "#fde68a", border: "1px solid rgba(251,191,36,0.6)" }}>
                <GavelSvg size={12} /> {clubName} MEGA AUCTION PRO
              </span>
              <span className="il-pill" style={{ background: "rgba(52,211,153,0.2)", color: "#6ee7b7" }}>
                {binSyncLabel}
              </span>
              <span className="il-pill" style={{ background: "rgba(167,139,250,0.2)", color: "#ddd6fe" }}>
                Middleman: {middlemanPlayer?.name.split(" ")[0] || "Admin"}
              </span>
              {unsoldPool.length > 0 && (
                <span className="il-pill" style={{ background: "rgba(244,63,94,0.25)", color: "#fda4af" }}>
                  Unsold Pool: {unsoldPool.length}
                </span>
              )}
            </div>
            <h2 style={{ margin: "6px 0 2px 0", fontSize: 22, fontWeight: 900 }}>
              IPL Mega Auction • 30,000 LC Purse
            </h2>
            <div style={{ fontSize: 12, color: "#cbd5e1" }}>
              {isMiddleman
                ? "Middleman Command Active: Control SOLD, UNSOLD Re-Bid, Reset Bid & Voice Calls."
                : canPlaceBidAsCaptain
                ? "👑 You are Captain of " + activeCaptainTeam?.name + " — Bid, Pass & Track Watchlist!"
                : "Viewer mode: Only Franchise Captains bid; Permanent Admin Middleman controls SOLD."}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              className={"il-btn " + (voiceAuctioneer ? "il-btn-emerald" : "")}
              style={{ padding: "6px 9px", fontSize: 11 }}
              onClick={() => setVoiceAuctioneer((v) => !v)}
            >
              {voiceAuctioneer ? <Volume2 size={14} /> : <VolumeX size={14} />} Voice
            </button>
            <button
              type="button"
              className={"il-btn " + (sfxEnabled ? "il-btn-gold" : "")}
              style={{ padding: "6px 9px", fontSize: 11 }}
              onClick={() => setSfxEnabled((v) => !v)}
            >
              SFX {sfxEnabled ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              className="il-btn"
              style={{ padding: "6px 9px", fontSize: 11 }}
              onClick={() => setShowRulesModal((v) => !v)}
            >
              📜 Rules
            </button>
            <button
              type="button"
              className="il-btn"
              style={{ padding: "6px 9px", fontSize: 11 }}
              onClick={() => {
                setBinSyncLabel("Refreshing...");
                void pullAuctionBinState().then((rec) => {
                  if (rec) {
                    lastBinUpdatedAtRef.current = 0;
                    applyRemoteSnapshot(rec);
                  } else {
                    setBinSyncLabel("Auction Bin Ready");
                  }
                });
              }}
            >
              <RotateCcw size={12} /> Sync Bin
            </button>
            <button
              type="button"
              className="il-btn il-btn-purple"
              style={{ padding: "6px 9px", fontSize: 11 }}
              onClick={onOpenDj}
            >
              <MusicSvg size={13} /> DJ
            </button>
            {phase !== "setup" && isPermanentAdmin && (
              <button
                type="button"
                className="il-btn il-btn-danger"
                style={{ padding: "6px 9px", fontSize: 11 }}
                onClick={() => setShowConfirmReset(true)}
              >
                <RotateCcw size={13} /> Reset Bin
              </button>
            )}
          </div>
        </div>
      </div>

      {showRulesModal && (
        <div className="il-card" style={{ borderColor: "rgba(56,189,248,0.5)", fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <strong style={{ color: "#7dd3fc" }}>📜 Official Mega Auction Rules</strong>
            <button type="button" className="il-btn" style={{ padding: "2px 6px", fontSize: 10 }} onClick={() => setShowRulesModal(false)}>
              Close
            </button>
          </div>
          <div style={{ display: "grid", gap: 4, color: "#cbd5e1" }}>
            <div>• Starting Purse: <strong>30,000 Legend Coins</strong> per franchise.</div>
            <div>• Captains are selected by <strong>Permanent Admins</strong> &amp; pre-assigned to their franchise by default.</div>
            <div>• Only designated <strong>Captains</strong> can place bids (or Middleman via Proxy Mode if a phone dies).</div>
            <div>• <strong>Middleman</strong> speaks calls, resets bids, re-auctions unsold players, and locks SOLD/UNSOLD.</div>
            <div>• MVP Slabs: &lt;100 LC = 0 • 100-400 = 100 • 400-800 = 200 • 800-1200 = 300 • 1200-10,000 = 400 MVP.</div>
          </div>
        </div>
      )}

      {/* MVP SLABS REFERENCE STRIP */}
      <div className="il-card" style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: "var(--gold)", letterSpacing: "0.08em", marginBottom: 6 }}>
          AUCTION MVP POINTS SLABS (AWARDED ON SOLD)
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 11 }}>
          <span className="il-pill" style={{ background: "rgba(148,163,184,0.18)", color: "#cbd5e1" }}>&lt;100 LC: 0 MVP</span>
          <span className="il-pill" style={{ background: "rgba(56,189,248,0.18)", color: "#7dd3fc" }}>100–400 LC: 100 MVP</span>
          <span className="il-pill" style={{ background: "rgba(52,211,153,0.18)", color: "#6ee7b7" }}>400–800 LC: 200 MVP</span>
          <span className="il-pill" style={{ background: "rgba(167,139,250,0.22)", color: "#ddd6fe" }}>800–1200 LC: 300 MVP</span>
          <span className="il-pill" style={{ background: "rgba(251,191,36,0.24)", color: "#fde68a" }}>1200–10,000 LC: 400 MVP</span>
        </div>
      </div>

      {/* SETUP PHASE (PERMANENT ADMIN SELECTS CAPTAINS, RETENTION, MIDDLEMAN & MAIN PLAYERS) */}
      {phase === "setup" && (
        <div className="il-card">
          <div style={{ fontWeight: 900, fontSize: 16, color: "#fbbf24", marginBottom: 10 }}>
            Auction Setup • Captains Showcase, Middleman &amp; Pool
          </div>

          {isPermanentAdmin && (
            <div style={{ marginBottom: 12, padding: 9, borderRadius: 12, background: "rgba(2,6,23,0.72)", border: "1px solid rgba(56,189,248,0.3)" }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: "#7dd3fc", marginBottom: 6 }}>
                ⚡ QUICK AUCTION FORMAT TEMPLATES (1-TAP APPLY)
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="il-btn"
                  style={{ padding: "4px 8px", fontSize: 10 }}
                  onClick={() => {
                    setTeamCount(2);
                    setTimerMax(15);
                    setRtmPerTeam(1);
                    setIncludeCaptainsInPool(false);
                    setCaptainRetentionCost(0);
                    setTeamNames(["Legends XI", "Strikers XI", "Indore Royals"]);
                  }}
                >
                  🏆 Classic 2-Team 30K
                </button>
                <button
                  type="button"
                  className="il-btn"
                  style={{ padding: "4px 8px", fontSize: 10 }}
                  onClick={() => {
                    setTeamCount(3);
                    setTimerMax(15);
                    setRtmPerTeam(1);
                    setIncludeCaptainsInPool(false);
                    setCaptainRetentionCost(0);
                    setTeamNames(["Legends XI", "Strikers XI", "Indore Royals"]);
                  }}
                >
                  🔥 3-Team Turf Cup
                </button>
                <button
                  type="button"
                  className="il-btn"
                  style={{ padding: "4px 8px", fontSize: 10 }}
                  onClick={() => {
                    setTeamCount(2);
                    setTimerMax(10);
                    setRtmPerTeam(2);
                    setIncludeCaptainsInPool(false);
                    setCaptainRetentionCost(0);
                    setTeamNames(["Blitz Kings", "Thunder XI", "Indore Royals"]);
                  }}
                >
                  ⚡ Express Blitz (10s / 2 RTM)
                </button>
                <button
                  type="button"
                  className="il-btn"
                  style={{ padding: "4px 8px", fontSize: 10 }}
                  onClick={() => {
                    setTeamCount(2);
                    setTimerMax(20);
                    setRtmPerTeam(2);
                    setIncludeCaptainsInPool(false);
                    setCaptainRetentionCost(3000);
                    setTeamNames(["Royal Titans", "Malwa Warriors", "Indore Royals"]);
                  }}
                >
                  💎 High-Roller (3K Cap Fee)
                </button>
                <button
                  type="button"
                  className="il-btn"
                  style={{ padding: "4px 8px", fontSize: 10 }}
                  onClick={() => {
                    setTeamCount(2);
                    setTimerMax(15);
                    setRtmPerTeam(1);
                    setIncludeCaptainsInPool(true);
                    setCaptainRetentionCost(0);
                  }}
                >
                  🎲 Open Captain Pool
                </button>
              </div>
            </div>
          )}

          <div className="il-grid-3 il-resp-1" style={{ marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>FRANCHISES</label>
              <select
                className="il-select"
                disabled={!isPermanentAdmin}
                value={teamCount}
                onChange={(e) => setTeamCount(Number(e.target.value) as 2 | 3)}
              >
                <option value={2}>2 Teams (Match-Ready)</option>
                <option value={3}>3 Teams (Turf Cup)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>MIDDLEMAN (PERMANENT ADMIN)</label>
              <select
                className="il-select"
                disabled={!isPermanentAdmin}
                value={middlemanAdminId}
                onChange={(e) => setMiddlemanAdminId(e.target.value)}
              >
                {mainPlayers
                  .filter((p) => PERMANENT_ADMIN_IDS.includes(p.id) || p.isAdmin)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.jerseyNo} {p.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>PURSE / CLOCK / RTM</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input className="il-input" readOnly value="30,000 LC" style={{ fontWeight: 900, color: "#fbbf24" }} />
                <select
                  className="il-select"
                  disabled={!isPermanentAdmin}
                  value={timerMax}
                  onChange={(e) => setTimerMax(Number(e.target.value))}
                >
                  <option value={10}>10s</option>
                  <option value={15}>15s</option>
                  <option value={20}>20s</option>
                </select>
                <select
                  className="il-select"
                  disabled={!isPermanentAdmin}
                  value={rtmPerTeam}
                  onChange={(e) => setRtmPerTeam(Number(e.target.value))}
                >
                  <option value={0}>0 RTM</option>
                  <option value={1}>1 RTM</option>
                  <option value={2}>2 RTM</option>
                </select>
              </div>
            </div>
          </div>

          {/* CAPTAIN PRE-ASSIGNMENT & RETENTION OPTIONS */}
          <div style={{ padding: 10, borderRadius: 12, background: "rgba(15,29,66,0.7)", border: "1px solid rgba(251,191,36,0.35)", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 800, color: "#fde68a", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  disabled={!isPermanentAdmin}
                  checked={!includeCaptainsInPool}
                  onChange={(e) => setIncludeCaptainsInPool(!e.target.checked)}
                />
                👑 Auto Pre-Assign Captains to Own Franchise (Exclude from Bidding Pool)
              </label>
              {!includeCaptainsInPool && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Captain Retention Fee:</span>
                  <select
                    className="il-select"
                    disabled={!isPermanentAdmin}
                    style={{ width: "auto", padding: "4px 8px", fontSize: 11 }}
                    value={captainRetentionCost}
                    onChange={(e) => setCaptainRetentionCost(Number(e.target.value))}
                  >
                    <option value={0}>Free (0 LC)</option>
                    <option value={1000}>1,000 LC</option>
                    <option value={2000}>2,000 LC</option>
                    <option value={3000}>3,000 LC</option>
                    <option value={5000}>5,000 LC</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* CAPTAIN SHOWCASE CARDS */}
          <div className="il-grid-3 il-resp-1" style={{ marginBottom: 12 }}>
            {Array.from({ length: teamCount }).map((_, idx) => {
              const capObj = mainPlayers.find((p) => p.id === captainIds[idx]);
              return (
                <div key={idx} style={{ background: "rgba(2,6,23,0.72)", padding: 11, borderRadius: 14, border: "1px solid rgba(251,191,36,0.4)" }}>
                  <label style={{ fontSize: 10, color: "var(--gold)", fontWeight: 800 }}>
                    FRANCHISE {idx + 1} NAME
                  </label>
                  <input
                    className="il-input"
                    disabled={!isPermanentAdmin}
                    style={{ marginTop: 4, marginBottom: 8 }}
                    value={teamNames[idx]}
                    onChange={(e) => {
                      const next: [string, string, string] = [...teamNames] as [string, string, string];
                      next[idx] = e.target.value;
                      setTeamNames(next);
                    }}
                  />
                  <label style={{ fontSize: 10, color: "#7dd3fc", fontWeight: 800 }}>
                    👑 FRANCHISE CAPTAIN
                  </label>
                  <select
                    className="il-select"
                    disabled={!isPermanentAdmin}
                    style={{ marginTop: 4, marginBottom: 8 }}
                    value={captainIds[idx]}
                    onChange={(e) => {
                      const next: [string, string, string] = [...captainIds] as [string, string, string];
                      next[idx] = e.target.value;
                      setCaptainIds(next);
                    }}
                  >
                    {mainPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.jerseyNo} {p.name} ({p.role})
                      </option>
                    ))}
                  </select>
                  {capObj && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 10, background: "rgba(15,29,66,0.75)" }}>
                      <PlayerAvatar playerId={capObj.id} name={capObj.name} size={36} rounded borderColor="#fbbf24" />
                      <div style={{ fontSize: 11 }}>
                        <strong style={{ color: "#fde68a" }}>OVR {computePlayerOvrRating(capObj)}</strong> • {capObj.role}
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>
                          {capObj.runs} R • {capObj.wickets} W • {capObj.mvpPoints} MVP
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                Main Players Auction Pool ({selectedIds.filter((id) => includeCaptainsInPool || !captainIds.slice(0, teamCount).includes(id)).length} will enter bidding)
              </span>
              {isPermanentAdmin && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    className="il-btn"
                    style={{ padding: "4px 8px", fontSize: 11 }}
                    onClick={() => setSelectedIds(mainPlayers.map((p) => p.id))}
                  >
                    Select All Main
                  </button>
                  <button
                    type="button"
                    className="il-btn il-btn-emerald"
                    style={{ padding: "4px 8px", fontSize: 11 }}
                    onClick={() => {
                      const inIds = poll.filter((v) => v.choice === "IN").map((v) => v.playerId);
                      if (inIds.length >= 2) setSelectedIds(inIds);
                    }}
                  >
                    Pick Poll IN
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {mainPlayers.map((p) => {
                const isSelectedCap = !includeCaptainsInPool && captainIds.slice(0, teamCount).includes(p.id);
                const on = selectedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={!isPermanentAdmin || isSelectedCap}
                    className={"il-btn " + (isSelectedCap ? "il-btn-gold" : on ? "il-btn-primary" : "")}
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    onClick={() =>
                      setSelectedIds((prev) =>
                        prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                      )
                    }
                  >
                    {isSelectedCap ? "👑 " : ""}#{p.jerseyNo} {p.name.split(" ")[0]} ({isSelectedCap ? "CAPTAIN" : calcBasePrice(p) + " LC"})
                  </button>
                );
              })}
            </div>
          </div>

          {isPermanentAdmin ? (
            <button
              type="button"
              disabled={selectedIds.length < 2}
              className="il-btn il-btn-gold"
              style={{ width: "100%", padding: 14, fontSize: 16 }}
              onClick={startAuction}
            >
              <GavelSvg size={18} /> START LIVE MEGA AUCTION (30,000 LC PURSE)
            </button>
          ) : (
            <div style={{ padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.75)", textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
              Waiting for Permanent Admin to finalize Captains, Middleman, and launch the Mega Auction.
            </div>
          )}
        </div>
      )}

      {/* LIVE AUCTION STAGE */}
      {phase === "live" && currentItem && (
        <div>
          <div
            className="il-card il-hero-banner"
            style={{
              border: "2px solid rgba(251,191,36,0.75)",
              boxShadow: "0 18px 46px rgba(245,158,11,0.22)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span className="il-pill" style={{ background: "rgba(251,191,36,0.24)", color: "#fbbf24" }}>
                  {currentItem.setLabel}
                </span>
                <span className="il-pill" style={{ background: "rgba(56,189,248,0.2)", color: "#7dd3fc" }}>
                  Player {currentIdx + 1} / {queue.length}
                </span>
                {bidCountOnCurrent >= 4 && (
                  <span className="il-pill il-onfire">🔥 BIDDING WAR ({bidCountOnCurrent} BIDS)</span>
                )}
                {watchlistIds.includes(currentItem.player.id) && (
                  <span className="il-pill" style={{ background: "rgba(167,139,250,0.25)", color: "#ddd6fe" }}>
                    ⭐ ON YOUR WATCHLIST
                  </span>
                )}
                {isAccelerated && (
                  <span className="il-pill" style={{ background: "rgba(225,29,72,0.26)", color: "#fda4af" }}>
                    50% ACCELERATED
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span
                  style={{
                    minWidth: 52,
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: 12,
                    fontWeight: 900,
                    fontSize: 18,
                    background: secondsLeft <= 3 ? "#e11d48" : "rgba(2,6,23,0.88)",
                    border: "2px solid " + (secondsLeft <= 3 ? "#fda4af" : "#fbbf24"),
                    color: "#ffffff",
                  }}
                >
                  {secondsLeft}s
                </span>
                {isMiddleman && (
                  <>
                    <button type="button" className="il-btn" style={{ padding: "6px 8px", fontSize: 10 }} onClick={() => setSecondsLeft((s) => s + 5)}>
                      +5s
                    </button>
                    <button type="button" className="il-btn" style={{ padding: "6px 8px", fontSize: 10 }} onClick={() => setTimerPaused((p) => !p)}>
                      {timerPaused ? "Resume" : "Pause"}
                    </button>
                    <button
                      type="button"
                      className={"il-btn " + (autoHammerOnZero ? "il-btn-emerald" : "")}
                      style={{ padding: "6px 8px", fontSize: 10 }}
                      onClick={() => setAutoHammerOnZero((v) => !v)}
                      title="Toggle automatic SOLD/UNSOLD when timer hits 0"
                    >
                      Auto-Hammer: {autoHammerOnZero ? "ON" : "OFF"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="il-grid-2 il-resp-1" style={{ alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: "2px solid rgba(251,191,36,0.65)" }}>
                <PlayerPortraitBanner playerId={currentItem.player.id} name={currentItem.player.name} height={240} />
                <div className="il-fut-fade" />
                <div style={{ position: "absolute", top: 10, left: 12, fontSize: 30, fontWeight: 900, color: "#fbbf24", textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}>
                  #{currentItem.player.jerseyNo}
                </div>
                <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <span className="il-pill" style={{ background: "rgba(2,6,23,0.85)", color: "#7dd3fc" }}>
                    {currentItem.player.role}
                  </span>
                  <span className="il-pill" style={{ background: "rgba(251,191,36,0.9)", color: "#050a18" }}>
                    OVR {computePlayerOvrRating(currentItem.player)}
                  </span>
                </div>
                <div style={{ position: "absolute", left: 12, right: 12, bottom: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 22, lineHeight: 1.1 }}>{currentItem.player.name}</div>
                  <div style={{ fontSize: 12, color: "#fde68a", fontWeight: 800, marginTop: 3 }}>
                    {currentItem.player.mvpPoints} Career MVP • {currentItem.player.runs} Runs • {currentItem.player.wickets} Wkts
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ padding: 14, borderRadius: 16, background: "rgba(2,6,23,0.86)", border: "1px solid rgba(251,191,36,0.45)", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800, letterSpacing: "0.1em" }}>
                    {highestTeam ? "LIVE BIDDING AMOUNT" : "OPENING BASE PRICE"}
                  </div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: "#fbbf24", lineHeight: 1.1, marginTop: 4 }}>
                    {currentBid.toLocaleString()} <span style={{ fontSize: 15, color: "#fde68a" }}>LC</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, fontWeight: 800, color: highestTeam ? highestTeam.color : "#94a3b8" }}>
                    {highestTeam
                      ? "LEADING: " + highestTeam.name.toUpperCase() + " (Cap: " + highestTeam.captainName.split(" ")[0] + ")"
                      : "Waiting for Captain Bid..."}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11, color: "#34d399", fontWeight: 800 }}>
                    Projected MVP on Sold: +{computeAuctionMvpPoints(currentBid)} MVP Pts
                  </div>
                </div>

                {/* MIDDLEMAN COMMAND DECK */}
                {isMiddleman ? (
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="il-btn il-btn-gold"
                        style={{ flex: 1, padding: "10px 12px" }}
                        onClick={handleMiddlemanSoldClick}
                      >
                        <GavelSvg size={15} /> {highestTeamId ? "SOLD! Lock Bid" : "Mark UNSOLD"}
                      </button>
                      <button
                        type="button"
                        className="il-btn il-btn-danger"
                        style={{ padding: "10px 10px", fontSize: 11 }}
                        onClick={resetCurrentPlayerBid}
                        title="Reset current bid back to opening base price"
                      >
                        🔄 Reset Bid
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        disabled={bidUndoStack.length === 0}
                        className="il-btn"
                        style={{ flex: 1, padding: "7px 8px", fontSize: 11 }}
                        onClick={() => {
                          if (bidUndoStack.length === 0) return;
                          const [prevSnap, ...restStack] = bidUndoStack;
                          const revertedLog = ["↩️ Middleman undid last bid → " + prevSnap.bid + " LC", ...bidLog.slice(0, 24)];
                          setCurrentBid(prevSnap.bid);
                          setHighestTeamId(prevSnap.teamId);
                          setBidUndoStack(restStack);
                          setBidLog(revertedLog);
                          void syncToAuctionBin(
                            buildSnapshot({
                              currentBid: prevSnap.bid,
                              highestTeamId: prevSnap.teamId,
                              bidLog: revertedLog,
                            })
                          );
                        }}
                      >
                        ↩ Undo Bid ({bidUndoStack.length})
                      </button>
                      <button
                        type="button"
                        className="il-btn"
                        style={{ padding: "7px 8px", fontSize: 11 }}
                        onClick={() => markUnsold()}
                      >
                        ❌ Unsold
                      </button>
                      <button
                        type="button"
                        className="il-btn"
                        style={{ padding: "7px 8px", fontSize: 11 }}
                        onClick={() => announcePlayer(currentItem, true)}
                      >
                        <Volume2 size={13} /> Speak
                      </button>
                      <button
                        type="button"
                        className={"il-btn " + (proxyBidMode ? "il-btn-purple" : "")}
                        style={{ padding: "7px 8px", fontSize: 10 }}
                        onClick={() => setProxyBidMode((v) => !v)}
                        title="Allow Middleman to place proxy bids if a captain's phone dies"
                      >
                        Proxy: {proxyBidMode ? "ON" : "OFF"}
                      </button>
                      {currentItem.player.walkoutUrl && (
                        <button
                          type="button"
                          className="il-btn il-btn-emerald"
                          style={{ padding: "7px 8px", fontSize: 11 }}
                          onClick={() =>
                            onPlayWalkout(
                              currentItem.player.walkoutUrl || "",
                              currentItem.player.name + " Walkout Anthem"
                            )
                          }
                        >
                          <MusicSvg size={12} /> Anthem
                        </button>
                      )}
                    </div>
                    {highestTeamId === "" && (
                      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>EDIT BASE:</span>
                        {[50, 100, 200, 500].map((bp) => (
                          <button
                            key={bp}
                            type="button"
                            className="il-btn"
                            style={{ padding: "3px 7px", fontSize: 10 }}
                            onClick={() => updateCurrentBasePrice(bp)}
                          >
                            {bp}
                          </button>
                        ))}
                        <input
                          className="il-input"
                          type="number"
                          style={{ width: 68, padding: "3px 6px", fontSize: 10 }}
                          placeholder="Custom"
                          value={customBaseDraft}
                          onChange={(e) => setCustomBaseDraft(e.target.value)}
                        />
                        <button
                          type="button"
                          className="il-btn il-btn-primary"
                          style={{ padding: "3px 7px", fontSize: 10 }}
                          onClick={() => {
                            if (Number(customBaseDraft) >= 25) {
                              updateCurrentBasePrice(Number(customBaseDraft));
                              setCustomBaseDraft("");
                            }
                          }}
                        >
                          Set
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: 8, borderRadius: 10, background: "rgba(2,6,23,0.72)", textAlign: "center", fontSize: 11, color: "#fde68a" }}>
                    Middleman <strong>{middlemanPlayer?.name}</strong> controls SOLD, UNSOLD &amp; Reset Bid.
                  </div>
                )}
              </div>
            </div>

            {rtmPending && isMiddleman && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 14,
                  background: "linear-gradient(90deg, rgba(124,58,237,0.35), rgba(245,158,11,0.3))",
                  border: "2px solid #fbbf24",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 14, color: "#fde68a", marginBottom: 8 }}>
                  ⚡ RIGHT TO MATCH (RTM) — {rtmPending.player.name} at {rtmPending.price} LC
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {teams
                    .filter((t) => t.id !== rtmPending.winnerTeamId && t.rtmLeft > 0 && t.purse >= rtmPending.price)
                    .map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className="il-btn il-btn-purple"
                        onClick={() => finalizeSale(t.id, rtmPending.price, true)}
                      >
                        ⚡ {t.name} Use RTM ({rtmPending.price} LC)
                      </button>
                    ))}
                  <button
                    type="button"
                    className="il-btn il-btn-gold"
                    onClick={() => finalizeSale(rtmPending.winnerTeamId, rtmPending.price, false)}
                  >
                    No RTM — Confirm SOLD to {teams.find((t) => t.id === rtmPending.winnerTeamId)?.name}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* FRANCHISE PURSES, CAPTAIN STATUS & BIDDING PADDLES */}
          <div className={teamCount === 3 ? "il-grid-3 il-resp-1" : "il-grid-2 il-resp-1"} style={{ marginBottom: 12 }}>
            {teams.map((t) => {
              const isLeading = highestTeamId === t.id;
              const isPassed = passedTeamIds.includes(t.id);
              const isMyCaptainTeam = t.captainId === currentUser.id;
              const canOperate = isMyCaptainTeam || (isMiddleman && proxyBidMode);
              const minReserve = Math.max(0, Math.min(2, remainingPlayersCount) * 100);
              const maxSafeBid = Math.max(0, t.purse - minReserve);
              const pursePct = Math.max(0, Math.min(100, Math.round((t.purse / AUCTION_PURSE_DEFAULT) * 100)));
              const canOpen = canOperate && highestTeamId === "" && t.purse >= currentItem.basePrice;
              const needBowl = t.bought.filter((b) => b.role === "Bowler" || b.role === "All-Rounder").length === 0;
              return (
                <div
                  key={t.id}
                  className="il-card"
                  style={{
                    marginBottom: 0,
                    opacity: isPassed && !isLeading ? 0.65 : 1,
                    borderColor: isLeading ? t.color : isMyCaptainTeam ? "rgba(251,191,36,0.7)" : "var(--border)",
                    boxShadow: isLeading ? "0 0 24px " + t.color + "55" : undefined,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <PlayerAvatar playerId={t.captainId} name={t.captainName} size={28} rounded borderColor={t.color} />
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 14, color: t.color }}>{t.name}</div>
                        <div style={{ fontSize: 10, color: "#fde68a", fontWeight: 700 }}>👑 Cap: {t.captainName.split(" ")[0]}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {isPassed && (
                        <span className="il-pill" style={{ background: "rgba(244,63,94,0.25)", color: "#fda4af" }}>PASSED</span>
                      )}
                      {needBowl && (
                        <span className="il-pill" style={{ background: "rgba(245,158,11,0.2)", color: "#fde68a", fontSize: 8 }}>Need Bowler</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span>Purse: <strong style={{ color: "#fbbf24" }}>{t.purse.toLocaleString()} LC</strong></span>
                    <span>Squad: <strong>{t.bought.length}</strong> • RTM: <strong>{t.rtmLeft}</strong></span>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: "#1e293b", marginBottom: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pursePct + "%", background: t.color }} />
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                    <span>Max Safe Bid: <strong>{maxSafeBid.toLocaleString()} LC</strong></span>
                    {isMiddleman && (
                      <span style={{ display: "flex", gap: 4 }}>
                        <button type="button" style={{ background: "none", border: "none", color: "#34d399", cursor: "pointer", fontSize: 10, padding: 0 }} onClick={() => adjustTeamPurseOrRtm(t.id, 1000, 0)}>+1k</button>
                        <button type="button" style={{ background: "none", border: "none", color: "#fb7185", cursor: "pointer", fontSize: 10, padding: 0 }} onClick={() => adjustTeamPurseOrRtm(t.id, -1000, 0)}>-1k</button>
                        <button type="button" style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: 10, padding: 0 }} onClick={() => adjustTeamPurseOrRtm(t.id, 0, 1)}>+RTM</button>
                      </span>
                    )}
                  </div>

                  {!canOperate ? (
                    <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", padding: "7px 4px", borderRadius: 9, background: "rgba(2,6,23,0.65)" }}>
                      Only Captain {t.captainName.split(" ")[0]} can bid
                    </div>
                  ) : canOpen ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="il-btn il-btn-gold"
                        style={{ flex: 1, padding: "9px 10px" }}
                        onClick={() => placeBid(t.id, 0)}
                      >
                        Open Bid @ {currentItem.basePrice} LC
                      </button>
                      <button
                        type="button"
                        className="il-btn"
                        style={{ padding: "9px 10px", fontSize: 11 }}
                        onClick={() => toggleCaptainPass(t.id)}
                      >
                        {isPassed ? "Back" : "Pass"}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="il-grid-4" style={{ gap: 5 }}>
                        {[50, 100, 250, 500].map((inc) => (
                          <button
                            key={inc}
                            type="button"
                            disabled={isLeading || currentBid + inc > t.purse || Boolean(rtmPending)}
                            className="il-btn il-btn-primary"
                            style={{ padding: "7px 4px", fontSize: 11 }}
                            onClick={() => placeBid(t.id, inc)}
                          >
                            +{inc}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
                        <button
                          type="button"
                          disabled={isLeading || currentBid + 1000 > t.purse || Boolean(rtmPending)}
                          className="il-btn il-btn-purple"
                          style={{ padding: "6px 7px", fontSize: 10 }}
                          onClick={() => placeBid(t.id, 1000)}
                        >
                          +1000
                        </button>
                        <input
                          className="il-input"
                          type="number"
                          style={{ flex: 1, padding: "5px 8px", fontSize: 11 }}
                          placeholder="Custom LC..."
                          value={customBidInput}
                          onChange={(e) => setCustomBidInput(e.target.value)}
                        />
                        <button
                          type="button"
                          disabled={isLeading || Number(customBidInput) <= currentBid || Number(customBidInput) > t.purse}
                          className="il-btn il-btn-gold"
                          style={{ padding: "5px 8px", fontSize: 11 }}
                          onClick={() => {
                            const targetAmt = Number(customBidInput);
                            if (targetAmt > currentBid && targetAmt <= t.purse) {
                              placeBid(t.id, targetAmt - currentBid);
                              setCustomBidInput("");
                            }
                          }}
                        >
                          Bid
                        </button>
                        <button
                          type="button"
                          disabled={isLeading || t.purse <= currentBid || Boolean(rtmPending)}
                          className="il-btn il-btn-danger"
                          style={{ padding: "5px 7px", fontSize: 10 }}
                          onClick={() => placeBid(t.id, 0, true)}
                        >
                          ALL-IN
                        </button>
                        <button
                          type="button"
                          className="il-btn"
                          style={{ padding: "5px 7px", fontSize: 10 }}
                          onClick={() => toggleCaptainPass(t.id)}
                        >
                          {isPassed ? "In" : "Pass"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* CAPTAIN PRIVATE STRATEGY PAD (FOR CAPTAINS ONLY) */}
          {canPlaceBidAsCaptain && (
            <div className="il-card" style={{ padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#fde68a", marginBottom: 6 }}>
                👑 Captain Strategy Pad ({activeCaptainTeam?.name}) — Private Notes
              </div>
              <input
                className="il-input"
                style={{ fontSize: 12, padding: "7px 10px" }}
                placeholder="Write private target players / max budget notes..."
                value={captainStrategyNote}
                onChange={(e) => setCaptainStrategyNote(e.target.value)}
              />
            </div>
          )}

          {/* UPCOMING QUEUE INSPECTOR, WATCHLIST & JUMP-TO-PLAYER */}
          <div className="il-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontWeight: 900, fontSize: 13, color: "#7dd3fc" }}>
                📋 Upcoming Queue ({remainingPlayersCount} Left) &amp; Watchlist ({watchlistIds.length})
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {isMiddleman && remainingPlayersCount > 1 && (
                  <button type="button" className="il-btn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={shuffleUpcomingQueue}>
                    🔀 Shuffle
                  </button>
                )}
                <button type="button" className="il-btn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => setShowQueueDrawer((v) => !v)}>
                  {showQueueDrawer ? "Hide Queue" : "Inspect Queue"}
                </button>
              </div>
            </div>
            {showQueueDrawer && (
              <div style={{ display: "grid", gap: 5, marginTop: 10, maxHeight: 200, overflowY: "auto" }}>
                {queue.slice(currentIdx + 1).length === 0 ? (
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Last player of this round is currently on stage!</div>
                ) : (
                  queue.slice(currentIdx + 1).map((item, offset) => {
                    const realIdx = currentIdx + 1 + offset;
                    const starred = watchlistIds.includes(item.player.id);
                    return (
                      <div key={item.player.id + "_" + realIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 9px", borderRadius: 9, background: "rgba(2,6,23,0.75)", fontSize: 12 }}>
                        <span>
                          <strong>#{item.player.jerseyNo} {item.player.name}</strong>{" "}
                          <span style={{ fontSize: 10, color: "var(--muted)" }}>({item.player.role} • {item.basePrice} LC)</span>
                        </span>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button
                            type="button"
                            className={"il-btn " + (starred ? "il-btn-gold" : "")}
                            style={{ padding: "3px 7px", fontSize: 10 }}
                            onClick={() =>
                              setWatchlistIds((prev) =>
                                prev.includes(item.player.id)
                                  ? prev.filter((id) => id !== item.player.id)
                                  : [...prev, item.player.id]
                              )
                            }
                          >
                            {starred ? "⭐" : "☆"}
                          </button>
                          {isMiddleman && (
                            <button
                              type="button"
                              className="il-btn il-btn-primary"
                              style={{ padding: "3px 7px", fontSize: 10 }}
                              onClick={() => jumpToQueuedPlayer(realIdx)}
                            >
                              Bring Next
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* LIVE BID TICKER */}
          <div className="il-card">
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8, color: "#fde68a" }}>
              Live Bidding &amp; Middleman Ticker
            </div>
            <div style={{ display: "grid", gap: 5, maxHeight: 140, overflowY: "auto" }}>
              {bidLog.map((line, idx) => (
                <div key={idx} style={{ fontSize: 12, padding: "5px 9px", borderRadius: 8, background: "rgba(2,6,23,0.75)" }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* UNSOLD POOL LIVE RE-BID PANEL (AVAILABLE DURING LIVE & DONE!) */}
      {phase !== "setup" && unsoldPool.length > 0 && (
        <div className="il-card" style={{ borderColor: "rgba(244,63,94,0.55)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 15, color: "#fda4af" }}>
              ❌ Unsold Players Pool ({unsoldPool.length}) — Re-Auction Anytime
            </div>
            {isMiddleman && (
              <button
                type="button"
                className="il-btn il-btn-purple"
                style={{ padding: "6px 10px", fontSize: 11 }}
                onClick={startAcceleratedRound}
              >
                ⚡ Start Full Accelerated Round (All @ 50%)
              </button>
            )}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {unsoldPool.map((u) => (
              <div key={u.player.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "8px 10px", borderRadius: 10, background: "rgba(2,6,23,0.78)", fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PlayerAvatar playerId={u.player.id} name={u.player.name} size={28} rounded />
                  <div>
                    <strong>#{u.player.jerseyNo} {u.player.name}</strong>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{u.player.role} • Orig Base {calcBasePrice(u.player)} LC</div>
                  </div>
                </div>
                {isMiddleman && (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <button type="button" className="il-btn il-btn-gold" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => bringUnsoldBackNow(u.player.id, "half")}>
                      🔁 Re-Bid 50%
                    </button>
                    <button type="button" className="il-btn il-btn-primary" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => bringUnsoldBackNow(u.player.id, "full")}>
                      🔁 100% Base
                    </button>
                    <button type="button" className="il-btn il-btn-emerald" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => bringUnsoldBackNow(u.player.id, "50")}>
                      50 LC Quick
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOLD BOARD, AUCTION SCORECARD & DRAFTED TEAMS */}
      {phase !== "setup" && (
        <>
          <div className="il-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <div style={{ fontWeight: 900, fontSize: 16, color: "#fbbf24" }}>
                Sold Board ({soldHistory.length} Sold)
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {soldHistory.length > 0 && (
                  <button type="button" className="il-btn" style={{ padding: "6px 9px", fontSize: 11 }} onClick={exportAuctionCsv}>
                    <Download size={12} /> CSV
                  </button>
                )}
                {isPermanentAdmin && teams.length >= 2 && teams[0].bought.length >= 2 && teams[1].bought.length >= 2 && (
                  <button
                    type="button"
                    className="il-btn il-btn-emerald"
                    style={{ fontSize: 12 }}
                    onClick={() =>
                      onLoadTeamsToMatch(
                        teams[0].name,
                        teams[0].bought.map((b) => b.playerId),
                        teams[1].name,
                        teams[1].bought.map((b) => b.playerId)
                      )
                    }
                  >
                    <Play size={14} /> Load Teams into Match Center
                  </button>
                )}
              </div>
            </div>

            {soldHistory.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--muted)" }}>No players sold yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 6 }}>
                {soldHistory.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: "rgba(2,6,23,0.78)",
                      border: "1px solid " + s.teamColor + "55",
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <PlayerAvatar playerId={s.playerId} name={s.playerName} size={30} rounded />
                      <div>
                        <strong>#{s.jerseyNo} {s.playerName}</strong>
                        <div style={{ fontSize: 10, color: s.teamColor, fontWeight: 800 }}>
                          {s.teamName} {s.viaRtm ? "(RTM)" : ""} • {s.timestamp}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 900, color: "#fbbf24" }}>Sold: {s.price.toLocaleString()} LC</div>
                        <div style={{ fontSize: 10, color: "#34d399", fontWeight: 800 }}>+{s.mvpAwarded} MVP Pts</div>
                      </div>
                      {isMiddleman && (
                        <button
                          type="button"
                          className="il-btn il-btn-danger"
                          style={{ padding: "4px 7px", fontSize: 10 }}
                          onClick={() => reverseSoldPlayer(s.id)}
                          title="Reverse sale, refund LC & return player to Unsold Pool"
                        >
                          ↩
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OFFICIAL AUCTION SCORECARD & COPY/SHARE */}
          <div className="il-card il-hero-banner">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, color: "#fbbf24", letterSpacing: "0.1em" }}>
                  OFFICIAL BROADCAST SUMMARY
                </div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  {clubName} Mega Auction Scorecard
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="il-btn il-btn-purple"
                  style={{ padding: "6px 10px", fontSize: 11 }}
                  onClick={() => {
                    const topBuy = [...soldHistory].sort((a, b) => b.price - a.price)[0];
                    const topPlayer = topBuy ? players.find((p) => p.id === topBuy.playerId) || null : null;
                    onOpenPoster({
                      mode: "motm",
                      title: clubName + " MEGA AUCTION",
                      subtitle: "TOP BUY OF THE AUCTION",
                      player: topPlayer,
                      highlightLine: topBuy
                        ? topBuy.teamName.toUpperCase() + " • " + topBuy.price.toLocaleString() + " LC"
                        : "30,000 LC MEGA AUCTION",
                      statsLine: topBuy
                        ? "+" + topBuy.mvpAwarded + " Auction MVP • " + soldHistory.length + " Players Sold"
                        : teams.map((t) => t.name + " (" + t.bought.length + ")").join(" vs "),
                    });
                  }}
                >
                  <Download size={12} /> Auction Poster
                </button>
                <button
                  type="button"
                  className="il-btn il-btn-gold"
                  style={{ padding: "6px 10px", fontSize: 11 }}
                  onClick={() => {
                    const topBuy = [...soldHistory].sort((a, b) => b.price - a.price)[0];
                    const lines = [
                      clubName + " MEGA AUCTION SCORECARD (30,000 LC PURSE)",
                      "Sold: " + soldHistory.length + " | Unsold Pool: " + unsoldPool.length,
                      topBuy
                        ? "Highest Buy: " + topBuy.playerName + " -> " + topBuy.teamName + " (" + topBuy.price + " LC, +" + topBuy.mvpAwarded + " MVP)"
                        : "Highest Buy: —",
                      "",
                      ...teams.map((t) => {
                        const spent = AUCTION_PURSE_DEFAULT - t.purse;
                        const mvpSum = t.bought.reduce((s, b) => s + b.mvpAwarded, 0);
                        return (
                          t.name +
                          " (Cap: " +
                          t.captainName +
                          "): " +
                          t.bought.length +
                          " players | Spent: " +
                          spent +
                          " LC | Purse Left: " +
                          t.purse +
                          " LC | Auction MVP: +" +
                          mvpSum +
                          "\n  Squad: " +
                          t.bought.map((b) => (b.isCaptainRetained ? "👑" : "") + b.name.split(" ")[0] + "(" + b.price + ")").join(", ")
                        );
                      }),
                    ].join("\n");
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(lines).catch(() => {});
                    }
                  }}
                >
                  <Copy size={12} /> Copy Full Draft
                </button>
                <a
                  href={
                    "https://wa.me/?text=" +
                    encodeURIComponent(
                      clubName +
                        " AUCTION SCORECARD\n" +
                        teams
                          .map(
                            (t) =>
                              "• " +
                              t.name +
                              " (👑 " +
                              t.captainName.split(" ")[0] +
                              "): " +
                              t.bought.length +
                              " players | " +
                              t.purse +
                              " LC left | +" +
                              t.bought.reduce((s, b) => s + b.mvpAwarded, 0) +
                              " MVP"
                          )
                          .join("\n")
                    )
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="il-btn il-btn-emerald"
                  style={{ textDecoration: "none", padding: "6px 10px", fontSize: 11 }}
                >
                  <Share2 size={12} /> Share
                </a>
              </div>
            </div>

            {(() => {
              const highestBuy = [...soldHistory].sort((a, b) => b.price - a.price)[0];
              const stealBuy = [...soldHistory]
                .filter((s) => s.mvpAwarded > 0)
                .sort((a, b) => b.mvpAwarded / Math.max(1, b.price) - a.mvpAwarded / Math.max(1, a.price))[0];
              const totalLcSpent = teams.reduce(
                (acc, t) => acc + Math.max(0, AUCTION_PURSE_DEFAULT - t.purse),
                0
              );
              return (
                <>
                  {stealBuy && (
                    <div style={{ marginBottom: 8, padding: "6px 10px", borderRadius: 10, background: "rgba(52,211,153,0.16)", border: "1px solid rgba(52,211,153,0.4)", fontSize: 11, color: "#6ee7b7", fontWeight: 800 }}>
                      💎 STEAL OF THE AUCTION: {stealBuy.playerName} → {stealBuy.teamName} ({stealBuy.price} LC for +{stealBuy.mvpAwarded} MVP!)
                    </div>
                  )}
                  <div className="il-grid-3" style={{ gap: 8, marginBottom: 10, textAlign: "center" }}>
                    <div style={{ background: "rgba(2,6,23,0.8)", padding: 8, borderRadius: 10 }}>
                      <div style={{ fontSize: 9, color: "var(--muted)" }}>TOTAL SPENT</div>
                      <div style={{ fontWeight: 900, fontSize: 14, color: "#fbbf24" }}>{totalLcSpent.toLocaleString()} LC</div>
                    </div>
                    <div style={{ background: "rgba(2,6,23,0.8)", padding: 8, borderRadius: 10 }}>
                      <div style={{ fontSize: 9, color: "var(--muted)" }}>PLAYERS SOLD</div>
                      <div style={{ fontWeight: 900, fontSize: 14, color: "#34d399" }}>{soldHistory.length}</div>
                    </div>
                    <div style={{ background: "rgba(2,6,23,0.8)", padding: 8, borderRadius: 10 }}>
                      <div style={{ fontSize: 9, color: "var(--muted)" }}>TOP BUY</div>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#38bdf8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {highestBuy ? highestBuy.playerName.split(" ")[0] + " (" + highestBuy.price + ")" : "—"}
                      </div>
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ color: "#fbbf24", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                          <th style={{ padding: "6px 4px" }}>FRANCHISE</th>
                          <th style={{ padding: "6px 4px" }}>CAPTAIN</th>
                          <th style={{ padding: "6px 4px" }}>SQUAD</th>
                          <th style={{ padding: "6px 4px" }}>SPENT</th>
                          <th style={{ padding: "6px 4px" }}>PURSE LEFT</th>
                          <th style={{ padding: "6px 4px" }}>MVP / OVR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map((t) => {
                          const spent = Math.max(0, AUCTION_PURSE_DEFAULT - t.purse);
                          const avgSpend = t.bought.length > 0 ? Math.round(spent / t.bought.length) : 0;
                          const usedPct = Math.round((spent / AUCTION_PURSE_DEFAULT) * 100);
                          const mvpSum = t.bought.reduce((s, b) => s + b.mvpAwarded, 0);
                          const batC = t.bought.filter((b) => b.role === "Batsman").length;
                          const bowlC = t.bought.filter((b) => b.role === "Bowler").length;
                          const arC = t.bought.filter((b) => b.role === "All-Rounder").length;
                          const wkC = t.bought.filter((b) => b.role === "Wicket-Keeper").length;
                          const teamPlayersObjs = t.bought
                            .map((b) => players.find((p) => p.id === b.playerId))
                            .filter((x): x is Player => Boolean(x));
                          const teamOvr =
                            teamPlayersObjs.length > 0
                              ? Math.round(
                                  teamPlayersObjs.reduce((s, p) => s + computePlayerOvrRating(p), 0) /
                                    teamPlayersObjs.length
                                )
                              : 0;
                          return (
                            <tr key={t.id} style={{ borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
                              <td style={{ padding: "7px 4px", fontWeight: 900, color: t.color }}>
                                {t.name}
                                <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700 }}>
                                  BAT:{batC} BOWL:{bowlC} AR:{arC} WK:{wkC}
                                </div>
                              </td>
                              <td style={{ padding: "7px 4px" }}>👑 {t.captainName.split(" ")[0]}</td>
                              <td style={{ padding: "7px 4px", fontWeight: 800 }}>{t.bought.length}</td>
                              <td style={{ padding: "7px 4px", color: "#fda4af" }}>
                                {spent.toLocaleString()}
                                <div style={{ fontSize: 9, color: "var(--muted)" }}>Avg {avgSpend} • {usedPct}%</div>
                              </td>
                              <td style={{ padding: "7px 4px", color: "#fbbf24", fontWeight: 900 }}>{t.purse.toLocaleString()}</td>
                              <td style={{ padding: "7px 4px", color: "#34d399", fontWeight: 900 }}>
                                +{mvpSum}
                                <div style={{ fontSize: 9, color: "#7dd3fc" }}>OVR {teamOvr}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="il-card">
            <div style={{ fontWeight: 900, fontSize: 15, color: "#7dd3fc", marginBottom: 10 }}>
              Franchise Squads (With Captains &amp; Auto Vice-Captains)
            </div>
            <div className={teamCount === 3 ? "il-grid-3 il-resp-1" : "il-grid-2 il-resp-1"}>
              {teams.map((t) => {
                const teamMvpTotal = t.bought.reduce((acc, x) => acc + x.mvpAwarded, 0);
                const vcCandidate = t.bought
                  .filter((b) => !b.isCaptainRetained)
                  .sort((a, b) => b.price - a.price)[0];
                return (
                  <div key={t.id} style={{ background: "rgba(2,6,23,0.78)", padding: 12, borderRadius: 14, border: "1px solid " + t.color + "66" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, color: t.color, marginBottom: 4 }}>
                      <span>{t.name} ({t.bought.length})</span>
                      <span>{t.purse.toLocaleString()} LC</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#fde68a", marginBottom: 8 }}>
                      👑 C: {t.captainName.split(" ")[0]} {vcCandidate ? "• VC: " + vcCandidate.name.split(" ")[0] : ""} • +{teamMvpTotal} MVP
                    </div>
                    {t.bought.length === 0 ? (
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>No players drafted yet.</div>
                    ) : (
                      <div style={{ display: "grid", gap: 5 }}>
                        {t.bought.map((b) => (
                          <div key={b.playerId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "5px 8px", borderRadius: 8, background: b.isCaptainRetained ? "rgba(245,158,11,0.18)" : "rgba(15,29,66,0.7)" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <PlayerAvatar playerId={b.playerId} name={b.name} size={24} rounded />
                              <strong>{b.isCaptainRetained ? "👑 " : ""}{b.name}</strong>
                            </span>
                            <span style={{ color: "#fbbf24", fontWeight: 800 }}>
                              {b.isCaptainRetained ? (b.price > 0 ? "CAP (" + b.price + ")" : "CAPTAIN") : b.price + " LC (+" + b.mvpAwarded + ")"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* CONFIRM RESET MODAL */}
      {showConfirmReset && (
        <div className="il-modal-backdrop" onClick={() => setShowConfirmReset(false)}>
          <div className="il-modal" style={{ maxWidth: 380, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 8px 0", color: "#fb7185" }}>Reset Entire Mega Auction Bin?</h3>
            <p style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 16 }}>
              This clears all live bids, drafted squads, and unsold pool in your Auction JSONBin so you can start a fresh draft.
            </p>
            <div className="il-grid-2">
              <button type="button" className="il-btn il-btn-danger" onClick={resetAuctionBinAndState}>
                Yes, Reset Bin
              </button>
              <button type="button" className="il-btn" onClick={() => setShowConfirmReset(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN SOLD! / UNSOLD STAMP OVERLAY */}
      {stampOverlay && (
        <div
          className="il-celeb-overlay"
          style={{
            background:
              stampOverlay.status === "SOLD"
                ? "radial-gradient(circle at center, rgba(217,119,6,0.94) 0%, rgba(15,23,42,0.98) 65%)"
                : "radial-gradient(circle at center, rgba(190,18,60,0.92) 0%, rgba(15,23,42,0.98) 65%)",
          }}
          onClick={() => setStampOverlay(null)}
        >
          {stampOverlay.status === "SOLD" &&
            Array.from({ length: 18 }).map((_, idx) => (
              <span
                key={idx}
                style={{
                  position: "absolute",
                  left: ((idx * 5.6) % 94) + 3 + "vw",
                  top: "-8vh",
                  width: 11,
                  height: 16,
                  borderRadius: 3,
                  background: ["#fbbf24", "#38bdf8", "#34d399", "#ffffff"][idx % 4],
                  animation: "confettiFall " + (1.4 + (idx % 4) * 0.35) + "s linear infinite",
                  pointerEvents: "none",
                }}
              />
            ))}

          <div className="il-celeb-card" style={{ maxWidth: 420 }}>
            <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto 14px auto", borderRadius: "50%", overflow: "hidden", border: "5px solid " + stampOverlay.teamColor, boxShadow: "0 0 40px " + stampOverlay.teamColor }}>
              <PlayerPortraitBanner playerId={stampOverlay.player.id} name={stampOverlay.player.name} height={200} />
            </div>

            <div
              className="il-stamp"
              style={{
                display: "inline-block",
                padding: "8px 26px",
                borderRadius: 14,
                border: "5px solid " + (stampOverlay.status === "SOLD" ? "#fde68a" : "#fda4af"),
                background: stampOverlay.status === "SOLD" ? "rgba(5,10,24,0.88)" : "rgba(76,5,25,0.9)",
                color: stampOverlay.status === "SOLD" ? "#fbbf24" : "#fda4af",
                fontSize: 42,
                fontWeight: 900,
                letterSpacing: "0.14em",
                marginBottom: 12,
              }}
            >
              {stampOverlay.viaRtm ? "RTM SOLD!" : stampOverlay.status + "!"}
            </div>

            <div style={{ fontSize: 28, fontWeight: 900, color: "#ffffff" }}>
              {stampOverlay.player.name} (#{stampOverlay.player.jerseyNo})
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: stampOverlay.teamColor, marginTop: 6 }}>
              {stampOverlay.status === "SOLD"
                ? stampOverlay.teamName.toUpperCase() + " • SOLD FOR " + stampOverlay.price.toLocaleString() + " LC"
                : "MOVED TO UNSOLD RE-BID POOL"}
            </div>
            {stampOverlay.status === "SOLD" && (
              <div style={{ fontSize: 15, fontWeight: 800, color: "#34d399", marginTop: 4 }}>
                +{stampOverlay.mvpAwarded} MVP POINTS AWARDED
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LaunchFireworksCanvas({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
    }
    interface Rocket {
      x: number;
      y: number;
      targetY: number;
      vy: number;
      color: string;
    }

    const palette = ["#fbbf24", "#38bdf8", "#34d399", "#fb7185", "#c084fc", "#ffffff"];
    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];

    const spawnRocket = () => {
      rockets.push({
        x: canvas.width * (0.15 + Math.random() * 0.7),
        y: canvas.height + 10,
        targetY: canvas.height * (0.16 + Math.random() * 0.36),
        vy: -(8.5 + Math.random() * 4),
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    };

    const explodeAt = (x: number, y: number, color: string) => {
      const count = 48;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
        const speed = 1.8 + Math.random() * 5.2;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: i % 5 === 0 ? "#ffffff" : color,
          size: 2 + Math.random() * 2.4,
        });
      }
    };

    spawnRocket();
    spawnRocket();
    const launchTimer = window.setInterval(spawnRocket, 520);

    const loop = () => {
      ctx.fillStyle = "rgba(3, 7, 20, 0.22)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();
        if (r.y <= r.targetY || r.vy >= -1.2) {
          explodeAt(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.085; // gravity
        s.vx *= 0.985;
        s.alpha -= 0.015;
        if (s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.restore();
      }

      animId = window.requestAnimationFrame(loop);
    };

    animId = window.requestAnimationFrame(loop);

    return () => {
      window.clearInterval(launchTimer);
      window.cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
        }}
      />
      <div
        className="il-celeb-card"
        style={{
          background: "rgba(7, 16, 38, 0.88)",
          border: "2px solid rgba(251, 191, 36, 0.85)",
          borderRadius: 24,
          padding: 26,
          boxShadow: "0 0 60px rgba(251, 191, 36, 0.42)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 34, marginBottom: 6 }}>🎆🏏🏆🔥🎉</div>
        <div
          className="il-pill"
          style={{ background: "rgba(251,191,36,0.25)", color: "#fde68a", marginBottom: 8 }}
        >
          4:00 PM LAUNCH LIVE
        </div>
        <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#fbbf24" }}>
          INDORE LEGENDS IS LIVE!
        </h2>
        <p style={{ margin: "8px 0 18px 0", fontSize: 14, color: "#e2e8f0" }}>
          Season launch fireworks triggered at 4:00 PM! Ready for match day &amp; mega auction.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="il-btn il-btn-gold"
            onClick={() => playStadiumSfx("fireworks")}
          >
            🎆 Replay Fireworks SFX
          </button>
          <button type="button" className="il-btn il-btn-emerald" onClick={onClose}>
            Enter Stadium
          </button>
        </div>
      </div>
    </div>
  );
}


function WagonWheelCard({ history, innings }: { history: BallEvent[]; innings: 1 | 2 }) {
  const innBalls = history.filter((b) => b.innings === innings && b.shotZone);
  const counts = {
    "Off-Side": 0,
    "Leg-Side": 0,
    Straight: 0,
    "Loft 360": 0,
  };
  const runsByZone = {
    "Off-Side": 0,
    "Leg-Side": 0,
    Straight: 0,
    "Loft 360": 0,
  };
  innBalls.forEach((b) => {
    if (b.shotZone && b.shotZone in counts) {
      counts[b.shotZone] += 1;
      runsByZone[b.shotZone] += b.runs;
    }
  });
  const totalTagged = innBalls.length;

  return (
    <div style={{ marginTop: 12, padding: 10, borderRadius: 12, background: "rgba(2,6,23,0.78)", border: "1px solid rgba(56,189,248,0.3)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: "#7dd3fc" }}>🎯 WAGON WHEEL &amp; SHOT ZONES</span>
        <span style={{ fontSize: 10, color: "var(--muted)" }}>{totalTagged} tagged shots</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="50" fill="rgba(16,185,129,0.16)" stroke="#34d399" strokeWidth="2" />
          <circle cx="55" cy="55" r="28" fill="none" stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" />
          <rect x="51" y="42" width="8" height="26" rx="2" fill="#fde68a" opacity="0.85" />
          {runsByZone["Off-Side"] > 0 && <line x1="55" y1="55" x2="14" y2="45" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" />}
          {runsByZone["Leg-Side"] > 0 && <line x1="55" y1="55" x2="96" y2="48" stroke="#fbbf24" strokeWidth="3.2" strokeLinecap="round" />}
          {runsByZone.Straight > 0 && <line x1="55" y1="55" x2="55" y2="9" stroke="#34d399" strokeWidth="3.2" strokeLinecap="round" />}
          {runsByZone["Loft 360"] > 0 && <line x1="55" y1="55" x2="82" y2="18" stroke="#c084fc" strokeWidth="3.2" strokeLinecap="round" />}
        </svg>
        <div className="il-grid-2" style={{ gap: 6, flex: 1, minWidth: 160 }}>
          {(["Off-Side", "Leg-Side", "Straight", "Loft 360"] as const).map((z) => (
            <div key={z} style={{ background: "rgba(15,29,66,0.7)", padding: "5px 8px", borderRadius: 8, fontSize: 11 }}>
              <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 800 }}>{z.toUpperCase()}</div>
              <strong style={{ color: "#fde68a" }}>{runsByZone[z]} runs</strong> <span style={{ color: "#94a3b8" }}>({counts[z]})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function computeChasePressure(crr: number, rrr: number, wktsLost: number, maxWkts: number): { label: string; color: string; bg: string } {
  const gap = rrr - crr;
  const wktRatio = wktsLost / Math.max(1, maxWkts);
  if (rrr > 14 || (gap > 4 && wktRatio >= 0.6)) {
    return { label: "DO-OR-DIE PRESSURE", color: "#fda4af", bg: "rgba(225,29,72,0.28)" };
  }
  if (gap > 1.8 || wktRatio >= 0.5) {
    return { label: "TIGHT CHASE", color: "#fde68a", bg: "rgba(245,158,11,0.24)" };
  }
  if (gap > -0.5) {
    return { label: "BALANCED CONTEST", color: "#7dd3fc", bg: "rgba(56,189,248,0.22)" };
  }
  return { label: "COMFORTABLE CHASE", color: "#6ee7b7", bg: "rgba(16,185,129,0.24)" };
}

function estimateDlsPar(target: number, ballsBowled: number, totalOvers: number, wicketsLost: number, maxWickets: number): number {
  const totalBalls = Math.max(6, totalOvers * 6);
  const progress = Math.min(1, ballsBowled / totalBalls);
  const wicketPenalty = (wicketsLost / Math.max(1, maxWickets)) * 0.32;
  return Math.max(1, Math.round((target - 1) * (progress * 0.78 + wicketPenalty)));
}

function computeInningsExtras(history: BallEvent[], innings: 1 | 2): { wides: number; noBalls: number; total: number } {
  const inn = history.filter((b) => b.innings === innings);
  const wides = inn.filter((b) => b.isWide).length;
  const noBalls = inn.filter((b) => b.isNoBall).length;
  return { wides, noBalls, total: wides + noBalls };
}

function detectTurningPointOver(history: BallEvent[], innings: 1 | 2): { overNo: number; runs: number; wickets: number; reason: string } | null {
  const inn = history.filter((b) => b.innings === innings);
  if (inn.length === 0) return null;
  const map = new Map<number, { runs: number; wickets: number }>();
  inn.forEach((b) => {
    const cur = map.get(b.over) || { runs: 0, wickets: 0 };
    cur.runs += b.runs;
    if (b.isWicket) cur.wickets += 1;
    map.set(b.over, cur);
  });
  let best: { overNo: number; runs: number; wickets: number; score: number; reason: string } | null = null;
  map.forEach((val, ov) => {
    const impact = val.runs + val.wickets * 14;
    if (!best || impact > best.score) {
      best = {
        overNo: ov + 1,
        runs: val.runs,
        wickets: val.wickets,
        score: impact,
        reason: val.wickets >= 2 ? "Multi-Wicket Collapse Over" : val.runs >= 14 ? "Explosive Momentum Over" : "Key Over",
      };
    }
  });
  return best;
}


const DAILY_CRICKET_QUIZ = [
  { q: "How many legal balls make up a standard over in cricket?", opts: ["4", "6", "8", "10"], ans: 1 },
  { q: "On a Free Hit delivery, which dismissal is still allowed?", opts: ["Bowled", "Caught", "Run Out", "LBW"], ans: 2 },
  { q: "What is awarded when a batter is dismissed on 0 runs in Indore Legends?", opts: ["+25 MVP to bowler", "+40 MVP Duck Bonus", "+10 MVP", "0 MVP"], ans: 1 },
  { q: "In our Mega Auction, what is the starting Legend Coin purse per team?", opts: ["10,000 LC", "20,000 LC", "30,000 LC", "50,000 LC"], ans: 2 },
  { q: "If a player sells for 1,250 LC in our auction, how many Auction MVP points do they get?", opts: ["200", "300", "400", "500"], ans: 2 },
];

function TurfUtilitySuiteModal({
  players,
  onClose,
}: {
  players: Player[];
  onClose: () => void;
}) {
  const [utilTab, setUtilTab] = useState<"clicker" | "calc" | "shuffle" | "quiz">("clicker");
  const [clickBalls, setClickBalls] = useState<number>(0);
  const [clickOvers, setClickOvers] = useState<number>(0);
  const [clickWkts, setClickWkts] = useState<number>(0);
  const [timerSec, setTimerSec] = useState<number>(120);
  const [timerRun, setTimerRun] = useState<boolean>(false);

  const [calcTarget, setCalcTarget] = useState<string>("95");
  const [calcOvers, setCalcOvers] = useState<string>("8");
  const [calcCurRuns, setCalcCurRuns] = useState<string>("42");
  const [calcCurOv, setCalcCurOv] = useState<string>("4");

  const [nrrRunsFor, setNrrRunsFor] = useState<string>("110");
  const [nrrOvFor, setNrrOvFor] = useState<string>("10");
  const [nrrRunsAg, setNrrRunsAg] = useState<string>("94");
  const [nrrOvAg, setNrrOvAg] = useState<string>("10");

  const [shuffledOrder, setShuffledOrder] = useState<string[]>(() => players.map((p) => p.name));
  const [genTeamPair, setGenTeamPair] = useState<string>("Indore Strikers vs Malwa Titans");
  const [quizIdx, setQuizIdx] = useState<number>(() => new Date().getDate() % DAILY_CRICKET_QUIZ.length);
  const [quizPick, setQuizPick] = useState<number | null>(null);

  useEffect(() => {
    if (!timerRun || timerSec <= 0) return;
    const t = window.setTimeout(() => {
      if (timerSec === 1) {
        setTimerRun(false);
        playStadiumSfx("airhorn");
      }
      setTimerSec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearTimeout(t);
  }, [timerRun, timerSec]);

  const remRuns = Math.max(0, Number(calcTarget) - Number(calcCurRuns));
  const remOv = Math.max(0.1, Number(calcOvers) - Number(calcCurOv));
  const reqRate = (remRuns / remOv).toFixed(2);
  const simNrr = (
    Number(nrrRunsFor) / Math.max(0.1, Number(nrrOvFor)) -
    Number(nrrRunsAg) / Math.max(0.1, Number(nrrOvAg))
  ).toFixed(2);

  const qObj = DAILY_CRICKET_QUIZ[quizIdx];

  return (
    <div className="il-modal-backdrop" onClick={onClose}>
      <div className="il-modal" style={{ maxWidth: 490 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 16, color: "#fbbf24" }}>🧰 Pro Turf Utility Suite</span>
          <button type="button" className="il-btn" style={{ padding: 6 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="il-grid-4" style={{ gap: 5, marginBottom: 12 }}>
          {(
            [
              { id: "clicker", l: "Umpire" },
              { id: "calc", l: "RRR/NRR" },
              { id: "shuffle", l: "Shuffler" },
              { id: "quiz", l: "Quiz" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              className={"il-btn " + (utilTab === t.id ? "il-btn-gold" : "")}
              style={{ padding: "6px 4px", fontSize: 11 }}
              onClick={() => setUtilTab(t.id)}
            >
              {t.l}
            </button>
          ))}
        </div>

        {utilTab === "clicker" && (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.8)", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#fbbf24", fontWeight: 900 }}>UMPIRE BALL COUNTER &amp; CLICKER</div>
              <div style={{ fontSize: 34, fontWeight: 900, margin: "6px 0" }}>
                {clickOvers}.{clickBalls} <span style={{ fontSize: 14, color: "#fb7185" }}>• {clickWkts} Wkts</span>
              </div>
              <div className="il-grid-3" style={{ gap: 6 }}>
                <button
                  type="button"
                  className="il-btn il-btn-primary"
                  onClick={() => {
                    playStadiumSfx("tick");
                    if (clickBalls === 5) {
                      setClickBalls(0);
                      setClickOvers((o) => o + 1);
                      playStadiumSfx("bid");
                    } else {
                      setClickBalls((b) => b + 1);
                    }
                  }}
                >
                  +1 Legal Ball
                </button>
                <button type="button" className="il-btn il-btn-danger" onClick={() => setClickWkts((w) => w + 1)}>
                  +1 Wicket
                </button>
                <button
                  type="button"
                  className="il-btn"
                  onClick={() => {
                    setClickBalls(0);
                    setClickOvers(0);
                    setClickWkts(0);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.8)", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#34d399", fontWeight: 900 }}>DRINKS / STRATEGIC TIMEOUT TIMER</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fde68a", margin: "6px 0" }}>
                {String(Math.floor(timerSec / 60)).padStart(2, "0")}:{String(timerSec % 60).padStart(2, "0")}
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                <button type="button" className="il-btn il-btn-emerald" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => setTimerRun((v) => !v)}>
                  {timerRun ? "Pause" : "Start"}
                </button>
                <button type="button" className="il-btn" style={{ padding: "5px 9px", fontSize: 11 }} onClick={() => { setTimerRun(false); setTimerSec(120); }}>
                  Drinks (2:00)
                </button>
                <button type="button" className="il-btn" style={{ padding: "5px 9px", fontSize: 11 }} onClick={() => { setTimerRun(false); setTimerSec(150); }}>
                  Timeout (2:30)
                </button>
              </div>
            </div>
          </div>
        )}

        {utilTab === "calc" && (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ padding: 10, borderRadius: 12, background: "rgba(2,6,23,0.8)" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#7dd3fc", marginBottom: 6 }}>CHASE PLANNER &amp; RRR CALCULATOR</div>
              <div className="il-grid-2" style={{ gap: 6, marginBottom: 8 }}>
                <input className="il-input" type="number" value={calcTarget} onChange={(e) => setCalcTarget(e.target.value)} placeholder="Target" />
                <input className="il-input" type="number" value={calcOvers} onChange={(e) => setCalcOvers(e.target.value)} placeholder="Total Ov" />
                <input className="il-input" type="number" value={calcCurRuns} onChange={(e) => setCalcCurRuns(e.target.value)} placeholder="Current Runs" />
                <input className="il-input" type="number" value={calcCurOv} onChange={(e) => setCalcCurOv(e.target.value)} placeholder="Overs Bowled" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#fbbf24" }}>
                Need {remRuns} runs in {remOv.toFixed(1)} ov → RRR: {reqRate} RPO
              </div>
            </div>

            <div style={{ padding: 10, borderRadius: 12, background: "rgba(2,6,23,0.8)" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#34d399", marginBottom: 6 }}>NET RUN RATE (NRR) SIMULATOR</div>
              <div className="il-grid-2" style={{ gap: 6, marginBottom: 8 }}>
                <input className="il-input" type="number" value={nrrRunsFor} onChange={(e) => setNrrRunsFor(e.target.value)} placeholder="Runs Scored" />
                <input className="il-input" type="number" value={nrrOvFor} onChange={(e) => setNrrOvFor(e.target.value)} placeholder="Overs Faced" />
                <input className="il-input" type="number" value={nrrRunsAg} onChange={(e) => setNrrRunsAg(e.target.value)} placeholder="Runs Conceded" />
                <input className="il-input" type="number" value={nrrOvAg} onChange={(e) => setNrrOvAg(e.target.value)} placeholder="Overs Bowled" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: Number(simNrr) >= 0 ? "#34d399" : "#fb7185" }}>
                Simulated NRR: {Number(simNrr) >= 0 ? "+" : ""}{simNrr}
              </div>
            </div>
          </div>
        )}

        {utilTab === "shuffle" && (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                type="button"
                className="il-btn il-btn-gold"
                style={{ flex: 1, fontSize: 12 }}
                onClick={() => {
                  const arr = [...players.map((p) => p.name)];
                  for (let i = arr.length - 1; i > 0; i -= 1) {
                    const j = Math.floor(Math.random() * (i + 1));
                    const tmp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = tmp;
                  }
                  setShuffledOrder(arr);
                }}
              >
                <Shuffle size={14} /> Shuffle Batting / Bowling Order
              </button>
              <button
                type="button"
                className="il-btn il-btn-purple"
                style={{ fontSize: 12 }}
                onClick={() => {
                  const a = ["Indore Royals", "Malwa Strikers", "Khandwa Kings", "Rajwada Rebels", "Turf Chargers"];
                  const b = ["Legends XI", "Holkar Hurricanes", "Indore Blasters", "MP Mavericks", "Night Riders"];
                  setGenTeamPair(a[Math.floor(Math.random() * a.length)] + " vs " + b[Math.floor(Math.random() * b.length)]);
                }}
              >
                🎲 Team Names
              </button>
            </div>
            <div style={{ padding: 8, borderRadius: 10, background: "rgba(167,139,250,0.16)", fontSize: 12, fontWeight: 800, color: "#ddd6fe", textAlign: "center" }}>
              Matchup Idea: {genTeamPair}
            </div>
            <div style={{ display: "grid", gap: 4, maxHeight: 200, overflowY: "auto" }}>
              {shuffledOrder.map((nm, idx) => (
                <div key={nm + idx} style={{ padding: "5px 9px", borderRadius: 8, background: "rgba(2,6,23,0.75)", fontSize: 12 }}>
                  <strong style={{ color: "#fbbf24" }}>#{idx + 1}</strong> {nm}
                </div>
              ))}
            </div>
          </div>
        )}

        {utilTab === "quiz" && (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 900, fontSize: 14, color: "#fde68a" }}>{qObj.q}</div>
            <div style={{ display: "grid", gap: 6 }}>
              {qObj.opts.map((opt, idx) => {
                const picked = quizPick === idx;
                const isRight = idx === qObj.ans;
                const bg =
                  quizPick === null
                    ? undefined
                    : isRight
                    ? "rgba(16,185,129,0.28)"
                    : picked
                    ? "rgba(225,29,72,0.28)"
                    : undefined;
                return (
                  <button
                    key={opt}
                    type="button"
                    className="il-btn"
                    style={{ justifyContent: "flex-start", background: bg }}
                    onClick={() => setQuizPick(idx)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="il-btn il-btn-primary"
              onClick={() => {
                setQuizIdx((i) => (i + 1) % DAILY_CRICKET_QUIZ.length);
                setQuizPick(null);
              }}
            >
              Next Question →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SmartTvScoreboardModal({
  lm,
  clubName,
  crr,
  rrr,
  onClose,
}: {
  lm: LiveMatch;
  clubName: string;
  crr: string;
  rrr: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 155,
        background: "radial-gradient(circle at top, #172554 0%, #030714 75%)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="il-pill" style={{ background: "rgba(251,191,36,0.25)", color: "#fbbf24", fontSize: 13 }}>
          📺 {clubName} • BIG-SCREEN BROADCAST MODE
        </span>
        <button type="button" className="il-btn il-btn-danger" onClick={onClose}>
          <X size={16} /> Exit TV Mode
        </button>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#7dd3fc", letterSpacing: "0.06em" }}>
          {lm.battingTeam.toUpperCase()} vs {lm.bowlingTeam.toUpperCase()}
        </div>
        <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.05, color: "#ffffff", margin: "12px 0" }}>
          {lm.runs}/{lm.wickets}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#fbbf24" }}>
          OVERS: {formatOvers(lm.balls)} / {lm.totalOvers} • CRR {crr}
          {lm.innings === 2 && lm.target !== null ? " • TARGET " + lm.target + " (RRR " + rrr + ")" : ""}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", marginTop: 22, fontSize: 20 }}>
          <div style={{ background: "rgba(2,6,23,0.8)", padding: "12px 18px", borderRadius: 14, border: "2px solid #fbbf24" }}>
            <strong>{lm.striker}*</strong>: {lm.batters[lm.striker]?.runs ?? 0} ({lm.batters[lm.striker]?.balls ?? 0})
          </div>
          <div style={{ background: "rgba(2,6,23,0.8)", padding: "12px 18px", borderRadius: 14, border: "1px solid var(--border)" }}>
            <strong>{lm.nonStriker}</strong>: {lm.batters[lm.nonStriker]?.runs ?? 0} ({lm.batters[lm.nonStriker]?.balls ?? 0})
          </div>
          <div style={{ background: "rgba(2,6,23,0.8)", padding: "12px 18px", borderRadius: 14, border: "1px solid #38bdf8" }}>
            <strong>{lm.bowler}</strong>: {lm.bowlers[lm.bowler]?.wickets ?? 0}/{lm.bowlers[lm.bowler]?.runs ?? 0} ({formatOvers(lm.bowlers[lm.bowler]?.balls ?? 0)})
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
        {lm.title} • {lm.tossInfo}
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
  const [caughtBy, setCaughtBy] = useState<string>("");
  const [showFullScorecard, setShowFullScorecard] = useState<boolean>(false);
  const [scorecardInnTab, setScorecardInnTab] = useState<1 | 2>(1);
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

  const [leaderTab, setLeaderTab] = useState<"mvp" | "batting" | "bowling" | "economy" | "iq" | "auction">("mvp");
  const [selectedShotZone, setSelectedShotZone] = useState<"Off-Side" | "Leg-Side" | "Straight" | "Loft 360">("Straight");
  const [squadSearch, setSquadSearch] = useState<string>("");
  const [squadRoleFilter, setSquadRoleFilter] = useState<string>("ALL");
  const [squadSortBy, setSquadSortBy] = useState<"mvp" | "runs" | "wickets" | "jersey" | "name">("mvp");
  const [treasuryFilter, setTreasuryFilter] = useState<"ALL" | LedgerType>("ALL");
  const [chatSearch, setChatSearch] = useState<string>("");
  const [chatReplyTo, setChatReplyTo] = useState<{ sender: string; text: string } | null>(null);
  const [chatMicActive, setChatMicActive] = useState<boolean>(false);
  const [quickTossResult, setQuickTossResult] = useState<string>("");
  const [showDlsCalc, setShowDlsCalc] = useState<boolean>(false);
  const [scorecardTemplate, setScorecardTemplate] = useState<ScorecardTemplateKey>("broadcast");
  const [previewMaintenance, setPreviewMaintenance] = useState<boolean>(false);
  const [showTurfUtilsModal, setShowTurfUtilsModal] = useState<boolean>(false);
  const [showSmartTvMode, setShowSmartTvMode] = useState<boolean>(false);
  const [showCommentaryDrawer, setShowCommentaryDrawer] = useState<boolean>(false);
  const [chatFilterMode, setChatFilterMode] = useState<"all" | "mentions" | "scores">("all");
  const [leaderRoleFilter, setLeaderRoleFilter] = useState<string>("ALL");
  const [maintMsgDraft, setMaintMsgDraft] = useState<string>("");
  const [maintTimeDraft, setMaintTimeDraft] = useState<string>(DEFAULT_LAUNCH_TIME);
  const [partialPayAmounts, setPartialPayAmounts] = useState<Record<string, string>>({});
  const [showDjModal, setShowDjModal] = useState<boolean>(false);
  const [djActiveUrl, setDjActiveUrl] = useState<string>("");
  const [djActiveLabel, setDjActiveLabel] = useState<string>("");
  const [posterConfig, setPosterConfig] = useState<PosterConfig | null>(null);
  const [showFaceOffModal, setShowFaceOffModal] = useState<boolean>(false);
  const [showBroadcastCharts, setShowBroadcastCharts] = useState<boolean>(false);
  const [wizTurfRules, setWizTurfRules] = useState<TurfRules>({ ...DEFAULT_TURF_RULES });
  const [predWinner, setPredWinner] = useState<string>("");
  const [predBatter, setPredBatter] = useState<string>("");
  const [predBowler, setPredBowler] = useState<string>("");
  const [showSeriesCreator, setShowSeriesCreator] = useState<boolean>(false);
  const [seriesNameDraft, setSeriesNameDraft] = useState<string>("Indore Turf Cup");
  const [seriesModeDraft, setSeriesModeDraft] = useState<"series" | "cup">("series");
  const [seriesTeam3Draft, setSeriesTeam3Draft] = useState<string>("Indore Royals");
  const [updateReady, setUpdateReady] = useState<boolean>(false);
  const [auctionLiveActive, setAuctionLiveActive] = useState<boolean>(false);
  const [showFireworksOverlay, setShowFireworksOverlay] = useState<boolean>(false);
  const launchTriggeredRef = useRef<boolean>(false);
  const isIdleForAutoReloadRef = useRef<boolean>(true);

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
    maintenanceMessage: s?.maintenanceMessage || "",
    maintenanceTargetTime: s?.maintenanceTargetTime || DEFAULT_LAUNCH_TIME,
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
      djPlaylistUrl: cloudWs.djPlaylistUrl ?? prevWs.djPlaylistUrl ?? "",
      chatPinnedMessage: cloudWs.chatPinnedMessage ?? prevWs.chatPinnedMessage ?? "",
      pitchCondition: cloudWs.pitchCondition ?? prevWs.pitchCondition ?? "Dry Turf • Fast Outfield",
      chatReactions: cloudWs.chatReactions || prevWs.chatReactions || {},
      rivalries: cloudWs.rivalries || prevWs.rivalries || {},
      predictions: Array.isArray(cloudWs.predictions) ? cloudWs.predictions : prevWs.predictions || [],
      predictionPoints: cloudWs.predictionPoints || prevWs.predictionPoints || {},
      records: cloudWs.records || prevWs.records || {},
      seriesCup: "seriesCup" in cloudWs ? (cloudWs.seriesCup ?? null) : (prevWs.seriesCup ?? null),
      auction: (() => {
        const cloudAuc = "auction" in cloudWs ? (cloudWs.auction ?? null) : undefined;
        const prevAuc = prevWs.auction ?? null;
        if (cloudAuc === undefined) return prevAuc;
        if (!cloudAuc && !prevAuc) return null;
        if (cloudAuc && prevAuc) {
          return (cloudAuc.updatedAtMs || 0) >= (prevAuc.updatedAtMs || 0) ? cloudAuc : prevAuc;
        }
        return cloudAuc || prevAuc;
      })(),
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
      maintenanceMessage:
        typeof cloudData.maintenanceMessage === "string"
          ? cloudData.maintenanceMessage
          : (prev.maintenanceMessage || ""),
      maintenanceTargetTime:
        typeof cloudData.maintenanceTargetTime === "string"
          ? cloudData.maintenanceTargetTime
          : (prev.maintenanceTargetTime || DEFAULT_LAUNCH_TIME),
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

  useEffect(() => {
    const iso = state.maintenanceTargetTime || DEFAULT_LAUNCH_TIME;
    const targetMs = Number.isNaN(new Date(iso).getTime())
      ? new Date(DEFAULT_LAUNCH_TIME).getTime()
      : new Date(iso).getTime();
    if (nowMs >= targetMs && nowMs - targetMs < 15000 && !launchTriggeredRef.current) {
      launchTriggeredRef.current = true;
      setShowFireworksOverlay(true);
      playStadiumSfx("fireworks");
      speakAuctionVoice("Launch time! Indore Legends is officially live! Let the fireworks begin!", true);
    }
  }, [nowMs, state.maintenanceTargetTime]);

  const ws = state.workspaces[workspace];

  useEffect(() => {
    isIdleForAutoReloadRef.current = !ws.liveMatch && !auctionLiveActive;
  }, [ws.liveMatch, auctionLiveActive]);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    let refreshing = false;
    let wasControlled = Boolean(navigator.serviceWorker.controller);

    const triggerSafeReload = () => {
      if (refreshing) return;
      if (isIdleForAutoReloadRef.current) {
        refreshing = true;
        window.location.reload();
      } else {
        setUpdateReady(true);
      }
    };

    const onControllerChange = () => {
      if (wasControlled) {
        triggerSafeReload();
      } else {
        wasControlled = true;
      }
    };

    const onSwMessage = (ev: MessageEvent) => {
      if (ev.data && ev.data.type === "SW_UPDATED") {
        triggerSafeReload();
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    navigator.serviceWorker.addEventListener("message", onSwMessage);

    const checkUpdate = () => {
      if (navigator.onLine === false) return;
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          if (!reg) return;
          if (reg.waiting) {
            if (isIdleForAutoReloadRef.current) {
              reg.waiting.postMessage({ type: "SKIP_WAITING" });
            } else {
              setUpdateReady(true);
            }
          }
          void reg.update();
        })
        .catch(() => {});
    };

    checkUpdate();
    const interval = window.setInterval(checkUpdate, 5 * 60 * 1000);
    const onVis = () => {
      if (document.visibilityState === "visible") checkUpdate();
    };
    window.addEventListener("focus", checkUpdate);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.clearInterval(interval);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      navigator.serviceWorker.removeEventListener("message", onSwMessage);
      window.removeEventListener("focus", checkUpdate);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
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
    if (PERMANENT_ADMIN_IDS.includes(playerId) && !isSpinOwner) return;
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

  const resetStatsAndChatOnly = () => {
    const clearTime = Date.now();
    const zeroStats = (list: Player[]): Player[] =>
      list.map((pl) => ({
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
        funAward: "Squad Member",
        badgeRarity: "Common",
      }));

    setState((prev) => ({
      ...prev,
      workspaces: {
        il: {
          ...prev.workspaces.il,
          players: zeroStats(prev.workspaces.il.players),
          liveMatch: null,
          scheduledMatch: null,
          matchHistory: [],
          messages: [],
          chatClearedAtMs: clearTime,
        },
        gm: {
          ...prev.workspaces.gm,
          players: zeroStats(prev.workspaces.gm.players),
          liveMatch: null,
          scheduledMatch: null,
          matchHistory: [],
          messages: [],
          chatClearedAtMs: clearTime,
        },
      },
    }));
    setCloudMessages([]);
    setSettingsSavedMsg(
      "Player stats, matches, and chat cleared! Monthly Admin, Spin Wheel info, and permanent admins preserved."
    );
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

  const activeLaunchIso = state.maintenanceTargetTime || DEFAULT_LAUNCH_TIME;
  const launchTargetMs = Number.isNaN(new Date(activeLaunchIso).getTime())
    ? new Date(DEFAULT_LAUNCH_TIME).getTime()
    : new Date(activeLaunchIso).getTime();
  const launchDiffMs = Math.max(0, launchTargetMs - nowMs);
  const isFinalHourMode = launchDiffMs > 0 && launchDiffMs <= 60 * 60 * 1000;
  const countdownTargetMs = launchDiffMs > 0
    ? launchTargetMs
    : ws.scheduledMatch && ws.scheduledMatch.dateTime
    ? Math.max(nowMs, new Date(ws.scheduledMatch.dateTime).getTime())
    : launchTargetMs;
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
    if (!editingPlayer || !isSpinOwner) return;
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
      const finalIsAdmin = PERMANENT_ADMIN_IDS.includes(edited.id)
        ? true
        : prevPlayer?.isAdmin && !edited.isAdmin && ilAdminsCount <= 1
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
    if (!isSpinOwner || !addName.trim()) return;
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
    if (!isSpinOwner) return;
    if (PERMANENT_ADMIN_IDS.includes(playerId)) return;
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
      turfRules: { ...wizTurfRules },
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
      turfRules: sch.turfRules || { ...DEFAULT_TURF_RULES },
      bonusOverActive: false,
      fow: [],
      firstInningsFow: [],
      partnerships: [],
      firstInningsPartnerships: [],
    };

    updateWorkspace((prevWs) => ({ ...prevWs, liveMatch: live }));
    setLastOverBowler("");
    setShowNextBowlerModal(false);
    setUmpireBanner("PLAY! Innings 1 underway.");
    speak("Match started!");
  };

  const getCombinedMatchStats = (m: LiveMatch) => {
    const allBatters: Record<string, InningsBatterStat> = {};
    const addBat = (rec?: Record<string, InningsBatterStat>) => {
      if (!rec) return;
      Object.values(rec).forEach((b) => {
        const cur = allBatters[b.name];
        if (!cur) {
          allBatters[b.name] = { ...b };
        } else {
          allBatters[b.name] = {
            ...cur,
            runs: cur.runs + b.runs,
            balls: cur.balls + b.balls,
            fours: cur.fours + b.fours,
            sixes: cur.sixes + b.sixes,
            out: cur.out || b.out,
            dismissal: b.dismissal || cur.dismissal,
          };
        }
      });
    };
    addBat(m.firstInningsBatters);
    addBat(m.batters);

    const allBowlers: Record<string, InningsBowlerStat> = {};
    const addBowl = (rec?: Record<string, InningsBowlerStat>) => {
      if (!rec) return;
      Object.values(rec).forEach((bw) => {
        const cur = allBowlers[bw.name];
        if (!cur) {
          allBowlers[bw.name] = { ...bw };
        } else {
          allBowlers[bw.name] = {
            ...cur,
            balls: cur.balls + bw.balls,
            runs: cur.runs + bw.runs,
            wickets: cur.wickets + bw.wickets,
            dotBalls: (cur.dotBalls || 0) + (bw.dotBalls || 0),
            duckWickets: (cur.duckWickets || 0) + (bw.duckWickets || 0),
          };
        }
      });
    };
    addBowl(m.firstInningsBowlers);
    addBowl(m.bowlers);

    return { allBatters, allBowlers };
  };

  const getLiveMvpRanking = (m: LiveMatch): { name: string; pts: number }[] => {
    const { allBatters, allBowlers } = getCombinedMatchStats(m);
    const points: Record<string, number> = {};
    Object.values(allBatters).forEach((b) => {
      points[b.name] = (points[b.name] || 0) + b.runs + b.fours * 2 + b.sixes * 4;
    });
    Object.values(allBowlers).forEach((bw) => {
      const ducks = bw.duckWickets || 0;
      const normalWkts = Math.max(0, bw.wickets - ducks);
      points[bw.name] = (points[bw.name] || 0) + normalWkts * 25 + ducks * 40;
    });
    Object.entries(m.catches || {}).forEach(([fielder, count]) => {
      points[fielder] = (points[fielder] || 0) + count * 15;
    });
    return Object.entries(points)
      .map(([name, pts]) => ({ name, pts }))
      .filter((x) => x.pts > 0)
      .sort((a, b) => b.pts - a.pts);
  };

  const computeLiveMvp = (m: LiveMatch): string => {
    const top = getLiveMvpRanking(m)[0];
    return top ? top.name + " (" + top.pts + " MVP pts)" : "TBD";
  };

  const buildReelCaption = (h: CompletedMatch): string => {
    return (
      "🔥 " +
      h.title +
      " — " +
      ws.clubName +
      "! 🏏\n" +
      "🏆 " +
      h.winner +
      "\n" +
      "📊 " +
      h.summary +
      "\n" +
      "⭐ Man of the Match: " +
      h.mvp +
      "\n\n#IndoreLegends #TurfCricket #IndoreCricket #CricketHighlights #CrickRush"
    );
  };

  const buildWhatsappScorecard = (m: LiveMatch): string => {
    const { allBatters, allBowlers } = getCombinedMatchStats(m);
    const topBat = Object.values(allBatters)
      .filter((b) => b.balls > 0 || b.out)
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 5)
      .map(
        (b) =>
          "- " + b.name + ": " + b.runs + "(" + b.balls + ") [4s:" + b.fours + ", 6s:" + b.sixes + "]"
      )
      .join("\n");

    const topBowl = Object.values(allBowlers)
      .filter((b) => b.balls > 0)
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 4)
      .map((b) => "- " + b.name + ": " + b.wickets + "/" + b.runs + " (" + formatOvers(b.balls) + " ov)")
      .join("\n");

    const firstInn =
      m.firstInningsScore !== null
        ? "1st Innings: " + m.bowlingTeam + " " + m.firstInningsScore + "/" + (m.firstInningsWickets ?? 0) + "\n"
        : "";

    const fowSummary =
      (m.fow || []).length > 0
        ? "\n\nFall of Wickets: " +
          (m.fow || []).map((f) => f.wicketNo + "-" + f.runs + " (" + f.batter.split(" ")[0] + ", " + f.overs + ")").join(", ")
        : "";
    const partSummary =
      (m.partnerships || []).length > 0
        ? "\nTop Partnership: " +
          [...(m.partnerships || [])].sort((a, b) => b.runs - a.runs)[0].runs +
          " (" +
          [...(m.partnerships || [])].sort((a, b) => b.runs - a.runs)[0].batters +
          ")"
        : "";
    const ext = computeInningsExtras(m.history, m.innings);
    const tp = detectTurningPointOver(m.history, m.innings);
    const tpLine = tp ? "\nTurning Point: Over " + tp.overNo + " (" + tp.runs + " runs, " + tp.wickets + " wkt)" : "";

    if (scorecardTemplate === "mini") {
      return (
        "🏏 " +
        ws.clubName +
        " • " +
        m.title +
        "\n" +
        m.battingTeam +
        ": " +
        m.runs +
        "/" +
        m.wickets +
        " (" +
        formatOvers(m.balls) +
        "/" +
        m.totalOvers +
        " ov)" +
        (m.firstInningsScore !== null
          ? " | 1st Inn: " + m.bowlingTeam + " " + m.firstInningsScore + "/" + (m.firstInningsWickets ?? 0)
          : "") +
        "\n" +
        (m.resultText ? "🏆 " + m.resultText + "\n" : "") +
        "⭐ MVP: " +
        computeLiveMvp(m)
      );
    }

    if (scorecardTemplate === "reel") {
      return (
        "🔥 " +
        m.title.toUpperCase() +
        " — " +
        ws.clubName +
        "! 🏏\n" +
        "📊 " +
        m.battingTeam +
        " " +
        m.runs +
        "/" +
        m.wickets +
        " (" +
        formatOvers(m.balls) +
        " ov)" +
        (m.firstInningsScore !== null
          ? " vs " + m.bowlingTeam + " " + m.firstInningsScore + "/" + (m.firstInningsWickets ?? 0)
          : "") +
        "\n" +
        (m.resultText ? "🏆 " + m.resultText + "\n" : "") +
        "⭐ MVP: " +
        computeLiveMvp(m) +
        tpLine +
        "\n\n#IndoreLegends #CrickRush #TurfCricket #IndoreCricket"
      );
    }

    if (scorecardTemplate === "table") {
      return (
        "=== " +
        ws.clubName +
        " MATCH SHEET ===\n" +
        "Match: " +
        m.title +
        " | Overs: " +
        m.totalOvers +
        "\nScore: " +
        m.battingTeam +
        " " +
        m.runs +
        "/" +
        m.wickets +
        " (" +
        formatOvers(m.balls) +
        " ov)\n--- BATTING ---\n" +
        (topBat || "None") +
        "\n--- BOWLING ---\n" +
        (topBowl || "None") +
        "\nMVP: " +
        computeLiveMvp(m)
      );
    }

    return (
      ws.clubName +
      " BROADCAST SCORECARD V2\n" +
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
      (topBowl || "None yet") +
      "\nExtras: " +
      ext.total +
      " (WD:" +
      ext.wides +
      ", NB:" +
      ext.noBalls +
      ")" +
      fowSummary +
      partSummary +
      tpLine
    );
  };

  const recordLiveBall = (
    runsScored: number,
    options?: { isWide?: boolean; isNoBall?: boolean; isWicket?: boolean; isBye?: boolean }
  ) => {
    const m = ws.liveMatch;
    if (!m || m.isCompleted || showNextBowlerModal) return;

    const rules = m.turfRules || DEFAULT_TURF_RULES;
    const maxBalls = m.totalOvers * 6;
    const maxWickets = rules.lastManStanding
      ? Math.max(1, m.battingPlayers.length)
      : Math.max(1, m.battingPlayers.length - 1);
    if (m.balls >= maxBalls || m.wickets >= maxWickets) {
      setUmpireBanner(
        m.innings === 1
          ? "INNINGS 1 COMPLETE! Tap Start 2nd Innings."
          : "MATCH COMPLETE! Tap Finish and Save."
      );
      return;
    }

    const isWide = Boolean(options?.isWide);
    const isNoBall = Boolean(options?.isNoBall);
    const isWicket = Boolean(options?.isWicket);
    const isBye = Boolean(options?.isBye);

    if (isWicket && m.freeHitActive && wicketType !== "Run Out") {
      setUmpireBanner("FREE HIT! Only Run Out allowed!");
      speak("Not out! Free Hit!");
      return;
    }

    const activeCatcher =
      isWicket && wicketType === "Caught"
        ? caughtBy || m.bowlingPlayers[0] || m.bowler
        : undefined;

    const isLegal = rules.wideNbRunsOnly ? true : !isWide && !isNoBall;
    const extraRun = isWide || isNoBall ? 1 : 0;
    const bonusMult = m.bonusOverActive && !isWicket ? 2 : 1;
    const effectiveRunsScored = runsScored * bonusMult;
    const totalBallRuns = effectiveRunsScored + extraRun;

    const nextRuns = m.runs + totalBallRuns;
    const nextWickets = isWicket ? Math.min(maxWickets, m.wickets + 1) : m.wickets;
    const nextBalls = isLegal ? Math.min(maxBalls, m.balls + 1) : m.balls;
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
    const batterRunsAdded = isWide || isBye ? 0 : effectiveRunsScored;
    const newBatterRuns = prevStriker.runs + batterRunsAdded;
    const isDuckWicket = isWicket && wicketType !== "Run Out" && newBatterRuns === 0;

    const dismissalLabel = isWicket
      ? wicketType === "Caught" && activeCatcher
        ? "c " + activeCatcher + " b " + m.bowler
        : wicketType === "Run Out"
        ? "Run Out"
        : wicketType + " b " + m.bowler
      : prevStriker.dismissal;

    updatedBatters[m.striker] = {
      ...prevStriker,
      runs: newBatterRuns,
      balls: isLegal ? prevStriker.balls + 1 : prevStriker.balls,
      fours: !isWide && !isBye && runsScored === 4 ? prevStriker.fours + 1 : prevStriker.fours,
      sixes: !isWide && !isBye && runsScored === 6 ? prevStriker.sixes + 1 : prevStriker.sixes,
      out: isWicket ? true : prevStriker.out,
      dismissal: dismissalLabel,
    };

    const updatedBowlers = { ...m.bowlers };
    const prevBowler = updatedBowlers[m.bowler] || {
      name: m.bowler,
      balls: 0,
      runs: 0,
      wickets: 0,
      duckWickets: 0,
    };
    const newBowlerWickets =
      isWicket && wicketType !== "Run Out" ? prevBowler.wickets + 1 : prevBowler.wickets;
    const isDotBall = isLegal && !isWicket && runsScored === 0;
    const newBowlerDots = isDotBall
      ? (prevBowler.dotBalls || 0) + 1
      : prevBowler.dotBalls || 0;
    const newBowlerDucks = isDuckWicket
      ? (prevBowler.duckWickets || 0) + 1
      : prevBowler.duckWickets || 0;

    updatedBowlers[m.bowler] = {
      ...prevBowler,
      balls: isLegal ? prevBowler.balls + 1 : prevBowler.balls,
      runs: prevBowler.runs + totalBallRuns,
      wickets: newBowlerWickets,
      dotBalls: newBowlerDots,
      duckWickets: newBowlerDucks,
    };

    const updatedCatches = { ...(m.catches || {}) };
    if (activeCatcher) {
      updatedCatches[activeCatcher] = (updatedCatches[activeCatcher] || 0) + 1;
    }

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
      caughtBy: activeCatcher,
      isDuckWicket,
      batsman: m.striker,
      bowler: m.bowler,
      timestamp: nowTime(),
      shotZone: !isWide && !isBye && !isWicket && runsScored >= 4 ? selectedShotZone : undefined,
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
      } else if (isDuckWicket) {
        triggerCelebration({
          kind: "duck",
          badgeText: "DUCK!",
          title: "DUCK OUT! (+40 MVP)",
          subtitle:
            m.striker +
            " out for 0! " +
            dismissalLabel +
            (activeCatcher ? " • " + activeCatcher + " +15 MVP" : ""),
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
          title: wicketType === "Run Out" ? "RUN OUT!" : "WICKET!",
          subtitle:
            m.striker +
            " — " +
            dismissalLabel +
            (activeCatcher ? " (+15 MVP catch)" : ""),
        });
      }
    } else if (!isWide && runsScored === 6) {
      triggerCelebration({
        kind: "six",
        badgeText: "6",
        title: "MAXIMUM SIX!",
        subtitle: m.striker + " launches it over the ropes!",
      });
    } else if (!isWide && runsScored === 4) {
      triggerCelebration({
        kind: "four",
        badgeText: "4",
        title: "CRACKING FOUR!",
        subtitle: m.striker + " drills it to the boundary!",
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
        triggerCelebration({
          kind: "win",
          badgeText: "WIN!",
          title: m.battingTeam.toUpperCase() + " WIN!",
          subtitle: resultText,
        });
      } else if (nextRuns === m.target - 1) {
        isTied = true;
        resultText = "MATCH TIED! Ready for Super Over!";
      } else {
        const margin = m.target - 1 - nextRuns;
        resultText = m.bowlingTeam + " won by " + margin + " run(s)!";
        triggerCelebration({
          kind: "win",
          badgeText: "WIN!",
          title: m.bowlingTeam.toUpperCase() + " WIN!",
          subtitle: resultText,
        });
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
      if (voiceOutput) playStadiumSfx(isDuckWicket ? "duck" : "stump");
    } else if (runsScored === 6) {
      setUmpireBanner(m.bonusOverActive ? "2X BONUS SIX (+12)!" : "MAXIMUM SIX!");
      speak("Six runs!");
      if (voiceOutput) playStadiumSfx("trumpet");
    } else if (runsScored === 4) {
      setUmpireBanner(m.bonusOverActive ? "2X BONUS FOUR (+8)!" : "CRACKING FOUR!");
      speak("Four runs!");
      if (voiceOutput) playStadiumSfx("roar");
    } else if (overJustCompleted && !inningsEnded) {
      setUmpireBanner("END OF OVER " + Math.floor(nextBalls / 6) + "! Select next bowler.");
      speak("Over complete! Choose the next bowler.");
    }

    const nextFow = isWicket
      ? [
          ...(m.fow || []),
          {
            wicketNo: nextWickets,
            runs: nextRuns,
            overs: formatOvers(nextBalls),
            batter: m.striker,
            dismissal: dismissalLabel,
          },
        ]
      : m.fow || [];

    const nextPartnerships = isWicket
      ? [
          ...(m.partnerships || []),
          {
            wicketNo: nextWickets,
            runs: (m.partnershipRuns || 0) + totalBallRuns,
            balls: (m.partnershipBalls || 0) + (isLegal ? 1 : 0),
            batters: m.striker.split(" ")[0] + " & " + m.nonStriker.split(" ")[0],
          },
        ]
      : m.partnerships || [];

    const rivalryKey = m.striker + "__vs__" + m.bowler;

    updateWorkspace((prevWs) => {
      const prevRivs = prevWs.rivalries || {};
      const curRiv = prevRivs[rivalryKey] || { runs: 0, balls: 0, fours: 0, sixes: 0, outs: 0 };
      const updatedRivalries: Record<string, RivalryStat> = {
        ...prevRivs,
        [rivalryKey]: {
          runs: curRiv.runs + batterRunsAdded,
          balls: curRiv.balls + (isLegal ? 1 : 0),
          fours: curRiv.fours + (!isWide && !isBye && runsScored === 4 ? 1 : 0),
          sixes: curRiv.sixes + (!isWide && !isBye && runsScored === 6 ? 1 : 0),
          outs: curRiv.outs + (isWicket && wicketType !== "Run Out" ? 1 : 0),
        },
      };
      return {
        ...prevWs,
        rivalries: updatedRivalries,
        liveMatch: {
          ...m,
          runs: nextRuns,
          wickets: nextWickets,
          balls: nextBalls,
          striker: nextStriker,
          nonStriker: nextNonStriker,
          freeHitActive: nextFreeHit,
          bonusOverActive: overJustCompleted ? false : m.bonusOverActive,
          isCompleted,
          isTied,
          resultText,
          batters: updatedBatters,
          bowlers: updatedBowlers,
          catches: updatedCatches,
          fow: nextFow,
          partnerships: nextPartnerships,
          partnershipRuns: isWicket ? 0 : (m.partnershipRuns || 0) + totalBallRuns,
          partnershipBalls: isWicket ? 0 : (m.partnershipBalls || 0) + (isLegal ? 1 : 0),
          history: nextHistory,
        },
      };
    });

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
        firstInningsBatters: { ...m.batters },
        firstInningsBowlers: { ...m.bowlers },
        firstInningsFow: [...(m.fow || [])],
        firstInningsPartnerships: [...(m.partnerships || [])],
        fow: [],
        partnerships: [],
        bonusOverActive: false,
        target: m.runs + 1,
        runs: 0,
        wickets: 0,
        balls: 0,
        partnershipRuns: 0,
        partnershipBalls: 0,
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
        dotBalls:
          wasLegal && !last.isWicket && last.runs === 0
            ? Math.max(0, (bw.dotBalls || 0) - 1)
            : bw.dotBalls || 0,
        duckWickets: last.isDuckWicket
          ? Math.max(0, (bw.duckWickets || 0) - 1)
          : bw.duckWickets || 0,
      };
    }

    const updatedCatches = { ...(m.catches || {}) };
    if (last.caughtBy && updatedCatches[last.caughtBy]) {
      updatedCatches[last.caughtBy] = Math.max(0, updatedCatches[last.caughtBy] - 1);
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
        catches: updatedCatches,
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

    const { allBatters, allBowlers } = getCombinedMatchStats(m);
    const matchPlayerStats: Record<string, MatchPlayerDelta> = {};
    ws.players.forEach((pl) => {
      const bat = allBatters[pl.name];
      const bowl = allBowlers[pl.name];
      const participated = m.teamAPlayers.includes(pl.name) || m.teamBPlayers.includes(pl.name);
      if (!participated) return;
      const ducks = bowl ? bowl.duckWickets || 0 : 0;
      const normalWkts = bowl ? Math.max(0, bowl.wickets - ducks) : 0;
      const catchCount = (m.catches && m.catches[pl.name]) || 0;
      const earnedMvp =
        (bat ? bat.runs + bat.fours * 2 + bat.sixes * 4 : 0) +
        normalWkts * 25 +
        ducks * 40 +
        catchCount * 15;
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

    const topScorerObj = Object.values(allBatters).sort((a, b) => b.runs - a.runs)[0];
    const topBowlerObj = Object.values(allBowlers).sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];
    const winningTeamName =
      m.isTied
        ? ""
        : m.resultText.startsWith(m.battingTeam)
        ? m.battingTeam
        : m.resultText.startsWith(m.bowlingTeam)
        ? m.bowlingTeam
        : "";

    updateWorkspace((prevWs) => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const updatedPlayers = prevWs.players.map((pl) => {
        const delta = matchPlayerStats[pl.name];
        if (!delta) return pl;
        const bowlRec = allBowlers[pl.name];
        const ducksNow = bowlRec ? bowlRec.duckWickets || 0 : 0;
        const prevBestW = pl.bestBowlWkts || 0;
        const prevBestR = pl.bestBowlRuns ?? 999;
        const isBetterBowl =
          delta.wickets > prevBestW ||
          (delta.wickets === prevBestW && delta.wickets > 0 && delta.runsConceded < prevBestR);
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
          highestScore: Math.max(pl.highestScore || 0, delta.runs),
          bestBowlWkts: isBetterBowl ? delta.wickets : prevBestW,
          bestBowlRuns: isBetterBowl ? delta.runsConceded : pl.bestBowlRuns,
          fifties: (pl.fifties || 0) + (delta.runs >= 50 && delta.runs < 100 ? 1 : 0),
          hundreds: (pl.hundreds || 0) + (delta.runs >= 100 ? 1 : 0),
          duckWicketsTotal: (pl.duckWicketsTotal || 0) + ducksNow,
          recentForm: [
            { runs: delta.runs, wickets: delta.wickets, date: todayStr },
            ...(pl.recentForm || []),
          ].slice(0, 5),
        };
      });

      const nextRecords: ClubRecords = { ...(prevWs.records || {}) };
      if (topScorerObj && topScorerObj.runs > (nextRecords.highestScore?.value || 0)) {
        nextRecords.highestScore = {
          player: topScorerObj.name,
          value: topScorerObj.runs,
          detail: topScorerObj.runs + "(" + topScorerObj.balls + ") vs " + m.title,
        };
      }
      const mostSixesObj = Object.values(allBatters).sort((a, b) => b.sixes - a.sixes)[0];
      if (mostSixesObj && mostSixesObj.sixes > (nextRecords.mostSixesInnings?.value || 0)) {
        nextRecords.mostSixesInnings = {
          player: mostSixesObj.name,
          value: mostSixesObj.sixes,
          detail: mostSixesObj.sixes + " Sixes in " + m.title,
        };
      }
      if (
        topBowlerObj &&
        topBowlerObj.wickets > 0 &&
        (topBowlerObj.wickets > (nextRecords.bestBowling?.wickets || 0) ||
          (topBowlerObj.wickets === (nextRecords.bestBowling?.wickets || 0) &&
            topBowlerObj.runs < (nextRecords.bestBowling?.runs ?? 999)))
      ) {
        nextRecords.bestBowling = {
          player: topBowlerObj.name,
          wickets: topBowlerObj.wickets,
          runs: topBowlerObj.runs,
          detail: topBowlerObj.wickets + "/" + topBowlerObj.runs + " (" + formatOvers(topBowlerObj.balls) + " ov)",
        };
      }
      const innTotals = [
        { team: m.battingTeam, runs: m.runs, wickets: m.wickets },
        ...(m.firstInningsScore !== null
          ? [{ team: m.bowlingTeam, runs: m.firstInningsScore, wickets: m.firstInningsWickets ?? 0 }]
          : []),
      ];
      innTotals.forEach((it) => {
        if (it.runs > (nextRecords.highestTeamTotal?.runs || 0)) {
          nextRecords.highestTeamTotal = {
            team: it.team,
            runs: it.runs,
            wickets: it.wickets,
            detail: it.team + " " + it.runs + "/" + it.wickets + " (" + m.title + ")",
          };
        }
      });
      if (winningTeamName && (!nextRecords.biggestWin || m.resultText)) {
        nextRecords.biggestWin = {
          team: winningTeamName,
          detail: m.resultText,
        };
      }

      const nextPredPoints = { ...(prevWs.predictionPoints || {}) };
      (prevWs.predictions || []).forEach((pr) => {
        let earned = 0;
        if (winningTeamName && pr.winnerTeam === winningTeamName) earned += 20;
        if (topScorerObj && topScorerObj.runs > 0 && pr.topScorer === topScorerObj.name) earned += 15;
        if (topBowlerObj && topBowlerObj.wickets > 0 && pr.topBowler === topBowlerObj.name) earned += 15;
        if (earned > 0) {
          nextPredPoints[pr.playerName] = (nextPredPoints[pr.playerName] || 0) + earned;
        }
      });

      let nextSeries = prevWs.seriesCup || null;
      if (nextSeries && m.firstInningsScore !== null) {
        const st = { ...nextSeries.standings };
        const t1 = m.bowlingTeam;
        const t2 = m.battingTeam;
        if (st[t1] && st[t2]) {
          const s1 = { ...st[t1] };
          const s2 = { ...st[t2] };
          const ov1 = m.totalOvers;
          const ov2 = Math.max(0.16, m.balls / 6);
          s1.played += 1;
          s2.played += 1;
          s1.runsFor += m.firstInningsScore;
          s1.oversFor += ov1;
          s1.runsAgainst += m.runs;
          s1.oversAgainst += ov2;
          s2.runsFor += m.runs;
          s2.oversFor += ov2;
          s2.runsAgainst += m.firstInningsScore;
          s2.oversAgainst += ov1;
          if (m.isTied) {
            s1.tied += 1;
            s2.tied += 1;
            s1.points += 1;
            s2.points += 1;
          } else if (winningTeamName === t1) {
            s1.won += 1;
            s2.lost += 1;
            s1.points += 2;
          } else if (winningTeamName === t2) {
            s2.won += 1;
            s1.lost += 1;
            s2.points += 2;
          }
          st[t1] = s1;
          st[t2] = s2;
          nextSeries = { ...nextSeries, standings: st };
        }
      }

      return {
        ...prevWs,
        players: applyAutoBadges(updatedPlayers),
        records: nextRecords,
        predictions: [],
        predictionPoints: nextPredPoints,
        seriesCup: nextSeries,
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

    if (q.includes("rivalry") || q.includes("head to head") || q.includes("h2h")) {
      const entries = Object.entries(ws.rivalries || {})
        .filter(([, r]) => r.balls > 0)
        .sort((a, b) => b[1].balls - a[1].balls)
        .slice(0, 3);
      const reply =
        entries.length > 0
          ? "Top Turf Rivalries: " +
            entries
              .map(([k, r]) => k.replace("__vs__", " vs ") + ": " + r.runs + "(" + r.balls + "), " + r.outs + " out(s)")
              .join(" | ")
          : "No batter vs bowler rivalries recorded yet. Bowl a live match to populate head-to-head stats!";
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Rivalry Engine", text: reply, timestamp: nowTime() },
      ]);
      speak(reply);
      return;
    }

    if (q.includes("record") || q.includes("hall of fame") || q.includes("best")) {
      const rec = ws.records || {};
      const reply =
        ws.clubName +
        " Hall of Fame: Highest Score: " +
        (rec.highestScore ? rec.highestScore.player + " (" + rec.highestScore.detail + ")" : "Unclaimed") +
        " | Best Bowling: " +
        (rec.bestBowling ? rec.bestBowling.player + " (" + rec.bestBowling.detail + ")" : "Unclaimed") +
        " | Highest Team Total: " +
        (rec.highestTeamTotal ? rec.highestTeamTotal.detail : "Unclaimed") +
        ".";
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Club Record Book", text: reply, timestamp: nowTime() },
      ]);
      speak(reply);
      return;
    }

    if (q.includes("auction") || q.includes("buy") || q.includes("purse") || q.includes("bid")) {
      const topTargets = [...ws.players]
        .sort((a, b) => computePlayerOvrRating(b) - computePlayerOvrRating(a))
        .slice(0, 3)
        .map((p) => p.name.split(" ")[0] + " (OVR " + computePlayerOvrRating(p) + ", " + p.role + ")");
      const reply =
        "Mega Auction Advisor (30,000 LC Purse): Top Priority Targets -> " +
        topTargets.join(", ") +
        ". Tip: Keep at least 1,500 LC in reserve for death-over bowlers and save 1 RTM for an All-Rounder!";
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Auction Strategy AI", text: reply, timestamp: nowTime() },
      ]);
      speak(reply);
      return;
    }

    if (q.includes("strategy") || q.includes("playing xi") || q.includes("opener") || q.includes("bowler")) {
      const openers = [...ws.players].sort((a, b) => b.runs - a.runs).slice(0, 2).map((p) => p.name.split(" ")[0]);
      const strikeBowlers = [...ws.players].sort((a, b) => b.wickets - a.wickets).slice(0, 2).map((p) => p.name.split(" ")[0]);
      const deathEcon = [...ws.players]
        .filter((p) => p.oversBowled > 0)
        .sort((a, b) => (playerEconomyRate(a) ?? 99) - (playerEconomyRate(b) ?? 99))
        .slice(0, 2)
        .map((p) => p.name.split(" ")[0]);
      const reply =
        "Squad Strategy Advisor: Best Openers -> " +
        (openers.join(" & ") || "TBD") +
        ". Strike Bowlers -> " +
        (strikeBowlers.join(" & ") || "TBD") +
        ". Death Over Economy Picks -> " +
        (deathEcon.join(" & ") || strikeBowlers.join(" & ")) +
        ".";
      setAiMessages((prev) => [
        ...prev,
        { id: uid("b"), role: "bot", layer: "Playing XI Strategy", text: reply, timestamp: nowTime() },
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
  const lmMaxWickets = lm ? Math.max(1, lm.battingPlayers.length - 1) : 10;
  const lmInningsEnded = Boolean(
    lm && (lm.isCompleted || lm.balls >= lmMaxBalls || lm.wickets >= lmMaxWickets)
  );
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
    if (leaderTab === "iq") {
      const iqa = (ws.predictionPoints && ws.predictionPoints[a.name]) || 0;
      const iqb = (ws.predictionPoints && ws.predictionPoints[b.name]) || 0;
      return iqb - iqa || b.mvpPoints - a.mvpPoints;
    }
    if (leaderTab === "auction") {
      return (b.auctionMvpPoints || 0) - (a.auctionMvpPoints || 0) || b.mvpPoints - a.mvpPoints;
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
    { id: "auction", label: "Auction", icon: <GavelSvg size={17} /> },
    { id: "leaderboard", label: "Leaderboard", icon: <BarChart3 size={17} /> },
    { id: "treasury", label: "Finance", icon: <Wallet size={17} /> },
    { id: "chat", label: "Chat", icon: <MessageSquare size={17} /> },
    { id: "ai", label: "LegendBot", icon: <Bot size={17} /> },
    { id: "settings", label: "Settings", icon: <Settings size={17} /> },
  ];

  const winDonutRadius = 36;
  const winDonutCirc = 2 * Math.PI * winDonutRadius;
  const winDonutDash = (winRate / 100) * winDonutCirc;

  if (((state.maintenanceMode || isFinalHourMode) && !isAdmin) || previewMaintenance) {
    const finalHourProgress = isFinalHourMode
      ? Math.min(100, Math.max(0, Math.round(((60 * 60 * 1000 - launchDiffMs) / (60 * 60 * 1000)) * 100)))
      : launchDiffMs === 0
      ? 100
      : 65;
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          background:
            "radial-gradient(circle at top, rgba(251,191,36,0.26), rgba(11,19,40,0.96) 55%, #030714 100%)",
        }}
      >
        <style>{themeCss}</style>
        {showFireworksOverlay && (
          <LaunchFireworksCanvas onClose={() => setShowFireworksOverlay(false)} />
        )}
        <div className="il-card il-hero-banner" style={{ width: "100%", maxWidth: 460, textAlign: "center", padding: 26, border: "2px solid rgba(251,191,36,0.75)" }}>
          <div className="il-stadium-lights" />
          <div className="il-crest" style={{ width: 68, height: 68, fontSize: 25, margin: "0 auto 12px auto" }}>
            IL
          </div>
          <div style={{ fontSize: 20, marginBottom: 8 }}>
            {isFinalHourMode ? "🚨🔥🏏⚡🏆🎆" : "🛠️🏏⚡🏆"}
          </div>
          <span className="il-pill" style={{ background: "rgba(251,191,36,0.24)", color: "#fbbf24", marginBottom: 8 }}>
            <Clock size={12} /> {isFinalHourMode ? "FINAL HOUR LAUNCH COUNTDOWN" : "STADIUM MAINTENANCE & LAUNCH"}
          </span>
          <h2 style={{ margin: "6px 0 8px 0", fontSize: 25, fontWeight: 900, color: "#fde68a" }}>
            {isFinalHourMode ? "Going LIVE Very Soon!" : "Indore Legends Maintenance"}
          </h2>
          <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#cbd5e1", lineHeight: 1.55 }}>
            {state.maintenanceMessage ||
              (isFinalHourMode
                ? "🚨🔥 FINAL HOUR PRE-LAUNCH LOCKDOWN! Final checks & fireworks armed for 4:00 PM IST launch! ⚡🏏🏆"
                : "Upgrading stadium servers, Mega Auction sync & match engine. Live countdown to reopening below!")}
          </p>

          {/* ALWAYS-VISIBLE CALENDAR-FLIP COUNTDOWN ON MAINTENANCE SIDE */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
            {[
              { label: "DAYS", val: cdDays },
              { label: "HRS", val: cdHours },
              { label: "MIN", val: cdMins },
              { label: "SEC", val: cdSecs },
            ].map((u) => (
              <div key={u.label} className="il-flip-card">
                <div style={{ fontSize: 25, fontWeight: 900, color: "#fde68a", fontVariantNumeric: "tabular-nums" }}>
                  {u.val}
                </div>
                <div style={{ fontSize: 9, color: "#fbbf24", fontWeight: 900, letterSpacing: "0.08em" }}>
                  {u.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#7dd3fc", fontWeight: 800, marginBottom: 4 }}>
              <span>LAUNCH CALIBRATION</span>
              <span>{finalHourProgress}% READY</span>
            </div>
            <div style={{ height: 7, borderRadius: 99, background: "#1e293b", overflow: "hidden" }}>
              <div style={{ height: "100%", width: finalHourProgress + "%", background: "linear-gradient(90deg, #38bdf8, #34d399, #fbbf24)" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {previewMaintenance && (
              <button
                type="button"
                className="il-btn il-btn-gold"
                onClick={() => setPreviewMaintenance(false)}
              >
                Exit Admin Preview
              </button>
            )}
            <button
              type="button"
              className="il-btn il-btn-primary"
              onClick={() => void pullFromBin(false, true)}
            >
              <RotateCcw size={14} /> Check Status
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
    <div className={"il-app-layout " + (state.daylightMode ? "il-daylight " : "") + (state.compactMode ? "il-compact" : "")}>
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
        {updateReady && (
          <div
            style={{
              background: "linear-gradient(90deg, #059669, #10b981, #fbbf24)",
              color: "#050a18",
              padding: "9px 14px",
              borderRadius: 14,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              fontWeight: 900,
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={15} /> New App Update Ready! (Match-Safe — Won&apos;t Interrupt Play)
            </span>
            <button
              type="button"
              className="il-btn"
              style={{ padding: "5px 11px", fontSize: 11, background: "#050a18", color: "#fde68a" }}
              onClick={() => {
                if ("serviceWorker" in navigator) {
                  navigator.serviceWorker
                    .getRegistration()
                    .then((reg) => {
                      if (reg?.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
                    })
                    .finally(() => window.location.reload());
                } else {
                  window.location.reload();
                }
              }}
            >
              Tap to Refresh
            </button>
          </div>
        )}

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
                    { label: "Duck +40", kind: "duck", badgeText: "DUCK!", title: "DUCK OUT! (+40 MVP)", subtitle: "Out for 0! Bowler gets +40 MVP!" },
                    { label: "Six", kind: "six", badgeText: "6", title: "MAXIMUM SIX!", subtitle: "Out of the turf!" },
                    { label: "Four", kind: "four", badgeText: "4", title: "CRACKING FOUR!", subtitle: "Bullet to the fence!" },
                    { label: "Win 🏆", kind: "win", badgeText: "WIN!", title: "INDORE LEGENDS WIN!", subtitle: "What a thrilling turf victory!" },
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
              className="il-btn"
              style={{ padding: "7px 8px", fontSize: 11, color: "#7dd3fc" }}
              onClick={() => setShowTurfUtilsModal(true)}
              title="Pro Turf Utility Suite (Umpire Clicker, RRR/NRR Calc, Shuffler, Quiz)"
            >
              🧰 Tools
            </button>
            <button
              type="button"
              className="il-btn il-btn-emerald"
              style={{ padding: "7px 9px", fontSize: 11 }}
              onClick={() => setShowDjModal(true)}
              title="Club DJ (Spotify, YouTube, MP3 & Stadium SFX)"
            >
              <MusicSvg size={14} /> DJ
            </button>
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
            <div className="il-card il-hero-banner il-pitch-strip">
              <div className="il-stadium-lights" />
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

                  {/* 6-Orb Stadium Theme Templates Switcher */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(2,6,23,0.65)", padding: "6px 10px", borderRadius: 999, border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>THEMES</span>
                    {(
                      [
                        { k: "blue", label: "Royal Blue", bg: "linear-gradient(135deg, #0284c7, #1d4ed8)" },
                        { k: "gold", label: "Championship Gold", bg: "linear-gradient(135deg, #d97706, #fbbf24)" },
                        { k: "emerald", label: "Pitch Emerald", bg: "linear-gradient(135deg, #059669, #34d399)" },
                        { k: "crimson", label: "Crimson Fire", bg: "linear-gradient(135deg, #be123c, #fb7185)" },
                        { k: "purple", label: "Knight Purple", bg: "linear-gradient(135deg, #6d28d9, #c084fc)" },
                        { k: "sunset", label: "Indore Sunset", bg: "linear-gradient(135deg, #ea580c, #f43f5e)" },
                      ] as { k: ThemeKey; label: string; bg: string }[]
                    ).map((orb) => (
                      <button
                        key={orb.k}
                        type="button"
                        title={orb.label + " Template"}
                        aria-label={orb.label}
                        className={"il-orb " + (state.theme === orb.k ? "selected" : "")}
                        style={{ background: orb.bg, width: 22, height: 22 }}
                        onClick={() => setState((prev) => ({ ...prev, theme: orb.k }))}
                      />
                    ))}
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

            {/* TODAY'S SPOTLIGHT + PERSONAL CAREER SNAPSHOT + AUCTION JUMP + PITCH TAG */}
            <div className="il-card" style={{ background: "linear-gradient(135deg, rgba(15,29,66,0.92), rgba(7,16,38,0.96))", borderColor: "rgba(251,191,36,0.38)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <span style={{ fontWeight: 900, fontSize: 14, color: "#fbbf24", display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={15} /> Match-Day Command Strip
                </span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span className="il-pill" style={{ background: "rgba(52,211,153,0.18)", color: "#6ee7b7" }}>
                    🌤️ {ws.pitchCondition || "Dry Turf • Fast Outfield"}
                  </span>
                  {isAdmin && (
                    <button
                      type="button"
                      className="il-btn"
                      style={{ padding: "3px 8px", fontSize: 10 }}
                      onClick={() => {
                        const cycle = [
                          "Dry Turf • Fast Outfield",
                          "Dew Factor • Bat 2nd",
                          "Windy • Swing Assist",
                          "High-Scoring Flat Pitch",
                        ];
                        const curIdx = cycle.indexOf(ws.pitchCondition || cycle[0]);
                        const next = cycle[(curIdx + 1) % cycle.length];
                        updateWorkspace((prevWs) => ({ ...prevWs, pitchCondition: next }));
                      }}
                    >
                      Switch Pitch
                    </button>
                  )}
                </div>
              </div>

              <div className="il-grid-3 il-resp-1" style={{ gap: 8, marginBottom: 10 }}>
                <div
                  style={{ cursor: "pointer", background: "rgba(2,6,23,0.78)", padding: 10, borderRadius: 12, border: "1px solid rgba(56,189,248,0.35)" }}
                  onClick={() => {
                    setSelectedProfileId(activeUserInWs.id);
                    setProfileTab("stats");
                  }}
                >
                  <div style={{ fontSize: 9, color: "#7dd3fc", fontWeight: 900 }}>YOUR CAREER SNAPSHOT</div>
                  <div style={{ fontWeight: 900, fontSize: 14, marginTop: 3 }}>
                    {activeUserInWs.runs} Runs • {activeUserInWs.wickets} Wkts
                  </div>
                  <div style={{ fontSize: 11, color: "#fde68a" }}>
                    {activeUserInWs.mvpPoints} MVP • SR {activeUserInWs.ballsFaced > 0 ? ((activeUserInWs.runs / activeUserInWs.ballsFaced) * 100).toFixed(0) : "0"}
                  </div>
                </div>

                <div
                  style={{ cursor: "pointer", background: "rgba(2,6,23,0.78)", padding: 10, borderRadius: 12, border: "1px solid rgba(251,191,36,0.45)" }}
                  onClick={() => setTab("auction")}
                >
                  <div style={{ fontSize: 9, color: "#fbbf24", fontWeight: 900 }}>MEGA AUCTION ROOM</div>
                  <div style={{ fontWeight: 900, fontSize: 14, marginTop: 3 }}>30,000 LC Purse</div>
                  <div style={{ fontSize: 11, color: "#6ee7b7" }}>Tap to enter Live Bidding →</div>
                </div>

                <div
                  style={{ cursor: "pointer", background: "rgba(2,6,23,0.78)", padding: 10, borderRadius: 12, border: "1px solid rgba(244,63,94,0.35)" }}
                  onClick={() => setTab("treasury")}
                >
                  <div style={{ fontSize: 9, color: "#fda4af", fontWeight: 900 }}>SQUAD DUES RADAR</div>
                  <div style={{ fontWeight: 900, fontSize: 14, marginTop: 3 }}>
                    Rs.{ws.players.reduce((s, p) => s + p.finesDue, 0)} Pending
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {ws.players.filter((p) => p.finesDue > 0).length} player(s) with dues • ON FIRE: {ws.players.filter((p) => isPlayerOnFire(p)).length}
                  </div>
                </div>
              </div>

              {/* NEXT MILESTONE ALERTS + SUNLIGHT TURF MODE TOGGLES */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#7dd3fc", fontWeight: 700 }}>
                  🎯 Next Milestone: {activeUserInWs.runs < 50 ? (50 - activeUserInWs.runs) + " runs to 50 Club" : activeUserInWs.runs < 100 ? (100 - activeUserInWs.runs) + " runs to 100 Club" : "Century Legend!"}
                </span>
                <div style={{ display: "flex", gap: 5 }}>
                  <button
                    type="button"
                    className={"il-btn " + (state.daylightMode ? "il-btn-gold" : "")}
                    style={{ padding: "3px 8px", fontSize: 10 }}
                    onClick={() => setState((prev) => ({ ...prev, daylightMode: !prev.daylightMode }))}
                    title="High-contrast daylight sunlight mode for outdoor turf"
                  >
                    ☀️ Sunlight {state.daylightMode ? "ON" : "OFF"}
                  </button>
                  <button
                    type="button"
                    className={"il-btn " + (state.compactMode ? "il-btn-primary" : "")}
                    style={{ padding: "3px 8px", fontSize: 10 }}
                    onClick={() => setState((prev) => ({ ...prev, compactMode: !prev.compactMode }))}
                  >
                    📐 Compact
                  </button>
                </div>
              </div>

              {/* 1-TAP POSTER STUDIO TEMPLATES LAUNCHER */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#fbbf24" }}>🎨 POSTER TEMPLATES:</span>
                <button
                  type="button"
                  className="il-btn"
                  style={{ padding: "3px 8px", fontSize: 10 }}
                  onClick={() =>
                    setPosterConfig({
                      mode: "milestone",
                      template: "gold",
                      title: ws.clubName + " MVP LEADER",
                      subtitle: "SEASON MVP LEADERBOARD #1",
                      player: mvpLeader,
                      highlightLine: mvpLeader.mvpPoints + " CAREER MVP POINTS",
                      statsLine: mvpLeader.runs + " Runs • " + mvpLeader.wickets + " Wkts • " + mvpLeader.matches + " Matches",
                    })
                  }
                >
                  ⭐ MVP Star
                </button>
                <button
                  type="button"
                  className="il-btn"
                  style={{ padding: "3px 8px", fontSize: 10 }}
                  onClick={() =>
                    setPosterConfig({
                      mode: "standings",
                      template: "royal",
                      title: ws.clubName + " TOP 5 MVP",
                      subtitle: "OFFICIAL SQUAD POWER RANKINGS",
                      standingsRows: [...ws.players]
                        .sort((a, b) => b.mvpPoints - a.mvpPoints)
                        .slice(0, 5)
                        .map((pl, idx) => ({ rank: idx + 1, name: pl.name, value: pl.mvpPoints + " MVP" })),
                    })
                  }
                >
                  📊 Top 5 Table
                </button>
                <button
                  type="button"
                  className="il-btn"
                  style={{ padding: "3px 8px", fontSize: 10 }}
                  onClick={() =>
                    setPosterConfig({
                      mode: "champion",
                      template: "crimson",
                      title: ws.clubName,
                      teamA: ws.clubName,
                      subtitle: "SEASON LAUNCH • 4:00 PM TODAY",
                      highlightLine: "TOGETHER WE RISE • PLAY MANAGE WIN",
                      statsLine: ws.players.length + " Squad Legends • 30,000 LC Mega Auction",
                      venue: ws.groundName,
                    })
                  }
                >
                  🏆 Launch / Trophy
                </button>
                <button
                  type="button"
                  className="il-btn"
                  style={{ padding: "3px 8px", fontSize: 10 }}
                  onClick={() =>
                    setPosterConfig({
                      mode: "matchday",
                      template: "emerald",
                      title: ws.scheduledMatch ? ws.scheduledMatch.title : "TURF CLASH",
                      teamA: ws.scheduledMatch ? ws.scheduledMatch.teamAName : "LEGENDS XI",
                      teamB: ws.scheduledMatch ? ws.scheduledMatch.teamBName : "STRIKERS XI",
                      subtitle: (ws.scheduledMatch ? ws.scheduledMatch.overs : 10) + " OVERS • MATCH DAY",
                      captains: ws.scheduledMatch
                        ? "C: " + ws.scheduledMatch.teamACaptain.split(" ")[0] + " vs C: " + ws.scheduledMatch.teamBCaptain.split(" ")[0]
                        : "Indore Turf Showdown",
                      venue: ws.groundName,
                    })
                  }
                >
                  🏏 Match Day
                </button>
              </div>

              {/* Quick Turf Coin Toss + Club Activity Feed */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, paddingTop: 8, borderTop: "1px solid rgba(148,163,184,0.16)", fontSize: 11 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="il-btn il-btn-gold"
                    style={{ padding: "5px 10px", fontSize: 11 }}
                    onClick={() => {
                      const side = Math.random() < 0.5 ? "HEADS 🪙" : "TAILS 🪙";
                      setQuickTossResult(side + " (" + nowTime() + ")");
                      playStadiumSfx("bid");
                    }}
                  >
                    <Coins size={13} /> Quick Coin Toss
                  </button>
                  {quickTossResult && (
                    <span className="il-pill" style={{ background: "rgba(251,191,36,0.2)", color: "#fde68a" }}>
                      {quickTossResult}
                    </span>
                  )}
                </div>
                <span style={{ color: "var(--muted)" }}>
                  Latest: {ws.matchHistory[0] ? ws.matchHistory[0].title + " (" + ws.matchHistory[0].winner + ")" : ws.treasury[0] ? ws.treasury[0].title : "Ready for Season Opener!"}
                </span>
              </div>
            </div>

            {/* LIVE MATCH ON DASHBOARD (WHEN ACTIVE) */}
            {lm && (
              <div
                className="il-card il-hero-banner"
                style={{
                  borderColor: "rgba(244, 63, 94, 0.72)",
                  boxShadow: "0 12px 34px rgba(225, 29, 72, 0.22)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span className="il-pill" style={{ background: "rgba(244,63,94,0.28)", color: "#fda4af", border: "1px solid rgba(251,113,133,0.6)" }}>
                      <Activity size={12} /> LIVE • {lm.isSuperOver ? "SUPER OVER" : "INN " + lm.innings}
                    </span>
                    <span style={{ fontWeight: 900, fontSize: 15, color: "#fde68a" }}>{lm.title}</span>
                  </div>
                  <button
                    type="button"
                    className="il-btn il-btn-gold"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                    onClick={() => setTab("match")}
                  >
                    <Play size={13} /> Open Live Scorer
                  </button>
                </div>

                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fbbf24" }}>
                      {lm.battingTeam} vs {lm.bowlingTeam}
                    </div>
                    <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 2 }}>
                      {lm.captainsInfo}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 3 }}>
                      <span style={{ fontSize: 38, fontWeight: 900, lineHeight: 1 }}>
                        {lm.runs}/{lm.wickets}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "var(--cyan)" }}>
                        ({formatOvers(lm.balls)} / {lm.totalOvers} ov)
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12 }}>
                    <div>
                      CRR: <strong>{lmCrr}</strong>
                      {lm.innings === 2 && lm.target !== null && (
                        <> • RRR: <strong style={{ color: "#34d399" }}>{lmRrr}</strong></>
                      )}
                    </div>
                    <div style={{ color: "var(--gold)", marginTop: 2 }}>
                      MVP: <strong>{computeLiveMvp(lm)}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  <span className="il-pill" style={{ background: "rgba(56,189,248,0.16)", color: "#7dd3fc" }}>
                    Partnership: {lm.partnershipRuns || 0} ({lm.partnershipBalls || 0})
                  </span>
                  {lm.innings === 1 && lm.balls > 0 && (
                    <span className="il-pill" style={{ background: "rgba(251,191,36,0.16)", color: "#fde68a" }}>
                      Projected: {Math.round((lm.runs / (lm.balls / 6)) * lm.totalOvers)}
                    </span>
                  )}
                  {lm.innings === 2 && lm.target !== null && (
                    <span className="il-pill" style={{ background: "rgba(52,211,153,0.18)", color: "#6ee7b7" }}>
                      Need {lmRunsNeeded} in {lmBallsLeft} balls (Target {lm.target})
                    </span>
                  )}
                </div>

                <div className="il-grid-3 il-resp-1" style={{ marginTop: 10, gap: 6 }}>
                  <div style={{ background: "rgba(2,6,23,0.72)", padding: "7px 9px", borderRadius: 10, fontSize: 12 }}>
                    <div style={{ fontSize: 9, color: "#fbbf24", fontWeight: 800 }}>STRIKER *</div>
                    <strong>{lm.striker}</strong>: {lm.batters[lm.striker]?.runs ?? 0} ({lm.batters[lm.striker]?.balls ?? 0})
                  </div>
                  <div style={{ background: "rgba(2,6,23,0.72)", padding: "7px 9px", borderRadius: 10, fontSize: 12 }}>
                    <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 800 }}>NON-STRIKER</div>
                    <strong>{lm.nonStriker}</strong>: {lm.batters[lm.nonStriker]?.runs ?? 0} ({lm.batters[lm.nonStriker]?.balls ?? 0})
                  </div>
                  <div style={{ background: "rgba(2,6,23,0.72)", padding: "7px 9px", borderRadius: 10, fontSize: 12 }}>
                    <div style={{ fontSize: 9, color: "var(--cyan)", fontWeight: 800 }}>BOWLER SPELL</div>
                    <strong>{lm.bowler}</strong>: {lm.bowlers[lm.bowler]?.wickets ?? 0}/{lm.bowlers[lm.bowler]?.runs ?? 0} ({formatOvers(lm.bowlers[lm.bowler]?.balls ?? 0)} ov • {lm.bowlers[lm.bowler]?.dotBalls ?? 0} dots)
                  </div>
                </div>

                {(() => {
                  const top3 = getLiveMvpRanking(lm).slice(0, 3);
                  if (top3.length === 0) return null;
                  return (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 9, alignItems: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 900, color: "#fbbf24" }}>TOP 3 MVP:</span>
                      {top3.map((item, idx) => (
                        <span
                          key={item.name}
                          className="il-pill"
                          style={{
                            background: idx === 0 ? "rgba(251,191,36,0.24)" : "rgba(2,6,23,0.78)",
                            color: idx === 0 ? "#fde68a" : "#e2e8f0",
                          }}
                        >
                          #{idx + 1} {item.name.split(" ")[0]} ({item.pts})
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

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
                  {isFinalHourMode
                    ? "🚨🔥 FINAL HOUR LAUNCH • 4:00 PM TODAY! ⚡🏏🏆"
                    : "Today 4:00 PM Launch Countdown"}
                </div>
                <div style={{ fontSize: 12, color: isFinalHourMode ? "#fde68a" : "var(--muted)", marginTop: 3, fontWeight: isFinalHourMode ? 800 : 400 }}>
                  {isFinalHourMode
                    ? "⚡ Under 1 hour left! Fireworks & live stadium launch at 4:00 PM IST 🔥🎆"
                    : "Nov 28, 2026 • 4:00 PM IST • " + ws.groundName}
                </div>

                <div
                  className="il-grid-4"
                  style={{
                    marginTop: 12,
                    padding: isFinalHourMode ? 8 : 4,
                    borderRadius: 16,
                    border: isFinalHourMode ? "2px solid #fbbf24" : "1px solid rgba(251,191,36,0.2)",
                    background: isFinalHourMode ? "rgba(245,158,11,0.14)" : "transparent",
                  }}
                >
                  {[
                    { label: "DAYS", val: cdDays },
                    { label: "HRS", val: cdHours },
                    { label: "MIN", val: cdMins },
                    { label: "SEC", val: cdSecs },
                  ].map((u) => (
                    <div
                      key={u.label}
                      style={{
                        position: "relative",
                        background: isFinalHourMode
                          ? "linear-gradient(180deg, #1e293b 0%, #090d1e 49%, #1e1b4b 51%, #0f172a 100%)"
                          : "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.95) 100%)",
                        border: "1px solid " + (isFinalHourMode ? "#fbbf24" : "rgba(251,191,36,0.35)"),
                        borderRadius: 12,
                        padding: "9px 4px",
                        textAlign: "center",
                        boxShadow: isFinalHourMode ? "0 6px 18px rgba(251,191,36,0.3)" : "none",
                      }}
                    >
                      <div style={{ fontSize: 21, fontWeight: 900, color: isFinalHourMode ? "#fde68a" : "#ffffff", fontVariantNumeric: "tabular-nums" }}>
                        {u.val}
                      </div>
                      <div style={{ fontSize: 9, color: "var(--gold)", fontWeight: 900, letterSpacing: "0.06em" }}>
                        {u.label}
                      </div>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="il-grid-2" style={{ marginTop: 8, gap: 6 }}>
                    <button
                      type="button"
                      className="il-btn il-btn-purple"
                      style={{ padding: "7px 8px", fontSize: 10 }}
                      onClick={() => {
                        setShowFireworksOverlay(true);
                        playStadiumSfx("fireworks");
                      }}
                    >
                      🎆 Test Fireworks
                    </button>
                    <button
                      type="button"
                      className="il-btn"
                      style={{ padding: "7px 8px", fontSize: 10, color: "#fde68a" }}
                      onClick={() => setPreviewMaintenance(true)}
                    >
                      🔒 Preview Maint. Timer
                    </button>
                  </div>
                )}

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
                        if (isSpinOwner) {
                          setShowAddPlayerModal(true);
                        } else {
                          setTab("squad");
                        }
                      }}
                    >
                      <UserPlus size={15} color="#38bdf8" /> {isSpinOwner ? "Add Player" : "View Squad"}
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
                      <div style={{ padding: 8, borderRadius: 10, background: "rgba(15,29,66,0.7)", border: "1px solid rgba(251,191,36,0.3)" }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "#fde68a", marginBottom: 6 }}>
                          ⚡ MATCH FORMAT TEMPLATES (1-TAP PRESETS)
                        </div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {[
                            { label: "⚡ 6-Ov Turf Blitz", title: "Turf Blitz Clash", ov: 6, rules: { lastManStanding: false, maxOversPerBowler: 2, bonusPowerplayOver: true, wideNbRunsOnly: false } },
                            { label: "🏏 8-Ov Gully Smash", title: "Gully Smash Cup", ov: 8, rules: { lastManStanding: true, maxOversPerBowler: 2, bonusPowerplayOver: true, wideNbRunsOnly: true } },
                            { label: "🏆 10-Ov Legends Classic", title: "Legends Classic", ov: 10, rules: { lastManStanding: false, maxOversPerBowler: 2, bonusPowerplayOver: true, wideNbRunsOnly: false } },
                            { label: "🌙 12-Ov Floodlight", title: "Night Floodlight Clash", ov: 12, rules: { lastManStanding: false, maxOversPerBowler: 3, bonusPowerplayOver: true, wideNbRunsOnly: false } },
                            { label: "📦 5-Ov Box Express", title: "Box Cricket Express", ov: 5, rules: { lastManStanding: true, maxOversPerBowler: 1, bonusPowerplayOver: true, wideNbRunsOnly: true } },
                            { label: "🔥 1-Ov Super Thriller", title: "Super Over Showdown", ov: 1, rules: { lastManStanding: false, maxOversPerBowler: 1, bonusPowerplayOver: false, wideNbRunsOnly: false } },
                          ].map((mt) => (
                            <button
                              key={mt.label}
                              type="button"
                              className="il-btn"
                              style={{ padding: "4px 8px", fontSize: 10 }}
                              onClick={() => {
                                setWizTitle(mt.title);
                                setWizOvers(mt.ov);
                                setWizTurfRules(mt.rules);
                              }}
                            >
                              {mt.label}
                            </button>
                          ))}
                        </div>
                      </div>
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

                      <div style={{ padding: 10, borderRadius: 12, background: "rgba(15,29,66,0.65)", border: "1px solid rgba(56,189,248,0.3)" }}>
                        <div style={{ fontSize: 11, fontWeight: 900, color: "#7dd3fc", marginBottom: 8 }}>
                          CUSTOM TURF RULES
                        </div>
                        <div className="il-grid-2 il-resp-1" style={{ gap: 8, fontSize: 12 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={wizTurfRules.lastManStanding}
                              onChange={(e) => setWizTurfRules((r) => ({ ...r, lastManStanding: e.target.checked }))}
                            />
                            Last Man Standing
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={wizTurfRules.bonusPowerplayOver}
                              onChange={(e) => setWizTurfRules((r) => ({ ...r, bonusPowerplayOver: e.target.checked }))}
                            />
                            Allow 2× Bonus Over
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={wizTurfRules.wideNbRunsOnly}
                              onChange={(e) => setWizTurfRules((r) => ({ ...r, wideNbRunsOnly: e.target.checked }))}
                            />
                            Wide/NB Runs-Only (No Re-ball)
                          </label>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>Max Ov/Bowler:</span>
                            <select
                              className="il-select"
                              style={{ padding: "4px 6px", fontSize: 11, width: "auto" }}
                              value={wizTurfRules.maxOversPerBowler}
                              onChange={(e) =>
                                setWizTurfRules((r) => ({ ...r, maxOversPerBowler: Number(e.target.value) }))
                              }
                            >
                              <option value={0}>Unlimited</option>
                              <option value={1}>1 Over</option>
                              <option value={2}>2 Overs</option>
                              <option value={3}>3 Overs</option>
                              <option value={4}>4 Overs</option>
                            </select>
                          </div>
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

                    {(() => {
                      const sch = ws.scheduledMatch!;
                      const squadNames = ws.players
                        .filter((p) => sch.selectedPlayerIds.includes(p.id))
                        .map((p) => p.name);
                      const myPred = (ws.predictions || []).find((pr) => pr.playerId === activeUserInWs.id);
                      return (
                        <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "rgba(15,29,66,0.7)", border: "1px solid rgba(167,139,250,0.45)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                            <span style={{ fontWeight: 900, fontSize: 13, color: "#ddd6fe" }}>
                              🎯 Pre-Match Squad Predictions (Cricket IQ)
                            </span>
                            <span className="il-pill" style={{ background: "rgba(167,139,250,0.22)", color: "#ddd6fe" }}>
                              {(ws.predictions || []).length} Locked In
                            </span>
                          </div>
                          <div className="il-grid-3 il-resp-1" style={{ gap: 6, marginBottom: 8 }}>
                            <select
                              className="il-select"
                              style={{ fontSize: 12, padding: "7px 8px" }}
                              value={predWinner || myPred?.winnerTeam || sch.teamAName}
                              onChange={(e) => setPredWinner(e.target.value)}
                            >
                              <option value={sch.teamAName}>Winner: {sch.teamAName}</option>
                              <option value={sch.teamBName}>Winner: {sch.teamBName}</option>
                            </select>
                            <select
                              className="il-select"
                              style={{ fontSize: 12, padding: "7px 8px" }}
                              value={predBatter || myPred?.topScorer || squadNames[0] || ""}
                              onChange={(e) => setPredBatter(e.target.value)}
                            >
                              {squadNames.map((n) => (
                                <option key={n} value={n}>Top Runs: {n.split(" ")[0]}</option>
                              ))}
                            </select>
                            <select
                              className="il-select"
                              style={{ fontSize: 12, padding: "7px 8px" }}
                              value={predBowler || myPred?.topBowler || squadNames[0] || ""}
                              onChange={(e) => setPredBowler(e.target.value)}
                            >
                              {squadNames.map((n) => (
                                <option key={n} value={n}>Top Wkts: {n.split(" ")[0]}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                            <button
                              type="button"
                              className="il-btn il-btn-purple"
                              style={{ padding: "6px 12px", fontSize: 11 }}
                              onClick={() => {
                                const wTeam = predWinner || myPred?.winnerTeam || sch.teamAName;
                                const tBat = predBatter || myPred?.topScorer || squadNames[0] || "";
                                const tBowl = predBowler || myPred?.topBowler || squadNames[0] || "";
                                updateWorkspace((prevWs) => ({
                                  ...prevWs,
                                  predictions: [
                                    ...(prevWs.predictions || []).filter((x) => x.playerId !== activeUserInWs.id),
                                    {
                                      playerId: activeUserInWs.id,
                                      playerName: activeUserInWs.name,
                                      matchId: sch.id,
                                      winnerTeam: wTeam,
                                      topScorer: tBat,
                                      topBowler: tBowl,
                                    },
                                  ],
                                }));
                              }}
                            >
                              {myPred ? "Update My Pick" : "Lock In Prediction (+50 Max IQ)"}
                            </button>
                            <button
                              type="button"
                              className="il-btn il-btn-gold"
                              style={{ padding: "6px 10px", fontSize: 11 }}
                              onClick={() =>
                                setPosterConfig({
                                  mode: "matchday",
                                  title: sch.title,
                                  subtitle: sch.overs + " OVERS • " + sch.dateTime.replace("T", " "),
                                  teamA: sch.teamAName,
                                  teamB: sch.teamBName,
                                  captains: "C: " + sch.teamACaptain.split(" ")[0] + "  vs  C: " + sch.teamBCaptain.split(" ")[0],
                                  venue: ws.groundName,
                                })
                              }
                            >
                              <Download size={12} /> Match Poster PNG
                            </button>
                          </div>
                        </div>
                      );
                    })()}

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
                    <div style={{ fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", gap: 6, color: "#7dd3fc" }}>
                      <Trophy size={16} color="#fbbf24" /> {ws.seriesCup ? ws.seriesCup.name : "Mini-Series & Turf Cup"}
                    </div>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="il-btn"
                          style={{ padding: "5px 9px", fontSize: 11 }}
                          onClick={() => setShowSeriesCreator((v) => !v)}
                        >
                          {ws.seriesCup ? "New Series/Cup" : "+ Start Series / Cup"}
                        </button>
                        {ws.seriesCup && (
                          <button
                            type="button"
                            className="il-btn il-btn-danger"
                            style={{ padding: "5px 8px", fontSize: 11 }}
                            onClick={() =>
                              requireAdminPin("End Active Series/Cup", () =>
                                updateWorkspace((prevWs) => ({ ...prevWs, seriesCup: null }))
                              )
                            }
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {showSeriesCreator && isAdmin && (
                    <div style={{ padding: 10, borderRadius: 12, background: "rgba(2,6,23,0.82)", border: "1px solid var(--border)", marginBottom: 10, display: "grid", gap: 8 }}>
                      <div className="il-grid-2">
                        <input
                          className="il-input"
                          value={seriesNameDraft}
                          onChange={(e) => setSeriesNameDraft(e.target.value)}
                          placeholder="Series / Cup Name"
                        />
                        <select
                          className="il-select"
                          value={seriesModeDraft}
                          onChange={(e) => setSeriesModeDraft(e.target.value as "series" | "cup")}
                        >
                          <option value="series">2-Team Best-of-3 / 5 Series</option>
                          <option value="cup">3-Team Turf Cup (Points + NRR)</option>
                        </select>
                      </div>
                      {seriesModeDraft === "cup" && (
                        <input
                          className="il-input"
                          value={seriesTeam3Draft}
                          onChange={(e) => setSeriesTeam3Draft(e.target.value)}
                          placeholder="3rd Team Name"
                        />
                      )}
                      <button
                        type="button"
                        className="il-btn il-btn-gold"
                        onClick={() => {
                          const teamsList =
                            seriesModeDraft === "cup"
                              ? [wizTeamAName.trim() || "Legends XI", wizTeamBName.trim() || "Strikers XI", seriesTeam3Draft.trim() || "Indore Royals"]
                              : [wizTeamAName.trim() || "Legends XI", wizTeamBName.trim() || "Strikers XI"];
                          const standings: Record<string, SeriesTeamStanding> = {};
                          teamsList.forEach((tn) => {
                            standings[tn] = {
                              played: 0,
                              won: 0,
                              lost: 0,
                              tied: 0,
                              runsFor: 0,
                              oversFor: 0,
                              runsAgainst: 0,
                              oversAgainst: 0,
                              points: 0,
                            };
                          });
                          updateWorkspace((prevWs) => ({
                            ...prevWs,
                            seriesCup: {
                              id: uid("ser"),
                              name: seriesNameDraft.trim() || "Indore Turf Cup",
                              mode: seriesModeDraft,
                              targetMatches: seriesModeDraft === "series" ? 3 : 6,
                              teams: teamsList,
                              standings,
                            },
                          }));
                          setShowSeriesCreator(false);
                        }}
                      >
                        Launch Points Table
                      </button>
                    </div>
                  )}

                  {!ws.seriesCup ? (
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      Group matches into a Best-of-3 Series or 3-Team Turf Cup to track Points &amp; Net Run Rate (NRR) automatically!
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ color: "var(--gold)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                            <th style={{ padding: "6px 4px" }}>TEAM</th>
                            <th style={{ padding: "6px 4px" }}>P</th>
                            <th style={{ padding: "6px 4px" }}>W</th>
                            <th style={{ padding: "6px 4px" }}>L</th>
                            <th style={{ padding: "6px 4px" }}>NRR</th>
                            <th style={{ padding: "6px 4px" }}>PTS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(ws.seriesCup.standings)
                            .map(([tn, s]) => {
                              const nrr =
                                s.oversFor > 0 && s.oversAgainst > 0
                                  ? s.runsFor / s.oversFor - s.runsAgainst / s.oversAgainst
                                  : 0;
                              return { tn, s, nrr };
                            })
                            .sort((a, b) => b.s.points - a.s.points || b.nrr - a.nrr)
                            .map(({ tn, s, nrr }) => (
                              <tr key={tn} style={{ borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
                                <td style={{ padding: "7px 4px", fontWeight: 800 }}>{tn}</td>
                                <td style={{ padding: "7px 4px" }}>{s.played}</td>
                                <td style={{ padding: "7px 4px", color: "#34d399", fontWeight: 800 }}>{s.won}</td>
                                <td style={{ padding: "7px 4px", color: "#fb7185" }}>{s.lost}</td>
                                <td style={{ padding: "7px 4px", color: nrr >= 0 ? "#7dd3fc" : "#fda4af" }}>
                                  {nrr >= 0 ? "+" : ""}{nrr.toFixed(2)}
                                </td>
                                <td style={{ padding: "7px 4px", fontWeight: 900, color: "#fbbf24" }}>{s.points}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

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
                            <button
                              type="button"
                              className="il-btn il-btn-gold"
                              style={{ padding: "7px 10px", fontSize: 12 }}
                              onClick={() => {
                                const mvpName = h.mvp.split(" (")[0];
                                const mvpPl = ws.players.find((p) => p.name === mvpName) || null;
                                setPosterConfig({
                                  mode: "motm",
                                  title: h.title,
                                  subtitle: h.winner,
                                  player: mvpPl,
                                  highlightLine: h.mvp,
                                  statsLine: h.summary,
                                });
                              }}
                              title="Download Man of the Match Poster PNG"
                            >
                              <Download size={13} /> Poster
                            </button>
                            <button
                              type="button"
                              className="il-btn il-btn-purple"
                              style={{ padding: "7px 10px", fontSize: 12 }}
                              onClick={() => handleCopyScorecard(buildReelCaption(h), "reel_" + h.id)}
                              title="Copy Instagram Reel / YouTube Short Caption"
                            >
                              {copiedCardId === "reel_" + h.id ? <Check size={14} color="#34d399" /> : <Sparkles size={13} />}
                              {copiedCardId === "reel_" + h.id ? "Reel Copied" : "Reel"}
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
                      <div style={{ fontSize: 11, color: "#fde68a", fontWeight: 700, marginTop: 2 }}>{lm.captainsInfo}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="il-btn il-btn-purple"
                        style={{ padding: "7px 10px", fontSize: 12 }}
                        onClick={() => setShowSmartTvMode(true)}
                        title="Open Big-Screen Smart TV / Projector Scoreboard"
                      >
                        📺 TV Mode
                      </button>
                      <button
                        type="button"
                        className="il-btn"
                        style={{ padding: "7px 10px", fontSize: 12 }}
                        onClick={() => setShowCommentaryDrawer((v) => !v)}
                      >
                        🎙️ Comm
                      </button>
                      <select
                        className="il-select"
                        style={{ width: "auto", padding: "5px 8px", fontSize: 11 }}
                        value={scorecardTemplate}
                        onChange={(e) => setScorecardTemplate(e.target.value as ScorecardTemplateKey)}
                        title="Choose Scorecard Export Template"
                      >
                        <option value="broadcast">Tpl: Broadcast V2</option>
                        <option value="mini">Tpl: Mini WhatsApp</option>
                        <option value="reel">Tpl: Reel / Shorts</option>
                        <option value="table">Tpl: Match Sheet</option>
                      </select>
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

                  {(() => {
                    const riv = (ws.rivalries || {})[lm.striker + "__vs__" + lm.bowler];
                    if (!riv || riv.balls === 0) return null;
                    const rSr = ((riv.runs / riv.balls) * 100).toFixed(0);
                    return (
                      <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 10, background: "rgba(124,58,237,0.22)", border: "1px solid rgba(167,139,250,0.45)", fontSize: 11, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                        <span style={{ fontWeight: 900, color: "#ddd6fe" }}>
                          ⚔️ RIVALRY: {lm.striker.split(" ")[0]} vs {lm.bowler.split(" ")[0]}
                        </span>
                        <span style={{ color: "#fde68a", fontWeight: 800 }}>
                          {riv.runs}({riv.balls}) • SR {rSr} • 4s:{riv.fours} 6s:{riv.sixes} • {riv.outs} Out
                        </span>
                      </div>
                    );
                  })()}

                  {/* PARTNERSHIP + PROJECTED SCORE + LIVE MVP RACE */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    <span className="il-pill" style={{ background: "rgba(56,189,248,0.16)", color: "#7dd3fc" }}>
                      Partnership: {lm.partnershipRuns || 0} ({lm.partnershipBalls || 0})
                    </span>
                    {lm.innings === 1 && lm.balls > 0 && (
                      <span className="il-pill" style={{ background: "rgba(251,191,36,0.16)", color: "#fde68a" }}>
                        Projected: {Math.round((lm.runs / (lm.balls / 6)) * lm.totalOvers)}
                      </span>
                    )}
                    {lm.firstInningsScore !== null && (
                      <span className="il-pill" style={{ background: "rgba(167,139,250,0.18)", color: "#ddd6fe" }}>
                        1st Inn: {lm.bowlingTeam} {lm.firstInningsScore}/{lm.firstInningsWickets ?? 0}
                      </span>
                    )}
                    {Math.floor(lm.balls / 6) < Math.max(1, Math.floor(lm.totalOvers / 3)) ? (
                      <span className="il-pill" style={{ background: "rgba(56,189,248,0.22)", color: "#7dd3fc" }}>⚡ POWERPLAY</span>
                    ) : lm.totalOvers - Math.floor(lm.balls / 6) <= 2 ? (
                      <span className="il-pill" style={{ background: "rgba(225,29,72,0.26)", color: "#fda4af" }}>🔥 DEATH OVERS</span>
                    ) : null}
                    {(() => {
                      const ext = computeInningsExtras(lm.history, lm.innings);
                      return (
                        <span className="il-pill" style={{ background: "rgba(148,163,184,0.18)", color: "#cbd5e1" }}>
                          Extras: {ext.total} (WD:{ext.wides} NB:{ext.noBalls})
                        </span>
                      );
                    })()}
                    {(() => {
                      const last2Bowler = lm.history
                        .filter((e) => e.innings === lm.innings && e.bowler === lm.bowler && !e.isWide && !e.isNoBall)
                        .slice(0, 2);
                      if (last2Bowler.length === 2 && last2Bowler.every((e) => e.isWicket && e.wicketType !== "Run Out")) {
                        return (
                          <span className="il-pill il-onfire" style={{ fontSize: 10 }}>
                            🔥 HAT-TRICK BALL FOR {lm.bowler.split(" ")[0].toUpperCase()}!
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* STRIKER MILESTONE PROGRESS + LAST 12 BALLS MINI-RIBBON */}
                  {(() => {
                    const sRuns = lm.batters[lm.striker]?.runs ?? 0;
                    const nextMile = sRuns < 25 ? 25 : sRuns < 50 ? 50 : 100;
                    const pct = Math.min(100, Math.round((sRuns / nextMile) * 100));
                    const recent12 = lm.history.filter((b) => b.innings === lm.innings).slice(0, 12).reverse();
                    return (
                      <div style={{ marginTop: 9, display: "grid", gap: 7 }}>
                        <div style={{ background: "rgba(2,6,23,0.68)", padding: "6px 10px", borderRadius: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 800 }}>
                            <span style={{ color: "#fde68a" }}>{lm.striker.split(" ")[0]} Milestone Tracker</span>
                            <span style={{ color: "#7dd3fc" }}>{sRuns}/{nextMile} ({Math.max(0, nextMile - sRuns)} to go)</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 99, background: "#1e293b", marginTop: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg,#38bdf8,#fbbf24)" }} />
                          </div>
                        </div>
                        {recent12.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 9, fontWeight: 900, color: "var(--muted)" }}>LAST 12:</span>
                            {recent12.map((b) => (
                              <span
                                key={b.id}
                                className="il-ball"
                                style={{ ...renderBallStyle(b), width: 24, height: 24, fontSize: 10 }}
                              >
                                {renderBallText(b)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* LIVE TOP 3 MVP RACE (COMBINED BOTH INNINGS) */}
                  {(() => {
                    const top3 = getLiveMvpRanking(lm).slice(0, 3);
                    if (top3.length === 0) return null;
                    return (
                      <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 12, background: "rgba(2,6,23,0.72)", border: "1px solid rgba(251,191,36,0.28)" }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "#fbbf24", letterSpacing: "0.08em", marginBottom: 6 }}>
                          LIVE MVP RACE (BOTH INNINGS)
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {top3.map((item, idx) => (
                            <span
                              key={item.name}
                              className="il-pill"
                              style={{
                                background: idx === 0 ? "rgba(251,191,36,0.24)" : "rgba(30,41,59,0.9)",
                                color: idx === 0 ? "#fde68a" : "#e2e8f0",
                                border: idx === 0 ? "1px solid rgba(251,191,36,0.65)" : "1px solid var(--border)",
                              }}
                            >
                              #{idx + 1} {item.name.split(" ")[0]} • {item.pts} pts
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {lm.innings === 2 && lm.target !== null && (() => {
                    const wktsFactor = Math.max(0, (lmMaxWickets - lm.wickets) / Math.max(1, lmMaxWickets));
                    const rrrNum = lmBallsLeft > 0 ? (lmRunsNeeded || 0) / (lmBallsLeft / 6) : 99;
                    const batWinPct = lm.isCompleted
                      ? lm.runs >= lm.target
                        ? 100
                        : lm.isTied
                        ? 50
                        : 0
                      : Math.max(
                          6,
                          Math.min(
                            94,
                            Math.round(52 + (8.5 - rrrNum) * 5.2 + (wktsFactor - 0.5) * 32)
                          )
                        );
                    const bowlWinPct = 100 - batWinPct;
                    return (
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
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 800, marginBottom: 4 }}>
                            <span style={{ color: "#34d399" }}>{lm.battingTeam}: {batWinPct}%</span>
                            <span style={{ color: "var(--muted)" }}>WIN PROBABILITY</span>
                            <span style={{ color: "#fb7185" }}>{lm.bowlingTeam}: {bowlWinPct}%</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 99, overflow: "hidden", display: "flex", background: "#1e293b" }}>
                            <div style={{ width: batWinPct + "%", background: "#34d399", transition: "width 0.4s ease" }} />
                            <div style={{ width: bowlWinPct + "%", background: "#fb7185", transition: "width 0.4s ease" }} />
                          </div>
                        </div>
                        {(() => {
                          const crrVal = Number(lmCrr) || 0;
                          const rrrVal = Number(lmRrr) || 0;
                          const pressure = computeChasePressure(crrVal, rrrVal, lm.wickets, lmMaxWickets);
                          const dlsPar = estimateDlsPar(lm.target, lm.balls, lm.totalOvers, lm.wickets, lmMaxWickets);
                          const aheadDiff = lm.runs - dlsPar;
                          return (
                            <div style={{ marginTop: 9, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                              <span className="il-pill" style={{ background: pressure.bg, color: pressure.color }}>
                                ⚡ {pressure.label} (Gap: {(rrrVal - crrVal >= 0 ? "+" : "") + (rrrVal - crrVal).toFixed(2)})
                              </span>
                              <button
                                type="button"
                                className="il-btn"
                                style={{ padding: "3px 8px", fontSize: 10 }}
                                onClick={() => setShowDlsCalc((v) => !v)}
                              >
                                🌧️ DLS Par: {dlsPar} ({aheadDiff >= 0 ? "+" + aheadDiff + " Ahead" : aheadDiff + " Behind"})
                              </button>
                            </div>
                          );
                        })()}
                        {showDlsCalc && (() => {
                          const parNow = estimateDlsPar(lm.target, lm.balls, lm.totalOvers, lm.wickets, lmMaxWickets);
                          const parNextWkt = estimateDlsPar(lm.target, lm.balls, lm.totalOvers, Math.min(lmMaxWickets, lm.wickets + 1), lmMaxWickets);
                          return (
                            <div style={{ marginTop: 8, padding: "7px 10px", borderRadius: 10, background: "rgba(15,29,66,0.85)", border: "1px solid rgba(56,189,248,0.4)", fontSize: 11, color: "#e2e8f0" }}>
                              <strong>🌧️ Rain / Darkness DLS Par Estimator:</strong> Par right now at {formatOvers(lm.balls)} ov ({lm.wickets} wkts): <strong style={{ color: "#fbbf24" }}>{parNow}</strong> • If 1 more wicket falls: <strong style={{ color: "#fda4af" }}>{parNextWkt}</strong>.
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}

                  {/* GOOGLE-STYLE LIVE BALL TICKER */}
                  {lm.history.length > 0 && (() => {
                    const lastBall = lm.history[0];
                    const isWkt = lastBall.isWicket;
                    const isSix = !isWkt && !lastBall.isWide && !lastBall.isNoBall && lastBall.runs === 6;
                    const isFour = !isWkt && !lastBall.isWide && !lastBall.isNoBall && lastBall.runs === 4;
                    const isExtra = lastBall.isWide || lastBall.isNoBall;
                    const tickerBg = isWkt
                      ? "linear-gradient(90deg, rgba(190,18,60,0.92), rgba(136,19,55,0.85))"
                      : isSix
                      ? "linear-gradient(90deg, rgba(217,119,6,0.95), rgba(234,88,12,0.88))"
                      : isFour
                      ? "linear-gradient(90deg, rgba(2,132,199,0.92), rgba(37,99,235,0.85))"
                      : isExtra
                      ? "linear-gradient(90deg, rgba(124,58,237,0.88), rgba(79,70,229,0.82))"
                      : "rgba(15,23,42,0.92)";
                    const badge = isWkt
                      ? lastBall.isDuckWicket
                        ? "DUCK!"
                        : "OUT!"
                      : lastBall.isWide
                      ? "WD"
                      : lastBall.isNoBall
                      ? "NB"
                      : String(lastBall.runs);
                    const label = isWkt
                      ? (lastBall.isDuckWicket ? "DUCK OUT (+40 MVP) • " : "") +
                        lastBall.batsman +
                        " — " +
                        (lastBall.wicketType === "Caught" && lastBall.caughtBy
                          ? "c " + lastBall.caughtBy + " b " + lastBall.bowler + " (+15 catch)"
                          : lastBall.wicketType === "Run Out"
                          ? "Run Out"
                          : (lastBall.wicketType || "Out") + " b " + lastBall.bowler)
                      : isSix
                      ? "SIX! " + lastBall.batsman + " smashes " + lastBall.bowler + " for 6!"
                      : isFour
                      ? "FOUR! " + lastBall.batsman + " drives " + lastBall.bowler + " to the fence!"
                      : lastBall.isWide
                      ? "WIDE BALL (+1) by " + lastBall.bowler
                      : lastBall.isNoBall
                      ? "NO BALL (+1) — FREE HIT NEXT!"
                      : lastBall.batsman + " scores " + lastBall.runs + " off " + lastBall.bowler;
                    return (
                      <div
                        key={lastBall.id}
                        className="il-google-ticker"
                        style={{
                          background: tickerBg,
                          border: "1px solid rgba(255,255,255,0.22)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <span
                            style={{
                              minWidth: 44,
                              height: 36,
                              padding: "0 8px",
                              borderRadius: 10,
                              background: "rgba(2,6,23,0.72)",
                              border: "2px solid rgba(255,255,255,0.5)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 900,
                              fontSize: badge.length > 3 ? 11 : 15,
                              color: "#ffffff",
                              flexShrink: 0,
                            }}
                          >
                            {badge}
                          </span>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "#ffffff", lineHeight: 1.3 }}>
                            {label}
                          </div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.8)", flexShrink: 0 }}>
                          Ov {lastBall.over + 1}.{lastBall.ballInOver}
                        </span>
                      </div>
                    );
                  })()}

                  {lm.innings === 1 && lmInningsEnded && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 12,
                        background: "rgba(251,191,36,0.2)",
                        border: "1px solid rgba(251,191,36,0.65)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontWeight: 900, color: "#fde68a", fontSize: 13 }}>
                        INNINGS 1 COMPLETE ({lm.runs}/{lm.wickets} in {formatOvers(lm.balls)} ov) — Target {lm.runs + 1}
                      </span>
                      {isAdmin && (
                        <button type="button" className="il-btn il-btn-gold" style={{ padding: "6px 12px", fontSize: 12 }} onClick={startSecondInnings}>
                          Start 2nd Innings
                        </button>
                      )}
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
                        Spell: {lm.bowlers[lm.bowler]?.wickets ?? 0}/{lm.bowlers[lm.bowler]?.runs ?? 0} ({formatOvers(lm.bowlers[lm.bowler]?.balls ?? 0)} ov) •{" "}
                        <span style={{ color: "#34d399", fontWeight: 800 }}>{lm.bowlers[lm.bowler]?.dotBalls ?? 0} Dots</span> • Econ{" "}
                        {(lm.bowlers[lm.bowler]?.balls ?? 0) > 0
                          ? ((lm.bowlers[lm.bowler].runs / (lm.bowlers[lm.bowler].balls / 6))).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                  </div>

                  {isAdmin ? (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: "#7dd3fc" }}>SHOT ZONE (4s/6s):</span>
                        {(["Off-Side", "Leg-Side", "Straight", "Loft 360"] as const).map((z) => (
                          <button
                            key={z}
                            type="button"
                            className={"il-btn " + (selectedShotZone === z ? "il-btn-primary" : "")}
                            style={{ padding: "3px 8px", fontSize: 10 }}
                            onClick={() => setSelectedShotZone(z)}
                          >
                            {z}
                          </button>
                        ))}
                      </div>
                      <div className="il-grid-4" style={{ marginTop: 10 }}>
                        {[0, 1, 2, 3, 4, 6].map((run) => {
                          const runCls = run === 4 ? "il-btn-primary" : run === 6 ? "il-btn-gold" : "";
                          return (
                            <button
                              key={run}
                              type="button"
                              disabled={lmInningsEnded || showNextBowlerModal}
                              className={"il-btn " + runCls}
                              onClick={() => recordLiveBall(run)}
                            >
                              +{run}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          disabled={lmInningsEnded || showNextBowlerModal}
                          className="il-btn il-btn-purple"
                          onClick={() => recordLiveBall(0, { isWide: true })}
                        >
                          WD
                        </button>
                        <button
                          type="button"
                          disabled={lmInningsEnded || showNextBowlerModal}
                          className="il-btn il-btn-purple"
                          onClick={() => recordLiveBall(0, { isNoBall: true })}
                        >
                          NB
                        </button>
                      </div>

                      <div className="il-grid-2 il-resp-1" style={{ marginTop: 10 }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <select
                            className="il-select"
                            style={{ flex: 1, minWidth: 105 }}
                            value={wicketType}
                            onChange={(e) => {
                              setWicketType(e.target.value);
                              if (e.target.value === "Caught" && !caughtBy && lm.bowlingPlayers[0]) {
                                setCaughtBy(lm.bowlingPlayers[0]);
                              }
                            }}
                          >
                            <option value="Bowled">Bowled</option>
                            <option value="Caught">Caught (+15 MVP)</option>
                            <option value="Run Out">Run Out</option>
                            <option value="LBW">LBW</option>
                            <option value="Stumped">Stumped</option>
                          </select>
                          {wicketType === "Caught" && (
                            <select
                              className="il-select"
                              style={{ flex: 1, minWidth: 115, borderColor: "rgba(251,191,36,0.65)" }}
                              value={caughtBy || lm.bowlingPlayers[0] || ""}
                              onChange={(e) => setCaughtBy(e.target.value)}
                              title="Who took the catch?"
                            >
                              {lm.bowlingPlayers.map((fielder) => (
                                <option key={fielder} value={fielder}>
                                  Caught: {fielder.split(" ")[0]}
                                </option>
                              ))}
                            </select>
                          )}
                          <button
                            type="button"
                            disabled={lmInningsEnded || showNextBowlerModal}
                            className="il-btn il-btn-danger"
                            style={{ minWidth: 82 }}
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

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                        <button
                          type="button"
                          disabled={lmInningsEnded || showNextBowlerModal}
                          className="il-btn"
                          style={{ fontSize: 12, padding: "7px 10px" }}
                          onClick={() =>
                            updateWorkspace((prevWs) =>
                              prevWs.liveMatch
                                ? {
                                    ...prevWs,
                                    liveMatch: {
                                      ...prevWs.liveMatch,
                                      striker: prevWs.liveMatch.nonStriker,
                                      nonStriker: prevWs.liveMatch.striker,
                                    },
                                  }
                                : prevWs
                            )
                          }
                        >
                          <Shuffle size={13} /> Swap Strike
                        </button>
                        <button
                          type="button"
                          disabled={lmInningsEnded || showNextBowlerModal}
                          className="il-btn"
                          style={{ fontSize: 12, padding: "7px 10px" }}
                          onClick={() => recordLiveBall(1, { isBye: true })}
                        >
                          +1 Bye
                        </button>
                        <button
                          type="button"
                          disabled={lmInningsEnded || showNextBowlerModal}
                          className="il-btn"
                          style={{ fontSize: 12, padding: "7px 10px" }}
                          onClick={() => recordLiveBall(4, { isBye: true })}
                        >
                          +4 Byes
                        </button>
                        <button
                          type="button"
                          disabled={lmInningsEnded || showNextBowlerModal}
                          className="il-btn il-btn-danger"
                          style={{ fontSize: 11, padding: "7px 9px" }}
                          onClick={() => {
                            updateWorkspace((prevWs) =>
                              prevWs.liveMatch
                                ? { ...prevWs, liveMatch: { ...prevWs.liveMatch, runs: prevWs.liveMatch.runs + 5 } }
                                : prevWs
                            );
                            setUmpireBanner("PENALTY! +5 Runs awarded to " + lm.battingTeam);
                          }}
                          title="Award 5 penalty runs to batting team"
                        >
                          +5 Penalty
                        </button>
                        {(lm.turfRules?.bonusPowerplayOver ?? true) && (
                          <button
                            type="button"
                            disabled={lmInningsEnded}
                            className={"il-btn " + (lm.bonusOverActive ? "il-btn-gold" : "")}
                            style={{ fontSize: 12, padding: "7px 10px" }}
                            onClick={() =>
                              updateWorkspace((prevWs) =>
                                prevWs.liveMatch
                                  ? {
                                      ...prevWs,
                                      liveMatch: {
                                        ...prevWs.liveMatch,
                                        bonusOverActive: !prevWs.liveMatch.bonusOverActive,
                                      },
                                    }
                                  : prevWs
                              )
                            }
                          >
                            ⚡ 2× Bonus Over: {lm.bonusOverActive ? "ON" : "OFF"}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={lmInningsEnded}
                          className="il-btn"
                          style={{ fontSize: 12, padding: "7px 10px" }}
                          onClick={handleRetiredHurt}
                        >
                          Retired Hurt
                        </button>
                        <button
                          type="button"
                          className="il-btn"
                          style={{ fontSize: 11, padding: "7px 9px" }}
                          onClick={() =>
                            updateWorkspace((prevWs) =>
                              prevWs.liveMatch && prevWs.liveMatch.totalOvers > Math.ceil(prevWs.liveMatch.balls / 6) + 1
                                ? { ...prevWs, liveMatch: { ...prevWs.liveMatch, totalOvers: prevWs.liveMatch.totalOvers - 1 } }
                                : prevWs
                            )
                          }
                          title="Reduce total overs by 1 (Rain / Low Light)"
                        >
                          -1 Over
                        </button>
                        <button
                          type="button"
                          className="il-btn"
                          style={{ fontSize: 11, padding: "7px 9px" }}
                          onClick={() =>
                            updateWorkspace((prevWs) =>
                              prevWs.liveMatch
                                ? { ...prevWs, liveMatch: { ...prevWs.liveMatch, totalOvers: prevWs.liveMatch.totalOvers + 1 } }
                                : prevWs
                            )
                          }
                          title="Add 1 extra over to match"
                        >
                          +1 Over
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 6, color: "#fde68a" }}>
                      <MusicSvg size={15} /> Live Stadium DJ Soundboard
                    </span>
                    <button
                      type="button"
                      className="il-btn il-btn-emerald"
                      style={{ padding: "4px 9px", fontSize: 11 }}
                      onClick={() => setShowDjModal(true)}
                    >
                      Open Spotify / YT DJ
                    </button>
                  </div>
                  <div className="il-grid-4" style={{ gap: 6 }}>
                    {(
                      [
                        { k: "trumpet", l: "🎺 IPL Charge" },
                        { k: "airhorn", l: "📢 Airhorn" },
                        { k: "stump", l: "💥 Stumps" },
                        { k: "roar", l: "🏟️ Roar" },
                        { k: "duck", l: "🦆 Duck!" },
                        { k: "sold", l: "🏆 Fanfare" },
                      ] as { k: SfxKind; l: string }[]
                    ).map((s) => (
                      <button
                        key={s.k}
                        type="button"
                        className="il-btn"
                        style={{ padding: "7px 5px", fontSize: 11 }}
                        onClick={() => playStadiumSfx(s.k)}
                      >
                        {s.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="il-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <Activity size={16} color="#fbbf24" /> Broadcast Charts (Manhattan &amp; Worm)
                    </span>
                    <button
                      type="button"
                      className="il-btn"
                      style={{ padding: "5px 10px", fontSize: 11 }}
                      onClick={() => setShowBroadcastCharts((v) => !v)}
                    >
                      {showBroadcastCharts ? "Hide Charts" : "View Graphs"}
                    </button>
                  </div>
                  {showBroadcastCharts && <BroadcastChartsView lm={lm} />}
                </div>

                {showCommentaryDrawer && (
                  <div className="il-card">
                    <div style={{ fontWeight: 900, fontSize: 14, color: "#fbbf24", marginBottom: 8 }}>
                      🎙️ Live Ball-by-Ball Commentary ({lm.history.length} Balls)
                    </div>
                    <div style={{ display: "grid", gap: 5, maxHeight: 200, overflowY: "auto" }}>
                      {lm.history.length === 0 ? (
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>Commentary begins on ball 1!</div>
                      ) : (
                        lm.history.slice(0, 30).map((b) => (
                          <div key={b.id} style={{ padding: "6px 9px", borderRadius: 9, background: "rgba(2,6,23,0.78)", fontSize: 12 }}>
                            <strong style={{ color: "#7dd3fc" }}>Ov {b.over + 1}.{b.ballInOver}</strong> —{" "}
                            {b.bowler} to {b.batsman}:{" "}
                            <strong style={{ color: b.isWicket ? "#fb7185" : b.runs >= 4 ? "#fbbf24" : "#f8fafc" }}>
                              {b.isWicket
                                ? "WICKET! (" + (b.wicketType || "Out") + ")"
                                : b.isWide
                                ? "WIDE (+1)"
                                : b.isNoBall
                                ? "NO BALL (+1)"
                                : b.runs === 6
                                ? "HUGE SIX" + (b.shotZone ? " towards " + b.shotZone : "") + "!"
                                : b.runs === 4
                                ? "CRACKING FOUR" + (b.shotZone ? " through " + b.shotZone : "") + "!"
                                : b.runs + " run(s)"}
                            </strong>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="il-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <BarChart3 size={16} color="#38bdf8" /> Full Match Scorecard
                    </span>
                    <button
                      type="button"
                      className="il-btn"
                      style={{ padding: "5px 10px", fontSize: 11 }}
                      onClick={() => {
                        setScorecardInnTab(lm.innings);
                        setShowFullScorecard((v) => !v);
                      }}
                    >
                      {showFullScorecard ? "Hide Scorecard" : "View Batting & Bowling"}
                    </button>
                  </div>

                  {showFullScorecard && (() => {
                    const viewingInn1 = scorecardInnTab === 1 && lm.innings === 2;
                    const batMap = viewingInn1 ? lm.firstInningsBatters || {} : lm.batters;
                    const bowlMap = viewingInn1 ? lm.firstInningsBowlers || {} : lm.bowlers;
                    const batList = Object.values(batMap).filter((b) => b.balls > 0 || b.out || b.runs > 0);
                    const bowlList = Object.values(bowlMap).filter((b) => b.balls > 0 || b.wickets > 0);
                    return (
                      <div style={{ marginTop: 12 }}>
                        {lm.innings === 2 && (
                          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                            <button
                              type="button"
                              className={"il-btn " + (scorecardInnTab === 1 ? "il-btn-gold" : "")}
                              style={{ flex: 1, padding: "6px 8px", fontSize: 11 }}
                              onClick={() => setScorecardInnTab(1)}
                            >
                              1st Inn ({lm.bowlingTeam})
                            </button>
                            <button
                              type="button"
                              className={"il-btn " + (scorecardInnTab === 2 ? "il-btn-gold" : "")}
                              style={{ flex: 1, padding: "6px 8px", fontSize: 11 }}
                              onClick={() => setScorecardInnTab(2)}
                            >
                              2nd Inn ({lm.battingTeam})
                            </button>
                          </div>
                        )}
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#fbbf24", marginBottom: 6 }}>BATTING</div>
                        {batList.length === 0 ? (
                          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>No batters yet.</div>
                        ) : (
                          <div style={{ display: "grid", gap: 5, marginBottom: 12 }}>
                            {batList.map((b) => (
                              <div key={b.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 10, background: "rgba(2,6,23,0.72)", fontSize: 12 }}>
                                <div>
                                  <strong>{b.name}</strong>{!b.out && !viewingInn1 && (b.name === lm.striker || b.name === lm.nonStriker) ? " *" : ""}
                                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{b.out ? b.dismissal : "not out"}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <strong style={{ color: "#38bdf8" }}>{b.runs} ({b.balls})</strong>
                                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                                    4s:{b.fours} • 6s:{b.sixes} • SR {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : "0"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#a78bfa", marginBottom: 6 }}>BOWLING</div>
                        {bowlList.length === 0 ? (
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>No bowlers yet.</div>
                        ) : (
                          <div style={{ display: "grid", gap: 5 }}>
                            {bowlList.map((bw) => (
                              <div key={bw.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 10, background: "rgba(2,6,23,0.72)", fontSize: 12 }}>
                                <strong>{bw.name}</strong>
                                <div style={{ textAlign: "right" }}>
                                  <strong style={{ color: "#fbbf24" }}>{bw.wickets}/{bw.runs}</strong>{" "}
                                  <span style={{ color: "var(--muted)" }}>({formatOvers(bw.balls)} ov)</span>
                                  <div style={{ fontSize: 10, color: "#34d399" }}>
                                    {bw.dotBalls || 0} Dots ({bw.balls > 0 ? Math.round(((bw.dotBalls || 0) / bw.balls) * 100) : 0}%) • Econ {bw.balls > 0 ? (bw.runs / (bw.balls / 6)).toFixed(2) : "0.00"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {(() => {
                          const fowList = viewingInn1 ? lm.firstInningsFow || [] : lm.fow || [];
                          const partList = viewingInn1 ? lm.firstInningsPartnerships || [] : lm.partnerships || [];
                          return (
                            <>
                              {(() => {
                                const tp = detectTurningPointOver(lm.history, viewingInn1 ? 1 : lm.innings);
                                const inn1Pace = lm.firstInningsScore !== null ? (lm.firstInningsScore / Math.max(1, lm.totalOvers)).toFixed(2) : null;
                                return (
                                  <>
                                    {tp && (
                                      <div style={{ marginTop: 10, padding: "7px 10px", borderRadius: 10, background: "rgba(245,158,11,0.16)", border: "1px solid rgba(251,191,36,0.45)", fontSize: 11 }}>
                                        <strong style={{ color: "#fbbf24" }}>⚡ TURNING POINT (Over {tp.overNo}):</strong> {tp.runs} runs, {tp.wickets} wkt(s) — {tp.reason}
                                      </div>
                                    )}
                                    {inn1Pace && lm.innings === 2 && (
                                      <div style={{ marginTop: 8, padding: "7px 10px", borderRadius: 10, background: "rgba(56,189,248,0.14)", border: "1px solid rgba(56,189,248,0.35)", fontSize: 11, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                                        <span><strong>1st Inn Rate:</strong> {inn1Pace} RPO</span>
                                        <span><strong>Live Chase Rate:</strong> {lmCrr} RPO</span>
                                      </div>
                                    )}
                                    <WagonWheelCard history={lm.history} innings={viewingInn1 ? 1 : lm.innings} />
                                  </>
                                );
                              })()}
                              {fowList.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: "#fb7185", marginBottom: 6 }}>FALL OF WICKETS</div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {fowList.map((f) => (
                                      <span key={f.wicketNo} className="il-pill" style={{ background: "rgba(244,63,94,0.18)", color: "#fda4af" }}>
                                        {f.wicketNo}-{f.runs} ({f.batter.split(" ")[0]} • {f.overs} ov)
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {partList.length > 0 && (
                                <div style={{ marginTop: 10 }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: "#34d399", marginBottom: 6 }}>PARTNERSHIPS</div>
                                  <div style={{ display: "grid", gap: 4 }}>
                                    {partList.map((pt) => (
                                      <div key={pt.wicketNo} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "5px 9px", borderRadius: 8, background: "rgba(2,6,23,0.7)" }}>
                                        <span>Wkt {pt.wicketNo}: <strong>{pt.batters}</strong></span>
                                        <strong style={{ color: "#34d399" }}>{pt.runs} ({pt.balls})</strong>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    );
                  })()}
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

        {/* DEDICATED IPL MEGA AUCTION TAB */}
        {tab === "auction" && (
          <AuctionRoomView
            players={ws.players}
            clubName={ws.clubName}
            poll={ws.poll}
            currentUser={activeUserInWs}
            isPermanentAdmin={PERMANENT_ADMIN_IDS.includes(authPlayer.id)}
            onAwardAuctionMvp={(playerId, mvpPts) => {
              if (mvpPts === 0) return;
              updateWorkspace((prevWs) => ({
                ...prevWs,
                players: applyAutoBadges(
                  prevWs.players.map((pl) =>
                    pl.id === playerId
                      ? {
                          ...pl,
                          mvpPoints: Math.max(0, pl.mvpPoints + mvpPts),
                          auctionMvpPoints: Math.max(0, (pl.auctionMvpPoints || 0) + mvpPts),
                        }
                      : pl
                  )
                ),
              }));
            }}
            onOpenDj={() => setShowDjModal(true)}
            onPlayWalkout={(url, label) => {
              setDjActiveUrl(url);
              setDjActiveLabel(label);
              setShowDjModal(true);
            }}
            onOpenPoster={(cfg) => setPosterConfig(cfg)}
            onActiveChange={setAuctionLiveActive}
            onLoadTeamsToMatch={(teamAName, teamAIds, teamBName, teamBIds) => {
              const teamAPlayers = ws.players.filter((p) => teamAIds.includes(p.id));
              const teamBPlayers = ws.players.filter((p) => teamBIds.includes(p.id));
              const capA = autoPickCaptains(teamAPlayers);
              const capB = autoPickCaptains(teamBPlayers);
              const scheduled: ScheduledMatch = {
                id: uid("sch"),
                title: "Auction Clash: " + teamAName + " vs " + teamBName,
                dateTime: threeDaysFromNowIso(),
                overs: wizOvers || 10,
                selectedPlayerIds: [...teamAIds, ...teamBIds],
                teamAName,
                teamBName,
                teamAIds,
                teamBIds,
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
                turfRules: { ...wizTurfRules },
              };
              updateWorkspace((prevWs) => ({ ...prevWs, scheduledMatch: scheduled }));
              setTab("match");
            }}
          />
        )}

        {/* SQUAD TAB (STADIUM TRADING CARDS + DIGITAL ID BUTTON) */}
        {tab === "squad" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{ws.clubName} Squad ({ws.players.length})</h2>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Tap any card for stats or tap ID for their scannable barcode pass</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="il-btn"
                  style={{ fontSize: 12 }}
                  onClick={() => {
                    const rosterTxt =
                      ws.clubName +
                      " OFFICIAL SQUAD (" +
                      ws.players.length +
                      ")\n" +
                      ws.players
                        .map(
                          (pl) =>
                            "#" +
                            pl.jerseyNo +
                            " " +
                            pl.name +
                            " (" +
                            pl.role +
                            ", OVR " +
                            computePlayerOvrRating(pl) +
                            ", " +
                            pl.mvpPoints +
                            " MVP)"
                        )
                        .join("\n");
                    handleCopyScorecard(rosterTxt, "roster_exp");
                  }}
                >
                  {copiedCardId === "roster_exp" ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                  {copiedCardId === "roster_exp" ? "Copied Roster" : "Copy Roster"}
                </button>
                <button
                  type="button"
                  className="il-btn il-btn-primary"
                  style={{ fontSize: 12 }}
                  onClick={() => setShowFaceOffModal(true)}
                >
                  ⚔️ Player Face-Off
                </button>
                {isAdmin && (
                  <>
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
                    {isSpinOwner && (
                      <button type="button" className="il-btn il-btn-gold" onClick={() => setShowAddPlayerModal(true)}>
                        <UserPlus size={15} /> Add Player
                      </button>
                    )}
                  </>
                )}
              </div>
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

            {/* SQUAD SEARCH, ROLE FILTER & SORT BAR */}
            <div className="il-card" style={{ padding: 10, marginBottom: 12 }}>
              <div className="il-grid-2 il-resp-1" style={{ gap: 8, marginBottom: 8 }}>
                <input
                  className="il-input"
                  style={{ padding: "8px 10px", fontSize: 13 }}
                  placeholder="🔍 Search player name or jersey #..."
                  value={squadSearch}
                  onChange={(e) => setSquadSearch(e.target.value)}
                />
                <select
                  className="il-select"
                  style={{ padding: "8px 10px", fontSize: 12 }}
                  value={squadSortBy}
                  onChange={(e) => setSquadSortBy(e.target.value as "mvp" | "runs" | "wickets" | "jersey" | "name")}
                >
                  <option value="mvp">Sort: Career MVP</option>
                  <option value="runs">Sort: Most Runs</option>
                  <option value="wickets">Sort: Most Wickets</option>
                  <option value="jersey">Sort: Jersey #</option>
                  <option value="name">Sort: Name A-Z</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {(["ALL", "Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={"il-btn " + (squadRoleFilter === r ? "il-btn-gold" : "")}
                    style={{ padding: "4px 9px", fontSize: 11 }}
                    onClick={() => setSquadRoleFilter(r)}
                  >
                    {r === "ALL" ? "All Roles" : r}
                  </button>
                ))}
              </div>
            </div>

            <div className="il-grid-3 il-resp-2">
              {ws.players
                .filter((p) => {
                  if (squadRoleFilter !== "ALL" && p.role !== squadRoleFilter) return false;
                  const q = squadSearch.trim().toLowerCase();
                  if (!q) return true;
                  return p.name.toLowerCase().includes(q) || String(p.jerseyNo).includes(q);
                })
                .sort((a, b) => {
                  if (squadSortBy === "runs") return b.runs - a.runs;
                  if (squadSortBy === "wickets") return b.wickets - a.wickets;
                  if (squadSortBy === "jersey") return a.jerseyNo - b.jerseyNo;
                  if (squadSortBy === "name") return a.name.localeCompare(b.name);
                  return b.mvpPoints - a.mvpPoints;
                })
                .map((p) => (
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
                      <span className="il-pill" style={{ background: "rgba(251,191,36,0.92)", color: "#050a18", fontSize: 9 }}>
                        OVR {computePlayerOvrRating(p)}
                      </span>
                      {isPlayerOnFire(p) && (
                        <span className="il-pill il-onfire" style={{ fontSize: 9 }}>
                          <Flame size={10} /> ON FIRE
                        </span>
                      )}
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

                    {p.recentForm && p.recentForm.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                        {p.recentForm.slice(0, 3).map((rf, rfIdx) => (
                          <span key={rfIdx} className="il-pill" style={{ fontSize: 8, padding: "2px 5px", background: "rgba(56,189,248,0.16)", color: "#7dd3fc" }}>
                            {rf.runs}{rf.wickets > 0 ? "+" + rf.wickets + "W" : ""}
                          </span>
                        ))}
                      </div>
                    )}

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
                      <button
                        type="button"
                        className="il-btn il-btn-purple"
                        style={{ padding: "6px 7px", fontSize: 11 }}
                        title="Create Player Milestone Poster"
                        onClick={() =>
                          setPosterConfig({
                            mode: "milestone",
                            template: "purple",
                            title: p.name,
                            subtitle: p.role.toUpperCase() + " • " + (p.funAward || "SQUAD LEGEND"),
                            player: p,
                            highlightLine: p.mvpPoints + " MVP PTS • OVR " + computePlayerOvrRating(p),
                            statsLine: p.runs + " Runs • " + p.wickets + " Wkts • " + p.sixes + " Sixes",
                          })
                        }
                      >
                        🎨
                      </button>
                      {isSpinOwner && (
                        <button
                          type="button"
                          className="il-btn il-btn-gold"
                          style={{ padding: "6px 8px", fontSize: 11 }}
                          onClick={() => setEditingPlayer({ ...p })}
                          title="Edit Player (Owner Only)"
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
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", gap: 6 }}>
                    <Trophy size={18} color="#fbbf24" /> {ws.clubName} Leaderboard
                  </div>
                  <button
                    type="button"
                    className="il-btn il-btn-purple"
                    style={{ padding: "4px 9px", fontSize: 11 }}
                    onClick={() =>
                      setPosterConfig({
                        mode: "standings",
                        template: "gold",
                        title: ws.clubName + " " + leaderTab.toUpperCase() + " TOP 5",
                        subtitle: "OFFICIAL CLUB LEADERBOARD",
                        standingsRows: rankedPlayers.slice(0, 5).map((rp, rIdx) => ({
                          rank: rIdx + 1,
                          name: rp.name,
                          value:
                            leaderTab === "batting"
                              ? rp.runs + " R"
                              : leaderTab === "bowling"
                              ? rp.wickets + " W"
                              : leaderTab === "auction"
                              ? (rp.auctionMvpPoints || 0) + " AUC"
                              : rp.mvpPoints + " MVP",
                        })),
                      })
                    }
                  >
                    🎨 Poster
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["mvp", "batting", "bowling", "economy", "iq", "auction"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={"il-btn " + (leaderTab === mode ? "il-btn-gold" : "")}
                      style={{ padding: "6px 10px", fontSize: 11, textTransform: "uppercase" }}
                      onClick={() => setLeaderTab(mode)}
                    >
                      {mode === "iq" ? "Cricket IQ" : mode === "auction" ? "Auction MVP" : mode}
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
                      : leaderTab === "iq"
                      ? ((ws.predictionPoints && ws.predictionPoints[pl.name]) || 0) + " IQ Pts"
                      : leaderTab === "auction"
                      ? (pl.auctionMvpPoints || 0) + " Auc MVP"
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

            {/* ALL-TIME CLUB AGGREGATE TOTALS BAR */}
            <div className="il-grid-4 il-resp-2" style={{ marginBottom: 12 }}>
              <div className="il-kpi" style={{ textAlign: "center", padding: 10 }}>
                <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 800 }}>CLUB RUNS</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#38bdf8" }}>{ws.players.reduce((s, p) => s + p.runs, 0)}</div>
              </div>
              <div className="il-kpi" style={{ textAlign: "center", padding: 10 }}>
                <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 800 }}>CLUB WKTS</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#c084fc" }}>{ws.players.reduce((s, p) => s + p.wickets, 0)}</div>
              </div>
              <div className="il-kpi" style={{ textAlign: "center", padding: 10 }}>
                <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 800 }}>TOTAL 4s</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#34d399" }}>{ws.players.reduce((s, p) => s + p.fours, 0)}</div>
              </div>
              <div className="il-kpi" style={{ textAlign: "center", padding: 10 }}>
                <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 800 }}>TOTAL 6s</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fbbf24" }}>{ws.players.reduce((s, p) => s + p.sixes, 0)}</div>
              </div>
            </div>

            <div className="il-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(["ALL", "Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"] as const).map((rf) => (
                    <button
                      key={rf}
                      type="button"
                      className={"il-btn " + (leaderRoleFilter === rf ? "il-btn-primary" : "")}
                      style={{ padding: "3px 8px", fontSize: 10 }}
                      onClick={() => setLeaderRoleFilter(rf)}
                    >
                      {rf === "ALL" ? "All Roles" : rf}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="il-btn"
                  style={{ padding: "4px 8px", fontSize: 10 }}
                  onClick={() => {
                    const hdr = "Rank,Name,Jersey,Role,Matches,Runs,Wickets,MVP,AuctionMVP\n";
                    const body = rankedPlayers
                      .map((p, i) => [i + 1, '"' + p.name + '"', p.jerseyNo, p.role, p.matches, p.runs, p.wickets, p.mvpPoints, p.auctionMvpPoints || 0].join(","))
                      .join("\n");
                    const blob = new Blob([hdr + body], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "indore-legends-leaderboard.csv";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download size={11} /> Export CSV
                </button>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {rankedPlayers
                  .filter((pl) => leaderRoleFilter === "ALL" || pl.role === leaderRoleFilter)
                  .map((pl, index) => (
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
                          : leaderTab === "iq"
                          ? ((ws.predictionPoints && ws.predictionPoints[pl.name]) || 0) + " IQ"
                          : leaderTab === "auction"
                          ? (pl.auctionMvpPoints || 0) + " Auc MVP"
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

            <div className="il-card il-hero-banner">
              <div style={{ fontWeight: 900, fontSize: 16, color: "#fbbf24", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <Crown size={17} /> Club Hall of Fame (All-Time Records)
              </div>
              <div className="il-grid-2 il-resp-1" style={{ gap: 8 }}>
                <div style={{ background: "rgba(2,6,23,0.8)", padding: 10, borderRadius: 12, border: "1px solid rgba(251,191,36,0.35)" }}>
                  <div style={{ fontSize: 10, color: "#fbbf24", fontWeight: 800 }}>HIGHEST INDIVIDUAL SCORE</div>
                  <div style={{ fontWeight: 900, fontSize: 14, marginTop: 3 }}>
                    {ws.records?.highestScore ? ws.records.highestScore.player : "Unclaimed"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {ws.records?.highestScore ? ws.records.highestScore.detail : "Score big in a match to claim!"}
                  </div>
                </div>
                <div style={{ background: "rgba(2,6,23,0.8)", padding: 10, borderRadius: 12, border: "1px solid rgba(167,139,250,0.35)" }}>
                  <div style={{ fontSize: 10, color: "#c4b5fd", fontWeight: 800 }}>BEST BOWLING FIGURES</div>
                  <div style={{ fontWeight: 900, fontSize: 14, marginTop: 3 }}>
                    {ws.records?.bestBowling ? ws.records.bestBowling.player : "Unclaimed"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {ws.records?.bestBowling ? ws.records.bestBowling.detail : "Take a match-winning spell!"}
                  </div>
                </div>
                <div style={{ background: "rgba(2,6,23,0.8)", padding: 10, borderRadius: 12, border: "1px solid rgba(56,189,248,0.35)" }}>
                  <div style={{ fontSize: 10, color: "#7dd3fc", fontWeight: 800 }}>MOST SIXES IN AN INNINGS</div>
                  <div style={{ fontWeight: 900, fontSize: 14, marginTop: 3 }}>
                    {ws.records?.mostSixesInnings ? ws.records.mostSixesInnings.player : "Unclaimed"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {ws.records?.mostSixesInnings ? ws.records.mostSixesInnings.detail : "Clear the boundary rope!"}
                  </div>
                </div>
                <div style={{ background: "rgba(2,6,23,0.8)", padding: 10, borderRadius: 12, border: "1px solid rgba(52,211,153,0.35)" }}>
                  <div style={{ fontSize: 10, color: "#6ee7b7", fontWeight: 800 }}>HIGHEST TEAM TOTAL</div>
                  <div style={{ fontWeight: 900, fontSize: 14, marginTop: 3 }}>
                    {ws.records?.highestTeamTotal ? ws.records.highestTeamTotal.team : "Unclaimed"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {ws.records?.highestTeamTotal ? ws.records.highestTeamTotal.detail : "Post a monster team total!"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FINANCE / TREASURY TAB */}
        {tab === "treasury" && (
          <div>
            <div className="il-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                  <Wallet size={16} color="#34d399" /> {ws.clubName} Treasury
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="il-btn"
                    style={{ padding: "5px 9px", fontSize: 11 }}
                    onClick={() => {
                      const dueLines = ws.players
                        .filter((p) => p.finesDue > 0)
                        .map((p) => "- " + p.name + ": Rs." + p.finesDue)
                        .join("\n");
                      const report =
                        ws.clubName +
                        " TREASURY REPORT\nNet Balance: Rs." +
                        clubNetBalance +
                        "\nCredits: Rs." +
                        totalCredits +
                        " | Fines: Rs." +
                        totalFines +
                        " | Advances: Rs." +
                        totalAdvances +
                        " | Expenses: Rs." +
                        totalExpenses +
                        "\nPending Dues:\n" +
                        (dueLines || "All Clear!");
                      handleCopyScorecard(report, "fund_rep");
                    }}
                  >
                    {copiedCardId === "fund_rep" ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    {copiedCardId === "fund_rep" ? "Copied!" : "Copy Report"}
                  </button>
                  {ws.players.some((p) => p.finesDue > 0) && (
                    <a
                      href={
                        "https://wa.me/?text=" +
                        encodeURIComponent(
                          ws.clubName +
                            " PENDING DUES REMINDER\n" +
                            ws.players
                              .filter((p) => p.finesDue > 0)
                              .map((p) => "• " + p.name + ": Rs." + p.finesDue)
                              .join("\n") +
                            "\nPlease clear your turf dues soon! 🙏"
                        )
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="il-btn il-btn-gold"
                      style={{ textDecoration: "none", padding: "5px 9px", fontSize: 11 }}
                    >
                      <Share2 size={12} /> Remind All
                    </a>
                  )}
                  <button
                    type="button"
                    className="il-btn"
                    style={{ padding: "5px 9px", fontSize: 11 }}
                    onClick={() => {
                      const hdr = "Date,Title,Type,Member,Amount_INR\n";
                      const body = ws.treasury
                        .map((t) => [t.date, '"' + t.title + '"', t.type, '"' + t.memberName + '"', t.amount].join(","))
                        .join("\n");
                      const blob = new Blob([hdr + body], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "indore-legends-treasury.csv";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download size={12} /> CSV
                  </button>
                  {isAdmin && ws.players.some((p) => p.finesDue > 0) && (
                    <button
                      type="button"
                      className="il-btn il-btn-emerald"
                      style={{ padding: "5px 9px", fontSize: 11 }}
                      onClick={() =>
                        requireAdminPin("Mark ALL Squad Dues Paid & Credit Treasury", () => {
                          const totalCleared = ws.players.reduce((s, p) => s + p.finesDue, 0);
                          if (totalCleared <= 0) return;
                          const entry: TreasuryEntry = {
                            id: uid("tr"),
                            title: "Bulk Squad Dues Settlement",
                            type: "CREDIT",
                            amount: totalCleared,
                            memberName: "All Squad",
                            date: new Date().toISOString().slice(0, 10),
                          };
                          updateWorkspace((prevWs) => ({
                            ...prevWs,
                            treasury: [entry, ...prevWs.treasury],
                            players: prevWs.players.map((pl) => ({ ...pl, finesDue: 0 })),
                          }));
                        })
                      }
                    >
                      <CheckCircle size={12} /> Clear All Dues
                    </button>
                  )}
                </div>
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
                              <>
                                <input
                                  className="il-input"
                                  type="number"
                                  min={1}
                                  max={p.finesDue}
                                  placeholder="Part Rs."
                                  style={{ width: 74, padding: "5px 6px", fontSize: 11 }}
                                  value={partialPayAmounts[p.id] || ""}
                                  onChange={(e) =>
                                    setPartialPayAmounts((prev) => ({ ...prev, [p.id]: e.target.value }))
                                  }
                                />
                                <button
                                  type="button"
                                  className="il-btn il-btn-primary"
                                  style={{ padding: "5px 8px", fontSize: 11 }}
                                  onClick={() => {
                                    const amt = Math.min(p.finesDue, Math.max(0, Number(partialPayAmounts[p.id] || 0)));
                                    if (amt <= 0) return;
                                    requireAdminPin("Record Partial Payment Rs." + amt + " from " + p.name, () => {
                                      const entry: TreasuryEntry = {
                                        id: uid("tr"),
                                        title: "Partial Payment (" + p.name + ")",
                                        type: "CREDIT",
                                        amount: amt,
                                        memberName: p.name,
                                        date: new Date().toISOString().slice(0, 10),
                                      };
                                      updateWorkspace((prevWs) => ({
                                        ...prevWs,
                                        treasury: [entry, ...prevWs.treasury],
                                        players: prevWs.players.map((pl) =>
                                          pl.id === p.id ? { ...pl, finesDue: Math.max(0, pl.finesDue - amt) } : pl
                                        ),
                                      }));
                                      setPartialPayAmounts((prev) => ({ ...prev, [p.id]: "" }));
                                    });
                                  }}
                                >
                                  Pay Part
                                </button>
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
                              </>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <div style={{ fontWeight: 800 }}>Ledger History ({ws.treasury.length})</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(["ALL", "CREDIT", "FINE", "EXPENSE", "ADVANCE"] as const).map((lt) => (
                    <button
                      key={lt}
                      type="button"
                      className={"il-btn " + (treasuryFilter === lt ? "il-btn-gold" : "")}
                      style={{ padding: "3px 7px", fontSize: 10 }}
                      onClick={() => setTreasuryFilter(lt)}
                    >
                      {lt}
                    </button>
                  ))}
                </div>
              </div>
              {ws.treasury.filter((t) => treasuryFilter === "ALL" || t.type === treasuryFilter).length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--muted)" }}>No transactions recorded for this filter.</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {ws.treasury
                    .filter((t) => treasuryFilter === "ALL" || t.type === treasuryFilter)
                    .map((t) => (
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

        {/* CHAT TAB (LOCKER-ROOM CHAT 2.0) */}
        {tab === "chat" && (() => {
          const clearedAfter = ws.chatClearedAtMs || 0;
          const allVisible: ChatMessage[] =
            cloudMessages !== null
              ? cloudMessages.filter((m) => (m.createdAtMs || 0) > clearedAfter)
              : ws.messages;
          const filteredByMode =
            chatFilterMode === "mentions"
              ? allVisible.filter((m) => m.text.includes("@" + authPlayer.name.split(" ")[0]))
              : chatFilterMode === "scores"
              ? allVisible.filter((m) => m.text.includes("LIVE SCORE") || m.text.includes("POLL CHECK") || m.text.includes("SOLD"))
              : allVisible;
          const visibleMessages = chatSearch.trim()
            ? filteredByMode.filter(
                (m) =>
                  m.text.toLowerCase().includes(chatSearch.trim().toLowerCase()) ||
                  m.sender.toLowerCase().includes(chatSearch.trim().toLowerCase())
              )
            : filteredByMode;
          const isOnlineSync = chatStatus === "Live Sync";

          const sendQuickLockerMsg = (bodyText: string) => {
            const clean = bodyText.trim();
            if (!clean || chatSending) return;
            const finalBody = chatReplyTo
              ? "↪️ @" + chatReplyTo.sender.split(" ")[0] + " (\"" + chatReplyTo.text.slice(0, 36) + "\"): " + clean
              : clean;
            const ts = nowTime();
            const tempId = uid("m");
            const optimisticMsg: CloudChatMessage = {
              id: tempId,
              sender: authPlayer.name,
              text: finalBody,
              timestamp: ts,
              workspace,
              createdAtMs: Date.now(),
            };
            setChatText("");
            setChatReplyTo(null);
            setChatSending(true);
            setCloudMessages((prev) => (prev !== null ? [...prev, optimisticMsg] : [optimisticMsg]));
            updateWorkspace((prevWs) => ({
              ...prevWs,
              messages: [...prevWs.messages, { id: tempId, sender: authPlayer.name, text: finalBody, timestamp: ts }],
            }));
            void sendCloudLockerMessage({
              workspace,
              sender: authPlayer.name,
              text: finalBody,
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
          };

          const startChatVoiceDictation = () => {
            const win = window as unknown as {
              SpeechRecognition?: new () => SpeechRecognitionLike;
              webkitSpeechRecognition?: new () => SpeechRecognitionLike;
            };
            const Rec = win.SpeechRecognition || win.webkitSpeechRecognition;
            if (!Rec) return;
            try {
              const rec = new Rec();
              rec.lang = "en-IN";
              rec.interimResults = false;
              rec.maxAlternatives = 1;
              rec.onresult = (ev) => {
                const spoken = ev.results[0]?.[0]?.transcript || "";
                if (spoken) setChatText((prev) => (prev ? prev + " " + spoken : spoken));
              };
              rec.onerror = () => setChatMicActive(false);
              rec.onend = () => setChatMicActive(false);
              setChatMicActive(true);
              rec.start();
            } catch {
              setChatMicActive(false);
            }
          };

          return (
            <div className="il-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                  <MessageSquare size={16} color="#38bdf8" /> {ws.clubName} Locker-Room Chat 2.0
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span
                    className="il-pill"
                    style={{
                      background: isOnlineSync ? "rgba(52,211,153,0.18)" : "rgba(251,191,36,0.18)",
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
                        .catch(() => setChatStatus("Local Fallback"));
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
                        requireAdminPin("Delete All Chat Messages in " + ws.clubName, handleClearChat)
                      }
                      title="Delete Chat"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* ACTIVE SQUAD PRESENCE & @MENTION PICKER STRIP */}
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid rgba(148,163,184,0.16)" }}>
                {ws.players.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    className="il-btn"
                    style={{ padding: "4px 8px", fontSize: 10, flexShrink: 0 }}
                    onClick={() => setChatText((prev) => (prev ? prev + " @" + pl.name.split(" ")[0] + " " : "@" + pl.name.split(" ")[0] + " "))}
                    title={"Tap to @mention " + pl.name}
                  >
                    <PlayerAvatar playerId={pl.id} name={pl.name} size={18} rounded />
                    <span>@{pl.name.split(" ")[0]}</span>
                    <span style={{ color: "#fbbf24" }}>#{pl.jerseyNo}</span>
                  </button>
                ))}
              </div>

              {/* PINNED MATCH / CALLOUT NOTICE BAR */}
              {ws.chatPinnedMessage && (
                <div style={{ marginBottom: 8, padding: "7px 10px", borderRadius: 10, background: "rgba(251,191,36,0.16)", border: "1px solid rgba(251,191,36,0.5)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span>📌 <strong>PINNED:</strong> {ws.chatPinnedMessage}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      className="il-btn"
                      style={{ padding: "2px 6px", fontSize: 10 }}
                      onClick={() => updateWorkspace((prevWs) => ({ ...prevWs, chatPinnedMessage: "" }))}
                    >
                      Unpin
                    </button>
                  )}
                </div>
              )}

              {/* SEARCH + 1-TAP SHARE LIVE SCORE / POLL */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                <input
                  className="il-input"
                  style={{ flex: 1, minWidth: 150, padding: "6px 10px", fontSize: 12 }}
                  placeholder="🔍 Search messages or sender..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                />
                <button
                  type="button"
                  className="il-btn il-btn-gold"
                  style={{ padding: "6px 9px", fontSize: 11 }}
                  onClick={() => {
                    const scoreMsg = lm
                      ? "🏏 LIVE SCORE: " +
                        lm.battingTeam +
                        " " +
                        lm.runs +
                        "/" +
                        lm.wickets +
                        " (" +
                        formatOvers(lm.balls) +
                        "/" +
                        lm.totalOvers +
                        " ov, CRR " +
                        lmCrr +
                        ") • Striker: " +
                        lm.striker.split(" ")[0]
                      : "🏏 MATCH UPDATE: " +
                        (ws.scheduledMatch
                          ? ws.scheduledMatch.title + " (" + ws.scheduledMatch.teamAName + " vs " + ws.scheduledMatch.teamBName + ")"
                          : "No live match right now — ready for the next clash!");
                    sendQuickLockerMsg(scoreMsg);
                  }}
                >
                  📊 Post Score
                </button>
                <button
                  type="button"
                  className="il-btn il-btn-emerald"
                  style={{ padding: "6px 9px", fontSize: 11 }}
                  onClick={() => {
                    const inCount = ws.poll.filter((v) => v.choice === "IN").length;
                    const maybeCount = ws.poll.filter((v) => v.choice === "MAYBE").length;
                    sendQuickLockerMsg(
                      "📋 POLL CHECK: " +
                        inCount +
                        " IN • " +
                        maybeCount +
                        " MAYBE! Vote on Dashboard if you haven't yet! 🏏"
                    );
                  }}
                >
                  📋 Post Poll
                </button>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                {(["all", "mentions", "scores"] as const).map((fm) => (
                  <button
                    key={fm}
                    type="button"
                    className={"il-btn " + (chatFilterMode === fm ? "il-btn-primary" : "")}
                    style={{ padding: "3px 8px", fontSize: 10, textTransform: "uppercase" }}
                    onClick={() => setChatFilterMode(fm)}
                  >
                    {fm === "all" ? "All Chat" : fm === "mentions" ? "@Mentions" : "Scores/Polls"}
                  </button>
                ))}
                <button
                  type="button"
                  className="il-btn"
                  style={{ padding: "3px 8px", fontSize: 10 }}
                  onClick={() => sendQuickLockerMsg("📍 Reached Ground! Who else is here?")}
                >
                  📍 Reached
                </button>
                <button
                  type="button"
                  className="il-btn"
                  style={{ padding: "3px 8px", fontSize: 10 }}
                  onClick={() => sendQuickLockerMsg("🛵 5 Mins Away!")}
                >
                  🛵 5 Min Away
                </button>
              </div>

              <div className="il-scroll-box">
                {visibleMessages.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>
                    {chatSearch ? "No matching messages." : "No messages yet. Start the squad chat!"}
                  </div>
                ) : (
                  visibleMessages.map((m) => {
                    const senderPl = ws.players.find((p) => p.name === m.sender);
                    const hasMention = m.text.includes("@" + authPlayer.name.split(" ")[0]);
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: m.sender === authPlayer.name ? "flex-end" : "flex-start",
                          maxWidth: "88%",
                          background: hasMention
                            ? "rgba(245,158,11,0.22)"
                            : m.sender === authPlayer.name
                            ? "rgba(37,99,235,0.28)"
                            : "rgba(2,6,23,0.75)",
                          border: "1px solid " + (hasMention ? "rgba(251,191,36,0.7)" : "var(--border)"),
                          padding: "9px 12px",
                          borderRadius: 12,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, fontSize: 11, marginBottom: 3 }}>
                          <strong style={{ color: "var(--gold)" }}>
                            {m.sender} {senderPl ? "#" + senderPl.jerseyNo : ""}
                          </strong>
                          <span style={{ color: "var(--muted)", fontSize: 10 }}>{m.timestamp}</span>
                        </div>
                        <div style={{ fontSize: 14, wordBreak: "break-word" }}>{m.text}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 5, fontSize: 10 }}>
                          {(["🔥", "👏", "😂", "🏏"] as const).map((emo) => {
                            const cnt = (ws.chatReactions && ws.chatReactions[m.id] && ws.chatReactions[m.id][emo]) || 0;
                            return (
                              <button
                                key={emo}
                                type="button"
                                style={{
                                  background: cnt > 0 ? "rgba(251,191,36,0.22)" : "rgba(2,6,23,0.5)",
                                  border: "1px solid var(--border)",
                                  borderRadius: 99,
                                  color: "#f8fafc",
                                  cursor: "pointer",
                                  padding: "1px 6px",
                                  fontSize: 10,
                                }}
                                onClick={() =>
                                  updateWorkspace((prevWs) => {
                                    const allR = { ...(prevWs.chatReactions || {}) };
                                    const msgR = { ...(allR[m.id] || {}) };
                                    msgR[emo] = (msgR[emo] || 0) + 1;
                                    allR[m.id] = msgR;
                                    return { ...prevWs, chatReactions: allR };
                                  })
                                }
                              >
                                {emo} {cnt > 0 ? cnt : ""}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            style={{ background: "none", border: "none", color: "#7dd3fc", cursor: "pointer", padding: 0, fontWeight: 700 }}
                            onClick={() => setChatReplyTo({ sender: m.sender, text: m.text })}
                          >
                            ↩ Reply
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              style={{ background: "none", border: "none", color: "#fbbf24", cursor: "pointer", padding: 0, fontWeight: 700 }}
                              onClick={() =>
                                updateWorkspace((prevWs) => ({
                                  ...prevWs,
                                  chatPinnedMessage: m.sender.split(" ")[0] + ": " + m.text,
                                }))
                              }
                            >
                              📌 Pin
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* STRUCTURED SQUAD MESSAGE TEMPLATES (1-TAP) */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: "#7dd3fc", alignSelf: "center" }}>TEMPLATES:</span>
                {[
                  { label: "🏟️ Match Callout", text: "🏟️ MATCH CALLOUT: Reach ground 15 mins early today! Vote IN/OUT on Dashboard ASAP! 🏏" },
                  { label: "🎒 Kit Check", text: "🎒 KIT CHECK: Who is bringing Wind Balls, Bats, and Stumps today? Reply here!" },
                  { label: "💰 Dues Notice", text: "💰 TREASURY REMINDER: Please check Finance tab and clear pending turf splits/dues today. 🙏" },
                  { label: "🌧️ Weather Check", text: "🌧️ WEATHER CHECK: How is the pitch & ground condition right now? Anyone near the turf?" },
                  { label: "🪙 Toss Ready", text: "🪙 TOSS TIME: Captains gather at the pitch! Live scoring starts in 5 minutes! 🔥" },
                  { label: "🎬 Highlights", text: "🎬 CRICKRUSH FILMING: Keep phone stands ready — capturing match highlights & sixes today! 📹" },
                ].map((tplMsg) => (
                  <button
                    key={tplMsg.label}
                    type="button"
                    className="il-btn"
                    style={{ padding: "3px 7px", fontSize: 10, borderColor: "rgba(56,189,248,0.4)" }}
                    onClick={() => setChatText(tplMsg.text)}
                  >
                    {tplMsg.label}
                  </button>
                ))}
              </div>

              {/* EXPANDED TURF BANTER CHIPS */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
                {["6️⃣ SIX!", "4️⃣ FOUR!", "☝️ OUT!", "👏 WP!", "🤝 GG", "🏟️ TURF?", "🛵 ON MY WAY", "🏏 BRING BALL", "🔥 FIRE!"].map((hype) => (
                  <button
                    key={hype}
                    type="button"
                    className="il-btn"
                    style={{ padding: "4px 8px", fontSize: 10 }}
                    onClick={() => sendQuickLockerMsg(hype)}
                  >
                    {hype}
                  </button>
                ))}
              </div>

              {chatReplyTo && (
                <div style={{ marginTop: 8, padding: "5px 10px", borderRadius: 9, background: "rgba(56,189,248,0.16)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                  <span>Replying to <strong>{chatReplyTo.sender.split(" ")[0]}</strong>: &quot;{chatReplyTo.text.slice(0, 42)}&quot;</span>
                  <button type="button" className="il-btn" style={{ padding: "2px 6px", fontSize: 10 }} onClick={() => setChatReplyTo(null)}>
                    <X size={11} />
                  </button>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendQuickLockerMsg(chatText);
                }}
                style={{ display: "flex", gap: 6, marginTop: 10 }}
              >
                <button
                  type="button"
                  className={"il-btn " + (chatMicActive ? "il-btn-danger" : "il-btn-purple")}
                  style={{ padding: "8px 10px" }}
                  onClick={startChatVoiceDictation}
                  title="Voice-to-Text Dictation"
                >
                  {chatMicActive ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
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
              {["MVP leader and caps", "Who should I buy in auction?", "Club balance and dues", "Who is IN poll?", "Live score", "Top rivalries", "Hall of Fame records", "Best Playing XI strategy"].map((chip) => (
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
                      <button
                        type="button"
                        className="il-btn il-btn-primary"
                        onClick={() => setPreviewMaintenance(true)}
                      >
                        <Eye size={14} /> Preview Maintenance Timer
                      </button>
                    </div>

                    {/* MAINTENANCE COUNTDOWN MESSAGE & TARGET ETA CONTROLS */}
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(148,163,184,0.2)", display: "grid", gap: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "#7dd3fc" }}>
                        MAINTENANCE &amp; LAUNCH COUNTDOWN CONFIG (SYNCED TO ALL DEVICES)
                      </div>
                      <input
                        className="il-input"
                        style={{ fontSize: 12, padding: "8px 10px" }}
                        placeholder={state.maintenanceMessage || "Custom maintenance countdown message..."}
                        value={maintMsgDraft}
                        onChange={(e) => setMaintMsgDraft(e.target.value)}
                      />
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {[
                          { l: "🚀 Launch Lock", t: "🚨🔥 FINAL HOUR PRE-LAUNCH LOCKDOWN! Fireworks & live stadium launch at 4:00 PM IST! ⚡🏏🏆" },
                          { l: "🎡 29th Spin", t: "🎡 Month-end 29th Spin-the-Wheel rotation in progress! Appointing our new Monthly Admin shortly." },
                          { l: "🔨 Auction Sync", t: "🔨 Upgrading Mega Auction 30,000 LC purses & Captain rosters. Going live shortly!" },
                          { l: "📊 Scorecard Patch", t: "📊 Deploying Scorecard 2.0 & Wagon Wheel upgrades. Back online in a few minutes!" },
                          { l: "⚡ Quick Sync", t: "⚡ Quick cloud sync & turf database calibration in progress. Stay tuned!" },
                        ].map((mt) => (
                          <button
                            key={mt.l}
                            type="button"
                            className="il-btn"
                            style={{ padding: "3px 7px", fontSize: 10 }}
                            onClick={() => setMaintMsgDraft(mt.t)}
                          >
                            {mt.l}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        <input
                          className="il-input"
                          style={{ flex: 1, minWidth: 180, fontSize: 12, padding: "7px 9px" }}
                          type="datetime-local"
                          value={maintTimeDraft.slice(0, 16)}
                          onChange={(e) => setMaintTimeDraft(e.target.value + ":00+05:30")}
                        />
                        <button
                          type="button"
                          className="il-btn il-btn-gold"
                          style={{ padding: "7px 11px", fontSize: 11 }}
                          onClick={() => {
                            setState((prev) => ({
                              ...prev,
                              maintenanceMessage: maintMsgDraft.trim() || prev.maintenanceMessage,
                              maintenanceTargetTime: maintTimeDraft || DEFAULT_LAUNCH_TIME,
                            }));
                            setSettingsSavedMsg("Maintenance countdown & message synced!");
                          }}
                        >
                          Save Timer
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="il-btn"
                          style={{ padding: "4px 8px", fontSize: 10 }}
                          onClick={() => {
                            const t = "2026-11-28T16:00:00+05:30";
                            setMaintTimeDraft(t);
                            setState((prev) => ({ ...prev, maintenanceTargetTime: t }));
                          }}
                        >
                          Today 4:00 PM
                        </button>
                        <button
                          type="button"
                          className="il-btn"
                          style={{ padding: "4px 8px", fontSize: 10 }}
                          onClick={() => {
                            const t = "2026-11-28T17:00:00+05:30";
                            setMaintTimeDraft(t);
                            setState((prev) => ({ ...prev, maintenanceTargetTime: t }));
                          }}
                        >
                          Today 5:00 PM
                        </button>
                        <button
                          type="button"
                          className="il-btn"
                          style={{ padding: "4px 8px", fontSize: 10 }}
                          onClick={() => {
                            const t = "2026-11-29T15:00:00+05:30";
                            setMaintTimeDraft(t);
                            setState((prev) => ({ ...prev, maintenanceTargetTime: t }));
                          }}
                        >
                          Nov 29 • 3:00 PM
                        </button>
                      </div>
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
                      const isLockedPerm = PERMANENT_ADMIN_IDS.includes(p.id) && !isSpinOwner;
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
                              {isLockedPerm
                                ? "Protected Permanent Admin"
                                : hasCustom
                                ? "Custom Password Active"
                                : "Default (" + p.defaultPass + ")"}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={!hasCustom || isLockedPerm}
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

                {isSpinOwner && (
                  <div className="il-card">
                    <div style={{ fontWeight: 900, marginBottom: 10, display: "flex", alignItems: "center", gap: 6, color: "#fbbf24" }}>
                      <Shield size={16} /> Manage Club Admins (Owner Only)
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                      Gaurav (Owner) & Granth (Permanent Admin) are permanently locked and cannot be modified by anyone.
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {allIlPlayers.map((p) => {
                        const isPerm = PERMANENT_ADMIN_IDS.includes(p.id);
                        return (
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
                                <div style={{ fontSize: 11, color: isPerm ? "#fbbf24" : p.isAdmin ? "#34d399" : "var(--muted)" }}>
                                  {p.id === SPIN_OWNER_ID
                                    ? "Owner • Permanent Admin"
                                    : isPerm
                                    ? "Permanent Admin"
                                    : p.isAdmin
                                    ? "Monthly Admin"
                                    : "Player"}
                                </div>
                              </div>
                            </div>
                            {isPerm ? (
                              <span
                                className="il-pill"
                                style={{
                                  background: "rgba(251,191,36,0.18)",
                                  color: "#fbbf24",
                                  border: "1px solid rgba(251,191,36,0.5)",
                                }}
                              >
                                <Lock size={10} /> Locked
                              </span>
                            ) : (
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
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                        {[
                          { l: "🏏 Match Day", t: "🏏 MATCH DAY ALERT: Report to the ground on time! Vote IN on the Dashboard poll!" },
                          { l: "🔨 Mega Auction", t: "🔨 IPL MEGA AUCTION LIVE: 30,000 LC Purse per Franchise! Captains take your seats!" },
                          { l: "🎆 Launch Live", t: "🎆 INDORE LEGENDS IS OFFICIALLY LIVE! Welcome to Season 2026-27 — Together We Rise!" },
                          { l: "💰 Turf Dues", t: "💰 TREASURY UPDATE: Please settle pending turf booking splits in the Finance tab today." },
                          { l: "🏆 Cup Finals", t: "🏆 TOURNAMENT FINALS TODAY: Double points, Live Broadcast Scorecard & Trophy Poster!" },
                          { l: "☀️ Morning Net", t: "☀️ MORNING PRACTICE: 6:30 AM sharp at home ground — wind-ball drills & fielding!" },
                        ].map((at) => (
                          <button
                            key={at.l}
                            type="button"
                            className="il-btn"
                            style={{ padding: "3px 7px", fontSize: 10 }}
                            onClick={() => setAnnouncementDraft(at.t)}
                          >
                            {at.l}
                          </button>
                        ))}
                      </div>
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
                          requireAdminPin(
                            "Clear Player Stats, Matches & Chat (Keeps Monthly Admin & Spin Info)",
                            resetStatsAndChatOnly
                          )
                        }
                      >
                        <RotateCcw size={15} /> Clear Stats & Chat Only
                      </button>
                    </div>

                    {settingsSavedMsg && (
                      <div style={{ fontSize: 12, color: "var(--emerald)", fontWeight: 700 }}>{settingsSavedMsg}</div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* APP DIAGNOSTICS & STORAGE PANEL */}
            <div className="il-card">
              <div style={{ fontWeight: 900, fontSize: 14, color: "#7dd3fc", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Activity size={15} /> V7 App Diagnostics &amp; Cache Control
              </div>
              <div className="il-grid-3" style={{ gap: 8, textAlign: "center", marginBottom: 10 }}>
                <div style={{ background: "rgba(2,6,23,0.75)", padding: 8, borderRadius: 10 }}>
                  <div style={{ fontSize: 9, color: "var(--muted)" }}>STORAGE USED</div>
                  <div style={{ fontWeight: 900, fontSize: 13, color: "#fbbf24" }}>
                    {Math.round(JSON.stringify(state).length / 1024)} KB
                  </div>
                </div>
                <div style={{ background: "rgba(2,6,23,0.75)", padding: 8, borderRadius: 10 }}>
                  <div style={{ fontSize: 9, color: "var(--muted)" }}>CLOUD SYNC</div>
                  <div style={{ fontWeight: 900, fontSize: 12, color: "#34d399" }}>{cloudSyncStatus}</div>
                </div>
                <div style={{ background: "rgba(2,6,23,0.75)", padding: 8, borderRadius: 10 }}>
                  <div style={{ fontSize: 9, color: "var(--muted)" }}>AUCTION BIN</div>
                  <div style={{ fontWeight: 900, fontSize: 11, color: "#a78bfa" }}>Connected</div>
                </div>
              </div>
              <button
                type="button"
                className="il-btn"
                style={{ width: "100%", fontSize: 12 }}
                onClick={() => {
                  if ("caches" in window) {
                    void caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k)))).finally(() => window.location.reload());
                  } else {
                    window.location.reload();
                  }
                }}
              >
                <RotateCcw size={14} /> Force Refresh App Cache (PWA/APK)
              </button>
            </div>
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
                const maxOvCap = lm.turfRules?.maxOversPerBowler || 0;
                const quotaFull = maxOvCap > 0 && bw.balls >= maxOvCap * 6;
                const isDisabled = (justBowled || quotaFull) && lm.bowlingPlayers.length > 1;
                const matchedPlayer = ws.players.find((p) => p.name === name);
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={isDisabled}
                    className={"il-btn " + (name === lm.bowler ? "il-btn-primary" : "")}
                    style={{
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      opacity: isDisabled ? 0.45 : 1,
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

              <div>
                <label style={{ fontSize: 10, color: "#34d399", fontWeight: 800 }}>WALKOUT ANTHEM URL (SPOTIFY / YOUTUBE)</label>
                <input
                  className="il-input"
                  placeholder="https://open.spotify.com/track/... or YouTube link"
                  value={editingPlayer.walkoutUrl || ""}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, walkoutUrl: e.target.value })}
                />
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
                <div style={{ display: "grid", gap: 10 }}>
                  <div className="il-grid-2" style={{ textAlign: "center" }}>
                    <div style={{ background: "rgba(2,6,23,0.78)", padding: 12, borderRadius: 12 }}>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>BOUNDARIES</div>
                      <div style={{ fontSize: 16, fontWeight: 900 }}>
                        {selectedProfile.fours} Fours • {selectedProfile.sixes} Sixes
                      </div>
                    </div>
                    <div style={{ background: "rgba(2,6,23,0.78)", padding: 12, borderRadius: 12 }}>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>AVG &amp; HIGHEST</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#38bdf8" }}>
                        Avg {selectedProfile.matches > 0 ? (selectedProfile.runs / selectedProfile.matches).toFixed(1) : "0.0"} • HS {selectedProfile.highestScore || 0}
                      </div>
                    </div>
                    <div style={{ background: "rgba(2,6,23,0.78)", padding: 12, borderRadius: 12 }}>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>AUCTION MVP</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#fbbf24" }}>
                        +{selectedProfile.auctionMvpPoints || 0} Pts
                      </div>
                    </div>
                    <div style={{ background: "rgba(2,6,23,0.78)", padding: 12, borderRadius: 12 }}>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>CLUB WALLET</div>
                      <div style={{ fontSize: 13, fontWeight: 900 }}>
                        Due Rs.{selectedProfile.finesDue} / Adv Rs.{selectedProfile.advanceCredit}
                      </div>
                    </div>
                  </div>
                  <a
                    href={
                      "https://wa.me/?text=" +
                      encodeURIComponent(
                        ws.clubName +
                          " PLAYER CARD: " +
                          selectedProfile.name +
                          " (#" +
                          selectedProfile.jerseyNo +
                          ", " +
                          selectedProfile.role +
                          ")\nMatches: " +
                          selectedProfile.matches +
                          " | Runs: " +
                          selectedProfile.runs +
                          " | Wkts: " +
                          selectedProfile.wickets +
                          " | MVP: " +
                          selectedProfile.mvpPoints +
                          " pts"
                      )
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="il-btn il-btn-emerald"
                    style={{ textDecoration: "none", width: "100%", fontSize: 12 }}
                  >
                    <Share2 size={14} /> Share Player Stats on WhatsApp
                  </a>
                </div>
              )}

              {profileTab === "awards" && (
                <div style={{ display: "grid", gap: 10 }}>
                  <div
                    style={{
                      background: "rgba(2,6,23,0.78)",
                      border: "1px solid " + badgeRarityStyle(selectedProfile.badgeRarity).border,
                      padding: 14,
                      borderRadius: 14,
                      textAlign: "center",
                    }}
                  >
                    <Award size={28} color={badgeRarityStyle(selectedProfile.badgeRarity).color} />
                    <div style={{ marginTop: 6 }}>
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
                    <div style={{ fontWeight: 900, fontSize: 18, marginTop: 6 }}>{selectedProfile.funAward}</div>
                    {selectedProfile.walkoutUrl && (
                      <button
                        type="button"
                        className="il-btn il-btn-emerald"
                        style={{ marginTop: 8, padding: "6px 12px", fontSize: 11 }}
                        onClick={() => {
                          setDjActiveUrl(selectedProfile.walkoutUrl || "");
                          setDjActiveLabel(selectedProfile.name + " Walkout Anthem");
                          setSelectedProfileId("");
                          setShowDjModal(true);
                        }}
                      >
                        <MusicSvg size={13} /> Play Walkout Anthem
                      </button>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: "#fbbf24" }}>TROPHY CABINET &amp; MILESTONES</div>
                    {getPlayerAchievements(selectedProfile).map((ach) => {
                      const pct = Math.min(100, Math.round((ach.progress / Math.max(1, ach.target)) * 100));
                      return (
                        <div
                          key={ach.id}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            background: ach.unlocked ? "rgba(251,191,36,0.14)" : "rgba(2,6,23,0.75)",
                            border: "1px solid " + (ach.unlocked ? "rgba(251,191,36,0.55)" : "var(--border)"),
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                            <strong style={{ color: ach.unlocked ? "#fde68a" : "#cbd5e1" }}>
                              {ach.unlocked ? "🏆 " : "🔒 "} {ach.title}
                            </strong>
                            <span style={{ fontSize: 11, color: ach.unlocked ? "#34d399" : "var(--muted)" }}>
                              {ach.progress}/{ach.target}
                            </span>
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{ach.desc}</div>
                          <div style={{ height: 5, borderRadius: 99, background: "#1e293b", marginTop: 5, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: pct + "%", background: ach.unlocked ? "#fbbf24" : "#38bdf8" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isSpinOwner && (
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

      {/* TRUE FULL-SCREEN 100VW x 100VH STADIUM CELEBRATION ANIMATION */}
      {celebration && (() => {
        const isWicketStyle =
          celebration.kind === "wicket" ||
          celebration.kind === "duck" ||
          celebration.kind === "hattrick" ||
          celebration.kind === "haul";
        const isWinStyle = celebration.kind === "win";
        const isGoldStyle =
          celebration.kind === "fifty" ||
          celebration.kind === "century" ||
          celebration.kind === "six" ||
          isWinStyle;
        const mainColor = isWicketStyle
          ? "#fb7185"
          : isWinStyle
          ? "#34d399"
          : isGoldStyle
          ? "#fbbf24"
          : "#38bdf8";
        const fullScreenBg = isWicketStyle
          ? "radial-gradient(circle at center, rgba(190,18,60,0.92) 0%, rgba(76,5,25,0.96) 55%, rgba(2,6,23,0.99) 100%)"
          : isWinStyle
          ? "radial-gradient(circle at center, rgba(5,150,105,0.92) 0%, rgba(6,78,59,0.96) 52%, rgba(2,6,23,0.99) 100%)"
          : isGoldStyle
          ? "radial-gradient(circle at center, rgba(217,119,6,0.94) 0%, rgba(120,53,15,0.96) 52%, rgba(2,6,23,0.99) 100%)"
          : "radial-gradient(circle at center, rgba(2,132,199,0.92) 0%, rgba(12,74,110,0.96) 55%, rgba(2,6,23,0.99) 100%)";
        const confettiPalette = ["#fbbf24", "#38bdf8", "#34d399", "#fb7185", "#ffffff", "#a78bfa"];
        return (
          <div
            className="il-celeb-overlay"
            style={{ background: fullScreenBg }}
            onClick={() => setCelebration(null)}
          >
            {/* Sweeping Stadium Floodlight Beams */}
            <div
              style={{
                position: "absolute",
                top: "-15%",
                left: "12%",
                width: "28vw",
                height: "130vh",
                background: "linear-gradient(180deg, rgba(255,255,255,0.28), transparent 78%)",
                transformOrigin: "top center",
                animation: "beamSweep 2.6s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "-15%",
                right: "12%",
                width: "28vw",
                height: "130vh",
                background: "linear-gradient(180deg, rgba(255,255,255,0.24), transparent 78%)",
                transformOrigin: "top center",
                animation: "beamSweep 3s ease-in-out infinite reverse",
                pointerEvents: "none",
              }}
            />

            {/* Full-Screen Falling Stadium Confetti */}
            {Array.from({ length: 20 }).map((_, idx) => (
              <span
                key={idx}
                style={{
                  position: "absolute",
                  left: ((idx * 5.2) % 96) + 2 + "vw",
                  top: "-8vh",
                  width: idx % 3 === 0 ? 12 : 8,
                  height: idx % 2 === 0 ? 18 : 10,
                  borderRadius: idx % 4 === 0 ? "50%" : "3px",
                  background: confettiPalette[idx % confettiPalette.length],
                  animation:
                    "confettiFall " +
                    (1.5 + (idx % 5) * 0.35) +
                    "s linear " +
                    ((idx % 6) * 0.14) +
                    "s infinite",
                  pointerEvents: "none",
                }}
              />
            ))}

            {/* Center Full-Screen Stadium Hero */}
            <div
              className={"il-celeb-card " + (isWicketStyle ? "shake" : "")}
              style={{ color: mainColor }}
            >
              <div className="il-celeb-ring" style={{ width: 240, height: 240, marginLeft: -120, marginTop: -120 }} />
              <div className="il-celeb-ring" style={{ width: 320, height: 320, marginLeft: -160, marginTop: -160, animationDelay: "0.4s" }} />

              <div style={{ position: "relative", zIndex: 3, transform: "scale(1.25)", marginBottom: 14 }}>
                <CricketCelebrationGraphic kind={celebration.kind} color={mainColor} />
              </div>

              <div
                style={{
                  position: "relative",
                  zIndex: 3,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 120,
                  height: 120,
                  padding: "0 22px",
                  borderRadius: "50%",
                  background: "rgba(2,6,23,0.78)",
                  border: "4px solid " + mainColor,
                  fontSize: celebration.badgeText.length > 3 ? 28 : 48,
                  fontWeight: 900,
                  color: "#ffffff",
                  marginBottom: 18,
                  boxShadow: "0 0 46px " + mainColor,
                }}
              >
                {celebration.badgeText}
              </div>

              <div
                style={{
                  position: "relative",
                  zIndex: 3,
                  fontSize: 38,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  color: "#ffffff",
                  textShadow: "0 6px 28px rgba(0,0,0,0.85)",
                  animation: "megaZoom 0.45s ease-out forwards",
                }}
              >
                {celebration.title}
              </div>

              <div
                style={{
                  position: "relative",
                  zIndex: 3,
                  marginTop: 14,
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: "rgba(2,6,23,0.74)",
                  border: "1px solid " + mainColor,
                  display: "inline-block",
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#f8fafc",
                }}
              >
                {celebration.subtitle}
              </div>

              <div style={{ position: "relative", zIndex: 3, marginTop: 22, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: "0.08em" }}>
                TAP ANYWHERE TO CONTINUE
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

      {showDjModal && (
        <UniversalDjModal
          clubName={ws.clubName}
          clubPlaylistUrl={ws.djPlaylistUrl || ""}
          activeTrackUrl={djActiveUrl}
          activeTrackLabel={djActiveLabel}
          isAdmin={isAdmin}
          onSaveClubUrl={(url) =>
            updateWorkspace((prevWs) => ({ ...prevWs, djPlaylistUrl: url }))
          }
          onSetActiveTrack={(url, label) => {
            setDjActiveUrl(url);
            setDjActiveLabel(label);
          }}
          onClose={() => setShowDjModal(false)}
        />
      )}

      {posterConfig && (
        <PosterStudioModal
          config={posterConfig}
          clubName={ws.clubName}
          onClose={() => setPosterConfig(null)}
        />
      )}

      {showFaceOffModal && (
        <PlayerFaceOffModal
          players={ws.players}
          rivalries={ws.rivalries || {}}
          onClose={() => setShowFaceOffModal(false)}
        />
      )}

      {showTurfUtilsModal && (
        <TurfUtilitySuiteModal
          players={ws.players}
          onClose={() => setShowTurfUtilsModal(false)}
        />
      )}

      {showSmartTvMode && lm && (
        <SmartTvScoreboardModal
          lm={lm}
          clubName={ws.clubName}
          crr={lmCrr}
          rrr={lmRrr}
          onClose={() => setShowSmartTvMode(false)}
        />
      )}

      {showFireworksOverlay && (
        <LaunchFireworksCanvas onClose={() => setShowFireworksOverlay(false)} />
      )}

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
