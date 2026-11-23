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
} from "lucide-react";

type TabKey = "home" | "match" | "squad" | "treasury" | "chat" | "ai" | "gm";
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

interface GMVisit {
id: string;
date: string;
time: string;
plan: string;
prasadDuty: string;
}

interface GMState {
messages: ChatMessage[];
visits: GMVisit[];
treasury: TreasuryEntry[];
poll: PollVote[];
mapUrl: string;
}

interface ClubState {
players: Player[];
customPasswords: Record<string, string>;
announcement: string;
groundName: string;
groundMapUrl: string;
scheduledMatch: ScheduledMatch | null;
liveMatch: LiveMatch | null;
matchHistory: CompletedMatch[];
treasury: TreasuryEntry[];
poll: PollVote[];
messages: ChatMessage[];
gm: GMState;
}

interface AuthSession {
playerId: string;
isAdminSession: boolean;
}

const STORAGE_KEY = "indore_legends_master_v3";
const ADMIN_PIN = "450718";
const DEFAULT_LAUNCH_TIME = "2026-11-29T15:00:00+05:30";

const INITIAL_PLAYERS: Player[] = [
{
id: "p1",
name: "Gaurav Lalwani",
role: "All-Rounder",
isAdmin: true,
isGM: true,
defaultPass: "Admin-045",
adminPass: "OQLM45",
matches: 18,
runs: 465,
ballsFaced: 308,
fours: 44,
sixes: 22,
wickets: 21,
oversBowled: 42,
runsConceded: 258,
finesDue: 0,
advanceCredit: 200,
funAward: "Captain Cool",
},
{
id: "p2",
name: "Granth Sharma",
role: "All-Rounder",
isAdmin: true,
isGM: true,
defaultPass: "Admin-07",
adminPass: "OQLM07",
matches: 18,
runs: 420,
ballsFaced: 295,
fours: 38,
sixes: 18,
wickets: 19,
oversBowled: 40,
runsConceded: 252,
finesDue: 0,
advanceCredit: 150,
funAward: "Clutch Finisher",
},
{
id: "p3",
name: "Adhyan Upadhyay",
role: "Batsman",
isAdmin: false,
isGM: false,
defaultPass: "Adhu001",
matches: 15,
runs: 342,
ballsFaced: 248,
fours: 32,
sixes: 12,
wickets: 4,
oversBowled: 10,
runsConceded: 72,
finesDue: 50,
advanceCredit: 0,
funAward: "Cover Drive King",
},
{
id: "p4",
name: "Virat Chaudary",
role: "Batsman",
isAdmin: false,
isGM: true,
defaultPass: "Viru002",
matches: 17,
runs: 488,
ballsFaced: 332,
fours: 49,
sixes: 19,
wickets: 3,
oversBowled: 8,
runsConceded: 64,
finesDue: 0,
advanceCredit: 100,
funAward: "Chase Master",
},
{
id: "p5",
name: "Agam Khandelwal",
role: "Bowler",
isAdmin: false,
isGM: false,
defaultPass: "Agm003",
matches: 14,
runs: 118,
ballsFaced: 102,
fours: 9,
sixes: 4,
wickets: 23,
oversBowled: 44,
runsConceded: 268,
finesDue: 0,
advanceCredit: 50,
funAward: "Yorker Machine",
},
{
id: "p6",
name: "Aditya Rathore",
role: "All-Rounder",
isAdmin: false,
isGM: true,
defaultPass: "Abhi004",
matches: 16,
runs: 315,
ballsFaced: 222,
fours: 27,
sixes: 14,
wickets: 16,
oversBowled: 35,
runsConceded: 229,
finesDue: 50,
advanceCredit: 0,
funAward: "Six Hitter",
},
{
id: "p7",
name: "Anuj Mishra",
role: "Bowler",
isAdmin: false,
isGM: false,
defaultPass: "Anu005",
matches: 15,
runs: 96,
ballsFaced: 88,
fours: 8,
sixes: 2,
wickets: 26,
oversBowled: 48,
runsConceded: 280,
finesDue: 0,
advanceCredit: 0,
funAward: "Dot Ball King",
},
{
id: "p8",
name: "Aadarsh Mishra",
role: "Batsman",
isAdmin: false,
isGM: false,
defaultPass: "Ada006",
matches: 14,
runs: 274,
ballsFaced: 210,
fours: 25,
sixes: 9,
wickets: 5,
oversBowled: 12,
runsConceded: 88,
finesDue: 100,
advanceCredit: 0,
funAward: "Wall of Indore",
},
{
id: "p9",
name: "Atharv Solanki",
role: "Wicket-Keeper",
isAdmin: false,
isGM: true,
defaultPass: "Aathu007",
matches: 16,
runs: 302,
ballsFaced: 218,
fours: 29,
sixes: 11,
wickets: 1,
oversBowled: 2,
runsConceded: 16,
finesDue: 0,
advanceCredit: 50,
funAward: "Lightning Gloves",
},
{
id: "p10",
name: "Ashwin Gagrani",
role: "All-Rounder",
isAdmin: false,
isGM: true,
defaultPass: "Shivu008",
matches: 15,
runs: 245,
ballsFaced: 185,
fours: 20,
sixes: 10,
wickets: 18,
oversBowled: 36,
runsConceded: 230,
finesDue: 0,
advanceCredit: 100,
funAward: "Mystery Spinner",
},
{
id: "p11",
name: "Rudraksh Soni",
role: "Bowler",
isAdmin: false,
isGM: false,
defaultPass: "Rudu009",
matches: 13,
runs: 84,
ballsFaced: 76,
fours: 7,
sixes: 3,
wickets: 17,
oversBowled: 34,
runsConceded: 224,
finesDue: 50,
advanceCredit: 0,
funAward: "Death Over Boss",
},
{
id: "p12",
name: "Naitik Arya",
role: "Batsman",
isAdmin: false,
isGM: true,
defaultPass: "Nai010",
matches: 15,
runs: 328,
ballsFaced: 236,
fours: 31,
sixes: 13,
wickets: 6,
oversBowled: 14,
runsConceded: 98,
finesDue: 0,
advanceCredit: 0,
funAward: "Powerplay Blaster",
},
{
id: "p13",
name: "Harshit Nagpal",
role: "All-Rounder",
isAdmin: false,
isGM: true,
defaultPass: "Harsh011",
matches: 17,
runs: 364,
ballsFaced: 252,
fours: 33,
sixes: 17,
wickets: 20,
oversBowled: 39,
runsConceded: 248,
finesDue: 0,
advanceCredit: 100,
funAward: "Impact Player",
},
];

const DEFAULT_STATE: ClubState = {
players: INITIAL_PLAYERS,
customPasswords: {},
announcement: "INDORE LEGENDS SEASON LAUNCH: Nov 29, 2026 at 3:00 PM IST! Vote in the Playing Poll below.",
groundName: "Indore Legends Home Ground, Indore",
groundMapUrl: "https://www.google.com/maps/search/?api=1&query=Indore+Cricket+Ground+Madhya+Pradesh",
scheduledMatch: null,
liveMatch: null,
matchHistory: [],
treasury: [
{
id: "tr_1",
title: "Monthly Squad Pool",
type: "CREDIT",
amount: 2600,
memberName: "All Squad",
date: "2026-11-20",
},
{
id: "tr_2",
title: "Wind Balls & Grips",
type: "EXPENSE",
amount: 650,
memberName: "Gaurav Lalwani",
date: "2026-11-21",
},
{
id: "tr_3",
title: "Late Arrival Fine",
type: "FINE",
amount: 100,
memberName: "Aadarsh Mishra",
date: "2026-11-22",
},
{
id: "tr_4",
title: "Advance Turf Booking Deposit",
type: "ADVANCE",
amount: 750,
memberName: "Club Members",
date: "2026-11-22",
},
 ],
poll: [
{ playerId: "p1", playerName: "Gaurav Lalwani", choice: "IN" },
{ playerId: "p2", playerName: "Granth Sharma", choice: "IN" },
{ playerId: "p13", playerName: "Harshit Nagpal", choice: "IN" },
 ],
messages: [
{
id: "msg_1",
sender: "Gaurav Lalwani",
text: "Welcome to Indore Legends Hub! Check your player card, dues, and vote in the match poll.",
timestamp: "06:00 PM",
},
 ],
gm: {
messages: [
{
id: "gm_m1",
sender: "Gaurav Lalwani",
text: "Jai Shri Ganesh! Welcome to the private Ganesh Mandir Squad Zone.",
timestamp: "06:00 PM",
},
 ],
visits: [
{
id: "gm_v1",
date: "2026-11-25",
time: "07:00 AM",
plan: "Wednesday Morning Darshan & Aarti",
prasadDuty: "Gaurav Lalwani & Granth Sharma",
},
 ],
treasury: [
{
id: "gm_t1",
title: "Prasad & Modak Pool",
type: "CREDIT",
amount: 800,
memberName: "G.M Group",
date: "2026-11-20",
},
{
id: "gm_t2",
title: "Modak & Flowers",
type: "EXPENSE",
amount: 250,
memberName: "Harshit Nagpal",
date: "2026-11-21",
},
 ],
poll: [
{ playerId: "p1", playerName: "Gaurav Lalwani", choice: "IN" },
{ playerId: "p2", playerName: "Granth Sharma", choice: "IN" },
 ],
mapUrl: "https://www.google.com/maps/search/?api=1&query=Khajrana+Ganesh+Mandir+Indore",
},
};

function loadState(): ClubState {
try {
const raw = localStorage.getItem(STORAGE_KEY);
if (!raw) return DEFAULT_STATE;
const parsed = JSON.parse(raw) as Partial<ClubState>;
return {
...DEFAULT_STATE,
...parsed,
players: Array.isArray(parsed.players) && parsed.players.length > 0 ? parsed.players : INITIAL_PLAYERS,
customPasswords: parsed.customPasswords || {},
treasury: Array.isArray(parsed.treasury) ? parsed.treasury : DEFAULT_STATE.treasury,
poll: Array.isArray(parsed.poll) ? parsed.poll : DEFAULT_STATE.poll,
messages: Array.isArray(parsed.messages) ? parsed.messages : DEFAULT_STATE.messages,
matchHistory: Array.isArray(parsed.matchHistory) ? parsed.matchHistory : [],
gm: parsed.gm ? { ...DEFAULT_STATE.gm, ...parsed.gm } : DEFAULT_STATE.gm,
};
} catch {
return DEFAULT_STATE;
}
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}


function nowTime(): string {
return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatOvers(legalBalls: number): string {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}


function playerRankScore(p: Player): number {
return p.runs + p.wickets * 22 + p.sixes * 4;
}

function threeDaysFromNowIso(): string {
const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
const yyyy = d.getFullYear();
const mm = String(d.getMonth() + 1).padStart(2, "0");
const dd = String(d.getDate()).padStart(2, "0");
   return `${yyyy}-${mm}-${dd}T06:30`;
}

function verifyPlayerPassword(player: Player, inputRaw: string, customPasswords: Record<string, string>): {
ok: boolean;
asAdmin: boolean;
} {
const input = inputRaw.trim();
if (!input) return { ok: false, asAdmin: false };

// Locked Admin Password check (cannot be changed)
if (player.isAdmin && player.adminPass) {
const normalizedInput = input.replace(/^0/, "O").toUpperCase();
const normalizedAdmin = player.adminPass.replace(/^0/, "O").toUpperCase();
if (input === player.adminPass || normalizedInput === normalizedAdmin) {
return { ok: true, asAdmin: true };
}
}

// Changeable Normal Password check
const activeNormal = customPasswords[player.id] || player.defaultPass;
if (input === activeNormal) {
return { ok: true, asAdmin: false };
}

// Helpful tolerance for Rudu09 / Abhi 004 spacing variations if untouched
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
const scoreA = playerRankScore(a) + Math.random() * 140;
const scoreB = playerRankScore(b) + Math.random() * 140;
return scoreB - scoreA;
});
return { captain: shuffled[0].name, viceCaptain: shuffled[1].name };
}

interface PieSlice {
label: string;
value: number;
color: string;
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
                strokeDasharray={`${dash} ${circumference}`}
strokeDashoffset={offset}
transform="rotate(-90 74 74)"
/>
);
})}
<text x="74" y="70" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
TOTAL
</text>
<text x="74" y="88" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
{centerLabel}
</text>
</svg>

<div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
{slices.map((s) => {
const pct = total > 0 ? Math.round((Math.max(0, s.value) / total) * 100) : 0;
return (
<div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
<span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, display: "inline-block" }} />
{s.label}
</span>
<strong>
₹{s.value} ({pct}%)
</strong>
</div>
);
})}
</div>
</div>
);
}

