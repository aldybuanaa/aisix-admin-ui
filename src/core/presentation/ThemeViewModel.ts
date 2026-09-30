import { BaseViewModel } from '@/core/ui/BaseViewModel';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'aisix-theme';
const CYCLE_ORDER: ThemeMode[] = ['light', 'dark', 'system'];

interface ThemeState {
  mode: ThemeMode;
  effective: 'light' | 'dark';
}

function readStored(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // SSR or storage denied
  }
  return 'light';
}

function systemDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

function effectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return systemDark() ? 'dark' : 'light';
  return mode;
}

function applyTheme(effective: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  if (effective === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export class ThemeViewModel extends BaseViewModel<ThemeState> {
  private _mql: MediaQueryList | null = null;
  private _mqlHandler: (() => void) | null = null;

  constructor() {
    const mode = readStored();
    const eff = effectiveTheme(mode);
    super({ mode, effective: eff });
    applyTheme(eff);
    this._listenSystem();
  }

  setMode(mode: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors
    }
    const eff = effectiveTheme(mode);
    this.updateState((s) => {
      s.mode = mode;
      s.effective = eff;
    });
    applyTheme(eff);
  }

  cycle(): void {
    const idx = CYCLE_ORDER.indexOf(this.currentState.mode);
    const next = CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
    this.setMode(next);
  }

  private _listenSystem() {
    try {
      this._mql = window.matchMedia('(prefers-color-scheme: dark)');
      this._mqlHandler = () => {
        if (this.currentState.mode === 'system') {
          const eff = systemDark() ? 'dark' : 'light';
          this.updateState((s) => { s.effective = eff; });
          applyTheme(eff);
        }
      };
      this._mql.addEventListener('change', this._mqlHandler);
    } catch {
      // SSR / not supported
    }
  }

  override dispose(): void {
    if (this._mql && this._mqlHandler) {
      this._mql.removeEventListener('change', this._mqlHandler);
    }
    super.dispose();
  }
}
