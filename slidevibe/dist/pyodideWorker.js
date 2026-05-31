// Web Worker — runs outside Vite's module system.
// importScripts() is synchronous and works reliably for loading large CDN scripts.

const PYODIDE_VERSION = '0.27.7';
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// seaborn is not bundled in Pyodide 0.27.x — installed via micropip instead.
const CORE_PACKAGES = ['numpy', 'pandas', 'matplotlib', 'scikit-learn', 'micropip'];

const KERNEL_BOOTSTRAP = `
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as _plt
import sys, io, base64, json, traceback
from contextlib import redirect_stdout, redirect_stderr

_plt.rcParams.update({
    'figure.dpi': 110,
    'figure.figsize': (10, 4.5),
    'axes.spines.top': False,
    'axes.spines.right': False,
    'axes.grid': True,
    'grid.alpha': 0.25,
})

def __proov_run_cell(user_code):
    import matplotlib.pyplot as plt
    plt.close('all')
    stdout = io.StringIO()
    stderr = io.StringIO()
    error = None
    images = []
    try:
        compiled = compile(user_code, '<proov-cell>', 'exec')
        with redirect_stdout(stdout), redirect_stderr(stderr):
            exec(compiled, globals())
        for num in plt.get_fignums():
            fig = plt.figure(num)
            buf = io.BytesIO()
            fig.savefig(buf, format='png', bbox_inches='tight', facecolor='white')
            images.append(base64.b64encode(buf.getvalue()).decode('ascii'))
    except Exception:
        error = traceback.format_exc()
    finally:
        plt.close('all')
    return json.dumps({
        'stdout': stdout.getvalue(),
        'stderr': stderr.getvalue(),
        'error': error,
        'images': images,
    })
`;

let pyodide = null;

async function init() {
  try {
    importScripts(PYODIDE_CDN + 'pyodide.js');
    pyodide = await loadPyodide({ indexURL: PYODIDE_CDN });
    await pyodide.loadPackage(CORE_PACKAGES);
    await pyodide.runPythonAsync(`
import micropip
await micropip.install('seaborn')
`);
    pyodide.runPython(KERNEL_BOOTSTRAP);
    self.postMessage({ type: 'ready' });
  } catch (err) {
    self.postMessage({ type: 'error', error: err.message || String(err) });
  }
}

self.onmessage = async function (e) {
  const { type, id, code, fsPath, buffer } = e.data;

  if (type === 'mount-file') {
    if (pyodide) {
      pyodide.FS.writeFile(fsPath, new Uint8Array(buffer));
    }
    self.postMessage({ type: 'mount-done', fsPath });
    return;
  }

  if (type === 'run') {
    if (!pyodide) {
      self.postMessage({ type: 'result', id, stdout: '', stderr: '', images: [], error: 'Kernel not ready', durationMs: 0 });
      return;
    }
    const t0 = performance.now();
    try {
      const runner = pyodide.globals.get('__proov_run_cell');
      const raw = runner(code);
      runner.destroy?.();
      const result = JSON.parse(raw);
      self.postMessage({ type: 'result', id, ...result, durationMs: Math.round(performance.now() - t0) });
    } catch (err) {
      self.postMessage({ type: 'result', id, stdout: '', stderr: '', images: [], error: String(err), durationMs: Math.round(performance.now() - t0) });
    }
  }
};

init();