const APP_STYLES = `
:root {
--bg: #040714;
--panel: rgba(13, 21, 42, 0.92);
--panel-alt: rgba(8, 13, 28, 0.85);
--border: rgba(148, 163, 184, 0.2);
--gold: #fbbf24;
--cyan: #38bdf8;
--emerald: #34d399;
--rose: #fb7185;
--purple: #a78bfa;
--orange: #fb923c;
--text: #f8fafc;
--muted: #94a3b8;
}
• { box-sizing: border-box; }
html, body, #root {
margin: 0;
padding: 0;
min-height: 100vh;
background: radial-gradient(circle at top, #101b3d 0%, #040714 68%);
color: var(--text);
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
@keyframes freeHitFlash {
0%, 100% { background: rgba(245, 158, 11, 0.95); color: #090d1e; box-shadow: 0 0 28px rgba(251, 191, 36, 0.9); }
50% { background: rgba(225, 29, 72, 0.95); color: #ffffff; box-shadow: 0 0 28px rgba(244, 63, 94, 0.9); }
}
@keyframes coinSpin {
0% { transform: rotateY(0deg) scale(1); }
50% { transform: rotateY(360deg) scale(1.12); }
100% { transform: rotateY(720deg) scale(1); }
}
.il-freehit-banner {
animation: freeHitFlash 0.75s infinite;
padding: 10px 14px;
border-radius: 12px;
text-align: center;
font-weight: 900;
letter-spacing: 0.14em;
font-size: 14px;
margin-bottom: 12px;
text-transform: uppercase;
}
.il-coin-spin {
animation: coinSpin 0.75s ease-in-out;
}
.il-shell {
max-width: 960px;
margin: 0 auto;
padding: 12px 12px 96px 12px;
}
.il-gold-bar {
background: linear-gradient(90deg, #92400e, #d97706, #f59e0b, #d97706, #92400e);
color: #0b0f1f;
padding: 10px 14px;
border-radius: 14px;
font-weight: 800;
font-size: 13px;
display: flex;
align-items: center;
justify-content: space-between;
gap: 10px;
margin-bottom: 12px;
box-shadow: 0 8px 24px rgba(245, 158, 11, 0.28);
}
.il-header {
display: flex;
align-items: center;
justify-content: space-between;
gap: 10px;
padding: 12px 14px;
background: var(--panel);
border: 1px solid rgba(56, 189, 248, 0.25);
border-radius: 16px;
margin-bottom: 12px;
backdrop-filter: blur(12px);
}
.il-crest {
width: 44px;
height: 44px;
border-radius: 13px;
background: linear-gradient(135deg, #f59e0b, #ef4444, #7c3aed);
display: flex;
align-items: center;
justify-content: center;
color: #fff;
font-weight: 900;
font-size: 17px;
letter-spacing: 0.04em;
cursor: pointer;
user-select: none;
box-shadow: 0 0 18px rgba(245, 158, 11, 0.35);
flex-shrink: 0;
}
.il-card {
background: var(--panel);
border: 1px solid var(--border);
border-radius: 16px;
padding: 16px;
margin-bottom: 12px;
box-shadow: 0 12px 30px rgba(0, 0, 0, 0.32);
}
.il-ipl-card {
background: linear-gradient(135deg, rgba(29, 78, 216, 0.24), rgba(15, 23, 42, 0.96), rgba(180, 83, 9, 0.22));
border: 1px solid rgba(251, 191, 36, 0.42);
}
.il-grid-2 {
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 10px;
}
.il-grid-3 {
display: grid;
grid-template-columns: repeat(3, minmax(0, 1fr));
gap: 8px;
}
.il-grid-4 {
display: grid;
grid-template-columns: repeat(4, minmax(0, 1fr));
gap: 8px;
}
@media (max-width: 600px) {
.il-resp-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.il-resp-1 { grid-template-columns: 1fr; }
}
.il-btn {
border: 1px solid var(--border);
background: #1e293b;
color: #f8fafc;
border-radius: 11px;
padding: 10px 13px;
font-weight: 700;
font-size: 13px;
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
border-color: rgba(56, 189, 248, 0.55);
}
.il-btn-gold {
background: linear-gradient(135deg, #d97706, #f59e0b);
color: #090d1e;
border-color: rgba(251, 191, 36, 0.7);
}
.il-btn-emerald {
background: rgba(16, 185, 129, 0.2);
border-color: rgba(52, 211, 153, 0.5);
color: #6ee7b7;
}
.il-btn-danger {
background: linear-gradient(135deg, #be123c, #e11d48);
border-color: rgba(251, 113, 133, 0.6);
color: #ffffff;
}
.il-btn-purple {
background: rgba(139, 92, 246, 0.22);
border-color: rgba(167, 139, 250, 0.5);
color: #ddd6fe;
}
.il-input, .il-select {
width: 100%;
padding: 10px 12px;
border-radius: 10px;
border: 1px solid rgba(148, 163, 184, 0.3);
background: #020617;
color: #f8fafc;
font-size: 14px;
outline: none;
}
.il-input:focus, .il-select:focus {
border-color: var(--cyan);
}
.il-pill {
display: inline-flex;
align-items: center;
gap: 5px;
padding: 4px 10px;
border-radius: 999px;
font-size: 11px;
font-weight: 800;
letter-spacing: 0.04em;
text-transform: uppercase;
}
.il-ball {
width: 34px;
height: 34px;
border-radius: 50%;
display: inline-flex;
align-items: center;
justify-content: center;
font-weight: 900;
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
background: rgba(2, 6, 23, 0.95);
border-top: 1px solid rgba(56, 189, 248, 0.22);
backdrop-filter: blur(14px);
display: flex;
justify-content: center;
padding: 8px 6px;
}
.il-nav-inner {
width: 100%;
max-width: 960px;
display: flex;
justify-content: space-around;
gap: 4px;
}
.il-nav-item {
flex: 1;
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
font-weight: 700;
cursor: pointer;
}
.il-nav-item.active {
color: var(--gold);
background: rgba(251, 191, 36, 0.13);
}
.il-modal-backdrop {
position: fixed;
inset: 0;
z-index: 80;
background: rgba(2, 6, 23, 0.82);
backdrop-filter: blur(6px);
display: flex;
align-items: center;
justify-content: center;
padding: 16px;
}
.il-modal {
width: 100%;
max-width: 440px;
background: #0b1228;
border: 1px solid rgba(251, 191, 36, 0.45);
border-radius: 18px;
padding: 20px;
box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
}
.il-scroll-box {
max-height: 330px;
overflow-y: auto;
display: flex;
flex-direction: column;
gap: 9px;
padding-right: 4px;
}
`;

export default function App() {
const [state, setState] = useState<ClubState>(() => loadState());
const [session, setSession] = useState<AuthSession | null>(null);
const [tab, setTab] = useState<TabKey>("home");

// Login screen states
const [loginPlayerId, setLoginPlayerId] = useState<string>(INITIAL_PLAYERS[0].id);
const [loginPassword, setLoginPassword] = useState<string>("");
const [loginError, setLoginError] = useState<string>("");

// Personal Due Reminder Popup
const [showDuePopup, setShowDuePopup] = useState<boolean>(false);

// Change Normal Password form
const [showPassForm, setShowPassForm] = useState<boolean>(false);
const [newNormalPass, setNewNormalPass] = useState<string>("");
const [passNotice, setPassNotice] = useState<string>("");

// Admin PIN Modal Gate (450718)
const [pinModalTitle, setPinModalTitle] = useState<string>("");
const [pinInput, setPinInput] = useState<string>("");
const [pinError, setPinError] = useState<string>("");
const pendingAdminActionRef = useRef<(() => void) | null>(null);

// Secret Ganesh Mandir Unlock (triple-tap crest)
const [gmUnlocked, setGmUnlocked] = useState<boolean>(false);
const [showGmLoginModal, setShowGmLoginModal] = useState<boolean>(false);
const [gmLoginId, setGmLoginId] = useState<string>(INITIAL_PLAYERS[0].id);
const [gmLoginPass, setGmLoginPass] = useState<string>("");
const [gmLoginErr, setGmLoginErr] = useState<string>("");
const crestTapCountRef = useRef<number>(0);
const crestTapTimerRef = useRef<number | null>(null);

// Countdown tick
const [nowMs, setNowMs] = useState<number>(() => Date.now());

// Announcement & Map editor
const [editingAnnouncement, setEditingAnnouncement] = useState<boolean>(false);
const [announcementDraft, setAnnouncementDraft] = useState<string>(state.announcement);
const [editingGround, setEditingGround] = useState<boolean>(false);
const [groundNameDraft, setGroundNameDraft] = useState<string>(state.groundName);
const [groundUrlDraft, setGroundUrlDraft] = useState<string>(state.groundMapUrl);

// Create Match Wizard (before match is active)
const [showCreateWizard, setShowCreateWizard] = useState<boolean>(false);
const [wizTitle, setWizTitle] = useState<string>("Indore Legends Clash");
const [wizDateTime, setWizDateTime] = useState<string>(() => threeDaysFromNowIso());
const [wizOvers, setWizOvers] = useState<number>(10);
const [wizTeamAName, setWizTeamAName] = useState<string>("Legends XI");
const [wizTeamBName, setWizTeamBName] = useState<string>("Strikers XI");
const [wizSelectedIds, setWizSelectedIds] = useState<string[]>(() =>
INITIAL_PLAYERS.slice(0, 10).map((p) => p.id)
);
const [newChecklistLabel, setNewChecklistLabel] = useState<string>("");

// Digital Coin Toss state (shared for Match & GM)
const [coinFlipping, setCoinFlipping] = useState<boolean>(false);
const [coinResult, setCoinResult] = useState<string>("");
const [gmCoinResult, setGmCoinResult] = useState<string>("");

// Live Match extra controls
const [wicketType, setWicketType] = useState<string>("Bowled");
const [umpireBanner, setUmpireBanner] = useState<string>("");
const [milestonePopup, setMilestonePopup] = useState<string>("");
const [showSwapBowler, setShowSwapBowler] = useState<boolean>(false);
const [swapBowlerName, setSwapBowlerName] = useState<string>("");

// Squad Admin edit state
const [editPlayerId, setEditPlayerId] = useState<string>("");
const [editAwardText, setEditAwardText] = useState<string>("");

// Treasury form
const [trTitle, setTrTitle] = useState<string>("");
const [trType, setTrType] = useState<LedgerType>("CREDIT");
const [trAmount, setTrAmount] = useState<string>("");
const [trMember, setTrMember] = useState<string>("Gaurav Lalwani");

// Chat state
const [chatText, setChatText] = useState<string>("");
const chatEndRef = useRef<HTMLDivElement | null>(null);

// LegendBot AI + Voice Input/Output
const [voiceOutput, setVoiceOutput] = useState<boolean>(false);
const [isListening, setIsListening] = useState<boolean>(false);
const [aiInput, setAiInput] = useState<string>("");
const [aiLoading, setAiLoading] = useState<boolean>(false);
const [aiMessages, setAiMessages] = useState<BotMessage[]>([
{
id: "bot_init",
role: "bot",
layer: "LegendBot • Cricket Engine",
text: "Namaste Legend! Ask me anything about Indore Legends (live score, Orange/Purple Cap, dues, poll, MVP) OR any IPL, Cricbuzz, International, or Domestic cricket question. Tap the mic for Voice Input!",
timestamp: nowTime(),
},
 ]);
const aiEndRef = useRef<HTMLDivElement | null>(null);
const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

// Ganesh Mandir forms
const [gmChatText, setGmChatText] = useState<string>("");
const [gmVisitDate, setGmVisitDate] = useState<string>("2026-11-28");
const [gmVisitTime, setGmVisitTime] = useState<string>("07:00 AM");
const [gmVisitPlan, setGmVisitPlan] = useState<string>("");
const [gmVisitPrasad, setGmVisitPrasad] = useState<string>("");
const [gmTrTitle, setGmTrTitle] = useState<string>("");
const [gmTrType, setGmTrType] = useState<LedgerType>("CREDIT");
const [gmTrAmount, setGmTrAmount] = useState<string>("");

// Persist ClubState to localStorage
useEffect(() => {
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
} catch {
// Ignore storage quota issues
}
}, [state]);

// 1-second clock tick for countdown
useEffect(() => {
const id = window.setInterval(() => setNowMs(Date.now()), 1000);
return () => window.clearInterval(id);
}, []);

