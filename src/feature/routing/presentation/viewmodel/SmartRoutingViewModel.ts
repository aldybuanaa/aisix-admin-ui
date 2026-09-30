import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { BaseViewModel } from '@/core/ui/BaseViewModel';
import { AdminModuleKeys } from '@/feature/admin/di/AdminModuleKeys';
import type { ListAdminResourceUseCase } from '@/feature/admin/domain/use-case/ListAdminResourceUseCase';
import type { GetAdminResourceUseCase } from '@/feature/admin/domain/use-case/GetAdminResourceUseCase';
import type { SaveAdminResourceUseCase } from '@/feature/admin/domain/use-case/SaveAdminResourceUseCase';
import type { DeleteAdminResourceUseCase } from '@/feature/admin/domain/use-case/DeleteAdminResourceUseCase';
import type { AdminModel } from '@/feature/admin/domain/entities/AdminModel';
import {
  buildRoutingTargetsPayload,
  parseRoutingTargets,
  validateRouting,
  type RoutingStrategy,
} from '../../domain/entities/SmartRouting';
import {
  emptyTarget,
  initialSmartRoutingState,
  type SmartRoutingState,
} from '../state/SmartRoutingState';

function isVirtual(model: AdminModel): boolean {
  const raw = model.raw ?? {};
  if (typeof raw.routing === 'object' && raw.routing !== null) return true;
  const providerField = raw.provider ?? (model as unknown as Record<string, unknown>).provider;
  return providerField === 'virtual';
}

@injectable()
export class SmartRoutingViewModel extends BaseViewModel<SmartRoutingState> {
  constructor(
    @inject(AdminModuleKeys.ListAdminResourceUseCase)
    private readonly listUseCase: ListAdminResourceUseCase,
    @inject(AdminModuleKeys.GetAdminResourceUseCase)
    _getUseCase: GetAdminResourceUseCase,
    @inject(AdminModuleKeys.SaveAdminResourceUseCase)
    private readonly saveUseCase: SaveAdminResourceUseCase,
    @inject(AdminModuleKeys.DeleteAdminResourceUseCase)
    private readonly deleteUseCase: DeleteAdminResourceUseCase,
  ) {
    super(initialSmartRoutingState);
  }

  load(): void {
    this.updateState((s) => {
      s.isLoading = true;
      s.errorMessage = '';
    });
    this.collectResult(
      'smart_routing_list',
      this.listUseCase.execute('models'),
      (s, asyncState) => {
        if (asyncState.type === 'Loading') {
          s.isLoading = true;
        } else if (asyncState.type === 'Error') {
          s.isLoading = false;
          s.errorMessage = asyncState.message;
        } else if (asyncState.type === 'Success') {
          const models = asyncState.data as unknown as AdminModel[];
          s.isLoading = false;
          s.virtualModels = models.filter(isVirtual);
          s.targetCandidates = models.filter((m) => !isVirtual(m));
        } else {
          s.isLoading = false;
        }
      },
    );
  }

  initNew(): void {
    this.updateState((s) => {
      s.editingId = null;
      s.formErrors = [];
      s.saveState = { type: 'Idle' };
      s.form = {
        displayName: '',
        strategy: 'round_robin_weighted',
        targets: [emptyTarget(), emptyTarget()],
      };
    });
  }

  initEdit(model: AdminModel): void {
    const parsed = parseRoutingTargets(model.raw ?? {});
    this.updateState((s) => {
      s.editingId = model.id;
      s.formErrors = [];
      s.saveState = { type: 'Idle' };
      s.form = {
        displayName: model.displayName,
        strategy: parsed.strategy,
        targets:
          parsed.targets.length >= 2
            ? parsed.targets
            : [...parsed.targets, ...Array(Math.max(0, 2 - parsed.targets.length)).fill(null).map(emptyTarget)],
      };
    });
  }

  setDisplayName(value: string): void {
    this.updateState((s) => {
      s.form.displayName = value;
      s.formErrors = [];
    });
  }

  setStrategy(strategy: RoutingStrategy): void {
    this.updateState((s) => {
      s.form.strategy = strategy;
      s.formErrors = [];
    });
  }

  setTargetModel(index: number, modelId: string): void {
    this.updateState((s) => {
      if (index >= 0 && index < s.form.targets.length) {
        s.form.targets[index].modelResourceId = modelId;
      }
      s.formErrors = [];
    });
  }

  setTargetWeight(index: number, weight: number): void {
    this.updateState((s) => {
      if (index >= 0 && index < s.form.targets.length) {
        s.form.targets[index].weight = weight;
      }
      s.formErrors = [];
    });
  }

  setTargetPriority(index: number, priority: number): void {
    this.updateState((s) => {
      if (index >= 0 && index < s.form.targets.length) {
        s.form.targets[index].priority = priority;
      }
      s.formErrors = [];
    });
  }

  addTarget(): void {
    this.updateState((s) => {
      s.form.targets.push(emptyTarget());
      s.formErrors = [];
    });
  }

  removeTarget(index: number): void {
    this.updateState((s) => {
      if (s.form.targets.length > 2) {
        s.form.targets.splice(index, 1);
      }
      s.formErrors = [];
    });
  }

  moveTarget(index: number, direction: -1 | 1): void {
    this.updateState((s) => {
      const j = index + direction;
      if (j < 0 || j >= s.form.targets.length) return;
      const tmp = s.form.targets[index];
      s.form.targets[index] = s.form.targets[j];
      s.form.targets[j] = tmp;
      s.formErrors = [];
    });
  }

  save(): void {
    const { form, editingId } = this.currentState;
    const validation = validateRouting({
      displayName: form.displayName,
      strategy: form.strategy,
      targets: form.targets,
    });
    if (!validation.ok) {
      this.updateState((s) => {
        s.formErrors = validation.errors;
      });
      return;
    }

    const payload = buildRoutingTargetsPayload({
      displayName: form.displayName,
      strategy: form.strategy,
      targets: form.targets,
    });

    this.collectResult(
      'smart_routing_save',
      this.saveUseCase.execute('models', payload as Record<string, unknown>, editingId ?? undefined),
      (s, asyncState) => {
        s.saveState = asyncState as SmartRoutingState['saveState'];
        if (asyncState.type === 'Error') {
          s.formErrors = [asyncState.message];
        }
      },
      {
        onSuccess: () => {
          this.load();
        },
      },
    );
  }

  deleteVirtualModel(id: string): void {
    this.collectResult(
      'smart_routing_delete',
      this.deleteUseCase.execute('models', id),
      (s, asyncState) => {
        s.deleteState = asyncState as SmartRoutingState['deleteState'];
      },
      {
        onSuccess: () => {
          this.load();
        },
      },
    );
  }
}
