

export enum MatchFormat {
  T10 = 'T10',
  T20 = 'T20',
  ODI = 'ODI',
}

export interface Tournament {
  id: string;
  name: string;
  organizer: string;
  format: MatchFormat;
  startDate: string;
  endDate: string;
  location: string;
  logoUrl?: string;
  teams: string[]; // array of team IDs
  matches: string[]; // array of match IDs
  createdAt: number; // Unix timestamp for TTL policy
}

export enum PlayerRole {
  BATSMAN = 'Batsman',
  BOWLER = 'Bowler',
  ALL_ROUNDER = 'All-Rounder',
  WICKET_KEEPER = 'Wicket-Keeper',
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  jerseyNumber?: number;
  photoUrl?: string;
}

export interface Team {
  id:string;
  name: string;
  logoUrl?: string;
  players: Player[];
  captainId?: string;
  wicketKeeperId?: string;
}

export type BallEvent = '0' | '1' | '2' | '3' | '4' | '5' | '6' | 'W' | 'WD' | 'NB' | 'LB';

export interface Ball {
  ballNumber: number;
  overNumber: number;
  event: BallEvent;
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
  batsmanId: string;
  bowlerId: string;
}

export interface BatsmanStats {
  runs: number;
  balls: number;
}

export interface BowlerStats {
  overs: number;
  balls: number;
  runs: number;
  wickets: number;
}

export interface Innings {
  battingTeamId: string;
  bowlingTeamId: string;
  score: number;
  wickets: number;
  overs: number;
  balls: number;
  timeline: Ball[];
  batsmanStats: { [playerId: string]: BatsmanStats };
  bowlerStats: { [playerId: string]: BowlerStats };
  target?: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  teamAId: string;
  teamBId: string;
  status: 'upcoming' | 'live' | 'paused' | 'finished';
  tossWinnerId: string;
  decision: 'bat' | 'bowl';
  innings1: Innings;
  innings2?: Innings;
  currentInnings: 1 | 2;
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  currentOver: Ball[];
}