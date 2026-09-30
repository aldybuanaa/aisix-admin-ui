import type { Container } from 'inversify';
import { RoutingModuleKeys } from './RoutingModuleKeys';
import { SmartRoutingViewModel } from '../presentation/viewmodel/SmartRoutingViewModel';

export function registerRoutingModules(container: Container): void {
  container
    .bind<SmartRoutingViewModel>(RoutingModuleKeys.SmartRoutingViewModel)
    .to(SmartRoutingViewModel);
}
