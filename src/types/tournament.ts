import { User } from './auth';

export type TournamentStatus =
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  user?: User;
  seed?: number;
  registeredAt?: string;
}

export type MatchStatus = 'PENDING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED';

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  matchOrder: number;
  homeCompetitorId?: string | null;
  awayCompetitorId?: string | null;
  homeCompetitor?: TournamentParticipant | null;
  awayCompetitor?: TournamentParticipant | null;
  homeScore?: number | null;
  awayScore?: number | null;
  winnerId?: string | null;
  nextMatchId?: string | null;
  status: MatchStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tournament {
  id: string;
  title: string;
  description?: string;
  maxParticipants: number;
  status: TournamentStatus;
  participantsCount?: number;
  matchesCount?: number;
  participants?: TournamentParticipant[];
  matches?: Match[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTournamentDto {
  title: string;
  description?: string;
  maxParticipants: number;
}

export interface RegisterParticipantDto {
  userId?: string;
}

export interface SubmitScoreDto {
  homeScore: number;
  awayScore: number;
}
