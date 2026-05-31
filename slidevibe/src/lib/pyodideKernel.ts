// Standalone Pyodide kernel running via a Web Worker in public/pyodideWorker.js
export type CellResult = {
  stdout: string;
  stderr: string;
  images: string[];
  error: string | null;
  durationMs: number;
};

type Status = 'idle' | 'booting' | 'ready' | 'error';
type Listener = (status: Status) => void;

let worker: Worker | null = null;
let status: Status = 'idle';
let lastError = '';
const listeners = new Set<Listener>();
const pending = new Map<string, (result: CellResult) => void>();
let callId = 0;

export function getLastError(): string { return lastError; }

const DATASETS = [
  { fsPath: 'climate_data.csv', fetchUrl: '/data/climate_data.csv' },
];

function setStatus(next: Status) {
  status = next;
  for (const l of listeners) l(next);
}

export function getKernelStatus(): Status {
  return status;
}

export function subscribeKernelStatus(fn: Listener): () => void {
  listeners.add(fn);
  fn(status);
  return () => listeners.delete(fn);
}

async function mountDatasets(w: Worker) {
  for (const ds of DATASETS) {
    try {
      const res = await fetch(ds.fetchUrl);
      if (!res.ok) { console.warn(`[kernel] dataset ${ds.fsPath} returned ${res.status}`); continue; }
      const buffer = await res.arrayBuffer();
      w.postMessage({ type: 'mount-file', fsPath: ds.fsPath, buffer }, [buffer]);
    } catch (err) {
      console.warn(`[kernel] failed to mount ${ds.fsPath}`, err);
    }
  }
}

function spawnWorker() {
  if (worker) return;
  setStatus('booting');
  const w = new Worker('/pyodideWorker.js?v=2');

  w.onmessage = async (e) => {
    const { type, id } = e.data;
    if (type === 'ready') {
      await mountDatasets(w);
      setStatus('ready');
    } else if (type === 'error') {
      lastError = e.data.error || 'unknown error';
      console.error('[kernel] worker boot error:', lastError);
      setStatus('error');
      worker = null;
    } else if (type === 'result') {
      const cb = pending.get(id);
      if (cb) { pending.delete(id); cb(e.data as CellResult); }
    }
  };

  w.onerror = (e) => {
    lastError = e.message || 'worker failed to start';
    console.error('[kernel] worker error:', lastError);
    setStatus('error');
    worker = null;
  };

  worker = w;
}

export function ensureKernelBoot(): Promise<void> {
  spawnWorker();
  if (status === 'ready') return Promise.resolve();
  if (status === 'error') return Promise.reject(new Error('kernel boot failed'));
  return new Promise((resolve, reject) => {
    const unsub = subscribeKernelStatus((s) => {
      if (s === 'ready') { unsub(); resolve(); }
      if (s === 'error') { unsub(); reject(new Error('kernel boot failed')); }
    });
  });
}

export async function runCell(code: string): Promise<CellResult> {
  await ensureKernelBoot();
  const id = String(++callId);
  return new Promise((resolve) => {
    pending.set(id, resolve);
    worker!.postMessage({ type: 'run', id, code });
  });
}
