import type { DiscoveredModel, DiscoverAdapter } from '@/feature/admin/domain/entities/DiscoveredModel';
import type { AsyncState, AsyncListState } from '@/core/types';

export type WizardStep = 'configure' | 'discover' | 'select' | 'saving';

export interface WizardSelectedModel extends DiscoveredModel {
  checked: boolean;
  customDisplayName: string;
}

export interface ProviderWizardState {
  step: WizardStep;
  // Step 1: Configure
  adapter: DiscoverAdapter;
  apiBase: string;
  apiKey: string;
  providerKeyId: string;
  useExistingKey: boolean;
  // Step 2: Discover
  discoveryState: AsyncListState<WizardSelectedModel>;
  searchQuery: string;
  // Step 3: Save
  selectedModels: WizardSelectedModel[];
  saveState: AsyncState<string[]>;
  saveErrors: string[];
  // Validation
  apiBaseError: string;
}

export const initialProviderWizardState: ProviderWizardState = {
  step: 'configure',
  adapter: 'openai',
  apiBase: '',
  apiKey: '',
  providerKeyId: '',
  useExistingKey: false,
  discoveryState: { type: 'Idle' },
  searchQuery: '',
  selectedModels: [],
  saveState: { type: 'Idle' },
  saveErrors: [],
  apiBaseError: '',
};
