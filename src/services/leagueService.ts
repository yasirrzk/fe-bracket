import {
  League,
  LeagueTeam,
  LeagueMatch,
  LeagueStandingRow,
  CreateLeagueDto,
  AddLeagueTeamDto,
  SubmitLeagueScoreDto,
} from '../types/league';
import { UserRole } from '../types/auth';
import { telemetry } from './telemetry';

const LEAGUES_STORAGE_KEY = 'simulated_leagues_db';

export function calculateStandings(league: League): LeagueStandingRow[] {
  const teams = league.teams || [];
  const completedMatches = (league.matches || []).filter((m) => m.status === 'COMPLETED');

  const rows: LeagueStandingRow[] = teams.map((team) => {
    let played = 0;
    let won = 0;
    let draw = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    const teamCompletedMatches: { match: LeagueMatch; result: 'W' | 'D' | 'L' }[] = [];

    completedMatches.forEach((m) => {
      const isHome = m.homeTeamId === team.id;
      const isAway = m.awayTeamId === team.id;
      if (!isHome && !isAway) return;

      const myScore = isHome ? m.homeScore ?? 0 : m.awayScore ?? 0;
      const oppScore = isHome ? m.awayScore ?? 0 : m.homeScore ?? 0;

      played++;
      goalsFor += myScore;
      goalsAgainst += oppScore;

      let res: 'W' | 'D' | 'L';
      if (myScore > oppScore) {
        won++;
        res = 'W';
      } else if (myScore === oppScore) {
        draw++;
        res = 'D';
      } else {
        lost++;
        res = 'L';
      }

      teamCompletedMatches.push({ match: m, result: res });
    });

    const goalDifference = goalsFor - goalsAgainst;
    const points =
      won * (league.pointsWin ?? 3) +
      draw * (league.pointsDraw ?? 1) +
      lost * (league.pointsLoss ?? 0);

    // Form: last 5 matches sorted by matchday desc
    teamCompletedMatches.sort((a, b) => b.match.matchday - a.match.matchday);
    const form = teamCompletedMatches.slice(0, 5).map((item) => item.result);

    return {
      teamId: team.id,
      teamName: team.name,
      tag: team.tag,
      rank: 1,
      played,
      won,
      draw,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference,
      points,
      form,
    };
  });

  // Sort standings: Points desc -> GD desc -> GF desc -> Alphabetical
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });

  // Assign ranks
  rows.forEach((row, idx) => {
    row.rank = idx + 1;
  });

  return rows;
}

export function generateRoundRobinMatches(leagueId: string, teams: LeagueTeam[]): LeagueMatch[] {
  if (teams.length < 2) return [];

  const teamList = [...teams];
  const isOdd = teamList.length % 2 !== 0;
  if (isOdd) {
    // Add dummy bye team
    teamList.push({
      id: 'dummy-bye',
      leagueId,
      name: 'BYE',
      createdAt: new Date().toISOString(),
    });
  }

  const n = teamList.length;
  const totalRounds = n - 1;
  const matchesPerRound = n / 2;
  const matches: LeagueMatch[] = [];

  for (let round = 0; round < totalRounds; round++) {
    const matchday = round + 1;

    for (let i = 0; i < matchesPerRound; i++) {
      const homeIdx = (round + i) % (n - 1);
      let awayIdx = (n - 1 - i + round) % (n - 1);
      if (i === 0) {
        awayIdx = n - 1;
      }

      const homeTeam = teamList[homeIdx];
      const awayTeam = teamList[awayIdx];

      // Skip match if involves dummy bye team
      if (homeTeam.id === 'dummy-bye' || awayTeam.id === 'dummy-bye') {
        continue;
      }

      // Alternate home/away sides across rounds
      const finalHome = round % 2 === 0 ? homeTeam : awayTeam;
      const finalAway = round % 2 === 0 ? awayTeam : homeTeam;

      matches.push({
        id: `lmatch-${leagueId.slice(-4)}-w${matchday}-m${matches.length + 1}`,
        leagueId,
        matchday,
        homeTeamId: finalHome.id,
        awayTeamId: finalAway.id,
        homeTeam: finalHome,
        awayTeam: finalAway,
        homeScore: null,
        awayScore: null,
        status: matchday === 1 ? 'READY' : 'PENDING',
      });
    }
  }

  return matches;
}

