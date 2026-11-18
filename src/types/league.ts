export type LeagueStatus = 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED';

export interface LeagueTeam {
  id: string;
  leagueId: string;
  name: string;
  tag?: string;
  captainName?: string;
  city?: string;
  createdAt: string;
}

export interface LeagueMatch {
  id: string;
  leagueId: string;
  matchday: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: LeagueTeam;
  awayTeam: LeagueTeam;
  homeScore?: number | null;
  awayScore?: number | null;
  status: 'PENDING' | 'READY' | 'COMPLETED';
  playedAt?: string;
}

export interface LeagueStandingRow {
  teamId: string;
  teamName: string;
  tag?: string;
  rank: number;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface League {
  id: string;
  title: string;
  season: string;
  description?: string;
  game?: string;
  status: LeagueStatus;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  teamsCount?: number;
  matchesCount?: number;
  teams: LeagueTeam[];
  matches: LeagueMatch[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeagueDto {
  title: string;
  season: string;
  description?: string;
  game?: string;
  pointsWin?: number;
  pointsDraw?: number;
  pointsLoss?: number;
}

export interface AddLeagueTeamDto {
  name: string;
  tag?: string;
  captainName?: string;
}

export interface SubmitLeagueScoreDto {
  homeScore: number;
  awayScore: number;
}
