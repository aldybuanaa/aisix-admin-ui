import { describe, expect, it, vi } from 'vitest';
import 'reflect-metadata';
import { ThemeViewModel } from '@/core/presentation/ThemeViewModel';

describe('ThemeViewModel', () => {
  it('defaults to persisted theme or light', () => {
    const vm = new ThemeViewModel();
    expect(['light', 'dark', 'system']).toContain(vm.uiState.mode);
    vm.dispose();
  });

  it('cycles between light, dark, and system', () => {
    const vm = new ThemeViewModel();
    vm.setMode('dark');
    expect(vm.uiState.mode).toBe('dark');
    vm.cycle();
    expect(vm.uiState.mode).toBe('system');
    vm.cycle();
    expect(vm.uiState.mode).toBe('light');
    vm.dispose();
  });

  it('persists theme in localStorage', () => {
    const storage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => { storage[k] = v; },
      removeItem: (k: string) => { delete storage[k]; },
    });
    const vm = new ThemeViewModel();
    vm.setMode('dark');
    expect(storage['aisix-theme']).toBe('dark');
    vm.dispose();
    vi.unstubAllGlobals();
  });

  it('never defaults to dark without a stored preference', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const vm = new ThemeViewModel();
    expect(vm.uiState.mode).toBe('light');
    vm.dispose();
    vi.unstubAllGlobals();
  });
});
