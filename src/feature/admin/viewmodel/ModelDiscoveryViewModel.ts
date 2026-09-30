import { inject, injectable } from 'inversify';
import { BaseViewModel } from '@/core/ui/BaseViewModel';
import { AsyncListState } from '@/core/types';
import { AdminModuleKeys } from '../di/AdminModuleKeys';
import type { DiscoverModelsUseCase } from '../domain/use-case/DiscoverModelsUseCase';
import type {
  DiscoveredModel,
  DiscoverAdapter,
} from '../domain/entities/DiscoveredModel';

export interface ModelDiscoveryState {
  adapter: DiscoverAdapter;
  apiBase: string;
  apiKey: string;
  providerKeyId: string;
  discoveryState: AsyncListState<DiscoveredModel>;
  searchQuery: string;
  hasSearched: boolean;
}

const initialState: ModelDiscoveryState = {
  adapter: 'openai',
  apiBase: '',
  apiKey: '',
  providerKeyId: '',
  discoveryState: AsyncListState.idle(),
  searchQuery: '',
  hasSearched: false,
};

@injectable()
export class ModelDiscoveryViewModel extends BaseViewModel<ModelDiscoveryState> {
  constructor(
    @inject(AdminModuleKeys.DiscoverModelsUseCase)
    private readonly discoverUseCase: DiscoverModelsUseCase,
  ) {
    super(initialState);
  }

  setAdapter(adapter: DiscoverAdapter): void {
    this.updateState((state) => {
      state.adapter = adapter;
    });
  }

  setApiBase(apiBase: string): void {
    this.updateState((state) => {
      state.apiBase = apiBase;
    });
  }

  setApiKey(apiKey: string): void {
    this.updateState((state) => {
      state.apiKey = apiKey;
    });
  }

  setProviderKeyId(providerKeyId: string): void {
    this.updateState((state) => {
      state.providerKeyId = providerKeyId;
    });
  }

  setSearchQuery(q: string): void {
    this.updateState((state) => {
      state.searchQuery = q;
    });
  }

  discover(): void {
    const { adapter, apiBase, apiKey, providerKeyId } = this.uiState;
    this.updateState((state) => {
      state.hasSearched = true;
    });

    this.collectListResult(
      'discover_models',
      this.discoverUseCase.execute({
        adapter,
        apiBase: apiBase.trim() || undefined,
        apiKey: apiKey.trim() || undefined,
        providerKeyId: providerKeyId.trim() || undefined,
      }),
      (models) => ({ data: models, totalRecords: models.length }),
      (state, asyncState) => {
        state.discoveryState = asyncState;
      },
    );
  }

  clearSensitiveInput(): void {
    this.updateState((state) => {
      state.apiKey = '';
    });
  }
}
