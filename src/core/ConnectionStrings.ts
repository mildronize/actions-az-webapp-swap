import * as core from '@actions/core';
import { IAppSetting, ISwapAppService, SlotType } from '../interfaces';
import { webAppListConnectionString } from '../utils/azureUtility';
import AppSettingsBase, { AppSettingsType, IAppSettingOption } from './AppSettingsBase';

export default class ConnectionStrings extends AppSettingsBase {
  protected source: IAppSetting[] = [];
  protected target: IAppSetting[] = [];

  constructor(swapAppService: ISwapAppService, options?: Partial<IAppSettingOption>) {
    super(swapAppService, AppSettingsType.ConnectionStrings, options);
  }

  /**
   * call `list()` function after create a object
   * @returns AppSettings
   */

  public async list() {
    core.info('Listing App Setting from Azure Web App (Azure App Service) ...');
    const { name, resourceGroup, slot, targetSlot } = this.swapAppService;
    [this.source, this.target] = await Promise.all([
      webAppListConnectionString(name, resourceGroup, slot),
      webAppListConnectionString(name, resourceGroup, targetSlot),
    ]);
    return this;
  }

  public getSource() {
    return this.source;
  }

  public getTarget() {
    return this.target;
  }
}
