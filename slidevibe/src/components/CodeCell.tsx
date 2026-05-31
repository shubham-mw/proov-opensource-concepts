import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { Play, RotateCcw, Loader2, CheckCircle2, AlertCircle, Code2, Maximize2, X } from 'lucide-react';
import { usePyodide } from '../lib/PyodideProvider';
import type { CellResult } from '../lib/pyodideKernel';
import { ProovBridge } from '../lib/proovBridge';

type Props = {
  /** Unique key for ProovBridge.recordResponse — falls back to checkpointId. */
  slideKey?: string;
  /** PROOV_CHECKPOINT id broadcast on successful run (matches the existing checklist plumbing). */
  checkpointId?: string;
  /** Code prefilled into the editor. */
  initialCode: string;
  /** Optional plain-text reference of what success looks like. */
  expectedOutput?: string;
  /** Read-only — useful for the setup cell which auto-runs and shouldn't be edited. */
  readOnly?: boolean;
  /** Auto-run on mount (used by the setup cell). */
  autoRun?: boolean;
  /** Optional label above the editor — defaults to "python". */
  language?: string;
  /**
   * When this value changes, the cell wipes any in-progress edits + previous
   * output and reverts the editor to `initialCode`. Use this when the same
   * <CodeCell> instance is reused across steps (e.g. guided task slides that
   * switch between cells without remounting via `key`).
   */
  resetSignal?: string | number;
};

const editableCompartment = new Compartment();

function buildState(code: string, readOnly: boolean, onChange: (code: string) => void) {
  return EditorState.create({
    doc: code,
    extensions: [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      python(),
      oneDark,
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      editableCompartment.of(EditorView.editable.of(!readOnly)),
      EditorState.readOnly.of(readOnly),
      EditorView.theme({
        '&': { fontSize: '12.5px', background: '#0a0a0a' },
        '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: '1.55' },
        '.cm-content': { padding: '12px 0' },
        '.cm-gutters': { background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.06)' },
        '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.02)' },
        '.cm-activeLineGutter': { backgroundColor: 'rgba(255,255,255,0.04)' },
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChange(update.state.doc.toString());
      }),
    ],
  });
}