useEffect(() => {
if (tab === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
if (tab === "ai") aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [tab, state.messages.length, aiMessages.length]);

const currentUser = session
? state.players.find((p) => p.id === session.playerId) || null
: null;
const isAdmin = Boolean(session?.isAdminSession && currentUser?.isAdmin);

// Orange & Purple Cap leaders
const orangeCapHolder = [...state.players].sort((a, b) => b.runs - a.runs)[0];
const purpleCapHolder = [...state.players].sort((a, b) => b.wickets - a.wickets)[0];

// Treasury totals
const totalCredits = state.treasury
.filter((t) => t.type === "CREDIT")
.reduce((sum, t) => sum + t.amount, 0);
const totalFines = state.treasury
.filter((t) => t.type === "FINE")
.reduce((sum, t) => sum + t.amount, 0);
const totalExpenses = state.treasury
.filter((t) => t.type === "EXPENSE")
.reduce((sum, t) => sum + t.amount, 0);
const totalAdvances = state.treasury
.filter((t) => t.type === "ADVANCE")
.reduce((sum, t) => sum + t.amount, 0);
const clubNetBalance = totalCredits + totalFines + totalAdvances - totalExpenses;

// Countdown target (scheduled match if set in future, else Nov 29 Launch)
const countdownTargetMs = (() => {
if (state.scheduledMatch?.dateTime) {
const parsed = new Date(state.scheduledMatch.dateTime).getTime();
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

// Voice TTS helper
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
// Ignore unsupported TTS
}
}
};

// Admin PIN Gate (450718)
const requireAdminPin = (title: string, action: () => void) => {
if (!currentUser?.isAdmin) {
return;
}
pendingAdminActionRef.current = action;
setPinModalTitle(title);
setPinInput("");
setPinError("");
};

const submitAdminPin = (e: React.FormEvent) => {
e.preventDefault();
if (pinInput.trim() !== ADMIN_PIN) {
setPinError("Incorrect Admin PIN. Try again.");
return;
}
const fn = pendingAdminActionRef.current;
pendingAdminActionRef.current = null;
setPinModalTitle("");
setPinInput("");
setPinError("");
if (fn) fn();
};

// Login Handler
const handleLogin = (e: React.FormEvent) => {
e.preventDefault();
const player = state.players.find((p) => p.id === loginPlayerId);
if (!player) {
setLoginError("Select a valid squad member.");
return;
}
const check = verifyPlayerPassword(player, loginPassword, state.customPasswords);
if (!check.ok) {
setLoginError("Wrong password! Check your diary password and try again.");
return;
}
setSession({ playerId: player.id, isAdminSession: check.asAdmin });
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
setShowDuePopup(false);
setTab("home");
};

// Change Normal Password (Admin pass cannot be changed)
const handleChangeNormalPass = (e: React.FormEvent) => {
e.preventDefault();
if (!currentUser) return;
const trimmed = newNormalPass.trim();
if (trimmed.length < 4) {
setPassNotice("Password must be at least 4 characters.");
return;
}
setState((prev) => ({
...prev,
customPasswords: {
...prev.customPasswords,
[currentUser.id]: trimmed,
},
}));
setNewNormalPass("");
setPassNotice("Normal password updated! (Admin passwords remain permanently locked.)");
};

// Secret Triple-Tap on IL Crest -> Ganesh Mandir Modal
const handleCrestTap = () => {
crestTapCountRef.current += 1;
if (crestTapTimerRef.current !== null) {
window.clearTimeout(crestTapTimerRef.current);
}
if (crestTapCountRef.current >= 3) {
crestTapCountRef.current = 0;
if (gmUnlocked) {
setTab("gm");
} else {
const gmPlayers = state.players.filter((p) => p.isGM);
if (currentUser?.isGM) {
setGmLoginId(currentUser.id);
} else if (gmPlayers[0]) {
setGmLoginId(gmPlayers[0].id);
}
setGmLoginPass("");
setGmLoginErr("");
setShowGmLoginModal(true);
}
return;
}
crestTapTimerRef.current = window.setTimeout(() => {
crestTapCountRef.current = 0;
}, 800);
};

const handleGmUnlock = (e: React.FormEvent) => {
e.preventDefault();
const player = state.players.find((p) => p.id === gmLoginId && p.isGM);
if (!player) {
setGmLoginErr("Only authorized G.M members can enter.");
return;
}
const check = verifyPlayerPassword(player, gmLoginPass, state.customPasswords);
if (!check.ok) {
setGmLoginErr("Invalid password. Use your same squad password.");
return;
}
setGmUnlocked(true);
setShowGmLoginModal(false);
setGmLoginPass("");
setGmLoginErr("");
setTab("gm");
};

// Poll Voting
const handleVotePoll = (choice: PollChoice) => {
if (!currentUser) return;
setState((prev) => {
const others = prev.poll.filter((v) => v.playerId !== currentUser.id);
return {
...prev,
poll: [...others, { playerId: currentUser.id, playerName: currentUser.name, choice }],
};
});
};

// Digital Coin Toss
const flipCoin = (target: "match" | "gm") => {
setCoinFlipping(true);
window.setTimeout(() => {
const side = Math.random() < 0.5 ? "HEADS" : "TAILS";
if (target === "match") {
setCoinResult(side);
if (state.scheduledMatch) {
const winner =
Math.random() < 0.5
? state.scheduledMatch.teamAName
: state.scheduledMatch.teamBName;
setState((prev) =>
prev.scheduledMatch
? {
...prev,
scheduledMatch: { ...prev.scheduledMatch, tossWinner: winner },
}
: prev
);
}
} else {
setGmCoinResult(side);
}
setCoinFlipping(false);
}, 750);
};

// Create Scheduled Match (Auto Team Splitter + Auto Captain/VC + Checklist)
const createScheduledMatch = () => {
const selected = state.players.filter((p) => wizSelectedIds.includes(p.id));
if (selected.length < 4) return;
const { teamA, teamB } = splitTeamsByRanking(selected);
const capA = autoPickCaptains(teamA);
const capB = autoPickCaptains(teamB);

const scheduled: ScheduledMatch = {
id: uid("sch"),
title: wizTitle.trim() || "Indore Legends Match",
dateTime: wizDateTime || threeDaysFromNowIso(),
overs: Math.max(1, Math.min(50, wizOvers || 10)),
selectedPlayerIds: selected.map((p) => p.id),
teamAName: wizTeamAName.trim() || "Legends XI",
teamBName: wizTeamBName.trim() || "Strikers XI",
teamAIds: teamA.map((p) => p.id),
teamBIds: teamB.map((p) => p.id),
teamACaptain: capA.captain,
teamAViceCaptain: capA.viceCaptain,
teamBCaptain: capB.captain,
teamBViceCaptain: capB.viceCaptain,
tossWinner: "",
tossDecision: "",
checklist: [
{ id: "c1", label: "Wind Balls (2+ Extra)", done: false },
{ id: "c2", label: "Bats & Grip Tape Ready", done: false },
{ id: "c3", label: "Stumps & Bails Packed", done: false },
{ id: "c4", label: "Drinking Water Bottles", done: false },
{ id: "c5", label: "Ground & Boundary Marked", done: false },
 ],
};

setState((prev) => ({ ...prev, scheduledMatch: scheduled }));
setShowCreateWizard(false);
setCoinResult("");
};

const reRollScheduledTeamsAndCaptains = () => {
if (!state.scheduledMatch) return;
const selected = state.players.filter((p) =>
state.scheduledMatch?.selectedPlayerIds.includes(p.id)
);
const { teamA, teamB } = splitTeamsByRanking(selected);
const capA = autoPickCaptains(teamA);
const capB = autoPickCaptains(teamB);

setState((prev) =>
prev.scheduledMatch
? {
...prev,
scheduledMatch: {
...prev.scheduledMatch,
teamAIds: teamA.map((p) => p.id),
teamBIds: teamB.map((p) => p.id),
teamACaptain: capA.captain,
teamAViceCaptain: capA.viceCaptain,
teamBCaptain: capB.captain,
teamBViceCaptain: capB.viceCaptain,
},
}
: prev
);
};

const startLiveMatchFromScheduled = () => {
const sch = state.scheduledMatch;
if (!sch) return;
const teamAPlayers = state.players
.filter((p) => sch.teamAIds.includes(p.id))
.map((p) => p.name);
const teamBPlayers = state.players
.filter((p) => sch.teamBIds.includes(p.id))
.map((p) => p.name);

const aBatsFirst =
!sch.tossWinner ||
(sch.tossWinner === sch.teamAName && sch.tossDecision !== "BOWL") ||
(sch.tossWinner === sch.teamBName && sch.tossDecision === "BOWL");

const battingTeam = aBatsFirst ? sch.teamAName : sch.teamBName;
const bowlingTeam = aBatsFirst ? sch.teamBName : sch.teamAName;
const battingPlayers = aBatsFirst ? teamAPlayers : teamBPlayers;
const bowlingPlayers = aBatsFirst ? teamBPlayers : teamAPlayers;

const striker = battingPlayers[0] || "Batter 1";
const nonStriker = battingPlayers[1] || "Batter 2";
const bowler = bowlingPlayers[0] || "Bowler 1";

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
striker,
nonStriker,
bowler,
freeHitActive: false,
isCompleted: false,
isTied: false,
resultText: "",
batters: initBatters,
bowlers: initBowlers,
history: [],
      tossInfo: sch.tossWinner
        ? `${sch.tossWinner} won toss & chose to ${sch.tossDecision || "BAT"}`
        : "Toss skipped",
      captainsInfo: `${sch.teamAName} (C: ${sch.teamACaptain}, VC: ${sch.teamAViceCaptain}) vs ${sch.teamBName} (C: ${sch.teamBCaptain}, VC: ${sch.teamBViceCaptain})`,
    };

 setState((prev) => Object.assign({}, prev, { liveMatch: live }));



setUmpireBanner("PLAY! Innings 1 underway.");
speak("Match started! Play!");
};

// Auto MVP Calculator for Live Match
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
return bestPts > 0 ? ${bestName} (${bestPts} MVP pts) : "TBD";
};

// Format WhatsApp Scorecard
const buildWhatsappScorecard = (m: LiveMatch): string => {
const topBat = Object.values(m.batters)
.filter((b) => b.balls > 0 || b.out)
.sort((a, b) => b.runs - a.runs)
.slice(0, 4)
.map((b) => • ${b.name}: ${b.runs}(${b.balls}) [4s:${b.fours}, 6s:${b.sixes}]`)
.join("\n");

const topBowl = Object.values(m.bowlers)
.filter((b) => b.balls > 0)
.sort((a, b) => b.wickets - a.wickets)
.slice(0, 3)
.map((b) => •${b.name}: {b.runs} (${formatOvers(b.balls)} ov))
.join("\n");

const firstInnLine =
m.firstInningsScore !== null
? 1st Innings:${m.bowlingTeam} {m.firstInningsWickets ?? 0}\n`
: "";

return (
🏏 *INDORE LEGENDS SCORECARD*\n +
*${m.title}* (${m.isSuperOver ? "SUPER OVER" :latex
{m.totalOvers} Overs`})\n` + `

{m.tossInfo}\n+{m.battingTeam}: {m.wickets} ({m.totalOvers} ov)\n+{m.resultText ? `🏆 Result: *{m.resultText}\n: ""} +
⭐ Auto MVP: *${computeLiveMvp(m)}*\n\n+Top Batters:\n${topBat || "No batters yet"}\n\n +
*Top Bowlers:*\n${topBowl || "No bowlers yet"}`
);
};

// Record a Ball in Live Match
const recordLiveBall = (
runsScored: number,
options?: { isWide?: boolean; isNoBall?: boolean; isWicket?: boolean }
) => {
const m = state.liveMatch;
if (!m || m.isCompleted) return;

const isWide = Boolean(options?.isWide);
const isNoBall = Boolean(options?.isNoBall);
const isWicket = Boolean(options?.isWicket);

// Free Hit wicket protection (only Run Out allowed on Free Hit)
if (isWicket && m.freeHitActive && wicketType !== "Run Out") {
setUmpireBanner("FREE HIT! Only Run Out allowed!");
speak("Not out! It is a Free Hit!");
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

// Update Batter stats
const updatedBatters = { ...m.batters };
const prevStrikerStat = updatedBatters[m.striker] || {
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
const newBatterRuns = prevStrikerStat.runs + batterRunsAdded;

updatedBatters[m.striker] = {
...prevStrikerStat,
runs: newBatterRuns,
balls: isLegal ? prevStrikerStat.balls + 1 : prevStrikerStat.balls,
fours: !isWide && runsScored === 4 ? prevStrikerStat.fours + 1 : prevStrikerStat.fours,
sixes: !isWide && runsScored === 6 ? prevStrikerStat.sixes + 1 : prevStrikerStat.sixes,
out: isWicket ? true : prevStrikerStat.out,
dismissal: isWicket ? ``${wicketType} b ${m.bowler} : prevStrikerStat.dismissal,
};

// Update Bowler stats
const updatedBowlers = { ...m.bowlers };
const prevBowlerStat = updatedBowlers[m.bowler] || {
name: m.bowler,
balls: 0,
runs: 0,
wickets: 0,
};
const newBowlerWickets =
isWicket && wicketType !== "Run Out" ? prevBowlerStat.wickets + 1 : prevBowlerStat.wickets;
updatedBowlers[m.bowler] = {
...prevBowlerStat,
balls: isLegal ? prevBowlerStat.balls + 1 : prevBowlerStat.balls,
runs: prevBowlerStat.runs + totalBallRuns,
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

// Milestone Celebrations (50, 100, 3W, 5W, Hat-Trick)
if (prevStrikerStat.runs < 100 && newBatterRuns >= 100) {
setMilestonePopup(CENTURY!${m.striker} smashes 100 runs!); speak(Century! latex
{m.striker} reaches one hundred runs!`); } else if (prevStrikerStat.runs &lt; 50 && newBatterRuns &gt;= 50) { setMilestonePopup(`HALF-CENTURY! 

{m.striker} hits 50!); speak(Fifty! Half century for latex
{m.striker}!`); } else if (isWicket && wicketType !== "Run Out") { const sameBowlerLast3 = nextHistory .filter((e) =&gt; e.innings === m.innings && e.bowler === m.bowler && !e.isWide && !e.isNoBall) .slice(0, 3); if (sameBowlerLast3.length === 3 && sameBowlerLast3.every((e) =&gt; e.isWicket)) { setMilestonePopup(`HAT-TRICK! 

{m.bowler} takes 3 in 3!); speak(Hat-trick for latex
{m.bowler}! Unbelievable bowling!`); } else if (newBowlerWickets === 5) { setMilestonePopup(`5-WICKET HAUL! 

{m.bowler} dominates with 5 wickets!); } else if (newBowlerWickets === 3) { setMilestonePopup(3-WICKET HAUL! ${m.bowler} is on fire!);
}
}

// Rotate striker / pick next batter
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

// End of over strike swap
if (isLegal && nextBalls % 6 === 0) {
const temp = nextStriker;
nextStriker = nextNonStriker;
nextNonStriker = temp;
}

// Check innings/match completion
const targetReached = m.innings === 2 && m.target !== null && nextRuns >= m.target;
const inningsEnded = nextBalls >= maxBalls || nextWickets >= maxWickets || targetReached;

let isCompleted = false;
let isTied = false;
let resultText = m.resultText;

if (inningsEnded && m.innings === 2 && m.target !== null) {
isCompleted = true;
if (nextRuns >= m.target) {
const wktsLeft = Math.max(1, maxWickets - nextWickets);
resultText = ${m.battingTeam} won by $`{wktsLeft} wicket(s)!`; } else if (nextRuns === m.target - 1) { isTied = true; resultText = "MATCH TIED! Ready for Super Over!"; } else { const margin = m.target - 1 - nextRuns; resultText =${m.bowlingTeam} won by ${margin} run(s)!;
}
}

// Umpire Voice Announcements
if (isNoBall) {
setUmpireBanner("NO BALL! FREE HIT NEXT!");
speak("No ball! Free hit coming up!");
} else if (isWide) {
setUmpireBanner("WIDE BALL (+1)");
speak("Wide ball!");
} else if (isWicket) {
setUmpireBanner(OUT!${wicketType}!); speak(Out! ${wicketType}!);
} else if (runsScored === 6) {
setUmpireBanner("MAXIMUM SIX!");
speak("Huge six!");
} else if (runsScored === 4) {
setUmpireBanner("CRACKING FOUR!");
speak("Four runs!");
}

setState((prev) => ({
...prev,
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

// Start 2nd Innings
const startSecondInnings = () => {
const m = state.liveMatch;
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

setState((prev) => ({
...prev,
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
setUmpireBanner(2nd Innings! Target is${m.runs + 1}); speak(Second innings begins! Target is ${m.runs + 1} runs!);
};

// Launch Super Over (If Tied!)
const launchSuperOver = () => {
const m = state.liveMatch;
if (!m) return;
const battingPlayers = m.teamAPlayers;
const bowlingPlayers = m.teamBPlayers;

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

setState((prev) => ({
...prev,
liveMatch: {
...m,
title: ``${m.title} — SUPER OVER`,
totalOvers: 1,
innings: 1,
isSuperOver: true,
battingTeam: m.teamAName,
bowlingTeam: m.teamBName,
battingPlayers,
bowlingPlayers,
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
},
}));
setMilestonePopup("SUPER OVER LIVE! 6 Balls — 2 Wickets Max!");
};

