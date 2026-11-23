import React, { useEffect, useMemo, useRef, useState } from "react";
import {
AlertTriangle,
Award,
Bell,
Bike,
Calendar,
Check,
Clock,
Coins,
Copy,
Crown,
ExternalLink,
Flame,
History,
KeyRound,
Lock,
LogOut,
MapPin,
MessageSquare,
Mic,
MicOff,
Plus,
RefreshCw,
Send,
Shield,
Sparkles,
Star,
Swords,
Trash2,
Trophy,
Undo2,
Unlock,
Users,
Volume2,
Vote,
Wallet,
X,
Zap,
} from "lucide-react";
import type {
Announcement,
BallEvent,
ChatMessage,
ClubState,
GearAssignment,
LiveMatch,
MoneyEntry,
PlayerStats,
SquadAccount,
TabId,
TeamSplit,
} from "./types";

const ADMIN_PIN = "450718";
const STORAGE_KEY = "indore_legends_state_v2";
const SESSION_KEY = "indore_legends_session_v2";

// Exact 13 Squad Accounts, Passwords & Ganesh Mandir (G.M) Flags
const SQUAD_ACCOUNTS: SquadAccount[] = [
{
id: "p1",
fullName: "Gaurav Lalwani",
nickname: "Hitman 45",
jerseyNumber: 45,
role: "All-Rounder",
skillTag: "Powerplay Finisher",
isAdmin: true,
hasGM: true,
adminPassword: "OQLM45",
defaultNormalPassword: "Admin-045",
},
{
id: "p2",
fullName: "Granth Sharma",
nickname: "Captain Cool",
jerseyNumber: 7,
role: "All-Rounder",
skillTag: "Clutch Finisher",
isAdmin: true,
hasGM: true,
adminPassword: "OQLM07",
defaultNormalPassword: "Admin-07",
},
{
id: "p3",
fullName: "Adhyan Upadhyay",
nickname: "Adhu",
jerseyNumber: 1,
role: "Batter",
skillTag: "Anchor Batter",
isAdmin: false,
hasGM: false,
defaultNormalPassword: "Adhu001",
},
{
id: "p4",
fullName: "Virat Chaudary",
nickname: "Viru",
jerseyNumber: 18,
role: "Batter",
skillTag: "Chase Master",
isAdmin: false,
hasGM: true,
defaultNormalPassword: "Viru002",
},
{
id: "p5",
fullName: "Agam Khandelwal",
nickname: "Agm",
jerseyNumber: 3,
role: "Bowler",
skillTag: "Swing Specialist",
isAdmin: false,
hasGM: false,
defaultNormalPassword: "Agm003",
},
{
id: "p6",
fullName: "Aditya Rathore",
nickname: "Abhi",
jerseyNumber: 4,
role: "All-Rounder",
skillTag: "Big Hitter",
isAdmin: false,
hasGM: true,
defaultNormalPassword: "Abhi004",
},
{
id: "p7",
fullName: "Anuj Mishra",
nickname: "Anu",
jerseyNumber: 5,
role: "Bowler",
skillTag: "Death Bowler",
isAdmin: false,
hasGM: false,
defaultNormalPassword: "Anu005",
},
{
id: "p8",
fullName: "Aadarsh Mishra",
nickname: "Ada",
jerseyNumber: 6,
role: "Wicket-Keeper",
skillTag: "Safe Hands",
isAdmin: false,
hasGM: false,
defaultNormalPassword: "Ada006",
},
{
id: "p9",
fullName: "Atharv Solanki",
nickname: "Aathu",
jerseyNumber: 9,
role: "All-Rounder",
skillTag: "360 Slogger",
isAdmin: false,
hasGM: true,
defaultNormalPassword: "Aathu007",
},
{
id: "p10",
fullName: "Shivin Gagrani",
nickname: "Shivu",
jerseyNumber: 8,
role: "Batter",
skillTag: "Boundary Magnet",
isAdmin: false,
hasGM: true,
defaultNormalPassword: "Shivu008",
},
{
id: "p11",
fullName: "Rudraksh Soni",
nickname: "Rudu",
jerseyNumber: 11,
role: "Bowler",
skillTag: "Yorker King",
isAdmin: false,
hasGM: false,
defaultNormalPassword: "Rudu009",
},
{
id: "p12",
fullName: "Naitik Arya",
nickname: "Nai",
jerseyNumber: 10,
role: "All-Rounder",
skillTag: "Spin Wizard",
isAdmin: false,
hasGM: true,
defaultNormalPassword: "Nai010",
},
{
id: "p13",
fullName: "Harshit Nagpal",
nickname: "Harsh",
jerseyNumber: 12,
role: "Bowler",
skillTag: "Express Pace",
isAdmin: false,
hasGM: true,
defaultNormalPassword: "Harsh011",
},
];

function getTomorrowMorningISO(): string {
const d = new Date();
d.setDate(d.getDate() + 1);
d.setHours(7, 0, 0, 0);
return d.toISOString();
}

function createInitialState(): ClubState {
const players: PlayerStats[] = SQUAD_ACCOUNTS.map((acc, idx) => ({
id: acc.id,
fullName: acc.fullName,
nickname: acc.nickname,
jerseyNumber: acc.jerseyNumber,
role: acc.role,
skillTag: acc.skillTag,
matches: 5 + (idx % 4),
runs: 60 + ((idx * 29) % 135),
ballsFaced: 45 + ((idx * 19) % 85),
fours: 5 + (idx % 12),
sixes: 2 + ((idx * 3) % 9),
ducks: idx % 3 === 0 ? 1 : 0,
wickets: 2 + ((idx * 2) % 8),
ballsBowled: 24 + ((idx * 12) % 48),
runsConceded: 35 + ((idx * 17) % 60),
attendanceStreak: 3 + (idx % 6),
recentScores: ["24*", "12", "31", "8", "19"],
}));

return {
clubName: "Indore Legends",
tagline: "Desi Turf Limbodi • Wind-Ball Powerhouse",
players,
customPasswords: {},
advanceCredits: {
"Gaurav Lalwani": 50,
},
activeMatch: {
id: "match-initial",
title: "Indore Legends Turf Clash",
groundName: "Desi Turf Limbodi",
scheduledISO: getTomorrowMorningISO(),
totalOvers: 8,
innings: 1,
battingTeamName: "Legends XI",
bowlingTeamName: "Limbodi Strikers",
runs: 0,
wickets: 0,
legalBalls: 0,
isFreeHit: false,
extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
strikerId: "p1",
nonStrikerId: "p4",
bowlerId: "p13",
outPlayerIds: [],
timeline: [],
fallOfWickets: [],
gearList: [
{ id: "g1", item: "Wind Balls (2)", assignedTo: "Gaurav Lalwani", confirmed: true },
{ id: "g2", item: "Bats (2)", assignedTo: "Granth Sharma", confirmed: true },
{ id: "g3", item: "Stumps & Bails", assignedTo: "Virat Chaudary", confirmed: false },
{ id: "g4", item: "Water & Tape", assignedTo: "Aditya Rathore", confirmed: false },
 ],
status: "live",
},
matchHistory: [],
money: [
{
id: "m1",
date: new Date().toLocaleDateString("en-IN"),
fullName: "Gaurav Lalwani",
category: "collection",
reason: "Desi Turf Booking Share",
amount: 100,
paid: true,
},
{
id: "m2",
date: new Date().toLocaleDateString("en-IN"),
fullName: "Granth Sharma",
category: "collection",
reason: "Desi Turf Booking Share",
amount: 100,
paid: true,
},
{
id: "m3",
date: new Date().toLocaleDateString("en-IN"),
fullName: "Virat Chaudary",
category: "fine",
reason: "Late to Turf by 10 mins",
amount: 30,
paid: false,
},
{
id: "m4",
date: new Date().toLocaleDateString("en-IN"),
fullName: "Gaurav Lalwani",
category: "expense",
reason: "2 New Wind Balls",
amount: 120,
paid: true,
},
 ],
announcements: [
{
id: "a1",
title: "Next Turf Match at Desi Turf Limbodi!",
body: "Reach 10 minutes early for warm-up and auto team split. Mark your availability in the poll below.",
postedBy: "Gaurav Lalwani",
date: new Date().toLocaleDateString("en-IN"),
pinned: true,
},
 ],
availabilityPollTitle: "Next Match at Desi Turf Limbodi — Are you playing?",
availabilityVotes: [
{ fullName: "Gaurav Lalwani", status: "playing" },
{ fullName: "Granth Sharma", status: "playing" },
 ],
chat: [
{
id: "c1",
sender: "LegendBot",
text: "Welcome to Indore Legends Hub! Ready to light up Desi Turf Limbodi?",
timestamp: "Now",
isBot: true,
},
 ],
locations: [
{
id: "loc1",
name: "Desi Turf Limbodi",
area: "Limbodi, Indore, Madhya Pradesh",
surface: "Box Cricket Turf • Wind Ball",
usualTime: "Morning 7:00 AM / Evening Slots",
notes: "Primary home ground for Indore Legends matches. Reach 10 mins before slot start.",
mapsUrl: "https://www.google.com/maps/search/?api=1&query=Desi+Turf+Limbodi+Indore",
},
 ],
customQA: [
{
id: "qa1",
question: "Where does Indore Legends play?",
answer: "Indore Legends plays at Desi Turf Limbodi, Indore.",
},
{
id: "qa2",
question: "Who are the admins of Indore Legends?",
answer: "Gaurav Lalwani and Granth Sharma are the official admins of Indore Legends.",
},
 ],
mandir: {
chat: [
{
id: "mc1",
sender: "Gaurav Lalwani",
text: "Jai Ganesh! Private Ganesh Mandir group is live for our selected squad.",
timestamp: "Now",
},
 ],
schedules: [
{
id: "ms1",
dayLabel: "Wednesday Morning Visit",
date: "This Wednesday",
time: "6:30 AM",
meetupPoint: "Limbodi Main Square",
note: "Everyone be on time so we reach together for Darshan.",
rsvps: [{ fullName: "Gaurav Lalwani", status: "coming" }],
},
],
offerings: [
{ id: "mo1", item: "Ladoo Prasad", assignedTo: "Gaurav Lalwani", done: false },
{ id: "mo2", item: "Flowers & Durva", assignedTo: "Granth Sharma", done: false },
 ],
rides: [
{
id: "mr1",
driverName: "Gaurav Lalwani",
vehicle: "Activa",
seatsFree: 1,
passengers: ["Granth Sharma"],
},
],
poll: {
id: "mp1",
question: "Best timing for next Ganesh Mandir visit?",
options: [
{ id: "opt1", label: "6:00 AM Early Darshan", voters: ["Gaurav Lalwani"] },
{ id: "opt2", label: "7:00 AM Morning", voters: [] },
{ id: "opt3", label: "6:30 PM Evening Aarti", voters: [] },
],
},
},
lastUpdated: new Date().toISOString(),
};
}

function formatOvers(legalBalls: number): string {
  return Math.floor(legalBalls / 6) + "." + (legalBalls % 6);
}

function calcRankingScore(p: PlayerStats): number {
const srBonus = p.ballsFaced > 0 ? (p.runs / p.ballsFaced) * 15 : 0;
return Math.round(p.runs * 1.15 + p.wickets * 22 + p.matches * 4 + srBonus);
}

interface SessionUser {
id: string;
fullName: string;
isAdminAccount: boolean;
isAdminLoggedIn: boolean;
hasGM: boolean;
}

export default function App() {
const [club, setClub] = useState<ClubState>(() => {
try {
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
const parsed = JSON.parse(saved);
return { ...createInitialState(), ...parsed };
}
} catch {
// ignore storage parse error
}
return createInitialState();
});

const [session, setSession] = useState<SessionUser | null>(() => {
try {
const raw = localStorage.getItem(SESSION_KEY);
return raw ? JSON.parse(raw) : null;
} catch {
return null;
}
});

const [activeTab, setActiveTab] = useState<TabId>("match");
const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "saved" | "offline">("idle");
const [toast, setToast] = useState<string>("");

// Login Form States
const [loginName, setLoginName] = useState<string>(SQUAD_ACCOUNTS[0].fullName);
const [loginPass, setLoginPass] = useState<string>("");
const [loginError, setLoginError] = useState<string>("");

// Admin PIN Protection Modal
const [adminUnlocked, setAdminUnlocked] = useState<boolean>(false);
const [pinModalOpen, setPinModalOpen] = useState<boolean>(false);
const [pinInput, setPinInput] = useState<string>("");
const [pinError, setPinError] = useState<string>("");
const pendingAdminAction = useRef<(() => void) | null>(null);

// Change Normal Password Modal
const [passModalOpen, setPassModalOpen] = useState<boolean>(false);
const [oldPassInput, setOldPassInput] = useState<string>("");
const [newPassInput, setNewPassInput] = useState<string>("");
const [passMsg, setPassMsg] = useState<string>("");

// In-App Due Reminder Popup on Sign-In
const [duePopupEntries, setDuePopupEntries] = useState<MoneyEntry[]>([]);

// Milestone Celebration Popup
const [milestoneBanner, setMilestoneBanner] = useState<{ title: string; subtitle: string } | null>(null);

// Match Sub-views & Creator States
const [matchSubTab, setMatchSubTab] = useState<"live" | "creator" | "checklist">("live");
const [statsSubTab, setStatsSubTab] = useState<"scorecard" | "squad" | "awards" | "history">("scorecard");
const [hubSubTab, setHubSubTab] = useState<"announcements" | "chat" | "locations">("announcements");
const [mandirSubTab, setMandirSubTab] = useState<"chat" | "schedule" | "extras">("chat");

// Match Creator Form
const [creatorTitle, setCreatorTitle] = useState<string>("Desi Turf Clash");
const [creatorGround, setCreatorGround] = useState<string>("Desi Turf Limbodi");
const [creatorOvers, setCreatorOvers] = useState<number>(8);
const [creatorDayOffset, setCreatorDayOffset] = useState<number>(0); // 0 to 3 days ahead
const [creatorTime, setCreatorTime] = useState<string>("07:00");
const [selectedMatchPlayerIds, setSelectedMatchPlayerIds] = useState<string[]>(
SQUAD_ACCOUNTS.slice(0, 10).map((p) => p.id)
);
const [previewSplit, setPreviewSplit] = useState<TeamSplit | null>(null);

// Digital Coin Toss (works in Creator & Live)
const [coinFlipping, setCoinFlipping] = useState<boolean>(false);
const [coinResult, setCoinResult] = useState<string>("Tap Toss");

// Wicket & Mid-Over Swap Modal
const [wicketModalOpen, setWicketModalOpen] = useState<boolean>(false);
const [wicketType, setWicketType] = useState<BallEvent["wicketType"]>("Bowled");
const [nextBatterId, setNextBatterId] = useState<string>("");
const [swapModalOpen, setSwapModalOpen] = useState<boolean>(false);

// Gear Checklist Form
const [newGearItem, setNewGearItem] = useState<string>("");
const [newGearPlayer, setNewGearPlayer] = useState<string>(SQUAD_ACCOUNTS[0].fullName);

