import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { telemetry } from './telemetry';
import {
  Tournament,
  CreateTournamentDto,
  RegisterParticipantDto,
  SubmitScoreDto,
  Match,
  TournamentParticipant,
} from '../types/tournament';
import { LoginDto, RegisterDto, AuthResponse, UserRole } from '../types/auth';
import { INITIAL_USERS } from './mockData';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://be-bracket.vercel.app';

// Local storage keys
export const TOKEN_KEY = 'bracket_ops_token';
export const REFRESH_TOKEN_KEY = 'bracket_ops_refresh_token';
export const USER_KEY = 'bracket_ops_user';
export const MOCK_MODE_KEY = 'bracket_ops_mock_mode';

// Event triggers for global notification handling
type HttpEventCallback = (payload: any) => void;
const eventListeners: { [event: string]: Set<HttpEventCallback> } = {
  unauthorized: new Set(),
  forbidden: new Set(),
  rateLimited: new Set(),
  networkError: new Set(),
};

export function subscribeHttpEvent(
  event: 'unauthorized' | 'forbidden' | 'rateLimited' | 'networkError',
  cb: HttpEventCallback
) {
  eventListeners[event].add(cb);
  return () => {
    eventListeners[event].delete(cb);
  };
}

function dispatchHttpEvent(event: string, payload?: any) {
  eventListeners[event]?.forEach((cb) => cb(payload));
}

// Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT & Record Telemetry
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach telemetry metadata
    (config as any).__startTime = Date.now();
    const logId = telemetry.addLog({
      method: (config.method || 'GET').toUpperCase(),
      url: `${config.baseURL || ''}${config.url || ''}`,
      status: 'PENDING',
      requestData: config.data,
    });
    (config as any).__telemetryLogId = logId;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Record Telemetry & Handle 401, 403, 429
