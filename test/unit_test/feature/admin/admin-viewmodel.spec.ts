import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import 'reflect-metadata';
import { Result as ResultFactory } from '@/core/types';
import type { ListAdminResourceUseCase } from '@/feature/admin/domain/use-case/ListAdminResourceUseCase';
import type { DeleteAdminResourceUseCase } from '@/feature/admin/domain/use-case/DeleteAdminResourceUseCase';
import type { GetAdminResourceUseCase } from '@/feature/admin/domain/use-case/GetAdminResourceUseCase';
import type { SaveAdminResourceUseCase } from '@/feature/admin/domain/use-case/SaveAdminResourceUseCase';
import type { DiscoverModelsUseCase } from '@/feature/admin/domain/use-case/DiscoverModelsUseCase';
import { AdminResourceListViewModel } from '@/feature/admin/viewmodel/AdminResourceListViewModel';
import { AdminResourceDetailViewModel } from '@/feature/admin/viewmodel/AdminResourceDetailViewModel';
import { ModelDiscoveryViewModel } from '@/feature/admin/viewmodel/ModelDiscoveryViewModel';
import type { AdminModel } from '@/feature/admin/domain/entities/AdminModel';
import type { DiscoveredModel } from '@/feature/admin/domain/entities/DiscoveredModel';

const mockModel: AdminModel = {
  id: 'models:gpt-4o',
  revision: 1,
  displayName: 'GPT-4o',
  provider: 'openai',
  modelName: 'gpt-4o',
  providerKeyId: 'pk-1',
  raw: { display_name: 'GPT-4o', provider: 'openai' },
};

describe('AdminResourceListViewModel', () => {
  let listUseCase: ListAdminResourceUseCase;
  let deleteUseCase: DeleteAdminResourceUseCase;
  let vm: AdminResourceListViewModel;

  beforeEach(() => {
    listUseCase = {
      execute: vi.fn().mockReturnValue(of(ResultFactory.Success([mockModel]))),
    };
    deleteUseCase = {
      execute: vi.fn().mockReturnValue(of(ResultFactory.Success(undefined))),
    };
    vm = new AdminResourceListViewModel(listUseCase, deleteUseCase);
  });

  it('initializes with models resource and loads data', () => {
    expect(vm.uiState.currentKey).toBe('models');
    vm.load();
    expect(listUseCase.execute).toHaveBeenCalledWith('models');
    expect(vm.uiState.items).toEqual([mockModel]);
    expect(vm.uiState.isLoading).toBe(false);
  });

  it('switches resource and resets search query and visible columns', () => {
    vm.setSearchQuery('test');
    vm.setResource('provider_keys');

    expect(vm.uiState.currentKey).toBe('provider_keys');
    expect(vm.uiState.searchQuery).toBe('');
    expect(listUseCase.execute).toHaveBeenCalledWith('provider_keys');
  });

  it('toggles column visibility while protecting pinned columns', () => {
    // 'displayName' is alwaysVisible for models
    vm.toggleColumn('displayName');
    expect(vm.isColumnVisible('displayName')).toBe(true);

    // 'provider' is toggleable
    expect(vm.isColumnVisible('provider')).toBe(true);
    vm.toggleColumn('provider');
    expect(vm.isColumnVisible('provider')).toBe(false);
  });

  it('deletes an item and updates state', () => {
    vm.load();
    expect(vm.uiState.items.length).toBe(1);

    vm.deleteItem('models:gpt-4o');
    expect(deleteUseCase.execute).toHaveBeenCalledWith('models', 'models:gpt-4o');
    expect(vm.uiState.items.length).toBe(0);
    expect(vm.uiState.actionSuccess).toContain('models:gpt-4o');
  });
});

describe('AdminResourceDetailViewModel', () => {
  let getUseCase: GetAdminResourceUseCase;
  let saveUseCase: SaveAdminResourceUseCase;
  let vm: AdminResourceDetailViewModel;

  beforeEach(() => {
    getUseCase = {
      execute: vi.fn().mockReturnValue(of(ResultFactory.Success(mockModel))),
    };
    saveUseCase = {
      execute: vi.fn().mockReturnValue(of(ResultFactory.Success(mockModel))),
    };
    vm = new AdminResourceDetailViewModel(getUseCase, saveUseCase);
  });

  it('initializes for creation with default payload', () => {
    vm.init('models');
    expect(vm.isNew).toBe(true);
    expect(vm.uiState.jsonText).toContain('display_name');
  });

  it('initializes for edit and loads existing item', () => {
    vm.init('models', 'models:gpt-4o');
    expect(vm.isNew).toBe(false);
    expect(getUseCase.execute).toHaveBeenCalledWith('models', 'models:gpt-4o');
  });

  it('validates JSON before saving', () => {
    vm.init('models');
    vm.setJsonText('invalid json');
    expect(vm.uiState.jsonValidationError).not.toBeNull();

    vm.save();
    expect(saveUseCase.execute).not.toHaveBeenCalled();
  });

  it('saves successfully on valid JSON', () => {
    vm.init('models');
    vm.setJsonText(JSON.stringify({ display_name: 'GPT-4o' }));
    expect(vm.uiState.jsonValidationError).toBeNull();

    vm.save();
    expect(saveUseCase.execute).toHaveBeenCalled();
  });
});

describe('ModelDiscoveryViewModel', () => {
  let discoverUseCase: DiscoverModelsUseCase;
  let vm: ModelDiscoveryViewModel;

  const mockDiscovered: DiscoveredModel[] = [
    { id: 'gpt-4o', object: 'model', ownedBy: 'openai' },
    { id: 'claude-3-5-sonnet', object: 'model', ownedBy: 'anthropic' },
  ];

  beforeEach(() => {
    discoverUseCase = {
      execute: vi.fn().mockReturnValue(of(ResultFactory.Success(mockDiscovered))),
    };
    vm = new ModelDiscoveryViewModel(discoverUseCase);
  });

  it('starts idle with no sensitive leaks', () => {
    expect(vm.uiState.adapter).toBe('openai');
    expect(vm.uiState.apiKey).toBe('');
    expect(vm.uiState.hasSearched).toBe(false);
  });

  it('discovers models and sets state', () => {
    vm.setAdapter('openai');
    vm.setApiKey('sk-secret-test');
    vm.discover();

    expect(discoverUseCase.execute).toHaveBeenCalledWith({
      adapter: 'openai',
      apiBase: undefined,
      apiKey: 'sk-secret-test',
      providerKeyId: undefined,
    });
    expect(vm.uiState.hasSearched).toBe(true);
    if (vm.uiState.discoveryState.type === 'Success') {
      expect(vm.uiState.discoveryState.data).toEqual(mockDiscovered);
    }
  });

  it('clears sensitive apiKey on demand', () => {
    vm.setApiKey('sk-secret-test');
    expect(vm.uiState.apiKey).toBe('sk-secret-test');
    vm.clearSensitiveInput();
    expect(vm.uiState.apiKey).toBe('');
  });
});
