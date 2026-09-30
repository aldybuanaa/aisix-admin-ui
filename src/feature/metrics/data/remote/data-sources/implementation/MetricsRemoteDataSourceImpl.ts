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
  ModelStatusEntry,
} from '../../../../domain/entities/MetricsEntity';

// GET /admin/v1/health returns:
//   { status: "ok"|"degraded"|"unhealthy", models: [...], config: {...} }
interface HealthResponseDto {
  status?: string;
  models?: unknown;
  config?: unknown;
}

// GET /admin/v1/models/status returns an array of model entries in snake_case.
interface ModelStatusDto {
  id?: unknown;
  display_name?: unknown;
  kind?: unknown;
  status?: unknown;
  consecutive_failures?: unknown;
  last_failure?: unknown;
  last_success?: unknown;
}

const VALID_HEALTH_STATUSES = ['ok', 'degraded', 'unhealthy'] as const;
const VALID_MODEL_KINDS = ['direct', 'routing', 'ensemble', 'semantic'] as const;
const VALID_MODEL_STATUSES = ['active', 'error', 'rate_limited', 'not_applicable', 'unknown'] as const;

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
  const status = VALID_MODEL_STATUSES.includes(dto.status as (typeof VALID_MODEL_STATUSES)[number])
    ? (dto.status as ModelStatusEntry['status'])
    : 'unknown';
  return {
    id: typeof dto.id === 'string' ? dto.id : '',
    display_name: typeof dto.display_name === 'string' ? dto.display_name : '',
    kind,
    status,
    consecutive_failures: typeof dto.consecutive_failures === 'number' ? dto.consecutive_failures : 0,
    last_failure: typeof dto.last_failure === 'number' ? dto.last_failure : null,
    last_success: typeof dto.last_success === 'number' ? dto.last_success : null,
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
