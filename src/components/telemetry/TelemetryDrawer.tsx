import React, { useState, useEffect } from 'react';
import { telemetry, TelemetryLog } from '../../services/telemetry';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export const TelemetryDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<TelemetryLog | null>(null);

  useEffect(() => {
    return telemetry.subscribe((updated) => setLogs([...updated]));
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 font-mono">
      {/* Drawer Toggle Header Bar */}
      <div className="bg-white border-t border-zinc-900 px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-zinc-950 hover:text-zinc-700 font-semibold text-xs uppercase transition-colors"
        >
          <span>Request Monitor</span>
          <span className="bg-zinc-100 text-zinc-900 border border-zinc-300 px-1.5 py-0.2 text-[10px] font-bold tabular-nums">
            {logs.length}
          </span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 stroke-[1.75]" /> : <ChevronUp className="w-3.5 h-3.5 stroke-[1.75]" />}
        </button>

        <div className="flex items-center gap-3">
          {logs.length > 0 && (
            <button
              type="button"
              onClick={() => telemetry.clear()}
              className="px-2 py-0.5 border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Bersihkan log"
            >
              <Trash2 className="w-3 h-3 stroke-[1.75]" />
              <span>Clear</span>
            </button>
          )}
          <span className="text-[10px] font-semibold text-zinc-400 uppercase hidden sm:inline">
            Status: READY
          </span>
        </div>
      </div>

      {/* Expanded Log Inspection Panel */}
      {isOpen && (
        <div className="bg-white border-t border-zinc-300 h-64 flex flex-col sm:flex-row text-xs">
          {/* Logs List Column */}
          <div className="w-full sm:w-1/2 border-r border-zinc-300 overflow-y-auto divide-y divide-zinc-300">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                Belum ada aktivitas request terekam.
              </div>
            ) : (
              logs.map((log) => {
                const isOk = log.status === 200 || log.status === 201;
                const isErr = typeof log.status === 'number' && log.status >= 400;
                const isSelected = selectedLog?.id === log.id;

                return (
                  <button
                    type="button"
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`w-full text-left px-3 py-2 cursor-pointer text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-zinc-100 text-zinc-950 font-bold border-l-2 border-l-zinc-950'
                        : 'bg-white hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] text-zinc-400 tabular-nums">
                        {log.timestamp}
                      </span>
                      <span className="px-1 border border-zinc-300 bg-zinc-50 text-[10px] font-bold text-zinc-800">
                        {log.method}
                      </span>
                      <span className="truncate text-[11px]">{log.url}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {log.durationMs !== undefined && (
                        <span className="text-[10px] text-zinc-400 tabular-nums">
                          {log.durationMs}ms
                        </span>
                      )}
                      <span
                        className={`px-1 py-0.2 text-[10px] font-bold border tabular-nums ${
                          isOk
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : isErr
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Details Column */}
          <div className="w-full sm:w-1/2 p-3 overflow-y-auto bg-zinc-50 text-zinc-900">
            {selectedLog ? (
              <div className="space-y-3">
                <div className="border-b border-zinc-200 pb-1.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-950">
                    {selectedLog.method} {selectedLog.url}
                  </span>
                  <span className="text-[10px] text-zinc-500 tabular-nums">
                    Latency: {selectedLog.durationMs ?? 'N/A'}ms
                  </span>
                </div>

                {selectedLog.requestData && (
                  <div>
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase mb-1">
                      Request Payload:
                    </div>
                    <pre className="p-2 bg-white border border-zinc-200 text-[11px] overflow-x-auto text-zinc-950">
                      {JSON.stringify(selectedLog.requestData, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase mb-1">
                    Response Data:
                  </div>
                  <pre className="p-2 bg-white border border-zinc-200 text-[11px] overflow-x-auto max-h-36 text-zinc-950">
                    {JSON.stringify(selectedLog.responseData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 text-center text-xs">
                Pilih salah satu log di panel kiri untuk melihat rincian request & response payload.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
