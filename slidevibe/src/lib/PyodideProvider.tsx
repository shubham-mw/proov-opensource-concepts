import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ensureKernelBoot,
  subscribeKernelStatus,
  getLastError,
  type CellResult,
  runCell,
} from './pyodideKernel';

type KernelStatus = 'idle' | 'booting' | 'ready' | 'error';

type Ctx = {
  status: KernelStatus;
  run: (code: string) => Promise<CellResult>;
};

const PyodideCtx = createContext<Ctx | null>(null);

export function PyodideProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<KernelStatus>('idle');

  useEffect(() => {
    const unsub = subscribeKernelStatus(setStatus);
    // Fire-and-forget; the provider doesn't block render. Eager so the boot
    // overlaps the cinematic intro window.
    ensureKernelBoot().catch(() => {/* status will flip to 'error' */});
    return unsub;
  }, []);

  return (
    <PyodideCtx.Provider value={{ status, run: runCell }}>
      {children}
      {(status === 'booting' || status === 'error') && <KernelStatusToast status={status} errorDetail={getLastError()} />}
    </PyodideCtx.Provider>
  );
}

export function usePyodide(): Ctx {
  const ctx = useContext(PyodideCtx);
  if (!ctx) throw new Error('usePyodide must be used inside <PyodideProvider>');
  return ctx;
}

function KernelStatusToast({ status, errorDetail }: { status: KernelStatus; errorDetail: string }) {
  const isError = status === 'error';
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        background: isError ? '#fef2f2' : '#ffffff',
        border: `1px solid ${isError ? '#fecaca' : '#e5e7eb'}`,
        color: isError ? '#991b1b' : '#334155',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        borderRadius: 12,
        padding: '8px 14px',
        fontSize: 12,
        fontWeight: 600,
        maxWidth: 420,
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isError && (
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: '2px solid #cbd5e1',
              borderTopColor: '#0f172a',
              animation: 'proov-spin 0.9s linear infinite',
              flexShrink: 0,
            }}
          />
        )}
        <span>
          {isError ? 'Python kernel failed to start' : 'Warming up Python kernel…'}
        </span>
      </div>
      {isError && errorDetail && (
        <span style={{ fontSize: 10, fontWeight: 400, color: '#b91c1c', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {errorDetail.slice(0, 300)}
        </span>
      )}
      <style>{`@keyframes proov-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
