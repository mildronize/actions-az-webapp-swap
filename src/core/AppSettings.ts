import * as core from '@actions/core';
import { IAppSetting, ISwapAppService, SlotType } from '../interfaces';
import InputValidation from '../validation/InputValidation';
import SwapAppSettings from './SwapAppSettings';
import path from 'path';
import fs from 'fs';
import { webAppListAppSettings, webAppSetAppSettings } from '../utils/azureUtility';
import SwapAppSettingsValidation from '../validation/SwapAppSettings';
import AppSettingsMasking from './AppSettingsMasking';
import AppSettingsBase, { AppSettingsType, IAppSettingOption } from './AppSettingsBase';

export default class AppSettings extends AppSettingsBase {
  constructor(swapAppService: ISwapAppService, options?: Partial<IAppSettingOption>) {
    super(swapAppService, AppSettingsType.AppSettings, options);
  }

  /**
   * call `list()` function after create a object
   * @returns AppSettings
   */

  public async list() {
    core.info('Listing App Setting from Azure Web App (Azure App Service) ...');
    const { name, resourceGroup, slot, targetSlot } = this.swapAppService;
    [this.source, this.target] = await Promise.all([
      webAppListAppSettings(name, resourceGroup, slot),
      webAppListAppSettings(name, resourceGroup, targetSlot),
    ]);
    return this;
  }

  public async set(slotType: SlotType) {
    const { appSettings, slot } = this.getSlotConfig(slotType);
    const { workingDirectory, defaultEncoding } = this.options;
    const { name, resourceGroup } = this.swapAppService;
    const appSettingPath = path.resolve(workingDirectory, `${name}-${slot}`);
    if (!fs.existsSync(workingDirectory)) fs.mkdirSync(workingDirectory, { recursive: true });
    fs.writeFileSync(appSettingPath, JSON.stringify(appSettings), defaultEncoding);
    core.info('Start set app Setting');
    await webAppSetAppSettings(name, resourceGroup, slot, appSettingPath);
    core.info('Removing file');
    fs.rmSync(appSettingPath, { force: true });
  }
}