apiClient.interceptors.response.use(
  (response) => {
    const config = response.config as any;
    const durationMs = config.__startTime ? Date.now() - config.__startTime : undefined;
    if (config.__telemetryLogId) {
      telemetry.updateLog(config.__telemetryLogId, {
        status: response.status,
        durationMs,
        responseData: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = (error.config || {}) as any;
    const durationMs = config.__startTime ? Date.now() - config.__startTime : undefined;
    const status = error.response ? error.response.status : 'ERROR';
    const responseData = error.response ? error.response.data : null;

    if (config.__telemetryLogId) {
      telemetry.updateLog(config.__telemetryLogId, {
        status: typeof status === 'number' ? status : 'ERROR',
        durationMs,
        responseData,
        errorMessage: error.message,
      });
    }

    // Handle Specific Backend HTTP Status Codes (from GEMINI.md)
    if (status === 401) {
      // 401 Unauthorized: Token revoked or invalid session jti
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      dispatchHttpEvent('unauthorized', {
        message: 'Sesi anda telah berakhir atau token telah dicabut (Redis blacklist). Silakan masuk kembali.',
      });
    } else if (status === 403) {
      // 403 Forbidden: User role is not authorized for mutation
      dispatchHttpEvent('forbidden', {
        message: 'Akses Ditolak: Hanya ADMIN yang diizinkan untuk melakukan aksi ini.',
      });
    } else if (status === 429) {
      // 429 Too Many Requests: ThrottlerGuard triggered
      const retryAfter = error.response?.headers['retry-after'] || '3';
      dispatchHttpEvent('rateLimited', {
        retryAfter: parseInt(retryAfter, 10) || 3,
        message: 'Batas request tercapai (Rate Limit 3 req/sec). Mohon tunggu beberapa detik.',
      });
    } else if (status === 500) {
      dispatchHttpEvent('networkError', {
        message: 'Backend server mengalami kendala koneksi database (500). Sistem dialihkan ke mode Simulated Engine.',
      });
    }

    return Promise.reject(error);
  }
);

class SimulatedTournamentEngine {
  private tournaments: Tournament[];
  private users = INITIAL_USERS;

  constructor() {
    const saved = localStorage.getItem('simulated_tournaments_db');
    const dummyIds = new Set(['tr-championship-2026', 'tr-apex-legends-open', 'tr-cs2-major-invitational']);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.tournaments = Array.isArray(parsed) ? parsed.filter((t: Tournament) => !dummyIds.has(t.id)) : [];
      } catch {
        this.tournaments = [];
      }
    } else {
      this.tournaments = [];
    }
    this.save();
  }

  private save() {
    localStorage.setItem('simulated_tournaments_db', JSON.stringify(this.tournaments));
  }

  reset() {
    this.tournaments = [];
    this.save();
  }

  getTournaments(status?: string): Tournament[] {
    if (!status) return [...this.tournaments];
    return this.tournaments.filter((t) => t.status === status);
  }

  getTournamentById(id: string): Tournament | undefined {
    return this.tournaments.find((t) => t.id === id);
  }

  createTournament(dto: CreateTournamentDto): Tournament {
    const newTournament: Tournament = {
      id: `tr-${Date.now().toString(36)}`,
      title: dto.title,
      description: dto.description || 'Open tournament created via Engine',
      maxParticipants: dto.maxParticipants,
      status: 'REGISTRATION_OPEN',
      participantsCount: 0,
      matchesCount: 0,
      participants: [],
      matches: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tournaments.unshift(newTournament);
    this.save();
    return newTournament;
  }

  registerParticipant(tournamentId: string, participantNameOrUserId?: string): TournamentParticipant {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.status !== 'REGISTRATION_OPEN') {
      throw new Error('Pendaftaran turnamen sudah ditutup atau turnamen sedang berjalan.');
    }
    const participants = tournament.participants || [];
    if (participants.length >= tournament.maxParticipants) {
      throw new Error('Kapasitas peserta turnamen telah penuh.');
    }

    // Match by user id or by name, or generate a custom team/player
    let participantUser = this.users.find(
      (u) => u.id === participantNameOrUserId || u.username.toLowerCase() === participantNameOrUserId?.toLowerCase()
    );

    if (!participantUser) {
      const customName = participantNameOrUserId?.trim() || `Team_${participants.length + 1}`;
      participantUser = {
        id: `usr-custom-${Date.now().toString(36)}-${participants.length}`,
        username: customName,
        email: `${customName.toLowerCase().replace(/\s+/g, '')}@bracketops.gg`,
        role: 'USER',
      };
    }

    if (participants.some((p) => p.user?.username.toLowerCase() === participantUser?.username.toLowerCase())) {
      throw new Error(`Peserta "${participantUser.username}" sudah terdaftar pada turnamen ini`);
    }

    const participant: TournamentParticipant = {
      id: `part-${Date.now().toString(36)}`,
      tournamentId,
      userId: participantUser.id,
      user: participantUser,
      seed: participants.length + 1,
      registeredAt: new Date().toISOString(),
    };

    participants.push(participant);
    tournament.participants = participants;
    tournament.participantsCount = participants.length;
    this.save();
    return participant;
  }

  generateBracket(tournamentId: string): Tournament {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) throw new Error('Tournament not found');
    const participants = tournament.participants || [];
    if (participants.length < 2) {
      throw new Error('Minimal 2 peserta dibutuhkan untuk membentuk bracket');
    }

    // Determine bracket size: nearest next power of 2
    let bracketSize = 2;
    while (bracketSize < participants.length) {
      bracketSize *= 2;
    }
    const totalRounds = Math.log2(bracketSize);

    const matches: Match[] = [];
    const roundMatchMap: { [round: number]: Match[] } = {};

    for (let r = 1; r <= totalRounds; r++) {
      const matchCountInRound = bracketSize / Math.pow(2, r);
      roundMatchMap[r] = [];

      for (let order = 1; order <= matchCountInRound; order++) {
        const match: Match = {
          id: `match-tr-${tournamentId.slice(-4)}-r${r}-m${order}`,
          tournamentId,
          round: r,
          matchOrder: order,
          homeCompetitorId: null,
          awayCompetitorId: null,
          homeScore: null,
          awayScore: null,
          winnerId: null,
          nextMatchId: null,
          status: 'PENDING',
        };
        roundMatchMap[r].push(match);
        matches.push(match);
      }
    }

    // Link parent rounds to nextMatchId
    // Invariant: matchOrder ganjil -> slot Home di nextMatchId, nomor genap -> slot Away
    for (let r = 1; r < totalRounds; r++) {
      const currentRoundMatches = roundMatchMap[r];
      const nextRoundMatches = roundMatchMap[r + 1];

      currentRoundMatches.forEach((match) => {
        const nextMatchOrder = Math.ceil(match.matchOrder / 2);
        const nextMatch = nextRoundMatches.find((m) => m.matchOrder === nextMatchOrder);
        if (nextMatch) {
          match.nextMatchId = nextMatch.id;
        }
      });
    }

    // Seed Round 1 participants
    const r1Matches = roundMatchMap[1];
    for (let i = 0; i < r1Matches.length; i++) {
      const match = r1Matches[i];
      const homePart = participants[i * 2] || null;
      const awayPart = participants[i * 2 + 1] || null;

      match.homeCompetitorId = homePart?.id || null;
      match.homeCompetitor = homePart;
      match.awayCompetitorId = awayPart?.id || null;
      match.awayCompetitor = awayPart;

      if (homePart && awayPart) {
        match.status = 'READY';
      } else if (homePart && !awayPart) {
        // Automatic BYE advancement
        match.status = 'COMPLETED';
        match.winnerId = homePart.id;
        match.homeScore = 1;
        match.awayScore = 0;
        this.promoteWinner(matches, match, homePart);
      } else {
        match.status = 'PENDING';
      }
    }

    tournament.matches = matches;
    tournament.matchesCount = matches.length;
    tournament.status = 'IN_PROGRESS';
    this.save();
    return tournament;
  }

  private promoteWinner(matches: Match[], currentMatch: Match, winnerParticipant: TournamentParticipant) {
    if (!currentMatch.nextMatchId) return;
    const nextMatch = matches.find((m) => m.id === currentMatch.nextMatchId);
    if (!nextMatch) return;

    // Invariant: Ganjil -> Home, Genap -> Away
    if (currentMatch.matchOrder % 2 !== 0) {
      nextMatch.homeCompetitorId = winnerParticipant.id;
      nextMatch.homeCompetitor = winnerParticipant;
    } else {
      nextMatch.awayCompetitorId = winnerParticipant.id;
      nextMatch.awayCompetitor = winnerParticipant;
    }

    if (nextMatch.homeCompetitorId && nextMatch.awayCompetitorId) {
      nextMatch.status = 'READY';
    }
  }

  submitScore(matchId: string, homeScore: number, awayScore: number): Match {
    if (homeScore === awayScore) {
      throw new Error('Pertandingan knockout dilarang berakhir seri (Draw scores forbidden)');
    }

    let foundMatch: Match | undefined;
    let foundTournament: Tournament | undefined;

    for (const t of this.tournaments) {
      const m = t.matches?.find((item) => item.id === matchId);
      if (m) {
        foundMatch = m;
        foundTournament = t;
        break;
      }
    }

    if (!foundMatch || !foundTournament) {
      throw new Error('Match not found');
    }

    if (foundMatch.status === 'PENDING') {
      throw new Error('Pertandingan belum siap karena salah satu peserta belum terisi');
    }

    const winnerId = homeScore > awayScore ? foundMatch.homeCompetitorId : foundMatch.awayCompetitorId;
    const winnerParticipant =
      homeScore > awayScore ? foundMatch.homeCompetitor : foundMatch.awayCompetitor;

    if (!winnerId || !winnerParticipant) {
      throw new Error('Kompetitor pemenang tidak valid');
    }

    foundMatch.homeScore = homeScore;
    foundMatch.awayScore = awayScore;
    foundMatch.winnerId = winnerId;
    foundMatch.status = 'COMPLETED';

    // Propagate winner to nextMatchId
    if (foundMatch.nextMatchId && foundTournament.matches) {
      this.promoteWinner(foundTournament.matches, foundMatch, winnerParticipant);
    } else {
      // Grand final finished!
      foundTournament.status = 'COMPLETED';
    }

    this.save();
    return foundMatch;
  }
}

