export interface TelemetryLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status: number | 'PENDING' | 'ERROR';
  durationMs?: number;
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
}

type TelemetryListener = (logs: TelemetryLog[]) => void;

class TelemetryService {
  private logs: TelemetryLog[] = [];
  private listeners: Set<TelemetryListener> = new Set();
  private maxLogs = 50;

  addLog(log: Omit<TelemetryLog, 'id' | 'timestamp'>): string {
    const id = Math.random().toString(36).substring(2, 9);
    const newLog: TelemetryLog = {
      ...log,
      id,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.logs = [newLog, ...this.logs.slice(0, this.maxLogs - 1)];
    this.notify();
    return id;
  }

  updateLog(id: string, updates: Partial<TelemetryLog>) {
    this.logs = this.logs.map((log) =>
      log.id === id ? { ...log, ...updates } : log
    );
    this.notify();
  }

  clear() {
    this.logs = [];
    this.notify();
  }

  getLogs() {
    return this.logs;
  }

  subscribe(listener: TelemetryListener) {
    this.listeners.add(listener);
    listener(this.logs);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.logs));
  }
}

export const telemetry = new TelemetryService();