// Retired Hurt Handler
const handleRetiredHurt = () => {
const m = state.liveMatch;
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
setState((prev) => {
if (!prev.liveMatch) return prev;
const batters = { ...prev.liveMatch.batters };
if (batters[m.striker]) {
batters[m.striker] = { ...batters[m.striker], retiredHurt: true };
}
return {
...prev,
liveMatch: {
...prev.liveMatch,
striker: nextBatter,
batters,
},
};
});
setUmpireBanner(${m.striker} Retired Hurt. ${nextBatter} walks in.);
};

// Mid-Over Bowler Swap
const handleMidOverSwap = () => {
const m = state.liveMatch;
if (!m || !swapBowlerName) return;
setState((prev) =>
prev.liveMatch
? { ...prev, liveMatch: { ...prev.liveMatch, bowler: swapBowlerName } }
: prev
);
setShowSwapBowler(false);
setUmpireBanner(Mid-Over Swap: ${swapBowlerName} takes the ball!`);
};

// Undo Last Ball
const undoLiveBall = () => {
const m = state.liveMatch;
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

setState((prev) => ({
...prev,
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
setUmpireBanner("Last delivery undone.");
};

// Finish Match & Archive into History + Update Career Stats
const archiveLiveMatch = () => {
const m = state.liveMatch;
if (!m) return;
const mvp = computeLiveMvp(m);
const scorecardText = buildWhatsappScorecard(m);
const completed: CompletedMatch = {
id: uid("hist"),
title: m.title,
date: new Date().toISOString().slice(0, 10),
summary: ``${m.battingTeam} {m.wickets} ({
m.firstInningsScore !== null ? vs ${m.bowlingTeam} ${m.firstInningsScore}/${m.firstInningsWickets ?? 0}: "" },
winner: m.resultText || "Completed",
mvp,
scorecardText,
};

setState((prev) => {
const updatedPlayers = prev.players.map((pl) => {
const bat = m.batters[pl.name];
const bowl = m.bowlers[pl.name];
const participated =
m.teamAPlayers.includes(pl.name) || m.teamBPlayers.includes(pl.name);
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
...prev,
players: updatedPlayers,
liveMatch: null,
scheduledMatch: null,
matchHistory: [completed, ...prev.matchHistory],
};
});
setUmpireBanner("Match archived to Match History & stats updated!");
};

// LegendBot AI + Voice Input
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
text: "Voice recognition is not supported on this browser. Please type your cricket question below.",
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

// Direct live club data engine
if (q.includes("orange") || q.includes("purple") || q.includes("cap") || q.includes("top")) {
const reply = Orange Cap:${orangeCapHolder.name} ({(
(orangeCapHolder.runs / Math.max(1, orangeCapHolder.ballsFaced)) *
100
).toFixed(1)}). Purple Cap: {purpleCapHolder.wickets} wickets).`;
setAiMessages((prev) => [
...prev,
{ id: uid("b"), role: "bot", layer: "Club Caps & Stats", text: reply, timestamp: nowTime() },
 ]);
speak(reply);
return;
}

if (q.includes("due") || q.includes("balance") || q.includes("money") || q.includes("treasury")) {
const dueList = state.players
.filter((p) => p.finesDue > 0)
.map((p) => ${p.name} (₹${p.finesDue}))
.join(", ");
const reply = Club Net Balance is ₹${clubNetBalance} (Advance Credits: ₹${totalAdvances}, Expenses: ₹${totalExpenses}). Pending dues: ${dueList || "All clear!"}.;
setAiMessages((prev) => [
...prev,
{ id: uid("b"), role: "bot", layer: "Club Treasury", text: reply, timestamp: nowTime() },
 ]);
speak(reply);
return;
}

if (q.includes("poll") || q.includes("playing")) {
const inCount = state.poll.filter((v) => v.choice === "IN").length;
const inNames = state.poll
.filter((v) => v.choice === "IN")
.map((v) => v.playerName)
.join(", ");
const reply = Playing Poll: ${inCount} players are IN (${inNames || "None yet"}).;
setAiMessages((prev) => [
...prev,
{ id: uid("b"), role: "bot", layer: "Club Poll", text: reply, timestamp: nowTime() },
 ]);
speak(reply);
return;
}

if (
(q.includes("live") || q.includes("our match") || q.includes("indore legends")) &&
(q.includes("score") || q.includes("match"))
) {
const lm = state.liveMatch;
const reply = lm
? Indore Legends Live Match: ${lm.battingTeam} ${lm.runs}/${lm.wickets} (${formatOvers( lm.balls )}/${lm.totalOvers} ov). Striker: ${lm.striker}, Bowler: ${lm.bowler}. Auto MVP: ${computeLiveMvp(lm)}.
: state.scheduledMatch
? No match live right now. Next scheduled match: ${state.scheduledMatch.title} (${state.scheduledMatch.overs} overs) on ${state.scheduledMatch.dateTime.replace("T", " ")}.`
: "No match is currently active. Admins can create a match in the Match tab!";
setAiMessages((prev) => [
...prev,
{ id: uid("b"), role: "bot", layer: "Club Match Engine", text: reply, timestamp: nowTime() },
 ]);
speak(reply);
return;
}

// Cloud Cricket Intelligence (/api/chat -> Groq) for IPL, Cricbuzz, Intl, Domestic + General Club AI
setAiLoading(true);
try {
const res = await fetch("/api/chat", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
prompt: Focus strictly on Cricket (IPL, Cricbuzz-style match info, International, Domestic, and Indore Legends club data). Question:${prompt}, context: { loggedInPlayer: currentUser?.name, orangeCap:{orangeCapHolder.runs}), purpleCap:{purpleCapHolder.wickets}), clubBalance: clubNetBalance, liveMatch: state.liveMatch ?{state.liveMatch.runs}/latex
{state.liveMatch.wickets}` : "No active match", }, }), }); const data = (await res.json()) as { reply?: string }; if (res.ok && data.reply) { setAiMessages((prev) =&gt; [ ...prev, { id: uid("b"), role: "bot", layer: "LegendBot Cricket AI", text: data.reply || "", timestamp: nowTime() }, ]); speak(data.reply); } else { throw new Error("API fallback"); } } catch { const isExternalCricket = q.includes("ipl") || q.includes("cricbuzz") || q.includes("india") || q.includes("rcb") || q.includes("csk") || q.includes("mi") || q.includes("ranji") || q.includes("domestic") || q.includes("intl") || q.includes("international"); const fallback = isExternalCricket ? `For live ball-by-ball IPL, International, and Domestic scores from Cricbuzz, connect your GROQ_API_KEY in Vercel (or tap Cricbuzz directly). Meanwhile, Indore Legends stats are live right here—Orange Cap is 

{orangeCapHolder.name} ({purpleCapHolder.name} ({clubNetBalance}, Orange Cap {orangeCapHolder.runs}), Purple Cap {purpleCapHolder.wickets}). Ask about live score, caps, dues, poll, or IPL/Cricbuzz cricket!`;
setAiMessages((prev) => [
...prev,
{ id: uid("b"), role: "bot", layer: "LegendBot Cricket Fallback", text: fallback, timestamp: nowTime() },
 ]);
speak(fallback);
} finally {
setAiLoading(false);
}
};

// ==================== LOGIN SCREEN ====================
if (!session || !currentUser) {
return (
<div
style={{
minHeight: "100vh",
display: "flex",
alignItems: "center",
justifyContent: "center",
padding: 18,
background:
"radial-gradient(circle at top, rgba(245,158,11,0.18), rgba(15,23,42,0.96) 55%, #040714 100%)",
}}
>
<style>{APP_STYLES}</style>
<div className="il-card il-ipl-card" style={{ width: "100%", maxWidth: 420 }}>
<div style={{ textAlign: "center", marginBottom: 20 }}>
<div
className="il-crest"
style={{ width: 64, height: 64, fontSize: 24, margin: "0 auto 12px auto" }}
>
IL
</div>
<div
className="il-pill"
style={{
background: "rgba(251,191,36,0.18)",
color: "#fcd34d",
marginBottom: 8,
}}
>
<Flame size={13} /> IPL Broadcast Edition
</div>
<h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "0.03em" }}>
INDORE LEGENDS
</h1>
<p style={{ margin: "6px 0 0 0", fontSize: 13, color: "var(--muted)" }}>
Squad Member & Admin Portal
</p>
</div>

<form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
<div>
<label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: 6 }}>
SELECT YOUR NAME
</label>
<select
className="il-select"
value={loginPlayerId}
onChange={(e) => {
setLoginPlayerId(e.target.value);
setLoginError("");
}}
>
{state.players.map((p) => (
<option key={p.id} value={p.id}>
{p.name} {p.isAdmin ? "(Admin)" : ""}
</option>
))}
</select>
</div>

<div>
<label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: 6 }}>
PASSWORD
</label>
<input
type="password"
className="il-input"
placeholder="Enter your password"
value={loginPassword}
onChange={(e) => {
setLoginPassword(e.target.value);
setLoginError("");
}}
/>
</div>

{loginError && (
<div
style={{
background: "rgba(225,29,72,0.18)",
border: "1px solid rgba(251,113,133,0.45)",
color: "#fda4af",
padding: "8px 10px",
borderRadius: 10,
fontSize: 12,
fontWeight: 600,
}}
>
{loginError}
</div>
)}

<button type="submit" className="il-btn il-btn-gold" style={{ padding: 13, fontSize: 15 }}>
<Lock size={16} /> Enter Indore Legends Hub
</button>
</form>

<div style={{ marginTop: 14, fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
Admins can log in with either Normal Pass or locked Admin Pass.
</div>
</div>
</div>
);
}

// Helper values for logged-in player's Home Card
const userSR =
currentUser.ballsFaced > 0
? ((currentUser.runs / currentUser.ballsFaced) * 100).toFixed(1)
: "0.0";
const userEcon =
currentUser.oversBowled > 0
? (currentUser.runsConceded / currentUser.oversBowled).toFixed(2)
: "0.00";
const myPollVote = state.poll.find((v) => v.playerId === currentUser.id)?.choice || "";

// Helper for Live Match
const lm = state.liveMatch;
const lmMaxBalls = lm ? lm.totalOvers * 6 : 60;
const lmBallsLeft = lm ? Math.max(0, lmMaxBalls - lm.balls) : 0;
const lmCrr = lm && lm.balls > 0 ? (lm.runs / (lm.balls / 6)).toFixed(2) : "0.00";
const lmRunsNeeded = lm && lm.target !== null ? Math.max(0, lm.target - lm.runs) : null;
const lmRrr =
lmRunsNeeded !== null && lmBallsLeft > 0
? (lmRunsNeeded / (lmBallsLeft / 6)).toFixed(2)
: "0.00";

