export type TabId =
  | "match"
  | "scorecard"
  | "money"
  | "chat"
  | "locations"
  | "bot"
  | "mandir";

export type PlayerRole = "Batter" | "Bowler" | "All-Rounder" | "Wicket-Keeper";

export interface Player {
  id: string;
  fullName: string;
  nickname?: string;
  role: PlayerRole;
  matches: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
}

export interface GearAssignment {
  id: string;
  item: string; // e.g., "Wind Balls (2)", "Bats", "Stumps", "Tape", "Water"
  assignedTo: string; // Full name
  confirmed: boolean;
}

export interface BallEvent {
  id: string;
  over: number;
  ballInOver: number;
  batsmanId: string;
  bowlerId: string;
  runsOffBat: number;
  extraRuns: number;
  extraType?: "WD" | "NB" | "BYE" | "LB";
  isLegalDelivery: boolean;
  isWicket: boolean;
  wicketType?: "Bowled" | "Caught" | "Run Out" | "LBW" | "Stumped" | "Hit Wicket";
  outBatterId?: string;
  label: string; // e.g., "4", "6", "W", "WD+1"
}

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  overs: string;
  batterName: string;
  wicketType: string;
}

export interface LiveMatch {
  id: string;
  title: string;
  opponent: string;
  groundName: string;
  date: string;
  time: string;
  totalOvers: number;
  tossWinner?: string;
  tossDecision?: "Bat" | "Bowl";
  target?: number;
  runs: number;
  wickets: number;
  legalBalls: number;
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

/* Secret Ganesh Mandir Tab Data */
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
  players: Player[];
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