// Money Tab Form & Pie Toggle
const [pieMode, setPieMode] = useState<"paid" | "cashflow">("paid");
const [moneyPlayer, setMoneyPlayer] = useState<string>(SQUAD_ACCOUNTS[0].fullName);
const [moneyCategory, setMoneyCategory] = useState<MoneyEntry["category"]>("collection");
const [moneyReason, setMoneyReason] = useState<string>("");
const [moneyAmount, setMoneyAmount] = useState<string>("");
const [moneyPaid, setMoneyPaid] = useState<boolean>(false);
const [creditPlayer, setCreditPlayer] = useState<string>(SQUAD_ACCOUNTS[0].fullName);
const [creditDelta, setCreditDelta] = useState<string>("");

// Announcements, Chat, Locations Forms
const [annTitle, setAnnTitle] = useState<string>("");
const [annBody, setAnnBody] = useState<string>("");
const [chatInput, setChatInput] = useState<string>("");
const [locName, setLocName] = useState<string>("");
const [locArea, setLocArea] = useState<string>("");
const [locTime, setLocTime] = useState<string>("");
const [locUrl, setLocUrl] = useState<string>("");

// Head-to-Head Rivalry selector
const [h2hBatterId, setH2hBatterId] = useState<string>("p1");
const [h2hBowlerId, setH2hBowlerId] = useState<string>("p13");

// LegendBot States
const [botInput, setBotInput] = useState<string>("");
const [botThinking, setBotThinking] = useState<boolean>(false);
const [botMessages, setBotMessages] = useState<ChatMessage[]>([
{
id: "b0",
sender: "LegendBot",
text: "Namaste Legends! I have live access to your scores, Orange/Purple Cap, money dues, and Desi Turf schedule. Ask me anything about Indore Legends or IPL/Cricket!",
timestamp: "Live",
isBot: true,
},
 ]);
const [isListening, setIsListening] = useState<boolean>(false);
const [newQaQ, setNewQaQ] = useState<string>("");
const [newQaA, setNewQaA] = useState<string>("");

// Mandir Private Forms
const [mandirChatInput, setMandirChatInput] = useState<string>("");
const [msDay, setMsDay] = useState<string>("");
const [msTime, setMsTime] = useState<string>("6:30 AM");
const [msMeetup, setMsMeetup] = useState<string>("Limbodi Main Square");
const [msNote, setMsNote] = useState<string>("");
const [moItem, setMoItem] = useState<string>("");
const [moPerson, setMoPerson] = useState<string>("Gaurav Lalwani");
const [mrVehicle, setMrVehicle] = useState<string>("Activa");
const [mrSeats, setMrSeats] = useState<number>(1);

// Countdown Ticker
const [countdownText, setCountdownText] = useState<string>("Match Day Ready");

const showToast = (msg: string) => {
setToast(msg);
setTimeout(() => setToast((curr) => (curr === msg ? "" : curr)), 2600);
};

// Initial Cloud Sync from JSONBin (/api/state)
useEffect(() => {
let active = true;
const fetchCloud = async () => {
setSyncStatus("syncing");
try {
const res = await fetch("/api/state");
if (!res.ok) throw new Error("Cloud unavailable");
const data = await res.json();
if (active && data && Array.isArray(data.players) && data.players.length > 0) {
const merged: ClubState = {
...createInitialState(),
...data,
customPasswords: data.customPasswords || {},
advanceCredits: data.advanceCredits || {},
mandir: { ...createInitialState().mandir, ...(data.mandir || {}) },
};
setClub(merged);
localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
setSyncStatus("saved");
} else {
setSyncStatus("idle");
}
} catch {
if (active) setSyncStatus("offline");
}
};
fetchCloud();
return () => {
active = false;
};
}, []);

// Countdown Timer Effect
useEffect(() => {
const updateCountdown = () => {
const iso = club.activeMatch?.scheduledISO;
if (!iso) {
setCountdownText("No match scheduled");
return;
}
const diff = new Date(iso).getTime() - Date.now();
if (diff <= 0) {
setCountdownText("IT'S MATCH TIME!");
return;
}
const d = Math.floor(diff / (1000 * 60 * 60 * 24));
const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
const m = Math.floor((diff / (1000 * 60)) % 60);
const s = Math.floor((diff / 1000) % 60);
 setCountdownText((d > 0 ? d + "d " : "") + h + "h " + m + "m " + s + "s");
};
updateCountdown();
const timer = setInterval(updateCountdown, 1000);
return () => clearInterval(timer);
}, [club.activeMatch?.scheduledISO]);

// Helper: Persist state to LocalStorage + JSONBin
const updateClub = (updater: (prev: ClubState) => ClubState) => {
setClub((prev) => {
const next: ClubState = {
...updater(prev),
lastUpdated: new Date().toISOString(),
};
// Keep chat trimmed so JSONBin stays super fast & under 100KB
if (next.chat.length > 60) next.chat = next.chat.slice(-60);
if (next.mandir.chat.length > 60) next.mandir.chat = next.mandir.chat.slice(-60);

try {
localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
} catch {
// ignore quota issues
}

setSyncStatus("syncing");
fetch("/api/state", {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(next),
})
.then((r) => setSyncStatus(r.ok ? "saved" : "offline"))
.catch(() => setSyncStatus("offline"));

return next;
});
};

// Helper: Require Admin PIN (450718) before sensitive edits
const requireAdminPin = (action: () => void) => {
if (adminUnlocked) {
action();
return;
}
pendingAdminAction.current = action;
setPinInput("");
setPinError("");
setPinModalOpen(true);
};

const handlePinSubmit = (e: React.FormEvent) => {
e.preventDefault();
if (pinInput.trim() === ADMIN_PIN) {
setAdminUnlocked(true);
setPinModalOpen(false);
setPinError("");
showToast("Admin Mode Unlocked!");
if (pendingAdminAction.current) {
const fn = pendingAdminAction.current;
pendingAdminAction.current = null;
fn();
}
} else {
setPinError("Wrong Admin PIN. Only Admins can edit.");
}
};

// Sign-In Logic
const handleLogin = (e: React.FormEvent) => {
e.preventDefault();
const acc = SQUAD_ACCOUNTS.find((a) => a.fullName === loginName);
if (!acc) {
setLoginError("Select your full name.");
return;
}
const typed = loginPass.trim();
const currentNormalPass = club.customPasswords[acc.id] || acc.defaultNormalPassword;
const isAdminMatch = Boolean(acc.isAdmin && acc.adminPassword && typed === acc.adminPassword);
const isNormalMatch = typed === currentNormalPass;

if (!isAdminMatch && !isNormalMatch) {
setLoginError("Incorrect password. Check spelling & caps.");
return;
}

const nextSession: SessionUser = {
id: acc.id,
fullName: acc.fullName,
isAdminAccount: acc.isAdmin,
isAdminLoggedIn: isAdminMatch,
hasGM: acc.hasGM,
};

setSession(nextSession);
localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
setLoginPass("");
setLoginError("");
setActiveTab("match");

// Trigger In-App Due Reminder Popup if this player has unpaid dues
const myUnpaid = club.money.filter(
(m) => m.fullName === acc.fullName && !m.paid && m.category !== "expense"
);
if (myUnpaid.length > 0) {
setDuePopupEntries(myUnpaid);
}
showToast("Welcome back, " + acc.fullName + "!");
};

const handleLogout = () => {
setSession(null);
setAdminUnlocked(false);
setActiveTab("match");
localStorage.removeItem(SESSION_KEY);
};

// Change Normal Password (Admin Password CANNOT be changed)
const handleChangeNormalPassword = (e: React.FormEvent) => {
e.preventDefault();
if (!session) return;
const acc = SQUAD_ACCOUNTS.find((a) => a.id === session.id);
if (!acc) return;

const currentNormal = club.customPasswords[acc.id] || acc.defaultNormalPassword;
if (oldPassInput.trim() !== currentNormal) {
setPassMsg("Current Normal Password does not match.");
return;
}
if (newPassInput.trim().length < 4) {
setPassMsg("New password must be at least 4 characters.");
return;
}
if (acc.adminPassword && newPassInput.trim() === acc.adminPassword) {
setPassMsg("Cannot match locked Admin Password.");
return;
}

updateClub((prev) => ({
...prev,
customPasswords: {
...prev.customPasswords,
[acc.id]: newPassInput.trim(),
},
}));
setOldPassInput("");
setNewPassInput("");
setPassMsg("Normal password updated! (Admin passwords remain permanently locked.)");
setTimeout(() => {
setPassModalOpen(false);
setPassMsg("");
}, 1200);
};

// Digital Coin Toss
const runCoinToss = () => {
if (coinFlipping) return;
setCoinFlipping(true);
setCoinResult("Flipping...");
setTimeout(() => {
const outcome = Math.random() < 0.5 ? "HEADS" : "TAILS";
setCoinResult(outcome);
setCoinFlipping(false);
showToast("Coin Toss: " + outcome + "!");
}, 950);
};
// Auto Team Splitter (Fair Ranking Snake-Draft) + Auto Captain & Vice-Captain Decider
const generateFairSplitAndCaptains = (randomizeCaptains = false) => {
if (selectedMatchPlayerIds.length < 4) {
showToast("Select at least 4 players to split teams.");
return;
}
const chosen = club.players
.filter((p) => selectedMatchPlayerIds.includes(p.id))
.sort((a, b) => calcRankingScore(b) - calcRankingScore(a));

const teamA: PlayerStats[] = [];
const teamB: PlayerStats[] = [];

// Fair Snake Draft by Ranking: 1->A, 2->B, 3->B, 4->A...
chosen.forEach((p, idx) => {
const round = Math.floor(idx / 2);
const goA = round % 2 === 0 ? idx % 2 === 0 : idx % 2 === 1;
if (goA) teamA.push(p);
else teamB.push(p);
});

const pickLeaders = (list: PlayerStats[]) => {
if (list.length === 0) return { c: "-", vc: "-" };
if (!randomizeCaptains) {
return {
c: list[0]?.fullName || "-",
vc: list[1]?.fullName || list[0]?.fullName || "-",
};
}
const shuffled = [...list].sort(() => Math.random() - 0.5);
return {
c: shuffled[0]?.fullName || "-",
vc: shuffled[1]?.fullName || shuffled[0]?.fullName || "-",
};
};

const leadA = pickLeaders(teamA);
const leadB = pickLeaders(teamB);

setPreviewSplit({
teamAName: "Indore Legends Gold",
teamBName: "Limbodi Thunder",
teamAIds: teamA.map((p) => p.id),
teamBIds: teamB.map((p) => p.id),
captainA: leadA.c,
viceCaptainA: leadA.vc,
captainB: leadB.c,
viceCaptainB: leadB.vc,
});
showToast(randomizeCaptains ? "Fair Random C & VC Decided — No Jhagda!" : "Fair Ranked Teams Ready!");
};

// Create Match (Protected by Admin PIN)
const handleCreateMatch = () => {
requireAdminPin(() => {
const split = previewSplit;
const teamAIds = split?.teamAIds || selectedMatchPlayerIds.slice(0, Math.ceil(selectedMatchPlayerIds.length / 2));
const teamBIds = split?.teamBIds || selectedMatchPlayerIds.slice(Math.ceil(selectedMatchPlayerIds.length / 2));

const sched = new Date();
sched.setDate(sched.getDate() + creatorDayOffset);
const [hh, mm] = creatorTime.split(":").map((n) => Number(n) || 0);
sched.setHours(hh, mm, 0, 0);
    const newMatch: LiveMatch = {
      id: "m-" + Date.now(),
      title: creatorTitle.trim() || "Desi Turf Clash",
      groundName: creatorGround || "Desi Turf Limbodi",
      scheduledISO: sched.toISOString(),
      totalOvers: creatorOvers,
      innings: 1,
      battingTeamName: split?.teamAName || "Indore Legends Gold",
      bowlingTeamName: split?.teamBName || "Limbodi Thunder",
      runs: 0,
      wickets: 0,
      legalBalls: 0,
      isFreeHit: false,
      teamSplit: split || undefined,
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
      strikerId: teamAIds || "p1",
      nonStrikerId: teamAIds || "p2",
      bowlerId: teamBIds || "p13",
      outPlayerIds: [],
      timeline: [],
      fallOfWickets: [],
      gearList: [
        { id: "g-latex" + Date.now() + "-1", item: "Wind Balls (2)", assignedTo: "Gaurav Lalwani", confirmed: false },
        { id: "g-latex" + Date.now() + "-2", item: "Bats (2)", assignedTo: "Granth Sharma", confirmed: false },
        { id: "g-latex" + Date.now() + "-3", item: "Stumps", assignedTo: "Virat Chaudary", confirmed: false },
        { id: "g-latex" + Date.now() + "-4", item: "Water & Tape", assignedTo: "Aditya Rathore", confirmed: false },
      ],
      status: "live",
    };
 
updateClub((prev) => ({
...prev,
activeMatch: newMatch,
}));
setMatchSubTab("checklist");
showToast("Match Created! Now assign Gear Checklist.");
});
};

// Helper: Get player name by ID
const playerName = (id: string) => club.players.find((p) => p.id === id)?.fullName || "Player";