// Group deliveries by over for Over-by-Over Summary
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

return (
<div className="il-shell">
<style>{APP_STYLES}</style>

{/* Pinned Gold Announcement Bar */}
<div className="il-gold-bar">
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
<Bell size={16} />
<span>{state.announcement}</span>
</div>
{isAdmin && (
<button
type="button"
className="il-btn"
style={{ padding: "5px 9px", fontSize: 11, background: "#090d1e", color: "#fbbf24" }}
onClick={() =>
requireAdminPin("Edit Pinned Gold Announcement", () => {
setAnnouncementDraft(state.announcement);
setEditingAnnouncement(true);
})
}
>
Edit
</button>
)}
</div>

{editingAnnouncement && (
<div className="il-card" style={{ display: "flex", gap: 8 }}>
<input
className="il-input"
value={announcementDraft}
onChange={(e) => setAnnouncementDraft(e.target.value)}
placeholder="Write pinned announcement..."
/>
<button
type="button"
className="il-btn il-btn-gold"
onClick={() => {
setState((prev) => ({ ...prev, announcement: announcementDraft.trim() || prev.announcement }));
setEditingAnnouncement(false);
}}
>
Save
</button>
<button type="button" className="il-btn" onClick={() => setEditingAnnouncement(false)}>
<X size={15} />
</button>
</div>
)}

{/* Top Header (Triple-Tap IL Crest unlocks Ganesh Mandir) */}
<header className="il-header">
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<div className="il-crest" onClick={handleCrestTap} title="Indore Legends Crest">
IL
</div>
<div>
<div style={{ fontWeight: 900, fontSize: 16, letterSpacing: "0.03em" }}>
INDORE LEGENDS
</div>
<div style={{ fontSize: 11, color: "var(--muted)" }}>
{currentUser.name} {isAdmin ? "• ADMIN" : "• PLAYER"}
</div>
</div>
</div>

<div style={{ display: "flex", gap: 6 }}>
<button
type="button"
className="il-btn"
style={{ padding: "8px 10px" }}
onClick={() => setVoiceOutput((v) => !v)}
title="Toggle Voice Commentary"
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

{/* ==================== HOME TAB (PERSONALIZED ONLY — NO SCORECARD) ==================== /}
{tab === "home" && (
<div>
{/ Countdown Timer */}
<div
className="il-card"
style={{
background:
"linear-gradient(135deg, rgba(255,94,151,0.18), rgba(76,29,149,0.34), rgba(15,23,42,0.95))",
borderColor: "rgba(255, 138, 61, 0.45)",
}}
>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
<span className="il-pill" style={{ background: "rgba(251,191,36,0.2)", color: "#fde68a" }}>
<Flame size={13} /> {state.scheduledMatch ? state.scheduledMatch.title : "Official Launch Countdown"}
</span>
<span style={{ fontSize: 11, color: "#cbd5e1", display: "inline-flex", alignItems: "center", gap: 4 }}>
<Clock size={13} />{" "}
{state.scheduledMatch ? state.scheduledMatch.dateTime.replace("T", " ") : "Nov 29, 2026 • 3:00 PM IST"}
</span>
</div>

<div className="il-grid-4" style={{ marginTop: 12 }}>
{[
{ label: "DAYS", val: cdDays, color: "#ff4ecd" },
{ label: "HOURS", val: cdHours, color: "#ff8a3d" },
{ label: "MINS", val: cdMins, color: "#38e8ff" },
{ label: "SECS", val: cdSecs, color: "#ffd166" },
 ].map((u) => (
<div
key={u.label}
style={{
background: "rgba(2,6,23,0.75)",
borderRadius: 12,
padding: "12px 6px",
textAlign: "center",
borderBottom: 3px solid ${u.color}`,
}}
>
<div style={{ fontSize: 24, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
{u.val}
</div>
<div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: u.color }}>
{u.label}
</div>
</div>
))}
</div>
</div>

{/* Logged-In Player's Personal IPL Card ONLY */}
<div className="il-card il-ipl-card">
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
<div>
<div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 800, letterSpacing: "0.1em" }}>
MY PLAYER CARD • RANK SCORE {playerRankScore(currentUser)}
</div>
<h2 style={{ margin: "4px 0 4px 0", fontSize: 24, fontWeight: 900 }}>
{currentUser.name}
</h2>
<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
<span className="il-pill" style={{ background: "rgba(56,189,248,0.18)", color: "#7dd3fc" }}>
{currentUser.role}
</span>
<span className="il-pill" style={{ background: "rgba(167,139,250,0.2)", color: "#ddd6fe" }}>
<Award size={12} /> {currentUser.funAward}
</span>
{orangeCapHolder.id === currentUser.id && (
<span className="il-pill" style={{ background: "rgba(251,146,60,0.25)", color: "#fdba74" }}>
<Crown size={12} /> Orange Cap
</span>
)}
{purpleCapHolder.id === currentUser.id && (
<span className="il-pill" style={{ background: "rgba(168,85,247,0.28)", color: "#e9d5ff" }}>
<Crown size={12} /> Purple Cap
</span>
)}
</div>
</div>

<button
type="button"
className="il-btn"
style={{ padding: "7px 11px", fontSize: 12 }}
onClick={() => {
setShowPassForm((v) => !v);
setPassNotice("");
}}
>
<Key size={14} /> Change Pass
</button>
</div>

{/* Personal Career Stats */}
<div className="il-grid-4 il-resp-2" style={{ marginTop: 16 }}>
<div style={{ background: "rgba(2,6,23,0.72)", padding: 12, borderRadius: 12, textAlign: "center" }}>
<div style={{ fontSize: 11, color: "var(--muted)" }}>TOTAL RUNS</div>
<div style={{ fontSize: 26, fontWeight: 900, color: "var(--cyan)" }}>{currentUser.runs}</div>
<div style={{ fontSize: 11, color: "var(--muted)" }}>SR {userSR}</div>
</div>
<div style={{ background: "rgba(2,6,23,0.72)", padding: 12, borderRadius: 12, textAlign: "center" }}>
<div style={{ fontSize: 11, color: "var(--muted)" }}>TOTAL WICKETS</div>
<div style={{ fontSize: 26, fontWeight: 900, color: "var(--purple)" }}>{currentUser.wickets}</div>
<div style={{ fontSize: 11, color: "var(--muted)" }}>Econ {userEcon}</div>
</div>
<div style={{ background: "rgba(2,6,23,0.72)", padding: 12, borderRadius: 12, textAlign: "center" }}>
<div style={{ fontSize: 11, color: "var(--muted)" }}>MATCHES</div>
<div style={{ fontSize: 26, fontWeight: 900 }}>{currentUser.matches}</div>
<div style={{ fontSize: 11, color: "var(--muted)" }}>
4s: {currentUser.fours} • 6s: {currentUser.sixes}
</div>
</div>
<div style={{ background: "rgba(2,6,23,0.72)", padding: 12, borderRadius: 12, textAlign: "center" }}>
<div style={{ fontSize: 11, color: "var(--muted)" }}>MY MONEY</div>
<div
style={{
fontSize: 22,
fontWeight: 900,
color: currentUser.finesDue > 0 ? "var(--rose)" : "var(--emerald)",
}}
>
{currentUser.finesDue > 0 ? Due ₹${currentUser.finesDue}` : "Clear ✓"}
</div>
<div style={{ fontSize: 11, color: "var(--gold)" }}>
Adv. Credit: ₹{currentUser.advanceCredit}
</div>
</div>
</div>

{showPassForm && (
<form
onSubmit={handleChangeNormalPass}
style={{
marginTop: 14,
padding: 12,
borderRadius: 12,
background: "rgba(2,6,23,0.8)",
border: "1px solid var(--border)",
display: "grid",
gap: 8,
}}
>
<div style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700 }}>
Change Normal Password {currentUser.isAdmin ? "(Admin Password cannot be changed)" : ""}
</div>
<div style={{ display: "flex", gap: 8 }}>
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
</div>
{passNotice && <div style={{ fontSize: 12, color: "var(--emerald)" }}>{passNotice}</div>}
</form>
)}
</div>

{/* Club Money Quick Strip (Home shows Money + Player Card) */}
<div className="il-grid-2" style={{ marginBottom: 12 }}>
<div className="il-card" style={{ marginBottom: 0 }}>
<div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>CLUB TREASURY BALANCE</div>
<div style={{ fontSize: 26, fontWeight: 900, color: "var(--emerald)", marginTop: 4 }}>
₹{clubNetBalance}
</div>
</div>
<div className="il-card" style={{ marginBottom: 0 }}>
<div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>ADVANCE CREDIT POOL</div>
<div style={{ fontSize: 26, fontWeight: 900, color: "var(--gold)", marginTop: 4 }}>
₹{totalAdvances}
</div>
</div>
</div>

{/* Playing Poll */}
<div className="il-card">
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
<div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
<CheckCircle size={16} color="#34d399" /> Next Match Playing Poll
</div>
<span style={{ fontSize: 12, color: "var(--muted)" }}>
{state.poll.filter((v) => v.choice === "IN").length} IN •{" "}
{state.poll.filter((v) => v.choice === "MAYBE").length} MAYBE •{" "}
{state.poll.filter((v) => v.choice === "OUT").length} OUT
</span>
</div>

<div className="il-grid-3">
{(["IN", "MAYBE", "OUT"] as PollChoice[]).map((choice) => (
<button
key={choice}
type="button"
className={il-btn ${
myPollVote === choice
? choice === "IN"
? "il-btn-emerald"
: choice === "OUT"
? "il-btn-danger"
: "il-btn-gold"
: ""
}`}
onClick={() => handleVotePoll(choice)}
>
{choice}
</button>
))}
</div>

<div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
{state.poll.map((v) => (
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
color:
v.choice === "IN" ? "#6ee7b7" : v.choice === "OUT" ? "#fda4af" : "#fde68a",
}}
>
{v.playerName.split(" ")[0]}: {v.choice}
</span>
))}
</div>
</div>

{/* Google Maps Ground Direction */}
<div className="il-card">
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
<div>
<div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
<MapPin size={16} color="#38bdf8" /> Ground Direction
</div>
<div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{state.groundName}</div>
</div>
<div style={{ display: "flex", gap: 8 }}>
<a
href={state.groundMapUrl}
target="_blank"
rel="noreferrer"
className="il-btn il-btn-primary"
style={{ textDecoration: "none" }}
>
<MapPin size={15} /> Open Google Maps
</a>
{isAdmin && (
<button
type="button"
className="il-btn"
onClick={() =>
requireAdminPin("Update Ground Map Location", () => {
setGroundNameDraft(state.groundName);
setGroundUrlDraft(state.groundMapUrl);
setEditingGround(true);
})
}
>
Edit
</button>
)}
</div>
</div>

{editingGround && (
<div style={{ marginTop: 12, display: "grid", gap: 8 }}>
<input
className="il-input"
value={groundNameDraft}
onChange={(e) => setGroundNameDraft(e.target.value)}
placeholder="Ground Name"
/>
<input
className="il-input"
value={groundUrlDraft}
onChange={(e) => setGroundUrlDraft(e.target.value)}
placeholder="Google Maps Link"
/>
<div style={{ display: "flex", gap: 8 }}>
<button
type="button"
className="il-btn il-btn-gold"
onClick={() => {
setState((prev) => ({
...prev,
groundName: groundNameDraft.trim() || prev.groundName,
groundMapUrl: groundUrlDraft.trim() || prev.groundMapUrl,
}));
setEditingGround(false);
}}
>
Save Ground
</button>
<button type="button" className="il-btn" onClick={() => setEditingGround(false)}>
Cancel
</button>
</div>
</div>
)}
</div>
</div>
)}

{/* ==================== MATCH TAB (SCORECARD APPEARS ONLY WHEN MATCH IS CREATED) ==================== /}
{tab === "match" && (
<div>
{/ CASE 1: NO ACTIVE LIVE MATCH YET */}
{!lm && (
<div>
<div className="il-card il-ipl-card">
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
<div>
<div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 800 }}>MATCH CENTER</div>
<h2 style={{ margin: "4px 0 0 0", fontSize: 20 }}>
{state.scheduledMatch ? state.scheduledMatch.title : "No Active Match Right Now"}
</h2>
<div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
Scorecard & Live Scoring tools unlock automatically once a match is created & started.
</div>
</div>
{isAdmin && (
<button
type="button"
className="il-btn il-btn-gold"
onClick={() =>
requireAdminPin("Create New Match (3-Day Advance Setup)", () =>
setShowCreateWizard(true)
)
}
>
<Plus size={16} /> Create Match
</button>
)}
</div>

{/* Create Match Wizard */}
{showCreateWizard && (
<div
style={{
marginTop: 14,
padding: 14,
borderRadius: 14,
background: "rgba(2,6,23,0.85)",
border: "1px solid var(--border)",
display: "grid",
gap: 10,
}}
>
<div style={{ fontWeight: 800, color: "var(--gold)" }}>
Match Setup (Select Overs, Date/Time & Players)
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
{[5, 6, 8, 10, 12, 15, 20].map((ov) => (
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
Select Players ({wizSelectedIds.length} selected — minimum 4 for Auto Team Splitter):
</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
{state.players.map((p) => {
const picked = wizSelectedIds.includes(p.id);
return (
<button
key={p.id}
type="button"
className={il-btn${picked ? "il-btn-primary" : ""}`}
style={{ padding: "6px 10px", fontSize: 12 }}
onClick={() =>
setWizSelectedIds((prev) =>
prev.includes(p.id)
? prev.filter((id) => id !== p.id)
: [...prev, p.id]
)
}
>
{p.name.split(" ")[0]} ({playerRankScore(p)})
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
<Shuffle size={15} /> Create & Auto-Split Teams
</button>
<button type="button" className="il-btn" onClick={() => setShowCreateWizard(false)}>
Cancel
</button>
</div>
</div>
)}
</div>

{/* Scheduled Match Pre-Game Lobby (Auto Split, Auto C/VC, Coin Toss, Checklist) */}
{state.scheduledMatch && (
<div className="il-card">
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
<div>
<span className="il-pill" style={{ background: "rgba(56,189,248,0.2)", color: "#7dd3fc" }}>
{state.scheduledMatch.overs} Overs • {state.scheduledMatch.dateTime.replace("T", " ")}
</span>
<h3 style={{ margin: "6px 0 0 0" }}>Auto-Split Fair Teams & Captains</h3>
</div>
{isAdmin && (
<button
type="button"
className="il-btn"
style={{ fontSize: 12 }}
onClick={() =>
requireAdminPin("Re-decide Captains & Vice-Captains", reRollScheduledTeamsAndCaptains)
}
>
<Shuffle size={14} /> Auto-Decide C / VC
</button>
)}
</div>

{/* Teams + Auto Captain/VC */}
<div className="il-grid-2 il-resp-1" style={{ marginTop: 12 }}>
<div style={{ background: "rgba(2,6,23,0.75)", padding: 12, borderRadius: 12, border: "1px solid rgba(56,189,248,0.3)" }}>
<div style={{ fontWeight: 900, color: "var(--cyan)" }}>{state.scheduledMatch.teamAName}</div>
<div style={{ fontSize: 12, color: "var(--gold)", marginTop: 4 }}>
C: {state.scheduledMatch.teamACaptain} • VC: {state.scheduledMatch.teamAViceCaptain}
</div>
<div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
{state.players
.filter((p) => state.scheduledMatch?.teamAIds.includes(p.id))
.map((p) => (
<span key={p.id} className="il-pill" style={{ background: "#1e293b", color: "#e2e8f0" }}>
{p.name}
</span>
))}
</div>
</div>

<div style={{ background: "rgba(2,6,23,0.75)", padding: 12, borderRadius: 12, border: "1px solid rgba(251,191,36,0.3)" }}>
<div style={{ fontWeight: 900, color: "var(--gold)" }}>{state.scheduledMatch.teamBName}</div>
<div style={{ fontSize: 12, color: "var(--cyan)", marginTop: 4 }}>
C: {state.scheduledMatch.teamBCaptain} • VC: {state.scheduledMatch.teamBViceCaptain}
</div>
<div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
{state.players
.filter((p) => state.scheduledMatch?.teamBIds.includes(p.id))
.map((p) => (
<span key={p.id} className="il-pill" style={{ background: "#1e293b", color: "#e2e8f0" }}>
{p.name}
</span>
))}
</div>
</div>
</div>

{/* Digital Coin Toss */}
<div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.72)", border: "1px solid var(--border)" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
<div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
<Coins size={16} color="#fbbf24" className={coinFlipping ? "il-coin-spin" : ""} /> Digital Coin Toss
</div>
<button
type="button"
className="il-btn il-btn-gold"
disabled={coinFlipping}
onClick={() => flipCoin("match")}
>
{coinFlipping ? "Flipping..." : "Flip Coin"}
</button>
</div>
{(coinResult || state.scheduledMatch.tossWinner) && (
<div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
<div style={{ fontSize: 13 }}>
Coin: <strong style={{ color: "var(--gold)" }}>{coinResult || "DONE"}</strong> • Toss Winner:{" "}
<strong style={{ color: "var(--cyan)" }}>{state.scheduledMatch.tossWinner}</strong>
</div>
<div style={{ display: "flex", gap: 6 }}>
{(["BAT", "BOWL"] as const).map((dec) => (
<button
key={dec}
type="button"
className={il-btn ${state.scheduledMatch?.tossDecision === dec ? "il-btn-emerald" : ""}`}
style={{ padding: "6px 12px", fontSize: 12 }}
onClick={() =>
setState((prev) =>
prev.scheduledMatch
? {
...prev,
scheduledMatch: { ...prev.scheduledMatch, tossDecision: dec },
}
: prev
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

{/* Pre-Match Checklist */}
<div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "rgba(2,6,23,0.72)", border: "1px solid var(--border)" }}>
<div style={{ fontWeight: 800, marginBottom: 8 }}>Match Day Checklist</div>
<div style={{ display: "grid", gap: 6 }}>
{state.scheduledMatch.checklist.map((item) => (
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
setState((prev) =>
prev.scheduledMatch
? {
...prev,
scheduledMatch: {
...prev.scheduledMatch,
checklist: prev.scheduledMatch.checklist.map((c) =>
c.id === item.id ? { ...c, done: !c.done } : c
),
},
}
: prev
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
setState((prev) =>
prev.scheduledMatch
? {
...prev,
scheduledMatch: {
...prev.scheduledMatch,
checklist: [
...prev.scheduledMatch.checklist,
{ id: uid("chk"), label: newChecklistLabel.trim(), done: false },
 ],
},
}
: prev
);
setNewChecklistLabel("");
}}
>
<Plus size={15} />
</button>
</div>
</div>

{isAdmin && (
<div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
<button
type="button"
className="il-btn il-btn-emerald"
style={{ flex: 1, padding: 13 }}
onClick={() =>
requireAdminPin("Start Live Match Scoring", startLiveMatchFromScheduled)
}
>
<Play size={16} /> Start Live Match & Scorecard
</button>
<button
type="button"
className="il-btn il-btn-danger"
onClick={() =>
requireAdminPin("Cancel Scheduled Match", () =>
setState((prev) => ({ ...prev, scheduledMatch: null }))
)
}
>
<Trash2 size={15} />
</button>
</div>
)}
</div>
)}

{/* Match History */}
<div className="il-card">
<div style={{ fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
<Trophy size={16} color="#fbbf24" /> Match History ({state.matchHistory.length})
</div>
{state.matchHistory.length === 0 ? (
<div style={{ fontSize: 13, color: "var(--muted)" }}>
Completed matches will appear here with full MVP and WhatsApp scorecard links.
</div>
) : (
<div style={{ display: "grid", gap: 8 }}>
{state.matchHistory.map((h) => (
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
{h.winner} • MVP: {h.mvp} ({h.date})
</div>
</div>
<a
href={https://wa.me/?text=${encodeURIComponent(h.scorecardText)}`}
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

{/* CASE 2: ACTIVE LIVE MATCH SCORECARD & SCORER /}
{lm && (
<div>
{/ Free Hit Flashing Banner */}
{lm.freeHitActive && (
<div className="il-freehit-banner">
⚡ FREE HIT ACTIVE! ONLY RUN OUT ALLOWED ⚡
</div>
)}

{/* IPL Broadcast Scoreboard */}
<div className="il-card il-ipl-card">
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
<div>
<span className="il-pill" style={{ background: "rgba(244,63,94,0.22)", color: "#fda4af" }}>
<Activity size={12} /> {lm.isSuperOver ? "SUPER OVER" : INNINGS ${lm.innings}`} • {lm.title}
</span>
<div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{lm.tossInfo}</div>
</div>

<a
href={https://wa.me/?text=${encodeURIComponent(buildWhatsappScorecard(lm))}`}
target="_blank"
rel="noreferrer"
className="il-btn il-btn-emerald"
style={{ textDecoration: "none", padding: "7px 11px", fontSize: 12 }}
>
<Share2 size={14} /> WhatsApp Scorecard
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

{/* Live Chase Calculator (2nd Innings) */}
{lm.innings === 2 && lm.target !== null && (
<div
style={{
marginTop: 12,
padding: 12,
borderRadius: 12,
background: "rgba(2,6,23,0.8)",
border: "1px solid rgba(56,189,248,0.35)",
}}
>
<div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, flexWrap: "wrap", gap: 6 }}>
<span style={{ color: "var(--gold)" }}>LIVE CHASE CALCULATOR • Target {lm.target}</span>
<span style={{ color: "var(--emerald)" }}>
Need {lmRunsNeeded} runs in {lmBallsLeft} balls (RRR {lmRrr})
</span>
</div>
<div style={{ height: 8, background: "#1e293b", borderRadius: 99, overflow: "hidden", marginTop: 8 }}>
<div
style={{
height: "100%",
width: ${Math.min(100, Math.round((lm.runs / Math.max(1, lm.target)) * 100))}%`,
background: "linear-gradient(90deg, #38bdf8, #34d399, #fbbf24)",
}}
/>
</div>
</div>
)}

{lm.resultText && (
<div
style={{
marginTop: 12,
padding: 12,
borderRadius: 12,
background: "rgba(52,211,153,0.18)",
border: "1px solid rgba(52,211,153,0.5)",
fontWeight: 900,
color: "#6ee7b7",
textAlign: "center",
}}
>
🏆 {lm.resultText}
</div>
)}
</div>

{/* Striker / Non-Striker / Bowler + Retired Hurt & Mid-Over Swap */}
<div className="il-card">
<div className="il-grid-3 il-resp-1">
<div style={{ background: "rgba(2,6,23,0.75)", padding: 10, borderRadius: 12, border: "1px solid rgba(251,191,36,0.4)" }}>
<div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 800 }}>STRIKER </div>
<select
className="il-select"
style={{ marginTop: 4, padding: "6px 8px", fontSize: 13 }}
value={lm.striker}
disabled={!isAdmin}
onChange={(e) =>
setState((prev) =>
prev.liveMatch ? { ...prev, liveMatch: { ...prev.liveMatch, striker: e.target.value } } : prev
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

<div style={{ background: "rgba(2,6,23,0.75)", padding: 10, borderRadius: 12 }}>
<div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>NON-STRIKER</div>
<select
className="il-select"
style={{ marginTop: 4, padding: "6px 8px", fontSize: 13 }}
value={lm.nonStriker}
disabled={!isAdmin}
onChange={(e) =>
setState((prev) =>
prev.liveMatch ? { ...prev, liveMatch: { ...prev.liveMatch, nonStriker: e.target.value } } : prev
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
{lm.bowlers[lm.bowler]?.wickets ?? 0}/{lm.bowlers[lm.bowler]?.runs ?? 0} (
{formatOvers(lm.bowlers[lm.bowler]?.balls ?? 0)} ov)
</div>
</div>
</div>

{/* Admin-Only Live Scoring Controls */}
{isAdmin ? (
<>
<div className="il-grid-4" style={{ marginTop: 12 }}>
{[0, 1, 2, 3, 4, 6].map((run) => (
<button
key={run}
type="button"
disabled={lm.isCompleted}
className={il-btn${run === 4 ? "il-btn-primary" : run === 6 ? "il-btn-gold" : ""}`}
onClick={() => recordLiveBall(run)}
>
+{run}
</button>
))}
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

{/* Retired Hurt + Mid-Over Bowler Swap + Innings/Super Over */}
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
Mid-Over Bowler Swap
</button>

{lm.innings === 1 && (
<button
type="button"
className="il-btn il-btn-primary"
style={{ fontSize: 12 }}
onClick={startSecondInnings}
>
Start 2nd Innings
</button>
)}

{lm.isTied && (
<button
type="button"
className="il-btn il-btn-gold"
style={{ fontSize: 12 }}
onClick={launchSuperOver}
>
⚡ Start Super Over
</button>
)}

<button
type="button"
className="il-btn il-btn-emerald"
style={{ fontSize: 12 }}
onClick={() =>
requireAdminPin("Finish Match & Save to History", archiveLiveMatch)
}
>
Finish & Save Match
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
Live viewer mode — only Admins can update the scorecard.
</div>
)}
</div>

{/* Umpire Terminal */}
<div className="il-card">
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
<span style={{ fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6 }}>
<Shield size={16} color="#fbbf24" /> Umpire Terminal
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
setUmpireBanner(Umpire: ${sig}`);
speak(sig);
}}
>
{sig}
</button>
))}
</div>
</div>

{/* Over-by-Over Summary */}
<div className="il-card">
<div style={{ fontWeight: 800, marginBottom: 10 }}>Over-by-Over Summary</div>
{oversGrouped.length === 0 ? (
<div style={{ fontSize: 13, color: "var(--muted)" }}>No balls bowled in this innings yet.</div>
) : (
<div style={{ display: "grid", gap: 8 }}>
{oversGrouped.map((ov) => (
<div
key={ov.overNum}
style={{
background: "rgba(2,6,23,0.72)",
padding: "10px 12px",
borderRadius: 12,
border: "1px solid var(--border)",
}}
>
<div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
<strong style={{ color: "var(--gold)" }}>Over {ov.overNum}</strong>
<span>
{ov.runs} runs • {ov.wickets} wkt(s)
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

{/* ==================== SQUAD TAB (ORANGE/PURPLE CAPS, PROFILES, FUN AWARDS) ==================== /}
{tab === "squad" && (
<div>
{/ Auto Orange & Purple Cap Banner */}
<div className="il-grid-2" style={{ marginBottom: 12 }}>
<div
className="il-card"
style={{
marginBottom: 0,
background: "linear-gradient(135deg, rgba(234,88,12,0.35), rgba(15,23,42,0.94))",
borderColor: "rgba(251,146,60,0.6)",
}}
>
<div style={{ fontSize: 11, fontWeight: 900, color: "#fdba74", display: "flex", alignItems: "center", gap: 5 }}>
<Crown size={14} /> AUTO ORANGE CAP
</div>
<div style={{ fontSize: 19, fontWeight: 900, marginTop: 4 }}>{orangeCapHolder.name}</div>
<div style={{ fontSize: 13, color: "#ffedd5" }}>{orangeCapHolder.runs} Runs</div>
</div>

<div
className="il-card"
style={{
marginBottom: 0,
background: "linear-gradient(135deg, rgba(126,34,206,0.35), rgba(15,23,42,0.94))",
borderColor: "rgba(192,132,252,0.6)",
}}
>
<div style={{ fontSize: 11, fontWeight: 900, color: "#e9d5ff", display: "flex", alignItems: "center", gap: 5 }}>
<Crown size={14} /> AUTO PURPLE CAP
</div>
<div style={{ fontSize: 19, fontWeight: 900, marginTop: 4 }}>{purpleCapHolder.name}</div>
<div style={{ fontSize: 13, color: "#f3e8ff" }}>{purpleCapHolder.wickets} Wickets</div>
</div>
</div>

{/* Full 13-Player Squad Profiles */}
{state.players
.slice()
.sort((a, b) => playerRankScore(b) - playerRankScore(a))
.map((p, idx) => {
const sr = p.ballsFaced > 0 ? ((p.runs / p.ballsFaced) * 100).toFixed(1) : "0.0";
const econ = p.oversBowled > 0 ? (p.runsConceded / p.oversBowled).toFixed(2) : "0.00";
return (
<div key={p.id} className="il-card">
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
<div>
<div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
<span className="il-pill" style={{ background: "rgba(56,189,248,0.18)", color: "#7dd3fc" }}>
#{idx + 1}
</span>
<strong style={{ fontSize: 16 }}>{p.name}</strong>
<span style={{ fontSize: 12, color: "var(--muted)" }}>({p.role})</span>
</div>
<div style={{ marginTop: 5, display: "flex", gap: 6, flexWrap: "wrap" }}>
<span className="il-pill" style={{ background: "rgba(251,191,36,0.18)", color: "#fde68a" }}>
<Award size={12} /> {p.funAward}
</span>
<span style={{ fontSize: 11, color: "var(--muted)" }}>
Rank Pts: {playerRankScore(p)}
</span>
</div>
</div>

{isAdmin && (
<button
type="button"
className="il-btn"
style={{ padding: "6px 10px", fontSize: 12 }}
onClick={() =>
requireAdminPin(Edit${p.name}'s Stats & Award`, () => {
setEditPlayerId(p.id);
setEditAwardText(p.funAward);
})
}
>
Admin Edit
</button>
)}
</div>

<div className="il-grid-4" style={{ marginTop: 10, textAlign: "center" }}>
<div style={{ background: "rgba(2,6,23,0.7)", padding: 8, borderRadius: 10 }}>
<div style={{ fontSize: 10, color: "var(--muted)" }}>RUNS</div>
<div style={{ fontWeight: 900 }}>{p.runs}</div>
</div>
<div style={{ background: "rgba(2,6,23,0.7)", padding: 8, borderRadius: 10 }}>
<div style={{ fontSize: 10, color: "var(--muted)" }}>SR</div>
<div style={{ fontWeight: 900 }}>{sr}</div>
</div>
<div style={{ background: "rgba(2,6,23,0.7)", padding: 8, borderRadius: 10 }}>
<div style={{ fontSize: 10, color: "var(--muted)" }}>WKTS</div>
<div style={{ fontWeight: 900 }}>{p.wickets}</div>
</div>
<div style={{ background: "rgba(2,6,23,0.7)", padding: 8, borderRadius: 10 }}>
<div style={{ fontSize: 10, color: "var(--muted)" }}>ECON</div>
<div style={{ fontWeight: 900 }}>{econ}</div>
</div>
</div>

{editPlayerId === p.id && (
<div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "rgba(2,6,23,0.85)", display: "grid", gap: 8 }}>
<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
<button
type="button"
className="il-btn il-btn-emerald"
style={{ padding: "6px 10px", fontSize: 12 }}
onClick={() =>
setState((prev) => ({
...prev,
players: prev.players.map((pl) =>
pl.id === p.id ? { ...pl, runs: pl.runs + 10, ballsFaced: pl.ballsFaced + 8 } : pl
),
}))
}
>
+10 Runs
</button>
<button
type="button"
className="il-btn il-btn-primary"
style={{ padding: "6px 10px", fontSize: 12 }}
onClick={() =>
setState((prev) => ({
...prev,
players: prev.players.map((pl) =>
pl.id === p.id ? { ...pl, wickets: pl.wickets + 1, oversBowled: pl.oversBowled + 1 } : pl
),
}))
}
>
+1 Wkt
</button>
<button
type="button"
className="il-btn il-btn-danger"
style={{ padding: "6px 10px", fontSize: 12 }}
onClick={() =>
setState((prev) => ({
...prev,
players: prev.players.map((pl) =>
pl.id === p.id ? { ...pl, finesDue: pl.finesDue + 50 } : pl
),
}))
}
>
+₹50 Due
</button>
<button
type="button"
className="il-btn il-btn-gold"
style={{ padding: "6px 10px", fontSize: 12 }}
onClick={() =>
setState((prev) => ({
...prev,
players: prev.players.map((pl) =>
pl.id === p.id ? { ...pl, finesDue: 0 } : pl
),
}))
}
>
Clear Dues
</button>
<button
type="button"
className="il-btn il-btn-purple"
style={{ padding: "6px 10px", fontSize: 12 }}
onClick={() =>
setState((prev) => ({
...prev,
players: prev.players.map((pl) =>
pl.id === p.id ? { ...pl, advanceCredit: pl.advanceCredit + 50 } : pl
),
}))
}
>
+₹50 Adv Credit
</button>
</div>
<div style={{ display: "flex", gap: 6 }}>
<input
className="il-input"
value={editAwardText}
onChange={(e) => setEditAwardText(e.target.value)}
placeholder="Fun Award Title"
/>
<button
type="button"
className="il-btn il-btn-gold"
onClick={() => {
setState((prev) => ({
...prev,
players: prev.players.map((pl) =>
pl.id === p.id ? { ...pl, funAward: editAwardText.trim() || pl.funAward } : pl
),
}));
setEditPlayerId("");
}}
>
Done
</button>
</div>
</div>
)}
</div>
);
})}
</div>
)}

