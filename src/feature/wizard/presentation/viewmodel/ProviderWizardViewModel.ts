import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { lastValueFrom } from 'rxjs';
import { BaseViewModel } from '@/core/ui/BaseViewModel';
import { AdminModuleKeys } from '@/feature/admin/di/AdminModuleKeys';
import type { DiscoverModelsUseCase } from '@/feature/admin/domain/use-case/DiscoverModelsUseCase';
import type { SaveAdminResourceUseCase } from '@/feature/admin/domain/use-case/SaveAdminResourceUseCase';
import type { DiscoverAdapter } from '@/feature/admin/domain/entities/DiscoveredModel';
import {
  initialProviderWizardState,
  type ProviderWizardState,
} from '../state/ProviderWizardState';

const URL_PATTERN = /^https?:\/\/.+/;

@injectable()
export class ProviderWizardViewModel extends BaseViewModel<ProviderWizardState> {
  constructor(
    @inject(AdminModuleKeys.DiscoverModelsUseCase)
    private readonly discoverUseCase: DiscoverModelsUseCase,
    @inject(AdminModuleKeys.SaveAdminResourceUseCase)
    private readonly saveUseCase: SaveAdminResourceUseCase,
  ) {
    super(initialProviderWizardState);
  }

  setAdapter(adapter: DiscoverAdapter): void {
    this.updateState((s) => {
      s.adapter = adapter;
      s.apiBase = '';
      s.apiBaseError = '';
      s.discoveryState = { type: 'Idle' };
    });
  }

  setApiBase(value: string): void {
    this.updateState((s) => {
      s.apiBase = value;
      s.apiBaseError = '';
    });
  }

  setApiKey(value: string): void {
    this.updateState((s) => {
      s.apiKey = value;
    });
  }

  setProviderKeyId(value: string): void {
    this.updateState((s) => {
      s.providerKeyId = value;
    });
  }

  setUseExistingKey(v: boolean): void {
    this.updateState((s) => {
      s.useExistingKey = v;
      s.apiKey = '';
      s.providerKeyId = '';
    });
  }

  setSearchQuery(q: string): void {
    this.updateState((s) => { s.searchQuery = q; });
  }

  discover(): void {
    const { adapter, apiBase, apiKey, providerKeyId, useExistingKey } = this.currentState;

    if (apiBase && !URL_PATTERN.test(apiBase.trim())) {
      this.updateState((s) => { s.apiBaseError = 'Base URL must start with http:// or https://'; });
      return;
    }

    this.updateState((s) => { s.apiBaseError = ''; });

    this.collectListResult(
      'discover',
      this.discoverUseCase.execute({
        adapter,
        apiBase: apiBase.trim() || undefined,
        apiKey: (!useExistingKey && apiKey.trim()) ? apiKey.trim() : undefined,
        providerKeyId: (useExistingKey && providerKeyId.trim()) ? providerKeyId.trim() : undefined,
      }),
      (models) => ({
        data: models.map((m) => ({ ...m, checked: false, customDisplayName: m.id })),
        totalRecords: models.length,
      }),
      (s, asyncState) => {
        s.discoveryState = asyncState;
        if (asyncState.type === 'Success') {
          s.step = 'discover';
        }
      },
    );
  }

  toggleModel(id: string): void {
    this.updateState((s) => {
      if (s.discoveryState.type !== 'Success') return;
      const model = s.discoveryState.data.find((m) => m.id === id);
      if (model) model.checked = !model.checked;
    });
  }

  toggleAll(checked: boolean): void {
    this.updateState((s) => {
      if (s.discoveryState.type !== 'Success') return;
      const { searchQuery } = s;
      const q = searchQuery.toLowerCase();
      for (const m of s.discoveryState.data) {
        if (!q || m.id.toLowerCase().includes(q)) {
          m.checked = checked;
        }
      }
    });
  }

  setCustomName(id: string, name: string): void {
    this.updateState((s) => {
      if (s.discoveryState.type !== 'Success') return;
      const model = s.discoveryState.data.find((m) => m.id === id);
      if (model) model.customDisplayName = name;
    });
  }

  proceedToSelect(): void {
    this.updateState((s) => {
      if (s.discoveryState.type !== 'Success') return;
      s.selectedModels = s.discoveryState.data.filter((m) => m.checked);
      s.step = 'select';
    });
  }

  async saveSelectedModels(): Promise<void> {
    const { selectedModels, adapter, apiBase, providerKeyId, useExistingKey } = this.currentState;

    if (selectedModels.length === 0) return;

    this.updateState((s) => {
      s.saveState = { type: 'Loading' };
      s.saveErrors = [];
      s.step = 'saving';
    });

    const saved: string[] = [];
    const errors: string[] = [];

    for (const model of selectedModels) {
      const payload: Record<string, unknown> = {
        display_name: model.customDisplayName || model.id,
        provider: adapter,
        model_name: model.id,
      };
      if (useExistingKey && providerKeyId.trim()) {
        payload.provider_key_id = providerKeyId.trim();
      }
      if (apiBase.trim()) {
        payload.api_base = apiBase.trim();
      }

      try {
        const result = await lastValueFrom(this.saveUseCase.execute('models', payload));
        if (result.type === 'Success') {
          saved.push(model.id);
        } else if (result.type === 'Failure') {
          errors.push(`${model.id}: ${result.error}`);
        } else if (result.type === 'GenericError') {
          errors.push(`${model.id}: ${result.error.message}`);
        }
      } catch (e) {
        errors.push(`${model.id}: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }

    this.updateState((s) => {
      s.saveErrors = errors;
      s.saveState = errors.length === 0
        ? { type: 'Success', data: saved }
        : { type: 'Error', message: `${errors.length} model(s) failed to save` };
    });

    // Clear the in-memory key — never store in localStorage
    this.clearApiKey();
  }

  clearApiKey(): void {
    this.updateState((s) => {
      s.apiKey = '';
    });
  }

  reset(): void {
    this.updateState((s) => {
      Object.assign(s, { ...initialProviderWizardState });
    });
  }

  override dispose(): void {
    this.clearApiKey();
    super.dispose();
  }
}
