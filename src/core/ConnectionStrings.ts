import * as core from '@actions/core';
import { IAppSetting, ISwapAppService, SlotType } from '../interfaces';
import { webAppListConnectionStrings, webAppSetConnectionStrings } from '../utils/azureUtility';
import AppSettingsBase, { AppSettingsType, IAppSettingOption } from './AppSettingsBase';

export default class ConnectionStrings extends AppSettingsBase {
  protected source: IAppSetting[] = [];
  protected target: IAppSetting[] = [];

  constructor(swapAppService: ISwapAppService, options?: Partial<IAppSettingOption>) {
    super(swapAppService, AppSettingsType.ConnectionStrings, options);
  }

  /** @override */
  public async list() {
    core.info('Listing App Setting from Azure Web App (Azure App Service) ...');
    const { name, resourceGroup, slot, targetSlot } = this.swapAppService;
    [this.source, this.target] = await Promise.all([
      webAppListConnectionStrings(name, resourceGroup, slot),
      webAppListConnectionStrings(name, resourceGroup, targetSlot),
    ]);
    return this;
  }

  /** @override */
  public async setWebApp(appSettings: IAppSetting[], slot: string) {
    const { name, resourceGroup } = this.swapAppService;
    core.info('Start set ConnectionString');
    await webAppSetConnectionStrings(name, resourceGroup, slot, appSettings);
  }
}
