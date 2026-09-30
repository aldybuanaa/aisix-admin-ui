import type { Container } from 'inversify';
import { AdminModuleKeys } from './AdminModuleKeys';
import type { AdminRemoteDataSource } from '../data/remote/data-sources/AdminRemoteDataSource';
import { AdminRemoteDataSourceImpl } from '../data/remote/data-sources/implementation/AdminRemoteDataSourceImpl';
import type { AdminRepository } from '../domain/repository/AdminRepository';
import { AdminRepositoryImpl } from '../data/repository/AdminRepositoryImpl';
import type { ListAdminResourceUseCase } from '../domain/use-case/ListAdminResourceUseCase';
import { ListAdminResourceUseCaseImpl } from '../domain/use-case/implementation/ListAdminResourceUseCaseImpl';
import type { GetAdminResourceUseCase } from '../domain/use-case/GetAdminResourceUseCase';
import { GetAdminResourceUseCaseImpl } from '../domain/use-case/implementation/GetAdminResourceUseCaseImpl';
import type { SaveAdminResourceUseCase } from '../domain/use-case/SaveAdminResourceUseCase';
import { SaveAdminResourceUseCaseImpl } from '../domain/use-case/implementation/SaveAdminResourceUseCaseImpl';
import type { DeleteAdminResourceUseCase } from '../domain/use-case/DeleteAdminResourceUseCase';
import { DeleteAdminResourceUseCaseImpl } from '../domain/use-case/implementation/DeleteAdminResourceUseCaseImpl';
import type { DiscoverModelsUseCase } from '../domain/use-case/DiscoverModelsUseCase';
import { DiscoverModelsUseCaseImpl } from '../domain/use-case/implementation/DiscoverModelsUseCaseImpl';
import { AdminResourceListViewModel } from '../viewmodel/AdminResourceListViewModel';
import { AdminResourceDetailViewModel } from '../viewmodel/AdminResourceDetailViewModel';
import { ModelDiscoveryViewModel } from '../viewmodel/ModelDiscoveryViewModel';

export function registerAdminModules(container: Container): void {
  // Data — singleton
  container
    .bind<AdminRemoteDataSource>(AdminModuleKeys.AdminRemoteDataSource)
    .to(AdminRemoteDataSourceImpl)
    .inSingletonScope();
  container
    .bind<AdminRepository>(AdminModuleKeys.AdminRepository)
    .to(AdminRepositoryImpl)
    .inSingletonScope();

  // Use Cases — transient (no scope)
  container
    .bind<ListAdminResourceUseCase>(AdminModuleKeys.ListAdminResourceUseCase)
    .to(ListAdminResourceUseCaseImpl);
  container
    .bind<GetAdminResourceUseCase>(AdminModuleKeys.GetAdminResourceUseCase)
    .to(GetAdminResourceUseCaseImpl);
  container
    .bind<SaveAdminResourceUseCase>(AdminModuleKeys.SaveAdminResourceUseCase)
    .to(SaveAdminResourceUseCaseImpl);
  container
    .bind<DeleteAdminResourceUseCase>(AdminModuleKeys.DeleteAdminResourceUseCase)
    .to(DeleteAdminResourceUseCaseImpl);
  container
    .bind<DiscoverModelsUseCase>(AdminModuleKeys.DiscoverModelsUseCase)
    .to(DiscoverModelsUseCaseImpl);

  // ViewModels — transient (each page gets a fresh instance)
  container
    .bind<AdminResourceListViewModel>(AdminModuleKeys.AdminResourceListViewModel)
    .to(AdminResourceListViewModel);
  container
    .bind<AdminResourceDetailViewModel>(AdminModuleKeys.AdminResourceDetailViewModel)
    .to(AdminResourceDetailViewModel);
  container
    .bind<ModelDiscoveryViewModel>(AdminModuleKeys.ModelDiscoveryViewModel)
    .to(ModelDiscoveryViewModel);
}
