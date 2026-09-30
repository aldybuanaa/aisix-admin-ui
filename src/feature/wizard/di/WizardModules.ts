import type { Container } from 'inversify';
import { WizardModuleKeys } from './WizardModuleKeys';
import { ProviderWizardViewModel } from '../presentation/viewmodel/ProviderWizardViewModel';

export function registerWizardModules(container: Container): void {
  container
    .bind<ProviderWizardViewModel>(WizardModuleKeys.ProviderWizardViewModel)
    .to(ProviderWizardViewModel);
}