// Live Ball-by-Ball Scoring Engine (Protected by Admin PIN)
const recordDelivery = (opts: {
runsOffBat?: number;
extraRuns?: number;
extraType?: BallEvent["extraType"];
isWicket?: boolean;
wType?: BallEvent["wicketType"];
replacementBatterId?: string;
}) => {
if (!club.activeMatch || club.activeMatch.status === "completed") return;

requireAdminPin(() => {
const m = club.activeMatch!;
const runsOffBat = opts.runsOffBat || 0;
const extraRuns = opts.extraRuns || 0;
const extraType = opts.extraType;
const isWicket = Boolean(opts.isWicket);
const isRetired = opts.wType === "Retired Hurt";

if (m.isFreeHit && isWicket && opts.wType !== "Run Out" && !isRetired) {
showToast("FREE HIT! Only Run Out counts on a Free Hit!");
return;
}

const isLegal = extraType !== "WD" && extraType !== "NB";
const totalBallRuns = runsOffBat + extraRuns;
const overNum = Math.floor(m.legalBalls / 6);
const ballInOver = (m.legalBalls % 6) + (isLegal ? 1 : 0);

let label = String(runsOffBat);
if (isWicket) label = isRetired ? "RH" : "W";
else if (extraType) label = extraType + (totalBallRuns > 1 ? "+" + (totalBallRuns - 1) : "");

const event: BallEvent = {
id: b-${Date.now()}-${Math.random().toString(36).slice(2, 6)},
innings: m.innings,
over: overNum,
ballInOver,
batsmanId: m.strikerId,
bowlerId: m.bowlerId,
runsOffBat,
extraRuns,
extraType,
isLegalDelivery: isLegal,
isWicket: isWicket && !isRetired,
wicketType: opts.wType,
outBatterId: isWicket ? m.strikerId : undefined,
label,
};

const nextLegalBalls = m.legalBalls + (isLegal ? 1 : 0);
const nextRuns = m.runs + totalBallRuns;
const nextWickets = m.wickets + (isWicket && !isRetired ? 1 : 0);
const nextExtras = { ...m.extras };
if (extraType === "WD") nextExtras.wides += extraRuns;
if (extraType === "NB") nextExtras.noBalls += extraRuns;
if (extraType === "BYE") nextExtras.byes += extraRuns;
if (extraType === "LB") nextExtras.legByes += extraRuns;

let nextStriker = m.strikerId;
let nextNonStriker = m.nonStrikerId;
const nextOutIds = [...m.outPlayerIds];
const nextFow = [...m.fallOfWickets];

if (isWicket) {
if (!isRetired) {
nextOutIds.push(m.strikerId);
nextFow.push({
innings: m.innings,
wicketNumber: nextWickets,
score: nextRuns,
overs: formatOvers(nextLegalBalls),
batterName: playerName(m.strikerId),
wicketType: opts.wType || "Out",
});
}
if (opts.replacementBatterId) {
nextStriker = opts.replacementBatterId;
}
} else {
// Rotate strike on odd runs
if (totalBallRuns % 2 === 1) {
const temp = nextStriker;
nextStriker = nextNonStriker;
nextNonStriker = temp;
}
}

// Rotate strike at end of over
const overFinished = isLegal && nextLegalBalls % 6 === 0;
if (overFinished) {
const temp = nextStriker;
nextStriker = nextNonStriker;
nextNonStriker = temp;
}

const nextTimeline = [...m.timeline, event];

// Milestone Detection (30, 50, Hat-Trick, 3 Sixes in a row)
const inningsBalls = nextTimeline.filter((b) => b.innings === m.innings);
const batterPrevRuns = m.timeline
.filter((b) => b.innings === m.innings && b.batsmanId === m.strikerId)
.reduce((s, b) => s + b.runsOffBat, 0);
const batterNowRuns = batterPrevRuns + runsOffBat;

if (batterPrevRuns < 50 && batterNowRuns >= 50) {
setMilestoneBanner({
title: HALF CENTURY!${playerName(m.strikerId)}, subtitle:Blazing {m.groundName}!, }); } else if (batterPrevRuns &lt; 30 && batterNowRuns &gt;= 30) { setMilestoneBanner({ title:TURF THIRTY! {batterNowRuns} runs on fire!, }); } else if (inningsBalls.length &gt;= 3) { const last3 = inningsBalls.slice(-3); if (last3.every((b) =&gt; b.runsOffBat === 6 && b.batsmanId === m.strikerId)) { setMilestoneBanner({ title:3 SIXES IN A ROW!, subtitle:latex
{playerName(m.strikerId)} is launching wind balls out of Limbodi!`, }); } else if (last3.every((b) =&gt; b.isWicket && b.bowlerId === m.bowlerId)) { setMilestoneBanner({ title: `HAT-TRICK HERO!`, subtitle: `

{playerName(m.bowlerId)} takes 3 in 3!`,
});
}
}

// Update career stats for striker & bowler
const updatedPlayers = club.players.map((p) => {
const copy = { ...p };
if (p.id === m.strikerId) {
copy.runs += runsOffBat;
if (extraType !== "WD") copy.ballsFaced += 1;
if (runsOffBat === 4) copy.fours += 1;
if (runsOffBat === 6) copy.sixes += 1;
if (isWicket && !isRetired && batterNowRuns === 0) copy.ducks += 1;
}
if (p.id === m.bowlerId) {
if (isLegal) copy.ballsBowled += 1;
if (extraType !== "BYE" && extraType !== "LB") copy.runsConceded += totalBallRuns;
if (isWicket && !isRetired && opts.wType !== "Run Out") copy.wickets += 1;
}
return copy;
});

const updatedMatch: LiveMatch = {
...m,
runs: nextRuns,
wickets: nextWickets,
legalBalls: nextLegalBalls,
isFreeHit: extraType === "NB" ? true : isLegal ? false : m.isFreeHit,
extras: nextExtras,
strikerId: nextStriker,
nonStrikerId: nextNonStriker,
outPlayerIds: nextOutIds,
timeline: nextTimeline,
fallOfWickets: nextFow,
};

updateClub((prev) => ({
...prev,
players: updatedPlayers,
activeMatch: updatedMatch,
}));
});
};

const undoLastBall = () => {
if (!club.activeMatch || club.activeMatch.timeline.length === 0) return;
requireAdminPin(() => {
const m = club.activeMatch!;
const last = m.timeline[m.timeline.length - 1];
const remaining = m.timeline.slice(0, -1);
const totalBallRuns = last.runsOffBat + last.extraRuns;
const nextExtras = { ...m.extras };
if (last.extraType === "WD") nextExtras.wides = Math.max(0, nextExtras.wides - last.extraRuns);
if (last.extraType === "NB") nextExtras.noBalls = Math.max(0, nextExtras.noBalls - last.extraRuns);
if (last.extraType === "BYE") nextExtras.byes = Math.max(0, nextExtras.byes - last.extraRuns);
if (last.extraType === "LB") nextExtras.legByes = Math.max(0, nextExtras.legByes - last.extraRuns);

updateClub((prev) => ({
...prev,
activeMatch: {
...m,
runs: Math.max(0, m.runs - totalBallRuns),
wickets: Math.max(0, m.wickets - (last.isWicket ? 1 : 0)),
legalBalls: Math.max(0, m.legalBalls - (last.isLegalDelivery ? 1 : 0)),
isFreeHit: false,
extras: nextExtras,
strikerId: last.batsmanId,
outPlayerIds: last.isWicket ? m.outPlayerIds.filter((id) => id !== last.outBatterId) : m.outPlayerIds,
fallOfWickets: last.isWicket ? m.fallOfWickets.slice(0, -1) : m.fallOfWickets,
timeline: remaining,
},
}));
showToast("Last ball undone.");
});
};

// Start 2nd Innings (activates Live Chase Calculator)
const startSecondInnings = () => {
if (!club.activeMatch) return;
requireAdminPin(() => {
const m = club.activeMatch!;
const target = m.runs + 1;
const swapBat = m.bowlingTeamName;
const swapBowl = m.battingTeamName;
const nextTeamBatIds = m.teamSplit?.teamBIds || club.players.slice(2, 6).map((p) => p.id);
const nextTeamBowlIds = m.teamSplit?.teamAIds || club.players.slice(0, 2).map((p) => p.id);

updateClub((prev) => ({
...prev,
activeMatch: {
...m,
innings: 2,
firstInningsScore: m.runs,
target,
battingTeamName: swapBat,
bowlingTeamName: swapBowl,
runs: 0,
wickets: 0,
legalBalls: 0,
isFreeHit: false,
extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
strikerId: nextTeamBatIds[0] || "p2",
nonStrikerId: nextTeamBatIds[1] || "p3",
bowlerId: nextTeamBowlIds[0] || "p1",
outPlayerIds: [],
},
}));
showToast(2nd Innings Live! Target: ${target} runs.`);
});
};

// Super Over Tie-Breaker
const startSuperOver = () => {
if (!club.activeMatch) return;
requireAdminPin(() => {
const m = club.activeMatch!;
updateClub((prev) => ({
...prev,
activeMatch: {
...m,
innings: 3,
totalOvers: 1,
runs: 0,
wickets: 0,
legalBalls: 0,
isFreeHit: false,
target: undefined,
outPlayerIds: [],
},
}));
setMilestoneBanner({
title: "SUPER OVER TIME!",
subtitle: "1 Over • 6 Balls • Winner Takes All!",
});
});
};

// Finish Match & Calculate Auto MVP + Save to Match History
const finishMatchAndSave = () => {
if (!club.activeMatch) return;
requireAdminPin(() => {
const m = club.activeMatch!;
const pointsMap: Record<string, number> = {};
m.timeline.forEach((b) => {
pointsMap[b.batsmanId] = (pointsMap[b.batsmanId] || 0) + b.runsOffBat * 1.2 + (b.runsOffBat === 6 ? 3 : 0);
if (b.isWicket && b.wicketType !== "Run Out") {
pointsMap[b.bowlerId] = (pointsMap[b.bowlerId] || 0) + 25;
}
});

let mvpId = m.strikerId;
let bestPts = -1;
Object.entries(pointsMap).forEach(([pid, pts]) => {
if (pts > bestPts) {
bestPts = pts;
mvpId = pid;
}
});

let winnerText = ``${m.battingTeamName} posted {m.wickets}; if (m.target) { if (m.runs &gt;= m.target) winnerText ={Math.max(1, 10 - m.wickets)} wickets!; else if (m.runs === m.target - 1) winnerText = "Match Tied! (Super Over Ready)"; else winnerText ={m.target - 1 - m.runs} runs!`;
}

const completedMatch: LiveMatch = {
...m,
status: "completed",
winnerText,
mvpName: playerName(mvpId),
mvpPoints: Math.max(0, Math.round(bestPts)),
};

updateClub((prev) => ({
...prev,
activeMatch: completedMatch,
matchHistory: [completedMatch, ...prev.matchHistory.filter((h) => h.id !== completedMatch.id)].slice(0, 20),
}));
setMilestoneBanner({
title: MVP: ${completedMatch.mvpName}, subtitle: ``${winnerText} (${completedMatch.mvpPoints} MVP pts)`,
});
});
};

// Computed Batting & Bowling Scorecard Tables for Active Match
const scorecardData = useMemo(() => {
const m = club.activeMatch;
if (!m) return { batting: [], bowling: [], overSummaries: [] };

const batMap: Record<
string,
{ id: string; name: string; runs: number; balls: number; fours: number; sixes: number; outText: string }
> = {};
const bowlMap: Record<string, { id: string; name: string; legalBalls: number; runs: number; wickets: number }> = {};
const overMap: Record<string, { label: string; balls: string[]; runs: number; wickets: number }> = {};

m.timeline.forEach((b) => {
if (!batMap[b.batsmanId]) {
batMap[b.batsmanId] = {
id: b.batsmanId,
name: playerName(b.batsmanId),
runs: 0,
balls: 0,
fours: 0,
sixes: 0,
outText: "not out",
};
}
batMap[b.batsmanId].runs += b.runsOffBat;
if (b.extraType !== "WD") batMap[b.batsmanId].balls += 1;
if (b.runsOffBat === 4) batMap[b.batsmanId].fours += 1;
if (b.runsOffBat === 6) batMap[b.batsmanId].sixes += 1;
if (b.isWicket) batMap[b.batsmanId].outText = b.wicketType || "out";

if (!bowlMap[b.bowlerId]) {
bowlMap[b.bowlerId] = { id: b.bowlerId, name: playerName(b.bowlerId), legalBalls: 0, runs: 0, wickets: 0 };
}
if (b.isLegalDelivery) bowlMap[b.bowlerId].legalBalls += 1;
if (b.extraType !== "BYE" && b.extraType !== "LB") bowlMap[b.bowlerId].runs += b.runsOffBat + b.extraRuns;
if (b.isWicket && b.wicketType !== "Run Out") bowlMap[b.bowlerId].wickets += 1;

const ovKey = Inn${b.innings} • Ov ${b.over + 1};
if (!overMap[ovKey]) overMap[ovKey] = { label: ovKey, balls: [], runs: 0, wickets: 0 };
overMap[ovKey].balls.push(b.label);
overMap[ovKey].runs += b.runsOffBat + b.extraRuns;
if (b.isWicket) overMap[ovKey].wickets += 1;
});

return {
batting: Object.values(batMap),
bowling: Object.values(bowlMap),
overSummaries: Object.values(overMap),
};
}, [club.activeMatch, club.players]);

// Copy WhatsApp Scorecard
const copyWhatsAppScorecard = () => {
const m = club.activeMatch;
if (!m) return;
const batLines = scorecardData.batting
.map((b) => •${b.name}: {b.balls}) [{b.sixes}x6] - latex
{b.outText}`) .join("\n"); const bowlLines = scorecardData.bowling .map((bw) =&gt; `• 

{bw.name}: {bw.runs} R, ${bw.wickets} W)
.join("\n");

const text =
🏏 *INDORE LEGENDS SCORECARD* 🏏\n +
📍${m.groundName} | latex
{m.title}\n` + `🔥 *

{m.battingTeamName}: {m.wickets}* ({m.totalOvers} ov)\n+ (m.target ?🎯 Target: latex
{m.target}\n` : "") + (m.winnerText ? `🏆 

{m.winnerText}\n: "") + (m.mvpName ?⭐ MVP: latex
{m.mvpName}\n` : "") + `\n*Batting:*\n

{batLines || "No balls recorded yet"}\n+\nBowling:\n${bowlLines || "No overs recorded yet"};

navigator.clipboard?.writeText(text);
showToast("WhatsApp Scorecard Copied!");
};

// Auto Orange Cap, Purple Cap & Fun Awards
const awards = useMemo(() => {
const byRuns = [...club.players].sort((a, b) => b.runs - a.runs);
const byWickets = [...club.players].sort((a, b) => b.wickets - a.wickets);
const bySixes = [...club.players].sort((a, b) => b.sixes - a.sixes);
const byDucks = [...club.players].sort((a, b) => b.ducks - a.ducks);
const byEcon = [...club.players]
.filter((p) => p.ballsBowled >= 6)
.sort((a, b) => a.runsConceded / (a.ballsBowled / 6) - b.runsConceded / (b.ballsBowled / 6));
const byStreak = [...club.players].sort((a, b) => b.attendanceStreak - a.attendanceStreak);

return {
orangeCap: byRuns[0],
purpleCap: byWickets[0],
sixesKing: bySixes[0],
duckClub: byDucks[0],
goldenArm: byEcon[0] || byWickets[0],
ironMan: byStreak[0],
};
}, [club.players]);

// Money Summary & Pie Chart Metrics
const moneyMetrics = useMemo(() => {
const paidIn = club.money
.filter((e) => e.category !== "expense" && e.paid)
.reduce((s, e) => s + e.amount, 0);
const pendingIn = club.money
.filter((e) => e.category !== "expense" && !e.paid)
.reduce((s, e) => s + e.amount, 0);
const expenses = club.money
.filter((e) => e.category === "expense")
.reduce((s, e) => s + e.amount, 0);
const totalAdvance = Object.values(club.advanceCredits || {}).reduce((s, v) => s + v, 0);
const cashInHand = paidIn + totalAdvance - expenses;

const aVal = pieMode === "paid" ? paidIn : paidIn + totalAdvance;
const bVal = pieMode === "paid" ? pendingIn : expenses;
const totalPie = aVal + bVal;
const aPct = totalPie > 0 ? Math.round((aVal / totalPie) * 100) : 100;
const bPct = totalPie > 0 ? 100 - aPct : 0;

return { paidIn, pendingIn, expenses, totalAdvance, cashInHand, aVal, bVal, aPct, bPct };
}, [club.money, club.advanceCredits, pieMode]);

// Copy WhatsApp Dues Reminder
const copyWhatsAppDues = () => {
const unpaid = club.money.filter((m) => !m.paid && m.category !== "expense");
if (unpaid.length === 0) {
showToast("Zero pending dues! Everyone paid.");
return;
}
const lines = unpaid.map((u) => •${u.fullName}: ₹{u.reason})).join("\n"); const msg =💰 INDORE LEGENDS — PENDING DUES 💰\n${lines}\n\nPlease clear before next Desi Turf match! 🏏;
navigator.clipboard?.writeText(msg);
showToast("WhatsApp Dues Reminder Copied!");
};

// Build Live Snapshot for LegendBot
const buildLegendBotContext = () => {
const m = club.activeMatch;
const unpaid = club.money
.filter((e) => !e.paid && e.category !== "expense")
.map((e) => ``${e.fullName} owes ₹{e.reason})`)
.join("; ");
const playingNow = club.availabilityVotes
.filter((v) => v.status === "playing")
.map((v) => v.fullName)
.join(", ");

return [
Home Ground: Desi Turf Limbodi, Indore.,
Squad (${club.players.length}): ${club.players.map((p) =&gt;{p.runs}R, latex
{p.wickets}W)`).join(", ")}.`, `Orange Cap: 

