export const AdminModuleKeys = {
  AdminRemoteDataSource: Symbol.for('AdminRemoteDataSource'),
  AdminRepository: Symbol.for('AdminRepository'),
  ListAdminResourceUseCase: Symbol.for('ListAdminResourceUseCase'),
  GetAdminResourceUseCase: Symbol.for('GetAdminResourceUseCase'),
  SaveAdminResourceUseCase: Symbol.for('SaveAdminResourceUseCase'),
  DeleteAdminResourceUseCase: Symbol.for('DeleteAdminResourceUseCase'),
  DiscoverModelsUseCase: Symbol.for('DiscoverModelsUseCase'),
  AdminResourceListViewModel: Symbol.for('AdminResourceListViewModel'),
  AdminResourceDetailViewModel: Symbol.for('AdminResourceDetailViewModel'),
  ModelDiscoveryViewModel: Symbol.for('ModelDiscoveryViewModel'),
} as const;
