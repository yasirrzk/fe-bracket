import { Tournament, Match, TournamentParticipant } from '../types/tournament';
import { User } from '../types/auth';

export const INITIAL_USERS: User[] = [
  { id: 'usr-admin-1', email: 'admin@bracketops.gg', username: 'OverlordAdmin', role: 'ADMIN' },
  { id: 'usr-ply-1', email: 'faker@t1.gg', username: 'Faker_T1', role: 'USER' },
  { id: 'usr-ply-2', email: 'tenz@sentinels.gg', username: 'TenZ_Aim', role: 'USER' },
  { id: 'usr-ply-3', email: 's1mple@navi.gg', username: 's1mple_CS', role: 'USER' },
  { id: 'usr-ply-4', email: 'shroud@mixer.gg', username: 'Shroud_Bot', role: 'USER' },
  { id: 'usr-ply-5', email: 'demon1@eg.gg', username: 'Demon1_Jett', role: 'USER' },
  { id: 'usr-ply-6', email: 'zywoo@vitality.gg', username: 'ZywOo_Star', role: 'USER' },
  { id: 'usr-ply-7', email: 'boaster@fnatic.gg', username: 'Boaster_IGL', role: 'USER' },
  { id: 'usr-ply-8', email: 'asuna@100t.gg', username: 'Asuna_Duelist', role: 'USER' },
];

