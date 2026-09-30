import { inject, injectable } from 'inversify';
import { BaseViewModel } from '@/core/ui/BaseViewModel';
import type { GetProvidersUseCase } from '../domain/use-case/GetProvidersUseCase';
import { ProviderModuleKeys } from '../di/ProviderModuleKeys';
import { initialProviderUiState } from '../state/ProviderUiState';
import type { ProviderUiState } from '../state/ProviderUiState';

@injectable()
export class ProviderListViewModel extends BaseViewModel<ProviderUiState> {
  constructor(
    @inject(ProviderModuleKeys.GetProvidersUseCase)
    private readonly getProvidersUseCase: GetProvidersUseCase
  ) {
    super(initialProviderUiState);
  }

  load(): void {
    this.collectResult(
      'providers',
      this.getProvidersUseCase.execute(),
      (state, status) => {
        state.status = status;
        if (status.type === 'Success') {
          state.providers = status.data;
        } else if (status.type === 'Error') {
          state.providers = [];
        }
      }
    );
  }
}