{/* ==================== TREASURY TAB (MONEY TRACKER, PIE CHART, ADVANCE CREDIT, WHATSAPP DUES) ==================== */}
{tab === "treasury" && (
<div>
<div className="il-card">
<div style={{ fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
<Wallet size={16} color="#34d399" /> Club Money Tracker & Pie Chart
</div>
<DonutPieChart
centerLabel={₹${clubNetBalance}`}
slices={[
{ label: "Credits", value: totalCredits, color: "#34d399" },
{ label: "Advance Credits", value: totalAdvances, color: "#fbbf24" },
{ label: "Fines", value: totalFines, color: "#38bdf8" },
{ label: "Expenses", value: totalExpenses, color: "#fb7185" },
 ]}
/>
</div>

{/* Pending Dues & Advance Credit Balance List */}
<div className="il-card">
<div style={{ fontWeight: 800, marginBottom: 10 }}>
Member Dues & Advance Credit Balances
</div>
<div style={{ display: "grid", gap: 8 }}>
{state.players
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
<div>
<strong>{p.name}</strong>
<div style={{ fontSize: 12, color: "var(--muted)" }}>
Due: <span style={{ color: p.finesDue > 0 ? "var(--rose)" : "var(--emerald)" }}>₹{p.finesDue}</span>{" "}
• Adv Credit: <span style={{ color: "var(--gold)" }}>₹{p.advanceCredit}</span>
</div>
</div>
{p.finesDue > 0 && (
<a
href={https://wa.me/?text=${encodeURIComponent(
🏏 Indore Legends Reminder: Hi ${p.name}, you have a pending club due/fine of ₹${p.finesDue}. Please clear it before the next match!
)}`}
target="_blank"
rel="noreferrer"
className="il-btn il-btn-emerald"
style={{ textDecoration: "none", padding: "6px 10px", fontSize: 12 }}
>
<Share2 size={13} /> WhatsApp Due Reminder
</a>
)}
</div>
))}
</div>
</div>

