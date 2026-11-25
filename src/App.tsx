```react
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Home,
  Users,
  Trophy,
  Calendar,
  Wallet,
  BarChart3,
  Award,
  Settings,
  Bot,
  Flame,
  Bell,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Crown,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  Share2,
  Shuffle,
  Coins,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  MessageSquare,
  MapPin,
  Clock,
  Check,
  TrendingUp,
  Zap,
  Star,
  Receipt,
  ClipboardCheck,
  Trash2,
  Info,
  MoreHorizontal,
  ArrowLeftRight,
  Key,
  RefreshCw
} from 'lucide-react';

// ============================================================================
// 1. CONSTANTS, CREDENTIALS & THEME CONFIGURATION
// ============================================================================
const STORAGE_KEY = 'indore_legends_fresh_zero_v1';
const ADMIN_PIN = '450718';

const THEMES = {
  royal: {
    id: 'royal',
    name: 'Royal Blue',
    orb: 'from-blue-400 via-blue-600 to-indigo-800',
    accentText: 'text-cyan-400',
    accentBorder: 'border-cyan-400/35',
    accentGlow: 'shadow-[0_0_24px_rgba(56,189,248,0.20)]',
    heroGradient: 'from-[#061233] via-[#0a1d4d] to-[#040919]',
    cardBg: 'bg-[#0a1636]/82',
    activePill:
      'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.42)]',
    chartPrimary: '#38bdf8',
    chartSecondary: '#fbbf24'
  },
  gold: {
    id: 'gold',
    name: 'Championship Gold',
    orb: 'from-amber-300 via-amber-500 to-orange-700',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-400/40',
    accentGlow: 'shadow-[0_0_24px_rgba(251,191,36,0.22)]',
    heroGradient: 'from-[#1c1305] via-[#261a08] to-[#070812]',
    cardBg: 'bg-[#17120b]/85',
    activePill:
      'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 text-slate-950 shadow-[0_0_22px_rgba(251,191,36,0.52)]',
    chartPrimary: '#fbbf24',
    chartSecondary: '#f97316'
  },
  emerald: {
    id: 'emerald',
    name: 'Pitch Emerald',
    orb: 'from-emerald-300 via-emerald-500 to-teal-800',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-400/35',
    accentGlow: 'shadow-[0_0_24px_rgba(52,211,153,0.20)]',
    heroGradient: 'from-[#041d18] via-[#062b26] to-[#040b14]',
    cardBg: 'bg-[#081f1c]/82',
    activePill:
      'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-slate-950 shadow-[0_0_22px_rgba(52,211,153,0.42)]',
    chartPrimary: '#34d399',
    chartSecondary: '#fbbf24'
  }
};

// Base roster definitions (strictly zeroed stats, credentials never rendered in UI)
const SQUAD_ROSTER = [
  { id: 'p1', name: 'Gaurav Lalwani', jersey: '45', role: 'All-Rounder', isAdmin: true, isGM: true, defaultPass: 'Admin-045', adminPass: 'OQLM45' },
  { id: 'p2', name: 'Granth Sharma', jersey: '07', role: 'All-Rounder', isAdmin: true, isGM: true, defaultPass: 'Admin-07', adminPass: 'OQLM07' },
  { id: 'p3', name: 'Adhyan Upadhyay', jersey: '01', role: 'Batsman', isAdmin: false, isGM: false, defaultPass: 'Adhu001' },
  { id: 'p4', name: 'Virat Chaudary', jersey: '18', role: 'Batsman', isAdmin: false, isGM: true, defaultPass: 'Viru002' },
  { id: 'p5', name: 'Agam Khandelwal', jersey: '03', role: 'Bowler', isAdmin: false, isGM: false, defaultPass: 'Agm003' },
  { id: 'p6', name: 'Aditya Rathore', jersey: '04', role: 'All-Rounder', isAdmin: false, isGM: true, defaultPass: 'Abhi004' },
  { id: 'p7', name: 'Anuj Mishra', jersey: '05', role: 'Bowler', isAdmin: false, isGM: false, defaultPass: 'Anu005' },
  { id: 'p8', name: 'Aadarsh Mishra', jersey: '06', role: 'Batsman', isAdmin: false, isGM: false, defaultPass: 'Ada006' },
  { id: 'p9', name: 'Atharv Solanki', jersey: '08', role: 'Wicket-Keeper', isAdmin: false, isGM: true, defaultPass: 'Aathu007' },
  { id: 'p10', name: 'Ashwin Gagrani', jersey: '99', role: 'All-Rounder', isAdmin: false, isGM: true, defaultPass: 'Shivu008' },
  { id: 'p11', name: 'Rudraksh Soni', jersey: '09', role: 'Bowler', isAdmin: false, isGM: false, defaultPass: 'Rudu009' },
  { id: 'p12', name: 'Naitik Arya', jersey: '10', role: 'Batsman', isAdmin: false, isGM: true, defaultPass: 'Nai010' },
  { id: 'p13', name: 'Harshit Nagpal', jersey: '11', role: 'All-Rounder', isAdmin: false, isGM: true, defaultPass: 'Harsh011' }
];

// Creates a completely zeroed player record
function makeZeroPlayer(base) {
  return {
    id: base.id,
    name: base.name,
    jersey: base.jersey,
    role: base.role,
    isAdmin: base.isAdmin,
    isGM: base.isGM,
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
    funAward: 'Squad Member'
  };
}

// Creates a fresh zero-state club workspace ('il' = 13 players, 'gm' = 8 GM players)
function createZeroWorkspace(clubKey) {
  const isGM = clubKey === 'gm';
  const roster = isGM ? SQUAD_ROSTER.filter((p) => p.isGM) : SQUAD_ROSTER;
  return {
    clubKey,
    clubName: isGM ? 'Ganesh Mandir Cricket Club' : 'Indore Legends',
    shortName: isGM ? 'Ganesh Mandir' : 'Indore Legends',
    announcement: isGM
      ? 'GANESH MANDIR CRICKET ZONE: Create a match, vote in attendance, and track club stats from scratch.'
      : 'INDORE LEGENDS HUB: Fresh season initialized. Create your first match or mark attendance below.',
    players: roster.map(makeZeroPlayer),
    scheduledMatch: null,
    liveMatch: null,
    matchHistory: [],
    treasury: [],
    poll: [],
    messages: [],
    recentResults: [] // Array of 'W' | 'L' | 'T'
  };
}

function createInitialAppState() {
  return {
    clubs: {
      il: createZeroWorkspace('il'),
      gm: createZeroWorkspace('gm')
    },
    customPasswords: {},
    themeKey: 'royal'
  };
}

function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialAppState();
    const parsed = JSON.parse(raw);
    const base = createInitialAppState();
    return {
      clubs: {
        il: { ...base.clubs.il, ...(parsed?.clubs?.il || {}) },
        gm: { ...base.clubs.gm, ...(parsed?.clubs?.gm || {}) }
      },
      customPasswords: parsed?.customPasswords || {},
      themeKey: parsed?.themeKey && THEMES[parsed.themeKey] ? parsed.themeKey : 'royal'
    };
  } catch {
    return createInitialAppState();
  }
}

// ============================================================================
// 2. PURE HELPER FUNCTIONS
// ============================================================================
const uid = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatOvers = (legalBalls) => `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
const calcPoints = (p) => p.runs + p.wickets * 24 + p.sixes * 5;

