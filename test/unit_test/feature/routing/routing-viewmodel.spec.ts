import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import 'reflect-metadata';
import { Result as ResultFactory } from '@/core/types';
import { SmartRoutingViewModel } from '@/feature/routing/presentation/viewmodel/SmartRoutingViewModel';
import type { AdminModel } from '@/feature/admin/domain/entities/AdminModel';

function makeVm() {
  const mockModels: AdminModel[] = [
    {
      id: 'models:gpt-4o',
      revision: 1,
      displayName: 'GPT-4o',
      provider: 'openai',
      modelName: 'gpt-4o',
      providerKeyId: 'pk-1',
      raw: { display_name: 'GPT-4o', provider: 'openai' },
    },
    {
      id: 'models:claude-3-5',
      revision: 1,
      displayName: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      modelName: 'claude-3-5-sonnet',
      providerKeyId: 'pk-2',
      raw: { display_name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
    },
    {
      id: 'models:virtual-mix',
      revision: 2,
      displayName: 'Virtual Balanced',
      provider: 'virtual',
      modelName: 'virtual-mix',
      providerKeyId: null,
      raw: {
        display_name: 'Virtual Balanced',
        provider: 'virtual',
        routing: {
          strategy: 'round_robin_weighted',
          targets: [
            { model: 'models:gpt-4o', weight: 3, priority: 1 },
            { model: 'models:claude-3-5', weight: 1, priority: 2 },
          ],
        },
      },
    },
  ];

  const listUseCase = {
    execute: vi.fn().mockReturnValue(of(ResultFactory.Success(mockModels))),
  };
  const getUseCase = {
    execute: vi.fn().mockReturnValue(of(ResultFactory.Success(mockModels[2]))),
  };
  const saveUseCase = {
    execute: vi.fn().mockReturnValue(of(ResultFactory.Success(mockModels[2]))),
  };
  const deleteUseCase = {
    execute: vi.fn().mockReturnValue(of(ResultFactory.Success(undefined))),
  };

  const vm = new SmartRoutingViewModel(
    listUseCase as any,
    getUseCase as any,
    saveUseCase as any,
    deleteUseCase as any,
  );

  return { vm, listUseCase, getUseCase, saveUseCase, deleteUseCase, mockModels };
}

describe('SmartRoutingViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads models and separates virtual routing models from physical targets', () => {
    const { vm, listUseCase } = makeVm();
    vm.load();
    expect(listUseCase.execute).toHaveBeenCalledWith('models');
    expect(vm.uiState.virtualModels).toHaveLength(1);
    expect(vm.uiState.targetCandidates).toHaveLength(2);
    expect(vm.uiState.virtualModels[0].id).toBe('models:virtual-mix');
    vm.dispose();
  });

  it('inits empty form for creating new routing model', () => {
    const { vm } = makeVm();
    vm.load();
    vm.initNew();
    expect(vm.uiState.form.displayName).toBe('');
    expect(vm.uiState.form.strategy).toBe('round_robin_weighted');
    expect(vm.uiState.form.targets).toHaveLength(2);
    vm.dispose();
  });

  it('inits form with existing virtual model data for editing', () => {
    const { vm, mockModels } = makeVm();
    vm.load();
    vm.initEdit(mockModels[2]);
    expect(vm.uiState.editingId).toBe('models:virtual-mix');
    expect(vm.uiState.form.displayName).toBe('Virtual Balanced');
    expect(vm.uiState.form.targets).toHaveLength(2);
    expect(vm.uiState.form.targets[0].modelResourceId).toBe('models:gpt-4o');
    expect(vm.uiState.form.targets[0].weight).toBe(3);
    vm.dispose();
  });

  it('validates form before saving and surfaces errors', () => {
    const { vm, saveUseCase } = makeVm();
    vm.load();
    vm.initNew();
    vm.setDisplayName(''); // invalid
    vm.save();
    expect(vm.uiState.formErrors).toContain('Routing display name is required');
    expect(saveUseCase.execute).not.toHaveBeenCalled();
    vm.dispose();
  });

  it('saves valid virtual routing model through SaveAdminResourceUseCase', () => {
    const { vm, saveUseCase } = makeVm();
    vm.load();
    vm.initNew();
    vm.setDisplayName('Smart Tier');
    vm.setTargetModel(0, 'models:gpt-4o');
    vm.setTargetWeight(0, 2);
    vm.setTargetModel(1, 'models:claude-3-5');
    vm.setTargetWeight(1, 1);

    vm.save();

    expect(saveUseCase.execute).toHaveBeenCalledWith(
      'models',
      expect.objectContaining({
        display_name: 'Smart Tier',
        routing: expect.objectContaining({
          strategy: 'round_robin_weighted',
          targets: [
            { model: 'models:gpt-4o', weight: 2, priority: 0 },
            { model: 'models:claude-3-5', weight: 1, priority: 0 },
          ],
        }),
      }),
      undefined,
    );
    vm.dispose();
  });

  it('deletes virtual routing model and reloads list', () => {
    const { vm, deleteUseCase, listUseCase } = makeVm();
    vm.load();
    vm.deleteVirtualModel('models:virtual-mix');
    expect(deleteUseCase.execute).toHaveBeenCalledWith('models', 'models:virtual-mix');
    expect(listUseCase.execute).toHaveBeenCalledTimes(2);
    vm.dispose();
  });
});
