import React, { useState, useEffect } from 'react';
import { telemetry, TelemetryLog } from '../../services/telemetry';
import { Terminal, Trash2, ChevronDown, ChevronUp, Check, AlertCircle, Clock } from 'lucide-react';

export const TelemetryDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<TelemetryLog | null>(null);

  useEffect(() => {
    return telemetry.subscribe((updated) => setLogs([...updated]));
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Drawer Toggle Header Bar */}
      <div className="bg-nb-card border-t-3 border-black px-4 py-2 flex items-center justify-between font-mono text-xs shadow-[0_-3px_0_0_#181512]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 text-nb-ink hover:text-nb-yellow px-2 py-0.5 font-black uppercase transition-colors"
        >
          <Terminal className="w-4 h-4 text-nb-yellow" />
          <span>Telemetry & Request Monitor</span>
          <span className="bg-nb-yellow text-black border-2 border-black px-2 py-0.2 text-[10px] font-black shadow-brutal-sm">
            {logs.length} logs
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4 text-nb-ink" /> : <ChevronUp className="w-4 h-4 text-nb-ink" />}
        </button>

        <div className="flex items-center gap-3">
          {logs.length > 0 && (
            <button
              onClick={() => telemetry.clear()}
              className="neo-btn-secondary text-[11px] py-0.5 px-2.5 flex items-center gap-1 font-bold"
              title="Bersihkan log"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <span className="text-[11px] font-mono font-bold text-nb-muted hidden sm:inline">
            Status: READY
          </span>
        </div>
      </div>

      {/* Expanded Log Inspection Panel */}
      {isOpen && (
        <div className="bg-nb-bg border-t-2 border-black h-64 flex flex-col sm:flex-row shadow-2xl">
          {/* Logs List Column */}
          <div className="w-full sm:w-1/2 border-r-3 border-black overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-nb-muted font-mono text-xs font-bold">
                Belum ada aktivitas request terekam.
              </div>
            ) : (
              logs.map((log) => {
                const isOk = log.status === 200 || log.status === 201;
                const isErr = typeof log.status === 'number' && log.status >= 400;
                const isSelected = selectedLog?.id === log.id;

                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`px-3.5 py-2 cursor-pointer font-mono text-xs flex items-center justify-between border-b-2 border-black/40 hover:bg-nb-cardHover transition-colors ${
                      isSelected ? 'bg-nb-yellow text-black border-l-4 border-l-black font-black' : 'bg-nb-card text-nb-ink'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-black/80' : 'text-nb-muted'}`}>
                        {log.timestamp}
                      </span>
                      <span className={`px-1 border border-black text-[11px] font-black ${isSelected ? 'bg-black text-[#FAF6ED]' : 'bg-nb-cardAlt text-nb-ink'}`}>
                        {log.method}
                      </span>
                      <span className="truncate text-[11px] font-bold">{log.url}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {log.durationMs !== undefined && (
                        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isSelected ? 'text-black/80' : 'text-nb-muted'}`}>
                          <Clock className="w-3 h-3" /> {log.durationMs}ms
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-black border-2 border-black shadow-brutal-sm ${
                          isOk
                            ? 'bg-nb-green text-black'
                            : isErr
                            ? 'bg-nb-red text-white'
                            : 'bg-nb-cardAlt text-nb-ink'
                        }`}
                      >
                        {isOk && <Check className="w-2.5 h-2.5 inline mr-0.5" />}
                        {isErr && <AlertCircle className="w-2.5 h-2.5 inline mr-0.5" />}
                        {log.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details Column */}
          <div className="w-full sm:w-1/2 p-4 overflow-y-auto font-mono text-xs bg-nb-card text-nb-ink">
            {selectedLog ? (
              <div className="space-y-3">
                <div className="font-black text-nb-ink uppercase border-b-2 border-black pb-2 flex items-center justify-between">
                  <span className="text-xs text-nb-yellow">
                    {selectedLog.method} {selectedLog.url}
                  </span>
                  <span className="text-[10px] text-nb-muted font-bold">
                    Latency: {selectedLog.durationMs ?? 'N/A'}ms
                  </span>
                </div>

                {selectedLog.requestData && (
                  <div>
                    <div className="text-[10px] text-nb-muted font-black uppercase mb-1">
                      Request Payload:
                    </div>
                    <pre className="p-2.5 bg-nb-cardAlt border-2 border-black text-nb-ink text-[11px] overflow-x-auto shadow-brutal-sm">
                      {JSON.stringify(selectedLog.requestData, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <div className="text-[10px] text-nb-muted font-black uppercase mb-1">
                    Response Data:
                  </div>
                  <pre className="p-2.5 bg-nb-cardAlt border-2 border-black text-nb-green text-[11px] overflow-x-auto max-h-36 shadow-brutal-sm">
                    {JSON.stringify(selectedLog.responseData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-nb-muted font-bold text-center">
                Pilih salah satu log di panel kiri untuk melihat rincian request & response payload.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
