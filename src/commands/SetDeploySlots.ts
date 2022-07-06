import * as core from '@actions/core';
import { ISwapAppService } from '../interfaces';
import AppSettings from '../core/AppSettings';
import { AppSettingsType } from '../core/AppSettingsBase';
import { AppSettingsProviderFactory } from '../core/AppSettingsProviderFactory';

export class SetDeploySlots {
  constructor(private swapAppService: ISwapAppService) {}

  public async execute() {
    core.debug(`Using set-deploy-slots mode`);
    core.info('Getting App Setting from Azure ');
    await Promise.all([
      this.setAppSettings(AppSettingsType.AppSettings),
      this.setAppSettings(AppSettingsType.ConnectionStrings),
    ]);
  }

  private async setAppSettings(type: AppSettingsType) {
    const appSetting = AppSettingsProviderFactory.getAppSettingsProvider(type, this.swapAppService);
    (await appSetting.list()).fullfill().apply();
    core.info('Setting App Setting to Azure');
    await Promise.all([appSetting.setWebAppSourceSlot(), appSetting.setWebAppTargetSlot()]);
  }
}