{/* Admin-Only Add Transaction */}
{isAdmin && (
<div className="il-card">
<div style={{ fontWeight: 800, marginBottom: 10 }}>Add Treasury Entry (Admin PIN Required)</div>
<div style={{ display: "grid", gap: 8 }}>
<input
className="il-input"
placeholder="Title (e.g., Turf Booking, Late Fine, Advance Deposit)"
value={trTitle}
onChange={(e) => setTrTitle(e.target.value)}
/>
<div className="il-grid-4 il-resp-2">
<select
className="il-select"
value={trType}
onChange={(e) => setTrType(e.target.value as LedgerType)}
>
<option value="CREDIT">Credit (+)</option>
<option value="ADVANCE">Adv Credit (+)</option>
<option value="FINE">Fine (+)</option>
<option value="EXPENSE">Expense (-)</option>
</select>
<input
className="il-input"
type="number"
min={1}
placeholder="Amount ₹"
value={trAmount}
onChange={(e) => setTrAmount(e.target.value)}
/>
<select
className="il-select"
value={trMember}
onChange={(e) => setTrMember(e.target.value)}
>
<option value="All Squad">All Squad</option>
{state.players.map((p) => (
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
requireAdminPin("Add Treasury Transaction", () => {
const entry: TreasuryEntry = {
id: uid("tr"),
title: trTitle.trim(),
type: trType,
amount: amt,
memberName: trMember,
date: new Date().toISOString().slice(0, 10),
};
setState((prev) => ({
...prev,
treasury: [entry, ...prev.treasury],
players:
trType === "ADVANCE"
? prev.players.map((pl) =>
pl.name === trMember
? { ...pl, advanceCredit: pl.advanceCredit + amt }
: pl
)
: prev.players,
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

{/* Ledger List */}
<div className="il-card">
<div style={{ fontWeight: 800, marginBottom: 10 }}>Recent Ledger</div>
<div style={{ display: "grid", gap: 8 }}>
{state.treasury.map((t) => (
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
{t.memberName} • {t.date} • {t.type}
</div>
</div>
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
<strong style={{ color: t.type === "EXPENSE" ? "var(--rose)" : "var(--emerald)" }}>
{t.type === "EXPENSE" ? "-" : "+"}₹{t.amount}
</strong>
{isAdmin && (
<button
type="button"
className="il-btn"
style={{ padding: "5px 7px" }}
onClick={() =>
requireAdminPin("Delete Ledger Entry", () =>
setState((prev) => ({
...prev,
treasury: prev.treasury.filter((x) => x.id !== t.id),
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
</div>
</div>
)}

{/* ==================== LOCKER-ROOM CHAT TAB ==================== */}
{tab === "chat" && (
<div className="il-card">
<div style={{ fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
<MessageSquare size={16} color="#38bdf8" /> Indore Legends Locker-Room Chat
</div>
<div className="il-scroll-box">
{state.messages.map((m) => (
<div
key={m.id}
style={{
alignSelf: m.sender === currentUser.name ? "flex-end" : "flex-start",
maxWidth: "86%",
background:
m.sender === currentUser.name ? "rgba(37,99,235,0.28)" : "rgba(2,6,23,0.75)",
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
))}
<div ref={chatEndRef} />
</div>

<form
onSubmit={(e) => {
e.preventDefault();
if (!chatText.trim()) return;
setState((prev) => ({
...prev,
messages: [
...prev.messages,
{ id: uid("m"), sender: currentUser.name, text: chatText.trim(), timestamp: nowTime() },
 ],
}));
setChatText("");
}}
style={{ display: "flex", gap: 8, marginTop: 12 }}
>
<input
className="il-input"
placeholder={Chat as ${currentUser.name}...`}
value={chatText}
onChange={(e) => setChatText(e.target.value)}
/>
<button type="submit" className="il-btn il-btn-primary">
<Send size={15} />
</button>
</form>
</div>
)}

{/* ==================== LEGENDBOT AI TAB (VOICE INPUT + CRICKET FOCUS) ==================== */}
{tab === "ai" && (
<div className="il-card">
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
<div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
<Bot size={18} color="#a78bfa" /> LegendBot Cricket AI
</div>
<span className="il-pill" style={{ background: "rgba(167,139,250,0.2)", color: "#ddd6fe" }}>
<Sparkles size={12} /> Club + IPL + Intl
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
{aiLoading && <div style={{ fontSize: 12, color: "var(--cyan)" }}>LegendBot is checking cricket intel...</div>}
<div ref={aiEndRef} />
</div>

<div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
{["Orange & Purple Cap", "Club balance & dues", "Who is IN poll?", "IPL & Cricbuzz update"].map(
(chip) => (
<button
key={chip}
type="button"
className="il-btn"
style={{ padding: "5px 10px", fontSize: 11 }}
onClick={() => void askLegendBot(chip)}
>
{chip}
</button>
)
)}
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
className={il-btn${isListening ? "il-btn-danger" : "il-btn-purple"}`}
onClick={toggleVoiceInput}
title="Voice Input"
>
{isListening ? <MicOff size={16} /> : <Mic size={16} />}
</button>
<input
className="il-input"
placeholder={isListening ? "Listening... speak now" : "Ask LegendBot (Club, IPL, Cricbuzz, Intl)..."}
value={aiInput}
onChange={(e) => setAiInput(e.target.value)}
/>
<button type="submit" disabled={aiLoading} className="il-btn il-btn-primary">
<Send size={15} />
</button>
</form>
</div>
)}

{/* ==================== SECRET GANESH MANDIR ZONE (G.M MEMBERS ONLY) ==================== */}
{tab === "gm" && gmUnlocked && (
<div>
<div
className="il-card"
style={{
background: "linear-gradient(135deg, rgba(234,88,12,0.35), rgba(180,83,9,0.28), rgba(15,23,42,0.95))",
borderColor: "rgba(251,146,60,0.65)",
}}
>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
<div>
<span className="il-pill" style={{ background: "rgba(251,146,60,0.25)", color: "#fed7aa" }}>
🕉️ SECRET G.M ZONE UNLOCKED
</span>
<h2 style={{ margin: "6px 0 2px 0", fontSize: 22 }}>Ganesh Mandir Hub</h2>
<div style={{ fontSize: 12, color: "#fed7aa" }}>
Private space for the 8 G.M Squad Members
</div>
</div>
<a
href={state.gm.mapUrl}
target="_blank"
rel="noreferrer"
className="il-btn il-btn-gold"
style={{ textDecoration: "none" }}
>
<MapPin size={15} /> Mandir Directions
</a>
</div>
</div>

{/* G.M Visit Schedule & Prasad Duty */}
<div className="il-card">
<div style={{ fontWeight: 800, marginBottom: 10 }}>Darshan Schedule & Prasad Coordination</div>
<div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
{state.gm.visits.map((v) => (
<div
key={v.id}
style={{
padding: 10,
borderRadius: 12,
background: "rgba(2,6,23,0.75)",
border: "1px solid rgba(251,146,60,0.3)",
}}
>
<div style={{ fontWeight: 800, color: "#fdba74" }}>
{v.date} • {v.time} — {v.plan}
</div>
<div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
Prasad Duty: {v.prasadDuty}
</div>
</div>
))}
</div>
<div className="il-grid-2">
<input
className="il-input"
type="date"
value={gmVisitDate}
onChange={(e) => setGmVisitDate(e.target.value)}
/>
<input
className="il-input"
placeholder="Time (e.g., 7:00 AM)"
value={gmVisitTime}
onChange={(e) => setGmVisitTime(e.target.value)}
/>
<input
className="il-input"
placeholder="Visit Plan"
value={gmVisitPlan}
onChange={(e) => setGmVisitPlan(e.target.value)}
/>
<input
className="il-input"
placeholder="Prasad Duty Member(s)"
value={gmVisitPrasad}
onChange={(e) => setGmVisitPrasad(e.target.value)}
/>
</div>
<button
type="button"
className="il-btn il-btn-gold"
style={{ marginTop: 8 }}
onClick={() => {
if (!gmVisitPlan.trim()) return;
setState((prev) => ({
...prev,
gm: {
...prev.gm,
visits: [
{
id: uid("gmv"),
date: gmVisitDate,
time: gmVisitTime,
plan: gmVisitPlan.trim(),
prasadDuty: gmVisitPrasad.trim() || currentUser.name,
},
...prev.gm.visits,
 ],
},
}));
setGmVisitPlan("");
setGmVisitPrasad("");
}}
>
<Plus size={15} /> Add Visit Plan
</button>
</div>

{/* G.M Attendance Poll & Digital Coin Toss */}
<div className="il-grid-2 il-resp-1" style={{ marginBottom: 12 }}>
<div className="il-card" style={{ marginBottom: 0 }}>
<div style={{ fontWeight: 800, marginBottom: 8 }}>Ganesh Mandir Visit Poll</div>
<div className="il-grid-3">
{(["IN", "MAYBE", "OUT"] as PollChoice[]).map((c) => (
<button
key={c}
type="button"
className="il-btn"
style={{ fontSize: 12 }}
onClick={() =>
setState((prev) => ({
...prev,
gm: {
...prev.gm,
poll: [
...prev.gm.poll.filter((x) => x.playerId !== currentUser.id),
{ playerId: currentUser.id, playerName: currentUser.name, choice: c },
 ],
},
}))
}
>
{c}
</button>
))}
</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
{state.gm.poll.map((v) => (
<span key={v.playerId} className="il-pill" style={{ background: "#1e293b", color: "#fed7aa" }}>
{v.playerName.split(" ")[0]}: {v.choice}
</span>
))}
</div>
</div>

<div className="il-card" style={{ marginBottom: 0 }}>
<div style={{ fontWeight: 800, marginBottom: 8 }}>G.M Digital Coin Toss</div>
<div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
Use for prasad turns, seva duty, or friendly decisions!
</div>
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<button
type="button"
className="il-btn il-btn-gold"
disabled={coinFlipping}
onClick={() => flipCoin("gm")}
>
<Coins size={15} className={coinFlipping ? "il-coin-spin" : ""} /> Flip Coin
</button>
{gmCoinResult && (
<strong style={{ color: "var(--gold)", fontSize: 18 }}>{gmCoinResult}</strong>
)}
</div>
</div>
</div>

{/* G.M Money Tracker & Pie Chart */}
<div className="il-card">
<div style={{ fontWeight: 800, marginBottom: 10 }}>Ganesh Mandir Prasad Fund</div>
<DonutPieChart
centerLabel={₹${
state.gm.treasury
.filter((t) => t.type !== "EXPENSE")
.reduce((s, t) => s + t.amount, 0) -
state.gm.treasury
.filter((t) => t.type === "EXPENSE")
.reduce((s, t) => s + t.amount, 0)
}`}
slices={[
{
label: "Collected",
value: state.gm.treasury
.filter((t) => t.type !== "EXPENSE")
.reduce((s, t) => s + t.amount, 0),
color: "#fb923c",
},
{
label: "Spent",
value: state.gm.treasury
.filter((t) => t.type === "EXPENSE")
.reduce((s, t) => s + t.amount, 0),
color: "#fb7185",
},
 ]}
/>
<div className="il-grid-4 il-resp-2" style={{ marginTop: 12 }}>
<input
className="il-input"
placeholder="Item / Donation"
value={gmTrTitle}
onChange={(e) => setGmTrTitle(e.target.value)}
/>
<select
className="il-select"
value={gmTrType}
onChange={(e) => setGmTrType(e.target.value as LedgerType)}
>
<option value="CREDIT">Collected (+)</option>
<option value="EXPENSE">Spent (-)</option>
</select>
<input
className="il-input"
type="number"
placeholder="₹ Amount"
value={gmTrAmount}
onChange={(e) => setGmTrAmount(e.target.value)}
/>
<button
type="button"
className="il-btn il-btn-gold"
onClick={() => {
const amt = Number(gmTrAmount);
if (!gmTrTitle.trim() || !amt) return;
setState((prev) => ({
...prev,
gm: {
...prev.gm,
treasury: [
{
id: uid("gmt"),
title: gmTrTitle.trim(),
type: gmTrType,
amount: amt,
memberName: currentUser.name,
date: new Date().toISOString().slice(0, 10),
},
...prev.gm.treasury,
 ],
},
}));
setGmTrTitle("");
setGmTrAmount("");
}}
>
Add
</button>
</div>
</div>

{/* G.M Private Chat */}
<div className="il-card">
<div style={{ fontWeight: 800, marginBottom: 10 }}>Private Ganesh Mandir Chat</div>
<div className="il-scroll-box">
{state.gm.messages.map((m) => (
<div
key={m.id}
style={{
background: "rgba(2,6,23,0.75)",
border: "1px solid rgba(251,146,60,0.3)",
padding: "9px 12px",
borderRadius: 12,
}}
>
<div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
<strong style={{ color: "#fdba74" }}>{m.sender}</strong>
<span style={{ color: "var(--muted)" }}>{m.timestamp}</span>
</div>
<div style={{ fontSize: 14, marginTop: 3 }}>{m.text}</div>
</div>
))}
</div>
<form
onSubmit={(e) => {
e.preventDefault();
if (!gmChatText.trim()) return;
setState((prev) => ({
...prev,
gm: {
...prev.gm,
messages: [
...prev.gm.messages,
{ id: uid("gmm"), sender: currentUser.name, text: gmChatText.trim(), timestamp: nowTime() },
 ],
},
}));
setGmChatText("");
}}
style={{ display: "flex", gap: 8, marginTop: 10 }}
>
<input
className="il-input"
placeholder="Message G.M group..."
value={gmChatText}
onChange={(e) => setGmChatText(e.target.value)}
/>
<button type="submit" className="il-btn il-btn-gold">
<Send size={15} />
</button>
</form>
</div>
</div>
)}

{/* ==================== MODALS ==================== */}

{/* 1. In-App Due Reminder Pop-up */}
{showDuePopup && currentUser.finesDue > 0 && (
<div className="il-modal-backdrop">
<div className="il-modal">
<div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--rose)", fontWeight: 900, fontSize: 17 }}>
<AlertTriangle size={20} /> Pending Club Due Reminder
</div>
<p style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.5 }}>
Hi <strong>{currentUser.name}</strong>, you currently have a pending fine/due of{" "}
<strong style={{ color: "var(--gold)" }}>₹{currentUser.finesDue}</strong> in the Indore Legends Treasury.
Please clear it before the next match!
</p>
<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
<button type="button" className="il-btn il-btn-gold" onClick={() => setShowDuePopup(false)}>
Got It
</button>
</div>
</div>
</div>
)}

{/* 2. Milestone Celebration Pop-up */}
{milestonePopup && (
<div className="il-modal-backdrop">
<div className="il-modal" style={{ textAlign: "center" }}>
<div style={{ fontSize: 40, marginBottom: 8 }}>🏆🔥🎉</div>
<h2 style={{ margin: 0, color: "var(--gold)" }}>MILESTONE UNLOCKED!</h2>
<p style={{ fontSize: 16, fontWeight: 700, margin: "12px 0 18px 0" }}>{milestonePopup}</p>
<button type="button" className="il-btn il-btn-gold" onClick={() => setMilestonePopup("")}>
Awesome!
</button>
</div>
</div>
)}

{/* 3. Admin PIN Gate Modal (450718) */}
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
className="il-input"
placeholder="Enter 6-digit Admin PIN"
value={pinInput}
onChange={(e) => {
setPinInput(e.target.value);
setPinError("");
}}
autoFocus
/>
{pinError && <div style={{ fontSize: 12, color: "var(--rose)" }}>{pinError}</div>}
<button type="submit" className="il-btn il-btn-gold">
Verify PIN & Continue
</button>
</form>
</div>
</div>
)}

{/* 4. Secret Ganesh Mandir Login Modal (Triple-Tap Crest) */}
{showGmLoginModal && (
<div className="il-modal-backdrop">
<div className="il-modal" style={{ borderColor: "rgba(251,146,60,0.65)" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
<span style={{ fontWeight: 900, color: "#fdba74" }}>🕉️ Ganesh Mandir Private Login</span>
<button type="button" className="il-btn" style={{ padding: 6 }} onClick={() => setShowGmLoginModal(false)}>
<X size={15} />
</button>
</div>
<form onSubmit={handleGmUnlock} style={{ display: "grid", gap: 10 }}>
<select
className="il-select"
value={gmLoginId}
onChange={(e) => setGmLoginId(e.target.value)}
>
{state.players
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
placeholder="Enter your same squad password"
value={gmLoginPass}
onChange={(e) => {
setGmLoginPass(e.target.value);
setGmLoginErr("");
}}
/>
{gmLoginErr && <div style={{ fontSize: 12, color: "var(--rose)" }}>{gmLoginErr}</div>}
<button type="submit" className="il-btn il-btn-gold">
Unlock Ganesh Mandir Zone
</button>
</form>
</div>
</div>
)}

{/* Bottom Navigation Bar */}
<nav className="il-nav">
<div className="il-nav-inner">
{(
[
{ id: "home", label: "Home", icon: <Home size={18} /> },
{ id: "match", label: "Match", icon: <Trophy size={18} /> },
{ id: "squad", label: "Squad", icon: <Users size={18} /> },
{ id: "treasury", label: "Money", icon: <Wallet size={18} /> },
{ id: "chat", label: "Chat", icon: <MessageSquare size={18} /> },
{ id: "ai", label: "Bot", icon: <Bot size={18} /> },
...(gmUnlocked ? [{ id: "gm" as TabKey, label: "Mandir", icon: <Flame size={18} /> }] : []),
] as { id: TabKey; label: string; icon: React.ReactNode }[]
).map((item) => (
<button
key={item.id}
type="button"
className={il-nav-item${tab === item.id ? "active" : ""}`}
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
