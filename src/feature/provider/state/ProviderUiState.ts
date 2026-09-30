import type { AsyncState } from '@/core/types';
import type { Provider } from '../domain/entities/Provider';

export interface ProviderUiState {
  status: AsyncState<Provider[]>;
  providers: Provider[];
}

export const initialProviderUiState: ProviderUiState = {
  status: { type: 'Idle' },
  providers: [],
};
