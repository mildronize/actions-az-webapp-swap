import * as core from '@actions/core';
import fs from 'fs';
import SwapAppSettings from '../core/SwapAppSettings';
import { IAppSetting, ISwapAppService } from '../interfaces/ISwapAppService';
import { webAppListAppSettings, webAppSetAppSettings } from '../utils/azureUtility';
import InputValidation from '../validation/InputValidation';
import { constants } from '../constants';
import path from 'path';
const { DefaultEncoding, WorkingDirectory } = constants;

interface IPostAction {
  /**
   * Apply slot setting into app setting for set the value to Azure App Service
   */
  applyAppSetting?: true;
}

async function getAppSettings(swapAppService: ISwapAppService, postAction?: IPostAction) {
  InputValidation.validate(swapAppService);

  let [appSettingsSourceSlot, appSettingsTargetSlot] = await Promise.all([
    webAppListAppSettings(swapAppService.name, swapAppService.resourceGroup, swapAppService.slot),
    webAppListAppSettings(swapAppService.name, swapAppService.resourceGroup, swapAppService.targetSlot),
  ]);

  const swapAppSettings = new SwapAppSettings(swapAppService);
  swapAppService = swapAppSettings.fullfill(appSettingsSourceSlot, swapAppService.slot);
  swapAppService = swapAppSettings.fullfill(appSettingsTargetSlot, swapAppService.targetSlot);

  if (postAction?.applyAppSetting === true) {
    // Apply new value slot settings
    appSettingsSourceSlot = swapAppSettings.applyAppSetting(appSettingsSourceSlot);
    appSettingsTargetSlot = swapAppSettings.applyAppSetting(appSettingsTargetSlot);
  }

  return {
    source: appSettingsSourceSlot,
    target: appSettingsTargetSlot,
  };
}

export class SetDeploySlots {
  constructor(private swapAppService: ISwapAppService) {}

  public async execute() {
    core.debug(`Using set-deploy-slots mode`);

    const appSetting = await getAppSettings(this.swapAppService, { applyAppSetting: true });
    await Promise.all([
      this.setAppSettings(appSetting.source, this.swapAppService.slot),
      this.setAppSettings(appSetting.source, this.swapAppService.targetSlot),
    ]);
  }

  private async setAppSettings(appSettings: IAppSetting[], slot: string) {
    const { name, resourceGroup } = this.swapAppService;
    const appSettingPath = path.resolve(WorkingDirectory, `${name}-${slot}`);
    fs.writeFileSync(appSettingPath, JSON.stringify(appSettings), DefaultEncoding);

    await webAppSetAppSettings(name, resourceGroup, slot, appSettingPath);
    fs.rmSync(appSettingPath, {
      force: true,
    });
  }
}
