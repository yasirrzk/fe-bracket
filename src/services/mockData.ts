import { User } from '../types/auth';

export const INITIAL_USERS: User[] = [
  { id: 'usr-admin-1', email: 'admin@bracketops.gg', username: 'OverlordAdmin', role: 'ADMIN' },
  { id: 'usr-ply-1', email: 'user@bracketops.gg', username: 'PlayerOne', role: 'USER' },
];
