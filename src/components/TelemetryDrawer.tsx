import React from 'react';
import { TelemetryLog } from '../types';
import { Terminal, X, CheckCircle, AlertCircle, Info, Cpu, Layers } from 'lucide-react';

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: TelemetryLog[];
  onClearLogs: () => void;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#FFFFFF] border-l border-[#DDD7C8] shadow-2xl p-5 flex flex-col justify-between text-[#2B2827]">
      {/* Top Header */}
      <div className="space-y-2 border-b border-[#DDD7C8] pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#8F6A00]" />
            <h3 className="text-sm font-mono font-bold text-[#8F6A00]">
              Live Multi-Agent Telemetry Stream
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#736D6B] hover:text-[#2B2827] hover:bg-[#FAF8F2] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-[#5A5553] font-mono">
          Real-time execution traces for Gemini 3.5 Flash, Bayesian FSRS calculations, and async scheduler state machine.
        </p>
      </div>

      {/* Logs Scroll Area */}
      <div className="flex-1 overflow-y-auto my-4 space-y-2.5 font-mono text-xs pr-1">
        {logs.length === 0 ? (
          <div className="text-center py-16 text-[#736D6B]">
            No agent telemetry events recorded yet. Interact with the application to view live logs.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-[#FAF8F2] border border-[#DDD7C8] space-y-1 shadow-sm"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="px-2 py-0.5 rounded bg-[#FFFFFF] text-[#8F6A00] font-bold border border-[#DDD7C8]">
                  {log.agentRole}
                </span>
                <span className="text-[#736D6B]">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="font-semibold text-[#2B2827] text-[11px] pt-0.5">{log.action}</div>
              <p className="text-[11px] text-[#5A5553] leading-relaxed break-words">{log.details}</p>
            </div>
          ))
        )}
      </div>

      {/* Footer Controls */}
      <div className="border-t border-[#DDD7C8] pt-3 flex items-center justify-between text-xs font-mono">
        <span className="text-[#736D6B] font-medium">{logs.length} events logged</span>
        <button
          onClick={onClearLogs}
          className="px-3 py-1 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8] transition-colors font-medium shadow-sm"
        >
          Clear Telemetry
        </button>
      </div>
    </div>
  );
};