function createInitialLeagues(): League[] {
  const l1Id = 'league-premier-2026';
  const teams: LeagueTeam[] = [
    { id: 'lt-1', leagueId: l1Id, name: 'Paper Rex', tag: 'PRX', captainName: 'f0rsakeN', city: 'Singapore', createdAt: new Date().toISOString() },
    { id: 'lt-2', leagueId: l1Id, name: 'Sentinels', tag: 'SEN', captainName: 'TenZ', city: 'Los Angeles', createdAt: new Date().toISOString() },
    { id: 'lt-3', leagueId: l1Id, name: 'Fnatic', tag: 'FNC', captainName: 'Boaster', city: 'London', createdAt: new Date().toISOString() },
    { id: 'lt-4', leagueId: l1Id, name: 'T1 Esports', tag: 'T1', captainName: 'Faker', city: 'Seoul', createdAt: new Date().toISOString() },
    { id: 'lt-5', leagueId: l1Id, name: 'DRX Korea', tag: 'DRX', captainName: 'stax', city: 'Seoul', createdAt: new Date().toISOString() },
    { id: 'lt-6', leagueId: l1Id, name: 'Team Secret', tag: 'TS', captainName: 'JessieVash', city: 'Manila', createdAt: new Date().toISOString() },
  ];

  const generatedMatches = generateRoundRobinMatches(l1Id, teams);

  // Pre-fill Matchday 1 results
  const m1Matches = generatedMatches.filter((m) => m.matchday === 1);
  if (m1Matches[0]) {
    m1Matches[0].homeScore = 2;
    m1Matches[0].awayScore = 0;
    m1Matches[0].status = 'COMPLETED';
    m1Matches[0].playedAt = new Date(Date.now() - 3600000 * 48).toISOString();
  }
  if (m1Matches[1]) {
    m1Matches[1].homeScore = 1;
    m1Matches[1].awayScore = 1;
    m1Matches[1].status = 'COMPLETED';
    m1Matches[1].playedAt = new Date(Date.now() - 3600000 * 44).toISOString();
  }
  if (m1Matches[2]) {
    m1Matches[2].homeScore = 0;
    m1Matches[2].awayScore = 2;
    m1Matches[2].status = 'COMPLETED';
    m1Matches[2].playedAt = new Date(Date.now() - 3600000 * 40).toISOString();
  }

  // Pre-fill Matchday 2 results
  const m2Matches = generatedMatches.filter((m) => m.matchday === 2);
  if (m2Matches[0]) {
    m2Matches[0].homeScore = 2;
    m2Matches[0].awayScore = 1;
    m2Matches[0].status = 'COMPLETED';
    m2Matches[0].playedAt = new Date(Date.now() - 3600000 * 24).toISOString();
  }
  if (m2Matches[1]) {
    m2Matches[1].homeScore = 2;
    m2Matches[1].awayScore = 2;
    m2Matches[1].status = 'COMPLETED';
    m2Matches[1].playedAt = new Date(Date.now() - 3600000 * 20).toISOString();
  }
  if (m2Matches[2]) {
    m2Matches[2].homeScore = 3;
    m2Matches[2].awayScore = 0;
    m2Matches[2].status = 'COMPLETED';
    m2Matches[2].playedAt = new Date(Date.now() - 3600000 * 16).toISOString();
  }

  // Set Matchday 3 as READY for live testing
  generatedMatches
    .filter((m) => m.matchday === 3)
    .forEach((m) => {
      m.status = 'READY';
    });

  const league1: League = {
    id: l1Id,
    title: 'TURNAMEN ADIK ADIK',
    season: 'Regular Season 1',
    description: 'TOURNAMENT EFOOTBALL LIVE TIKTOK : DENNY DIUDARA.',
    game: 'EFOOTBALL MOBILE',
    status: 'IN_PROGRESS',
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    teamsCount: teams.length,
    matchesCount: generatedMatches.length,
    teams,
    matches: generatedMatches,
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // League 2: Registration Open (for testing add team & generate schedule)
  const l2Id = 'league-open-rookie-2026';
  const rookieTeams: LeagueTeam[] = [
    { id: 'rt-1', leagueId: l2Id, name: 'BOOM Esports', tag: 'BOM', captainName: 'blaZek1ng', createdAt: new Date().toISOString() },
    { id: 'rt-2', leagueId: l2Id, name: 'Alter Ego', tag: 'AE', captainName: 'Kush', createdAt: new Date().toISOString() },
    { id: 'rt-3', leagueId: l2Id, name: 'Rex Regum Qeon', tag: 'RRQ', captainName: 'fl1pzjder', createdAt: new Date().toISOString() },
    { id: 'rt-4', leagueId: l2Id, name: 'Bigetron Arctic', tag: 'BTR', captainName: 'NcSlasher', createdAt: new Date().toISOString() },
  ];

  const league2: League = {
    id: l2Id,
    title: 'Rookie Division Championship',
    season: 'Season 2026/A',
    description: 'Liga divisi rookie terbuka untuk tim berkembang. Pendaftaran tim masih dibuka.',
    game: 'Counter-Strike 2',
    status: 'REGISTRATION_OPEN',
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    teamsCount: rookieTeams.length,
    matchesCount: 0,
    teams: rookieTeams,
    matches: [],
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return [league1, league2];
}

class LeagueEngineService {
  private leagues: League[];

  constructor() {
    const saved = localStorage.getItem(LEAGUES_STORAGE_KEY);
    if (saved) {
      try {
        this.leagues = JSON.parse(saved);
      } catch {
        this.leagues = createInitialLeagues();
        this.save();
      }
    } else {
      this.leagues = createInitialLeagues();
      this.save();
    }
  }

  private save() {
    localStorage.setItem(LEAGUES_STORAGE_KEY, JSON.stringify(this.leagues));
  }

  reset() {
    this.leagues = createInitialLeagues();
    this.save();
    telemetry.addLog({
      method: 'POST',
      url: '/leagues/reset [Simulated Engine]',
      status: 200,
      responseData: { message: 'League database reset to default seed' },
    });
  }

  getLeagues(status?: string): League[] {
    let result = [...this.leagues];
    if (status && status !== 'ALL') {
      result = result.filter((l) => l.status === status);
    }
    telemetry.addLog({
      method: 'GET',
      url: `/leagues${status ? `?status=${status}` : ''} [Simulated]`,
      status: 200,
      responseData: result,
    });
    return result;
  }

  getLeagueById(id: string): League {
    const league = this.leagues.find((l) => l.id === id);
    if (!league) throw new Error(`Liga dengan ID "${id}" tidak ditemukan`);
    telemetry.addLog({
      method: 'GET',
      url: `/leagues/${id} [Simulated]`,
      status: 200,
      responseData: league,
    });
    return league;
  }

  createLeague(dto: CreateLeagueDto, userRole?: UserRole): League {
    if (userRole !== 'ADMIN') {
      throw new Error('403 Forbidden: Hanya ADMIN yang diizinkan untuk membuat liga baru');
    }

    const newId = `league-${Date.now().toString(36)}`;
    const newLeague: League = {
      id: newId,
      title: dto.title.trim(),
      season: dto.season.trim(),
      description: dto.description?.trim(),
      game: dto.game?.trim() || 'General Esports',
      status: 'REGISTRATION_OPEN',
      pointsWin: dto.pointsWin ?? 3,
      pointsDraw: dto.pointsDraw ?? 1,
      pointsLoss: dto.pointsLoss ?? 0,
      teamsCount: 0,
      matchesCount: 0,
      teams: [],
      matches: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.leagues.unshift(newLeague);
    this.save();

    telemetry.addLog({
      method: 'POST',
      url: '/leagues [Simulated]',
      status: 201,
      requestData: dto,
      responseData: newLeague,
    });

    return newLeague;
  }

  addTeam(leagueId: string, dto: AddLeagueTeamDto, userRole?: UserRole): LeagueTeam {
    if (userRole !== 'ADMIN') {
      throw new Error('403 Forbidden: Hanya ADMIN yang diizinkan untuk menambahkan tim ke liga');
    }

    const league = this.getLeagueById(leagueId);
    const existing = league.teams.find((t) => t.name.toLowerCase() === dto.name.trim().toLowerCase());
    if (existing) {
      throw new Error(`Tim dengan nama "${dto.name}" sudah terdaftar di liga ini`);
    }

    const newTeam: LeagueTeam = {
      id: `lt-${Date.now().toString(36)}`,
      leagueId,
      name: dto.name.trim(),
      tag: dto.tag?.trim().toUpperCase(),
      captainName: dto.captainName?.trim(),
      createdAt: new Date().toISOString(),
    };

    league.teams.push(newTeam);
    league.teamsCount = league.teams.length;
    league.updatedAt = new Date().toISOString();

    // If matches were already scheduled, recalculate schedule
    if (league.status === 'IN_PROGRESS' || league.matches.length > 0) {
      league.matches = generateRoundRobinMatches(league.id, league.teams);
      league.matchesCount = league.matches.length;
    }

    this.save();

    telemetry.addLog({
      method: 'POST',
      url: `/leagues/${leagueId}/teams [Simulated]`,
      status: 201,
      requestData: dto,
      responseData: newTeam,
    });

    return newTeam;
  }

  generateSchedule(leagueId: string, userRole?: UserRole): League {
    if (userRole !== 'ADMIN') {
      throw new Error('403 Forbidden: Hanya ADMIN yang diizinkan untuk men-generate jadwal liga');
    }

    const league = this.getLeagueById(leagueId);
    if (league.teams.length < 2) {
      throw new Error('Minimal 2 tim dibutuhkan untuk membuat jadwal liga round-robin');
    }

    const matches = generateRoundRobinMatches(league.id, league.teams);
    league.matches = matches;
    league.matchesCount = matches.length;
    league.status = 'IN_PROGRESS';
    league.updatedAt = new Date().toISOString();

    this.save();

    telemetry.addLog({
      method: 'POST',
      url: `/leagues/${leagueId}/generate-schedule [Simulated]`,
      status: 200,
      responseData: { matchesCount: matches.length },
    });

    return league;
  }

  submitScore(matchId: string, dto: SubmitLeagueScoreDto, userRole?: UserRole): LeagueMatch {
    if (userRole !== 'ADMIN') {
      throw new Error('403 Forbidden: Hanya ADMIN yang berhak menginput skor pertandingan liga');
    }

    let foundMatch: LeagueMatch | undefined;
    let foundLeague: League | undefined;

    for (const l of this.leagues) {
      const m = l.matches?.find((item) => item.id === matchId);
      if (m) {
        foundMatch = m;
        foundLeague = l;
        break;
      }
    }

    if (!foundMatch || !foundLeague) {
      throw new Error(`Pertandingan liga dengan ID "${matchId}" tidak ditemukan`);
    }

    foundMatch.homeScore = dto.homeScore;
    foundMatch.awayScore = dto.awayScore;
    foundMatch.status = 'COMPLETED';
    foundMatch.playedAt = new Date().toISOString();

    // Check if next matchday can be unlocked to READY
    const nextMatchdayMatches = foundLeague.matches.filter(
      (m) => m.matchday === foundMatch!.matchday + 1 && m.status === 'PENDING'
    );
    nextMatchdayMatches.forEach((m) => {
      m.status = 'READY';
    });

    // Check if all matches are completed
    const allCompleted = foundLeague.matches.every((m) => m.status === 'COMPLETED');
    if (allCompleted) {
      foundLeague.status = 'COMPLETED';
    }

    foundLeague.updatedAt = new Date().toISOString();
    this.save();

    telemetry.addLog({
      method: 'POST',
      url: `/leagues/matches/${matchId}/score [Simulated]`,
      status: 200,
      requestData: dto,
      responseData: foundMatch,
    });

    return foundMatch;
  }
}

export const leagueService = new LeagueEngineService();