export function createInitialTournaments(): Tournament[] {
  // Pre-seed an active tournament with 8 participants and Round 1 generated
  const t1Id = 'tr-championship-2026';
  const participants: TournamentParticipant[] = INITIAL_USERS.slice(1, 9).map((u, idx) => ({
    id: `part-${idx + 1}`,
    tournamentId: t1Id,
    userId: u.id,
    user: u,
    seed: idx + 1,
    registeredAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  }));

  const finalMatch: Match = {
    id: 'match-r3-1',
    tournamentId: t1Id,
    round: 3,
    matchOrder: 1,
    homeCompetitorId: null,
    awayCompetitorId: null,
    homeScore: null,
    awayScore: null,
    status: 'PENDING',
  };

  const semiMatch1: Match = {
    id: 'match-r2-1',
    tournamentId: t1Id,
    round: 2,
    matchOrder: 1,
    homeCompetitorId: null,
    awayCompetitorId: null,
    homeScore: null,
    awayScore: null,
    status: 'PENDING',
    nextMatchId: 'match-r3-1', // order 1 (ganjil) -> goes to home of r3-1
  };

  const semiMatch2: Match = {
    id: 'match-r2-2',
    tournamentId: t1Id,
    round: 2,
    matchOrder: 2,
    homeCompetitorId: null,
    awayCompetitorId: null,
    homeScore: null,
    awayScore: null,
    status: 'PENDING',
    nextMatchId: 'match-r3-1', // order 2 (genap) -> goes to away of r3-1
  };

  const qfMatch1: Match = {
    id: 'match-r1-1',
    tournamentId: t1Id,
    round: 1,
    matchOrder: 1,
    homeCompetitorId: participants[0].id,
    awayCompetitorId: participants[7].id,
    homeCompetitor: participants[0],
    awayCompetitor: participants[7],
    homeScore: 2,
    awayScore: 0,
    winnerId: participants[0].id,
    nextMatchId: 'match-r2-1', // order 1 (ganjil) -> goes to home of r2-1
    status: 'COMPLETED',
  };

  // Pre-propagate winner of qfMatch1 into semiMatch1 home
  semiMatch1.homeCompetitorId = participants[0].id;
  semiMatch1.homeCompetitor = participants[0];

  const qfMatch2: Match = {
    id: 'match-r1-2',
    tournamentId: t1Id,
    round: 1,
    matchOrder: 2,
    homeCompetitorId: participants[3].id,
    awayCompetitorId: participants[4].id,
    homeCompetitor: participants[3],
    awayCompetitor: participants[4],
    homeScore: null,
    awayScore: null,
    nextMatchId: 'match-r2-1', // order 2 (genap) -> goes to away of r2-1
    status: 'READY',
  };

  const qfMatch3: Match = {
    id: 'match-r1-3',
    tournamentId: t1Id,
    round: 1,
    matchOrder: 3,
    homeCompetitorId: participants[1].id,
    awayCompetitorId: participants[6].id,
    homeCompetitor: participants[1],
    awayCompetitor: participants[6],
    homeScore: null,
    awayScore: null,
    nextMatchId: 'match-r2-2', // order 3 (ganjil) -> goes to home of r2-2
    status: 'READY',
  };

  const qfMatch4: Match = {
    id: 'match-r1-4',
    tournamentId: t1Id,
    round: 1,
    matchOrder: 4,
    homeCompetitorId: participants[2].id,
    awayCompetitorId: participants[5].id,
    homeCompetitor: participants[2],
    awayCompetitor: participants[5],
    homeScore: null,
    awayScore: null,
    nextMatchId: 'match-r2-2', // order 4 (genap) -> goes to away of r2-2
    status: 'READY',
  };

  const matches = [qfMatch1, qfMatch2, qfMatch3, qfMatch4, semiMatch1, semiMatch2, finalMatch];

  const tournament1: Tournament = {
    id: t1Id,
    title: 'VALORANT CYBER CLASH 2026',
    description: 'Turnamen Knockout Premier Esport. Single Elimination, Best of 3.',
    maxParticipants: 8,
    status: 'IN_PROGRESS',
    participantsCount: 8,
    matchesCount: matches.length,
    participants,
    matches,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const tournament2: Tournament = {
    id: 'tr-apex-legends-open',
    title: 'APEX LEGENDS OPEN TOURNAMENT',
    description: 'Bagan registrasi terbuka untuk tim kualifikasi regional. Kuota 16 peserta.',
    maxParticipants: 16,
    status: 'REGISTRATION_OPEN',
    participantsCount: 4,
    matchesCount: 0,
    participants: participants.slice(0, 4),
    matches: [],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const tournament3: Tournament = {
    id: 'tr-cs2-major-invitational',
    title: 'COUNTER-STRIKE 2 MAJOR QUALIFIER',
    description: 'Turnamen knockout kualifikasi 4 tim yang telah selesai.',
    maxParticipants: 4,
    status: 'COMPLETED',
    participantsCount: 4,
    matchesCount: 3,
    participants: participants.slice(0, 4),
    matches: [
      {
        id: 'cs-m1',
        tournamentId: 'tr-cs2-major-invitational',
        round: 1,
        matchOrder: 1,
        homeCompetitorId: participants[0].id,
        awayCompetitorId: participants[1].id,
        homeCompetitor: participants[0],
        awayCompetitor: participants[1],
        homeScore: 2,
        awayScore: 1,
        winnerId: participants[0].id,
        nextMatchId: 'cs-final',
        status: 'COMPLETED',
      },
      {
        id: 'cs-m2',
        tournamentId: 'tr-cs2-major-invitational',
        round: 1,
        matchOrder: 2,
        homeCompetitorId: participants[2].id,
        awayCompetitorId: participants[3].id,
        homeCompetitor: participants[2],
        awayCompetitor: participants[3],
        homeScore: 0,
        awayScore: 2,
        winnerId: participants[3].id,
        nextMatchId: 'cs-final',
        status: 'COMPLETED',
      },
      {
        id: 'cs-final',
        tournamentId: 'tr-cs2-major-invitational',
        round: 2,
        matchOrder: 1,
        homeCompetitorId: participants[0].id,
        awayCompetitorId: participants[3].id,
        homeCompetitor: participants[0],
        awayCompetitor: participants[3],
        homeScore: 2,
        awayScore: 0,
        winnerId: participants[0].id,
        nextMatchId: null,
        status: 'COMPLETED',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  };

  return [tournament1, tournament2, tournament3];
}
