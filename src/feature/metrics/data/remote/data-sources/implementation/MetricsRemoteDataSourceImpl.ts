import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import type { Observable } from 'rxjs';
import { toResultObservable } from '@/core/network/resultObservable';
import { safeRequest } from '@/core/network/HttpClient';
import type { HttpClient } from '@/core/network/HttpClient';
import type { Result } from '@/core/types';
import { CoreModuleKeys } from '@/core/di/keys';
import type { MetricsRemoteDataSource } from '../MetricsRemoteDataSource';
import { parsePrometheusText } from '../../../../domain/utils/parsePrometheusText';
import type {
  HealthStatus,
  MetricsSummary,
  ModelRuntimeStatus,
  ModelStatusEntry,
} from '../../../../domain/entities/MetricsEntity';

// GET /admin/v1/health returns:
//   { status: "ok"|"degraded"|"unhealthy", models: [...], config: {...} }
interface HealthResponseDto {
  status?: string;
  models?: unknown;
  config?: unknown;
}

// SystemTime from Rust/Serde serializes as:
//   { secs_since_epoch: number, nanos_since_epoch: number }
interface SystemTimeDto {
  secs_since_epoch?: unknown;
  nanos_since_epoch?: unknown;
}

// GET /admin/v1/models/status returns an array of ModelStatusView (flattened RuntimeStatusSnapshot).
interface ModelStatusDto {
  id?: unknown;
  display_name?: unknown;
  kind?: unknown;
  status?: unknown;
  cooldown_until?: unknown;
  last_checked_at?: unknown;
  last_check_status?: unknown;
  status_reason?: unknown;
}

const VALID_HEALTH_STATUSES = ['ok', 'degraded', 'unhealthy'] as const;
const VALID_MODEL_KINDS = ['direct', 'routing', 'ensemble', 'semantic'] as const;
const VALID_RUNTIME_STATUSES: readonly ModelRuntimeStatus[] = [
  'healthy',
  'unhealthy',
  'cooldown',
  'not_applicable',
] as const;

function parseSystemTime(val: unknown): number | null {
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : null;
  }
  if (val !== null && typeof val === 'object') {
    const rec = val as SystemTimeDto;
    if (typeof rec.secs_since_epoch === 'number' && Number.isFinite(rec.secs_since_epoch)) {
      return rec.secs_since_epoch;
    }
  }
  return null;
}

function mapHealth(body: HealthResponseDto): HealthStatus {
  const status = VALID_HEALTH_STATUSES.includes(body.status as (typeof VALID_HEALTH_STATUSES)[number])
    ? (body.status as HealthStatus['status'])
    : 'unhealthy';

  const models: HealthStatus['models'] = Array.isArray(body.models)
    ? (body.models as Record<string, unknown>[])
        .filter((entry) => entry !== null && typeof entry === 'object')
        .map((entry) => {
          const record = entry as Record<string, unknown>;
          const health =
            typeof record.health === 'number' && (record.health === 0 || record.health === 1 || record.health === 2)
              ? record.health
              : 2;
          return {
            id: typeof record.id === 'string' ? record.id : '',
            name: typeof record.name === 'string' ? record.name : '',
            health,
          };
        })
    : [];

  const configRecord = (body.config ?? {}) as Record<string, unknown>;
  return {
    status,
    models,
    config: {
      snapshot_revision: typeof configRecord.snapshot_revision === 'number' ? configRecord.snapshot_revision : 0,
      snapshot_age_seconds: typeof configRecord.snapshot_age_seconds === 'number' ? configRecord.snapshot_age_seconds : 0,
    },
  };
}

function mapModelStatus(dto: ModelStatusDto): ModelStatusEntry {
  const kind = VALID_MODEL_KINDS.includes(dto.kind as (typeof VALID_MODEL_KINDS)[number])
    ? (dto.kind as ModelStatusEntry['kind'])
    : 'direct';

  const rawStatus = dto.status as string | undefined;
  const status: ModelRuntimeStatus =
    rawStatus && VALID_RUNTIME_STATUSES.includes(rawStatus as ModelRuntimeStatus)
      ? (rawStatus as ModelRuntimeStatus)
      : 'unknown';

  return {
    id: typeof dto.id === 'string' ? dto.id : '',
    display_name: typeof dto.display_name === 'string' ? dto.display_name : '',
    kind,
    status,
    cooldown_until: parseSystemTime(dto.cooldown_until),
    last_checked_at: parseSystemTime(dto.last_checked_at),
    last_check_status: typeof dto.last_check_status === 'number' ? dto.last_check_status : null,
    status_reason: typeof dto.status_reason === 'string' ? dto.status_reason : null,
  };
}

@injectable()
export class MetricsRemoteDataSourceImpl implements MetricsRemoteDataSource {
  constructor(
    @inject(CoreModuleKeys.HttpClient)
    private readonly http: HttpClient,
  ) {}

  getHealth(): Observable<Result<HealthStatus, string>> {
    return toResultObservable(
      safeRequest<HealthResponseDto, { message: string | null }>(() => this.http.get('/admin/v1/health')),
      mapHealth,
      'Failed to fetch health status',
    );
  }

  getModelStatuses(): Observable<Result<ModelStatusEntry[], string>> {
    return toResultObservable(
      safeRequest<unknown, { message: string | null }>(() => this.http.get('/admin/v1/models/status')),
      (raw): ModelStatusEntry[] => {
        if (!Array.isArray(raw)) return [];
        return raw
          .filter((entry): entry is ModelStatusDto => entry !== null && typeof entry === 'object')
          .map(mapModelStatus);
      },
      'Failed to fetch model statuses',
    );
  }

  getMetricsSummary(): Observable<Result<MetricsSummary, string>> {
    return toResultObservable(
      safeRequest<string, { message: string | null }>(() => this.http.getText('/admin/v1/metrics')),
      (text) => parsePrometheusText(typeof text === 'string' ? text : ''),
      'Failed to fetch metrics summary',
    );
  }
}
