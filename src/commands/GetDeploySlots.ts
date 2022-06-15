import * as core from '@actions/core';
import fs from 'fs';
import { ISwapAppService, IAppSetting } from '../interfaces/ISwapAppService';
import InputValidation from '../validation/InputValidation';
import AppSettingsMasking from '../core/AppSettingsMasking';
import SwapAppSettingsValidation from '../validation/SwapAppSettings';
import { webAppListAppSettings } from '../utils/azureUtility';
import SwapAppSettings from '../core/SwapAppSettings';

export class GetDeploySlots {
  constructor() {}

  public async execute(swapAppServiceList: ISwapAppService[]) {
    core.debug(`Using get-deploy-slots mode`);

    // const swapAppServiceList: ISwapAppService[] = JSON.parse(fs.readFileSync('./input.json', 'utf8'));
    new InputValidation(swapAppServiceList).validate();

    const appSettingSourceSlotWorkers: Promise<IAppSetting[]>[] = [];
    const appSettingTargetSlotWorkers: Promise<IAppSetting[]>[] = [];

    for (const config of swapAppServiceList) {
      console.log(config.name);
      appSettingSourceSlotWorkers.push(webAppListAppSettings(config.name, config.resourceGroup, config.slot));
      appSettingTargetSlotWorkers.push(webAppListAppSettings(config.name, config.resourceGroup, config.targetSlot));
    }
    const appSettingsSourceSlotList = await Promise.all(appSettingSourceSlotWorkers);
    const appSettingsTargetSlotList = await Promise.all(appSettingTargetSlotWorkers);

    for (let i = 0; i < swapAppServiceList.length; i++) {
      let swapAppService = swapAppServiceList[i];
      let appSettingsSourceSlot = appSettingsSourceSlotList[i];
      let appSettingsTargetSlot = appSettingsTargetSlotList[i];
      // Validate appSettings for Source Slot
      this.validateSwapAppServiceSlot(swapAppService, appSettingsSourceSlot, swapAppService.slot);
      // Validate appSettings for Target Slot
      this.validateSwapAppServiceSlot(swapAppService, appSettingsTargetSlot, swapAppService.targetSlot);

      const swapAppSettings = new SwapAppSettings(swapAppService);
      swapAppService = swapAppSettings.fullfill(appSettingsSourceSlot, swapAppService.slot);
      swapAppService = swapAppSettings.fullfill(appSettingsTargetSlot, swapAppService.targetSlot);

      // Make appSettings as sensitve if they are requested
      const appSettingMasking = new AppSettingsMasking(swapAppService);
      appSettingsSourceSlot = appSettingMasking.mask(appSettingsSourceSlot, swapAppService.slot);
      appSettingsTargetSlot = appSettingMasking.mask(appSettingsTargetSlot, swapAppService.targetSlot);
    }

    fs.writeFileSync('source.json', JSON.stringify(appSettingsSourceSlotList, null, 2), 'utf8');
    fs.writeFileSync('target.json', JSON.stringify(appSettingsTargetSlotList, null, 2), 'utf8');
  }

  private validateSwapAppServiceSlot(swapAppService: ISwapAppService, appSettings: IAppSetting[], slot: string) {
    core.debug(`Validating SwapAppService config with slot: ${slot}`);
    const result = new SwapAppSettingsValidation(swapAppService, appSettings).run();
    if (!result.success) throw new Error(`Invalid SwapAppService config with slot (${slot}): ${result.error}`);
  }
}
