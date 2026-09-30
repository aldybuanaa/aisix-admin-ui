import type { AsyncState } from '@/core/types';
import type { AdminModel } from '@/feature/admin/domain/entities/AdminModel';
import type { RoutingFormTarget, RoutingStrategy } from '../../domain/entities/SmartRouting';

export interface SmartRoutingFormState {
  displayName: string;
  strategy: RoutingStrategy;
  targets: RoutingFormTarget[];
}

export interface SmartRoutingState {
  isLoading: boolean;
  errorMessage: string;
  virtualModels: AdminModel[];
  targetCandidates: AdminModel[];
  editingId: string | null;
  form: SmartRoutingFormState;
  formErrors: string[];
  saveState: AsyncState<AdminModel>;
  deleteState: AsyncState<void>;
}

export const emptyTarget = (): RoutingFormTarget => ({
  modelResourceId: '',
  weight: 1,
  priority: 0,
});

export const initialSmartRoutingState: SmartRoutingState = {
  isLoading: false,
  errorMessage: '',
  virtualModels: [],
  targetCandidates: [],
  editingId: null,
  form: {
    displayName: '',
    strategy: 'round_robin_weighted',
    targets: [emptyTarget(), emptyTarget()],
  },
  formErrors: [],
  saveState: { type: 'Idle' },
  deleteState: { type: 'Idle' },
};
