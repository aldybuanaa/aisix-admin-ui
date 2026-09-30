import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import 'reflect-metadata';
import { Result as ResultFactory } from '@/core/types';
import { ProviderWizardViewModel } from '@/feature/wizard/presentation/viewmodel/ProviderWizardViewModel';

function makeVm() {
  const discoverUseCase = {
    execute: vi.fn().mockReturnValue(of(ResultFactory.Success([
      { id: 'gpt-4o', object: 'model', ownedBy: 'openai' },
      { id: 'gpt-4o-mini', object: 'model', ownedBy: 'openai' },
    ]))),
  };
  const saveUseCase = {
    execute: vi.fn().mockReturnValue(of(ResultFactory.Success({ id: 'models:gpt-4o', revision: 1, displayName: 'GPT-4o', provider: 'openai', modelName: 'gpt-4o', providerKeyId: null, raw: {} }))),
  };
  const vm = new ProviderWizardViewModel(discoverUseCase as any, saveUseCase as any);
  return { vm, discoverUseCase, saveUseCase };
}

describe('ProviderWizardViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts on configure step with openai adapter', () => {
    const { vm } = makeVm();
    expect(vm.uiState.step).toBe('configure');
    expect(vm.uiState.adapter).toBe('openai');
    expect(vm.uiState.apiKey).toBe('');
    vm.dispose();
  });

  it('rejects invalid base URLs with a field error', () => {
    const { vm, discoverUseCase } = makeVm();
    vm.setApiBase('not-a-url');
    vm.discover();
    expect(vm.uiState.apiBaseError).toBeTruthy();
    expect(discoverUseCase.execute).not.toHaveBeenCalled();
    vm.dispose();
  });

  it('discovers models and moves to discover step', () => {
    const { vm, discoverUseCase } = makeVm();
    vm.setAdapter('ollama');
    vm.setApiBase('http://localhost:11434/v1');
    vm.discover();
    expect(discoverUseCase.execute).toHaveBeenCalledWith({
      adapter: 'ollama',
      apiBase: 'http://localhost:11434/v1',
      apiKey: undefined,
      providerKeyId: undefined,
    });
    expect(vm.uiState.step).toBe('discover');
    expect(vm.uiState.discoveryState.type).toBe('Success');
    if (vm.uiState.discoveryState.type === 'Success') {
      expect(vm.uiState.discoveryState.data).toHaveLength(2);
      expect(vm.uiState.discoveryState.data[0].checked).toBe(false);
    }
    vm.dispose();
  });

  it('uses provider_key_id when useExistingKey is set and discards typed API key', () => {
    const { vm, discoverUseCase } = makeVm();
    vm.setUseExistingKey(true);
    vm.setProviderKeyId('provider_keys:openai-prod');
    vm.setApiKey('sk-secret-should-be-ignored');
    vm.discover();
    expect(discoverUseCase.execute).toHaveBeenCalledWith({
      adapter: 'openai',
      apiBase: undefined,
      apiKey: undefined,
      providerKeyId: 'provider_keys:openai-prod',
    });
    vm.dispose();
  });

  it('toggles models and proceeds to select with checked only', () => {
    const { vm } = makeVm();
    vm.discover();
    vm.toggleModel('gpt-4o');
    vm.proceedToSelect();
    expect(vm.uiState.step).toBe('select');
    expect(vm.uiState.selectedModels).toHaveLength(1);
    expect(vm.uiState.selectedModels[0].id).toBe('gpt-4o');
    vm.dispose();
  });

  it('saves selected models and clears the API key from memory', async () => {
    const { vm, saveUseCase } = makeVm();
    vm.setApiKey('sk-test-key');
    vm.setApiBase('https://api.openai.com/v1');
    vm.discover();
    vm.toggleModel('gpt-4o');
    vm.proceedToSelect();

    await vm.saveSelectedModels();

    expect(saveUseCase.execute).toHaveBeenCalledWith('models', expect.objectContaining({
      display_name: 'gpt-4o',
      provider: 'openai',
      model_name: 'gpt-4o',
    }));

    // Secret must be cleared
    expect(vm.uiState.apiKey).toBe('');
    expect(vm.uiState.saveState.type).toBe('Success');
    vm.dispose();
  });

  it('records per-model save errors without blocking others', async () => {
    const { vm } = makeVm();
    vm.discover();
    vm.toggleModel('gpt-4o');
    vm.toggleModel('gpt-4o-mini');
    vm.proceedToSelect();

    // First succeeds, second fails
    const saveSpy = vi.spyOn((vm as any).saveUseCase, 'execute');
    saveSpy.mockImplementationOnce((..._args: any[]) =>
      of(ResultFactory.Success({ id: 'models:gpt-4o', revision: 1, displayName: 'GPT-4o', provider: 'openai', modelName: 'gpt-4o', providerKeyId: null, raw: {} }))
    );
    saveSpy.mockImplementationOnce((..._args: any[]) =>
      of(ResultFactory.Failure('duplicate model_name'))
    );

    await vm.saveSelectedModels();

    expect(vm.uiState.saveState.type).toBe('Error');
    expect(vm.uiState.saveErrors).toHaveLength(1);
    expect(vm.uiState.saveErrors[0]).toContain('gpt-4o-mini');
    vm.dispose();
  });

  it('toggleAll checks all filtered models at once', () => {
    const { vm } = makeVm();
    vm.discover();
    vm.toggleAll(true);
    vm.proceedToSelect();
    expect(vm.uiState.selectedModels).toHaveLength(2);
    vm.dispose();
  });
});