export const simulatedEngine = new SimulatedTournamentEngine();

export const api = {
  isMockMode(): boolean {
    const val = localStorage.getItem(MOCK_MODE_KEY);
    return val === null ? true : val === 'true';
  },

  setMockMode(enable: boolean) {
    localStorage.setItem(MOCK_MODE_KEY, enable ? 'true' : 'false');
  },

  // Auth Endpoints
  async register(dto: RegisterDto): Promise<AuthResponse> {
    if (api.isMockMode()) {
      const newUser = {
        id: `usr-${Date.now().toString(36)}`,
        email: dto.email,
        username: dto.username,
        role: dto.role || 'USER',
        createdAt: new Date().toISOString(),
      };
      const resp: AuthResponse = {
        user: newUser,
        accessToken: `mock-jwt-token-${newUser.id}`,
        refreshToken: `mock-refresh-token-${newUser.id}`,
      };
      telemetry.addLog({
        method: 'POST',
        url: '/auth/register [Simulated]',
        status: 201,
        requestData: { email: dto.email, username: dto.username, role: dto.role },
        responseData: resp,
      });
      return resp;
    }
    const res = await apiClient.post('/auth/register', dto);
    return res.data?.data || res.data;
  },

  async login(dto: LoginDto): Promise<AuthResponse> {
    if (api.isMockMode()) {
      const user = INITIAL_USERS.find((u) => u.email === dto.email) || {
        id: 'usr-custom-login',
        email: dto.email,
        username: dto.email.split('@')[0],
        role: 'USER' as UserRole,
      };
      const resp: AuthResponse = {
        user,
        accessToken: `mock-jwt-${user.id}`,
        refreshToken: `mock-refresh-${user.id}`,
      };
      telemetry.addLog({
        method: 'POST',
        url: '/auth/login [Simulated]',
        status: 200,
        requestData: { email: dto.email },
        responseData: resp,
      });
      return resp;
    }
    const res = await apiClient.post('/auth/login', dto);
    return res.data?.data || res.data;
  },

  async logout(): Promise<void> {
    if (api.isMockMode()) {
      telemetry.addLog({
        method: 'POST',
        url: '/auth/logout [Simulated Redis Revocation]',
        status: 200,
      });
      return;
    }
    await apiClient.post('/auth/logout');
  },

  async getMe(): Promise<any> {
    if (api.isMockMode()) {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : INITIAL_USERS[0];
    }
    const res = await apiClient.get('/auth/me');
    return res.data?.data || res.data;
  },

  // Tournaments Endpoints
  async getTournaments(status?: string): Promise<Tournament[]> {
    if (api.isMockMode()) {
      const data = simulatedEngine.getTournaments(status);
      telemetry.addLog({
        method: 'GET',
        url: `/tournaments${status ? `?status=${status}` : ''} [Simulated]`,
        status: 200,
        responseData: data,
      });
      return data;
    }
    const res = await apiClient.get('/tournaments', { params: { status } });
    return res.data?.data || res.data;
  },

  async getTournamentById(id: string): Promise<Tournament> {
    if (api.isMockMode()) {
      const data = simulatedEngine.getTournamentById(id);
      if (!data) throw new Error('Turnamen tidak ditemukan');
      telemetry.addLog({
        method: 'GET',
        url: `/tournaments/${id} [Simulated]`,
        status: 200,
        responseData: data,
      });
      return data;
    }
    const res = await apiClient.get(`/tournaments/${id}`);
    return res.data?.data || res.data;
  },

  async createTournament(dto: CreateTournamentDto, currentUserRole?: UserRole): Promise<Tournament> {
    if (currentUserRole !== 'ADMIN') {
      dispatchHttpEvent('forbidden', {
        message: 'Akses Ditolak: Hanya ADMIN yang diizinkan untuk membuat turnamen.',
      });
      throw new Error('Akses dibatasi hanya untuk Admin');
    }

    if (api.isMockMode()) {
      const data = simulatedEngine.createTournament(dto);
      telemetry.addLog({
        method: 'POST',
        url: '/tournaments [Simulated]',
        status: 201,
        requestData: dto,
        responseData: data,
      });
      return data;
    }
    const res = await apiClient.post('/tournaments', dto);
    return res.data?.data || res.data;
  },

  async registerParticipant(
    tournamentId: string,
    dto?: RegisterParticipantDto,
    currentUserRole?: UserRole
  ): Promise<TournamentParticipant> {
    if (currentUserRole !== 'ADMIN') {
      dispatchHttpEvent('forbidden', {
        message: 'Akses Ditolak: Hanya ADMIN yang berhak mengisi dan mendaftarkan peserta turnamen.',
      });
      throw new Error('Aksi pengisian peserta dibatasi hanya untuk Admin');
    }

    if (api.isMockMode()) {
      const data = simulatedEngine.registerParticipant(tournamentId, dto?.userId);
      telemetry.addLog({
        method: 'POST',
        url: `/tournaments/${tournamentId}/register [Simulated]`,
        status: 201,
        requestData: dto,
        responseData: data,
      });
      return data;
    }
    const res = await apiClient.post(`/tournaments/${tournamentId}/register`, dto || {});
    return res.data?.data || res.data;
  },

  async generateBracket(tournamentId: string, currentUserRole?: UserRole): Promise<Tournament> {
    if (currentUserRole !== 'ADMIN') {
      dispatchHttpEvent('forbidden', {
        message: 'Akses Ditolak: Hanya ADMIN yang memiliki wewenang untuk men-generate bracket turnamen.',
      });
      throw new Error('Akses dibatasi hanya untuk Admin');
    }

    if (api.isMockMode()) {
      const data = simulatedEngine.generateBracket(tournamentId);
      telemetry.addLog({
        method: 'POST',
        url: `/tournaments/${tournamentId}/generate-bracket [Simulated]`,
        status: 200,
        responseData: data,
      });
      return data;
    }
    const res = await apiClient.post(`/tournaments/${tournamentId}/generate-bracket`);
    return res.data?.data || res.data;
  },

  // Matches Endpoints
  async submitScore(matchId: string, dto: SubmitScoreDto, currentUserRole?: UserRole): Promise<Match> {
    // Client-side invariant check: draw forbidden
    if (dto.homeScore === dto.awayScore) {
      throw new Error('Pertandingan knockout tidak boleh bernilai seri (Draw forbidden). Harus ada pemenang.');
    }

    // Role invariant check: Only Admin can submit score
    if (currentUserRole !== 'ADMIN') {
      dispatchHttpEvent('forbidden', {
        message: 'Akses Ditolak: Hanya ADMIN yang berhak menginput dan memperbarui skor pertandingan.',
      });
      throw new Error('Akses dibatasi hanya untuk Admin');
    }

    if (api.isMockMode()) {
      // Simulate rate limiter ThrottlerGuard check if called excessively
      const lastSubmit = (window as any).__lastScoreSubmitTime || 0;
      const now = Date.now();
      if (now - lastSubmit < 333) {
        dispatchHttpEvent('rateLimited', {
          retryAfter: 3,
          message: 'Rate limit tercapai (Max 3 req/sec ThrottlerGuard). Cooldown aktif.',
        });
        throw new Error('Rate limit exceeded: Please wait before submitting another score.');
      }
      (window as any).__lastScoreSubmitTime = now;

      const data = simulatedEngine.submitScore(matchId, dto.homeScore, dto.awayScore);
      telemetry.addLog({
        method: 'POST',
        url: `/matches/${matchId}/score [Simulated]`,
        status: 200,
        requestData: dto,
        responseData: data,
      });
      return data;
    }

    const res = await apiClient.post(`/matches/${matchId}/score`, dto);
    return res.data?.data || res.data;
  },
};
