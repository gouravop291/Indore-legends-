export type TabId = "match" | "stats" | "money" | "hub" | "bot" | "mandir";

export type PlayerRole = "Batter" | "Bowler" | "All-Rounder" | "Wicket-Keeper";

export interface SquadAccount {
  id: string;
  fullName: string;
  nickname: string;
  jerseyNumber: number;
  role: PlayerRole;
  skillTag: string;
  isAdmin: boolean;
  hasGM: boolean;
  adminPassword?: string; // Permanently locked, cannot be changed
  defaultNormalPassword: string; // Changeable by player
}

export interface PlayerStats {
  id: string;
  fullName: string;
  nickname: string;
  jerseyNumber: number;
  role: PlayerRole;
  skillTag: string;
  matches: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  ducks: number;
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
  attendanceStreak: number;
  recentScores: string[];
}

export interface GearAssignment {
  id: string;
  item: string;
  assignedTo: string;
  confirmed: boolean;
}

export interface BallEvent {
  id: string;
  innings: 1 | 2 | 3; // 3 = Super Over
  over: number;
  ballInOver: number;
  batsmanId: string;
  bowlerId: string;
  runsOffBat: number;
  extraRuns: number;
  extraType?: "WD" | "NB" | "BYE" | "LB";
  isLegalDelivery: boolean;
  isWicket: boolean;
  wicketType?: "Bowled" | "Caught" | "Run Out" | "LBW" | "Stumped" | "Retired Hurt";
  outBatterId?: string;
  label: string;
}

export interface FallOfWicket {
  innings: 1 | 2 | 3;
  wicketNumber: number;
  score: number;
  overs: string;
  batterName: string;
  wicketType: string;
}

export interface TeamSplit {
  teamAName: string;
  teamBName: string;
  teamAIds: string[];
  teamBIds: string[];
  captainA: string;
  viceCaptainA: string;
  captainB: string;
  viceCaptainB: string;
}

export interface LiveMatch {
  id: string;
  title: string;
  groundName: string;
  scheduledISO: string; // Supports creating up to 3 days ahead + countdown
  totalOvers: number;
  innings: 1 | 2 | 3; // 3 = Super Over
  battingTeamName: string;
  bowlingTeamName: string;
  firstInningsScore?: number;
  target?: number;
  runs: number;
  wickets: number;
  legalBalls: number;
  isFreeHit: boolean;
  tossWinner?: string;
  tossDecision?: "Bat" | "Bowl";
  teamSplit?: TeamSplit;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
  };
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  outPlayerIds: string[];
  timeline: BallEvent[];
  fallOfWickets: FallOfWicket[];
  gearList: GearAssignment[];
  status: "upcoming" | "live" | "completed";
  winnerText?: string;
  mvpName?: string;
  mvpPoints?: number;
}

export interface MoneyEntry {
  id: string;
  date: string;
  fullName: string;
  category: "collection" | "fine" | "expense";
  reason: string;
  amount: number;
  paid: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  postedBy: string;
  date: string;
  pinned: boolean;
}

export interface AvailabilityVote {
  fullName: string;
  status: "playing" | "maybe" | "out";
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isBot?: boolean;
}

export interface GroundLocation {
  id: string;
  name: string;
  area: string;
  surface: string;
  usualTime: string;
  notes: string;
  mapsUrl: string;
}

export interface CustomQA {
  id: string;
  question: string;
  answer: string;
}

export interface MandirSchedule {
  id: string;
  dayLabel: string;
  date: string;
  time: string;
  meetupPoint: string;
  note: string;
  rsvps: { fullName: string; status: "coming" | "cant" }[];
}

export interface MandirOffering {
  id: string;
  item: string;
  assignedTo: string;
  done: boolean;
}

export interface MandirRide {
  id: string;
  driverName: string;
  vehicle: string;
  seatsFree: number;
  passengers: string[];
}

export interface MandirPoll {
  id: string;
  question: string;
  options: { id: string; label: string; voters: string[] }[];
}

export interface MandirData {
  chat: ChatMessage[];
  schedules: MandirSchedule[];
  offerings: MandirOffering[];
  rides: MandirRide[];
  poll: MandirPoll;
}

export interface ClubState {
  clubName: string;
  tagline: string;
  players: PlayerStats[];
  customPasswords: Record<string, string>; // Only stores changed Normal passwords
  advanceCredits: Record<string, number>; // Player fullName -> Advance credit ₹
  activeMatch: LiveMatch | null;
  matchHistory: LiveMatch[];
  money: MoneyEntry[];
  announcements: Announcement[];
  availabilityPollTitle: string;
  availabilityVotes: AvailabilityVote[];
  chat: ChatMessage[];
  locations: GroundLocation[];
  customQA: CustomQA[];
  mandir: MandirData;
  lastUpdated: string;
}