export function CodeCell({
  slideKey,
  checkpointId,
  initialCode,
  expectedOutput,
  readOnly = false,
  autoRun = false,
  language = 'python',
  resetSignal,
}: Props) {
  const { status, run } = usePyodide();
  const editorParentRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const codeRef = useRef<string>(initialCode);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CellResult | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [, setTick] = useState(0); // force rerender when codeRef changes via reset

  const onChange = useCallback((next: string) => { codeRef.current = next; }, []);

  // Mount the editor once; tear down on unmount.
  useEffect(() => {
    if (!editorParentRef.current || viewRef.current) return;
    const view = new EditorView({
      state: buildState(initialCode, readOnly, onChange),
      parent: editorParentRef.current,
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // initialCode is intentionally excluded — we don't want every parent rerender
    // to wipe the student's edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, onChange]);

  const executeCell = useCallback(async (codeOverride?: string) => {
    if (running) return;
    const code = codeOverride ?? codeRef.current;
    setRunning(true);
    try {
      const cellResult = await run(code);
      setResult(cellResult);

      const succeeded = !cellResult.error;
      if (succeeded && checkpointId) {
        window.postMessage({ type: 'PROOV_CHECKPOINT', checkpoint: checkpointId }, '*');
      }
      const responseKey = slideKey || checkpointId;
      if (responseKey) {
        ProovBridge.recordResponse(responseKey, 'CODE', {
          checkpointId,
          code,
          stdout: cellResult.stdout.slice(0, 4000),
          stderr: cellResult.stderr.slice(0, 1000),
          error: cellResult.error,
          imageCount: cellResult.images.length,
          durationMs: cellResult.durationMs,
          ranAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setResult({
        stdout: '',
        stderr: '',
        images: [],
        error: err instanceof Error ? err.message : String(err),
        durationMs: 0,
      });
    } finally {
      setRunning(false);
    }
  }, [running, run, checkpointId, slideKey]);

  // Auto-run support — once kernel reaches 'ready'. We deliberately don't
  // re-run on every status flap; only the first ready transition.
  const autoRanRef = useRef(false);
  useEffect(() => {
    if (autoRun && status === 'ready' && !autoRanRef.current) {
      autoRanRef.current = true;
      executeCell(initialCode);
    }
  }, [autoRun, status, executeCell, initialCode]);

  const resetCell = useCallback(() => {
    codeRef.current = initialCode;
    if (viewRef.current) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: initialCode },
      });
    }
    setResult(null);
    autoRanRef.current = false;
    setTick(t => t + 1);
  }, [initialCode]);

  // Parent-driven reset — when the slide swaps which step's code this cell
  // should display, wipe state and reload the new starter snippet.
  const firstRunRef = useRef(true);
  useEffect(() => {
    if (firstRunRef.current) { firstRunRef.current = false; return; }
    resetCell();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const kernelReady = status === 'ready';
  const kernelLabel = useMemo(() => {
    if (status === 'ready') return 'kernel ready';
    if (status === 'booting') return 'kernel booting…';
    if (status === 'error') return 'kernel error';
    return 'kernel idle';
  }, [status]);

  return (
    <div className="flex flex-col w-full h-full min-h-0 rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-[#111]">
        <Code2 size={13} className="text-white/40" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">{language}</span>
        <span className={`ml-2 inline-flex items-center gap-1 text-[10px] font-semibold ${kernelReady ? 'text-emerald-400' : status === 'error' ? 'text-red-400' : 'text-amber-300'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${kernelReady ? 'bg-emerald-400' : status === 'error' ? 'bg-red-400' : 'bg-amber-300 animate-pulse'}`} />
          {kernelLabel}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {!readOnly && (
            <button
              onClick={resetCell}
              disabled={running}
              title="Reset to starter code"
              className="inline-flex items-center gap-1 px-2 h-7 rounded-md border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-[11px] font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
          <button
            onClick={() => executeCell()}
            disabled={running || status === 'error'}
            className="inline-flex items-center gap-1.5 px-3 h-7 rounded-md bg-emerald-500 text-black text-[11px] font-bold hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
            {running ? 'Running' : 'Run cell'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div ref={editorParentRef} className="min-h-[160px] max-h-[40vh] overflow-auto" />

      {/* Output area */}
      <div className="flex flex-col gap-2 px-3 py-3 border-t border-white/10 bg-black/40 overflow-y-auto max-h-[40vh]">
        {!result && !running && (
          <p className="text-[11px] text-white/30 italic">
            {kernelReady
              ? 'Click "Run cell" to execute the code and see the output here.'
              : status === 'error'
                ? 'Kernel unavailable — refresh the page to retry.'
                : 'Waiting for the Python kernel to finish loading…'}
          </p>
        )}

        {running && (
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <Loader2 size={12} className="animate-spin text-emerald-400" />
            Executing…
          </div>
        )}

        {result?.stdout && (
          <pre className="text-[11.5px] text-white/85 font-mono whitespace-pre-wrap leading-relaxed">{result.stdout}</pre>
        )}

        {result?.images && result.images.length > 0 && (
          <div className="flex flex-col gap-3">
            {result.images.map((b64, i) => (
              <div 
                key={i} 
                className="relative group cursor-zoom-in overflow-hidden rounded-lg border border-white/10"
                onClick={() => setExpandedImage(b64)}
              >
                <img
                  src={`data:image/png;base64,${b64}`}
                  alt={`figure ${i + 1}`}
                  className="w-full h-auto bg-white transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-black/60 text-white backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-xl">
                    <Maximize2 size={14} /> Expand Graph
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {result?.error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2.5">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <pre className="text-[11px] text-red-300 font-mono whitespace-pre-wrap leading-relaxed flex-1">{result.error}</pre>
          </div>
        )}

        {result && !result.error && !running && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <CheckCircle2 size={11} /> Ran in {result.durationMs}ms
            </span>
            {expectedOutput && (
              <span className="text-[10px] text-white/30">Expected: {expectedOutput.split('\n')[0].slice(0, 80)}</span>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-md p-8 cursor-zoom-out"
          >
            <motion.button 
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <X size={20} />
            </motion.button>
            <motion.img
              src={`data:image/png;base64,${expandedImage}`}
              alt="Expanded figure"
              className="w-auto h-auto max-w-[90vw] max-h-[90vh] bg-white rounded-xl shadow-[0_0_50px_rgba(0,169,224,0.15)] border border-white/20 cursor-default"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