function defaultMatchDateTime() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T06:30`;
}

// Strict password verification — never leaks passwords
function verifyCredentials(playerId, rawInput, customPasswords) {
  const base = SQUAD_ROSTER.find((p) => p.id === playerId);
  const input = rawInput.trim();
  if (!base || !input) return { ok: false, asAdmin: false };

  // Locked admin password check
  if (base.isAdmin && base.adminPass) {
    const normIn = input.replace(/^0/, 'O').toUpperCase();
    const normAdm = base.adminPass.replace(/^0/, 'O').toUpperCase();
    if (input === base.adminPass || normIn === normAdm) {
      return { ok: true, asAdmin: true };
    }
  }

  // Normal password check (supports custom user-changed password)
  const activePass = customPasswords[base.id] || base.defaultPass;
  if (input === activePass) {
    return { ok: true, asAdmin: Boolean(base.isAdmin) };
  }

  // Special alias for Rudraksh Soni if password has not been customized
  if (!customPasswords[base.id] && base.id === 'p11' && input === 'Rudu09') {
    return { ok: true, asAdmin: false };
  }

  return { ok: false, asAdmin: false };
}

function splitBalancedTeams(players) {
  const sorted = [...players].sort((a, b) => {
    const diff = calcPoints(b) - calcPoints(a);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
  const teamA = [];
  const teamB = [];
  sorted.forEach((p, idx) => {
    if (idx % 4 === 0 || idx % 4 === 3) teamA.push(p);
    else teamB.push(p);
  });
  return { teamA, teamB };
}

function pickTeamLeaders(teamPlayers) {
  if (teamPlayers.length === 0) return { captain: '', viceCaptain: '' };
  if (teamPlayers.length === 1) return { captain: teamPlayers[0].name, viceCaptain: teamPlayers[0].name };
  const shuffled = [...teamPlayers].sort(() => Math.random() - 0.5);
  return { captain: shuffled[0].name, viceCaptain: shuffled[1].name };
}

// ============================================================================
// 3. CRISP CUSTOM SVG GRAPHICS (ZERO EXTERNAL BROKEN IMAGE URLS)
// ============================================================================
const LionCrestSVG = ({ size = 54, onClick, isGM = false }) => (
  <div
    onClick={onClick}
    className="relative inline-flex items-center justify-center select-none cursor-pointer group shrink-0"
    style={{ width: size, height: size }}
    title={isGM ? 'Ganesh Mandir Cricket Crest' : 'Indore Legends Golden Lion Crest'}
  >
    <div
      className={`absolute inset-0 rounded-full blur-md transition-all ${
        isGM ? 'bg-orange-500/30 group-hover:bg-orange-400/50' : 'bg-amber-400/25 group-hover:bg-amber-400/45'
      }`}
    />
    <svg viewBox="0 0 100 100" className="relative w-full h-full drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">
      <defs>
        <linearGradient id={isGM ? 'gmGoldGrad' : 'ilGoldGrad'} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor={isGM ? '#fb923c' : '#f59e0b'} />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="crestNavyBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isGM ? '#3b1506' : '#0f2557'} />
          <stop offset="100%" stopColor="#040a1d" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="52" r="44" fill="url(#crestNavyBg)" stroke={`url(#${isGM ? 'gmGoldGrad' : 'ilGoldGrad'})`} strokeWidth="3.5" />
      <circle cx="50" cy="52" r="38" fill="none" stroke={isGM ? '#fb923c' : '#38bdf8'} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 3" />
      {/* Crown */}
      <path d="M34 26 L39 14 L46 21 L50 11 L54 21 L61 14 L66 26 Z" fill={`url(#${isGM ? 'gmGoldGrad' : 'ilGoldGrad'})`} />
      <rect x="35" y="27" width="30" height="3.5" rx="1.5" fill="#fef08a" />
      {/* Stylized Lion Shield */}
      <path
        d="M50 33 C36 33 27 42 27 55 C27 68 37 79 50 84 C63 79 73 68 73 55 C73 42 64 33 50 33 Z"
        fill={`url(#${isGM ? 'gmGoldGrad' : 'ilGoldGrad'})`}
        fillOpacity="0.22"
        stroke={`url(#${isGM ? 'gmGoldGrad' : 'ilGoldGrad'})`}
        strokeWidth="2.2"
      />
      <path d="M29 47 L22 51 L28 57 L23 64 L32 67" fill="none" stroke={`url(#${isGM ? 'gmGoldGrad' : 'ilGoldGrad'})`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M71 47 L78 51 L72 57 L77 64 L68 67" fill="none" stroke={`url(#${isGM ? 'gmGoldGrad' : 'ilGoldGrad'})`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="39,49 45,51 41,54" fill="#fef08a" />
      <polygon points="61,49 55,51 59,54" fill="#fef08a" />
      <path d="M46 58 L54 58 L50 64 Z" fill={`url(#${isGM ? 'gmGoldGrad' : 'ilGoldGrad'})`} />
      <path d="M43 68 Q50 73 57 68" fill="none" stroke="#fef08a" strokeWidth="2.4" strokeLinecap="round" />
      <text x="50" y="94" textAnchor="middle" fill="#fde68a" fontSize="9.5" fontWeight="900" letterSpacing="1.6">
        {isGM ? 'GM' : 'IL'}
      </text>
    </svg>
  </div>
);

const PlayerAvatarSVG = ({ name, jersey, role, size = 'md' }) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const dims = size === 'lg' ? 'w-24 h-24' : size === 'sm' ? 'w-10 h-10' : 'w-16 h-16';
  const accent =
    role === 'Batsman'
      ? '#38bdf8'
      : role === 'Bowler'
      ? '#a855f7'
      : role === 'Wicket-Keeper'
      ? '#34d399'
      : '#fbbf24';

  return (
    <div className={`relative ${dims} shrink-0 select-none`}>
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]">
        <defs>
          <linearGradient id={`j_${jersey}_${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="60%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id={`a_${jersey}_${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.34" />
            <stop offset="100%" stopColor="#050b1e" stopOpacity="0.92" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="112" height="112" rx="22" fill={`url(#a_${jersey}_${size})`} stroke="#fbbf24" strokeOpacity="0.45" strokeWidth="2.2" />
        <circle cx="60" cy="40" r="18" fill="#e2b48b" />
        <path d="M42 38 C42 24 51 19 60 19 C69 19 78 24 78 38 C75 30 67 27 60 27 C53 27 45 30 42 38 Z" fill="#0f172a" />
        <path d="M22 114 C24 82 36 69 60 69 C84 69 96 82 98 114 Z" fill={`url(#j_${jersey}_${size})`} stroke="#fbbf24" strokeWidth="2" />
        <path d="M47 69 L60 82 L73 69" fill="none" stroke="#fbbf24" strokeWidth="3.5" strokeLinejoin="round" />
        <text x="60" y="103" textAnchor="middle" fill="#fde68a" fontSize="17" fontWeight="900" fontFamily="system-ui">
          {size === 'sm' ? initials : `#${jersey}`}
        </text>
      </svg>
    </div>
  );
};

const WinRateDonutSVG = ({ pct = 0, primary = '#38bdf8', secondary = '#fbbf24' }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, pct)) / 100) * circ;
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
      <defs>
        <linearGradient id="wrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={secondary} />
          <stop offset="100%" stopColor={primary} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="9" />
      {pct > 0 && (
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="url(#wrGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 50 50)"
        />
      )}
      <text x="50" y="48" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="900">
        {pct}%
      </text>
      <text x="50" y="62" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700">
        Win Rate
      </text>
    </svg>
  );
};