{awards.orangeCap?.fullName} ({awards.purpleCap?.fullName} ({m.title} at {m.battingTeamName} {m.wickets} ({m.totalOvers} ov)latex
{m.target ? `, Target 

{m.target}: ""}.
: "No active match.",
Club Cash in Hand: ₹${moneyMetrics.cashInHand}. Pending Dues: ${unpaid || "None"}.,
Playing Poll Confirmed: ${playingNow || "No votes yet"}.,Latest Announcement: ${club.announcements[0]?.title || "None"} - ${club.announcements[0]?.body || ""}.`,
].join("\n");
};

// Ask LegendBot
const askLegendBot = async (promptOverride?: string) => {
const q = (promptOverride ?? botInput).trim();
if (!q || botThinking) return;
setBotInput("");
const userMsg: ChatMessage = {
id: bu-${Date.now()}`,
sender: session?.fullName || "Player",
text: q,
timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};
setBotMessages((prev) => [...prev, userMsg]);
setBotThinking(true);

try {
const res = await fetch("/api/chat", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
message: q,
clubContext: buildLegendBotContext(),
customQA: club.customQA,
}),
});
const data = await res.json();
const replyText = data.reply || data.error || "Ready for the next delivery!";
setBotMessages((prev) => [
...prev,
{
id: bb-${Date.now()}, sender: "LegendBot", text: replyText, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), isBot: true, }, ]); } catch { setBotMessages((prev) =&gt; [ ...prev, { id:be-${Date.now()},
sender: "LegendBot",
text: "Could not reach /api/chat right now. Check GROQ_API_KEY in Vercel or your internet!",
timestamp: "Now",
isBot: true,
},
 ]);
} finally {
setBotThinking(false);
}
};

// Voice Input for LegendBot
const toggleVoiceInput = () => {
const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
if (!SpeechRec) {
showToast("Voice input not supported in this browser.");
return;
}
const recognition = new SpeechRec();
recognition.lang = "en-IN";
recognition.interimResults = false;
setIsListening(true);
recognition.onresult = (event: any) => {
const transcript = event.results?.[0]?.[0]?.transcript || "";
setIsListening(false);
if (transcript) {
setBotInput(transcript);
askLegendBot(transcript);
}
};
recognition.onerror = () => {
setIsListening(false);
showToast("Mic stopped. Try speaking again.");
};
recognition.onend = () => setIsListening(false);
recognition.start();
};

const speakText = (text: string) => {
if (!("speechSynthesis" in window)) return;
window.speechSynthesis.cancel();
const utter = new SpeechSynthesisUtterance(text);
utter.lang = "en-IN";
utter.rate = 1.04;
window.speechSynthesis.speak(utter);
};

// ==========================================
// SIGN-IN SCREEN (Required before viewing app)
// ==========================================
if (!session) {
return (
<div className="app-shell" style={{ display: "grid", placeItems: "center", minHeight: "95vh" }}>
<div className="energy-card stack" style={{ width: "min(100%, 420px)" }}>
<div className="row-gap" style={{ justifyContent: "center" }}>
<div className="crest-badge">IL</div>
<div>
<h1 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 900, color: "var(--gold)" }}>
Indore Legends
</h1>
<div className="muted-text">Desi Turf Limbodi • Official Squad Login</div>
</div>
</div>

<div className="orb-stage" style={{ transform: "scale(0.88)" }}>
<div className="orb-glow" />
<div className="orb-core" />
</div>

<form onSubmit={handleLogin} className="stack">
<div>
<label className="field-label">Select Your Full Name</label>
<select
className="il-select"
value={loginName}
onChange={(e) => setLoginName(e.target.value)}
>
{SQUAD_ACCOUNTS.map((acc) => (
<option key={acc.id} value={acc.fullName}>
{acc.fullName} {acc.isAdmin ? "(Admin)" : ""}
</option>
))}
</select>
</div>

<div>
<label className="field-label">Password</label>
<input
type="password"
className="il-input"
placeholder="Enter your password"
value={loginPass}
onChange={(e) => setLoginPass(e.target.value)}
required
/>
</div>

{loginError && (
<div className="status-pill pill-coral" style={{ justifyContent: "center", padding: "8px 10px" }}>
<AlertTriangle size={14} /> {loginError}
</div>
)}

<button type="submit" className="hype-btn" style={{ width: "100%", padding: "12px" }}>
<Zap size={16} /> Enter Indore Legends Hub
</button>
</form>
</div>
</div>
);
}

// Live Match Chase Calculation
const activeMatch = club.activeMatch;
const maxBalls = (activeMatch?.totalOvers || 8) * 6;
const ballsLeft = activeMatch ? Math.max(0, maxBalls - activeMatch.legalBalls) : 0;
const runsNeeded = activeMatch?.target ? Math.max(0, activeMatch.target - activeMatch.runs) : 0;
const reqRunRate = ballsLeft > 0 ? ((runsNeeded / ballsLeft) * 6).toFixed(2) : "0.00";
const currRunRate =
activeMatch && activeMatch.legalBalls > 0
? ((activeMatch.runs / activeMatch.legalBalls) * 6).toFixed(2)
: "0.00";
const isTied = Boolean(
activeMatch &&
activeMatch.innings === 2 &&
activeMatch.target &&
activeMatch.runs === activeMatch.target - 1 &&
(ballsLeft === 0 || activeMatch.wickets >= 9)
);

// SVG Pie Chart Stroke Math (radius = 42, circumference ≈ 263.89)
const pieCirc = 2 * Math.PI * 42;
const sliceALen = (moneyMetrics.aPct / 100) * pieCirc;
const sliceBLen = pieCirc - sliceALen;

// Navigation items (Mandir tab ONLY included for the 8 selected G.M members)
const navItems: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }>; isMandir?: boolean }[] = [
{ id: "match", label: "Match", icon: Trophy },
{ id: "stats", label: "Stats", icon: Award },
{ id: "money", label: "Money", icon: Wallet },
{ id: "hub", label: "Hub", icon: MessageSquare },
{ id: "bot", label: "Bot", icon: Sparkles },
...(session.hasGM ? [{ id: "mandir" as TabId, label: "Mandir", icon: Flame, isMandir: true }] : []),
];

const gmAllowedNames = SQUAD_ACCOUNTS.filter((a) => a.hasGM).map((a) => a.fullName);

return (
<div className="app-shell">
{/* Floating Toast */}
{toast && (
<div
style={{
position: "fixed",
top: 14,
left: "50%",
transform: "translateX(-50%)",
zIndex: 120,
padding: "9px 16px",
borderRadius: 999,
fontWeight: 800,
fontSize: "0.85rem",
color: "#050816",
background: "linear-gradient(135deg, #facc15, #10b981)",
boxShadow: "0 10px 28px rgba(0,0,0,0.6)",
}}
>
{toast}
</div>
)}

{/* TOP HEADER */}
<header className="energy-card" style={{ marginBottom: 14 }}>
<div className="row-between">
<div className="row-gap">
<div className="crest-badge">IL</div>
<div>
<div className="row-gap">
<h1 style={{ margin: 0, fontSize: "1.22rem", fontWeight: 900, color: "var(--gold)" }}>
{club.clubName}
</h1>
<span className={status-pill ${syncStatus === "offline" ? "pill-coral" : "pill-live"}`}>
{syncStatus === "syncing" ? "Syncing..." : syncStatus === "offline" ? "Local Mode" : "Cloud Live"}
</span>
</div>
<div className="muted-text" style={{ marginTop: 2 }}>
Signed in: <strong style={{ color: "#fff" }}>{session.fullName}</strong>
</div>
</div>
</div>

<div className="row-gap">
<button
type="button"
className={adminUnlocked ? "emerald-btn" : "ghost-pill"}
onClick={() => {
if (adminUnlocked) {
setAdminUnlocked(false);
showToast("Admin Edits Locked.");
} else {
requireAdminPin(() => {});
}
}}
title="Admin PIN Unlock"
>
{adminUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
{adminUnlocked ? "Admin" : "PIN"}
</button>
<button
type="button"
className="ghost-pill"
onClick={() => setPassModalOpen(true)}
title="Change Normal Password"
>
<KeyRound size={14} />
</button>
<button type="button" className="coral-btn" onClick={handleLogout} title="Sign Out">
<LogOut size={14} />
</button>
</div>
</div>
</header>

{/* PINNED GOLD ANNOUNCEMENT + COUNTDOWN STRIP */}
{activeTab !== "mandir" && (
<div className="announcement-banner" style={{ marginBottom: 14 }}>
<div className="row-between">
<div className="row-gap">
<Bell size={16} color="#facc15" />
<strong style={{ color: "#fde047", fontSize: "0.9rem" }}>
{club.announcements.find((a) => a.pinned)?.title || "Indore Legends Match Hub"}
</strong>
</div>
<span className="status-pill pill-cyan il-nums">
<Clock size={12} /> {countdownText}
</span>
</div>
{club.announcements.find((a) => a.pinned)?.body && (
<div className="muted-text" style={{ marginTop: 4 }}>
{club.announcements.find((a) => a.pinned)?.body}
</div>
)}
</div>
)}

{/* =========================================
TAB 1: MATCH (LIVE SCORER + CREATOR + GEAR)
========================================= */}
{activeTab === "match" && (
<div className="stack">
<div className="row-gap">
<button
type="button"
className={ghost-pill${matchSubTab === "live" ? "active" : ""}} onClick={() =&gt; setMatchSubTab("live")} &gt; &lt;Trophy size={14} /&gt; Live Scorer &lt;/button&gt; &lt;button type="button" className={ghost-pill latex
{matchSubTab === "creator" ? "active" : ""}`} onClick={() =&gt; setMatchSubTab("creator")} &gt; &lt;Swords size={14} /&gt; Match Creator & Split &lt;/button&gt; &lt;button type="button" className={`ghost-pill 

{matchSubTab === "checklist" ? "active" : ""}`}
onClick={() => setMatchSubTab("checklist")}
>
<Check size={14} /> Gear Checklist
</button>
</div>

{/* LIVE SCORER /}
{matchSubTab === "live" && activeMatch && (
<div className="stack">
{/ FREE HIT FLASHING ALERT */}
{activeMatch.isFreeHit && (
<div
className="energy-card"
style={{
borderColor: "#fb7185",
background: "linear-gradient(135deg, rgba(225,29,72,0.45), rgba(249,115,22,0.45))",
textAlign: "center",
fontWeight: 900,
letterSpacing: "0.08em",
fontSize: "1.05rem",
}}
>
⚡ FREE HIT! SWING FOR THE FENCES! ⚡
</div>
)}

{/* SCORE HERO */}
<div className="score-hero stack">
<div className="row-between">
<div>
<div className="status-pill pill-gold">
{activeMatch.innings === 3
? "SUPER OVER"
: activeMatch.innings === 2
? "2ND INNINGS • CHASE"
: "1ST INNINGS"}{" "}
• {activeMatch.groundName}
</div>
<h2 style={{ margin: "6px 0 0", fontSize: "1.15rem", fontWeight: 900 }}>
{activeMatch.battingTeamName} vs {activeMatch.bowlingTeamName}
</h2>
</div>
<div style={{ textAlign: "right" }}>
<div className="big-score il-nums">
{activeMatch.runs}/{activeMatch.wickets}
</div>
<div className="muted-text il-nums">
Overs: <strong style={{ color: "#fff" }}>{formatOvers(activeMatch.legalBalls)}</strong> /{" "}
{activeMatch.totalOvers} • CRR: <strong style={{ color: "var(--cyan)" }}>{currRunRate}</strong>
</div>
</div>
</div>

{/* LIVE CHASE CALCULATOR */}
{activeMatch.target && (
<div
className="sub-card row-between"
style={{ borderColor: "rgba(56,189,248,0.5)", background: "rgba(8,47,73,0.65)" }}
>
<div className="il-nums" style={{ fontWeight: 800 }}>
🎯 Target: <span style={{ color: "var(--gold)" }}>{activeMatch.target}</span> • Need{" "}
<span style={{ color: "#34d399" }}>{runsNeeded} runs</span> in{" "}
<span style={{ color: "var(--cyan)" }}>{ballsLeft} balls</span>
</div>
<span className="status-pill pill-gold il-nums">RRR: {reqRunRate}</span>
</div>
)}

{activeMatch.winnerText && (
<div className="status-pill pill-live" style={{ fontSize: "0.88rem", padding: "6px 12px" }}>
🏆 {activeMatch.winnerText} {activeMatch.mvpName ? • MVP: ${activeMatch.mvpName}` : ""}
</div>
)}

{/* ACTIVE CREASE PLAYERS */}
<div className="grid-3">
<div className="sub-card">
<div className="field-label">Striker *</div>
<strong style={{ color: "var(--gold)" }}>{playerName(activeMatch.strikerId)}</strong>
</div>
<div className="sub-card">
<div className="field-label">Non-Striker</div>
<strong>{playerName(activeMatch.nonStrikerId)}</strong>
</div>
<div className="sub-card">
<div className="field-label">Bowler</div>
<strong style={{ color: "var(--cyan)" }}>{playerName(activeMatch.bowlerId)}</strong>
</div>
</div>

{/* RECENT BALLS STRIP */}
<div className="over-strip">
{activeMatch.timeline.slice(-12).map((b) => (
<span
key={b.id}
className={ball-chip${
b.isWicket
? "is-w"
: b.runsOffBat === 6
? "is-6"
: b.runsOffBat === 4
? "is-4"
: b.extraType
? "is-ex"
: ""
}`}
>
{b.label}
</span>
))}
{activeMatch.timeline.length === 0 && (
<span className="muted-text">Tap the keypad below to score Ball 1!</span>
)}
</div>
</div>

{/* BALL-BY-BALL KEYPAD */}
<div className="energy-card stack">
<div className="row-between">
<h3 className="section-title" style={{ margin: 0 }}>
<Zap size={17} /> Ball-by-Ball Scorer
</h3>
<div className="row-gap">
<button type="button" className="ghost-pill" onClick={() => setSwapModalOpen(true)}>
<RefreshCw size={13} /> Swap / Retired Hurt
</button>
<button type="button" className="coral-btn" onClick={undoLastBall}>
<Undo2 size={14} /> Undo
</button>
</div>
</div>

<div className="keypad-grid">
<button type="button" className="ball-btn" onClick={() => recordDelivery({ runsOffBat: 0 })}>
0
</button>
<button type="button" className="ball-btn" onClick={() => recordDelivery({ runsOffBat: 1 })}>
1
</button>
<button type="button" className="ball-btn" onClick={() => recordDelivery({ runsOffBat: 2 })}>
2
</button>
<button type="button" className="ball-btn" onClick={() => recordDelivery({ runsOffBat: 3 })}>
3
</button>
<button type="button" className="ball-btn four" onClick={() => recordDelivery({ runsOffBat: 4 })}>
4
</button>
<button type="button" className="ball-btn six" onClick={() => recordDelivery({ runsOffBat: 6 })}>
6
</button>
<button
type="button"
className="ball-btn extra"
onClick={() => recordDelivery({ extraRuns: 1, extraType: "WD" })}
>
WD +1
</button>
<button
type="button"
className="ball-btn extra"
onClick={() => recordDelivery({ extraRuns: 1, extraType: "NB" })}
>
NB (FH)
</button>
<button
type="button"
className="ball-btn extra"
onClick={() => recordDelivery({ extraRuns: 1, extraType: "BYE" })}
>
BYE +1
</button>
<button
type="button"
className="ball-btn extra"
onClick={() => recordDelivery({ extraRuns: 1, extraType: "LB" })}
>
LB +1
</button>
<button
type="button"
className="ball-btn wicket"
style={{ gridColumn: "span 2" }}
onClick={() => {
const available = club.players.find(
(p) =>
p.id !== activeMatch.strikerId &&
p.id !== activeMatch.nonStrikerId &&
!activeMatch.outPlayerIds.includes(p.id)
);
setNextBatterId(available?.id || "p3");
setWicketModalOpen(true);
}}
>
OUT / WICKET
</button>
</div>

{/* INNINGS CONTROLS + DIGITAL TOSS (IN BOTH LIVE & CREATOR) */}
<div className="row-between" style={{ paddingTop: 6 }}>
<div className="row-gap">
{activeMatch.innings === 1 && (
<button type="button" className="cyan-btn" onClick={startSecondInnings}>
Start 2nd Innings
</button>
)}
{isTied && (
<button type="button" className="hype-btn" onClick={startSuperOver}>
⚡ Start Super Over!
</button>
)}
<button type="button" className="emerald-btn" onClick={finishMatchAndSave}>
<Trophy size={14} /> Finish & Auto MVP
</button>
<button type="button" className="ghost-pill" onClick={copyWhatsAppScorecard}>
<Copy size={13} /> WhatsApp Card
</button>
</div>

<div className="row-gap">
<div
className={coin-disc ${coinFlipping ? "flipping" : ""}`}
style={{ width: 46, height: 46, fontSize: "0.66rem", cursor: "pointer" }}
onClick={runCoinToss}
title="Tap to Flip Coin"
>
{coinResult}
</div>
</div>
</div>
</div>
</div>
)}

{/* MATCH CREATOR + AUTO TEAM SPLITTER + AUTO CAPTAIN/VC + DIGITAL TOSS */}
{matchSubTab === "creator" && (
<div className="energy-card stack">
<div className="row-between">
<h3 className="section-title" style={{ margin: 0 }}>
<Swords size={18} /> Match Creator (Up to 3 Days Ahead)
</h3>
<button type="button" className="hype-btn" onClick={runCoinToss}>
<Coins size={15} /> Coin Toss: {coinResult}
</button>
</div>

<div className="grid-2">
<div>
<label className="field-label">Match Name</label>
<input
className="il-input"
value={creatorTitle}
onChange={(e) => setCreatorTitle(e.target.value)}
/>
</div>
<div>
<label className="field-label">Ground</label>
<select
className="il-select"
value={creatorGround}
onChange={(e) => setCreatorGround(e.target.value)}
>
{club.locations.map((l) => (
<option key={l.id} value={l.name}>
{l.name}
</option>
))}
</select>
</div>
<div>
<label className="field-label">Match Day (Before 3 Days Allowed)</label>
<select
className="il-select"
value={creatorDayOffset}
onChange={(e) => setCreatorDayOffset(Number(e.target.value))}
>
<option value={0}>Today</option>
<option value={1}>Tomorrow (+1 Day)</option>
<option value={2}>In 2 Days</option>
<option value={3}>In 3 Days</option>
</select>
</div>
<div className="grid-2">
<div>
<label className="field-label">Time</label>
<input
type="time"
className="il-input"
value={creatorTime}
onChange={(e) => setCreatorTime(e.target.value)}
/>
</div>
<div>
<label className="field-label">Overs</label>
<select
className="il-select"
value={creatorOvers}
onChange={(e) => setCreatorOvers(Number(e.target.value))}
>
{[4, 5, 6, 8, 10, 12, 15].map((ov) => (
<option key={ov} value={ov}>
{ov} Overs
</option>
))}
</select>
</div>
</div>
</div>

{/* Select Players */}
<div>
<label className="field-label">
Select Playing Squad ({selectedMatchPlayerIds.length} selected — ranked fairly)
</label>
<div className="row-gap">
{club.players.map((p) => {
const picked = selectedMatchPlayerIds.includes(p.id);
return (
<button
key={p.id}
type="button"
className={ghost-pill${picked ? "active" : ""}`}
onClick={() =>
setSelectedMatchPlayerIds((prev) =>
picked ? prev.filter((id) => id !== p.id) : [...prev, p.id]
)
}
>
{p.fullName} • Rk {calcRankingScore(p)}
</button>
);
})}
</div>
</div>

{/* Auto Split + Auto C/VC Buttons */}
<div className="row-gap">
<button
type="button"
className="cyan-btn"
onClick={() => generateFairSplitAndCaptains(false)}
>
<Users size={15} /> Auto Split Fairly by Ranking
</button>
<button
type="button"
className="emerald-btn"
onClick={() => generateFairSplitAndCaptains(true)}
>
<Crown size={15} /> Auto Captain / VC (No Jhagda!)
</button>
</div>

{previewSplit && (
<div className="grid-2">
<div className="sub-card" style={{ borderColor: "rgba(250,204,21,0.5)" }}>
<strong style={{ color: "var(--gold)" }}>{previewSplit.teamAName}</strong>
<div className="muted-text" style={{ margin: "4px 0 8px" }}>
👑 C: <strong>{previewSplit.captainA}</strong> • VC: <strong>{previewSplit.viceCaptainA}</strong>
</div>
<div className="row-gap">
{previewSplit.teamAIds.map((id) => (
<span key={id} className="status-pill pill-gold">
{playerName(id)}
</span>
))}
</div>
</div>
<div className="sub-card" style={{ borderColor: "rgba(56,189,248,0.5)" }}>
<strong style={{ color: "var(--cyan)" }}>{previewSplit.teamBName}</strong>
<div className="muted-text" style={{ margin: "4px 0 8px" }}>
👑 C: <strong>{previewSplit.captainB}</strong> • VC: <strong>{previewSplit.viceCaptainB}</strong>
</div>
<div className="row-gap">
{previewSplit.teamBIds.map((id) => (
<span key={id} className="status-pill pill-cyan">
{playerName(id)}
</span>
))}
</div>
</div>
</div>
)}

<button type="button" className="hype-btn" onClick={handleCreateMatch}>
<Trophy size={16} /> Create Match & Open Gear Checklist
</button>
</div>
)}

{/* POST-MATCH-CREATION GEAR CHECKLIST (WHO IS BRINGING WHAT) */}
{matchSubTab === "checklist" && activeMatch && (
<div className="energy-card stack">
<h3 className="section-title">
<Check size={18} /> Who Is Bringing What — {activeMatch.title}
</h3>

<div className="stack">
{activeMatch.gearList.map((g) => (
<div key={g.id} className="sub-card row-between">
<div>
<strong>{g.item}</strong>
<div className="muted-text">Assigned to: {g.assignedTo}</div>
</div>
<div className="row-gap">
<button
type="button"
className={g.confirmed ? "emerald-btn" : "ghost-pill"}
onClick={() =>
updateClub((prev) => ({
...prev,
activeMatch: prev.activeMatch
? {
...prev.activeMatch,
gearList: prev.activeMatch.gearList.map((item) =>
item.id === g.id ? { ...item, confirmed: !item.confirmed } : item
),
}
: null,
}))
}
>
<Check size={14} /> {g.confirmed ? "Confirmed" : "Pending"}
</button>
<button
type="button"
className="coral-btn"
onClick={() =>
requireAdminPin(() =>
updateClub((prev) => ({
...prev,
activeMatch: prev.activeMatch
? {
...prev.activeMatch,
gearList: prev.activeMatch.gearList.filter((item) => item.id !== g.id),
}
: null,
}))
)
}
>
<Trash2 size={14} />
</button>
</div>
</div>
))}
</div>

<div className="grid-3">
<input
className="il-input"
placeholder="Item (e.g., Extra Wind Ball)"
value={newGearItem}
onChange={(e) => setNewGearItem(e.target.value)}
/>
<select
className="il-select"
value={newGearPlayer}
onChange={(e) => setNewGearPlayer(e.target.value)}
>
{club.players.map((p) => (
<option key={p.id} value={p.fullName}>
{p.fullName}
</option>
))}
</select>
<button
type="button"
className="hype-btn"
onClick={() => {
if (!newGearItem.trim()) return;
const itemObj: GearAssignment = {
id: g-${Date.now()}`,
item: newGearItem.trim(),
assignedTo: newGearPlayer,
confirmed: false,
};
updateClub((prev) => ({
...prev,
activeMatch: prev.activeMatch
? { ...prev.activeMatch, gearList: [...prev.activeMatch.gearList, itemObj] }
: null,
}));
setNewGearItem("");
}}
>
<Plus size={15} /> Add Gear
</button>
</div>
</div>
)}
</div>
)}

{/* =========================================
TAB 2: FULL SCORECARD, SQUAD, AWARDS & HISTORY
========================================= */}
{activeTab === "stats" && (
<div className="stack">
<div className="row-gap">
<button
type="button"
className={ghost-pill${statsSubTab === "scorecard" ? "active" : ""}} onClick={() =&gt; setStatsSubTab("scorecard")} &gt; Scorecard &lt;/button&gt; &lt;button type="button" className={ghost-pill latex
{statsSubTab === "squad" ? "active" : ""}`} onClick={() =&gt; setStatsSubTab("squad")} &gt; Squad Profiles &lt;/button&gt; &lt;button type="button" className={`ghost-pill 

{statsSubTab === "awards" ? "active" : ""}} onClick={() =&gt; setStatsSubTab("awards")} &gt; Caps & Awards &lt;/button&gt; &lt;button type="button" className={ghost-pill ${statsSubTab === "history" ? "active" : ""}}
onClick={() => setStatsSubTab("history")}
>
<History size={13} /> History
</button>
</div>

{/* FULL SCORECARD + OVER-BY-OVER SUMMARY */}
{statsSubTab === "scorecard" && activeMatch && (
<div className="stack">
<div className="energy-card stack">
<div className="row-between">
<h3 className="section-title" style={{ margin: 0 }}>
Full Batting & Bowling Scorecard
</h3>
<button type="button" className="hype-btn" onClick={copyWhatsAppScorecard}>
<Copy size={14} /> Copy WhatsApp Card
</button>
</div>

<div className="score-table-wrap">
<table className="score-table">
<thead>
<tr>
<th>Batter</th>
<th>Status</th>
<th className="num-col">R</th>
<th className="num-col">B</th>
<th className="num-col">4s</th>
<th className="num-col">6s</th>
<th className="num-col">SR</th>
</tr>
</thead>
<tbody>
{scorecardData.batting.length === 0 ? (
<tr>
<td colSpan={7} className="muted-text">
Score balls in Live Match tab to populate full scorecard.
</td>
</tr>
) : (
scorecardData.batting.map((b) => (
<tr key={b.id}>
<td>
<strong>{b.name}</strong>
</td>
<td className="muted-text">{b.outText}</td>
<td className="num-col">
<strong style={{ color: "var(--gold)" }}>{b.runs}</strong>
</td>
<td className="num-col">{b.balls}</td>
<td className="num-col">{b.fours}</td>
<td className="num-col">{b.sixes}</td>
<td className="num-col">
{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0"}
</td>
</tr>
))
)}
</tbody>
</table>
</div>

<div className="muted-text il-nums">
Extras: <strong>{activeMatch.extras.wides + activeMatch.extras.noBalls + activeMatch.extras.byes + activeMatch.extras.legByes}</strong>{" "}
(WD {activeMatch.extras.wides}, NB {activeMatch.extras.noBalls}, B {activeMatch.extras.byes}, LB{" "}
{activeMatch.extras.legByes})
</div>

<div className="score-table-wrap">
<table className="score-table">
<thead>
<tr>
<th>Bowler</th>
<th className="num-col">O</th>
<th className="num-col">R</th>
<th className="num-col">W</th>
<th className="num-col">Econ</th>
</tr>
</thead>
<tbody>
{scorecardData.bowling.length === 0 ? (
<tr>
<td colSpan={5} className="muted-text">
No overs bowled yet.
</td>
</tr>
) : (
scorecardData.bowling.map((bw) => (
<tr key={bw.id}>
<td>
<strong>{bw.name}</strong>
</td>
<td className="num-col">{formatOvers(bw.legalBalls)}</td>
<td className="num-col">{bw.runs}</td>
<td className="num-col">
<strong style={{ color: "var(--coral)" }}>{bw.wickets}</strong>
</td>
<td className="num-col">
{bw.legalBalls > 0 ? ((bw.runs / bw.legalBalls) * 6).toFixed(2) : "0.00"}
</td>
</tr>
))
)}
</tbody>
</table>
</div>

{/* OVER-BY-OVER SUMMARY */}
<div>
<h4 style={{ margin: "4px 0 8px", color: "var(--cyan)" }}>Over-by-Over Summary</h4>
<div className="stack">
{scorecardData.overSummaries.length === 0 ? (
<div className="muted-text">Over summary appears automatically as balls are bowled.</div>
) : (
scorecardData.overSummaries.map((ov) => (
<div key={ov.label} className="sub-card row-between">
<strong>{ov.label}</strong>
<div className="row-gap">
{ov.balls.map((lbl, i) => (
<span key={i} className="ball-chip" style={{ minWidth: 28, height: 28 }}>
{lbl}
</span>
))}
</div>
<span className="status-pill pill-gold il-nums">
{ov.runs} R / {ov.wickets} W
</span>
</div>
))
)}
</div>
</div>
</div>
</div>
)}

{/* SQUAD PROFILES & HEAD-TO-HEAD RIVALRIES */}
{statsSubTab === "squad" && (
<div className="stack">
<div className="grid-2">
{[...club.players]
.sort((a, b) => calcRankingScore(b) - calcRankingScore(a))
.map((p, idx) => {
const sr = p.ballsFaced > 0 ? ((p.runs / p.ballsFaced) * 100).toFixed(1) : "0.0";
const econ = p.ballsBowled > 0 ? ((p.runsConceded / p.ballsBowled) * 6).toFixed(2) : "0.00";
return (
<div key={p.id} className="energy-card stack" style={{ gap: 8 }}>
<div className="row-between">
<div>
<div className="row-gap">
<span className="status-pill pill-gold">#{idx + 1}</span>
<strong>{p.fullName}</strong>
</div>
<div className="muted-text">
Jersey #{p.jerseyNumber} • {p.nickname} • {p.role}
</div>
</div>
<span className="status-pill pill-cyan">{p.skillTag}</span>
</div>

<div className="row-gap">
{awards.orangeCap?.id === p.id && <span className="status-pill pill-gold">🧡 Orange Cap</span>}
{awards.purpleCap?.id === p.id && <span className="status-pill pill-violet">💜 Purple Cap</span>}
<span className="status-pill pill-live">🔥 {p.attendanceStreak}d Streak</span>
</div>

<div className="grid-3 il-nums" style={{ fontSize: "0.84rem" }}>
<div className="sub-card">
<div className="field-label">Runs (SR)</div>
<strong>
{p.runs} ({sr})
</strong>
</div>
<div className="sub-card">
<div className="field-label">Wkts (Econ)</div>
<strong>
{p.wickets} ({econ})
</strong>
</div>
<div className="sub-card">
<div className="field-label">4s / 6s</div>
<strong>
{p.fours} / {p.sixes}
</strong>
</div>
</div>

<div className="muted-text">
Recent Form:{" "}
<strong style={{ color: "#fff" }}>{p.recentScores.join(" • ")}</strong>
</div>
</div>
);
})}
</div>

{/* HEAD-TO-HEAD RIVALRY COMPARATOR */}
<div className="energy-card stack">
<h3 className="section-title">
<Swords size={18} /> Head-to-Head Rivalry Matcher
</h3>
<div className="grid-2">
<div>
<label className="field-label">Batter</label>
<select
className="il-select"
value={h2hBatterId}
onChange={(e) => setH2hBatterId(e.target.value)}
>
{club.players.map((p) => (
<option key={p.id} value={p.id}>
{p.fullName}
</option>
))}
</select>
</div>
<div>
<label className="field-label">Bowler</label>
<select
className="il-select"
value={h2hBowlerId}
onChange={(e) => setH2hBowlerId(e.target.value)}
>
{club.players.map((p) => (
<option key={p.id} value={p.id}>
{p.fullName}
</option>
))}
</select>
</div>
</div>
{(() => {
const bat = club.players.find((p) => p.id === h2hBatterId);
const bowl = club.players.find((p) => p.id === h2hBowlerId);
const h2hBalls = (activeMatch?.timeline || []).filter(
(b) => b.batsmanId === h2hBatterId && b.bowlerId === h2hBowlerId
);
const h2hRuns = h2hBalls.reduce((s, b) => s + b.runsOffBat, 0);
const h2hOuts = h2hBalls.filter((b) => b.isWicket).length;
return (
<div className="sub-card row-between">
<div>
<strong>{bat?.fullName}</strong> vs <strong style={{ color: "var(--coral)" }}>{bowl?.fullName}</strong>
<div className="muted-text">
Live Match Clash: {h2hRuns} runs in {h2hBalls.length} balls • Dismissals: {h2hOuts}
</div>
</div>
<span className="status-pill pill-gold">
Rank Edge: {calcRankingScore(bat!) >= calcRankingScore(bowl!) ? bat?.nickname : bowl?.nickname}
</span>
</div>
);
})()}
</div>
</div>
)}

{/* AUTO ORANGE CAP, PURPLE CAP & FUN AWARDS + HALL OF FAME */}
{statsSubTab === "awards" && (
<div className="grid-2">
<div className="energy-card" style={{ borderColor: "#f97316" }}>
<div className="status-pill pill-gold">🧡 ORANGE CAP (TOP RUNS)</div>
<h3 style={{ margin: "8px 0 4px" }}>{awards.orangeCap?.fullName}</h3>
<div className="il-nums" style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fb923c" }}>
{awards.orangeCap?.runs} Runs
</div>
</div>
<div className="energy-card" style={{ borderColor: "#a855f7" }}>
<div className="status-pill pill-violet">💜 PURPLE CAP (TOP WICKETS)</div>
<h3 style={{ margin: "8px 0 4px" }}>{awards.purpleCap?.fullName}</h3>
<div className="il-nums" style={{ fontSize: "1.4rem", fontWeight: 900, color: "#c084fc" }}>
{awards.purpleCap?.wickets} Wickets
</div>
</div>
<div className="energy-card">
<div className="status-pill pill-cyan">🚀 SIXES KING</div>
<h3 style={{ margin: "8px 0 4px" }}>{awards.sixesKing?.fullName}</h3>
<div className="il-nums muted-text">{awards.sixesKing?.sixes} Giant Sixes</div>
</div>
<div className="energy-card">
<div className="status-pill pill-live">🎯 GOLDEN ARM (BEST ECON)</div>
<h3 style={{ margin: "8px 0 4px" }}>{awards.goldenArm?.fullName}</h3>
<div className="il-nums muted-text">
Econ:{" "}
{awards.goldenArm && awards.goldenArm.ballsBowled > 0
? ((awards.goldenArm.runsConceded / awards.goldenArm.ballsBowled) * 6).toFixed(2)
: "0.00"}
</div>
</div>
<div className="energy-card">
<div className="status-pill pill-coral">🦆 DUCK CLUB</div>
<h3 style={{ margin: "8px 0 4px" }}>{awards.duckClub?.fullName}</h3>
<div className="il-nums muted-text">{awards.duckClub?.ducks} Ducks Logged</div>
</div>
<div className="energy-card">
<div className="status-pill pill-gold">🔥 ATTENDANCE STREAK</div>
<h3 style={{ margin: "8px 0 4px" }}>{awards.ironMan?.fullName}</h3>
<div className="il-nums muted-text">{awards.ironMan?.attendanceStreak} Matches in a Row</div>
</div>
</div>
)}

{/* MATCH HISTORY ARCHIVE */}
{statsSubTab === "history" && (
<div className="energy-card stack">
<h3 className="section-title">
<History size={18} /> Completed Match History
</h3>
{club.matchHistory.length === 0 ? (
<div className="muted-text">
No completed matches archived yet. Tap <strong>Finish & Auto MVP</strong> after your live match!
</div>
) : (
club.matchHistory.map((h) => (
<div key={h.id} className="sub-card row-between">
<div>
<strong>{h.title}</strong> • {h.groundName}
<div className="muted-text">
{h.battingTeamName}: {h.runs}/{h.wickets} ({formatOvers(h.legalBalls)} ov) • {h.winnerText}
</div>
</div>
{h.mvpName && <span className="status-pill pill-gold">⭐ MVP: {h.mvpName}</span>}
</div>
))
)}
</div>
)}
</div>
)}

{/* =========================================
TAB 3: MONEY TRACKER, PIE CHART & ADVANCE CREDITS
========================================= /}
{activeTab === "money" && (
<div className="stack">
{/ PIE CHART + SUMMARY */}
<div className="energy-card stack">
<div className="row-between">
<h3 className="section-title" style={{ margin: 0 }}>
<Wallet size={18} /> Money Collector & Pie Chart
</h3>
<div className="row-gap">
<button
type="button"
className={ghost-pill${pieMode === "paid" ? "active" : ""}} onClick={() =&gt; setPieMode("paid")} &gt; Paid vs Pending &lt;/button&gt; &lt;button type="button" className={ghost-pill ${pieMode === "cashflow" ? "active" : ""}}
onClick={() => setPieMode("cashflow")}
>
In vs Spent
</button>
<button type="button" className="hype-btn" onClick={copyWhatsAppDues}>
<Copy size={13} /> Dues Reminder
</button>
</div>
</div>

<div className="pie-layout">
<div className="pie-center-wrap">
<svg viewBox="0 0 120 120" width="166" height="166" style={{ transform: "rotate(-90deg)" }}>
<circle cx="60" cy="60" r="42" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="18" />
<circle
cx="60"
cy="60"
r="42"
fill="none"
stroke="#10b981"
strokeWidth="18"
strokeDasharray={${sliceALen} $`{pieCirc}`} /&gt; &lt;circle cx="60" cy="60" r="42" fill="none" stroke="#fb7185" strokeWidth="18" strokeDasharray={${sliceBLen} ${pieCirc}}
strokeDashoffset={-sliceALen}
/>
</svg>
<div className="pie-center-label il-nums">
<div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Cash in Hand</div>
<div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--gold)" }}>
₹{moneyMetrics.cashInHand}
</div>
</div>
</div>

<div className="stack" style={{ gap: 8 }}>
<div className="legend-row il-nums">
<span className="row-gap">
<span className="legend-dot" style={{ background: "#10b981" }} />
{pieMode === "paid" ? "Paid Collections & Fines" : "Total Cash In (+Advance)"}
</span>
<strong style={{ color: "#34d399" }}>
₹{moneyMetrics.aVal} ({moneyMetrics.aPct}%)
</strong>
</div>
<div className="legend-row il-nums">
<span className="row-gap">
<span className="legend-dot" style={{ background: "#fb7185" }} />
{pieMode === "paid" ? "Pending Dues" : "Expenses Spent"}
</span>
<strong style={{ color: "#fda4af" }}>
₹{moneyMetrics.bVal} ({moneyMetrics.bPct}%)
</strong>
</div>
<div className="legend-row il-nums">
<span className="row-gap">
<span className="legend-dot" style={{ background: "#facc15" }} />
Advance Credit Pool
</span>
<strong style={{ color: "var(--gold)" }}>₹{moneyMetrics.totalAdvance}</strong>
</div>
</div>
</div>
</div>

{/* ADVANCE CREDIT BALANCE PER PLAYER */}
<div className="energy-card stack">
<h3 className="section-title">
<Star size={17} /> Advance Credit Balances
</h3>
<div className="row-gap">
{Object.entries(club.advanceCredits || {}).filter(([, val]) => val > 0).length === 0 ? (
<span className="muted-text">No advance credits recorded yet.</span>
) : (
Object.entries(club.advanceCredits || {})
.filter(([, val]) => val > 0)
.map(([name, val]) => (
<span key={name} className="status-pill pill-gold il-nums">
{name}: +₹{val} Credit
</span>
))
)}
</div>
<div className="grid-3">
<select
className="il-select"
value={creditPlayer}
onChange={(e) => setCreditPlayer(e.target.value)}
>
{club.players.map((p) => (
<option key={p.id} value={p.fullName}>
{p.fullName}
</option>
))}
</select>
<input
type="number"
className="il-input"
placeholder="₹ Amount (+ or -)"
value={creditDelta}
onChange={(e) => setCreditDelta(e.target.value)}
/>
<button
type="button"
className="emerald-btn"
onClick={() => {
const amt = Number(creditDelta);
if (!amt) return;
requireAdminPin(() => {
updateClub((prev) => ({
...prev,
advanceCredits: {
...prev.advanceCredits,
[creditPlayer]: Math.max(0, (prev.advanceCredits[creditPlayer] || 0) + amt),
},
}));
setCreditDelta("");
showToast(Updated advance credit for${creditPlayer}!`);
});
}}
>
Update Credit
</button>
</div>
</div>

{/* ADD MONEY ENTRY (ADMIN PIN PROTECTED) */}
<div className="energy-card stack">
<h3 className="section-title">
<Plus size={17} /> Add Collection, Fine or Expense
</h3>
<div className="grid-2">
<select
className="il-select"
value={moneyPlayer}
onChange={(e) => setMoneyPlayer(e.target.value)}
>
{club.players.map((p) => (
<option key={p.id} value={p.fullName}>
{p.fullName}
</option>
))}
</select>
<select
className="il-select"
value={moneyCategory}
onChange={(e) => setMoneyCategory(e.target.value as MoneyEntry["category"])}
>
<option value="collection">Match / Turf Collection</option>
<option value="fine">Fine (Late / Drop / Lost Ball)</option>
<option value="expense">Club Expense</option>
</select>
<input
className="il-input"
placeholder="Reason (e.g., Turf Fee, Late Fine)"
value={moneyReason}
onChange={(e) => setMoneyReason(e.target.value)}
/>
<input
type="number"
className="il-input"
placeholder="Amount ₹"
value={moneyAmount}
onChange={(e) => setMoneyAmount(e.target.value)}
/>
</div>
<div className="row-between">
<label className="row-gap" style={{ fontSize: "0.88rem", cursor: "pointer" }}>
<input
type="checkbox"
checked={moneyPaid}
onChange={(e) => setMoneyPaid(e.target.checked)}
/>
Already Paid?
</label>
<button
type="button"
className="hype-btn"
onClick={() => {
const amt = Number(moneyAmount);
if (!amt || !moneyReason.trim()) return;
requireAdminPin(() => {
const entry: MoneyEntry = {
id: mon-${Date.now()}`,
date: new Date().toLocaleDateString("en-IN"),
fullName: moneyPlayer,
category: moneyCategory,
reason: moneyReason.trim(),
amount: amt,
paid: moneyCategory === "expense" ? true : moneyPaid,
};
updateClub((prev) => ({ ...prev, money: [entry, ...prev.money] }));
setMoneyReason("");
setMoneyAmount("");
showToast("Entry saved!");
});
}}
>
<Plus size={15} /> Save Entry
</button>
</div>
</div>

{/* FULL-NAME LEDGER LIST */}
<div className="energy-card stack">
<h3 className="section-title">Full-Name Money Ledger</h3>
{club.money.map((e) => (
<div key={e.id} className="sub-card row-between">
<div>
<div className="row-gap">
<strong>{e.fullName}</strong>
<span
className={status-pill${
e.category === "expense"
? "pill-cyan"
: e.category === "fine"
? "pill-coral"
: "pill-gold"
}`}
>
{e.category.toUpperCase()}
</span>
</div>
<div className="muted-text">
{e.reason} • {e.date}
</div>
</div>
<div className="row-gap">
<strong className="il-nums" style={{ fontSize: "1rem" }}>
₹{e.amount}
</strong>
{e.category !== "expense" && (
<button
type="button"
className={e.paid ? "emerald-btn" : "coral-btn"}
onClick={() =>
requireAdminPin(() =>
updateClub((prev) => ({
...prev,
money: prev.money.map((item) =>
item.id === e.id ? { ...item, paid: !item.paid } : item
),
}))
)
}
>
{e.paid ? "PAID" : "PENDING"}
</button>
)}
<button
type="button"
className="ghost-pill"
onClick={() =>
requireAdminPin(() =>
updateClub((prev) => ({
...prev,
money: prev.money.filter((item) => item.id !== e.id),
}))
)
}
>
<Trash2 size={13} />
</button>
</div>
</div>
))}
</div>
</div>
)}

{/* =========================================
TAB 4: HUB (ANNOUNCEMENTS, POLL, CHAT, MAPS)
========================================= */}
{activeTab === "hub" && (
<div className="stack">
<div className="row-gap">
<button
type="button"
className={ghost-pill ${hubSubTab === "announcements" ? "active" : ""}} onClick={() =&gt; setHubSubTab("announcements")} &gt; &lt;Bell size={13} /&gt; Notices & Poll &lt;/button&gt; &lt;button type="button" className={ghost-pill ${hubSubTab === "chat" ? "active" : ""}}
onClick={() => setHubSubTab("chat")}
>
<MessageSquare size={13} /> Locker Chat
</button>
<button
type="button"
className={ghost-pill ${hubSubTab === "locations" ? "active" : ""}`}
onClick={() => setHubSubTab("locations")}
>
<MapPin size={13} /> Turf & Maps
</button>
</div>

{hubSubTab === "announcements" && (
<div className="stack">
{/* PLAYING POLL */}
<div className="energy-card stack">
<h3 className="section-title">
<Vote size={18} /> {club.availabilityPollTitle}
</h3>
<div className="row-gap">
{(["playing", "maybe", "out"] as const).map((st) => (
<button
key={st}
type="button"
className={st === "playing" ? "emerald-btn" : st === "maybe" ? "cyan-btn" : "coral-btn"}
onClick={() =>
updateClub((prev) => ({
...prev,
availabilityVotes: [
...prev.availabilityVotes.filter((v) => v.fullName !== session.fullName),
{ fullName: session.fullName, status: st },
 ],
}))
}
>
{st === "playing" ? "✅ Playing" : st === "maybe" ? "🤔 Maybe" : "❌ Out"}
</button>
))}
</div>
{(() => {
const playing = club.availabilityVotes.filter((v) => v.status === "playing");
const pct = Math.round((playing.length / club.players.length) * 100);
return (
<div className="sub-card">
<div className="row-between">
<strong>Confirmed Playing: {playing.length} / {club.players.length}</strong>
<span className="il-nums muted-text">{pct}%</span>
</div>
<div className="poll-bar-track">
<div className="poll-bar-fill" style={{ width: ``${pct}%}} /&gt; &lt;/div&gt; &lt;div className="row-gap" style={{ marginTop: 8 }}&gt; {club.availabilityVotes.map((v) =&gt; ( &lt;span key={v.fullName} className={status-pill ${ v.status === "playing" ? "pill-live" : v.status === "maybe" ? "pill-cyan" : "pill-coral" }}
>
{v.fullName} ({v.status})
</span>
))}
</div>
</div>
);
})()}
</div>

{/* ADMIN-ONLY ANNOUNCEMENTS */}
<div className="energy-card stack">
<h3 className="section-title">
<Shield size={18} /> Official Announcements (Admin Only)
</h3>
{club.announcements.map((a) => (
<div key={a.id} className="announcement-banner row-between">
<div>
<strong style={{ color: "var(--gold)" }}>{a.title}</strong>
<div className="muted-text" style={{ marginTop: 3 }}>
{a.body}
</div>
<div className="muted-text" style={{ fontSize: "0.75rem", marginTop: 4 }}>
Posted by {a.postedBy} • {a.date}
</div>
</div>
<button
type="button"
className="coral-btn"
onClick={() =>
requireAdminPin(() =>
updateClub((prev) => ({
...prev,
announcements: prev.announcements.filter((item) => item.id !== a.id),
}))
)
}
>
<Trash2 size={14} />
</button>
</div>
))}

<div className="stack">
<input
className="il-input"
placeholder="Announcement Title (Admin PIN required)"
value={annTitle}
onChange={(e) => setAnnTitle(e.target.value)}
/>
<textarea
className="il-textarea"
rows={2}
placeholder="Announcement details..."
value={annBody}
onChange={(e) => setAnnBody(e.target.value)}
/>
<button
type="button"
className="hype-btn"
onClick={() => {
if (!annTitle.trim()) return;
requireAdminPin(() => {
const nextAnn: Announcement = {
id: ann-${Date.now()}`,
title: annTitle.trim(),
body: annBody.trim(),
postedBy: session.fullName,
date: new Date().toLocaleDateString("en-IN"),
pinned: true,
};
updateClub((prev) => ({
...prev,
announcements: [
nextAnn,
...prev.announcements.map((a) => ({ ...a, pinned: false })),
 ],
}));
setAnnTitle("");
setAnnBody("");
showToast("Pinned Announcement Posted!");
});
}}
>
<Bell size={15} /> Post Pinned Notice
</button>
</div>
</div>
</div>
)}

{/* LOCKER ROOM CHAT */}
{hubSubTab === "chat" && (
<div className="energy-card stack">
<h3 className="section-title">
<MessageSquare size={18} /> Indore Legends Locker Room
</h3>
<div className="chat-feed">
{club.chat.map((msg) => (
<div
key={msg.id}
className={chat-bubble ${msg.isBot ? "bot" : msg.sender === session.fullName ? "me" : ""}} &gt; &lt;div style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--gold)", marginBottom: 2 }}&gt; {msg.sender} • {msg.timestamp} &lt;/div&gt; &lt;div&gt;{msg.text}&lt;/div&gt; &lt;/div&gt; ))} &lt;/div&gt; &lt;form className="row-gap" onSubmit={(e) =&gt; { e.preventDefault(); if (!chatInput.trim()) return; const msg: ChatMessage = { id:ch-${Date.now()},
sender: session.fullName,
text: chatInput.trim(),
timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};
updateClub((prev) => ({ ...prev, chat: [...prev.chat, msg] }));
setChatInput("");
}}
>
<input
className="il-input"
style={{ flex: 1 }}
placeholder="Drop squad banter or turf update..."
value={chatInput}
onChange={(e) => setChatInput(e.target.value)}
/>
<button type="submit" className="hype-btn">
<Send size={15} />
</button>
</form>
</div>
)}

{/* GROUND LOCATIONS & GOOGLE MAPS DIRECTIONS */}
{hubSubTab === "locations" && (
<div className="energy-card stack">
<h3 className="section-title">
<MapPin size={18} /> Playing Grounds & Google Maps
</h3>
{club.locations.map((loc) => (
<div key={loc.id} className="sub-card row-between">
<div>
<strong style={{ color: "var(--gold)", fontSize: "1rem" }}>{loc.name}</strong>
<div className="muted-text">{loc.area}</div>
<div className="muted-text">
{loc.surface} • {loc.usualTime}
</div>
<div className="muted-text" style={{ marginTop: 3 }}>
{loc.notes}
</div>
</div>
<a
href={loc.mapsUrl}
target="_blank"
rel="noreferrer"
className="hype-btn"
style={{ textDecoration: "none" }}
>
<ExternalLink size={14} /> Open Maps
</a>
</div>
))}

<div className="grid-2">
<input
className="il-input"
placeholder="Add Another Ground Name"
value={locName}
onChange={(e) => setLocName(e.target.value)}
/>
<input
className="il-input"
placeholder="Area in Indore"
value={locArea}
onChange={(e) => setLocArea(e.target.value)}
/>
<input
className="il-input"
placeholder="Usual Time"
value={locTime}
onChange={(e) => setLocTime(e.target.value)}
/>
<input
className="il-input"
placeholder="Google Maps Link (optional)"
value={locUrl}
onChange={(e) => setLocUrl(e.target.value)}
/>
</div>
<button
type="button"
className="cyan-btn"
onClick={() => {
if (!locName.trim()) return;
requireAdminPin(() => {
updateClub((prev) => ({
...prev,
locations: [
...prev.locations,
{
id: loc-${Date.now()}, name: locName.trim(), area: locArea.trim() || "Indore, MP", surface: "Wind-Ball Cricket", usualTime: locTime.trim() || "Morning", notes: "Added by Admin", mapsUrl: locUrl.trim() ||https://www.google.com/maps/search/?api=1&query=${encodeURIComponent({locArea} Indore)},
},
 ],
}));
setLocName("");
setLocArea("");
setLocTime("");
setLocUrl("");
showToast("Ground Added!");
});
}}
>
<Plus size={14} /> Add Ground Location
</button>
</div>
)}
</div>
)}

{/* =========================================
TAB 5: LEGENDBOT (MORPH ORB + VOICE + IPL/CRICBUZZ)
========================================= */}
{activeTab === "bot" && (
<div className="stack">
<div className="energy-card stack">
<div className="row-between">
<div className="row-gap">
<div className="orb-stage" style={{ width: 84, height: 84, margin: 0 }}>
<div className="orb-glow" />
<div
className={orb-core ${botThinking ? "thinking" : ""}`}
style={{ width: 66, height: 66 }}
/>
</div>
<div>
<div className="status-pill pill-gold">IPL STYLE AI CAPTAIN</div>
<h2 style={{ margin: "4px 0 0", fontSize: "1.18rem", fontWeight: 900 }}>LegendBot</h2>
<div className="muted-text">Auto-reads Club Stats • IPL / Cricbuzz / Intl Cricket</div>
</div>
</div>
<a
href="https://www.cricbuzz.com/cricket-match/live-scores"
target="_blank"
rel="noreferrer"
className="emerald-btn"
style={{ textDecoration: "none" }}
>
<ExternalLink size={14} /> Cricbuzz Live
</a>
</div>

{/* Quick Smart Prompt Chips */}
<div className="row-gap">
{[
"Give an IPL-style report of our live match!",
"Who holds Orange Cap & Purple Cap?",
"Who still has pending money dues?",
"Latest IPL / India live cricket scores?",
 ].map((chip) => (
<button
key={chip}
type="button"
className="ghost-pill"
onClick={() => askLegendBot(chip)}
>
{chip}
</button>
))}
</div>

<div className="chat-feed">
{botMessages.map((msg) => (
<div
key={msg.id}
className={chat-bubble${msg.isBot ? "bot" : "me"}`}
>
<div className="row-between" style={{ marginBottom: 4 }}>
<span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--gold)" }}>
{msg.sender} • {msg.timestamp}
</span>
{msg.isBot && (
<button
type="button"
className="ghost-pill"
style={{ padding: "2px 7px", fontSize: "0.7rem" }}
onClick={() => speakText(msg.text)}
>
<Volume2 size={12} />
</button>
)}
</div>
<div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
</div>
))}
</div>

<form
className="row-gap"
onSubmit={(e) => {
e.preventDefault();
askLegendBot();
}}
>
<button
type="button"
className={isListening ? "coral-btn" : "cyan-btn"}
onClick={toggleVoiceInput}
title="Voice Input"
>
{isListening ? <MicOff size={16} /> : <Mic size={16} />}
</button>
<input
className="il-input"
style={{ flex: 1 }}
placeholder="Ask LegendBot about Indore Legends or IPL/Cricket..."
value={botInput}
onChange={(e) => setBotInput(e.target.value)}
/>
<button type="submit" className="hype-btn" disabled={botThinking}>
<Send size={15} />
</button>
</form>
</div>

{/* CUSTOM Q&A BRAIN MANAGER (ADMIN ONLY) */}
<div className="energy-card stack">
<h3 className="section-title">
<Sparkles size={17} /> Custom Club Q&A (Train LegendBot)
</h3>
{club.customQA.map((qa) => (
<div key={qa.id} className="sub-card row-between">
<div>
<strong style={{ color: "var(--gold)" }}>Q: {qa.question}</strong>
<div className="muted-text">A: {qa.answer}</div>
</div>
<button
type="button"
className="coral-btn"
onClick={() =>
requireAdminPin(() =>
updateClub((prev) => ({
...prev,
customQA: prev.customQA.filter((item) => item.id !== qa.id),
}))
)
}
>
<Trash2 size={13} />
</button>
</div>
))}
<div className="grid-2">
<input
className="il-input"
placeholder="Question (e.g., Who hits longest sixes?)"
value={newQaQ}
onChange={(e) => setNewQaQ(e.target.value)}
/>
<input
className="il-input"
placeholder="Exact Answer LegendBot should give"
value={newQaA}
onChange={(e) => setNewQaA(e.target.value)}
/>
</div>
<button
type="button"
className="emerald-btn"
onClick={() => {
if (!newQaQ.trim() || !newQaA.trim()) return;
requireAdminPin(() => {
updateClub((prev) => ({
...prev,
customQA: [
...prev.customQA,
{ id: qa-${Date.now()}`, question: newQaQ.trim(), answer: newQaA.trim() },
 ],
}));
setNewQaQ("");
setNewQaA("");
showToast("LegendBot Q&A Saved!");
});
}}
>
<Plus size={14} /> Teach LegendBot
</button>
</div>
</div>
)}

{/* =========================================
TAB 6: GANESH MANDIR (ONLY FOR 8 SELECTED G.M MEMBERS)
========================================= */}
{activeTab === "mandir" && session.hasGM && (
<div className="stack">
<div className="mandir-card row-between">
<div>
<div className="status-pill pill-gold">🕉️ SELECTED MEMBERS ONLY ({gmAllowedNames.length})</div>
<h2 style={{ margin: "6px 0 2px", color: "#fde047" }}>Ganesh Mandir Private Hub</h2>
<div className="muted-text">Only visible to your 8 selected (G.M) members</div>
</div>
<button
type="button"
className="coral-btn"
onClick={() => setActiveTab("match")}
title="Instant Hide back to Cricket"
>
<Lock size={14} /> Quick Hide
</button>
</div>

<div className="row-gap">
<button
type="button"
className={ghost-pill${mandirSubTab === "chat" ? "active" : ""}} onClick={() =&gt; setMandirSubTab("chat")} &gt; Private Chat &lt;/button&gt; &lt;button type="button" className={ghost-pill latex
{mandirSubTab === "schedule" ? "active" : ""}`} onClick={() =&gt; setMandirSubTab("schedule")} &gt; &lt;Calendar size={13} /&gt; Schedule & RSVP &lt;/button&gt; &lt;button type="button" className={`ghost-pill 

{mandirSubTab === "extras" ? "active" : ""}`}
onClick={() => setMandirSubTab("extras")}
>
<Bike size={13} /> Prasad, Rides & Poll
</button>
</div>

{/* MANDIR PRIVATE CHAT */}
{mandirSubTab === "chat" && (
<div className="mandir-card stack">
<div className="chat-feed">
{club.mandir.chat.map((msg) => (
<div
key={msg.id}
className={chat-bubble ${msg.sender === session.fullName ? "me" : ""}} &gt; &lt;div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#ff9933", marginBottom: 2 }}&gt; {msg.sender} • {msg.timestamp} &lt;/div&gt; &lt;div&gt;{msg.text}&lt;/div&gt; &lt;/div&gt; ))} &lt;/div&gt; &lt;form className="row-gap" onSubmit={(e) =&gt; { e.preventDefault(); if (!mandirChatInput.trim()) return; const msg: ChatMessage = { id:mc-${Date.now()},
sender: session.fullName,
text: mandirChatInput.trim(),
timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};
updateClub((prev) => ({
...prev,
mandir: { ...prev.mandir, chat: [...prev.mandir.chat, msg] },
}));
setMandirChatInput("");
}}
>
<input
className="il-input"
style={{ flex: 1 }}
placeholder="Message Ganesh Mandir group..."
value={mandirChatInput}
onChange={(e) => setMandirChatInput(e.target.value)}
/>
<button type="submit" className="mandir-btn">
<Send size={15} />
</button>
</form>
</div>
)}

{/* MANDIR SCHEDULE & RSVP */}
{mandirSubTab === "schedule" && (
<div className="mandir-card stack">
{club.mandir.schedules.map((sc) => (
<div key={sc.id} className="sub-card stack">
<div className="row-between">
<div>
<strong style={{ color: "#fde047" }}>{sc.dayLabel}</strong>
<div className="muted-text">
{sc.date} • {sc.time} • Meet at {sc.meetupPoint}
</div>
<div className="muted-text">{sc.note}</div>
</div>
<div className="row-gap">
<button
type="button"
className="emerald-btn"
onClick={() =>
updateClub((prev) => ({
...prev,
mandir: {
...prev.mandir,
schedules: prev.mandir.schedules.map((item) =>
item.id === sc.id
? {
...item,
rsvps: [
...item.rsvps.filter((r) => r.fullName !== session.fullName),
{ fullName: session.fullName, status: "coming" },
 ],
}
: item
),
},
}))
}
>
Coming
</button>
<button
type="button"
className="coral-btn"
onClick={() =>
updateClub((prev) => ({
...prev,
mandir: {
...prev.mandir,
schedules: prev.mandir.schedules.map((item) =>
item.id === sc.id
? {
...item,
rsvps: [
...item.rsvps.filter((r) => r.fullName !== session.fullName),
{ fullName: session.fullName, status: "cant" },
 ],
}
: item
),
},
}))
}
>
Can't
</button>
</div>
</div>
<div className="row-gap">
{sc.rsvps.map((r) => (
<span
key={r.fullName}
className={status-pill ${r.status === "coming" ? "pill-live" : "pill-coral"}`}
>
{r.fullName} ({r.status})
</span>
))}
</div>
</div>
))}

<div className="grid-2">
<input
className="il-input"
placeholder="Visit Plan (e.g., Next Wednesday)"
value={msDay}
onChange={(e) => setMsDay(e.target.value)}
/>
<input
className="il-input"
placeholder="Time (e.g., 6:30 AM)"
value={msTime}
onChange={(e) => setMsTime(e.target.value)}
/>
<input
className="il-input"
placeholder="Meetup Point"
value={msMeetup}
onChange={(e) => setMsMeetup(e.target.value)}
/>
<input
className="il-input"
placeholder="Short Note"
value={msNote}
onChange={(e) => setMsNote(e.target.value)}
/>
</div>
<button
type="button"
className="mandir-btn"
onClick={() => {
if (!msDay.trim()) return;
updateClub((prev) => ({
...prev,
mandir: {
...prev.mandir,
schedules: [
{
id: ms-${Date.now()}`,
dayLabel: msDay.trim(),
date: msDay.trim(),
time: msTime.trim(),
meetupPoint: msMeetup.trim(),
note: msNote.trim(),
rsvps: [{ fullName: session.fullName, status: "coming" }],
},
...prev.mandir.schedules,
],
},
}));
setMsDay("");
setMsNote("");
showToast("Mandir Visit Scheduled!");
}}
>
<Plus size={14} /> Add Visit Schedule
</button>
</div>
)}

{/* PRASAD, RIDES & MINI-POLL /}
{mandirSubTab === "extras" && (
<div className="stack">
{/ Prasad List */}
<div className="mandir-card stack">
<h3 className="section-title" style={{ color: "#fde047" }}>
Prasad & Offerings List
</h3>
{club.mandir.offerings.map((of) => (
<div key={of.id} className="sub-card row-between">
<div>
<strong>{of.item}</strong> — {of.assignedTo}
</div>
<button
type="button"
className={of.done ? "emerald-btn" : "ghost-pill"}
onClick={() =>
updateClub((prev) => ({
...prev,
mandir: {
...prev.mandir,
offerings: prev.mandir.offerings.map((i) =>
i.id === of.id ? { ...i, done: !i.done } : i
),
},
}))
}
>
{of.done ? "Done" : "Pending"}
</button>
</div>
))}
<div className="grid-3">
<input
className="il-input"
placeholder="Prasad / Flowers"
value={moItem}
onChange={(e) => setMoItem(e.target.value)}
/>
<select
className="il-select"
value={moPerson}
onChange={(e) => setMoPerson(e.target.value)}
>
{gmAllowedNames.map((n) => (
<option key={n} value={n}>
{n}
</option>
))}
</select>
<button
type="button"
className="mandir-btn"
onClick={() => {
if (!moItem.trim()) return;
updateClub((prev) => ({
...prev,
mandir: {
...prev.mandir,
offerings: [
...prev.mandir.offerings,
{ id: mo-${Date.now()}`, item: moItem.trim(), assignedTo: moPerson, done: false },
 ],
},
}));
setMoItem("");
}}
>
Add
</button>
</div>
</div>

{/* Bike Ride-Share */}
<div className="mandir-card stack">
<h3 className="section-title" style={{ color: "#fde047" }}>
<Bike size={17} /> Bike / Scooty Ride-Share
</h3>
{club.mandir.rides.map((r) => (
<div key={r.id} className="sub-card row-between">
<div>
<strong>
{r.driverName} ({r.vehicle})
</strong>
<div className="muted-text">
Free Seats: {r.seatsFree} • Riders: {r.passengers.join(", ") || "None"}
</div>
</div>
<button
type="button"
className="mandir-btn"
onClick={() =>
updateClub((prev) => ({
...prev,
mandir: {
...prev.mandir,
rides: prev.mandir.rides.map((item) => {
if (item.id !== r.id) return item;
const already = item.passengers.includes(session.fullName);
if (already) {
return {
...item,
seatsFree: item.seatsFree + 1,
passengers: item.passengers.filter((p) => p !== session.fullName),
};
}
if (item.seatsFree <= 0) return item;
return {
...item,
seatsFree: item.seatsFree - 1,
passengers: [...item.passengers, session.fullName],
};
}),
},
}))
}
>
{r.passengers.includes(session.fullName) ? "Leave Ride" : "Join Ride"}
</button>
</div>
))}
<div className="grid-3">
<input
className="il-input"
placeholder="Vehicle (Activa / Bike)"
value={mrVehicle}
onChange={(e) => setMrVehicle(e.target.value)}
/>
<input
type="number"
className="il-input"
min={1}
max={4}
value={mrSeats}
onChange={(e) => setMrSeats(Number(e.target.value))}
/>
<button
type="button"
className="mandir-btn"
onClick={() =>
updateClub((prev) => ({
...prev,
mandir: {
...prev.mandir,
rides: [
...prev.mandir.rides,
{
id: mr-${Date.now()}`,
driverName: session.fullName,
vehicle: mrVehicle.trim() || "Scooty",
seatsFree: Math.max(1, mrSeats),
passengers: [],
},
],
},
}))
}
>
Offer Ride
</button>
</div>
</div>

{/* Mandir Mini-Poll */}
<div className="mandir-card stack">
<h3 className="section-title" style={{ color: "#fde047" }}>
<Vote size={17} /> {club.mandir.poll.question}
</h3>
{club.mandir.poll.options.map((opt) => (
<button
key={opt.id}
type="button"
className="sub-card row-between"
style={{ color: "#fff", cursor: "pointer", textAlign: "left" }}
onClick={() =>
updateClub((prev) => ({
...prev,
mandir: {
...prev.mandir,
poll: {
...prev.mandir.poll,
options: prev.mandir.poll.options.map((o) => ({
...o,
voters:
o.id === opt.id
? [...o.voters.filter((v) => v !== session.fullName), session.fullName]
: o.voters.filter((v) => v !== session.fullName),
})),
},
},
}))
}
>
<span>{opt.label}</span>
<span className="status-pill pill-gold">{opt.voters.length} votes</span>
</button>
))}
</div>
</div>
)}
</div>
)}

{/* =========================================
MODALS (ADMIN PIN, WICKET, SWAP, PASSWORD, DUE REMINDER, MILESTONE)
========================================= */}

{/* 1. Admin PIN Modal (450718) */}
{pinModalOpen && (
<div className="modal-backdrop">
<form onSubmit={handlePinSubmit} className="modal-box stack">
<div className="row-between">
<h3 className="section-title" style={{ margin: 0 }}>
<Shield size={18} /> Admin PIN Required
</h3>
<button type="button" className="ghost-pill" onClick={() => setPinModalOpen(false)}>
<X size={14} />
</button>
</div>
<div className="muted-text">Enter the 6-digit Indore Legends Admin PIN to edit.</div>
<input
type="password"
inputMode="numeric"
className="il-input"
placeholder="Enter Admin PIN"
value={pinInput}
onChange={(e) => setPinInput(e.target.value)}
autoFocus
/>
{pinError && <span className="status-pill pill-coral">{pinError}</span>}
<button type="submit" className="hype-btn">
<Unlock size={15} /> Verify PIN
</button>
</form>
</div>
)}

{/* 2. Wicket Modal */}
{wicketModalOpen && activeMatch && (
<div className="modal-backdrop">
<div className="modal-box stack">
<div className="row-between">
<h3 className="section-title" style={{ margin: 0, color: "var(--coral)" }}>
Wicket Fallen!
</h3>
<button type="button" className="ghost-pill" onClick={() => setWicketModalOpen(false)}>
<X size={14} />
</button>
</div>
<div>
<label className="field-label">Dismissal Type</label>
<select
className="il-select"
value={wicketType}
onChange={(e) => setWicketType(e.target.value as BallEvent["wicketType"])}
>
<option value="Bowled">Bowled</option>
<option value="Caught">Caught</option>
<option value="Run Out">Run Out</option>
<option value="LBW">LBW</option>
<option value="Stumped">Stumped</option>
<option value="Retired Hurt">Retired Hurt</option>
</select>
</div>
<div>
<label className="field-label">Next Batter In</label>
<select
className="il-select"
value={nextBatterId}
onChange={(e) => setNextBatterId(e.target.value)}
>
{club.players.map((p) => (
<option key={p.id} value={p.id}>
{p.fullName}
</option>
))}
</select>
</div>
<button
type="button"
className="coral-btn"
onClick={() => {
setWicketModalOpen(false);
recordDelivery({ isWicket: true, wType: wicketType, replacementBatterId: nextBatterId });
}}
>
Confirm Wicket
</button>
</div>
</div>
)}

{/* 3. Retired Hurt / Mid-Over Swap Modal */}
{swapModalOpen && activeMatch && (
<div className="modal-backdrop">
<div className="modal-box stack">
<div className="row-between">
<h3 className="section-title" style={{ margin: 0 }}>
<RefreshCw size={16} /> Mid-Over Swap / Retired Hurt
</h3>
<button type="button" className="ghost-pill" onClick={() => setSwapModalOpen(false)}>
<X size={14} />
</button>
</div>
<div>
<label className="field-label">Striker</label>
<select
className="il-select"
value={activeMatch.strikerId}
onChange={(e) =>
requireAdminPin(() =>
updateClub((prev) => ({
...prev,
activeMatch: prev.activeMatch ? { ...prev.activeMatch, strikerId: e.target.value } : null,
}))
)
}
>
{club.players.map((p) => (
<option key={p.id} value={p.id}>
{p.fullName}
</option>
))}
</select>
</div>
<div>
<label className="field-label">Non-Striker</label>
<select
className="il-select"
value={activeMatch.nonStrikerId}
onChange={(e) =>
requireAdminPin(() =>
updateClub((prev) => ({
...prev,
activeMatch: prev.activeMatch ? { ...prev.activeMatch, nonStrikerId: e.target.value } : null,
}))
)
}
>
{club.players.map((p) => (
<option key={p.id} value={p.id}>
{p.fullName}
</option>
))}
</select>
</div>
<div>
<label className="field-label">Bowler</label>
<select
className="il-select"
value={activeMatch.bowlerId}
onChange={(e) =>
requireAdminPin(() =>
updateClub((prev) => ({
...prev,
activeMatch: prev.activeMatch ? { ...prev.activeMatch, bowlerId: e.target.value } : null,
}))
)
}
>
{club.players.map((p) => (
<option key={p.id} value={p.id}>
{p.fullName}
</option>
))}
</select>
</div>
<button type="button" className="hype-btn" onClick={() => setSwapModalOpen(false)}>
Done
</button>
</div>
</div>
)}

{/* 4. Change Normal Password Modal */}
{passModalOpen && (
<div className="modal-backdrop">
<form onSubmit={handleChangeNormalPassword} className="modal-box stack">
<div className="row-between">
<h3 className="section-title" style={{ margin: 0 }}>
<KeyRound size={17} /> Change Normal Password
</h3>
<button type="button" className="ghost-pill" onClick={() => setPassModalOpen(false)}>
<X size={14} />
</button>
</div>
<div className="muted-text">
Normal password can be updated anytime. Admin passwords are permanently locked.
</div>
<input
type="password"
className="il-input"
placeholder="Current Normal Password"
value={oldPassInput}
onChange={(e) => setOldPassInput(e.target.value)}
/>
<input
type="password"
className="il-input"
placeholder="New Normal Password"
value={newPassInput}
onChange={(e) => setNewPassInput(e.target.value)}
/>
{passMsg && <span className="status-pill pill-cyan">{passMsg}</span>}
<button type="submit" className="hype-btn">
Save Normal Password
</button>
</form>
</div>
)}

{/* 5. In-App Due Reminder Message Popup (Appears Automatically on Sign-In) */}
{duePopupEntries.length > 0 && (
<div className="modal-backdrop">
<div className="modal-box stack" style={{ borderColor: "#fb7185" }}>
<div className="row-between">
<h3 className="section-title" style={{ margin: 0, color: "var(--coral)" }}>
<AlertTriangle size={18} /> Pending Dues Reminder!
</h3>
<button type="button" className="ghost-pill" onClick={() => setDuePopupEntries([])}>
<X size={14} />
</button>
</div>
<div className="muted-text">
Hey <strong>{session.fullName}</strong>, you have pending club dues to clear before the next turf match:
</div>
{duePopupEntries.map((d) => (
<div key={d.id} className="sub-card row-between">
<span>{d.reason}</span>
<strong className="il-nums" style={{ color: "var(--coral)" }}>
₹{d.amount}
</strong>
</div>
))}
<div className="row-between">
<button
type="button"
className="hype-btn"
onClick={() => {
setDuePopupEntries([]);
setActiveTab("money");
}}
>
Open Money Tab
</button>
<button type="button" className="ghost-pill" onClick={() => setDuePopupEntries([])}>
Got It
</button>
</div>
</div>
</div>
)}

{/* 6. Milestone Celebration Popup */}
{milestoneBanner && (
<div className="modal-backdrop" onClick={() => setMilestoneBanner(null)}>
<div
className="modal-box stack"
style={{
textAlign: "center",
borderColor: "#facc15",
background: "linear-gradient(155deg, #1e1b4b, #0f172a)",
}}
>
<div style={{ fontSize: "2.4rem" }}>🏆🔥🏏</div>
<h2 style={{ margin: 0, color: "var(--gold)", fontWeight: 900 }}>{milestoneBanner.title}</h2>
<p style={{ margin: 0, color: "#fff" }}>{milestoneBanner.subtitle}</p>
<button type="button" className="hype-btn" onClick={() => setMilestoneBanner(null)}>
Keep Playing!
</button>
</div>
</div>
)}

{/* BOTTOM NAVIGATION BAR */}
<nav className="bottom-nav">
{navItems.map(({ id, label, icon: Icon, isMandir }) => (
<button
key={id}
type="button"
className={nav-item ${isMandir ? "mandir-nav" : ""} ${activeTab === id ? "active" : ""}}
onClick={() => setActiveTab(id)}
>
<Icon size={17} />
<span>{label}</span>
</button>
))}
</nav>
</div>
);
}
