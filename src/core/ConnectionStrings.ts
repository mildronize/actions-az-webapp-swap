import * as core from '@actions/core';
import { IAppSetting, ISwapAppService, SlotType } from '../interfaces';
import InputValidation from '../validation/InputValidation';
import SwapAppSettings from './SwapAppSettings';
import path from 'path';
import fs from 'fs';
import { webAppListAppSettings, webAppListConnectionString, webAppSetAppSettings } from '../utils/azureUtility';
import SwapAppSettingsValidation from '../validation/SwapAppSettings';
import AppSettingsMasking from './AppSettingsMasking';
import AppSettingsBase, { IAppSettingOption } from './AppSettingsBase';

export default class ConnectionStrings extends AppSettingsBase {
  protected source: IAppSetting[] = [];
  protected target: IAppSetting[] = [];

  constructor(swapAppService: ISwapAppService, options?: Partial<IAppSettingOption>) {
    super(swapAppService, options);
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
