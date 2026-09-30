import { inject, injectable } from 'inversify';
import { BaseViewModel } from '@/core/ui/BaseViewModel';
import { AdminModuleKeys } from '../di/AdminModuleKeys';
import type { ListAdminResourceUseCase } from '../domain/use-case/ListAdminResourceUseCase';
import type { DeleteAdminResourceUseCase } from '../domain/use-case/DeleteAdminResourceUseCase';
import type {
  AdminResource,
  AdminResourceKey,
  AdminResourceDefinition,
} from '../domain/entities/AdminResource';
import { getAdminResourceDefinition } from '../domain/entities/AdminResourceDefinitions';

export interface AdminResourceListState {
  currentKey: AdminResourceKey;
  items: AdminResource[];
  isLoading: boolean;
  errorMessage: string;
  visibleColumnKeys: string[];
  searchQuery: string;
  actionError: string | null;
  actionSuccess: string | null;
  deletingId: string | null;
}

const initialState: AdminResourceListState = {
  currentKey: 'models',
  items: [],
  isLoading: false,
  errorMessage: '',
  visibleColumnKeys: getAdminResourceDefinition('models').columns.map((c) => c.key),
  searchQuery: '',
  actionError: null,
  actionSuccess: null,
  deletingId: null,
};

@injectable()
export class AdminResourceListViewModel extends BaseViewModel<AdminResourceListState> {
  constructor(
    @inject(AdminModuleKeys.ListAdminResourceUseCase)
    private readonly listUseCase: ListAdminResourceUseCase,
    @inject(AdminModuleKeys.DeleteAdminResourceUseCase)
    private readonly deleteUseCase: DeleteAdminResourceUseCase,
  ) {
    super(initialState);
  }

  get definition(): AdminResourceDefinition {
    return getAdminResourceDefinition(this.uiState.currentKey);
  }

  setResource(key: AdminResourceKey): void {
    const def = getAdminResourceDefinition(key);
    this.updateState((state) => {
      state.currentKey = key;
      state.searchQuery = '';
      state.actionError = null;
      state.actionSuccess = null;
      state.visibleColumnKeys = def.columns.map((c) => c.key);
      state.items = [];
      state.isLoading = false;
      state.errorMessage = '';
    });
    this.load();
  }

  setSearchQuery(q: string): void {
    this.updateState((state) => {
      state.searchQuery = q;
    });
  }

  toggleColumn(columnKey: string): void {
    const def = this.definition;
    const col = def.columns.find((c) => c.key === columnKey);
    if (col?.alwaysVisible) return;

    this.updateState((state) => {
      const idx = state.visibleColumnKeys.indexOf(columnKey);
      if (idx >= 0) {
        if (state.visibleColumnKeys.length > 1) {
          state.visibleColumnKeys = state.visibleColumnKeys.filter((k) => k !== columnKey);
        }
      } else {
        state.visibleColumnKeys.push(columnKey);
      }
    });
  }

  isColumnVisible(columnKey: string): boolean {
    return this.uiState.visibleColumnKeys.includes(columnKey);
  }

  load(): void {
    const key = this.currentState.currentKey;
    this.updateState((state) => {
      state.isLoading = true;
      state.errorMessage = '';
    });

    // Use trackSubscription directly to avoid collectListResult's type narrowing
    const sub = this.listUseCase.execute(key).subscribe({
      next: (result) => {
        if (result.type === 'Success') {
          this.updateState((state) => {
            // Spread into a new mutable array to satisfy reactive proxy
            state.items = result.data.map((item) => ({ ...item })) as AdminResource[];
            state.isLoading = false;
            state.errorMessage = '';
          });
        } else if (result.type === 'Failure') {
          this.updateState((state) => {
            state.isLoading = false;
            state.errorMessage = result.error;
            state.items = [];
          });
        } else if (result.type === 'GenericError') {
          this.updateState((state) => {
            state.isLoading = false;
            state.errorMessage = result.error.message;
            state.items = [];
          });
        } else if (result.type === 'Loading') {
          this.updateState((state) => {
            state.isLoading = true;
          });
        }
      },
    });
    this.trackSubscription(`list_${key}`, sub);
  }

  deleteItem(id: string): void {
    const key = this.currentState.currentKey;
    this.updateState((state) => {
      state.deletingId = id;
      state.actionError = null;
      state.actionSuccess = null;
    });

    const sub = this.deleteUseCase.execute(key, id).subscribe({
      next: (result) => {
        if (result.type === 'Success') {
          this.updateState((state) => {
            state.items = state.items.filter((item) => item.id !== id);
            state.actionSuccess = `Item ${id} berhasil dihapus`;
            state.deletingId = null;
          });
        } else if (result.type === 'Failure') {
          this.updateState((state) => {
            state.actionError = result.error;
            state.deletingId = null;
          });
        } else if (result.type === 'GenericError') {
          this.updateState((state) => {
            state.actionError = result.error.message;
            state.deletingId = null;
          });
        }
      },
    });
    this.trackSubscription(`delete_${id}`, sub);
  }

  clearActionNotices(): void {
    this.updateState((state) => {
      state.actionError = null;
      state.actionSuccess = null;
    });
  }
}
