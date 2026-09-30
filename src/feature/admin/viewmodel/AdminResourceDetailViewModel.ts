import { inject, injectable } from 'inversify';
import { BaseViewModel } from '@/core/ui/BaseViewModel';
import { AsyncState } from '@/core/types';
import { AdminModuleKeys } from '../di/AdminModuleKeys';
import type { GetAdminResourceUseCase } from '../domain/use-case/GetAdminResourceUseCase';
import type { SaveAdminResourceUseCase } from '../domain/use-case/SaveAdminResourceUseCase';
import type {
  AdminResource,
  AdminResourceKey,
  AdminResourceDefinition,
} from '../domain/entities/AdminResource';
import { getAdminResourceDefinition } from '../domain/entities/AdminResourceDefinitions';

export interface AdminResourceDetailState {
  currentKey: AdminResourceKey;
  itemId: string | null;
  loadState: AsyncState<AdminResource>;
  saveState: AsyncState<AdminResource>;
  jsonText: string;
  jsonValidationError: string | null;
}

const initialState: AdminResourceDetailState = {
  currentKey: 'models',
  itemId: null,
  loadState: AsyncState.idle(),
  saveState: AsyncState.idle(),
  jsonText: '{}',
  jsonValidationError: null,
};

@injectable()
export class AdminResourceDetailViewModel extends BaseViewModel<AdminResourceDetailState> {
  constructor(
    @inject(AdminModuleKeys.GetAdminResourceUseCase)
    private readonly getUseCase: GetAdminResourceUseCase,
    @inject(AdminModuleKeys.SaveAdminResourceUseCase)
    private readonly saveUseCase: SaveAdminResourceUseCase,
  ) {
    super(initialState);
  }

  get definition(): AdminResourceDefinition {
    return getAdminResourceDefinition(this.uiState.currentKey);
  }

  get isNew(): boolean {
    return !this.uiState.itemId;
  }

  init(key: AdminResourceKey, id?: string): void {
    const isCreate = !id || id.length === 0;
    const def = getAdminResourceDefinition(key);

    this.updateState((state) => {
      state.currentKey = key;
      state.itemId = isCreate ? null : id;
      state.saveState = AsyncState.idle();
      state.jsonValidationError = null;
      if (isCreate) {
        state.loadState = AsyncState.idle();
        state.jsonText = JSON.stringify(def.initialPayload, null, 2);
      }
    });

    if (!isCreate && id) {
      this.load(id);
    }
  }

  load(id: string): void {
    const key = this.uiState.currentKey;
    this.collectResult(
      `get_${key}_${id}`,
      this.getUseCase.execute(key, id),
      (state, asyncState) => {
        state.loadState = asyncState;
        if (asyncState.type === 'Success') {
          state.jsonText = JSON.stringify(asyncState.data.raw, null, 2);
        }
      },
    );
  }

  setJsonText(text: string): void {
    this.updateState((state) => {
      state.jsonText = text;
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          state.jsonValidationError = 'Payload harus berupa JSON object';
        } else {
          state.jsonValidationError = null;
        }
      } catch (e) {
        state.jsonValidationError = e instanceof Error ? e.message : 'JSON tidak valid';
      }
    });
  }

  save(): void {
    if (this.uiState.jsonValidationError) return;

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(this.uiState.jsonText);
    } catch {
      this.updateState((state) => {
        state.jsonValidationError = 'JSON tidak valid';
      });
      return;
    }

    const key = this.uiState.currentKey;
    const id = this.uiState.itemId ?? undefined;

    this.collectResult(
      `save_${key}`,
      this.saveUseCase.execute(key, payload, id),
      (state, asyncState) => {
        state.saveState = asyncState;
        if (asyncState.type === 'Success') {
          state.itemId = asyncState.data.id;
          state.jsonText = JSON.stringify(asyncState.data.raw, null, 2);
        }
      },
    );
  }
}
