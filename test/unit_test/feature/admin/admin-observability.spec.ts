import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import 'reflect-metadata';
import { Result as ResultFactory } from '@/core/types';
import { SaveAdminResourceUseCaseImpl } from '@/feature/admin/domain/use-case/implementation/SaveAdminResourceUseCaseImpl';
import { DeleteAdminResourceUseCaseImpl } from '@/feature/admin/domain/use-case/implementation/DeleteAdminResourceUseCaseImpl';
import { getAdminResourceDefinition } from '@/feature/admin/domain/entities/AdminResourceDefinitions';

describe('Observability Exporters Writable Support', () => {
  it('defines observability_exporters as writable with initialPayload', () => {
    const def = getAdminResourceDefinition('observability_exporters');
    expect(def.writable).toBe(true);
    expect(def.initialPayload).toHaveProperty('name');
    expect(def.initialPayload).toHaveProperty('kind');
  });

  it('saves an observability exporter via SaveAdminResourceUseCase', async () => {
    const mockRepo = {
      createObservabilityExporter: vi.fn().mockReturnValue(
        of(ResultFactory.Success({ id: 'obs-1', revision: 1, name: 'Prometheus', kind: 'prometheus', enabled: true, raw: {} }))
      ),
      updateObservabilityExporter: vi.fn().mockReturnValue(
        of(ResultFactory.Success({ id: 'obs-1', revision: 2, name: 'Prometheus Updated', kind: 'prometheus', enabled: true, raw: {} }))
      ),
    } as any;

    const useCase = new SaveAdminResourceUseCaseImpl(mockRepo);

    // Create
    const createRes = await new Promise<any>((resolve) => {
      useCase.execute('observability_exporters', { name: 'Prometheus', kind: 'prometheus' }).subscribe(resolve);
    });
    expect(createRes.type).toBe('Success');
    expect(mockRepo.createObservabilityExporter).toHaveBeenCalledWith({ name: 'Prometheus', kind: 'prometheus' });

    // Update
    const updateRes = await new Promise<any>((resolve) => {
      useCase.execute('observability_exporters', { name: 'Prometheus Updated' }, 'obs-1').subscribe(resolve);
    });
    expect(updateRes.type).toBe('Success');
    expect(mockRepo.updateObservabilityExporter).toHaveBeenCalledWith('obs-1', { name: 'Prometheus Updated' });
  });

  it('deletes an observability exporter via DeleteAdminResourceUseCase', async () => {
    const mockRepo = {
      deleteObservabilityExporter: vi.fn().mockReturnValue(of(ResultFactory.Success(undefined))),
    } as any;

    const useCase = new DeleteAdminResourceUseCaseImpl(mockRepo);
    const deleteRes = await new Promise<any>((resolve) => {
      useCase.execute('observability_exporters', 'obs-1').subscribe(resolve);
    });
    expect(deleteRes.type).toBe('Success');
    expect(mockRepo.deleteObservabilityExporter).toHaveBeenCalledWith('obs-1');
  });
});