const FinanceDonutSVG = ({ slices, centerLabel }) => {
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0);
  const r = 52;
  const circ = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <svg viewBox="0 0 140 140" className="w-36 h-36 shrink-0">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(148,163,184,0.16)" strokeWidth="18" />
        {total > 0 &&
          slices.map((s) => {
            const val = Math.max(0, s.value);
            if (!val) return null;
            const frac = val / total;
            const dash = frac * circ;
            const offset = -acc * circ;
            acc += frac;
            return (
              <circle
                key={s.label}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="18"
                strokeDasharray={`${dash} ${circ}`}
                strokeDashoffset={offset}
                transform="rotate(-90 70 70)"
              />
            );
          })}
        <text x="70" y="65" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
          CLUB FUND
        </text>
        <text x="70" y="83" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900">
          {centerLabel}
        </text>
      </svg>

      <div className="grid grid-cols-1 gap-2 w-full max-w-[240px]">
        {slices.map((s) => {
          const pct = total > 0 ? Math.round((Math.max(0, s.value) / total) * 100) : 0;
          return (
            <div key={s.label} className="flex items-center justify-between text-xs sm:text-sm bg-white/5 px-3 py-2 rounded-xl border border-white/10">
              <span className="flex items-center gap-2 text-slate-200 font-medium">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="font-bold text-white">
                Rs. {s.value} <span className="text-slate-400 text-[11px]">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 4. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // --- PERSISTED APP STATE ---
  const [appState, setAppState] = useState(() => loadAppState());
  const [session, setSession] = useState(null); // { playerId, isAdminSession }
  const [activeClubKey, setActiveClubKey] = useState('il'); // 'il' | 'gm'
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- LOGIN FORM STATE (NORMAL LOGIN ONLY, ZERO HINTS) ---
  const [loginPlayerId, setLoginPlayerId] = useState(SQUAD_ROSTER[0].id);
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // --- GANESH MANDIR UNLOCK STATE ---
  const [gmUnlocked, setGmUnlocked] = useState(false);
  const [gmModalOpen, setGmModalOpen] = useState(false);
  const [gmUnlockPass, setGmUnlockPass] = useState('');
  const [gmUnlockError, setGmUnlockError] = useState('');
  const crestTapsRef = useRef(0);
  const crestTimerRef = useRef(null);

  // --- ADMIN PIN MODAL STATE (NEVER SHOWS PIN HINT) ---
  const [pinModal, setPinModal] = useState({ open: false, title: '', onConfirm: null });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // --- UI DRAWERS, TOASTS & CLOCK ---
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // --- SQUAD & PROFILE MODAL STATE ---
  const [squadSearch, setSquadSearch] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [profileSubTab, setProfileSubTab] = useState('stats');
  const [editAwardDraft, setEditAwardDraft] = useState('');

  // --- CREATE MATCH WIZARD STATE ---
  const [createMatchOpen, setCreateMatchOpen] = useState(false);
  const [wizTitle, setWizTitle] = useState('Indore Legends Match');
  const [wizDateTime, setWizDateTime] = useState(() => defaultMatchDateTime());
  const [wizOvers, setWizOvers] = useState(10);
  const [wizTeamAName, setWizTeamAName] = useState('Legends XI');
  const [wizTeamBName, setWizTeamBName] = useState('Strikers XI');
  const [wizSelectedIds, setWizSelectedIds] = useState([]);
  const [wizTeamAIds, setWizTeamAIds] = useState([]);
  const [wizTeamBIds, setWizTeamBIds] = useState([]);
  const [wizTeamACap, setWizTeamACap] = useState('');
  const [wizTeamAVC, setWizTeamAVC] = useState('');
  const [wizTeamBCap, setWizTeamBCap] = useState('');
  const [wizTeamBVC, setWizTeamBVC] = useState('');
  const [wizTossWinner, setWizTossWinner] = useState('');
  const [wizTossDecision, setWizTossDecision] = useState('BAT');
  const [coinSpinning, setCoinSpinning] = useState(false);
  const [coinSide, setCoinSide] = useState('');
  const [wizChecklist, setWizChecklist] = useState([
    { id: 'c1', label: 'Wind Balls (2+ Extra)', done: false },
    { id: 'c2', label: 'Bats & Grips Ready', done: false },
    { id: 'c3', label: 'Stumps & Bails Packed', done: false },
    { id: 'c4', label: 'Drinking Water', done: false }
  ]);
  const [newCheckLabel, setNewCheckLabel] = useState('');

  // --- LIVE SCORER STATE ---
  const [matchSubTab, setMatchSubTab] = useState('upcoming'); // upcoming | live | history
  const [wicketType, setWicketType] = useState('Bowled');
  const [swapBowlerOpen, setSwapBowlerOpen] = useState(false);
  const [swapBowlerName, setSwapBowlerName] = useState('');
  const [umpireBanner, setUmpireBanner] = useState('');
  const [milestoneBanner, setMilestoneBanner] = useState('');

  // --- LEADERBOARD STATE ---
  const [lbTab, setLbTab] = useState('team'); // team | batting | bowling

  // --- FINANCE FORM STATE ---
  const [trTitle, setTrTitle] = useState('');
  const [trType, setTrType] = useState('CREDIT');
  const [trAmount, setTrAmount] = useState('');
  const [trMember, setTrMember] = useState('All Squad');

  // --- CHAT STATE ---
  const [chatInput, setChatInput] = useState('');

  // --- LEGENDBOT AI + VOICE STATE ---
  const [voiceTts, setVoiceTts] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    {
      id: 'bot_intro',
      role: 'bot',
      text: 'Namaste Legend! Ask me about the live score, upcoming match, Orange/Purple Cap, Club Fund, Attendance Poll, or any player stats. Tap the mic for Voice Input!',
      time: nowTime()
    }
  ]);
  const recognitionRef = useRef(null);

  // --- SETTINGS STATE ---
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [passFeedback, setPassFeedback] = useState('');
  const [announcementDraft, setAnnouncementDraft] = useState('');

  // Persist to localStorage on every state update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch {
      // Ignore storage quota errors
    }
  }, [appState]);

  // Live clock for countdown timer
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = (msg, tone = 'gold') => setToast({ msg, tone, id: Date.now() });

  // Active workspace & theme
  const club = appState.clubs[activeClubKey] || appState.clubs.il;
  const isGMMode = activeClubKey === 'gm';
  const theme = THEMES[appState.themeKey] || THEMES.royal;

  // Keep announcement draft synced when switching workspace
  useEffect(() => {
    setAnnouncementDraft(club.announcement);
  }, [activeClubKey, club.announcement]);

  // Helper to update only the active club workspace
  const updateClub = (updater) => {
    setAppState((prev) => {
      const currentClub = prev.clubs[activeClubKey];
      const nextClub = typeof updater === 'function' ? updater(currentClub) : updater;
      return {
        ...prev,
        clubs: {
          ...prev.clubs,
          [activeClubKey]: nextClub
        }
      };
    });
  };

  // Current authenticated user record
  const authBase = session ? SQUAD_ROSTER.find((p) => p.id === session.playerId) || null : null;
  const currentUser = session
    ? club.players.find((p) => p.id === session.playerId) || appState.clubs.il.players.find((p) => p.id === session.playerId) || null
    : null;
  const isAdmin = Boolean(authBase?.isAdmin);

  // Derived metrics for active workspace
  const financeSummary = useMemo(() => {
    const credits = club.treasury.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const fines = club.treasury.filter((t) => t.type === 'FINE').reduce((s, t) => s + t.amount, 0);
    const advances = club.treasury.filter((t) => t.type === 'ADVANCE').reduce((s, t) => s + t.amount, 0);
    const expenses = club.treasury.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    return { credits, fines, advances, expenses, net: credits + fines + advances - expenses };
  }, [club.treasury]);

  const winRatePct = useMemo(() => {
    if (!club.recentResults || club.recentResults.length === 0) return 0;
    const wins = club.recentResults.filter((r) => r === 'W').length;
    return Math.round((wins / club.recentResults.length) * 100);
  }, [club.recentResults]);

  const orangeCap = useMemo(() => {
    const sorted = [...club.players].sort((a, b) => b.runs - a.runs);
    return sorted[0] && sorted[0].runs > 0 ? sorted[0] : null;
  }, [club.players]);

  const purpleCap = useMemo(() => {
    const sorted = [...club.players].sort((a, b) => b.wickets - a.wickets);
    return sorted[0] && sorted[0].wickets > 0 ? sorted[0] : null;
  }, [club.players]);

  const rankedPlayers = useMemo(() => {
    const arr = [...club.players];
    if (lbTab === 'batting') return arr.sort((a, b) => b.runs - a.runs || a.name.localeCompare(b.name));
    if (lbTab === 'bowling') return arr.sort((a, b) => b.wickets - a.wickets || a.name.localeCompare(b.name));
    return arr.sort((a, b) => calcPoints(b) - calcPoints(a) || a.name.localeCompare(b.name));
  }, [club.players, lbTab]);

  const scheduledCountdown = useMemo(() => {
    if (!club.scheduledMatch?.dateTime) return null;
    const target = new Date(club.scheduledMatch.dateTime).getTime();
    if (Number.isNaN(target)) return null;
    const diff = Math.max(0, target - nowMs);
    const sec = Math.floor(diff / 1000);
    return {
      days: String(Math.floor(sec / 86400)).padStart(2, '0'),
      hrs: String(Math.floor((sec % 86400) / 3600)).padStart(2, '0'),
      min: String(Math.floor((sec % 3600) / 60)).padStart(2, '0'),
      sec: String(sec % 60).padStart(2, '0')
    };
  }, [club.scheduledMatch, nowMs]);

  const selectedProfile = useMemo(
    () => club.players.find((p) => p.id === selectedProfileId) || null,
    [club.players, selectedProfileId]
  );

  // ============================================================================
  // 5. AUTHENTICATION, ADMIN PIN & GANESH MANDIR PORTAL HANDLERS
  // ============================================================================
  const handleLogin = (e) => {
    e.preventDefault();
    const res = verifyCredentials(loginPlayerId, loginPassword, appState.customPasswords);
    if (!res.ok) {
      setLoginError('Incorrect password. Please try again.');
      return;
    }
    setSession({ playerId: loginPlayerId, isAdminSession: res.asAdmin });
    setLoginPassword('');
    setLoginError('');
    setActiveClubKey('il');
    setActiveTab('dashboard');
    const member = SQUAD_ROSTER.find((p) => p.id === loginPlayerId);
    notify(`Welcome back, ${member?.name || 'Legend'}!`, 'gold');
  };

  const handleLogout = () => {
    setSession(null);
    setGmUnlocked(false);
    setActiveClubKey('il');
    setActiveTab('dashboard');
    setMoreDrawerOpen(false);
  };

  const requireAdminPin = (title, onConfirm) => {
    if (!isAdmin) {
      notify('Admin access required for this action.', 'rose');
      return;
    }
    setPinInput('');
    setPinError('');
    setPinModal({ open: true, title, onConfirm });
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() !== ADMIN_PIN) {
      setPinError('Incorrect Admin PIN.');
      return;
    }
    const fn = pinModal.onConfirm;
    setPinModal({ open: false, title: '', onConfirm: null });
    setPinInput('');
    setPinError('');
    if (fn) fn();
  };

  const openGaneshMandirGate = () => {
    if (!authBase?.isGM) {
      notify('Ganesh Mandir Zone is restricted to the 8 authorized G.M squad members.', 'rose');
      return;
    }
    if (gmUnlocked) {
      setActiveClubKey((prev) => (prev === 'gm' ? 'il' : 'gm'));
      setActiveTab('dashboard');
      return;
    }
    setGmUnlockPass('');
    setGmUnlockError('');
    setGmModalOpen(true);
  };

  const handleCrestTap = () => {
    crestTapsRef.current += 1;
    if (crestTimerRef.current) clearTimeout(crestTimerRef.current);
    if (crestTapsRef.current >= 3) {
      crestTapsRef.current = 0;
      openGaneshMandirGate();
      return;
    }
    crestTimerRef.current = setTimeout(() => {
      crestTapsRef.current = 0;
    }, 850);
  };

  const handleGmUnlockSubmit = (e) => {
    e.preventDefault();
    if (!authBase?.isGM) {
      setGmUnlockError('Restricted to authorized G.M squad members.');
      return;
    }
    const res = verifyCredentials(authBase.id, gmUnlockPass, appState.customPasswords);
    if (!res.ok) {
      setGmUnlockError('Incorrect password. Please try again.');
      return;
    }
    setGmUnlocked(true);
    setGmModalOpen(false);
    setGmUnlockPass('');
    setGmUnlockError('');
    setActiveClubKey('gm');
    setActiveTab('dashboard');
    notify('Ganesh Mandir Cricket Club Portal Unlocked!', 'gold');
  };

  // ============================================================================
  // 6. CREATE MATCH WIZARD LOGIC (WORKS FOR BOTH INDORE LEGENDS & GANESH MANDIR)
  // ============================================================================
  const openCreateMatchWizard = () => {
    const allIds = club.players.map((p) => p.id);
    const { teamA, teamB } = splitBalancedTeams(club.players);
    const lA = pickTeamLeaders(teamA);
    const lB = pickTeamLeaders(teamB);

    setWizTitle(isGMMode ? 'Ganesh Mandir Match' : 'Indore Legends Match');
    setWizDateTime(defaultMatchDateTime());
    setWizOvers(10);
    setWizTeamAName(isGMMode ? 'GM Warriors' : 'Legends XI');
    setWizTeamBName(isGMMode ? 'GM Strikers' : 'Strikers XI');
    setWizSelectedIds(allIds);
    setWizTeamAIds(teamA.map((p) => p.id));
    setWizTeamBIds(teamB.map((p) => p.id));
    setWizTeamACap(lA.captain);
    setWizTeamAVC(lA.viceCaptain);
    setWizTeamBCap(lB.captain);
    setWizTeamBVC(lB.viceCaptain);
    setWizTossWinner('');
    setWizTossDecision('BAT');
    setCoinSide('');
    setWizChecklist([
      { id: 'c1', label: 'Wind Balls (2+ Extra)', done: false },
      { id: 'c2', label: 'Bats & Grips Ready', done: false },
      { id: 'c3', label: 'Stumps & Bails Packed', done: false },
      { id: 'c4', label: 'Drinking Water', done: false }
    ]);
    setCreateMatchOpen(true);
  };

  const toggleWizardPlayer = (playerId) => {
    const already = wizSelectedIds.includes(playerId);
    let nextSelected;
    if (already) {
      nextSelected = wizSelectedIds.filter((id) => id !== playerId);
      setWizTeamAIds((prev) => prev.filter((id) => id !== playerId));
      setWizTeamBIds((prev) => prev.filter((id) => id !== playerId));
    } else {
      nextSelected = [...wizSelectedIds, playerId];
      if (wizTeamAIds.length <= wizTeamBIds.length) {
        setWizTeamAIds((prev) => [...prev, playerId]);
      } else {
        setWizTeamBIds((prev) => [...prev, playerId]);
      }
    }
    setWizSelectedIds(nextSelected);
  };

  const runAutoSplitWizard = () => {
    const selectedPlayers = club.players.filter((p) => wizSelectedIds.includes(p.id));
    if (selectedPlayers.length < 4) {
      notify('Select at least 4 players (2 per side).', 'rose');
      return;
    }
    const { teamA, teamB } = splitBalancedTeams(selectedPlayers);
    const lA = pickTeamLeaders(teamA);
    const lB = pickTeamLeaders(teamB);
    setWizTeamAIds(teamA.map((p) => p.id));
    setWizTeamBIds(teamB.map((p) => p.id));
    setWizTeamACap(lA.captain);
    setWizTeamAVC(lA.viceCaptain);
    setWizTeamBCap(lB.captain);
    setWizTeamBVC(lB.viceCaptain);
    notify('Fair teams & captains auto-assigned!', 'emerald');
  };

  const movePlayerBetweenTeams = (playerId, fromTeam) => {
    if (fromTeam === 'A') {
      setWizTeamAIds((prev) => prev.filter((id) => id !== playerId));
      setWizTeamBIds((prev) => [...prev, playerId]);
    } else {
      setWizTeamBIds((prev) => prev.filter((id) => id !== playerId));
      setWizTeamAIds((prev) => [...prev, playerId]);
    }
  };

  const flipDigitalCoin = () => {
    setCoinSpinning(true);
    setTimeout(() => {
      const side = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
      const winner = Math.random() < 0.5 ? (wizTeamAName.trim() || 'Team A') : (wizTeamBName.trim() || 'Team B');
      setCoinSide(side);
      setWizTossWinner(winner);
      setCoinSpinning(false);
    }, 700);
  };

  const buildScheduledMatchObject = () => {
    const tAName = wizTeamAName.trim() || 'Team A';
    const tBName = wizTeamBName.trim() || 'Team B';
    const teamAPlayers = club.players.filter((p) => wizTeamAIds.includes(p.id));
    const teamBPlayers = club.players.filter((p) => wizTeamBIds.includes(p.id));

    return {
      id: uid('sch'),
      title: wizTitle.trim() || (isGMMode ? 'Ganesh Mandir Match' : 'Indore Legends Match'),
      dateTime: wizDateTime || defaultMatchDateTime(),
      overs: Math.max(1, Math.min(50, Number(wizOvers) || 10)),
      teamAName: tAName,
      teamBName: tBName,
      teamAIds: teamAPlayers.map((p) => p.id),
      teamBIds: teamBPlayers.map((p) => p.id),
      teamACaptain: wizTeamACap || teamAPlayers[0]?.name || 'TBD',
      teamAViceCaptain: wizTeamAVC || teamAPlayers[1]?.name || teamAPlayers[0]?.name || 'TBD',
      teamBCaptain: wizTeamBCap || teamBPlayers[0]?.name || 'TBD',
      teamBViceCaptain: wizTeamBVC || teamBPlayers[1]?.name || teamBPlayers[0]?.name || 'TBD',
      tossWinner: wizTossWinner,
      tossDecision: wizTossDecision,
      checklist: wizChecklist
    };
  };

  const handleSaveScheduledMatch = () => {
    if (wizTeamAIds.length < 2 || wizTeamBIds.length < 2) {
      notify('Each team needs at least 2 players.', 'rose');
      return;
    }
    const scheduled = buildScheduledMatchObject();
    updateClub((prev) => ({ ...prev, scheduledMatch: scheduled }));
    setCreateMatchOpen(false);
    setMatchSubTab('upcoming');
    setActiveTab('matches');
    notify('Match scheduled! Countdown is now live on Dashboard.', 'emerald');
  };

  const launchLiveMatchFromScheduled = (sch) => {
    if (!sch) return;
    const teamAPlayers = club.players.filter((p) => sch.teamAIds.includes(p.id)).map((p) => p.name);
    const teamBPlayers = club.players.filter((p) => sch.teamBIds.includes(p.id)).map((p) => p.name);

    const aBatsFirst =
      !sch.tossWinner ||
      (sch.tossWinner === sch.teamAName && sch.tossDecision !== 'BOWL') ||
      (sch.tossWinner === sch.teamBName && sch.tossDecision === 'BOWL');

    const battingTeam = aBatsFirst ? sch.teamAName : sch.teamBName;
    const bowlingTeam = aBatsFirst ? sch.teamBName : sch.teamAName;
    const battingPlayers = aBatsFirst ? teamAPlayers : teamBPlayers;
    const bowlingPlayers = aBatsFirst ? teamBPlayers : teamAPlayers;

    const batters = {};
    battingPlayers.forEach((n) => {
      batters[n] = { name: n, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, retiredHurt: false, dismissal: '' };
    });
    const bowlers = {};
    bowlingPlayers.forEach((n) => {
      bowlers[n] = { name: n, balls: 0, runs: 0, wickets: 0 };
    });

    const live = {
      id: uid('live'),
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
      firstInningsBatters: {},
      firstInningsBowlers: {},
      runs: 0,
      wickets: 0,
      balls: 0,
      target: null,
      striker: battingPlayers[0] || 'Batter 1',
      nonStriker: battingPlayers[1] || 'Batter 2',
      bowler: bowlingPlayers[0] || 'Bowler 1',
      freeHitActive: false,
      isCompleted: false,
      isTied: false,
      resultText: '',
      batters,
      bowlers,
      history: [],
      tossInfo: sch.tossWinner
        ? `${sch.tossWinner} won toss & chose to ${sch.tossDecision || 'BAT'}`
        : 'Toss not recorded',
      captainsInfo: `${sch.teamAName} (C: ${sch.teamACaptain}, VC: ${sch.teamAViceCaptain}) vs ${sch.teamBName} (C: ${sch.teamBCaptain}, VC: ${sch.teamBViceCaptain})`
    };

    updateClub((prev) => ({ ...prev, scheduledMatch: sch, liveMatch: live }));
    setCreateMatchOpen(false);
    setMatchSubTab('live');
    setActiveTab('matches');
    setUmpireBanner('PLAY! Innings 1 underway.');
    notify('Live Match Scorer started!', 'emerald');
    speakText('Match started! Play!');
  };

  // ============================================================================
  // 7. IPL-STYLE LIVE MATCH SCORING ENGINE
  // ============================================================================
  const speakText = (text) => {
    if (!voiceTts || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-IN';
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
    } catch {
      // ignore speech synthesis errors
    }
  };

  const computeLiveMvp = (m) => {
    if (!m) return 'TBD';
    const pts = {};
    const addBat = (rec) => {
      Object.values(rec || {}).forEach((b) => {
        pts[b.name] = (pts[b.name] || 0) + b.runs + b.fours * 2 + b.sixes * 4;
      });
    };
    const addBowl = (rec) => {
      Object.values(rec || {}).forEach((bw) => {
        pts[bw.name] = (pts[bw.name] || 0) + bw.wickets * 25;
      });
    };
    addBat(m.firstInningsBatters);
    addBowl(m.firstInningsBowlers);
    addBat(m.batters);
    addBowl(m.bowlers);

    let bestName = 'TBD';
    let bestPts = 0;
    Object.entries(pts).forEach(([name, p]) => {
      if (p > bestPts) {
        bestPts = p;
        bestName = name;
      }
    });
    return bestPts > 0 ? `${bestName} (${bestPts} pts)` : 'TBD';
  };

  const buildWhatsappScorecard = (m) => {
    const topBat = Object.values(m.batters)
      .filter((b) => b.balls > 0 || b.out)
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 4)
      .map((b) => `- ${b.name}: ${b.runs}(${b.balls}) [4s:${b.fours}, 6s:${b.sixes}]`)
      .join('\n');
    const topBowl = Object.values(m.bowlers)
      .filter((b) => b.balls > 0)
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 3)
      .map((b) => `- ${b.name}: ${b.wickets}/${b.runs} (${formatOvers(b.balls)} ov)`)
      .join('\n');

    return (
      `${club.shortName.toUpperCase()} SCORECARD\n` +
      `${m.title} (${m.isSuperOver ? 'SUPER OVER' : `${m.totalOvers} Overs`})\n` +
      `${m.tossInfo}\n` +
      (m.firstInningsScore !== null
        ? `1st Innings: ${m.bowlingTeam} ${m.firstInningsScore}/${m.firstInningsWickets}\n`
        : '') +
      `${m.battingTeam}: ${m.runs}/${m.wickets} (${formatOvers(m.balls)}/${m.totalOvers} ov)\n` +
      (m.resultText ? `Result: ${m.resultText}\n` : '') +
      `Auto MVP: ${computeLiveMvp(m)}\n\n` +
      `Top Batters:\n${topBat || 'None yet'}\n\n` +
      `Top Bowlers:\n${topBowl || 'None yet'}`
    );
  };

  const recordBall = (runsScored, opts = {}) => {
    const m = club.liveMatch;
    if (!m || m.isCompleted) return;

    const isWide = Boolean(opts.isWide);
    const isNoBall = Boolean(opts.isNoBall);
    const isWicket = Boolean(opts.isWicket);

    if (isWicket && m.freeHitActive && wicketType !== 'Run Out') {
      setUmpireBanner('FREE HIT! Only Run Out is allowed!');
      notify('FREE HIT active — only Run Out is allowed!', 'gold');
      speakText('Not out! Free hit!');
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

    const batters = { ...m.batters };
    const st = batters[m.striker] || {
      name: m.striker,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      out: false,
      retiredHurt: false,
      dismissal: ''
    };
    const batterAdd = isWide ? 0 : runsScored;
    const newBatterRuns = st.runs + batterAdd;
    batters[m.striker] = {
      ...st,
      runs: newBatterRuns,
      balls: isLegal ? st.balls + 1 : st.balls,
      fours: !isWide && runsScored === 4 ? st.fours + 1 : st.fours,
      sixes: !isWide && runsScored === 6 ? st.sixes + 1 : st.sixes,
      out: isWicket ? true : st.out,
      retiredHurt: false,
      dismissal: isWicket ? `${wicketType} b ${m.bowler}` : st.dismissal
    };

    const bowlers = { ...m.bowlers };
    const bw = bowlers[m.bowler] || { name: m.bowler, balls: 0, runs: 0, wickets: 0 };
    const newBowlerWkts = isWicket && wicketType !== 'Run Out' ? bw.wickets + 1 : bw.wickets;
    bowlers[m.bowler] = {
      ...bw,
      balls: isLegal ? bw.balls + 1 : bw.balls,
      runs: bw.runs + totalBallRuns,
      wickets: newBowlerWkts
    };

    const event = {
      id: uid('ball'),
      innings: m.innings,
      over: Math.floor(m.balls / 6),
      runs: totalBallRuns,
      isWide,
      isNoBall,
      isWicket,
      isFreeHit: m.freeHitActive,
      wicketType: isWicket ? wicketType : '',
      batsman: m.striker,
      bowler: m.bowler
    };

    // Milestone detection
    if (st.runs < 100 && newBatterRuns >= 100) {
      setMilestoneBanner(`CENTURY! ${m.striker} reaches 100 runs!`);
      speakText(`Century for ${m.striker}!`);
    } else if (st.runs < 50 && newBatterRuns >= 50) {
      setMilestoneBanner(`HALF-CENTURY! ${m.striker} hits 50!`);
      speakText(`Fifty for ${m.striker}!`);
    } else if (isWicket && wicketType !== 'Run Out' && (newBowlerWkts === 3 || newBowlerWkts === 5)) {
      setMilestoneBanner(`${newBowlerWkts}-WICKET HAUL! ${m.bowler} is on fire!`);
    }

    let nextStriker = m.striker;
    let nextNonStriker = m.nonStriker;
    if (isWicket) {
      const nextBatter = m.battingPlayers.find(
        (n) => n !== nextNonStriker && n !== m.striker && !batters[n]?.out && !batters[n]?.retiredHurt
      );
      if (nextBatter) nextStriker = nextBatter;
    } else if (runsScored % 2 === 1) {
      [nextStriker, nextNonStriker] = [nextNonStriker, nextStriker];
    }

    if (isLegal && nextBalls % 6 === 0) {
      [nextStriker, nextNonStriker] = [nextNonStriker, nextStriker];
    }

    const targetReached = m.innings === 2 && m.target !== null && nextRuns >= m.target;
    const ended = nextBalls >= maxBalls || nextWickets >= maxWickets || targetReached;

    let isCompleted = false;
    let isTied = false;
    let resultText = m.resultText;

    if (ended && m.innings === 2 && m.target !== null) {
      isCompleted = true;
      if (nextRuns >= m.target) {
        resultText = `${m.battingTeam} won by ${Math.max(1, maxWickets - nextWickets)} wicket(s)!`;
      } else if (nextRuns === m.target - 1) {
        isTied = true;
        resultText = 'MATCH TIED! Launch Super Over!';
      } else {
        resultText = `${m.bowlingTeam} won by ${m.target - 1 - nextRuns} run(s)!`;
      }
    }

    if (isNoBall) {
      setUmpireBanner('NO BALL! FREE HIT NEXT!');
      speakText('No ball! Free hit!');
    } else if (isWide) {
      setUmpireBanner('WIDE BALL (+1)');
      speakText('Wide ball!');
    } else if (isWicket) {
      setUmpireBanner(`OUT! ${wicketType}`);
      speakText(`Out! ${wicketType}`);
    } else if (runsScored === 6) {
      setUmpireBanner('MAXIMUM SIX!');
      speakText('Huge six!');
    } else if (runsScored === 4) {
      setUmpireBanner('CRACKING FOUR!');
      speakText('Four runs!');
    }

    updateClub((prev) => ({
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
        batters,
        bowlers,
        history: [event, ...m.history]
      }
    }));
  };

  const undoLastBall = () => {
    const m = club.liveMatch;
    if (!m || m.history.length === 0) return;
    const [last, ...rest] = m.history;
    if (last.innings !== m.innings) return;
    const wasLegal = !last.isWide && !last.isNoBall;

    const batters = { ...m.batters };
    if (batters[last.batsman]) {
      const b = batters[last.batsman];
      const batDeduct = last.isWide ? 0 : last.isNoBall ? Math.max(0, last.runs - 1) : last.runs;
      batters[last.batsman] = {
        ...b,
        runs: Math.max(0, b.runs - batDeduct),
        balls: wasLegal ? Math.max(0, b.balls - 1) : b.balls,
        fours: !last.isWide && batDeduct === 4 ? Math.max(0, b.fours - 1) : b.fours,
        sixes: !last.isWide && batDeduct === 6 ? Math.max(0, b.sixes - 1) : b.sixes,
        out: last.isWicket ? false : b.out,
        dismissal: last.isWicket ? '' : b.dismissal
      };
    }

    const bowlers = { ...m.bowlers };
    if (bowlers[last.bowler]) {
      const bw = bowlers[last.bowler];
      bowlers[last.bowler] = {
        ...bw,
        balls: wasLegal ? Math.max(0, bw.balls - 1) : bw.balls,
        runs: Math.max(0, bw.runs - last.runs),
        wickets: last.isWicket && last.wicketType !== 'Run Out' ? Math.max(0, bw.wickets - 1) : bw.wickets
      };
    }

    updateClub((prev) => ({
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
        resultText: '',
        batters,
        bowlers,
        history: rest
      }
    }));
    setUmpireBanner('Last delivery undone.');
  };

  const handleRetiredHurt = () => {
    const m = club.liveMatch;
    if (!m || m.isCompleted) return;
    const nextBatter = m.battingPlayers.find(
      (n) => n !== m.striker && n !== m.nonStriker && !m.batters[n]?.out && !m.batters[n]?.retiredHurt
    );
    if (!nextBatter) {
      notify('No replacement batter available.', 'rose');
      return;
    }
    const batters = { ...m.batters };
    if (batters[m.striker]) batters[m.striker] = { ...batters[m.striker], retiredHurt: true };
    updateClub((prev) => ({
      ...prev,
      liveMatch: { ...m, striker: nextBatter, batters }
    }));
    setUmpireBanner(`${m.striker} Retired Hurt. ${nextBatter} walks in.`);
  };

  const startSecondInnings = () => {
    const m = club.liveMatch;
    if (!m || m.innings !== 1) return;

    const batters = {};
    m.bowlingPlayers.forEach((n) => {
      batters[n] = { name: n, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, retiredHurt: false, dismissal: '' };
    });
    const bowlers = {};
    m.battingPlayers.forEach((n) => {
      bowlers[n] = { name: n, balls: 0, runs: 0, wickets: 0 };
    });

    updateClub((prev) => ({
      ...prev,
      liveMatch: {
        ...m,
        innings: 2,
        battingTeam: m.bowlingTeam,
        bowlingTeam: m.battingTeam,
        battingPlayers: m.bowlingPlayers,
        bowlingPlayers: m.battingPlayers,
        firstInningsScore: m.runs,
        firstInningsWickets: m.wickets,
        firstInningsBatters: m.batters,
        firstInningsBowlers: m.bowlers,
        target: m.runs + 1,
        runs: 0,
        wickets: 0,
        balls: 0,
        striker: m.bowlingPlayers[0] || 'Batter 1',
        nonStriker: m.bowlingPlayers[1] || 'Batter 2',
        bowler: m.battingPlayers[0] || 'Bowler 1',
        freeHitActive: false,
        isCompleted: false,
        isTied: false,
        resultText: '',
        batters,
        bowlers
      }
    }));
    setUmpireBanner(`2nd Innings! Target is ${m.runs + 1}`);
    speakText(`Second innings! Target is ${m.runs + 1} runs!`);
  };

  const startSuperOver = () => {
    const m = club.liveMatch;
    if (!m) return;
    const batters = {};
    m.teamAPlayers.forEach((n) => {
      batters[n] = { name: n, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, retiredHurt: false, dismissal: '' };
    });
    const bowlers = {};
    m.teamBPlayers.forEach((n) => {
      bowlers[n] = { name: n, balls: 0, runs: 0, wickets: 0 };
    });

    updateClub((prev) => ({
      ...prev,
      liveMatch: {
        ...m,
        title: `${m.title} — SUPER OVER`,
        totalOvers: 1,
        innings: 1,
        isSuperOver: true,
        battingTeam: m.teamAName,
        bowlingTeam: m.teamBName,
        battingPlayers: m.teamAPlayers,
        bowlingPlayers: m.teamBPlayers,
        firstInningsScore: null,
        firstInningsWickets: null,
        firstInningsBatters: {},
        firstInningsBowlers: {},
        runs: 0,
        wickets: 0,
        balls: 0,
        target: null,
        striker: m.teamAPlayers[0] || 'Batter 1',
        nonStriker: m.teamAPlayers[1] || 'Batter 2',
        bowler: m.teamBPlayers[0] || 'Bowler 1',
        freeHitActive: false,
        isCompleted: false,
        isTied: false,
        resultText: '',
        batters,
        bowlers,
        history: []
      }
    }));
    setMilestoneBanner('SUPER OVER LIVE! 6 Balls Tie-Breaker!');
  };

  const archiveLiveMatch = () => {
    const m = club.liveMatch;
    if (!m) return;
    const mvp = computeLiveMvp(m);
    const scorecardText = buildWhatsappScorecard(m);
    const firstInnSummary =
      m.firstInningsScore !== null
        ? ` vs ${m.bowlingTeam} ${m.firstInningsScore}/${m.firstInningsWickets}`
        : '';

    const completed = {
      id: uid('hist'),
      title: m.title,
      date: new Date().toISOString().slice(0, 10),
      summary: `${m.battingTeam} ${m.runs}/${m.wickets} (${formatOvers(m.balls)} ov)${firstInnSummary}`,
      winner: m.resultText || 'Completed',
      mvp,
      scorecardText
    };

    // Determine W / L / T outcome for Team A (primary club metric)
    let outcome = 'W';
    if (m.isTied || (m.resultText && m.resultText.toLowerCase().includes('tied'))) {
      outcome = 'T';
    } else if (m.resultText && !m.resultText.startsWith(m.teamAName)) {
      outcome = 'L';
    }

    updateClub((prev) => {
      const updatedPlayers = prev.players.map((pl) => {
        const participated = m.teamAPlayers.includes(pl.name) || m.teamBPlayers.includes(pl.name);
        if (!participated) return pl;

        const bat1 = m.firstInningsBatters?.[pl.name];
        const bat2 = m.batters?.[pl.name];
        const bowl1 = m.firstInningsBowlers?.[pl.name];
        const bowl2 = m.bowlers?.[pl.name];

        const addRuns = (bat1?.runs || 0) + (bat2?.runs || 0);
        const addBalls = (bat1?.balls || 0) + (bat2?.balls || 0);
        const addFours = (bat1?.fours || 0) + (bat2?.fours || 0);
        const addSixes = (bat1?.sixes || 0) + (bat2?.sixes || 0);
        const addWkts = (bowl1?.wickets || 0) + (bowl2?.wickets || 0);
        const addBowlBalls = (bowl1?.balls || 0) + (bowl2?.balls || 0);
        const addConceded = (bowl1?.runs || 0) + (bowl2?.runs || 0);

        return {
          ...pl,
          matches: pl.matches + 1,
          runs: pl.runs + addRuns,
          ballsFaced: pl.ballsFaced + addBalls,
          fours: pl.fours + addFours,
          sixes: pl.sixes + addSixes,
          wickets: pl.wickets + addWkts,
          oversBowled: Number((pl.oversBowled + addBowlBalls / 6).toFixed(1)),
          runsConceded: pl.runsConceded + addConceded
        };
      });

      return {
        ...prev,
        players: updatedPlayers,
        liveMatch: null,
        scheduledMatch: null,
        matchHistory: [completed, ...prev.matchHistory],
        recentResults: [outcome, ...(prev.recentResults || [])].slice(0, 20)
      };
    });

    setMatchSubTab('history');
    setUmpireBanner('');
    notify('Match archived and player career stats updated!', 'emerald');
  };

  // ============================================================================
  // 8. LEGENDBOT AI + VOICE ENGINE (WORKS FOR ACTIVE WORKSPACE)
  // ============================================================================
  const toggleVoiceInput = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) {
      notify('Voice input is not supported in this browser.', 'rose');
      return;
    }
    try {
      const rec = new Rec();
      rec.lang = 'en-IN';
      rec.interimResults = false;
      rec.onresult = (ev) => {
        const spoken = ev.results?.[0]?.[0]?.transcript || '';
        if (spoken) {
          setAiInput(spoken);
          askLegendBot(spoken);
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

  const askLegendBot = (rawPrompt) => {
    const prompt = rawPrompt.trim();
    if (!prompt) return;
    setAiMessages((prev) => [...prev, { id: uid('u'), role: 'user', text: prompt, time: nowTime() }]);
    setAiInput('');
    const q = prompt.toLowerCase();

    let reply = '';
    const matchedPlayer = club.players.find((p) =>
      q.includes(p.name.split(' ')[0].toLowerCase()) || q.includes(p.name.toLowerCase())
    );

    if (q.includes('score') || q.includes('live') || q.includes('match')) {
      if (club.liveMatch) {
        const lm = club.liveMatch;
        reply = `[${club.shortName}] Live Match: ${lm.battingTeam} ${lm.runs}/${lm.wickets} (${formatOvers(lm.balls)}/${lm.totalOvers} ov). Striker: ${lm.striker}, Bowler: ${lm.bowler}. Auto MVP: ${computeLiveMvp(lm)}.`;
      } else if (club.scheduledMatch) {
        const s = club.scheduledMatch;
        reply = `[${club.shortName}] Upcoming Match: ${s.title} (${s.teamAName} vs ${s.teamBName}, ${s.overs} overs) on ${s.dateTime.replace('T', ' ')}.`;
      } else {
        reply = `[${club.shortName}] No match is scheduled or live right now. Total matches played: ${club.matchHistory.length}. Tap "Create Match" to start one!`;
      }
    } else if (q.includes('cap') || q.includes('orange') || q.includes('purple') || q.includes('top')) {
      const oc = orangeCap ? `${orangeCap.name} (${orangeCap.runs} runs)` : 'Unclaimed (0 runs so far)';
      const pc = purpleCap ? `${purpleCap.name} (${purpleCap.wickets} wickets)` : 'Unclaimed (0 wickets so far)';
      reply = `[${club.shortName}] Orange Cap: ${oc}. Purple Cap: ${pc}.`;
    } else if (q.includes('fund') || q.includes('balance') || q.includes('money') || q.includes('due') || q.includes('treasury')) {
      const dues = club.players.filter((p) => p.finesDue > 0).map((p) => `${p.name} (Rs. ${p.finesDue})`).join(', ');
      reply = `[${club.shortName}] Club Fund Balance: Rs. ${financeSummary.net} (Credits: Rs. ${financeSummary.credits}, Advances: Rs. ${financeSummary.advances}, Fines: Rs. ${financeSummary.fines}, Expenses: Rs. ${financeSummary.expenses}). Pending Dues: ${dues || 'None (Rs. 0)'}.`;
    } else if (q.includes('poll') || q.includes('attendance') || q.includes('playing')) {
      const ins = club.poll.filter((v) => v.choice === 'IN').map((v) => v.playerName.split(' ')[0]);
      reply = `[${club.shortName}] Attendance Poll: ${ins.length} players IN (${ins.join(', ') || 'No votes yet'}).`;
    } else if (matchedPlayer) {
      const sr = matchedPlayer.ballsFaced > 0 ? ((matchedPlayer.runs / matchedPlayer.ballsFaced) * 100).toFixed(1) : '0.0';
      const econ = matchedPlayer.oversBowled > 0 ? (matchedPlayer.runsConceded / matchedPlayer.oversBowled).toFixed(2) : '0.00';
      reply = `${matchedPlayer.name} (${matchedPlayer.role}) in ${club.shortName}: ${matchedPlayer.matches} matches, ${matchedPlayer.runs} runs (SR ${sr}), ${matchedPlayer.wickets} wickets (Econ ${econ}), Dues: Rs. ${matchedPlayer.finesDue}.`;
    } else {
      reply = `[${club.shortName} Summary] Squad: ${club.players.length} players | Matches Played: ${club.matchHistory.length} | Club Fund: Rs. ${financeSummary.net} | Attendance IN: ${club.poll.filter((v) => v.choice === 'IN').length}. Ask me about live score, caps, fund, poll, or any player name!`;
    }

    setAiMessages((prev) => [...prev, { id: uid('b'), role: 'bot', text: reply, time: nowTime() }]);
    speakText(reply);
  };

  // ============================================================================
  // 9. NORMAL LOGIN SCREEN (NO GOOGLE LOGIN, NO DEMO BYPASS, NO PASSWORD HINTS)
  // ============================================================================
  if (!session || !currentUser || !authBase) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#04091a] text-white flex flex-col lg:flex-row relative overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[130px]" />
          <div className="absolute top-1/3 right-0 w-[460px] h-[460px] bg-amber-500/15 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>

        {/* Left Column: Glassmorphic Squad Sign-In */}
        <section className="relative z-10 flex-1 flex items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#091536]/75 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3.5">
              <LionCrestSVG size={62} />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest">
                  <Crown className="w-3 h-3" /> Official Squad Portal
                </div>
                <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight bg-gradient-to-r from-white via-amber-200 to-amber-500 bg-clip-text text-transparent">
                  INDORE LEGENDS
                </h1>
                <p className="text-[11px] font-bold tracking-[0.22em] text-cyan-300/90">PLAY • MANAGE • WIN</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Squad Sign In</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Select your name and enter your password to access the club dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Squad Member
                </label>
                <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md focus-within:border-amber-400/70 transition-colors relative">
                  <select
                    value={loginPlayerId}
                    onChange={(e) => {
                      setLoginPlayerId(e.target.value);
                      setLoginError('');
                    }}
                    className="w-full bg-transparent text-sm text-white p-3.5 pr-10 rounded-2xl focus:outline-none appearance-none cursor-pointer font-medium"
                  >
                    {SQUAD_ROSTER.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#081330] text-white">
                        {p.name} ({p.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Password
                </label>
                <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md focus-within:border-amber-400/70 transition-colors relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full bg-transparent text-sm text-white p-3.5 pr-12 rounded-2xl placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_24px_rgba(251,191,36,0.35)] transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Sign In
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Stadium Broadcast Emblem Showcase */}
        <section className="relative z-10 hidden lg:flex flex-1 p-5">
          <div className="relative w-full h-full rounded-[28px] overflow-hidden border border-amber-400/25 bg-gradient-to-br from-[#0a1d4f] via-[#06102d] to-[#030712] flex flex-col justify-between p-8 shadow-2xl">
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-45" viewBox="0 0 600 700" preserveAspectRatio="none">
              <defs>
                <linearGradient id="beamLeft" x1="0" y1="0" x2="0.4" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="beamRight" x1="1" y1="0" x2="0.5" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points="0,0 180,0 380,700 80,700" fill="url(#beamLeft)" />
              <polygon points="600,0 430,0 240,700 540,700" fill="url(#beamRight)" />
              <ellipse cx="300" cy="640" rx="340" ry="110" fill="none" stroke="#38bdf8" strokeOpacity="0.22" strokeWidth="2" />
              <ellipse cx="300" cy="665" rx="360" ry="125" fill="none" stroke="#fbbf24" strokeOpacity="0.22" strokeWidth="2" />
            </svg>

            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-amber-300">
                <Trophy className="w-3.5 h-3.5" /> Indore Legends Cricket Club
              </span>
              <span className="italic font-semibold text-amber-200/90 text-base">Together We Rise</span>
            </div>

            <div className="relative z-10 text-center my-auto space-y-4">
              <div className="flex justify-center">
                <LionCrestSVG size={126} />
              </div>
              <h3 className="text-4xl font-black italic tracking-tight bg-gradient-to-b from-white via-amber-100 to-amber-400 bg-clip-text text-transparent">
                INDORE LEGENDS
              </h3>
              <p className="text-xs font-bold tracking-[0.28em] text-cyan-300 uppercase">PLAY • MANAGE • WIN</p>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Complete cricket club management — Live IPL-style ball-by-ball scoring, balanced team splitting, club treasury, squad rankings, and LegendBot voice assistant.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Squad Members', val: '13' },
                { label: 'Live Scorer', val: 'IPL HUD' },
                { label: 'Club Sync', val: 'Ready' }
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-[#071333]/80 backdrop-blur-xl border border-white/10 p-3">
                  <div className="text-lg font-black text-amber-300">{s.val}</div>
                  <div className="text-[11px] text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ============================================================================
  // 10. NAVIGATION CONFIG & COMPUTED LIVE DATA
  // ============================================================================
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'squad', label: 'Squad', icon: Users },
    { id: 'matches', label: 'Matches', icon: Trophy },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'ai', label: 'LegendBot', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const mobileNav = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'squad', label: 'Squad', icon: Users },
    { id: 'matches', label: 'Matches', icon: Trophy },
    { id: 'leaderboard', label: 'Ranks', icon: BarChart3 }
  ];

  const filteredSquad = club.players.filter((p) => {
    if (!squadSearch.trim()) return true;
    const q = squadSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q) || p.jersey.includes(q);
  });

  const lm = club.liveMatch;
  const lmMaxBalls = lm ? lm.totalOvers * 6 : 60;
  const lmBallsLeft = lm ? Math.max(0, lmMaxBalls - lm.balls) : 0;
  const lmCrr = lm && lm.balls > 0 ? (lm.runs / (lm.balls / 6)).toFixed(2) : '0.00';
  const lmRunsNeeded = lm && lm.target !== null ? Math.max(0, lm.target - lm.runs) : null;
  const lmRrr = lmRunsNeeded !== null && lmBallsLeft > 0 ? (lmRunsNeeded / (lmBallsLeft / 6)).toFixed(2) : '0.00';

  const oversGrouped = [];
  if (lm) {
    const innBalls = [...lm.history].filter((b) => b.innings === lm.innings).reverse();
    const map = new Map();
    innBalls.forEach((b) => {
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
          wickets: balls.filter((b) => b.isWicket).length
        });
      });
  }

  const myPollChoice = club.poll.find((v) => v.playerId === currentUser.id)?.choice || '';
  const totalVotes = club.poll.length;
  const inCount = club.poll.filter((v) => v.choice === 'IN').length;
  const maybeCount = club.poll.filter((v) => v.choice === 'MAYBE').length;
  const outCount = club.poll.filter((v) => v.choice === 'OUT').length;

  // Pad last 5 matches with '-' when fewer than 5 matches have been played
  const lastFiveSlots = [0, 1, 2, 3, 4].map((idx) => club.recentResults[idx] || '-');

  // ============================================================================
  // 11. AUTHENTICATED APPLICATION SHELL
  // ============================================================================
  return (
    <div className="min-h-[100dvh] w-full bg-[#04091b] text-slate-100 flex relative overflow-x-hidden">
      <style>{`
        @keyframes freeHitGlow {
          0%, 100% { background: rgba(245, 158, 11, 0.96); color: #090d1e; box-shadow: 0 0 26px rgba(251, 191, 36, 0.85); }
          50% { background: rgba(225, 29, 72, 0.96); color: #ffffff; box-shadow: 0 0 26px rgba(244, 63, 94, 0.85); }
        }
        @keyframes coinFlipAnim {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(360deg) scale(1.15); }
          100% { transform: rotateY(720deg) scale(1); }
        }
        .free-hit-flash { animation: freeHitGlow 0.75s infinite; }
        .coin-flip-3d { animation: coinFlipAnim 0.7s ease-in-out; }
      `}</style>

      {/* Atmospheric Stadium Backdrop */}
      <div className={`fixed inset-0 bg-gradient-to-br ${theme.heroGradient} pointer-events-none z-0`} />
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 left-1/3 w-[520px] h-[340px] bg-blue-500/18 rounded-full blur-[130px]" />
        <div className="absolute top-1/4 -right-24 w-[420px] h-[420px] bg-amber-500/14 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[280px] bg-cyan-500/10 rounded-full blur-[130px]" />
      </div>

      {/* ================= DESKTOP GLASS SIDEBAR ================= */}
      <aside className="hidden lg:flex flex-col justify-between w-64 shrink-0 sticky top-0 h-[100dvh] z-30 border-r border-white/10 bg-[#060f28]/88 backdrop-blur-2xl p-4">
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Crest (Triple-Tap unlocks Ganesh Mandir Cricket Zone) */}
          <div className="flex flex-col items-center text-center pt-1 pb-3 border-b border-white/10">
            <LionCrestSVG size={66} onClick={handleCrestTap} isGM={isGMMode} />
            <div className="mt-2 font-black italic text-base tracking-wide bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              {isGMMode ? 'GANESH MANDIR' : 'INDORE LEGENDS'}
            </div>
            <div className="text-[10px] font-bold tracking-[0.22em] text-cyan-300/80">PLAY • MANAGE • WIN</div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    active ? theme.activePill : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.id === 'matches' && club.liveMatch && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Subtle Ganesh Mandir Zone Lock Button (for 8 GM members) */}
          {authBase.isGM && (
            <button
              onClick={openGaneshMandirGate}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                gmUnlocked && isGMMode
                  ? 'bg-orange-500/20 border-orange-400/50 text-orange-200'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-amber-400/40'
              }`}
            >
              <span className="flex items-center gap-2">
                {gmUnlocked ? <Flame className="w-4 h-4 text-orange-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
                Ganesh Mandir Zone
              </span>
              <span className="text-[10px] uppercase text-amber-300">{gmUnlocked ? (isGMMode ? 'Active' : 'Switch') : 'Unlock'}</span>
            </button>
          )}
        </div>

        {/* Bottom Theme Orbs, User Profile & Logout */}
        <div className="pt-3 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400">Theme</span>
            <div className="flex items-center gap-1.5">
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAppState((prev) => ({ ...prev, themeKey: t.id }))}
                  title={t.name}
                  className={`w-5 h-5 rounded-full bg-gradient-to-br ${t.orb} cursor-pointer transition-transform ${
                    appState.themeKey === t.id ? 'scale-110 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div
            onClick={() => setSelectedProfileId(currentUser.id)}
            className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 cursor-pointer"
          >
            <PlayerAvatarSVG name={currentUser.name} jersey={currentUser.jersey} role={currentUser.role} size="sm" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[11px] text-amber-300 font-semibold">
                {isAdmin ? 'Admin' : currentUser.role}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="relative z-10 flex-1 min-w-0 pb-24 lg:pb-10">
        {/* TOP HEADER BAR */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#050d24]/80 border-b border-white/10 px-4 sm:px-6 py-3">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="lg:hidden">
                <LionCrestSVG size={42} onClick={handleCrestTap} isGM={isGMMode} />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black italic tracking-tight bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent">
                  {isGMMode ? 'GANESH MANDIR CRICKET CLUB' : 'INDORE LEGENDS'}
                </h1>
                <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-300/85">
                  PLAY • MANAGE • WIN
                </p>
              </div>
            </div>

            {/* Smooth Workspace Switcher Pill once Ganesh Mandir is unlocked */}
            <div className="flex items-center gap-2">
              {gmUnlocked ? (
                <div className="inline-flex p-1 rounded-full bg-white/8 border border-amber-400/35">
                  <button
                    onClick={() => {
                      setActiveClubKey('il');
                      setSelectedProfileId(null);
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
                      activeClubKey === 'il'
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Indore Legends (13)
                  </button>
                  <button
                    onClick={() => {
                      setActiveClubKey('gm');
                      setSelectedProfileId(null);
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
                      activeClubKey === 'gm'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Ganesh Mandir (8)
                  </button>
                </div>
              ) : (
                authBase.isGM && (
                  <button
                    onClick={openGaneshMandirGate}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-500/15 border border-white/15 hover:border-amber-400/40 text-[11px] font-bold text-slate-300 hover:text-amber-300 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3 h-3 text-amber-400" /> Ganesh Mandir Zone
                  </button>
                )
              )}

              <button
                onClick={() => setMoreDrawerOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-300 cursor-pointer"
                aria-label="Open menu"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* TAB VIEWPORT */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
          {/* ============================================================== */}
          {/* TAB 1: DASHBOARD                                               */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* Stadium Hero Banner */}
              <div className={`relative rounded-3xl overflow-hidden border ${theme.accentBorder} ${theme.cardBg} backdrop-blur-xl p-5 sm:p-6 ${theme.accentGlow}`}>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/35 text-xs font-bold text-amber-300">
                        <Crown className="w-3.5 h-3.5" /> Welcome back, {currentUser.name}
                      </span>
                      <span className="text-xs italic font-semibold text-cyan-300">Together We Rise</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black italic tracking-tight text-white">
                      {isGMMode ? 'GANESH MANDIR • PLAY • MANAGE • WIN' : 'INDORE LEGENDS • PLAY • MANAGE • WIN'}
                    </h2>
                    <p className="text-xs text-slate-300 max-w-2xl">{club.announcement}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {club.liveMatch ? (
                      <button
                        onClick={() => {
                          setMatchSubTab('live');
                          setActiveTab('matches');
                        }}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer ${theme.activePill}`}
                      >
                        <Play className="w-4 h-4" /> Open Live Scorer
                      </button>
                    ) : (
                      <button
                        onClick={() => requireAdminPin('Create New Match', openCreateMatchWizard)}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer ${theme.activePill}`}
                      >
                        <Plus className="w-4 h-4" /> Create Match
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 KPI CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className={`rounded-2xl border border-cyan-400/25 ${theme.cardBg} backdrop-blur-xl p-4`}>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-white">{club.players.length}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-1.5">Total Players</div>
                </div>

                <div className={`rounded-2xl border border-amber-400/25 ${theme.cardBg} backdrop-blur-xl p-4`}>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-white">{club.matchHistory.length}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-1.5">Matches Played</div>
                </div>

                <div className={`rounded-2xl border border-cyan-400/25 ${theme.cardBg} backdrop-blur-xl p-4`}>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-white">{winRatePct}%</span>
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-1.5">Win Rate</div>
                </div>

                <div className={`rounded-2xl border border-amber-400/35 ${theme.cardBg} backdrop-blur-xl p-4`}>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-amber-300">Rs. {financeSummary.net}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-1.5">Club Fund</div>
                </div>
              </div>

              {/* 3-COLUMN GRID: UPCOMING MATCH | QUICK ACTIONS | TEAM PERFORMANCE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Upcoming Match Card */}
                <div className={`lg:col-span-5 rounded-3xl border border-amber-400/30 ${theme.cardBg} backdrop-blur-xl p-5 flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 text-white">
                      <Calendar className="w-4 h-4 text-amber-400" /> Upcoming Match
                    </h3>
                    <button
                      onClick={() => setActiveTab('matches')}
                      className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Match Center <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!club.scheduledMatch ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-6 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">No Match Scheduled</div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Create a custom match with teams, overs, captains & coin toss.
                        </p>
                      </div>
                      <button
                        onClick={() => requireAdminPin('Create New Match', openCreateMatchWizard)}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer ${theme.activePill}`}
                      >
                        <Plus className="w-4 h-4" /> Create Match
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                          {club.scheduledMatch.title} • {club.scheduledMatch.overs} Overs
                        </div>
                        <div className="text-lg font-black text-white mt-1">
                          {club.scheduledMatch.teamAName}{' '}
                          <span className="text-amber-400 text-sm">vs</span>{' '}
                          {club.scheduledMatch.teamBName}
                        </div>
                        <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {club.scheduledMatch.dateTime.replace('T', ' ')}
                        </div>
                      </div>

                      {scheduledCountdown && (
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Days', val: scheduledCountdown.days },
                            { label: 'Hrs', val: scheduledCountdown.hrs },
                            { label: 'Min', val: scheduledCountdown.min },
                            { label: 'Sec', val: scheduledCountdown.sec }
                          ].map((b) => (
                            <div key={b.label} className="rounded-xl bg-[#040a1d]/85 border border-white/10 py-2 text-center">
                              <div className="text-lg font-black font-mono text-white">{b.val}</div>
                              <div className="text-[10px] font-bold uppercase text-slate-400">{b.label}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setMatchSubTab(club.liveMatch ? 'live' : 'upcoming');
                          setActiveTab('matches');
                        }}
                        className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer ${theme.activePill}`}
                      >
                        Go to Match Center <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Actions 2x2 Grid */}
                <div className={`lg:col-span-3 rounded-3xl border border-white/15 ${theme.cardBg} backdrop-blur-xl p-5 flex flex-col justify-between`}>
                  <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 text-white mb-3">
                    <Zap className="w-4 h-4 text-amber-400" /> Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <button
                      onClick={() => requireAdminPin('Create New Match', openCreateMatchWizard)}
                      className="rounded-2xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-400/40 p-3 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-300">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200 text-center">Create Match</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="rounded-2xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-400/40 p-3 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-300">
                        <ClipboardCheck className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200 text-center">Mark Attendance</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('finance')}
                      className="rounded-2xl bg-white/5 hover:bg-purple-500/15 border border-white/10 hover:border-purple-400/40 p-3 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-300">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200 text-center">Add Finance Entry</span>
                    </button>

                    <button
                      onClick={() => {
                        setMatchSubTab('live');
                        setActiveTab('matches');
                      }}
                      className="rounded-2xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 p-3 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300">
                        <Play className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200 text-center">Open Live Scorer</span>
                    </button>
                  </div>
                </div>

                {/* Team Performance Card */}
                <div className={`lg:col-span-4 rounded-3xl border border-white/15 ${theme.cardBg} backdrop-blur-xl p-5 flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 text-white">
                      <TrendingUp className="w-4 h-4 text-amber-400" /> Team Performance
                    </h3>
                    <button
                      onClick={() => setActiveTab('leaderboard')}
                      className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Leaderboard <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-4 my-2">
                    <WinRateDonutSVG pct={winRatePct} primary={theme.chartPrimary} secondary={theme.chartSecondary} />
                    <div className="space-y-1.5 text-xs">
                      <div className="text-slate-400">
                        Orange Cap:{' '}
                        <strong className="text-amber-300">{orangeCap ? `${orangeCap.name.split(' ')[0]} (${orangeCap.runs})` : 'None yet'}</strong>
                      </div>
                      <div className="text-slate-400">
                        Purple Cap:{' '}
                        <strong className="text-purple-300">{purpleCap ? `${purpleCap.name.split(' ')[0]} (${purpleCap.wickets})` : 'None yet'}</strong>
                      </div>
                      <div className="text-slate-400">
                        Poll IN: <strong className="text-emerald-300">{inCount}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Last 5 Matches</span>
                    <div className="flex items-center gap-1.5">
                      {lastFiveSlots.map((res, idx) => (
                        <span
                          key={idx}
                          className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center border ${
                            res === 'W'
                              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                              : res === 'L'
                              ? 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                              : res === 'T'
                              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                              : 'bg-white/5 border-white/15 text-slate-500'
                          }`}
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: SQUAD TRADING CARDS                                     */}
          {/* ============================================================== */}
          {activeTab === 'squad' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">
                    {club.shortName} Squad ({club.players.length})
                  </h2>
                  <p className="text-xs text-slate-400">Tap any player card to inspect profile, career breakdown, or admin edits.</p>
                </div>
                <div className="relative sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={squadSearch}
                    onChange={(e) => setSquadSearch(e.target.value)}
                    placeholder="Search player or role..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredSquad.map((p) => {
                  const sr = p.ballsFaced > 0 ? ((p.runs / p.ballsFaced) * 100).toFixed(1) : '0.0';
                  const econ = p.oversBowled > 0 ? (p.runsConceded / p.oversBowled).toFixed(2) : '0.00';
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProfileId(p.id);
                        setProfileSubTab('stats');
                        setEditAwardDraft(p.funAward);
                      }}
                      className="group rounded-3xl border border-amber-400/25 bg-gradient-to-b from-[#0e2152]/90 via-[#091538]/95 to-[#050b1f] p-4 flex flex-col items-center text-center cursor-pointer transition-all hover:-translate-y-1 hover:border-amber-400 hover:shadow-[0_0_22px_rgba(251,191,36,0.25)]"
                    >
                      <div className="w-full flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-amber-300 font-mono">#{p.jersey}</span>
                        {p.isAdmin && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[9px] font-black">
                            ADMIN
                          </span>
                        )}
                      </div>

                      <PlayerAvatarSVG name={p.name} jersey={p.jersey} role={p.role} size="md" />

                      <h4 className="mt-2.5 font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-cyan-300/90">{p.role}</p>

                      <div className="w-full grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-white/10 text-[11px]">
                        <div className="bg-white/5 rounded-lg py-1">
                          <span className="text-slate-400 block text-[9px]">RUNS (SR)</span>
                          <span className="font-black text-white">
                            {p.runs} <span className="text-[10px] text-cyan-300 font-normal">({sr})</span>
                          </span>
                        </div>
                        <div className="bg-white/5 rounded-lg py-1">
                          <span className="text-slate-400 block text-[9px]">WKTS (EC)</span>
                          <span className="font-black text-amber-300">
                            {p.wickets} <span className="text-[10px] text-slate-300 font-normal">({econ})</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==========================================
